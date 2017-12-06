---
layout: post
title: Prototype Tree
date: 2017-12-06
tags: experiment
---

Anyone who has worked with JS long enough knows something or the other about delegation, prototype chains, [dunder proto] and other similar things.
There are times when I wonder how complex and deep this chaining can be.
This past week, however, my curiosity got the best of me and I just had to find the answer for myself.

<!-- preview -->

I wrote a script that scans the global namespace and generates an *inheritance* tree (prototype tree, actually).

There are a few fundamental properties of JS (and probably Java too):

1. Every *thing* is an object.
2. All objects delegate to some parent class.
3. All delegation chains end at the same `null`.
<!-- 4. All objects have the common ancestor [`Object` class]\*. -->

The function `parse` recursively traverses up a `class`'s prototype chain and populates a tree structure in `data`.

```js
function parse(data, Class) {
  if (Class === null) {
    return data.children;
  }

  const parentPrototype = Object.getPrototypeOf(Class.prototype);
  const parentClass = parentPrototype === null 
    ? null 
    : parentPrototype.constructor;

  const prevLevel = parse(data, parentClass);
  const node = prevLevel.find(n => n.name === Class.name);

  if (node !== undefined) {
    return node.children;
  }

  const newNode = {
    name: Class.name,
    children: [],
  };

  prevLevel.push(newNode);

  return newNode.children;
}
```

This works perfect in browsers because everything that is a part of the JS execution environment, BOM, DOM and CSSOM reside under the global scope `window`.
You can see the prototype tree below or in a
<a href="https://zhirzh.github.io/prototype-tree/build/index.html?data=browser" target="_blank">new tab</a>.

<iframe
  class="demo"
  frameborder="0"
  src="https://zhirzh.github.io/prototype-tree/build/index.html?data=browser&iframe"
  style="height: 400px"
></iframe>

There are, however, some differences in the structures present in the global scope.
Here's a list of a few examples:

* Different Browsers - The [`captureStream()`] method of `<canvas />` element returns an instance of `CanvasCaptureMediaStreamTrack` on Chrome and of `CanvasCaptureMediaStream` on Firefox.
There are many more differences, especially in the availability of SVG elements.
* Browser Versions - As browsers progress, new features are added and older ones canned
* Different Platform - Chrome on android devices has the [Bluetooth] API, Linux does not.
* Protocol - Chrome allows access to the new [Credential] and [MediaKeys] APIs on secure websites (HTTPS protocol).
* Different Websites - It is no surprise that websites can and will pollute the global scope with things they need.
In all fairness though, this isn't all too important.

<br/>

## NodeJS

Things are a bit different for NodeJS.
The default execution environment only contains the language's minimal feature set.
All additional features are in separate modules.
Naively running the code above results in a
<a href="https://zhirzh.github.io/prototype-tree/build/index.html?data=node-sparse" target="_blank">sparse tree</a>.

<iframe
  class="demo"
  frameborder="0"
  src="https://zhirzh.github.io/prototype-tree/build/index.html?data=node-sparse&iframe"
  style="height: 400px"
></iframe>

If we want to *look* at a module's structures, we must import the module and traverse it.
This might sound a simple thing to do, but can make the code really messy.
Instead, we will invert the module inside-out, adding all its structures to the global scope.

When polluting the global scope, we need to be wary of name clashes and overwrites.
This can be avoided by adding the module name to the structure name, i.e., scoping it.

```js
const modNames = [
  'assert',
  'async_hooks',
  ...
  'vm',
  'zlib',
];


modNames.forEach((modName) => {
  const mod = require(modName);

  Object.getOwnPropertyNames(mod)
    .filter(propName => /[A-Z]/.test(propName[0]))
    .forEach((propName) => {
      const prop = mod[propName];

      if (typeof prop.name === 'string' && prop.name.length > 0) {
        prop.scopedName = prop.name + '[' + modName + ']';
      }

      const scopedPropName = propName + '[' + modName + ']';
      global[scopedPropName] = prop;
    });
});
```

After adding the code above, we get the
<a href="https://zhirzh.github.io/prototype-tree/build/index.html?data=node" target="_blank">full tree</a>.

