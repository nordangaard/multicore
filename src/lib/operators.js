import R from 'ramda';
import Promise from 'bluebird';
import { Operator } from './operator-kit';

const reduce = Operator((data, workerInterface, fn, [init] = []) => {
  if (init) {
    data.unshift(init);
  }

  const wrappedFunc = (arr) => {
    return arr.reduce(fn);
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
    return data.map(fn);
  };

  const promises = workerInterface
    .splitJob(data)
    .map(val => workerInterface.queue(val, wrappedFunc));

  return Promise.all(promises)
    .then(arr => R.flatten(arr))
    .then(arr => arr.length === 1 && !Array.isArray(arr[0]) ? arr[0] : arr);
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
