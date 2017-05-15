---
layout: post
title: Flow JavaScript
date: 2017-05-15
---

It's been quite some time since we gained type support in JS with the help of Microsoft's [TypeScript] and Facebook's [Flow] (or FlowType).

Microsoft describes TypeScript as

> ... a typed superset of JavaScript that compiles to plain JavaScript.

Here's what Facebook has to say for Flow

> Flow is a static type checker for JavaScript.

In other words, TypeScript is a language in itself, whereas Flow is a tool that extends JS as a strongly typed language.
There are a number of tutorials on how to integrate Flow into an existing project, most notably React projects.
But Flow could also be used as a language.

And that's what I'll be doing here - teach Flow based strictly typed JS (FJS in short).

<!-- preview -->

Here's the *syllabus*:

* Primitive Datatypes

---

# Setup

Before we get to the real thing, we need to setup our working environment.

You can run [this script] and skip the rest of this section.

You might be knowing that Flow works by adding [type annotations] to the plain JS code.
This means that our code is no longer valid JavaScript and will no longer run.

To solve this, Flow suggests a minimal workflow.

1. Write code with Flow type annotations
2. Check for bugs using Flow
3. Remove Flow type annotations to get valid JS code
4. Profit!

Now we'll setup our "pipeline"

```sh
// setup our directories

mkdir FlowJS
cd FlowJS

mkdir src
mkdir build

touch src/index.js


// install required packages

npm init -y

npm install --save-dev \
  babel-cli \
  babel-preset-flow \
  flow-bin
```

Once we have installed the required packages, we can now load the required config and NPM scripts in `package.json`.

```diff
 {
   "name": "FlowJS",
   "version": "1.0.0",
   "description": "",
   "main": "index.js",
   "scripts": {
-    "test": "echo \"Error: no test specified\" && exit 1"
+    "build": "babel src/ -d build/",
+    "flow": "flow"
   },
   "keywords": [],
   "author": "",
   "license": "ISC",
   "devDependencies": {
     "babel-cli": "^6.24.1",
     "babel-preset-flow": "^6.23.0",
     "flow-bin": "^0.46.0"
   },
+  "babel": {
+    "presets": ["flow"]
+  }
 }
```

Before we could run Flow, we need `.flowconfig` file.
We generate is using `npm run flow init`.

Next, we need to configure flow.
We use the `.flowconfig` file to tell Flow to ignore `node_modules` and `build`.

```diff
 [ignore]
+.*/node_modules
+.*/build

 [include]

 [libs]

 [options]
```

Now we can test if everything works.

```sh
  # check files visible to Flow
  npm run flow ls
  # /path/to/FlowJS/src/index.js
  # /path/to/FlowJS/package.json

  # check if flow works
  npm run flow
  # No errors!

  # check if Babel is working
  npm run build
  src/index.js -> build/index.js
```

---

# Primitive Datatypes

Working with primitives is pretty straightforward.
The latest ECMAScript standard defines seven data types:

1. Number
2. String
3. Boolean
4. Null
5. Undefined
6. Object
7. Symbol (not supported)

We can use `var`, `let` and `const` to declare variables.
But we'll avoid using `var` in favour of the other two.

```js
  // declare
  var a: number;
  let b: string;

  // initialise (by assignment)
  a = 123;
  b = 'hello world;
  
  // declare and initialise
  var c: boolean = true;
  let d: number = 1 + 2 + 3;
  const e: boolean = !!(0);
```

Any kind of type mismatch will cause Flow to throw an error.

```js
  const a: number = '123';
  const b: string = true;
  const c: boolean = 1;
```
```
src/index.js:3
  3:  const a: number = '123';
                        ^^^^^ string. This type is incompatible with
  3:  const a: number = '123';
               ^^^^^^ number

src/index.js:4
  4:  const b: string = true;
                        ^^^^ boolean. This type is incompatible with
  4:  const b: string = true;
               ^^^^^^ string

src/index.js:5
  5:  const c: boolean = 1;
                         ^ number. This type is incompatible with
  5:  const c: boolean = 1;
               ^^^^^^^ boolean


Found 3 errors
```

Sometimes, it is not possible to determine data type until runtime.
For this purpose, Flow allows to provide a group of possible types.

```js
  const chance: boolean = Math.random() < 0.5;
  
  let output: number | string;
  if (chance) {
    output = 'hello world';
  } else {
    output = 123;
  }
```

For more complex scenarios, we can use the `mixed` type.

```js
  const chance: number = Math.random();
  
  let output: mixed;
  if (chance < 0.3) {
    output = 'hello world';
  } else if (chance < 0.6) {
    output = true;
  } else {
    output = 123;
  }
```



[TypeScript]: https://www.typescriptlang.org/
[Flow]: https://flow.org/
[this script]: https://gist.github.com/zhirzh/09ab0286ad16e3f6a5876a1f252c2c99
[type annotations]: https://flow.org/en/docs/types/
