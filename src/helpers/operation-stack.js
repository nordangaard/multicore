import R from 'ramda';

const createObjectUrl = R.memoize((src) => {
  const blob = new Blob([src], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  return url;
});

class OperationStack {
  constructor({ maxWorkers = (window.navigator.hardwareConcurrency || 4) } = {}) {
    this.maxWorkers = maxWorkers;
    this.activeWorkers = 0;
    this.stack = [];
  }

  get hasFreeWorkers() {
    return this.activeWorkers !== this.maxWorkers;
  }

  get stackEmpty() {
    return this.stack.length === 0;
  }

  spawnWorker(src) {
    const url = createObjectUrl(src);
    const worker = new Worker(url);

    return this.activeWorkers++, worker;
  }

  destroyWorker(worker) {
    return worker.terminate(), this.activeWorkers--, this;
  }

  queue(operation) {
    this.stack.push(operation);
    this.next();
  }

  batch(operation){
    this.stack.push(operation);
    this.next();
  }

  next() {
    if (this.hasFreeWorkers && !this.stackEmpty) {
      this.process(this.stack.pop());
    }

    return this;
  }

  process({ src, data, promise }) {
    const worker = this.spawnWorker(src);
    const [resolve, reject] = promise;

    worker.onmessage = ({ data }) => {
      this.destroyWorker(worker);
      this.next();

      resolve(data);
    };

    worker.onerror = (e) => {
      this.destroyWorker(worker);
      this.next();

      reject(e);
    };

    worker.postMessage(data);
  }
}

export default OperationStack;
