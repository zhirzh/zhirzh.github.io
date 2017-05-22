---
layout: post
title: PWA
date: 2017-05-15
---

With the PWA movement gaining momentum, the number of articles, blog posts, tutorials and demos is also going up.
Most of them revolve around the most basic implementation of ServiceWorkers.
So today, I will focus more on the side of installing and maintaining a ServiceWorker.

<!-- preview -->

## PWA

All websites listen on [PWA.rocks] have one thing in common - the website is *installed* on the machine on the first visit.
The user is never requested the permission to install and is often not made aware of the installation.

In theory, there are three tasks to make a PWA behave like a native app:

1. Install
2. Update
3. Uninstall

In practice, there's a whole lot of things going on.
We'll look at them in separate cases.

### 0. ServiceWorker API charsh-course

It's a good idea to look over the basics every once in a while.

There are the 3 main components of the ServiceWorker API.

1. ServiceWorkerContainer
2. ServiceWorkerRegistration
3. ServiceWorker

Let's look at **ServiceWorker** first.

A ServiceWorker is a JS file that intercepts requests the browser makes - it *controls* the page.
Whether a SW is installed or not can be checked by looking at `navigator.serviceWorker.controller`.

When we call `navigator.serviceWorker.rgister`, we get a Promise that resolves to a `ServiceWorkerRegistration` object.


One dent in this statement is Jake Archibald's [Offline Cookbook].

[Offline Cookbook]: https://jakearchibald.com/2014/offline-cookbook/
[PWA.rocks]: https://pwa.rocks/
