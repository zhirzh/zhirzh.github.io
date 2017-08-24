---
layout: post
title: Animating Dots & Dashes
date: 2017-01-27
tags: svg tutorial
---

Using dashed-dotted-lines to create *sweet and simple* animations.

<!-- preview -->

<style>
  #demo-1 {
    border-width: 4px;
    border-color: silver;
    border-bottom-style: dashed;
    border-top-style: dotted;
  }
</style>
<div>
  <p>
    These are the dotted and dashed lines.
  </p>
  <div id="demo-1">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit
  </div>
</div>

<br />

But we can't animate those lines [yet].
They are made using CSS's `border` property and it is up to the browser to decide how much space must be between individual dots and dashes.

```html
<style>
  #demo-1 {
    border-width: 4px;
    border-color: silver;
    border-bottom-style: dashed;
    border-top-style: dotted;
  }
</style>
<div id="demo-1">
  Lorem ipsum dolor sit amet, consectetur adipisicing elit
</div>
```



---



## CSS animations

<style>
  #demo-2 {
    background-image: linear-gradient(
      to right,
      silver 50%,
      transparent 0%
    );
    background-size: 8px 4px;
    background-repeat: repeat-x;
    background-position: 0% bottom;

    animation-name: border-dance;
    animation-duration: 24s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes border-dance {
    from {
      background-position: 0% bottom;
    }
    to {
      background-position: 100% bottom;
    }
  }
</style>
<div>
  <p>
    With CSS animations,
  </p>
  <div id="demo-2">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit
  </div>
</div>

<br />

```html
<style>
  #demo-2 {
    background-image: linear-gradient(
      to right,
      silver 50%,
      transparent 0%
    );
    background-size: 8px 4px;
    background-repeat: repeat-x;
    background-position: 0% bottom;

    animation-name: border-dance;
    animation-duration: 24s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes border-dance {
    from {
      background-position: 0% bottom;
    }
    to {
      background-position: 100% bottom;
    }
  }
</style>
<div id="demo-2">
  Lorem ipsum dolor sit amet, consectetur adipisicing elit
</div>
```



---



## Psuedo selector classes

<style>
  #demo-3 {
    position: relative;
  }
  #demo-3:before {
    content: ' ';
    position: absolute;

    top: 0;
    bottom: 0;
    right: 0;
    left: 0;

    background-image: linear-gradient(
      to right,
      silver 50%,
      transparent 0%
    );
    background-size: 20px 4px;
    background-repeat: repeat-x;
    background-position: 0% bottom;

    animation-name: demo-3-before;
    animation-duration: 24s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes demo-3-before {
    0% {
      background-position: 0% bottom;
    }
    100% {
      background-position: 100% bottom;
    }
  }
  #demo-3:after {
    content: ' ';
    position: absolute;

    top: 0;
    bottom: 0;
    right: 0;
    left: 0;

    background-image: linear-gradient(
      to right,
      silver 50%,
      transparent 0%
    );
    background-size: 20px 4px;
    background-repeat: repeat-x;
    background-position: 0% bottom;

    animation-name: demo-3-after;
    animation-duration: 28s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes demo-3-after {
    0% {
      background-position: 0% bottom;
    }
    100% {
      background-position: 100% bottom;
    }
  }
</style>
<div>
  <p>
    Add <code class="highlighter-rouge">::before</code> and <code class="highlighter-rouge">::after</code> to the mix and we have this
  </p>
  <div id="demo-3">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit
  </div>
</div>

<br />

```html
<style>
  #demo-3 {
    position: relative;
  }
  #demo-3:before {
    content: ' ';
    position: absolute;

    top: 0;
    bottom: 0;
    right: 0;
    left: 0;

    background-image: linear-gradient(
      to right,
      silver 50%,
      transparent 0%
    );
    background-size: 20px 4px;
    background-repeat: repeat-x;
    background-position: 0% bottom;

    animation-name: demo-3-before;
    animation-duration: 24s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes demo-3-before {
    0% {
      background-position: 0% bottom;
    }
    100% {
      background-position: 100% bottom;
    }
  }
  #demo-3:after {
    content: ' ';
    position: absolute;

    top: 0;
    bottom: 0;
    right: 0;
    left: 0;

    background-image: linear-gradient(
      to right,
      silver 50%,
      transparent 0%
    );
    background-size: 20px 4px;
    background-repeat: repeat-x;
    background-position: 0% bottom;

    animation-name: demo-3-after;
    animation-duration: 28s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes demo-3-after {
    0% {
      background-position: 0% bottom;
    }
    100% {
      background-position: 100% bottom;
    }
  }
</style>
<div id="demo-3">
  Lorem ipsum dolor sit amet, consectetur adipisicing elit
</div>
```



