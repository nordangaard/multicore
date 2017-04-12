import R from 'ramda';
import Promise from 'bluebird';
import { Operator } from './operator-kit';

const reduce = Operator((dataStore, workerInterface, fn, [init] = []) => {
  if (init) {
    dataStore.unshift(init);
  }

  const wrappedFunc = (arr) => {
    return arr.reduce(fn);
  };

  const promises = dataStore.split()
    .map(store => workerInterface.queue(store.next(), wrappedFunc));

  return Promise.all(promises)
    .then(arr => workerInterface.queue(arr))
    .then(result => dataStore.piece(result));
});

// Remind: Fix this
const foldr = Operator((dataStore, workerInterface, fn, [init] = []) => {
  const wrappedFunc = arr => fn(arr[0], arr[1]);

  const promise = dataStore.data.reduce((acc, val) => acc.then(result =>
    workerInterface.queue([result, val], wrappedFunc)), Promise.resolve(init || 0),
  );

  return promise.then(result => dataStore.piece(result));
});

const map = Operator((dataStore, workerInterface, fn) => {
  const wrappedFunc = (data) => {
    return data.map(fn);
  };

  const promises = dataStore.split()
    .map(store => workerInterface.queue(store.next(), wrappedFunc));

  return Promise.all(promises)
    .then( arr => arr.map(result => dataStore.piece(result)).pop() );
});

const filter = Operator((dataStore, workerInterface) => {
  const wrappedFunc = (data) => {
    const arr = [];
    for (const key in data) {
      if ( fn(data[key]) ) {
        arr.push(data[key]);
      }
    }
    return arr;
  };

  const promises = workerInterface.split().map(store => workerInterface.queue(store, wrappedFunc));

  return Promise.all(promises).then(arr => R.flatten(arr));
});

const spawn = Operator((dataStore, workerInterface) => workerInterface.queue(dataStore));

export {
  reduce,
  foldr,
  map,
  filter,
  spawn,
};
