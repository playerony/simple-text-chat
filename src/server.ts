import path from "path";
import express, { Application } from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";

export class Server {
  private app: Application;
  private io: SocketIOServer;
  private httpServer: HTTPServer;

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
      socket.on("chat message", (msg) => {
        this.io.emit("chat message", msg);
      });
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(this.DEFAULT_PORT);
    });
  }
}
