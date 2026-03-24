import { Server } from 'socket.io';
import SocketServer from '../../src/services/socketServer';

jest.mock('socket.io');

describe('SocketServer', () => {
  let mockIo: { on: jest.Mock; emit: jest.Mock; to: jest.Mock };
  let mockSocket: { on: jest.Mock; join: jest.Mock; id: string };
  let socketServer: SocketServer;

  beforeEach(() => {
    // Reset singleton
    (SocketServer as any).instance = undefined;

    mockSocket = { on: jest.fn(), join: jest.fn(), id: 'socket-1' };
    mockIo = {
      on: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };

    (Server as unknown as jest.Mock).mockImplementation(() => mockIo);

    // Capture the connection handler and trigger it with mockSocket
    mockIo.on.mockImplementation((event: string, cb: (...args: unknown[]) => void) => {
      if (event === 'connection') cb(mockSocket);
      return mockIo;
    });

    const mockHttpServer = {} as any;
    socketServer = SocketServer.getInstance(mockHttpServer);
  });

  it('joins order room when client emits join-order', () => {
    // Find the join-order handler registered on the socket
    const joinOrderCall = mockSocket.on.mock.calls.find(([event]: [string]) => event === 'join-order');
    expect(joinOrderCall).toBeDefined();

    // Invoke the handler
    const handler = joinOrderCall![1];
    handler('order-123');

    expect(mockSocket.join).toHaveBeenCalledWith('order:order-123');
  });

  it('emits order-updated to specific order room', () => {
    const orderData = { _id: 'order-123', status: 'DELIVERED' };
    socketServer.sendOrderUpdate('order-123', orderData);

    expect(mockIo.to).toHaveBeenCalledWith('order:order-123');
    expect(mockIo.emit).toHaveBeenCalledWith('order-updated', orderData);
  });

  it('still emits newOrders globally for dashboard backward compat', () => {
    const data = { _id: 'order-1', status: 'PENDING' };
    socketServer.sendOrders(data);

    expect(mockIo.emit).toHaveBeenCalledWith('newOrders', data);
  });
});
