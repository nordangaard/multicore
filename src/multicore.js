import R from 'ramda';
import { FakedPromise, map, reduce, filter, spawn } from './helpers';

const Worker = window.Worker;

class Multicore extends FakedPromise {
  constructor(data) {
    super();

    this.data = data;
    this.actions = [];
    this.running = false;
  }

  map(fn) {
    return this.addAction(map(fn, {}));
  }

  reduce(fn) {
    return this.addAction(reduce(fn, {}));
  }

  filter(fn) {
    return this.addAction(filter(fn, {}));
  }

  spawn(fn) {
    return this.addAction(spawn(fn, {}));
  }

  addAction(fn) {
    this.actions.push(fn);
    return this.next();
  }

  next() {
    if (!this.running && this.actions.length === 0) {
      return this.resolve(this.data), this.resolved = true, this;
  }

    if (!this.running && this.actions.length > 0) {
      this.makeJob(this.actions.shift());
    }

    return this;
  }

  makeJob(action) {
    this.running = true;

    action(this.data).then((data) => {
      this.data = data;
    })
      .catch((error) => {
        this.rejected = true;
        this.reject(error);
      })
      .then(() => { this.running = false; })
      .then(() => this.next());

    return this;
  }

  get done() {
    return (!this.running && this.actions.length === 0);
  }
}

export default Multicore;
