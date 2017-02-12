---
layout: post
title: Object oriented Mist
date: 2017-02-11
---

There are two thing that don't always play play along:
* `Object Oriented programming`
* `JavaScript`

The problem resides with neither the OOP principles nor the language, but rather with the person who uses them.
There's a *mist* shrouding the real issue, that only seems to get thicker as time passes - thanks to ES6 `class`es.

So here is another attempt to ...

<!-- preview -->

## Where to begin

Let me start with my background in programming first.

My school has always had a computer-related course for all students once they reached the third class (or third grade).
Sometimes, we were learning to work [CorelDRAW], [WordArt]; the other times we were dealing with *the* [turtle] and [QBasic].
But things changed drastically once I reached 9th class, in 2009.

We were now working with C++ - a language with **class** ...

It came along with a whole lot of mumbo-jumbo: polymorphism, inheritance, abstraction, encapsulation, constructors, accessors, private, modifiers, templates, *this*, foo, bar etc etc.

Little did I know that over the course of next 4 years, all this would become second nature to me.

Skip a few months, I am starting out in college.
I get to learn a bit of Ruby, a whole of Python, learn how ruthless and unforgiving pointer can be.

Then in my second year, I pick up JavaScript.
Why? Who knows. No idea.

Now JS was special - it had no `class`.

<h3>no class... wait.</h3>

<h2>no class?</h2>

<h1>NO CLASS!!!!</h1>

<br />

<img
  src="{{site.baseurl}}/img/barbaric.jpg"
  class="center-block"
  alt="Absolutely Barbaric"
/>

*coz it's got no class. get it?* :)

---

## The revelation

It took me some time to realise that there's more to OOP than meets the eye.
OOP isn't just about the constructs.
It is **much more** than that.

OOP is a style of computer programming where data and related procedures (a.k.a. functions, methods) are modelled together as a conceptual thing called "class", which can then deliver more tangible entities called "object", which follow and implement the three major design principles of encapsulation, inheritance, and polymorphism.

But wait, there's more.
You see, the terms `class` and `object` were in use in Simula (1965), even before the concepts of OOP didn't exist.

It was in November of 1997 when Alan Kay brought it up.

> At Utah sometime after Nov 66 when, influenced by Sketchpad, Simula, the design for the ARPAnet, the Burroughs B5000, and my background in Biology and Mathematics, I [Alan Kay] thought of an architecture for programming. It was probably in 1967 when someone asked me what I was doing, and I said:<br>"**It's object-oriented programming**"
>
> -- <cite>[Dr. Alan Kay on the Meaning of "Object-Oriented Programming"]</cite>

With the coinage of the term, he also had some ideas about how to go about it (presented in great depth in [Alan Kay's Definition Of Object Oriented]).
Most of his original plans, if not all, are implemented in Smalltalk.

---

Anyhow, coming back to the point.

Object Oriented Programming is a programming paradigm based on objects and their interactions with one another.

There are loads of OOP languages and (according to wikiepdia) can be classified into groups.
Two groups of interest for us are:
* Class-based
* Prototype-based

---

## Prototype and Class

The major difference between the two styles is how inheritance is achieved.

Class based languages have it fairly easy (not because there's some inherent ease in the style, but because it's more popular of the two).

> In class-based programming, inheritance is done by defining new classes as extensions of existing classes. This organizes classes into a hierarchy ...
>
> -- <cite>https://en.wikipedia.org/wiki/Class-based_programming#Inheritance</cite>

In contrast, in prototype-based languages, inheritance is achieved by using cloning of objects and delegation.
This is called *prototypal*-inheritance.

If you aren't familiar with `prototype` and `delegation`, I urge you to watch [this video].

---

## Show, don't tell

Still with me? Nice. Okay. Let us get started with the code now.

We will work with two copies of code, one for each camp, and try to find similarities, and highlight differences.

### Definition

First off, we will define a class **Animal** (and extend upon it later on) in C++

```cpp
  #include <iostream>
  #include <string>

  using namespace std;

  class Animal {
    private:
      string dna;

    public:
      Animal(string dna);
      void speak(void);
      void move(void);
  };

  Animal::Animal(string dna) {
    this->dna = dna;
    cout << "New Animal dna: " << dna << endl;
  }

  void Animal::speak(void) {
    cout << "SPEAK" << endl;
  }

  void Animal::move() {
    cout << "MOVE" << endl;
  }


  int main(void) {
    Animal donald("duck");
    donald.speak();
    donald.move();

    Animal zibbu("human");
    zibbu.speak();
    zibbu.move();

    return 0;
  }
```

And in JS

```js
  function Animal(dna) {
    this.dna = dna;
    console.log("New Animal dna:" + dna);
  }
  Animal.prototype.speak = function() {
    console.log("SPEAK");
  };
  Animal.prototype.move = function() {
    console.log("MOVE");
  };


  // no need for a main()
  var donald = new Animal("duck");
  donald.speak();
  donald.move();

  var zibbu = new Animal("human");
  zibbu.speak();
  zibbu.move();
```

### Analysis

Both the codes produce the same output:
```
New Animal dna:duck
SPEAK
MOVE
New Animal dna:human
SPEAK
MOVE
```

But it's the journey that we are interested in, not the destination.

<style type="text/css">
  th, td {
    width: 50%;
  }
</style>

| C++                                     | JS                                        |
|---                                      |---                                        |
|a `class` keyword for class definition   |a `function` is called with `new`          |
|all members in definition                |no such requirement                        |
|constructor is optional                  |constructor *IS* the definition            |
|methods are defined using scope operator |methods are bound to `prototype` property  |

Let's have a closer look at how JS works its thing.

In JS, a `function` **always** returns something.
If a return statement is not present, it will simply return `undefined`.

When called with the `new` operator, we get an object, even though there was no return statement.
How? We can cook up some hypothetical code to understand the matter.

```js
  function ClassFunc(param) {
    this.data = param;
  }

  var foo = ClassFunc(123);
  console.log(foo); // undefined

  var bar = new ClassFunc(123);
  console.log(bar); // ClassFunc { data: 123 }
```

We can imagine that when the new operator is used the code transforms to the following:

```js
  function ClassFunc(param) {
    var this = {};

    ...

    return this;
  }
```

---

### Take a step back

At this point, it is essential that we have a look at the `prototype` property before continuing further.
There a few things to remember:

* A function always returns "something". A function can return a JS object
* All functions have a property called **prototype** that is an object.
* If a function returns an object, we say the object was "constructed" by the function.
  The function is the object's **constructor**.
* When we try to access a property on object, the following happens:
  * Does the object have it?
    * YES -> provide the property
      <br />
      NO -> does `object.constructor.prototype` has it?
      * YES -> provide the property
        <br />
        NO -> does `object.constructor.prototype.constructor.prototype` has it?
        * ... until we hit `Object.prototype`

[CorelDRAW]: https://en.wikipedia.org/wiki/CorelDRAW
[WordArt]: https://en.wikipedia.org/wiki/Microsoft_Office_shared_tools#WordArt
[turtle]: https://en.wikipedia.org/wiki/Logo_(programming_language)
[QBasic]: https://en.wikipedia.org/wiki/QBasic
[Dr. Alan Kay on the Meaning of "Object-Oriented Programming"]: http://www.purl.org/stefan_ram/pub/doc_kay_oop_en
[Alan Kay's Definition Of Object Oriented]: http://wiki.c2.com/?AlanKaysDefinitionOfObjectOriented
[this video]: https://www.youtube.com/watch?v=YkoelSTUy7A
