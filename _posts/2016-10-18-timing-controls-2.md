---
layout: post
title: Timing Controls - Part 2
date: 2016-10-18
tags: experiment timing-controls
---

In a [previous post], we looked at some techniques to control the timings of functions (callbacks), triggered when specific events are fired. The techniques are:

1. Debounce
2. Immediate
3. Throttle

In this post, we will see how those techniques can be implemented as a generic API, in the form of [higher order functions].

<!-- preview -->

We will work with the Debounce implementation:

```js
var delta = 1000;
var timeoutID = null;

function foo() {
  console.log('bar');
}

function debouncedFoo() {
  clearTimeout(timeoutID);
  timeoutID = setTimeout(function() {
    foo();
  }, delta);
};

window.onkeydown = debouncedFoo;
```

There are few problems with this implementation.

### 1. Passing arguments

First of all, what if `foo` expects some arguments?
We need to provide those arguments on call.
This problem can be resolved by adding parameters to `debouncedFoo`.

```js
function foo(a, b, c) {
  // ...
}

function debouncedFoo(x, y, z) {
  // ...
    foo(x, y, z);
  // ...
};
```

### 2. Functions with unknown arity

Arity is the number of arguments the function takes.
If we know how many arguments `foo` requires, the above works just fine.
In case of unknown arity function, we can use the [`arguments` object].

We will use [`.apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply) method because it allows function execution with the arguments being passed as an array or array-like object (ex: `arguments`).

```js
function foo(a, b, c) {
  // ...
}

function debouncedFoo(arguments) {
  var args = arguments;
  // ...
    foo.apply(null, args);
  // ...
};
```

### 3. Multiple debounced functions

Now, let's move on to the next problem - production.
How many debounced functions do we need? And are we going to hardcode them all?

A better approach is to use Higher-order functions.
There are a tons of resources on HOFs, and I suggest to have a good read on the topic.
In the simplest of terms, HOFs take in a function and return a function.

```js
var delta = 1000;

function log(e) {
  console.log(e);
}

function debounce(fn, delta) {
  var timeoutID = null;

  return function() {
    clearTimeout(timeoutID);

    var args = arguments;
    timeoutID = setTimeout(function() {
      fn.apply(null, args);
    }, delta);
  };
}

var debouncedLog = debounce(log, delta);
window.onkeydown = debouncedLog;
```

### 4. Prevent context loss

Good, good.
Up until now, we can convert any number of functions into debounced versions of themselves, along with passing the arguments.
But there's another problem that arises - context loss.

Since we are using `.apply` method of a function, we are providing the context (a.k.a. the `this` variable) for function invocation.
This is a problem for any function that depends on `this` internally.

To resolve this problem, all we need is the proper context of the function being debounced.
But we can't extract the context from the function itself.
Therefore, it must be provided externally.

```js
// ...

function debounce(fn, delta, context) {
  // ...
      fn.apply(context, args);
  // ...
}
```

---

## Conclusion
Finally, what arrive at the this code for Debounce.
You can try it
<a href="https://jsfiddle.net/zhirzh/3bbmxu8h/2">here</a>
and
<a href="https://jsfiddle.net/zhirzh/4o88jmbq/3">here</a>.

### Debounce

```js
function debounce(fn, delta, context) {
  var timeoutID = null;

  return function() {
    clearTimeout(timeoutID);

    var args = arguments;
    timeoutID = setTimeout(function() {
      fn.apply(context, args);
    }, delta);
  };
}
```

And here are the rest of the techniques:

### Immediate

```js
function immediate(fn, delta, context) {
  var timeoutID = null;
  var safe = true;

  return function() {
    var args = arguments;

    if (safe) {
      fn.call(context, args);
      safe = false;
    }

    clearTimeout(timeoutID);
    timeoutID = setTimeout(function() {
      safe = true;
    }, delta);
  };
}
```

### Throttle

```js
function throttle(fn, delta, context) {
  var safe = true;

  return function() {
    var args = arguments;

    if (safe) {
      fn.call(context, args);

      safe = false;
      setTimeout(function() {
        safe = true;
      }, delta);
    }
  };
}
```

Here's a [demo] of all three techniques.

---

## The End

In the final post, we will see an implementation of Throttle that works well with browsers.

[previous post]: {% post_url 2016-10-11-timing-controls %} "Timing Controls"
[higher order functions]: https://en.wikipedia.org/wiki/Higher-order_function
[`arguments` object]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments
[demo]: https://jsfiddle.net/zhirzh/4oac34m0
