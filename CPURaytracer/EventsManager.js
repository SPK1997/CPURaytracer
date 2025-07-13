class EventsManager {
  #eventSignals;
  constructor() {
    this.#eventSignals = {};
  }
  subscribeEvent({element, eventName, callback, signalName}) {
    if (this.#eventSignals[eventName]) {
      return;
    }
    let abortController = new AbortController();
    element.addEventListener(eventName, callback, {
      signal: abortController.signal,
    });
    this.#eventSignals[signalName] = abortController;
  }

  unsubScribeEvent(signalName) {
    this.#eventSignals[signalName].abort();
    delete this.#eventSignals[signalName];
  }
}

export { EventsManager };
