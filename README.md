Multicore
=========================

A simple Javascript library for handling Web Workers.

Currently being developed. Only works on the web.

Progress so far: 
- Faster for arithmetic operations than ParallelJS.
Test: Operating on a list of 100k elements, multiplying and reducing them to one value. 
Result: Multicore: ~200ms - ParallelJS ~20s
- Now supposrts [TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays#Typed_array_views) (and any kind of [transferable](https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast)) for futher increase speed and memory use.

## Installation

```
Use yarn or npm:

yarn add multicore --save
npm install --save multicore
```

This assumes that you’re using [npm](http://npmjs.com/) package manager with a module bundler like [Webpack](https://webpack.js.org/) or [Browserify](http://browserify.org/) to consume [CommonJS modules](http://webpack.github.io/docs/commonjs.html).

## Documentation

### Usage

##### TLDR;
- Use **.data** or, if you know size/type of array, a [TypedArray]() function like **.uInt8**.
- Then manipulate data by chaining [API-methods](): 
-- ` Multicore.data([1,2,3]).reduce((acc,val) => acc+val); `
- Retrieve the data from the instance promise: 
-- `[...].reduce().map().then(result => { doSomething(result); })`

#### Import Multicore
Using either:

```
const Multicore = require('multicore').default;
import Multicore from 'multicore';
```

#### Create an instance
Start an instance for data you wish you manipulate (can either be used as a constructor or with these static shorthand-methods):

##### Constructor
Create an instance with constructor and save it to a variable. The Constructor can also be subclassed as per ES6 classes.
```
const data = new Multicore([1,2,3]); // Constructor

```

##### Static converter-functions
Use the generic **.data** method to get the same behavior as with constructor.

Use any of the [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays#Typed_array_views) functions to pass in an array and use parallelized conversion to convert it to a typed array internally, and thereby being able to use buffers internally. *Recommended for large arrays containing integers or floats, or anytime you know your array will only contain numbers.*

TypedArray functions for the different types: **.int8, .int16, .int32, .uInt8, .uInt16, .uInt32, .float32, .float16**.

```
const data = Multicore.data([1,2,3]); // Use for generic data.
const data = Multicore.uInt8([1,2,3); // Will convert array to typed-array and be able to utilize buffers internally
```

#### Start manipulating

```
// Manipulate saved instance
data.map(val => val*2)
  .map(val => val*3)
  .reduce((acc, val) => {
    return acc + val;
  })
  .then(result => {
    console.log(`The result is ${result}`);
  });

// The result is 37

// Direct manipulation and conversion
Multicore.uInt8([1,2,3])
    .map(val => val*2)
    .then(console.log); 

// [2,4,6]
  
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

// "A,B,C"
```

### .map(fn)
Map over elements of array applying given function to every element. Similar to Javascript [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) Usage:

```
const data = new Multicore([1,2,3]);
data.map(val => val*2);

// [2,4,6]
```

### .reduce(fn, [accumulator = 0])
Applies a function against an accumulator and each element in the array in parallel to reduce it to a single value. **Important**: This function is optimized to run in parallel and needs your reduction operators to be associative, if your operators are not [associative](http://www.computerhope.com/jargon/a/assooper.htm) then use [foldr()](#foldrfn-accumulator) instead. Usage: 

```
const data = new Multicore([1,2,3]);
data.reduce((acc, val) => {
    return acc + val;
  });

// 6
```

### .foldr(fn, [accumulator = 0])
Applies a function against an accumulator and each element in the array in from left-to-right to reduce it to a single value. Similar to Javascript [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce). Usage: 

```
const data = new Multicore([1,2,3]);
data.foldr((acc, val) => {
    return acc - val;
  }, 0);

// -4
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

*More methods under development.*

## Work In Progress
Work that is currently underway and lives in feature-branches.

- Adding full test-coverage.
- Switching to babel-implementation and building minified-js-files for CDN.
- Adding support for new operators: .parallel and .merge.

## License

MIT