Notice how the class `Server` is present at multiple branches and levels in the tree.
Without scoping the class names, `tls` would've overwritten `http` server node.

<iframe
  class="demo"
  frameborder="0"
  src="https://zhirzh.github.io/prototype-tree/build/index.html?data=node&iframe"
  style="height: 400px"
></iframe>

---

### Addendum

There's one more things I'd like to add.
It isn't a coincidence that everything is connected to the [`Object` class].
This is by design of the language.

We can also create orphan objects - objects not connected to `Object`.
By delegating to orphans, we can write classes that are free of any delegation based *side effects*.
This is great for someone who wants to create [interfaces] or [abstract classes], since 

```js
const orphan = Object.create(null);
orphan.foo = 111;

console.log(orphan);
// { foo: 111 }

console.log(Object.getPrototypeOf(orphan));
// null



const obj = Object.create(orphan);
obj.bar = 222;

console.log(obj);
// { bar: 222 }

console.log(Object.getPrototypeOf(obj));
// { foo: 111 }  <---  orphan



class Animal {}
Object.setPrototypeOf(Animal.prototype, orphan);

class Human extends Animal {}

function Bacteria() {}
Object.setPrototypeOf(Bacteria.prototype, obj);
// Bacteria.prototype = Object.create(obj);  <---  also works
```

<iframe
  class="demo"
  frameborder="0"
  src="https://zhirzh.github.io/prototype-tree/build/index.html?data=orphan&iframe"
  style="height: 400px"
></iframe>

**Note**: You must **never** use dunder proto (`__proto__`).
Its behavior has only been standardized as a legacy feature.
Instead, when working with `[[Prototype]]`, use:

* [`Object.getPrototypeOf()`] for reading
* and [`Object.setPrototypeOf()`] for writing

```js
const foo = Object.create(null);

console.log(foo.__proto__);
// undefined  <---  should be `null`

console.log(Object.getPrototypeOf(foo));
// null  <---  this is correct
```

You can read more about this [on MDN].

---

## The End

Plotting these beautiful [D3 tree charts] revealed more things about JS than I originally sought.

The minimal set is tiny compared.
Everything on the sparse tree can be grouped into:
* **Primitive Data Types** - Number, String, Boolean &hellip;
* **Abstract Data Types** - Function, Object &hellip;
* **Container Data Types** - Array, Map, Set &hellip;
* **Timers** - setTimeout, setInterval &hellip;
* **Errors** - SyntaxError, ReferenceError &hellip;
* **Misc items** - Promise, RegExp, TypedArrays &hellip;

I also realised just how huge BOM and DOM are.
Every entity in HTML, SVG, CSS, XML entity has its own class.
Every WebAPI comes with its structures and each one of them has its class.

You can further explore the graphs or even plot your own.
The code and example links are below:
* Code: [gists/2017-12-06-prototype-tree](https://github.com/zhirzh/zhirzh.github.io/tree/master/gists/2017-12-06-prototype-tree/)
* Demos:
  * [Browser](https://zhirzh.github.io/prototype-tree/build/index.html?data=browser)
  * [Node (sparse)](https://zhirzh.github.io/prototype-tree/build/index.html?data=node-sparse)
  * [Node](https://zhirzh.github.io/prototype-tree/build/index.html?data=node)
  * [Orphan](https://zhirzh.github.io/prototype-tree/build/index.html?data=orphan)

[dunder proto]: http://2ality.com/2012/10/dunder.html
[`Object` class]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object
[D3 tree charts]: http://bl.ocks.org/robschmuecker/7880033
[interfaces]: https://www.javatpoint.com/interface-in-java
[abstract classes]: https://www.javatpoint.com/abstract-class-in-java
[`Object.getPrototypeOf()`]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf
[`Object.setPrototypeOf()`]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
[on MDN]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/proto
[`captureStream()`]: https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/captureStream
[Bluetooth]: https://developer.mozilla.org/docs/Web/API/Web_Bluetooth_API
[Credential]: https://developer.mozilla.org/docs/Web/API/Credential_Management_API
[MediaKeys]: https://developer.mozilla.org/docs/Web/API/MediaKeys
