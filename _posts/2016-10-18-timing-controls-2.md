---
layout: post
title: Timing Controls - Part 2
date: 2016-10-18
---

In a [previous post], we looked at some techniques to control the timings of functions (callbacks), triggered when specific events are fired. The techniques are:

1. Debounce
2. Immediate
3. Throttle

In this post, we will see how those techniques can be implemented as a generic API, in the form of [higher order functions].

<!-- preview -->

We will work with the Debounce implementation:

```js
const delta = 1000;
let timeoutID = null;

function foo() {
  console.log('bar');
}

function debouncedFoo() {
  clearTimeout(timeoutID);
  timeoutID = setTimeout(() => {
    foo();
  }, delta);
}

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
}
```

### 2. Functions with variable arity

Arity is the number of arguments the function takes.
If we know how many arguments `foo` requires, the above works just fine.
In case of variable arity function, we can use the [`arguments` object].

We will use [`.apply()`] method because it allows function execution with the arguments being passed as an array or array-like object (ex: `arguments`).

```js
function foo(a, b, c) {
  // ...
}

function debouncedFoo(...args) {
  foo.apply(null, args);
  // ...
}
```

### 3. Higher order function wrappers

Hardcoding timing controls into our callbacks isn't good.
It's better if the callback and the timing can act separately.
We can achieve this by using Higher order functions.

```js
const delta = 1000;

function log(e) {
  console.log(e);
}

function debounce(fn, delta) {
  let timeoutID = null;

  return (...args) => {
    clearTimeout(timeoutID);

    const args = arguments;
    timeoutID = setTimeout(() => {
      fn.apply(null, args);
    }, delta);
  };
}

const debouncedLog = debounce(log, delta);
window.onkeydown = debouncedLog;
```

### 4. Preserve context

Up until now, we can convert any number of functions into debounced versions of themselves, along with passing the arguments.
But there's another problem that arises - context loss.

When calling `.apply()` on a function, we must also pass the proper context for functions that use `this` internally.
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

Finally, we arrive at the Debounce HOF.
Here's a demo ...

<p data-height="421" data-theme-id="0" data-slug-hash="booKGv" data-default-tab="js,result" data-user="zhirzh" data-embed-version="2" data-pen-title="Timing Controls | Debounce " class="codepen">See the Pen <a href="https://codepen.io/zhirzh/pen/booKGv/">Timing Controls | Debounce </a> by Shirsh Zibbu (<a href="https://codepen.io/zhirzh">@zhirzh</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

... And the code implementations:

### Debounce

```js
function debounce(fn, delta, context) {
  let timeoutID = null;

  return (...args) => {
    clearTimeout(timeoutID);

    const args = arguments;
    timeoutID = setTimeout(() => {
      fn.apply(context, args);
    }, delta);
  };
}
```

### Immediate

```js
function immediate(fn, delta, context) {
  let timeoutID = null;
  const safe = true;

  return (...args) => {
    const args = arguments;

    if (safe) {
      fn.call(context, args);
      safe = false;
    }

    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      safe = true;
    }, delta);
  };
}
```

### Throttle

```js
function throttle(fn, delta, context) {
  const safe = true;

  return (...args) => {
    const args = arguments;

    if (safe) {
      fn.call(context, args);

      safe = false;
      setTimeout(() => {
        safe = true;
      }, delta);
    }
  };
}
```

Here's a demo of all three techniques:

---

## The End

In the [final post], we will see an implementation of Throttle that works well with browsers.

<p data-height="296" data-theme-id="0" data-slug-hash="MEEXWL" data-default-tab="js,result" data-user="zhirzh" data-embed-version="2" data-pen-title="Timing Controls" class="codepen">See the Pen <a href="https://codepen.io/zhirzh/pen/MEEXWL/">Timing Controls</a> by Shirsh Zibbu (<a href="https://codepen.io/zhirzh">@zhirzh</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

[`.apply()`]: (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)

[previous post]: {% post_url 2016-10-11-timing-controls %}
[higher order functions]: https://en.wikipedia.org/wiki/Higher-order_function
[`arguments` object]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments
[final post]: {% post_url 2016-10-20-timing-controls-3 %}
