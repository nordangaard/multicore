import R from 'ramda';

class DataStore {
  constructor(data, type = null) {
    this.type = type;
    this._data = [];
    this.piece(data);
  }

  split(numSplits = 4) {
    if( !this.inPieces ) {
      this._data = R.splitEvery(Math.round(this.getSingle().length / numSplits), this.getSingle())
    }
    
    return Array.apply(null, {length: numSplits}).map(() => this);
  }

  piece(data) {
    this._data.push(data);
    return this;
  }

  getSingle() {
    return this._data[0];
  }

  get inPieces() {
    return (this._data.length > 1);
  }

  get hasNext() {
    return (this._data.length > 0);
  }

  get data() {
    return this.inPieces ? R.flatten(this._data) : this.getSingle();
  }

  set data(data) {
    this._data.length = 0;
    this.piece(data);
  }

  unshift(data) {
    this.getSingle().push(data);
  }

  next() {
    return this._data.shift();
  }

}

export default DataStore;