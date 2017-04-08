/*
  For the sake of performance, only allow one callback per event.
*/

const EventStartProcessing = 'startProcessing';
const EventDoneProcessing = 'doneProcessing';
const EventDataError = 'error';
const EventDataSuccess = 'data';
const EventFreeThread = 'freeThread';

class EventManager {
  constructor() {
    this.subscribers = {};
  }

  on(eventType, fn) {
    return this.subscribers[eventType] = fn;
  }

  trigger(eventType, ...args) {
    return this.subscribers[eventType] && this.subscribers[eventType](...args);
  }

  onStartProcessing(fn) { return this.on(EventStartProcessing, fn); }
  onDoneProcessing(fn) { return this.on(EventDoneProcessing, fn); }
  onData(fn) { return this.on(EventDataSuccess, fn); }
  onDataError(fn) { return this.on(EventDataError, fn); }
  onFreeThread(fn) { return this.on(EventFreeThread, fn); }

  triggerStartProcessing(...args) { return this.trigger(EventStartProcessing, ...args); }
  triggerDoneProcessing(...args) { return this.trigger(EventDoneProcessing, ...args); }
  triggerData(...args) { return this.trigger(EventDataSuccess, ...args); }
  triggerDataError(...args) { return this.trigger(EventDataError, ...args); }
  triggerFreeThread(...args) { return this.trigger(EventFreeThread, ...args); }
}

export default EventManager;
