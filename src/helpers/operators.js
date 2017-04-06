import { Operator } from './operator-kit';

const reduce = Operator((data, workerInterface, fn, args) => {

  const wrappedFunc = (arr) => {
    return fn(arr[0], arr[1]);
  };

  const promise = data.reduce((acc, val) => acc.then(result =>
    workerInterface.queue([result, val], wrappedFunc)), Promise.resolve(1),
  );

  return promise;
});

const map = Operator((data, workerInterface) => {
  const promises = data.map(val => workerInterface.queue(val));

  return Promise.all(promises);
});

const filter = Operator((data, workerInterface) => {
  const arr = [];
  const promises = data.map(val => {
    workerInterface.queue(val).then(bool => {
      if (bool) { arr.push(val) } 
    });
  });

  return Promise.all(promises).then(result => arr);
});

const spawn = Operator((data, workerInterface) => workerInterface.queue(data));

export {
  reduce,
  map,
  filter,
  spawn,
};
