import { Server } from 'socket.io';
import SocketServer from '../../src/services/socketServer';
import { EstablishmentModel } from '../../src/models/Establishment';
import * as userService from '../../src/services/userService';
import { UserRole } from '@mercashop/shared';

jest.mock('socket.io');
jest.mock('../../src/models/Establishment');
jest.mock('../../src/services/userService');

describe('SocketServer', () => {
  let mockIo: { on: jest.Mock; emit: jest.Mock; to: jest.Mock; use: jest.Mock };
  let mockSocket: { on: jest.Mock; join: jest.Mock; id: string; data: { tenantId: string; uid: string } };
  let socketServer: SocketServer;

  beforeEach(() => {
    jest.clearAllMocks();
    (SocketServer as any).instance = undefined;

    mockSocket = {
      on: jest.fn(),
      join: jest.fn(),
      id: 'socket-1',
      data: { tenantId: 'tenant-1', uid: 'user-1' },
    };
    mockIo = {
      on: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
      use: jest.fn(),
    };

    (Server as unknown as jest.Mock).mockImplementation(() => mockIo);

    mockIo.on.mockImplementation((event: string, cb: (...args: unknown[]) => void) => {
      if (event === 'connection') cb(mockSocket);
      return mockIo;
    });

    const mockHttpServer = {} as any;
    socketServer = SocketServer.getInstance(mockHttpServer);
  });

  it('auto-joins user room on connection', () => {
    expect(mockSocket.join).toHaveBeenCalledWith('tenant:tenant-1:user:user-1');
  });

  describe('join-establishment authorization', () => {
    function getJoinEstablishmentHandler(): (id: string) => Promise<void> {
      const call = mockSocket.on.mock.calls.find(([event]: [string]) => event === 'join-establishment');
      return call![1];
    }

    it('allows owner to join establishment room', async () => {
      (EstablishmentModel.findOne as jest.Mock).mockResolvedValue({ ownerId: 'user-1' });
      (userService.findUserByFirebaseUid as jest.Mock).mockResolvedValue({ role: UserRole.OWNER });

      await getJoinEstablishmentHandler()('est-123');

      expect(mockSocket.join).toHaveBeenCalledWith('tenant:tenant-1:establishment:est-123');
    });

    it('allows admin to join any establishment room', async () => {
      (EstablishmentModel.findOne as jest.Mock).mockResolvedValue({ ownerId: 'other-user' });
      (userService.findUserByFirebaseUid as jest.Mock).mockResolvedValue({ role: UserRole.ADMIN });

      await getJoinEstablishmentHandler()('est-123');

      expect(mockSocket.join).toHaveBeenCalledWith('tenant:tenant-1:establishment:est-123');
    });

    it('rejects regular customer (USER role)', async () => {
      (EstablishmentModel.findOne as jest.Mock).mockResolvedValue({ ownerId: 'other-user' });
      (userService.findUserByFirebaseUid as jest.Mock).mockResolvedValue({ role: UserRole.USER });

      await getJoinEstablishmentHandler()('est-123');

      expect(mockSocket.join).not.toHaveBeenCalledWith('tenant:tenant-1:establishment:est-123');
    });

    it('rejects if establishment not found', async () => {
      (EstablishmentModel.findOne as jest.Mock).mockResolvedValue(null);
      (userService.findUserByFirebaseUid as jest.Mock).mockResolvedValue({ role: UserRole.ADMIN });

      await getJoinEstablishmentHandler()('est-999');

      expect(mockSocket.join).not.toHaveBeenCalledWith('tenant:tenant-1:establishment:est-999');
    });
  });

  it('emits newOrders to tenant+establishment room', () => {
    const orderData = { _id: 'order-1', status: 'PENDING' };
    socketServer.sendNewOrder('tenant-1', 'est-123', orderData);

    expect(mockIo.to).toHaveBeenCalledWith('tenant:tenant-1:establishment:est-123');
    expect(mockIo.emit).toHaveBeenCalledWith('newOrders', orderData);
  });

  it('emits order-updated to tenant+user room', () => {
    const orderData = { _id: 'order-123', status: 'DELIVERED' };
    socketServer.sendOrderUpdate('tenant-1', 'user-1', orderData);

    expect(mockIo.to).toHaveBeenCalledWith('tenant:tenant-1:user:user-1');
    expect(mockIo.emit).toHaveBeenCalledWith('order-updated', orderData);
  });
});
