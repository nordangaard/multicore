import { Operator } from './operator-kit';

const reduce = Operator((data, workerInterface, fn, args) => {
  const promise = data.reduce((acc, val) => acc.then(result =>
    workerInterface.queue(fn, [result, val])), Promise.resolve(1),
  );

  return promise;
});

const map = Operator((data, workerInterface, fn) => {
  const promises = data.map(val => workerInterface.queue(fn, val));

  return Promise.all(promises);
});

const filter = Operator((data, workerInterface, fn) => {
  const arr = [];
  const promises = data.map(val => {
    workerInterface.queue(fn, val).then(bool => {
      if (bool) { arr.push(val) } 
    });
  });

  return Promise.all(promises).then(result => arr);
});

const spawn = Operator((data, workerInterface, fn) => workerInterface.queue(fn, data));

export {
  reduce,
  map,
  filter,
  spawn,
};