---



## SVG

Even with CSS animations and psuedo-selector classes, there's strict limitation to what can be achieved.
It's possible to create complex animations, but this post aims to *keep things simple*.

For even finer control, we turn to SVG.
As we all know, SVG stands for Scalable Vector Graphics - **Graphics** being the keyword here.

SVG provides fine tuned control over out dots and dashes.

<?xml version="1.0"?>
<style>
  #demo-4 {
    display: table;
    margin: auto;
  }
  #demo-4 line {
    stroke: black;
    stroke-width: 2;
  }
</style>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" id="demo-4" width="30%" height="130">
  <line x1="0" y1="10" x2="100%" y2="10" stroke-dasharray="10" />
  <line x1="0" y1="30" x2="100%" y2="30" stroke-dasharray="10, 10" />
  <line x1="0" y1="50" x2="100%" y2="50" stroke-dasharray="15, 10, 5" />
  <line x1="0" y1="70" x2="100%" y2="70" stroke-dasharray="10" stroke-dashoffset="1" />
  <line x1="0" y1="90" x2="100%" y2="90" stroke-dasharray="10" stroke-dashoffset="4" />
  <line x1="0" y1="110" x2="100%" y2="110" stroke-dasharray="10" stroke-dashoffset="7" />
</svg>

<br />

```html
<?xml version="1.0"?>
<style>
  #demo-4 {
    display: table;
    margin: auto;
  }
  #demo-4 line {
    stroke: black;
    stroke-width: 2;
  }
</style>
<svg
  version="1.1" xmlns="http://www.w3.org/2000/svg"
  id="demo-4" width="30%" height="130"
>
  <line
    x1="0" y1="10" x2="100%" y2="10"
    stroke-dasharray="10"
  />
  <line
    x1="0" y1="30" x2="100%" y2="30"
    stroke-dasharray="10, 10"
  />
  <line
    x1="0" y1="50" x2="100%" y2="50"
    stroke-dasharray="15, 10, 5"
  />
  <line
    x1="0" y1="70" x2="100%" y2="70"
    stroke-dasharray="10" stroke-dashoffset="1"
  />
  <line
    x1="0" y1="90" x2="100%" y2="90"
    stroke-dasharray="10" stroke-dashoffset="4"
  />
  <line
    x1="0" y1="110" x2="100%" y2="110"
    stroke-dasharray="10" stroke-dashoffset="7"
  />
</svg>
```

<br />

You can try out the interactive demo below to test out the parameters.

<style>
  #demo-5 {
    border: 1px solid silver;
  }
  line {
    stroke: black;
    stroke-width: 4px;
  }
</style>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" id="demo-5" width="200" height="50">
  <line id="trial" x1="0" y1="25" x2="200" y2="25" stroke-dasharray="10" />
</svg>
<div>
  <div>
    Dash Array
    <input type="range" id="strokeDasharray" value="10" min="0" max="150">
    <span id="strokeDasharrayValue">10</span>
  </div>
  <div>
    Dash Offset
    <input type="range" id="strokeDashoffset" value="0" min="-200" max="400">
    <span id="strokeDashoffsetValue">0</span>
  </div>
</div>
<script>
  strokeDasharray.oninput = (e) => {
    trial.setAttribute('stroke-dasharray', e.target.value);
    strokeDasharrayValue.innerText = e.target.value;
  };

  strokeDashoffset.oninput = (e) => {
    trial.setAttribute('stroke-dashoffset', e.target.value);
    strokeDashoffsetValue.innerText = e.target.value;
  };
</script>

<br />

If you set `Dash Array` to the max and vary `Dash Offset`, you will see a line, not a small dashes, running from one end to the other.

We will use combinations of these two parameters to create animations

