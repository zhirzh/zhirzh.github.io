---
layout: post
title: Timing Controls - Part 3
date: 2016-10-20
---

*This is small one.*

In a [previous post], we looked at API style implementations of the techniques discussed in [another post].

And in this post, we'll look at [`requestAnimationFrame`].

<!-- preview -->

We use `requestAnimationFrame` when we have some repaint task - something that will change content on screen.
But that's just the general way of working things out.

```js
function render() {
  // do something
  window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
```

---

## HighResTimeStamp

The problem with `requestAnimationFrame` is that it doesn't enforce a callback speed - it only defines the upper limit of it.
As MDN puts it:
> The number of callbacks is usually 60 times per second, but will generally match the display refresh rate in most web browsers as per W3C recommendation.

The solution is easy.
`requestAnimationFrame` passes a single argument to the callback function.
It is a [high resolution timestamp] in milliseconds.

Thus, we can use `requestAnimationFrame` as an alternative to `setTimeout` for our Throttle implementation.

```js
function throttle(fn, delta, context) {
  return function() {
    var args = arguments;
    var then = 0;

    function repeat(now) {
      requestAnimationFrame(repeat);
      if (now - then >= delta) {
        then = now;
        fn.call(context, args);
      }
    }

    requestAnimationFrame(repeat);
  }
}
```

And done.
Throttle with `requestAnimationFrame`.

The code is available [here].

[previous post]: {% post_url 2016-10-18-timing-controls-2 %} "Timing Controls - Part 2"
[another post]: {% post_url 2016-10-11-timing-controls %} "Timing Controls"
[`requestAnimationFrame`]: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
[high resolution timestamp]: https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp
[here]: https://codepen.io/zhirzh/pen/gWWKeE?editors=0011
