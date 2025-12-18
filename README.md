# Webpack loader for GLSL shaders
[![NPM](https://nodei.co/npm/ts-shader-loader.png)](https://npmjs.org/package/ts-shader-loader)

A glsl shader loader for webpack, includes support for nested imports,
allowing for smart code reuse among more complex shader implementations.
The shader is returned as a string.

## Why fork

I had a problem using other webpack shader loaders with typescript. While i was investigating what is the problem,
i forked and tried to make my version work with typescript. Other than support with typescript, it has no other benefits.

## Quick Guide

#### 1. Install
```shell
npm install --save-dev ts-shader-loader
```

#### 2. Add to webpack configuration

```javascript
{
    module: {
        rules: [
            {
                test: /\.(glsl|vs|fs)$/,
                loader: 'ts-shader-loader'
            }
        ]
    }
}
```
#### 3. Declare shared files as modules

Create `glsl.d.ts` file in your project and add the following in to it:

```ts
declare module "*.glsl" {
  const value: string;
  export default value;
}

declare module "*.vs" {
  const value: string;
  export default value;
}

declare module "*.fs" {
  const value: string;
  export default value;
}
```

#### 4. Import shaders

```javascript
import myShader from './myShader.glsl';

console.log(myShader);
```


## Includes

This loader supports `#include "path/to/shader.glsl"` syntax, which you can
use inside your shaders.


### Example

Example project structure:
```
src/
---- ts/
---- ---- main.ts
---- shaders/
---- ---- includes/
---- ---- ---- perlin-noise.glsl
---- ---- fragment.glsl
```

If we `import` `fragment.glsl` shader inside `main.ts`:

```javascript
import shader from '../shaders/fragment.glsl';
```

We can have that shader include other `.glsl` files inline, like so:

```sass
#include "./includes/perlin-noise.glsl";

//#include ./includes/this-wont-be-included";

#include "./includes/the-semicolon-is-optional"
```

> **N.B.** all includes within `.glsl` are relative to the file doing the importing.

Imported files are parsed for `#include` statements as well, so you can nest
imports as deep as you'd like.

Imported files are inserted directly into the source file in place of the
`#include` statement and no special handling or error checking is provided. So,
if you get syntax errors, please first check that shader works as one
contiguous file before raising an issue.

## TODO

+ Deduplicate imports, to prevent code clobbering and conflicts at runtime
