---
layout: post
title: Async in sync
date: 2017-04-05
tags: es6 tutorial
---

For a concurrent language like JS, developers have to deal with a lot of asynchronous workflow.
One of the hardest things to accomplish with asynchronous code is to make it run in serial order (serial, as in, the opposite of parallel).

The default way to go is using callbacks, even if it sometimes leads to the [callback hell].

```js
  foo(function(fooResp) {
    console.log(fooResp);

    bar(fooResp, function(barResp) {
      console.log(barResp);

      buzz(someVar, function(buzzResp, err) {
        // handle response and error
      });
    },

    function(err) {
      // handle error
    });
  });
```

As the language evolves, we get newer syntax and techniques to deal with this problem.

<!-- preview -->

---

## 1. Promise Chaining

Luckily, ES6 brought along the [Promise] object especially for asynchronous computations.

By using Promise, we can change the above into this.

```js
  foo()
    .then(function(fooResp) {
      console.log(fooResp);

      return fooResp;
    })
    .then(bar)
    .then(function(barResp) {
      console.log(barResp);
    })
    .then(function() {
      return buzz(someVar);
    })
    .then(function(buzzResp) {
      // handle response
    })
    .catch(function(err) {
      // handle err
    });
```

---

## 2. Reducing promise factories

If the fetched data requires similar treatment or no treatment at all, this ladder can be further reduced.

```js
  function logger(msg) {
    console.log(msg);
  }

  // array of async functions that return promises
  var allAsyncFunctions = [ foo, bar, buzz ];

  allAsyncFunctions.reduce(function(prevPromise, asyncFunction) {
    return prevPromise
      .then(asyncFunction)
      .then(logger);
  }, Promise.resolve());
```

---

## 3. Using async/await

The real breakthrough came with the [`async`]/[`await`] workflow in ES2017 (ES8).

```js
  async function foo() {
    try {
      var fooResp = await foo();
      console.log(fooResp);

      var barResp = await bar(fooResp);
      console.log(barResp);

      var buzzResp = await buzz(someVar);
      // handle response
    } catch (err) {
      // handle error
    }
  }
```

It is great to have something so useful and so simple for usage.
Since `async/await` is bleeding edge, support is minimal.
When this gains native support, backward compatibility and cross-browser support will be an issue.

That's why we use transpilers to convert our ES5+ code to ES5.

* [babel]
* [webpack]
* [regenerator]

---

## 4. Async To Generator

In a previous post, we looked at how generators can be made to work in ES5.
If we could convert `async/await` code blocks into generators, then we'd have solved the support problem.

Let's give ourselves some async functions to work with.

```js
  function foo() {
    var delay = Math.random() * 1000;
    return new Promise(res =>
      setTimeout(
        () => res(`foo: ${delay.toFixed(2)}`),
        delay
      )
    );
  }

  function bar() {
    var delay = Math.random() * 1000;
    return new Promise(res =>
        setTimeout(
            () => res(`bar: ${delay.toFixed(2)}`),
            delay
          )
      );
  }
```

And here's the `async/await` code:

```js
  async function getData() {
    var fooResp = await foo();
    console.log(fooResp);

    var barResp = await bar();
    console.log(barResp);
  }
```

### async to generator rationale

There are 2 astute observations that we can make:

1. Functions `foo()` and `bar()` return promises that resolve after some delay with the data.
2. Generators implement a "pause, extract, resume" strategy.

First, let's convert getData into a generator and replace the `await` statements with `yield`.

```js
  function* getData() {
    yield foo();
    yield bar();
  }
```

Now we can analyse the behaviour of this generator function's `yield` statements.

```js
  var ret;
  var iter = getData();

  ret = iter.next();

  console.log(ret);
  // {value: Promise, done: false}

  console.log(ret.value);
  // {[[PromiseStatus]]: "pending", [[PromiseValue]]: undefined}

  console.log(ret.value.constructor);
  // Promise
```

As we can see, the promises returned by `foo()` is saved in `ret.value`.
If we wait for it to resolve, we will get the data.

```js
  var ret;
  var iter = getData();

  ret = iter.next();
  ret.value.then((resp) => {
    console.log(resp);
  });
  // foo: 933.14
```

Cool.
Once this resolves, we can safely begin the next yield.

