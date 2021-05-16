import path from "path";
import express, { Application } from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";

import { Message } from "./model/message";

import { Handlers } from "./ws/handlers";
import { DisconnectHandler } from "./ws/handler/disconnect.handler";
import { SendMessageHandler } from "./ws/handler/send-message.handler";

export class Server {
  private app: Application;
  private io: SocketIOServer;
  private httpServer: HTTPServer;

  private messages: Message[] = [];
  private activeSockets: string[] = [];

  private readonly DEFAULT_PORT = 3000;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer);

    this.configureApp();
    this.configureRoutes();
    this.handleSocketConnection();
  }

  private configureApp(): void {
    this.app.use("/js", express.static(path.join(__dirname, "../ui/js/")));
    this.app.use("/css", express.static(path.join(__dirname, "../ui/css/")));
  }

  private configureRoutes(): void {
    this.app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname + "/../ui/html/index.html"));
    });
  }

  private handleSocketConnection(): void {
    const handlers = new Handlers({
      [SendMessageHandler.TYPE]: new SendMessageHandler(this.messages),
      [DisconnectHandler.TYPE]: new DisconnectHandler(this.activeSockets),
    });

    this.io.on("connection", (socket) => {
      const socketId = socket.id

      const activeSocket = this.activeSockets.find(
        (_activeSocket) => _activeSocket === socketId
      );

      if (!activeSocket) {
        this.activeSockets.push(socketId);

        socket.emit("get-client-id", {
          socketId,
        });

        socket.emit("update-message-list", {
          messages: this.messages,
        });

        socket.emit("update-user-list", {
          users: this.activeSockets.filter(
            (_activeSocket) => _activeSocket !== socketId
          ),
        });

        socket.broadcast.emit("update-user-list", {
          users: [socketId],
        });
      }

      socket.onAny((type, payload) => {
        handlers.handle({
          type,
          socket,
          payload,
          socketId,
        });
      });

      socket.on("disconnect", () => {
        handlers.handle({
          socket,
          socketId,
          type: DisconnectHandler.TYPE,
        });
      });
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(this.DEFAULT_PORT);
    });
  }
}
