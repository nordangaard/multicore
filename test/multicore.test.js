import Multicore from '../src/multicore';
import chai from 'chai';
import spies from 'chai-spies';

const expect = chai.expect;
chai.use(spies);

const operators = require('../src/lib/operators');

const operatorsObject = {...operators};
delete operatorsObject.__esModule;

describe('Multicore', () => {
  let multicore;
  let data;

  describe('Constructor', () => {
    beforeEach(() => {
      data = undefined;
      multicore = undefined;
    });

    it('should handle array passed to it.', () => {
      data = [1,2,3];
      multicore = new Multicore(data);

      expect(multicore.data).to.eql(data);
    });

    it('should handle object passed to it.', () => {
      data = { a: 1, b: 2, c: 3 };
      multicore = new Multicore(data);

      expect(multicore.data).to.eql(data);
    });
  });

  describe('API', () => {
    let operatorFunctions = Object.keys(operatorsObject);

    beforeEach(() => {
      data = [1,2,3];
      multicore = new Multicore(data);
    });

    it('should contain API-operator methods.', () => {
      expect( multicore.__proto__ ).to.contain.keys( operatorFunctions );
    });

    it('should contain internal promise and promise-methods.', () => {
      expect( multicore ).to.contain.keys( ['promise'] );
      expect( multicore.__proto__.__proto__ ).to.contain.keys( ['then', 'catch'] );
    });

    describe('Operators', (done) => {
      beforeEach(() => {
        data = [1,2,3];
        multicore = new Multicore(data);

      });

      operatorFunctions.forEach(operator => {
        it(`${operator} should add action to internal array`, (done) => {
          const spy = chai.spy.on(multicore.actions, 'push');
          multicore[operator](() => {});
          expect(spy).to.have.been.called();
          done();
        });
      });

    });

  });
});