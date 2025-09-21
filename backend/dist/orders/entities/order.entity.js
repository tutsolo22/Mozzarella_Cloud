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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = exports.DeliveryProviderType = void 0;
const typeorm_1 = require("typeorm");
const order_item_entity_1 = require("./order-item.entity");
const order_status_enum_1 = require("../enums/order-status.enum");
const order_types_enum_1 = require("../enums/order-types.enum");
const order_channel_enum_1 = require("../enums/order-channel.enum");
const user_entity_1 = require("../../users/entities/user.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const location_entity_1 = require("../../locations/entities/location.entity");
const tenant_entity_1 = require("../../tenants/entities/tenant.entity");
const nanoid_1 = require("nanoid");
var DeliveryProviderType;
(function (DeliveryProviderType) {
    DeliveryProviderType["InHouse"] = "in_house";
    DeliveryProviderType["External"] = "external";
})(DeliveryProviderType || (exports.DeliveryProviderType = DeliveryProviderType = {}));
let Order = class Order {
    generateShortId() {
        const nanoid = (0, nanoid_1.customAlphabet)('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
        this.shortId = nanoid().replace(/(\w{4})/, '$1-');
    }
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 9, unique: true }),
    __metadata("design:type", String)
], Order.prototype, "shortId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'ID del tenant al que pertenece el pedido' }),
    __metadata("design:type", String)
], Order.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Order.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: 'ID de la sucursal que procesa el pedido' }),
    __metadata("design:type", String)
], Order.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => location_entity_1.Location, location => location.orders),
    (0, typeorm_1.JoinColumn)({ name: 'locationId' }),
    __metadata("design:type", location_entity_1.Location)
], Order.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customerId' }),
    __metadata("design:type", customer_entity_1.Customer)
], Order.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'assignedDriverId' }),
    __metadata("design:type", user_entity_1.User)
], Order.prototype, "assignedDriver", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: order_channel_enum_1.OrderChannel,
        default: order_channel_enum_1.OrderChannel.IN_STORE,
    }),
    __metadata("design:type", String)
], Order.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "assignedDriverId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: order_status_enum_1.OrderStatus,
        default: order_status_enum_1.OrderStatus.PendingConfirmation,
    }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: order_types_enum_1.OrderType,
        default: order_types_enum_1.OrderType.Delivery,
    }),
    __metadata("design:type", String)
], Order.prototype, "orderType", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 3,
        default: 0,
        comment: 'Peso total del pedido en kg',
    }),
    __metadata("design:type", Number)
], Order.prototype, "totalWeightKg", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 6,
        default: 0,
        comment: 'Volumen total del pedido en m³',
    }),
    __metadata("design:type", Number)
], Order.prototype, "totalVolumeM3", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_item_entity_1.OrderItem, (item) => item.order, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "deliveryAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'double precision', nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'double precision', nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: order_types_enum_1.PaymentMethod,
        default: order_types_enum_1.PaymentMethod.Cash,
    }),
    __metadata("design:type", String)
], Order.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: order_types_enum_1.PaymentStatus,
        default: order_types_enum_1.PaymentStatus.Pending,
    }),
    __metadata("design:type", String)
], Order.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, comment: 'ID de la transacción en la pasarela de pago' }),
    __metadata("design:type", String)
], Order.prototype, "paymentGatewayId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true, comment: 'URL del link de pago generado' }),
    __metadata("design:type", String)
], Order.prototype, "paymentLink", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'integer',
        nullable: true,
        comment: 'Tiempo de preparación en minutos',
    }),
    __metadata("design:type", Number)
], Order.prototype, "preparationTimeMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Hora de entrega estimada para el cliente',
    }),
    __metadata("design:type", Date)
], Order.prototype, "estimatedDeliveryAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Hora en que se asignó el repartidor',
    }),
    __metadata("design:type", Date)
], Order.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Hora en que el pedido fue realmente entregado',
    }),
    __metadata("design:type", Date)
], Order.prototype, "deliveredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "deliverySequence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        default: false,
        comment: 'Indica si se ha enviado la notificación de proximidad del repartidor al KDS',
    }),
    __metadata("design:type", Boolean)
], Order.prototype, "pickupNotificationSent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Hora estimada en que el repartidor llegará a recoger el pedido',
    }),
    __metadata("design:type", Date)
], Order.prototype, "estimatedPickupArrivalAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        default: false,
        comment: 'Indica si el pedido tiene prioridad de entrega',
    }),
    __metadata("design:type", Boolean)
], Order.prototype, "isPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DeliveryProviderType,
        default: DeliveryProviderType.InHouse,
        comment: 'Indica si la entrega es con repartidor propio o externo',
    }),
    __metadata("design:type", String)
], Order.prototype, "deliveryProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, comment: 'Nombre del proveedor externo (ej. Uber Eats)' }),
    __metadata("design:type", String)
], Order.prototype, "externalDeliveryProvider", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        default: 0,
        comment: 'Costo del envío, si aplica',
    }),
    __metadata("design:type", Number)
], Order.prototype, "deliveryFee", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Order.prototype, "generateShortId", null);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, comment: 'Indica si la orden ya fue facturada.' }),
    __metadata("design:type", Boolean)
], Order.prototype, "isBilled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true, comment: 'URL de la factura generada.' }),
    __metadata("design:type", String)
], Order.prototype, "invoiceUrl", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)('orders')
], Order);
//# sourceMappingURL=order.entity.js.map