import { FakedPromise, map, reduce, foldr, filter, spawn, spawnParallel } from './lib';
import DataStore from './lib/helpers/data-store';

const Worker = window.Worker;

class Multicore extends FakedPromise {
  constructor(data) {
    super();

    this.dataStore = new DataStore(data);
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

  spawnParallel(fn, ...args) {
    return this.addAction(spawnParallel(fn, args));
  }

  addAction(fn) {
    this.actions.push(fn);
    return this.next();
  }

  next() {
    if (this.done) {
      return this.resolve(this.dataStore.data), this.resolved = true, this;
    }

    if (!this.running && this.actions.length > 0) {
      this.makeJob(this.actions.shift());
    }

    return this;
  }

  makeJob(action) {
    this.running = true;

    action(this.dataStore)
      .then((dataStore) => {
        this.dataStore = dataStore;
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

  static data(data) {
    return new Multicore(data);
  }

  static uInt8(arr) {
    const mc = new Multicore(arr);
    return mc.spawnParallel((data) => Uint8Array.from(data));
  }

  static uInt16(arr) {
    const mc = new Multicore(arr);
    return mc.spawnParallel((data) => Uint16Array.from(data));
  }

  static uInt32(arr) {
    const mc = new Multicore(arr);
    return mc.spawnParallel((data) => Uint32Array.from(data));
  }

  static int8(arr) {
    const mc = new Multicore(arr);
    return mc.spawnParallel((data) => Int8Array.from(data));
  }

  static int16(arr) {
    const mc = new Multicore(arr);
    return mc.spawnParallel((data) => Int16Array.from(data));
  }

  static int32(arr) {
    const mc = new Multicore(arr);
    return mc.spawnParallel((data) => Int32Array.from(data));
  }

  static float32(arr) {
    const mc = new Multicore(arr);
    return mc.spawnParallel((data) => Float32Array.from(data));
  }

  static float64(arr) {
    const mc = new Multicore(arr);
    return mc.spawnParallel((data) => Float64Array.from(data));
  }
}

export default Multicore;
