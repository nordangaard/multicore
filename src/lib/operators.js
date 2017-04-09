import R from 'ramda';
import { Operator } from './operator-kit';

const reduce = Operator((data, workerInterface, fn, [init] = []) => {
  if (init) {
    data.unshift(init);
  }

  const wrappedFunc = (arr) => {
    function splitEvery(n, list) {
      if (n <= 0) {
        throw new Error('First argument to splitEvery must be a positive integer');
      }

      const result = [];
      let idx = 0;
      while (idx < list.length) {
        result.push(list.slice(idx, idx += n));
      }
      return result;
    }

    function reducePairs(dataArr) {
      const splitArr = splitEvery(2, dataArr);

      const result = [];

      for (const arrVal of splitArr) {
        if (arrVal.length === 1) {
          result.push(arrVal[0]);
        } else {
          result.push(fn(arrVal[0], arrVal[1]));
        }
      }

      if (result.length === 1) {
        return result[0];
      } 

      return reducePairs(result);
    }

    return reducePairs(arr);
  };

  const promises = workerInterface
    .splitJob(data)
    .map(arr => workerInterface.queue(arr, wrappedFunc));

  return Promise.all(promises).then(arr => workerInterface.queue(arr));
});

const foldr = Operator((data, workerInterface, fn, [init] = []) => {
  const wrappedFunc = arr => fn(arr[0], arr[1]);

  const promise = data.reduce((acc, val) => acc.then(result =>
    workerInterface.queue([result, val], wrappedFunc)), Promise.resolve(init || 0),
  );

  return promise;
});

const map = Operator((data, workerInterface, fn) => {
  const wrappedFunc = (data) => {
    for (const key in data) {
      data[key] = fn(data[key]);
    }
    return data;
  };

  const promises = workerInterface
    .splitJob(data)
    .map(val => workerInterface.queue(val, wrappedFunc));

  return Promise.all(promises).then(arr => R.flatten(arr));
});

const filter = Operator((data, workerInterface) => {
  const wrappedFunc = (data) => {
    const arr = [];
    for (const key in data) {
      if ( fn(data[key]) ) {
        arr.push(data[key]);
      }
    }
    return arr;
  };

  const promises = workerInterface
    .splitJob(data)
    .map(val => workerInterface.queue(val, wrappedFunc));

  return Promise.all(promises).then(arr => R.flatten(arr));
});

const spawn = Operator((data, workerInterface) => workerInterface.queue(data));

export {
  reduce,
  foldr,
  map,
  filter,
  spawn,
};
