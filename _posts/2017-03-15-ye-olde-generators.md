---
layout: post
title: Ye Olde Generators
date: 2017-03-15
---

Generators are one of the features that were added to the language's core in recent times.
And people really like generators (though not more than the spread operator).

But just like the new `class`, generators aren't something that didn't exist before.
Sure, the syntax didn't, but even in the *ye olde* days of ES3, writing generators was possible.

<!-- preview -->

## Generator

Here's what [MDN] has to say about generators.
>Generators are functions which can be exited and later re-entered.
>
>Their context (variable bindings) will be saved across<br/>re-entrances.

Put simply, a "generator" is a function that:
1. can be paused and resumed on need-basis
2. preserves variables in its scope

We know that in JS, variables have always been function scoped.
This means that we can use a closure for preserving scope.
And this takes care of the second requirement.

Now onto the first one.
Generators have a `.next()` method that "pauses" the function's execution and returns (yields) a value.
we need to find a way to mimic this "pause and yield" behaviour.

Let's have a look at an example:

```js
  function * foo() {
    yield 1;
    yield 2;
    yield 3;
  }

  var iter = foo();

  console.log(iter.next()); // { value: 1, done: false }
  console.log(iter.next()); // { value: 2, done: false }
  console.log(iter.next()); // { value: 3, done: false }

  console.log(iter.next()); // { value: undefined, done: true }
```

If we overlook the fact that `foo` is a generator function and `iter` is an iterator, the code behaves as if `iter` is just an object returned `foo`.
This object has a `.next()` method that returns an object of a very specific shape.

```js
  function foo() {
    // ...

    return {
      // ...
      next: function next() {
        return {
          value, // decided by some logic
          done,  // decided by some logic
        };
      },
    };
  }

  var iter = foo();

  console.log(iter.next()); // { value: 1, done: false }
  console.log(iter.next()); // { value: 2, done: false }
  console.log(iter.next()); // { value: 3, done: false }

  console.log(iter.next()); // { value: undefined, done: true }
```
If we look at it this way, any function returned by a closure **is a generator**.

---

## Simple generator

Below is the code for a simple generator implementation.

`generatorFactory()` is as a factory and returns a function that acts as the generator.

Once the termination condition is reached, the generator will return (`yield`) an object with its `done` property set to `true`.

```js
  function generator() {
    var count = 0;

    function iter() {
      if (count === 10) {
        return {
          value: undefined,
          done: true,
        };
      }

      count++;

      return {
        value: count,
        done: false,
      };
    }

    return iter;
  }


  // test
  var iter = generator();

  console.log(iter()); // { value: 1, done: false }
  console.log(iter()); // { value: 2, done: false }

  var foo = iter();
  while (foo.done === false) {
    console.log(foo.value);
    foo = iter();
  }
  // 3
  // 4
  // 5
  // 6
  // 7
  // 8
  // 9
  // 10

  console.log(iter()); // { value: undefined, done: true }
  console.log(iter()); // { value: undefined, done: true }
```

Now that we have a starting point, let's upgrade this simple factory.

---

### Add iteration

Running a `for` loop is A-OK, but real generators support the [iterator protocol].

Since everything in JS is an object, including functions, we can add the `Symbol.iterator` property to our generator.

Now we can use `for...of` for looping over the yielded values.

*Note: The explicitly looping approach (`while`, `for`, etc.) are still valid.*

```diff
  function generator() {
    var count = 0;

    function iter() {
      if (count === 10) {
        return {
          value: undefined,
          done: true,
        };
      }

      count++;

      return {
        value: count,
        done: false,
      };
    }

+   generator[Symbol.iterator] = function() {
+     return {
+       next: generator,
+     };
+   }

    return iter;
  }


  // test
  var iter = generator();

  console.log(iter()); // { value: 1, done: false }
  console.log(iter()); // { value: 2, done: false }

- var foo = generator();
- while (foo.done === false) {
-   console.log(foo.value);
-   foo = generator();
- }
+ for (var i of generator) {
+   console.log(i);
+ }
  // 3
  // 4
  // 5
  // 6
  // 7
  // 8
  // 9
  // 10

  console.log(iter()); // { value: undefined, done: true }
  console.log(iter()); // { value: undefined, done: true }
```