<style>
  #demo-final {
    display: table; margin: auto;
  }
  #demo-final path {
    vector-effect: non-scaling-stroke;
    stroke-width: 1px;
  }

  #computer path {
    stroke-dasharray: 1000px;
    stroke-dashoffset: 1000px;
    transition: stroke-dashoffset 1s linear;
  }
  #computer:hover path {
    stroke-dashoffset: 0;
  }

  #lock path {
    stroke-dasharray: 5px;
    stroke-dashoffset: 0;

    stroke-dasharray: 5px;
    stroke-dashoffset: 0;

    animation-name: lock-marching-ants;
    animation-duration: 4s;
    animation-iteration-count: infinite;
    animation-play-state: paused;
    animation-timing-function: linear;
  }
  #lock:hover path {
    animation-play-state: running;
  }
  @keyframes lock-marching-ants {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: 100px;
    }
  }

  #bolt path {
    stroke-dasharray: 1000px;
    stroke-dashoffset: 0;

    animation-name: bolt-backward;
    animation-duration: 2s;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
  #bolt:hover path {
    animation-name: bolt-forward;
  }
  @keyframes bolt-forward {
    0% {
      stroke-dashoffset: 0;
      stroke: green;
    }
    49% {
      stroke: green;
    }
    51% {
      stroke: red;
    }
    100% {
      stroke-dashoffset: 2000px;
      stroke: red;
    }
  }
  @keyframes bolt-backward {
    0% {
      stroke-dashoffset: 2000px;
      stroke: red;
    }
    49% {
      stroke: red;
    }
    51% {
      stroke: green;
    }
    100% {
      stroke-dashoffset: 0;
      stroke: green;
    }
  }
</style>
<div id="demo-final">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="computer"
    width="30%"
    height="150px"
  >
    <path
      d="M9.778,104h38.222v16h-8.079999999999998c-4.374000000000002,0,-7.920000000000002,3.5460000000000065,-7.920000000000002,7.920000000000002v0.0799999999999983h64v-0.0799999999999983c0,-4.373999999999995,-3.5460000000000065,-7.920000000000002,-7.920000000000002,-7.920000000000002h-8.079999999999998v-16h38.22200000000001c5.400000000000006,0,9.777999999999992,-4.378,9.777999999999992,-9.778000000000006v-76.445c0,-5.4,-4.378,-9.778,-9.778000000000006,-9.778h-108.445c-5.4,0,-9.778,4.378,-9.778,9.778v76.445c0,5.400000000000006,4.378,9.778000000000006,9.778,9.778000000000006ZM8,16h112v80h-112v-80Z"
      stroke="black"
      transform="matrix(1 0 0 1 50 0)"
      fill="none"
    />
  </svg>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="lock"
    width="30%"
    height="150px"
  >
    <path
      d="M64,0c-17.673000000000002,0,-32,14.327,-32,32v24h-8c-4.550000000000001,0.8370000000000033,-8,4.8160000000000025,-8,9.608999999999995v52.613c0,5.400000000000006,4.378,9.778000000000006,9.777999999999999,9.778000000000006h76.445c5.400000000000006,0,9.778000000000006,-4.378,9.778000000000006,-9.778000000000006v-52.613c0,-4.792000000000002,-3.450000000000003,-8.771999999999998,-8,-9.609000000000002h-8v-24c0,-17.673000000000002,-14.326999999999998,-32,-32,-32ZM40,32c0,-13.255000000000003,10.745000000000005,-24,24,-24s24,10.745000000000001,24,24v24h-48v-24ZM68,94.921v9.078999999999994c0,2.209000000000003,-1.7909999999999968,4,-4,4s-4,-1.7909999999999968,-4,-4v-9.079000000000008c-2.389000000000003,-1.3840000000000003,-4,-3.9620000000000033,-4,-6.9210000000000065c0,-4.418999999999997,3.581000000000003,-8,8,-8s8,3.581000000000003,8,8c0,2.959000000000003,-1.6110000000000042,5.537000000000006,-4,6.9210000000000065Z"
      stroke="black"
      transform="matrix(1 0 0 1 50 0)"
      fill="none"
    />
  </svg>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="bolt"
    width="30%"
    height="150px"
  >
    <path
      d="M32,72h32v56l32,-72h-32v-56Z"
      stroke="black"
      transform="matrix(1 0 0 1 50 0)"
      fill="none"
    />
  </svg>
</div>

<br />

The code for the final demos are a bit bulky to display here.
You can view them here on github:

* [Computer](https://codepen.io/zhirzh/pen/Pmmaag?editors=1000)
* [Lock](https://codepen.io/zhirzh/pen/xddzJp?editors=1000)
* [Bolt](https://codepen.io/zhirzh/pen/dWWKjj?editors=1000)
