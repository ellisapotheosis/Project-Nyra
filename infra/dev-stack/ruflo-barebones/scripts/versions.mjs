import pkg from '../package.json' with { type: 'json' };
console.log(JSON.stringify(pkg.dependencies, null, 2));
