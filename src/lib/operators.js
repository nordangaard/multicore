import R from 'ramda';
import Promise from 'bluebird';
import { Operator } from './operator-kit';

const reduce = Operator((dataStore, workerInterface, fn, [init] = []) => {
  if (init) {
    dataStore.unshift(init);
  }

  const wrappedFunc = (arr) => {
    return arr.reduce(fn, 0);
  };

  const promises = dataStore.split()
    .map(store => workerInterface
      .queue(store.next(), wrappedFunc)
    );

  return Promise.all(promises)
    .then( arr => { return workerInterface.queue(arr, wrappedFunc); } )
    .then( result => dataStore.piece(result) );
});

// Remind: Fix this
const foldr = Operator((dataStore, workerInterface, fn, [init] = []) => {
  const wrappedFunc = arr => fn(arr[0], arr[1]);

  const promise = dataStore.merge().next().reduce((acc, val) => acc.then(result =>
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
  const wrappedFunc = (arr) => {
    return arr.filter(fn);
  };

  const promises = dataStore.split()
    .map(store => workerInterface.queue(store.next(), wrappedFunc));

  return Promise.all(promises)
    .then( arr => arr.map(result => dataStore.piece(result)).pop() );
});

const spawn = Operator((dataStore, workerInterface) => workerInterface.queue(dataStore.next())
  .then(result => dataStore.piece(result)));

const spawnParallel = Operator((dataStore, workerInterface) => {
  const promises = dataStore.split()
    .map(store => workerInterface.queue(store.next()));

  return Promise.all(promises)
    .then( arr => arr.map(result => dataStore.piece(result)).pop() );
});

export {
  reduce,
  foldr,
  map,
  filter,
  spawn,
  spawnParallel,
};
