import { ThreadManager } from './threading';

class OperationStack {
  constructor() {
    this.threadManager = new ThreadManager();
    this.stack = [];

    this.threadManager.onData((operation, data) => {
      const [resolve] = operation.promise;
      resolve(data);
    });

    this.threadManager.onDataError((operation, e ) => {
      const [_, reject] = operation.promise;
      reject(e);
    });

    this.threadManager.onFreeThread((thread) => {
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

  batch() { }

}

export default OperationStack;
