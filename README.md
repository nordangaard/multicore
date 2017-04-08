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
  .reduce((acc, val) => {
    return acc + val;
  })
  .then(result => {
    console.log(`The result is ${result}`);
  });

// The result is 37
  
```

## Methods
A method receives only one argument, the current data being manipulated.

### .spawn
Apply given function to current data. Usage:

```
const data = new Multicore(['a','b','c']);
data.spawn(data => {
    return data.join(',').toUpperCase();
});
// A,B,C
```

### .map
Map over elements of array applying given function to every element. Usage:

```
const data = new Multicore([1,2,3]);
data.map(val => val*2);
// [2,4,6]
```

### .reduce
Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value. Usage: 

```
const data = new Multicore([1,2,3]);
data.reduce((acc, val) => {
    return acc + val;
  });
// 6
```

### .filter
The filter method filters the data and keeps only elements that pass the test implemented by the provided function. Usage: 

```
const data = new Multicore([1,2,3]);
data.filter((val) => {
    return val > 2;
  });
// 3
```

More methods under development.

## License

BSD3
