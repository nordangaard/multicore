import R from 'ramda';
import { Operator } from './operator-kit';

const reducePairs = (fn, data, resolve, reject, workerInterface) => {
  const splitArr = R.splitEvery(2, data);

  const promiseArr = splitArr.map((arr) => {
    if (arr.length === 1) {
      return Promise.resolve(arr[0]);
    }

    return workerInterface.queue(arr, fn);
  });

  Promise.all(promiseArr).then((arr) => {
    if (arr.length === 1) {
      resolve(arr[0]);
    } else {
      reducePairs(fn, arr, resolve, reject, workerInterface);
    }
  });
};

const reduce = Operator((data, workerInterface, fn, [init] = []) => {
  const wrappedFunc = arr => fn(arr[0], arr[1]);

  if (init) {
    data.unshift(init);
  }

  return new Promise((resolve, reject) => {
    reducePairs(wrappedFunc, data, resolve, reject, workerInterface);
  });
});

const foldr = Operator((data, workerInterface, fn, [init] = []) => {
  const wrappedFunc = arr => fn(arr[0], arr[1]);

  const promise = data.reduce((acc, val) => acc.then(result =>
    workerInterface.queue([result, val], wrappedFunc)), Promise.resolve(init || 0),
  );

  return promise;
});

const map = Operator((data, workerInterface) => {
  const promises = data.map(val => workerInterface.queue(val));

  return Promise.all(promises);
});

const filter = Operator((data, workerInterface) => {
  const arr = [];
  const promises = data.map((val) => {
    workerInterface.queue(val).then((bool) => {
      if (bool) { arr.push(val); }
    });
  });

  return Promise.all(promises).then(result => arr);
});

const spawn = Operator((data, workerInterface) => workerInterface.queue(data));

export {
  reduce,
  foldr,
  map,
  filter,
  spawn,
};
