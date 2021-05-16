import { HandlerMessage } from '../type/HandlerMessage'

import { DisconnectHandler } from './handler/disconnect.handler'
import { SendMessageHandler } from './handler/send-message.handler'

interface HandlersType {
  [key: string]: DisconnectHandler | SendMessageHandler
}

export class Handlers {
  private handlers: HandlersType;

  constructor(handlers: HandlersType) {
    this.handlers = handlers;
  }

  handle(message: HandlerMessage) {
    if (!this.handlers[message.type]) {
      throw new Error("No handler for message");
    }

    this.handlers[message.type].handle(message);
  }
}
