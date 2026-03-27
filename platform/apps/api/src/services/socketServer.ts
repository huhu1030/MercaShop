import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { socketAuth } from '../middleware/socketAuth';
import { EstablishmentModel } from '../models/Establishment';
import { UserRole } from '@mercashop/shared';
import type { Order } from '../types/order';
import * as userService from './userService';

class SocketServer {
  private static instance: SocketServer;
  private io!: Server;

  private constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: { origin: env.corsOrigins, methods: ['POST', 'GET'], credentials: true },
    });
    this.io.use(socketAuth);
    this.initListeners();
  }

  static getInstance(server?: HttpServer): SocketServer {
    if (!SocketServer.instance) {
      if (!server) throw new Error('Server required for first initialization');
      SocketServer.instance = new SocketServer(server);
    }
    return SocketServer.instance;
  }

  private initListeners(): void {
    this.io.on('connection', (socket: Socket) => {
      const { tenantId, uid } = socket.data as { tenantId: string; uid: string };
      console.log(`Connected: ${socket.id} (uid: ${uid}, tenant: ${tenantId})`);

      // Auto-join user room for storefront order updates
      socket.join(`tenant:${tenantId}:user:${uid}`);

      // Dashboard joins establishment room — verify establishment exists in tenant and user is not a regular customer
      socket.on('join-establishment', async (establishmentId: string) => {
        const [establishment, user] = await Promise.all([
          EstablishmentModel.findOne({ _id: establishmentId, tenantId }),
          userService.findUserByFirebaseUid(tenantId, uid),
        ]);

        if (!establishment || !user) return;

        if (user.role === UserRole.USER) {
          console.warn(`Socket ${socket.id}: unauthorized join-establishment attempt for ${establishmentId}`);
          return;
        }

        socket.join(`tenant:${tenantId}:establishment:${establishmentId}`);
      });

      socket.on('disconnect', () => console.log(`Disconnected: ${socket.id}`));
    });
  }

  sendNewOrder(tenantId: string, establishmentId: string, data: Order): void {
    this.io.to(`tenant:${tenantId}:establishment:${establishmentId}`).emit('newOrders', data);
  }

  sendOrderUpdate(tenantId: string, userId: string, data: Order): void {
    this.io.to(`tenant:${tenantId}:user:${userId}`).emit('order-updated', data);
  }
}

export default SocketServer;
