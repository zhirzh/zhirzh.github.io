---
layout: post
title: Timing Controls
date: 2016-10-11
tags: tutorial timing-controls
---

As you may know, JavaScript follows the Event-driven programming paradigm.
What this means that *some actions* can activate *some reactions*, and these reactions are activated only when specific actions take place.
We call these actions `events`, and reactions `callbacks`.
A continuous flow of events is called an `event stream`.

The speed at which these *actions* occur is out of our hand.
But we can control when and how to activate the proper *reactions*.
There are some techniques that provide us precise control.

1. Throttle
2. Debounce
3. Immediate

<!-- preview -->

---

## Throttle
In modern browsers, a frame rate of 60fps is the target for smooth performance, giving us a time budget of 16.7ms for all the updates needed in response to some event.
Once can deduce that if `n` events are occurring per second and callback execution takes `t` seconds time, for smooth functioning,

```
1 / n >= t
```

If `t` is measured in milliseconds

```
1000 / n >= t
```

If you have ever worked with `mousemove` event, you would know that the number of `mousemove` events generated can go well over 60 per second.
And if our callback needs more than 16.7ms, things start to get choppy.

```js
var then = 0;

function log() {
  var now = Date.now();
  if (1000 / (now - then) > 60) {
    console.log('It\'s over 9000!!!');
  }
  then = now;
}

window.onmousemove = log;
```

### Implementation

**Throttle** allows us to limit the number of reactions we activate.
We can limit the number of callbacks made per second.
Conversely, we can tell how much time to wait before activating the next callback;

```js
var delta = 1000;
var then = 0;

function log() {
  console.log('foo');
}

function throttledLog() {
  var now = Date.now();
  if (now - then >= delta) {
    log();

    then = now;
  }
};

window.onmousemove = throttledLog;
```

We can replace `delta` with `fps` and work out different code.

```js
var fps = 60;
...
function throttledLog() {
  var now = Date.now();
  if (1000 / (now - then) <= fps) {
    log();

    then = now;
  }
};

window.onmousemove = throttledLog;
```

We can also achieve the same result by using `setTimeout`.
But instead of checking for time difference, we check for state change.

Initially, we say that it is safe to activate the callback.
Once done, it is only safe to activate it again after `delta` time.

```js
var delta = 1000;
var safe = true;

function log() {
  console.log('foo');
}

function throttledLog() {
  if (safe) {
    log();

    safe = false;
    setTimeout(function() {
      safe = true;
    }, delta);
  }
};

window.onmousemove = throttledLog;
```

---

## Debounce

The term *de-bounce* comes form the domain of electronics, where input signal from a manual switch is fed into a digital circuit.
In electronics, when you press a physical button once, it is possible that your circuit reads it as multiple presses, because of physical properties of the button (metal contacts, spring, wear to pieces etc).

To **debounce** means to take all those fluctuating signals and treating them as one.

### Example

A simple example is already present in JS: `keydown` vs `keyup`.
Suppose you are working on a project and it is required to type something in.
But you want one character per keystroke.
When typing, if you long press a key, `keydown` event will keep firing, but `keyup` event will only fire once the key is lifted up.

```js
window.onkeyup = function() {
  console.log('onkeyup');
}

window.onkeydown = function() {
  console.log('onkeydown');
}
```

This difference in behaviour is useful to determine whether the input has finished or not.
In the example scenario, it is the `keyup` event that you'd use.
In a manner, we can say that keydown is the raw input and keyup is *debounced* input.

### Implementation

When an event occurs, we don't activate the callback right away.
Instead, we wait for a certain amount of time and check if the same event occurs again.
If it does, then we reset the timer and wait, again.
If the same event doesn't happen in the duration of out waiting period, we activate the callback.

```js
var delta = 1000;
var timeoutID = null;

function log() {
  console.log('foo');
}

function debouncedLog() {
  clearTimeout(timeoutID);  // reset timer
  timeoutID = setTimeout(function() {
    // wait for some time
    // and check if event happens again
    log();
  }, delta);
};

window.onkeydown = debouncedLog;
```

---

## Immediate

Immediate is the exact of Debounce.
Rathen than waiting for consequent events to fire and then activate callback, **Immediate** activates the callback first and then waits for the consequent events to fire during a period of time.

### Implementation

Just like in case of Throttle, we need a state variable to check whether we should activate our callback or not.
We didn't need one in Debounce, because `timeoutID` was managing that part implicitly.

```js
var delta = 1000;
var timeoutID = null;
var safe = true;

function log() {
  console.log('foo');
}

function immediatedLog() {
  if (safe) {
    log();
    safe = false;
  }

  clearTimeout(timeoutID);
  timeoutID = setTimeout(function() {
    safe = true;
  }, delta);
};

window.onkeydown = immediatedLog;
```

---

## The End

In this post, we have explored the most common techniques used as timing functions.
Although this post was long, it still lacks a solid demo.

In the [next part], we will improve the code to have a more API-ish interface and look at the problems that might arise with these simple implementaions.

[next part]: {% post_url 2016-10-18-timing-controls-2 %} "Timing Controls"
