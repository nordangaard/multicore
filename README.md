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

### .spawn(fn)
Apply given function to current data. Usage:

```
const data = new Multicore(['a','b','c']);
data.spawn(data => {
    return data.join(',').toUpperCase();
});

// A,B,C
```

### .map(fn)
Map over elements of array applying given function to every element. Similar to Javascript [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) Usage:

```
const data = new Multicore([1,2,3]);
data.map(val => val*2);

// [2,4,6]
```

### .foldr(fn, [accumulator])
Applies a function against an accumulator and each element in the array in from left-to-right to reduce it to a single value. Similar to Javascript [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce). Usage: 

```
const data = new Multicore([1,2,3]);
data.reduce((acc, val) => {
    return acc + val;
  });

// 6
```

### .reduce(fn, [accumulator])
Applies a function against an accumulator and each element in the array in parallel to reduce it to a single value. **Important**: This function is optimized to run in parallel and needs your reduction operators to be associative, if your operators are not [associative](http://www.computerhope.com/jargon/a/assooper.htm) then use foldr() instead. Usage: 

```
const data = new Multicore([1,2,3]);
data.reduce((acc, val) => {
    return acc + val;
  });

// 6
```

### .filter(fn)
The filter method filters the data and keeps only elements that pass the test implemented by the provided function. Similar to Javascript [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) Usage: 

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
