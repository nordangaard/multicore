import R from 'ramda';
import OperationStack from './operation-stack';
import compileSrc from './compiler';

const EnvNamespace = 'env';
const __ = R.curry;
const Stack = new OperationStack();

// makeJob : String Src -> Data -> Operation
const makeOp = __((src, data) => ({ src, data }));

// queueOperation : Operation -> Promise
const doOperation = __((stackFunc, operation) => {
  const promise = new Promise((resolve, reject) => {
    operation.promise = [resolve, reject];
    stackFunc(operation);
  });

  return promise;
});

const queueOperation = doOperation(Stack.queue.bind(Stack));
const batchOperation = doOperation(Stack.batch.bind(Stack));

class WorkerInterface {
  constructor(fn) {
    this.original = fn;
    this.fn = (data) => { return fn(data); };
    this.compile = compileSrc(this.original, EnvNamespace);
  }

  get global() {
    return this._global || {};
  }

  set global(val) {
    return this._global = val;
  }

  get src() {
    return this._src = this._src || this.compile(this.global, this.fn);
  }

  get operation() {
    return this._operation = this._operation || makeOp(this.src);
  }

  recompile(fn, global) {
    if(!fn && !global) return;

    this.fn = fn || this.fn;
    this.global = global || this.global;

    return this._src = this.compile(this.global, this.fn);
  }

  queue(data, fn) {
    this.recompile(fn);
    return R.pipe(this.operation, queueOperation)(data);
  }

  batch(data, fn) {
    this.recompile(fn);
    return R.pipe(this.operation, batchOperation)(data);
  }
}

const Operator = operatorFunc => __((fn, args, data) => {
  const workerInterface = new WorkerInterface(fn);
  return operatorFunc(data, workerInterface, fn, args);
});

export {
  Operator
};
