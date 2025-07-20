import { SubscribeEventParams } from "./TypesAndInterfaces.ts";

export declare class EventsManager {
  constructor();

  subscribeEvent(params: SubscribeEventParams): void;

  unsubScribeEvent(signalName: string): void;
}
