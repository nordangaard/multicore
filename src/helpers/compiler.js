import R from 'ramda';

const __ = R.curry;

const functionRegex = new RegExp(/^\s*function[^\(]+/);
const stripFunctionName = functionString => functionString.replace(functionRegex, 'function fn');

// For future compiling of helper functions
const compileHelper = ([fn, name]) => name ? ` var ${name} = ${fn.toString()}; ` : ` ${fn.toString()} `;
const compileHelpers = R.pipe( R.toPairs, R.map(compileHelper), R.join(' ') );

// onMessage : String -> String
const onMessage = functionBody => `
  self.onmessage = function(e) { ${functionBody} }
`;

// postMessage : Function -> String
const postMessage = fn => `
self.postMessage((${fn.toString()})(e.data))
`;
// namespace : String -> * any -> String
const namespace = (env, data) => `
var global = {}; global.${env} = ${JSON.stringify(data)};
`

const originalFunc = R.pipe(R.toString, stripFunctionName);

const compileSrc = __((original, env, data, fn) => onMessage(originalFunc(original) + namespace(env, data) + postMessage(fn)));

export default compileSrc;