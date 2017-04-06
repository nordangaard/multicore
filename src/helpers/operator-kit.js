import R from 'ramda';
import OperationStack from './operation-stack';

const EnvNamespace = 'env';
const __ = R.curry;
const Stack = new OperationStack();

// For future compiling of helper functions
const compileHelper = ([fn, name]) => name ? ` var ${name} = ${fn.toString()}; ` : ` ${fn.toString()} `;
const compileHelpers = R.pipe( R.toPairs, R.map(compileHelper), R.join(' ') );

// makeSrc : Function -> Data -> String (Src)
const compileSrc = __((globalData, fn) =>{ 
  return `
  self.onmessage = function(e) {
    var global = {}; global.${EnvNamespace} = ${JSON.stringify(globalData || {})};
    self.postMessage((${fn.toString()})(e.data))
  }`;
});

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

const workerInterface = () => ({
  global: {},
  namespace: {},
  batch: () => {},
  queue: __(function(fn, data) {
    const operation = R.pipe(compileSrc(this.global), makeOp)(fn);
    return R.pipe(operation, queueOperationWithStack)(data);
  }),
});

const Operator = operatorFunc => __((fn, args, data) => {
  return operatorFunc(data, workerInterface(), fn, args);
});

export {
  Operator
};
