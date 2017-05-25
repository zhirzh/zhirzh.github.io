---
layout: post
title: react-router in Twitter and Pinterest style
date: 2017-05-25
---

Modals are the de facto tool used to show notices and alerts, related content, and the pesky "Please subscribe" requests.

Twitter and Pinterest are two websites that use modals heavily.
I'd go as far as to say that they use modals as a central components of their design, and not just some auxiliary tools.



<!-- preview -->

## The routing layouts

If you've ever used either of the websites, you may already about their individual routing solutions.

If not, I suggest a tour of the respective websites.

### [Twitter]

When the user clicks on an tweet, the URL changes, but no *real* navigation happens.
Instead, a modal opens up containing the tweet.
Close the modal and the URL changes back.

This is the standard routine for *almost* all modals on every website out there.


When the user opens the tweet in a new tab or reload a page with the modal open, a new *container element* is loaded first.
And the tweet is shown in a modal.

The container doesn't hold any real value though - it's a dummy.
When the modal is closed, the URL changes to the profile of the user who posted the content.
The dummy is populated with past tweets.

The main content can be accessed with `$('.PermalinkOverlay')`.

```react
<Switch location={isModal ? this.previousLocation : location}>
  // ...

  <Route
    path="/twitter"
    render={() => (
      <div>
        {isModal ? null : <Container />}

        <Modal />
      </div>
    )}
  />
</Switch>
```

### [Pinterest]

The standard routine is the same - click on an image, the URL changes, modal opens with the image, close the modal and we're back.

But when the user opens the image in a new tab or reload a page with the modal open, a new *container element* is loaded first and the image is loaded in it.

However, unlike Twitter, the container that Pinterest uses isn't a dummy one.
It has extra features, such as: like, share, bookmark, etc.

You can inspect the common components on either page by accessing it from the console using `$('.Closeup.Module.flex')`.

```react
<Switch location={isModal ? this.previousLocation : location}>
  // ...

  <Route
    path="/pinterest"
    render={() => {
      const Component = isModal ? Modal : Container;

      return <Component />;
    }}
  />
</Switch>
```

---

## The difference

The difference is in the purpose of the said *container element*.

Twitter uses a super-simple container that acts as a placeholder for future content and has absolute tiny filesize.
This helps cut down data transfers, since other tweets by the same user are loaded if and when the tweet modal is closed.

Pinterest loads a component that serves loads the image, its metadata and related actions.
This might make the container a bit heavy, compared to Twitter's container, but that doesn't really matter, since image sizes are huge compared to the sizes of humongous `.html` files.

---

## The End

This neat little trick has worked for me so far.
I'd like to know if someone has found some other way round.
Especially in a much larger app with a ton of routes - that'd be great.

Here's the [repo] and a working [demo].

[Pinterest]: https://pinterest.com/
[Twitter]: https://twitter.com/
[repo]: https://github.com/zhirzh/react-router-twitter-pinterest-style
[demo]: https://zhirzh.github.io/react-router-twitter-pinterest-style/
