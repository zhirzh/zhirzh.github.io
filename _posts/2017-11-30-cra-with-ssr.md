---
layout: post
title: Making CRA apps work with SSR
date: 2017-11-30
---

This is a multi-post series about how to server-side-render react apps that were built using create-react-app. You can read more about how and why I came up with this below.

[Part 1]\: Off to a simple start
I start off simple. A barebones app can’t even deal with css, but helps explain the process involved.

[Part 1.5]\: Amending mistakes
Once the base system is up and running, it was time to patch it up. Make it work with css and other stuff.

[Part 2]\: Integrating Redux
Redux works great with react. So I had to fit it in. But instead of simply embedding the data. I moved things up a notch.

[Part 3]\: Routing with react-router
We’ll explore static and dynamic routing with react-router, along with handling route params and redux integration.

[Part 1]: https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-part-1-8f5f813d510b
[Part 1.5]: https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-part-1-5-7b5a04e5415c
[Part 2]: https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-part-2-fb871868216e
[Part 3]: https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-part-3-199d70b4cbe5

You can read more on this
[on hackernoon](https://hackernoon.com/making-cra-apps-work-with-ssr-b45f7c23d8db).
The code used in the series is
[here on github](https://github.com/zhirzh/cra_with_ssr).
