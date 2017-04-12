import EventManager from '../helpers/event-manager';

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
    this.triggerStartProcessing();
  }

  doneProcessing() {
    this.setActive(false);
    this.triggerDoneProcessing(this);
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
      this.triggerData(operation, data);
      this.doneProcessing();
    };

    worker.onerror = (e) => {
      this.triggerDataError(operation, e);
      this.doneProcessing();
    };

    worker.postMessage(operation.data, 
      ('buffer' in operation.data) ? [operation.data.buffer] : undefined
    );
  }

  spawnWorker(src) {
    if (this.currentWorker) {
      this.currentWorker.terminate();
    }

    const url = createObjectUrl(src);
    const worker = new Worker(url);

    return this.currentWorker = worker;
  }

  terminate() {
    if (this.currentWorker) {
      this.currentWorker.terminate();
    }
  }
}

export default Thread;