```js
  var ret;
  var iter = getData();

  ret = iter.next();
  ret.value.then((resp) => {
    console.log(resp);

    ret = iter.next();
    ret.value.then((resp) => {
      console.log(resp);

      ret = iter.next();
    });
  });
  // foo: 854.53
  // bar: 32.72
```

If we have multiple `yield` statements, it is better to have a more programmatic approach.

---

### Termination condition

```js
  var ret;
  var iter = getData();

  function next() {
    ret = iter.next();

    ret.value.then((resp) => {
      console.log(resp);

      next();
    });
  }

  next();

  // foo: 929.09
  // bar: 422.78
  // Uncaught (in promise) TypeError: Cannot read property 'then' of undefined
```

We got an error `TypeError: Cannot read property 'then' of undefined`.

What gives?

Lets have a closer look:

```diff
  var ret;
  var iter = getData();

  function next() {
    ret = iter.next();

+   console.log(ret);

    ret.value.then((resp) => {
      console.log(resp);

      next();
    });
  }

  next();

  // {value: Promise, done: false}
  // foo: 164.96

  // {value: Promise, done: false}
  // bar: 512.49

  // Object {value: undefined, done: true}
  // TypeError: Cannot read property 'then' of undefined
```

This makes sense, since when an iterator is "done", it returns an object with value `undefined`.
We need to add a check for that.

```diff
  var ret;
  var iter = getData();

  function next() {
    ret = iter.next();

-   console.log(ret);
+   if (ret.done === true) {
+     return;
+   }

    ret.value.then((resp) => {
      console.log(resp);

      next();
    });
  }

  next();
```

---

### Giving control back to generator

It seems all is working.
Now it's time to wrap the logic in a separate function.

```js
  function async(generator) {
    var ret;
    var iter = generator();

    function next() {
      ret = iter.next();
      if (ret.done === true) {
        return;
      }

      ret.value.then((resp) => {
        console.log(resp);

        next();
      });
    }

    next();
  }
```

There's one thing that still remains.

Usually the data fetched from remote requests is consumed as it is received.
That's why we need serial processing of async requests.
Unfortunately, once a generator has yielded a value, it's gone from the scope.

```js
  function* generator() {
    var x = yield 1;
    console.log('from generator', x);
  }

  var resp
  var iter = generator();

  resp = iter.next();
  console.log(resp);

  resp = iter.next();
  console.log(resp);

  // { done: false, value: 1 }
  // "from generator" undefined
  // { done: true, value: undefined }
```

As you can see, value of `x` is `undefined`.
Once the generator yields something, the value's gone.

Fortunately, generators have a lesser known feature that allows us to counter this problem.
The '.next()' method accepts an optional value that replaces the `yield ...` in the generator.

```diff
  function* generator() {
    var x = yield 1;
    console.log('from generator', x);
  }

  var resp
  var iter = generator();

  resp = iter.next();
  console.log(resp);

- resp = iter.next();
+ resp = iter.next(2);
  console.log(resp);

  // { done: false, value: 1 }
- // "from generator" undefined
+ // "from generator" 2
  // { done: true, value: undefined }
```

We are going to use this to put back the yielded value so that the generator could use it.

```js
  function async(generator) {
    var ret;
    var iter = generator();

    function next(yieldValue) {
      ret = iter.next(yieldValue);
      if (ret.done === true) {
        return;
      }

      ret.value.then((resp) => {
        console.log(resp);

        next(resp);
      });
    }

    next();
  }
```

---

## Putting it all together

Here's the entire code

```js
  function* getData() {
    var fooResp = yield foo();
    console.log(fooResp);

    var barResp = yield bar();
    console.log(barResp);
  }


  function async(generator) {
    var ret;
    var iter = generator();

    function next(yieldValue) {
      ret = iter.next(yieldValue);
      if (ret.done === true) {
        return;
      }

      ret.value.then(next);
    }

    next();
  }

  async(getData);
```

---

## The End

We have looked at 4 techniques for running async code in serial.
Running it in parallel is trivial, especially when `Promise.all()` method is provided for that very reason.

[callback hell]: http://callbackhell.com/
[Promise]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise
[`async`]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function
[`await`]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/await
[babel]: http://babeljs.io/
[webpack]: http://facebook.github.io/regenerator/
[regenerator]: https://webpack.github.io/
