"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RouteOptimizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteOptimizationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let RouteOptimizationService = RouteOptimizationService_1 = class RouteOptimizationService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(RouteOptimizationService_1.name);
    }
    getDistance(p1, p2) {
        const R = 6371;
        const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
        const dLon = (p2.lng - p1.lng) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * (Math.PI / 180)) *
                Math.cos(p2.lat * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    async getTravelTimeMatrix(points, apiKey) {
        if (points.length < 2)
            return null;
        const url = 'https://api.openrouteservice.org/v2/matrix/driving-car';
        const coordinates = points.map(p => [p.lng, p.lat]);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, { locations: coordinates, metrics: ['duration'] }, { headers: { Authorization: apiKey } }));
            return response.data.durations;
        }
        catch (error) {
            this.logger.error('Error al obtener matriz de tiempos de OpenRouteService', error.response?.data);
            return null;
        }
    }
    async optimizeRoutes(orders, drivers, constraints, restaurantLocation, directionsApiKey) {
        if (directionsApiKey) {
            this.logger.log('Optimizando rutas con tiempo de viaje real (API de Direcciones).');
            return this.optimizeRoutesByTravelTime(orders, drivers, constraints, restaurantLocation, directionsApiKey);
        }
        else {
            this.logger.warn('Optimizando rutas con distancia en línea recta (API de Direcciones no configurada).');
            return this.optimizeRoutesByDistance(orders, drivers, constraints, restaurantLocation);
        }
    }
    async optimizeRoutesByTravelTime(orders, drivers, constraints, restaurantLocation, apiKey) {
        const priorityOrders = orders.filter(o => o.latitude && o.longitude && o.isPriority);
        const regularOrders = orders.filter(o => o.latitude && o.longitude && !o.isPriority);
        const routes = drivers.map(driver => ({
            driver,
            orders: [],
            totalDuration: 0,
            currentWeight: 0,
            currentVolume: 0,
        }));
        for (const route of routes) {
            let lastLocationPoint = restaurantLocation;
            while (route.orders.length < constraints.maxOrdersPerDriver && (priorityOrders.length > 0 || regularOrders.length > 0)) {
                const ordersToSearch = priorityOrders.length > 0 ? priorityOrders : regularOrders;
                const pointsForMatrix = [lastLocationPoint, ...ordersToSearch.map(o => ({ lat: o.latitude, lng: o.longitude }))];
                const timeMatrix = await this.getTravelTimeMatrix(pointsForMatrix, apiKey);
                if (!timeMatrix)
                    break;
                const durationsFromLast = timeMatrix[0];
                let bestDuration = Infinity;
                let bestOrderIndex = -1;
                for (let i = 0; i < ordersToSearch.length; i++) {
                    const duration = durationsFromLast[i + 1];
                    if (duration < bestDuration) {
                        bestDuration = duration;
                        bestOrderIndex = i;
                    }
                }
                if (bestOrderIndex !== -1) {
                    const closestOrder = ordersToSearch[bestOrderIndex];
                    if (this.checkCapacity(route, closestOrder)) {
                        route.orders.push(closestOrder);
                        route.totalDuration += bestDuration;
                        route.currentWeight += Number(closestOrder.totalWeightKg) || 0;
                        route.currentVolume += Number(closestOrder.totalVolumeM3) || 0;
                        lastLocationPoint = { lat: closestOrder.latitude, lng: closestOrder.longitude };
                        if (closestOrder.isPriority) {
                            priorityOrders.splice(priorityOrders.findIndex(o => o.id === closestOrder.id), 1);
                        }
                        else {
                            regularOrders.splice(regularOrders.findIndex(o => o.id === closestOrder.id), 1);
                        }
                    }
                    else {
                        ordersToSearch.splice(bestOrderIndex, 1);
                        continue;
                    }
                }
                else {
                    break;
                }
            }
        }
        return this.formatRoutes(routes, true);
    }
    optimizeRoutesByDistance(orders, drivers, constraints, restaurantLocation) {
        const priorityOrders = orders.filter(o => o.latitude && o.longitude && o.isPriority);
        const regularOrders = orders.filter(o => o.latitude && o.longitude && !o.isPriority);
        const routes = drivers.map(driver => ({
            driver, orders: [], totalDistance: 0, currentWeight: 0, currentVolume: 0,
        }));
        for (const route of routes) {
            let lastLocation = restaurantLocation;
            while (route.orders.length < constraints.maxOrdersPerDriver && (priorityOrders.length > 0 || regularOrders.length > 0)) {
                const ordersToSearch = priorityOrders.length > 0 ? priorityOrders : regularOrders;
                let closestOrderIndex = -1;
                let bestDistance = Infinity;
                ordersToSearch.forEach((order, index) => {
                    const distance = this.getDistance(lastLocation, { lat: order.latitude, lng: order.longitude });
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        closestOrderIndex = index;
                    }
                });
                if (closestOrderIndex !== -1) {
                    const closestOrder = ordersToSearch[closestOrderIndex];
                    if (this.checkCapacity(route, closestOrder)) {
                        route.orders.push(closestOrder);
                        route.totalDistance += bestDistance;
                        route.currentWeight += Number(closestOrder.totalWeightKg) || 0;
                        route.currentVolume += Number(closestOrder.totalVolumeM3) || 0;
                        lastLocation = { lat: closestOrder.latitude, lng: closestOrder.longitude };
                        if (closestOrder.isPriority) {
                            priorityOrders.splice(priorityOrders.findIndex(o => o.id === closestOrder.id), 1);
                        }
                        else {
                            regularOrders.splice(regularOrders.findIndex(o => o.id === closestOrder.id), 1);
                        }
                    }
                    else {
                        ordersToSearch.splice(closestOrderIndex, 1);
                        continue;
                    }
                }
                else {
                    break;
                }
            }
        }
        return this.formatRoutes(routes, false);
    }
    checkCapacity(route, order) {
        const orderWeight = Number(order.totalWeightKg) || 0;
        const orderVolume = Number(order.totalVolumeM3) || 0;
        const driverMaxWeight = Number(route.driver.maxWeightCapacityKg) || Infinity;
        const driverMaxVolume = Number(route.driver.maxVolumeCapacityM3) || Infinity;
        return route.currentWeight + orderWeight <= driverMaxWeight && route.currentVolume + orderVolume <= driverMaxVolume;
    }
    formatRoutes(routes, isTimeBased) {
        return routes
            .filter(r => r.orders.length > 0)
            .map(r => ({
            driverId: r.driver.id,
            driverName: r.driver.fullName,
            orders: r.orders.map((o) => ({
                id: o.id,
                shortId: o.shortId,
                deliveryAddress: o.deliveryAddress,
                isPriority: o.isPriority,
                weight: Number(o.totalWeightKg),
                volume: Number(o.totalVolumeM3),
                latitude: o.latitude,
                longitude: o.longitude,
            })),
            orderCount: r.orders.length,
            estimatedDistanceKm: !isTimeBased ? r.totalDistance.toFixed(2) : undefined,
            estimatedDurationMinutes: isTimeBased ? Math.round(r.totalDuration / 60) : Math.round(r.totalDistance * 5),
            currentWeightKg: r.currentWeight.toFixed(3),
            maxWeightKg: r.driver.maxWeightCapacityKg,
            currentVolumeM3: r.currentVolume.toFixed(6),
            maxVolumeM3: r.driver.maxVolumeCapacityM3,
        }));
    }
};
exports.RouteOptimizationService = RouteOptimizationService;
exports.RouteOptimizationService = RouteOptimizationService = RouteOptimizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], RouteOptimizationService);
//# sourceMappingURL=route-optimization.service.js.map