import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';

class SocketServer {
  private static instance: SocketServer;
  private io!: Server;

  private constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: { origin: env.corsOrigins, methods: ['POST', 'GET'], credentials: true },
    });
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
      console.log(`Connected: ${socket.id}`);
      socket.on('disconnect', () => console.log(`Disconnected: ${socket.id}`));
    });
  }

  sendOrders(data: unknown): void {
    this.io.emit('newOrders', data);
  }
}

export default SocketServer;
