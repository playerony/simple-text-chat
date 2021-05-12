export class Message {
  id: string;
  message: string;
  socketId: string;
  createdAt: number;

  constructor(socketId: string, message: string) {
    this.message = message;
    this.socketId = socketId;
    this.createdAt = new Date().getTime();

    this.id = this.generateId();
  }

  private generateId(): string {
    return `message_${this.socketId}_${this.createdAt}`;
  }
}
