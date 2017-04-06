import R from 'ramda';
import OperationStack from './operation-stack';

const EnvNamespace = 'env';
const __ = R.curry;
const Stack = new OperationStack();

// For future compiling of helper functions
const compileHelper = ([fn, name]) => name ? ` var ${name} = ${fn.toString()}; ` : ` ${fn.toString()} `;
const compileHelpers = R.pipe( R.toPairs, R.map(compileHelper), R.join(' ') );

// onMessage : String -> String
const onMessage = functionBody => `self.onmessage = function(e) { ${functionBody} }`;

// postMessage : Function -> String
const postMessage = fn => `self.postMessage((${fn.toString()})(e.data))`;
// namespace : String -> * any -> String
const namespace = (env, data) => `var global = {}; global.${env} = ${JSON.stringify(data)};`

const compileSrc = __((fn, env, data) => onMessage(namespace(env, data) + postMessage(fn)));

// makeJob : String Src -> Data -> Operation
const makeOp = __((src, data) => ({ src, data }));

// queueOperation : Operation -> Promise
const queueOperation = __((stack, operation) => {
  const promise = new Promise((resolve, reject) => {
    operation.promise = [resolve, reject];
    stack.queue(operation);
  });

  return promise;
});

const queueOperationWithStack = queueOperation(Stack);

class WorkerInterface {
  constructor(fn) {
    this.fn = fn;
  }

  get global() {
    return this._global || {};
  }

  set global(val) {
    return this._global = val;
  }

  get src() {
    return this._src = this._src || compileSrc(this.fn, EnvNamespace, this.global);
  }

  get operation() {
    return this._operation = this._operation || makeOp(this.src);
  }

  queue(fn, data) {
    this.fn = fn;
    return R.pipe(this.operation, queueOperationWithStack)(data);
  }
}

/*const workerInterface = () => {
  return {
    global: {},
    namespace: {},
    batch: () => {},
    queue: __(function queue(fn, data) {
      const compiled = compileSrc(this.global, fn);
      const operation = makeOp(compiled);
      return R.pipe(operation, queueOperationWithStack)(data);
    }),
  };
};*/

const Operator = operatorFunc => __((fn, args, data) => {
  const workerInterface = new WorkerInterface(fn);
  return operatorFunc(data, workerInterface, fn, args);
});

export {
  Operator
};
