import { Message } from "../../model/message";
import { HandlerMessage } from '../../type/HandlerMessage'

export class SendMessageHandler {
  public static TYPE = "send-message";
  private messages: Message[];

  constructor(messages: Message[]) {
    this.messages = messages;
  }

  handle({ socket, payload, socketId }: HandlerMessage) {
    const newMessage = new Message(socketId, payload);
    this.messages.push(newMessage);

    socket.emit("update-message-list", {
      messages: this.messages,
    });

    socket.broadcast.emit("update-message-list", {
      messages: this.messages,
    });
  }
}
