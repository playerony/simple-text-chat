export class Message {
  message: string;
  socketId: string;
  createdAt: number;

  constructor(socketId: string, message: string) {
    this.message = message;
    this.socketId = socketId;
    this.createdAt = new Date().getTime();
  }
}
