Multicore
=========================

A simple Javascript library for handling Web Workers.

Currently being developed. Only works on the web.

## Installation

```
Use yarn or npm:

yarn add multicore --save
npm install --save multicore
```

This assumes that you’re using [npm](http://npmjs.com/) package manager with a module bundler like [Webpack](https://webpack.js.org/) or [Browserify](http://browserify.org/) to consume [CommonJS modules](http://webpack.github.io/docs/commonjs.html).

If you don’t yet use [npm](http://npmjs.com/) or a modern module bundler, and would rather prefer a single-file [UMD](https://github.com/umdjs/umd) build that makes `ReactRedux` available as a global object, you can grab a pre-built version from [cdnjs](https://cdnjs.com/libraries/react-redux). We *don’t* recommend this approach for any serious application, as most of the libraries complementary to Redux are only available on [npm](http://npmjs.com/).

## Documentation

Import Multicore using either:

```
const multicore = require('multicore');
import Multicore from 'multicore';
```

Create new instance for data you wish you manipulate:

```
const data = new Multicore([1,2,3]);
```


Manipulate:

```
data.map(val => val*2)
  .map(val => val*3)
  .reduce((arr) => {
    const [acc, val] = arr;
    return acc + val;
  })
  .then(result => {
    console.log(`The result is ${result}`);
  });
  
```

## Methods
A method receives only one argument, the current data being manipulated.

### .spawn
Apply given function to current data. Usage:

```
const data = new Multicore([1,2,3]);
data.spawn(data => {
    return data.join(',').toUpperCase();
});
```

### .map
Map over elements of array applying given function to every element. Usage:

```
const data = new Multicore([1,2,3]);
data.map(val => val*2)
```

### .reduce
Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value. **Important**: Currently receives an array of size 2 for accumulator and value. Usage: 

```
const data = new Multicore([1,2,3]);
data.reduce((arr) => {
    const [acc, val] = arr;
    return acc + val;
  })
```

More methods under development.

## License

BSD3
