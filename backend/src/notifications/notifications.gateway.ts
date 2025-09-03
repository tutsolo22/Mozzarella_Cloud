import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RoleEnum } from '../roles/enums/role.enum';
import { Order } from '../orders/entities/order.entity';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción, deberías restringir esto a tu dominio del frontend
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Mantenemos un registro de los repartidores activos y su última ubicación conocida
  private activeDrivers = new Map<string, { name: string; tenantId: string; location?: { lat: number; lng: number } }>();

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) throw new Error('Token de autenticación no encontrado');

      const payload = await this.jwtService.verifyAsync(token);
      if (!payload || !payload.sub) throw new Error('Payload de token inválido');

      // Guardamos datos útiles en el objeto del socket para usarlos más tarde
      client.data.userId = payload.userId;
      client.data.tenantId = payload.tenantId;
      client.data.role = payload.role;
      client.data.fullName = payload.fullName;

      client.join(`user-${payload.sub}`);
      this.logger.log(`Cliente conectado y unido a la sala: user-${payload.sub}`);

      // Unir a salas específicas del tenant según el rol del usuario
      const userRole = payload.role as RoleEnum;
      const tenantId = payload.tenantId;

      if ([RoleEnum.Admin, RoleEnum.Manager].includes(userRole)) {
        client.join(`tenant-${payload.tenantId}-management`);
        this.logger.log(`Usuario ${payload.sub} unido a la sala de management del tenant ${payload.tenantId}`);
      }

      if (userRole === RoleEnum.SuperAdmin) {
        client.join('super-admin-room');
        this.logger.log(`SuperAdmin ${payload.sub} unido a la sala de super-admin.`);
      }

      if ([RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen].includes(userRole)) {
        client.join(`tenant-${payload.tenantId}-kitchen`);
        this.logger.log(`Usuario ${payload.sub} unido a la sala de cocina del tenant ${payload.tenantId}`);
      }

      if (userRole === RoleEnum.Delivery) {
        this.activeDrivers.set(payload.userId, { name: payload.fullName, tenantId });
        this.sendActiveDriversList(tenantId);
      }
    } catch (error) {
      this.logger.error(`Fallo de autenticación de WebSocket: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const { userId, role, tenantId } = client.data;
    if (role === RoleEnum.Delivery && userId && tenantId) {
      this.activeDrivers.delete(userId);
      this.sendActiveDriversList(tenantId);
      this.logger.log(`Repartidor ${userId} desconectado.`);
    }
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('update_driver_location')
  handleDriverLocation(
    @MessageBody() data: { lat: number; lng: number },
    @ConnectedSocket() client: Socket,
  ): void {
    const { userId, tenantId, fullName } = client.data;
    if (!userId || !tenantId) return;

    const driverData = this.activeDrivers.get(userId);
    if (driverData) driverData.location = data;

    // Retransmitimos la ubicación a la sala de management
    this.server.to(`tenant-${tenantId}-management`).emit('driver_location_update', {
      driverId: userId, name: fullName, location: data,
    });
  }

  sendNewDeliveryToDriver(driverId: string, order: Order) {
    this.logger.log(`Enviando nuevo pedido #${order.shortId} al repartidor ${driverId}`);
    this.server.to(`user-${driverId}`).emit('new_delivery_for_driver', order);
  }

  sendLocationUpdateToDriver(driverId: string, order: Order) {
    this.logger.log(`Enviando actualización de ubicación para pedido #${order.shortId} al repartidor ${driverId}`);
    this.server.to(`user-${driverId}`).emit('delivery_location_updated', order);
  }

  sendNewOrderToKitchen(tenantId: string, order: Order) {
    this.logger.log(`Enviando nuevo pedido #${order.shortId} a la cocina del tenant ${tenantId}`);
    this.server.to(`tenant-${tenantId}-kitchen`).emit('new_order_for_kitchen', order);
  }

  sendOrderReadyNotification(tenantId: string, order: Order) {
    this.logger.log(`Notificando que el pedido #${order.shortId} está listo al management del tenant ${tenantId}`);
    this.server.to(`tenant-${tenantId}-management`).emit('order_ready_for_dispatch', order);
  }

  sendOrderAssigned(tenantId: string, order: Order) {
    this.logger.log(`Notificando que el pedido #${order.shortId} ha sido asignado al management del tenant ${tenantId}`);
    this.server.to(`tenant-${tenantId}-management`).emit('order_assigned', order);
  }

  sendOrderPriorityUpdate(tenantId: string, order: Order) {
    this.logger.log(`Enviando actualización de prioridad para pedido #${order.shortId} al tenant ${tenantId}`);
    // Enviar a ambas salas, cocina y management
    this.server.to(`tenant-${tenantId}-kitchen`).emit('order_priority_updated', order);
    this.server.to(`tenant-${tenantId}-management`).emit('order_priority_updated', order);
  }

  sendOrderStatusUpdate(tenantId: string, payload: { order: Order, previousStatus: OrderStatus, newStatus: OrderStatus }) {
    this.logger.log(`Enviando actualización de estado para pedido #${payload.order.shortId} de ${payload.previousStatus} a ${payload.newStatus}`);
    // Enviar a la sala de management del tenant específico
    this.server.to(`tenant-${tenantId}-management`).emit('order_status_updated', payload);
    // Enviar a la sala global de super-admin
    this.server.to('super-admin-room').emit('order_status_updated', payload);
  }

  private sendActiveDriversList(tenantId: string) {
    const tenantDrivers = [];
    for (const [id, data] of this.activeDrivers.entries()) {
      if (data.tenantId === tenantId) {
        tenantDrivers.push([id, { name: data.name, location: data.location }]);
      }
    }
    this.server.to(`tenant-${tenantId}-management`).emit('active_drivers_update', tenantDrivers);
  }
}