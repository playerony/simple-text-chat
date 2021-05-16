import { HandlerMessage } from '../../type/HandlerMessage'

export class DisconnectHandler {
  private activeSockets: string[];
  public static TYPE = "disconnect";

  constructor(activeSockets: string[]) {
    this.activeSockets = activeSockets;
  }

  handle({ socket, socketId }: HandlerMessage) {
    const activeSocketIndex = this.activeSockets.findIndex(
      (_activeSocket) => _activeSocket === socketId
    );

    this.activeSockets.splice(activeSocketIndex, 1);

    socket.broadcast.emit("remove-user", {
      socketId
    });
  }
}
