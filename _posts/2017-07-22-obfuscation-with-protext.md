---
layout: post
title: Obfuscation with Protext
date: 2017-07-22
tags: protext obfuscation package
---

Obfuscation is the process of making something obscure, unclear, or unintelligible.
Obfuscation techniques, such as markup mangling, work great for deterring people from understanding the codebase.
Beyond that, mangling serves no purpose for the end user.

Recently, I came across a new and very unique obfuscation technique.
One that focuses on the content *rendered* on the screen, not the underlying code.

<!-- preview -->

## HackerRank hiring challenge

It was the core of a hiring challenge by HackerRank, released on June 18.
Tweeted by [Shiv Deepak], Engineering Manager at HackerRank and later by official HackerRank twitter account.

They implemented a special encoder mechanism that made this ...

![]({{site.baseurl}}/img/2.png)

... *render* as this in the browser.

![]({{site.baseurl}}/img/1.png)

If we tried to copy/paste the text, we'd end up with the gibberish.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Can you build a generic solution to break the HTML obfuscation on this page? - <a href="https://t.co/xcw8QlHHZg">https://t.co/xcw8QlHHZg</a> <a href="https://twitter.com/hashtag/HackerRank?src=hash">#HackerRank</a> <a href="https://twitter.com/hashtag/Hiring?src=hash">#Hiring</a> <a href="https://twitter.com/hashtag/Challenge?src=hash">#Challenge</a></p>&mdash; Shiv Deepak (@shivdeepak_) <a href="https://twitter.com/shivdeepak_/status/876317554750308352">June 18, 2017</a></blockquote>
<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">We will be at DeveloperWeek NYC! Can solve this? - <a href="https://t.co/XjVwL23Z96">https://t.co/XjVwL23Z96</a> Get swag and more!<a href="https://twitter.com/hashtag/hackerrank?src=hash">#hackerrank</a> <a href="https://twitter.com/hashtag/code?src=hash">#code</a> <a href="https://twitter.com/hashtag/codefast?src=hash">#codefast</a></p>&mdash; HackerRank (@hackerrank) <a href="https://twitter.com/hackerrank/status/876458261536542721">June 18, 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

---

## Understanding the mechanism

The content being served is gibberish, but it *renders* to be readable in the browser.
This points to some clever use of CSS.
[Inspecting] the text made it clear that a **custom font** was used to make one character *render* as another.

Just by this amount of information, we can come up with a possible pipeline for the encoder.

1. Map the raw text's character set to another different character set.
2. Generate a font that reverse maps the 2 character sets.
3. Apply the custom font for selected regions in the HTML document.

This is good.
But how to do the mapping in fonts?

---

## Fonts and Glyphs

In the digital age, a glyph is the visual representation of a character and a font is the collection of all such glyphs that match a certain aesthetic.

To main correct presentation, each glyph as 2 important components:
1. `unicode` - The unicode value of the character.
2. `path` - The SVG path that gives shape on screen.

To make one character *render* as another, all we need to do is play these 2 values.

In the iframe below, each line has characters a-z.
By using custom font, it is possible to change how a character *renders* on the screen.

<iframe
  class="demo"
  style="height:auto"
  src="{{site.baseurl}}/gists/2017-07-22-obfuscation-with-protext/index.html"
></iframe>

### Almost there

As you can see, there are 2 visible issues:

1. Some characters have inconsistent width.
2. The digits 1, 2, 3 has a different appearance.

Inconsistent width is because the font is a proportional font, not a monospace font.
As a result, `i` takes up much less space than `M`.

For correct mapping, we must also copy the `advance-width` property.

The second issue happens because the example uses a small character set.
It only has characters `a...z`.
Any other character will be absent in the font file.
Thus, no style is applied.

To correct this issue, simply take a larger set.

---

## ProText as a package

HackerRank named this decoder challenge ProText (portmanteau of protect text).
Under the same name, I released a [node package `protext`] and also a companion [webpack plugin `protext-webpack-plugin`].

While making these packages, I was thinking of some scenarios that can benefit from my work.

The first thing that came to mind were situations where onscreen content verification is needed.

For example, github's repository deletion prompt:

<img src="{{site.baseurl}}/img/git.png" class="center">

---

## The end

Content obfuscation isn't something we need everything.
But when we do need it, coming up with a novel implementation can be tough.
If you ever encounter such a scenario, do try [`protext`].

*PS*: My solution code is [here].
I also made an app out of solution: [protext-decoder].

[Shiv Deepak]: https://www.linkedin.com/in/shivdeepak
[Inspecting]: https://developers.google.com/web/tools/chrome-devtools/inspect-styles
[node package `protext`]: https://github.com/zhirzh/protext
[webpack plugin `protext-webpack-plugin`]: https://github.com/zhirzh/protext-webpack-plugin
[here]: https://bitbucket.org/zhirzh/protext-decoder
[protext-decoder]: https://protext-decoder.herokuapp.com/
[`protext`]: https://github.com/zhirzh/protext
