import R from 'ramda';
import OperationStack from './operation-stack';

const EnvNamespace = 'env';
const __ = R.curry;
const Stack = new OperationStack();

// makeSrc : Function -> Data -> String (Src)
const compileSrc = __((fn, globalData) => `self.onmessage = function(e) {var global = {}; global.${EnvNamespace} = ${JSON.stringify(globalData || {})};
    self.postMessage((${fn.toString()})(e.data))}`);

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

const makeWorkerInterface = operation => ({
  queue: R.pipe(operation, queueOperationWithStack),
});

const Operator = operatorFunc => __((fn, globalData, data) => {
  const src = compileSrc(fn, globalData);
  const op = makeOp(src);
  const workerInterface = makeWorkerInterface(op);

  return operatorFunc(data, workerInterface);
});

export {
  Operator
};