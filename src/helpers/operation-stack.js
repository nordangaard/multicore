import R from 'ramda';
import { Observable, Subject } from 'rxjs';

const EventStartProcessing = 'startProcessing';
const EventDoneProcessing = 'doneProcessing';
const EventDataError = 'error';
const EventDataSuccess = 'data';
const EventFreeThread = 'freeThread';

const createObjectUrl = (src) => {
  const blob = new Blob([src], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  return url;
};

class EventManager extends Subject {
  constructor(init) {
    super(init);
  }

  on(eventType, fn) {
    return this.filter(val => val).filter(({ type }) => type === eventType).subscribe(fn);
  }

  one(eventType, fn) {
    const subscription = this.filter(val => val).filter(({ type }) => type === eventType).subscribe((data) => {
      fn(data);
      subscription.unsubscribe();
    });
    return subscription;
  }

  streamFilter(stream, eventType) {
    return stream.filter(({ type }) => type === eventType);
  }
}

class ThreadManager extends EventManager {
  constructor({ maxThreads = (window.navigator.hardwareConcurrency || 4) } = {}) {
    super(null);
    this.maxThreads = maxThreads;
    this.threads = Array.apply(null, { length: this.maxThreads }).map(() => new Thread());
    this.activeThreads = 0;

    const stream = Observable.merge.apply(this, this.threads).filter(val => val);
    this.threadEvents(stream);
  }

  threadEvents(stream) {
    stream.subscribe((event) => {
    //console.log(event, this.activeThreads);
      switch(event.type) {
        case(EventStartProcessing):
          this.activeThreads++;
        break;
        case(EventDoneProcessing):
          this.activeThreads--;
          this.next({ type: EventFreeThread, thread: event.thread });
        break;
        case(EventDataSuccess):
        case(EventDataError):
          this.next(event);
        break;
      }
    });
  }

  requestThread() {
    if (this.hasFreeThreads) {
      const thread = this.threads.filter(thread => !thread.active).pop();
      this.next({ type: EventFreeThread, thread });
    }
  }

  get hasFreeThreads() {
    return (this.activeThreads !== this.maxThreads);
  }

}

class Thread extends EventManager {
  constructor() {
    super(null);
    this.currentWorker = null;
    this.jobId = null;
    this.active = false;

    this.on(EventStartProcessing, event => this.active = true);
    this.on(EventDoneProcessing, event => this.active = false);
  }

  process(operation, bool) {
    this.next({ type: EventStartProcessing });

    let worker;
    if (bool || operation.id === this.jobId) {
      worker = this.currentWorker;
    } else {
      worker = this.spawnWorker(operation.src);
    }

    worker.onmessage = ({ data }) => {
      this.next({ type: EventDataSuccess, operation, data });
      this.next({ type: EventDoneProcessing, thread: this });
    };

    worker.onerror = (e) => {
      this.next({ type: EventDataError, operation, e });
      this.next({ type: EventDoneProcessing, thread: this });
    };

    worker.postMessage(operation.data);
  }

  spawnWorker(src) {
    if (this.currentWorker) {
      this.currentWorker.terminate();
    }

    const url = createObjectUrl(src);
    const worker = new Worker(url);

    return this.currentWorker = worker;
  }
}

class OperationStack {
  constructor() {
    this.threadManager = new ThreadManager();
    this.stack = [];

    this.threadManager.on('data', ({ operation, data }) => {
      //console.log('Data', operation);
      const [resolve] = operation.promise;
      resolve(data);
    });

    this.threadManager.on('error', ({ operation, e }) => {
      //console.log('Error');
      const [_, reject] = operation.promise;
      reject(e);
    });

    this.threadManager.on('freeThread', ({ thread }) => {
      //console.log('Free thread');
      if (this.stack.length > 0) {
        thread.process(this.stack.shift());
      }
    });
  }

  addOperation(operation) {
    this.stack.push(operation);

    if (this.stack.length > 0) {
      this.threadManager.requestThread();
    }
  }

  queue(operation) {
    this.addOperation(operation);
  }

  batch() {

  }

}

export default OperationStack;
