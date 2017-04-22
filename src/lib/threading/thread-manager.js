import EventManager from '../helpers/event-manager';

class ThreadManager extends EventManager {
  constructor(threads) {
    super(null);
    this.activeThreads = 0;
    this.threads = threads;

    // Register events
    this.threads.forEach(thread => {
        thread.onStartProcessing(() => this.activeThreads++);

        thread.onDoneProcessing((thread) => {
          this.activeThreads--;
          this.triggerFreeThread(thread);
        });

        thread.onData((...args) => {
          this.triggerData(...args);
        });

        thread.onDataError((...args) => {
          this.triggerDataError(...args);
        });
      });
  }

  requestThread() {
    if (this.hasFreeThreads) {
      const thread = this.threads.filter(thread => !thread.active).pop();
      this.triggerFreeThread(thread);
    }
  }

  get hasFreeThreads() {
    return (this.activeThreads !== this.threads.length);
  }
}

export default ThreadManager;
