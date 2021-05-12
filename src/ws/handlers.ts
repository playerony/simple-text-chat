export class Handlers {
  private handlers: any;

  constructor(handlers: any) {
    this.handlers = handlers;
  }

  handle(message: any) {
    if (!this.handlers[message.type]) {
      throw new Error("No handler for message");
    }

    this.handlers[message.type].handle(message);
  }
}
