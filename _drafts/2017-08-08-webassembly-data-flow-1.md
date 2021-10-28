---
layout: post
title: WebAssembly data flow - Part 1
date: 2017-08-08
---

WebAssembly support is [just around the corner].
This is a great time to pick up some fundamentals.
In this multi-part series, we'll look at handling data flow to and from JS and C/++ environments.

We can classify the data types as:

* Primitives - `int`, `char`, `float` etc.
* User defined - `class`, `struct`, `enum` etc.

Each of these types can be used as:

* Atomics - `int x`
* Arrays - `int x[]`

The third thing we need to consider is the usage:
* Immediate consumption - function arguments.
* Deferred consumption - local or global state.

To keep things simple, we will only handle primitive atomics in this part.
Primitive arrays are in [part 2].

<!-- preview -->

---

## Setup

### Load `.wasm` files in browser

First, we need a method to load wasm files.

```js
let wasm;

async function loadWebassembly(url, imports) {
  const buffer = await fetch(url).then(res => {
    if (res.ok) {
      return res.arrayBuffer();
    }

    console.error(res);
    throw Error();
  });

  const module = await WebAssembly.compile(buffer);

  const instance = await WebAssembly.instantiate(module, imports);

  wasm = instance.exports;
}
```

Let's test this snippet.
Head over to [WasmFiddle] and copy the following C code, **Build** the module and download the **Wasm** output.

```c
void log(int);

void log123() {
  log(123);
}
```

You will get a `program.wasm` file.
Load it in the browser and run `log123()`.
You should see `123` logged in the console.

<iframe
  height='300'
  scrolling='no'
  title='RZVzaB'
  src='//codepen.io/zhirzh/embed/RZVzaB/?height=275&theme-id=0&default-tab=js&embed-version=2'
  frameborder='no'
  allowtransparency='true'
  allowfullscreen='true'
  style='width: 100%;'
>
  See the Pen
  <a href='https://codepen.io/zhirzh/pen/RZVzaB/'>
    RZVzaB
  </a>
  by Shirsh Zibbu (<a href='https://codepen.io/zhirzh'>@zhirzh</a>)
  on
  <a href='https://codepen.io'>
    CodePen
  </a>.
</iframe>
---

### Compile `.c / .c++` files to `.wasm`

To compile files on the go, you can use [wasmexplorer-wasm-compiler].

```js
// compile.js

const fs = require('fs');

const compile = require('wasmexplorer-wasm-compiler');

const src = __dirname + '/hello world.c';
const dst = __dirname + '/program.wasm';

fs.watchFile(src, () => {
  compile(src, dst);
});

compile(src, dst);
```

---

## Primitive Atomics

With our workbench setup, we can get started.

### Immediate consumption

Transferring primitive atomics for immediate consumption is done by passing arguments to the C function.

```c
// double.c

void _log(int);

void log_double(int x) {
  _log(2 * x);
}
```

In browser

```js
// main.js

loadWebassembly('...', {
  env: {
    _log: console.log
  }
}).then(() => {
  wasm.log_double(123);
});
```

### Deferred consumption

DC implies that the data be stored within C space for later processing.
We can read/write C space atomics by setter/getter functions.

```c
// clamp.c

float lo;
float hi;

// getters
float get_lo() { return lo; }
float get_hi() { return hi; }

// setters
void set_lo(float _lo) { lo = _lo; }
void set_hi(float _hi) { hi = _hi; }

float clamp(float x) {
  if (x < lo) {
    return lo;
  }

  if (x > hi) {
    return hi;
  }

  return x;
}
```

```js
// main.js

loadWebassembly('...')
  .then(() => {
    console.log(wasm.get_lo());   //  0
    console.log(wasm.set_lo(-5)); //  undefined
    console.log(wasm.get_lo());   // -5

    console.log('-'.repeat(10));

    console.log(wasm.get_hi());   // 0
    console.log(wasm.set_hi(5));  // undefined
    console.log(wasm.get_hi());   // 5

    console.log('-'.repeat(10));

    console.log(wasm.clamp(2));   //  2
    console.log(wasm.clamp(20));  //  5
    console.log(wasm.clamp(-5));  // -5
    console.log(wasm.clamp(-6));  // -5
  });
```

---

## The end

You now know how to use handle primitive atomics.
Implementing trivial math equations and expressions can leverage from this.

But real world applications require richer data access and manipulations.
We will look into primitive arrays in the [next part].

[part 2]: {% post_url 2017-08-10-webassembly-data-flow-2 %}
[just around the corner]: http://www.caniuse.com/#feat=wasm
[WasmFiddle]: https://wasdk.github.io/WasmFiddle/
[wasmexplorer-wasm-compiler]: https://www.npmjs.com/package/wasmexplorer-wasm-compiler
[next part]: {% post_url 2017-08-10-webassembly-data-flow-2 %}
