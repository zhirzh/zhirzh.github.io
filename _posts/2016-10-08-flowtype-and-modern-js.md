---
layout: post
title: Flowtype and modern JS
date: 2016-10-08
---

As we all know, JavaScript is *loose typed* - variables are declared without a type.
And like everything, not having explicitly mentioned data types had its pros and cons.

One of the advantages is that the development process is much smoother, as JS is much more tolerant towards type mismatches.
But that can also be seen as a disadvantage.

<!-- preview -->

### The Problem

Let's work out an example.
Suppose there is a function that must only be passed boolean arguments (`true` and `false`), we need to manually check if the arguments are booleans and were not coerced into.

```js
var foo = true;
console.log(typeof foo);              // boolean
console.log(foo.constructor);         // Boolean
console.log(foo instanceof Boolean);  // false

var bar = new Boolean(true);
console.log(typeof bar);              // object
console.log(bar.constructor);         // Boolean
console.log(bar instanceof Boolean);  // true
```

As we can see, we need to check if the passed argument is either a primitive boolean or an instance of class Boolean.
Now, imagine doing this over and again, for all the arguments, in all the functions, of all the JS code that you have ever written or will ever write.

This is the heart of the problem - type safety.
We are lucky that in most scenarios, there isn't a need to do this.
But in larger, more complex softwares, type safety is a must.

### The Solution

Solution is pretty simple - make JS a strongly typed language.
But that would require rewriting the whole JS ecosystem, and no one in their right minds would want to do that.

Another approach can be to add type-checks on top of existing codebase.
This is much less invasive and preserves legacy code.
We may see such inclusions in JS in the far future, but not today.

Out best bet would be a module that, somehow, checks our code for us.
We already have linters for maintaining code style and unit tests for testing code itself.
Why not something for type safety?

---

## Flowtype

[Flowtype] (or Flow) by Facebook is a static type checker for JS.
Flow is a "smart" type checker.
And when I say smart, I mean really clever.

Here's a flow example:

```js
// @flow
var foo:string = 'hello world';
foo = 123;
```

In the example above, flow will point out the obvious error of assigning a `number` value to a `string` type variable.

But that's not all.
Flow recognises JS idioms and very dynamic code.
And even without type annotations, it can figure out some problems in our code.

```js
// @flow
function foo(x) {
  return x * 10;
}
foo('Hello, world!');
```

Here, flow understands that the operation performed and the data type provided are incompatible and so, will produce error.

You can read more about flow, and its syntax in the [flow docs].

---

## Modern JS

By the word "Modern", I am pointing towards the JS ecosystem in 2016.

A few key players are ES5+, babel, webpack, react.
And to make flow work in unison can be a real challenge.
One can easily set up a webpack-babel based workflow, thanks to all the resources and reading material available online.

To add flow to the mix, I have written a webpack plugin that will do the heavy lifting for us - [flow-babel-webpack-plugin].
As you can judge by the name, it is meant to glue together flow, babel and webpack.

### Usage

#### 1.
Install dependencies

```sh
# Install FBWP
npm i -D flow-babel-webpack-plugin
```

#### 2.
 Setup babel and flow
```sh
# setup .flowconfig
./node_modules/.bin/flow init  or flow init

# .babelrc file
{
  ...
  "plugins" : [
    ...
    "transform-flow-comments"
  ]
}
```

#### 3.
Setup webpack config

```js
// webpack.config.js file

var FlowBabelWebpackPlugin = require('flow-babel-webpack-plugin');

module.exports = {
  ...
  plugins: [
    ...
    new FlowBabelWebpackPlugin(),
  ],
}
```

And that's it!

Now we can start adding flow annotations to our code and the next time we start webpack, BOOM! - type errors in the pretty red colour we all love/hate.

![]({{site.baseurl}}/img/demo.png)

---

## The End

Type checking is really useful in large softwares, and Flow is a remarkable tool that allows type checks.
Being able to us it with babel and webpack is a win-win!

Please do try [flow-babel-webpack-plugin] and let me know if you any requests regarding the plugin.
If you find any bugs, you know [where][issues] to go.

[Flowtype]: https://flowtype.org
[flow docs]: https://flowtype.org/docs
[flow-babel-webpack-plugin]: https://github.com/zhirzh/flow-babel-webpack-plugin
[issues]: https://github.com/zhirzh/flow-babel-webpack-plugin/issues
