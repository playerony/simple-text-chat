import { Socket } from 'socket.io'

export interface HandlerMessage {
  type: string
  socket: Socket
  socketId: string

  payload?: string
}
