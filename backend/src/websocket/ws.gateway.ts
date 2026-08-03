import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/ws',
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private companyRooms = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const companyId = client.handshake.query.companyId as string;
    if (companyId) {
      client.join(`company:${companyId}`);
      if (!this.companyRooms.has(companyId)) {
        this.companyRooms.set(companyId, new Set());
      }
      this.companyRooms.get(companyId)!.add(client.id);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [companyId, clients] of this.companyRooms.entries()) {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) this.companyRooms.delete(companyId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, companyId: string) {
    client.join(`company:${companyId}`);
    if (!this.companyRooms.has(companyId)) {
      this.companyRooms.set(companyId, new Set());
    }
    this.companyRooms.get(companyId)!.add(client.id);
  }

  emitToCompany(companyId: string, event: string, data: any) {
    this.server.to(`company:${companyId}`).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
