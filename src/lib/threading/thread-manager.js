import Thread from './thread';
import { 
  EventManager,
  EventStartProcessing,
  EventDoneProcessing,
  EventDataError,
  EventDataSuccess,
  EventFreeThread,
} from '../helpers/event-manager';

class ThreadManager extends EventManager {
  constructor({ maxThreads = (window.navigator.hardwareConcurrency || 4) } = {}) {
    super(null);
    this.maxThreads = maxThreads;
    this.activeThreads = 0;
    this.threads = Array.apply(null, { length: this.maxThreads }).map(() => new Thread());

    // Register events
    this.threads.forEach(thread => {
        thread.on(EventStartProcessing, () => this.activeThreads++);

        thread.on(EventDoneProcessing, (thread) => {
          this.activeThreads--;
          this.trigger(EventFreeThread, thread);
        });

        thread.on(EventDataSuccess, (...args) => {
          this.trigger(EventDataSuccess, ...args);
        });

        thread.on(EventDataError, (...args) => {
          this.trigger(EventDataError, ...args);
        });
      });
  }

  requestThread() {
    if (this.hasFreeThreads) {
      const thread = this.threads.filter(thread => !thread.active).pop();
      this.trigger(EventFreeThread, thread);
    }
  }

  get hasFreeThreads() {
    return (this.activeThreads !== this.maxThreads);
  }
}

export default ThreadManager;
