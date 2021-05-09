import path from "path";
import express, { Application } from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";

import { Message } from "./message";

export class Server {
  private app: Application;
  private io: SocketIOServer;
  private httpServer: HTTPServer;

  private activeSockets: string[] = [];
  private messages: Message[] = [];

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
    this.io.on("connection", (socket) => {
      const activeSocket = this.activeSockets.find(
        (_activeSocket) => _activeSocket === socket.id
      );

      if (!activeSocket) {
        this.activeSockets.push(socket.id);

        socket.emit("get-client-id", {
          socketId: socket.id,
        });

        socket.emit("update-user-list", {
          users: this.activeSockets.filter(
            (existingSocket) => existingSocket !== socket.id
          ),
        });

        socket.emit("update-message-list", {
          messages: this.messages,
        });

        socket.broadcast.emit("update-user-list", {
          users: [socket.id],
        });
      }

      socket.on("send-message", (message) => {
        const newMessage = new Message(socket.id, message);
        this.messages.push(newMessage);

        socket.emit("update-message-list", {
          messages: this.messages,
        });

        socket.broadcast.emit("update-message-list", {
          messages: this.messages,
        });
      });

      socket.on("disconnect", () => {
        this.activeSockets = this.activeSockets.filter(
          (_activeSocket) => _activeSocket !== socket.id
        );

        socket.broadcast.emit("remove-user", {
          socketId: socket.id,
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
