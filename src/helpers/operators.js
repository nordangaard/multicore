import { Operator } from './operator-kit';

const reduce = Operator((data, workerInterface) => {
  const promise = data.reduce((acc, val) => acc.then(result =>
    workerInterface.queue([result, val])), Promise.resolve(1),
  );

  return promise;
});

const map = Operator((data, workerInterface) => {
  const promises = data.map(val => workerInterface.queue(val));

  return Promise.all(promises);
});

const filter = Operator((data, workerInterface) => {
  // Request workers
});

const spawn = Operator((data, workerInterface) => workerInterface.queue(data));

export {
  reduce,
  map,
  filter,
  spawn,
};
