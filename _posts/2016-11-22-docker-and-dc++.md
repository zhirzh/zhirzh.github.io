---
layout: post
title: Docker and DC++
date: 2016-11-15
---

When I first started using [Docker], I was unable to use [LinuxDC++] (my DC++ client).
I kept getting this pesky error.

> Connect failed: No route to host

So I did what most of us would do in such a situation: `purge and install`.
Nothing happened.

Then I went to the internet, asking for help.
People suggested that there's something wrong with my firewall config, that my `iptables` rules were messed up.
But that wasn't the case.

I installed other DC++ clients - [EiskaltDC++], [Valknut] - hoping that there's something wrong with my original client.
But I was let down, yet again.

I thought to myself, *maybe I don't need* docker.

<!-- preview -->

---

## Later that day...

... I asked my friend [Tarun] about the same and, lo and behold, the solution arrives (after a bit of confusion due to communication gap).
All I had to do was disable docker's network interface - that's it!

```sh
$ sudo ifconfig docker0 down
```

And all was back to normal.

![]({{site.baseurl}}/img/chat.png)

---

## Why the problem at all?

Docker creates a bridged network interface which it uses to communicate with the host OS.
And for some reason, LinuxDC++ binds to that interface, ditching the ethernet/wifi one.

Although I am still new to docker, I have a strong feeling that there's some config option that prevents this issue from happening.
I was hoping you could tell me what it was, dear reader.

[Docker]: https://www.docker.com/
[LinuxDC++]: https://launchpad.net/linuxdcpp/
[EiskaltDC++]: https://github.com/eiskaltdcpp/eiskaltdcpp/
[Valknut]: http://wxdcgui.sourceforge.net/
[Tarun]: http://reachtarunhere.github.io/about/
