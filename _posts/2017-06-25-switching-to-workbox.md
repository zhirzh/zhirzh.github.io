---
layout: post
title: Switching to Workbox
date: 2017-06-25
tags: service-worker workbox tutorial
---

Writing a good, healthy, bug-free service-worker script and its installer script is a pretty hefty task.
There are multiple pitfalls and they aren't always visible before time.
The worst part is, if something goes wrong, things can get out of hand pretty quickly.

Just watch this talk by Alexander Pope - [ServiceWorkers Outbreak].

<!-- preview -->

## ServiceWorker libraries
In 2015, Google launched [`sw-precache`] and [`sw-toolbox`] for making our lives easier.

### sw-precache

At first glance, it might appear to be a tool to simply cache static assets on page load.
Turns out, it is a *one-size-fits-all* solution for writing service-workers.

With a vast array of options to use, one can write a service-worker in a simple and declarative manner, without having to worry about implementations.

```
cacheId                       [String]
clientsClaim                  [Boolean]
directoryIndex                [String]
dontCacheBustUrlsMatching     [Regex]
dynamicUrlToDependencies      [Object<String, Buffer, Array<String>>]
handleFetch                   [boolean]
ignoreUrlParametersMatching   [Array<Regex>]
importScripts                 [Array<String>]
logger                        [function]
maximumFileSizeToCacheInBytes [Number]
navigateFallback              [String]
navigateFallbackWhitelist     [Array<RegExp>]
replacePrefix                 [String]
runtimeCaching                [Array<Object>]
skipWaiting                   [Boolean]
staticFileGlobs               [Array<String>]
stripPrefix                   [String]
stripPrefixMulti              [Object]
templateFilePath              [String]
verbose                       [boolean]
```

---

### sw-toolbox

Maybe you have your own service-worker script.
Maybe you don't need all the pre-caching features and all you care about is runtime caching (caching certain network requests)

This is where `sw-toolbox` comes in.
It is a much smaller and lightweight module that deals specifically with runtime caching.

Using `sw-toolbox` is also pretty easy.
The whole process can be broken into parts:

1. Add `sw-toolbox` to your `sw.js` with [`importScripts()`].
2. Setup routes and their handlers.

Example:

```
toolbox.router.get(
  ':foo/index.html',

  function(request, values) {
    return new Response('handled URL: ' + request.url);
  }
);
```

---

# Moving towards a better future

Google talks about building a new, more modular tooling library [here].

> In parallel, we are working on the next generation of Service Worker tooling over in [Workbox].
> This new work is more modular and will enable a number of libraries with additional capabilities to be built.

Workbox is a new project that aims to modularise the whole service-worker build process, adding background sync and offline analytics.
Workbox is also backwards compatible with `sw-precache` and `sw-toolbox` and adopts their options.

Here's a list of options that I've worked out from the source.

| sw-precache                                            | workbox                                             |
| ------------------------------------------------------ | --------------------------------------------------- |
| cacheId                                                | cacheId                                             |
| clientsClaim                                           | clientsClaim                                        |
| directoryIndex                                         | directoryIndex                                      |
| dontCacheBustUrlsMatching                              | dontCacheBustUrlsMatching                           |
| dynamicUrlToDependencies                               | dynamicUrlToDependencies <br> **templatedUrls**     |
| handleFetch                                            | handleFetch                                         |
| ignoreUrlParametersMatching                            | ignoreUrlParametersMatching                         |
| maximumFileSizeToCacheInBytes                          | maximumFileSizeToCacheInBytes                       |
| navigateFallback                                       | navigateFallback                                    |
| navigateFallbackWhitelist                              | navigateFallbackWhitelist                           |
| runtimeCaching                                         | runtimeCaching                                      |
| skipWaiting                                            | skipWaiting                                         |
| staticFileGlobs                                        | staticFileGlobs <br> **globPatterns**               |
|importScripts                                           |                                                     |
|logger                                                  |                                                     |
|templateFilePath                                        |                                                     |
|verbose                                                 |                                                     |
|                                                        | globDirectory                                       |
|                                                        | globIgnores                                         |
|                                                        | swDest                                              |
|                                                        | swSrc                                               |
| *replacePrefix <br> stripPrefix <br> stripPrefixMulti* | *modifyUrlPrefix*                                   |
| ------------------------------------------------------ | --------------------------------------------------- |

## Usage

How to use Workbox, you say?

Workbox's [official website] has all the documentation and loads of examples to help get started.
Just to help you out, here are some common links:

* [webpack]
* [gulp]
* [npm-scripts]
* [cli]

**A word of caution**.
At the time of writing, Workbox is pretty young ([v1.0.1]) and the docs feel inadequate.
If you're a power-user and want to dive deep into docs before using third party software, you might not like working with Workbox.

[ServiceWorkers Outbreak]: https://www.youtube.com/watch?v=CPP9ew4Co0M
[`sw-precache`]: https://github.com/googlechrome/sw-precache
[`sw-toolbox`]: https://github.com/googlechrome/sw-toolbox
[`importScripts()`]: https://developer.mozilla.org/docs/Web/API/WorkerGlobalScope/importScripts
[here]: https://github.com/googlechrome/sw-precache#future-of-service-worker-tooling
[Workbox]: https://github.com/googlechrome/workbox
[official website]: https://workboxjs.org
[v1.0.1]: https://github.com/GoogleChrome/workbox/releases
[webpack]: https://workboxjs.org/get-started/webpack.html
[gulp]: https://workboxjs.org/get-started/gulp.html
[npm-scripts]: https://workboxjs.org/get-started/npm-script.html
[cli]: https://workboxjs.org/how_tos/workbox-cli.html
