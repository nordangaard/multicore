import R from 'ramda';
import { FakedPromise, map, reduce, foldr, filter, spawn } from './helpers';

const Worker = window.Worker;

class Multicore extends FakedPromise {
  constructor(data) {
    super();

    this.data = data;
    this.actions = [];
    this.running = false;
  }

  map(fn, ...args) {
    return this.addAction(map(fn, args));
  }

  reduce(fn, ...args) {
    return this.addAction(reduce(fn, args));
  }

  foldr(fn, ...args) {
    return this.addAction(foldr(fn, args));
  }

  filter(fn, ...args) {
    return this.addAction(filter(fn, args));
  }

  spawn(fn, ...args) {
    return this.addAction(spawn(fn, args));
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
