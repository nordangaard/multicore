class FakedPromise {
  constructor() {
    this.resolved = false;
    this.rejected = false;

    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.promise
      .then(data => this.resolved = true)
      .catch(error => this.rejected = true);
  }

  then(fn) {
    if (this.done && this.resolved) fn(this.data);
    else if (!this.done) this.promise.then(fn);

    return this;
  }

  catch(fn) {
    if (this.done && this.rejected) fn(this.data);
    else if (!this.done) this.promise.catch(fn);

    return this;
  }
}

export default FakedPromise;