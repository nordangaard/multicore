import { 
  EventManager,
  EventStartProcessing,
  EventDoneProcessing,
  EventDataSuccess,
} from '../helpers/event-manager';

const createObjectUrl = (src) => {
  const blob = new Blob([src], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  return url;
};

class Thread extends EventManager {
  constructor() {
    super(null);
    this.currentWorker = null;
    this.jobId = null;
    this.active = false;
  }

  setActive(bool) {
    this.active = bool;
  }

  startProcessing() {
    this.setActive(true);
    this.trigger(EventStartProcessing);
  }

  doneProcessing() {
    this.setActive(false);
    this.trigger(EventDoneProcessing, this);
  }

  process(operation, bool) {
    this.startProcessing();
    let worker;
    if (bool || operation.id === this.jobId) {
      worker = this.currentWorker;
    } else {
      worker = this.spawnWorker(operation.src);
      this.jobId = operation.id;
    }

    worker.onmessage = ({ data }) => {
      this.trigger(EventDataSuccess, operation, data);
      this.doneProcessing();
    };

    worker.onerror = (e) => {
      this.trigger(EventDataSuccess, operation, e);
      this.doneProcessing();
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

export default Thread;