---

### Remove ambiguity

If you ask me, `generator()` is a pretty ambiguous for a generator.
It is better if we implement a `.next()` method.

We will add a property `.next` and set its value to the generator function and replace the ambiguous `generator()` calls with `generator.next()`.

```diff
  function generator() {
    var count = 0;

    function iter() {
      if (count === 10) {
        return {
          value: undefined,
          done: true,
        };
      }

      count++;

      return {
        value: count,
        done: false,
      };
    }

+   generator.next = generator;
    iter[Symbol.iterator] = function() {
-     return {
-       next: generator,
-     };
+     return this; // `this` === `generator`
    }

    return iter;
  }


  // test
  var iter = generator();

  console.log(iter.next()); // { value: 1, done: false }
  console.log(iter.next()); // { value: 2, done: false }

  for (var i of iter) {
    console.log(i);
  }
  // 3
  // 4
  // 5
  // 6
  // 7
  // 8
  // 9
  // 10

  console.log(iter.next()); // { value: undefined, done: true }
  console.log(iter.next()); // { value: undefined, done: true }
```

---

### Refactor

Let's have a closer look at our generator function being returned.

We never call invoke `generator()` directly.
We and the iterator protocol, both invoke the `.next()` method, which in turn invokes the function referenced by `this` (i.e., `generator`).

If so, we can easily move the function's logic into `.next()`.
This essentially takes away the "function"ality of the generator function being returned.
So let's replace it with a plain old JS object.

We do that and this is what we'll get.

```js
  function generator() {
    var count = 0;

    var iter = {
      next: function next() {
        if (count === 10) {
          return {
            value: undefined,
            done: true,
          };
        }

        count++;

        return {
          value: count,
          done: false,
        };
      },

      [Symbol.iterator]: function() {
        return this;
      },
    };

    return  iter;
  }
```

---

## Filling the gaps

Even though this is a *simple* generator, there's a ton of things missing:

* support for return statement
* error handling through `.throw()`
* premature termination with `.return(val?)`
* adding re-yield by passing parameter to `.next(val?)`

But most importantly, what our approach lacks is scalability.
Converting one generator code into its ES5 counterpart is easy.
But doing so for every generator code block will be tedious.
It would be great if we had a generic way of doing this.

> ask and it is given

I guess some folks at facebook had the same thought and they got started on it quite some time ago.

They have created the [regenerator] module.
To a large extent, the module does exactly what was described here, but in a different manner.

For starters, they use `switch` to represent blocks of code within the generator body.
The implementation looks similar to the `label/goto` mechanism.
Regenerator supports many things out of the box and its support is growing.

Please go checkout the project and try out their "sandbox", where you can fiddle with different generator structures and see how regenerator would convert them.

## The End

In the end I would say that generators are a really powerful pattern to have in a language, especially one which is concurrent (not parallel) like JS.

It's a good thing to have a native implementation, since in all likelihood, in some edge-case scenario, the native might outperform the generic approaches I mentioned.
Here's what the new generator syntax approach will look like:

```js
  function * generator() {
    var count = 0;

    while (count < 10) {
      count++;

      yield count;
    }
  }
```

PS: If you want to test the old way of generators, here's [a codepen just for you].

[MDN]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/function*#Description
[iterator protocol]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol
[plain old JS object]: https://en.wikipedia.org/wiki/Plain_old_Java_object
[regenerator]: https://facebook.github.io/regenerator/
[a codepen just for you]: https://codepen.io/zhirzh/pen/XRRYLz?editors=0012
