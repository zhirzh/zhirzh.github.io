---
layout: post
title: Browser history functioning and loopback gotcha
date: 2017-01-27
tags: experiment history tutorial
---

According to MDN,
> The [`History`] interface allows to manipulate the browser *session history*, that is the pages visited in the tab or frame that the current page is loaded in.

But how exactly does the browser keep track of the visited pages?

<!-- preview -->

Without dwelling into technicalities, it is safe to assume that a doubly linked list is being used under the hood.
A doubly linked list (abbreviated as *DLL*) has the following benefits over a singly linked list or a simple array:

* Dynamically add and remove elements (beats arrays)
* Bi-directional movement is easy (beats singly linked list)

---
<br />

## Push

When we visits a new url, a new entry is added to the DLL.
An application can use [`history.pushState()`] to simulate url based navigation.

```js
element.onclick = function handleClick(e) {
  history.pushState(
    state, // tiny session storage state
    title,
    url, // destination URL
  );
};
```

We can travel along the DLL and re-visit the pages.
`history` object has 3 methods for travelling:

* [`history.go()`]
* [`history.back()`]
* [`history.forward()`]

```js
// move relative to the current entry
history.go(1);
history.go(2);
history.go(10);
history.go(-10);
history.go(0);

history.back(); // equivalent to history.go(-1)

history.forward(); // equivalent to history.go(1)
```

---
<br />

## Pop

But these traversal methods must be invoked using JS (example: a button click).
If we use the browser's navigation buttons, we can still intercept the action by listening for the [`popstate`] event.

```js
window.onpopstate = function(e) {
  console.log(document.location, e.state);
};
```

---
<br />

## Branching

Apart from moving back-and-forth, we can also branch *out of* the current list.
If we are on some intermediate entry and navigate to a new URL (not back/forward movement, but redirection), then the subsequent entries will be lost.
And a new branch will emerge, with the previous entries.

---
<br />

## Demo

*Note:* Use the `BACK` and `FORWARD` buttons provided in the demo and **not** the browser's buttons.

<iframe src="/gists/2017-01-30-browser-history-functioning-&-loopback-gotcha/demo.html#/home" frameborder="0" class="demo" sandbox=""></iframe>

---
<br />

## The Gotcha

When working with the history API, it is possible to mess things up - perhaps by not connecting the browser's navigation tools to the app, or by create loopback loops.

*Loop... what?*

Picture this: We make a web app, possibly a PWA, and there's a bug in the routing logic.
*Visiting* the page `/foo` redirects us to some other path, `/bar`.
If we now try to go back to `/foo`... **BAM!**. `/foo` redirects us back to `/bar`.

Or how about this: *Interacting* with the page `/foo`, somehow, redirects us to path `/bar`.
But we don't want to be on `/bar`, and there's a `cancel` or `no thanks` button in the app.

We press the button, and instead of going back to `/foo`, we are redirected to `/foo`.
If we now go `back`... **BAMMMM!**. We leave the new `/foo`, go back to `/bar`, again deny to use the services provided by `/bar` and are redirected to - you guessed it - a new copy of `/foo`.

---

Still with me? Sounds confusing? How 'bout a demo, eh?

In the demo below, try cancelling the login prompt and then going back.
You will find it *IMPOSSIBLE*.

<iframe src="/gists/2017-01-30-browser-history-functioning-&-loopback-gotcha/demo-bug.html#/home" frameborder="0" class="demo" sandbox=""></iframe>

---

This abnormality is located in [lines 56-59] and can easily be fixed.
Instead of using `history.pushState()`, use `history.back()`.
The solution is used [here].

```diff
    function loginRedirect() {
-      var backUrl = location.hash.match(/ret=(.*)/)[1];
-      history.pushState({}, '', backUrl);
+      history.back();
    }
```

<iframe src="/gists/2017-01-30-browser-history-functioning-&-loopback-gotcha/demo-fixed.html#/home" frameborder="0" class="demo" sandbox=""></iframe>

---
<br />

## The End

And that's the end of it.
The problem demonstrated here exists in the production build of an actual product online - organisation kept anonymous for obvious reasons.

If you are interested in the implementations, here's the code:

* [Basic demo]
* [Bug]
* [Bugfix]


[`History`]: https://developer.mozilla.org/en/docs/Web/API/History

[`history.pushState()`]: https://developer.mozilla.org/en/docs/Web/API/History/pushState
[`history.go()`]: https://developer.mozilla.org/en/docs/Web/API/History/go
[`history.back()`]: https://developer.mozilla.org/en/docs/Web/API/History/back
[`history.forward()`]: https://developer.mozilla.org/en/docs/Web/API/History/forward
[`popstate`]: https://developer.mozilla.org/en/docs/Web/Events/popstate

[lines 56-59]: https://github.com/zhirzh/zhirzh.github.io/blob/master/gists/2017-01-30-browser-history-functioning-&-loopback-gotcha/demo-bug.html#L56-L59
[here]: https://github.com/zhirzh/zhirzh.github.io/blob/master/gists/2017-01-30-browser-history-functioning-&-loopback-gotcha/demo-fixed.html#L56-L58

[Basic demo]: https://github.com/zhirzh/zhirzh.github.io/blob/master/gists/2017-01-30-browser-history-functioning-&-loopback-gotcha/demo.html
[Bug]: https://github.com/zhirzh/zhirzh.github.io/blob/master/gists/2017-01-30-browser-history-functioning-&-loopback-gotcha/demo-bug.html
[Bugfix]: https://github.com/zhirzh/zhirzh.github.io/blob/master/gists/2017-01-30-browser-history-functioning-&-loopback-gotcha/demo-fixed.html
