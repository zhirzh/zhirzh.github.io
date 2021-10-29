---
layout: post
title: Timing Controls
date: 2016-10-11
---

JavaScript follows the Event-driven programming paradigm.
This means that _actions_ can activate _reactions_.
We call these actions `events`, and reactions `callbacks`.
A continuous flow of events is called an `event stream`.

The speed at which these _actions_ occur is out of our hand.
But we can control when and how to activate the proper _reactions_.
There are some techniques that provide us precise control.

1. Throttle
2. Debounce
3. Immediate

<!-- preview -->

---

## Throttle

In modern browsers, a frame rate of 60fps is the target for smooth performance.
This gives us a time budget of 16.7ms for the processing needed to respond to some event.

If you have ever worked with `mousemove` event, you would know that this event is triggered multiple times per second.
And if our callback needs more than 16.7ms, things start to get choppy.

Throttle limits the number of reactions activated.
We control how much time to wait before activating the next callback.

### Implementation

```js
const delta = 1000; // wait 1000ms before next callback
let then = 0;

function log() {
  console.log('foo');
}

function throttledLog() {
  const now = Date.now();
  if (now - then >= delta) {
    log();

    then = now;
  }
}

window.onmousemove = throttledLog;
```

We can replace `delta` with `fps` and work out different code.

```js
const fps = 60;

function throttledLog() {
  const now = Date.now();
  if (1000 / (now - then) <= fps) {
    log();

    then = now;
  }
}
```

We can also achieve the same result by using `setTimeout()`.
Instead of checking for time difference, we check for state change.

Initially, we say that it is safe to activate the callback.
Once done, it is only safe to activate it again after `delta` time.

```js
const delta = 1000; // wait 1000ms before next callback
let safe = true;

function log() {
  console.log('foo');
}

function throttledLog() {
  if (safe) {
    log();

    safe = false;
    setTimeout(() => {
      safe = true;
    }, delta);
  }
}

window.onmousemove = throttledLog;
```

---

## Debounce

The term _de-bounce_ comes form signal processing in electronics, where signal from a mechanical input is fed into a digital circuit.
Pressing down on a mechanical button might produce multiple signals due of physical properties of the button (metal contacts, springs, mechanical wear etc).

Debouncing means we group together the signals triggered within some small time range and consider only the last signal as the true signal.

### Implementation

Debouncing is all about delaying the callback until the last event in a group occurs.
We can use `setTimeout()` to delay the callback.

```js
const delta = 1000; // wait 1000ms before next callback
let timeoutID = null;

function log() {
  console.log('foo');
}

function debouncedLog() {
  clearTimeout(timeoutID); // reset timer
  timeoutID = setTimeout(() => {
    // wait for some time
    // and check if event happens again
    log();
  }, delta);
}

window.onkeydown = debouncedLog;
```

---

## Immediate

Immediate is the opposite of Debounce.
Instead of triggering the callback at the last event of the group, Immediate activates the callback at the first.

### Implementation

Just like with Throttle, we need a state variable to check whether we should activate our callback or not.
We also use `setTimeout()` to update the state variable.

```js
const delta = 1000; // wait 1000ms before next callback
let timeoutID = null;
let safe = true;

function log() {
  console.log('foo');
}

function immediatedLog() {
  if (safe) {
    log();
    safe = false;
  }

  clearTimeout(timeoutID);
  timeoutID = setTimeout(() => {
    safe = true;
  }, delta);
}

window.onkeydown = immediatedLog;
```

---

## The End

In this post, we have explored the most common techniques used as timing functions.

In the [next part], we will improve the code into higher order functions and look at the problems that might arise with these simple implementations.

[next part]: {% post_url 2016-10-18-timing-controls-2 %} "Timing Controls"
