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

}

export {
  EventManager,
  EventStartProcessing,
  EventDoneProcessing,
  EventDataError,
  EventDataSuccess,
  EventFreeThread,
};
