import R from 'ramda';
import ThreadManager from './thread-manager';

import {
  EventDataSuccess,
  EventDataError,
  EventFreeThread,
} from './event-manager';

class OperationStack {
  constructor() {
    this.threadManager = new ThreadManager();
    this.stack = [];

    this.threadManager.on(EventDataSuccess, (operation, data) => {
      const [resolve] = operation.promise;
      resolve(data);
    });

    this.threadManager.on(EventDataError, (operation, e ) => {
      const [_, reject] = operation.promise;
      reject(e);
    });

    this.threadManager.on(EventFreeThread, (thread) => {
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
