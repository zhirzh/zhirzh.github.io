---
layout: post
title: WebAssembly data flow - Part 2
date: 2017-08-10
---

In [part 1], we looked at handling data flow for primitive atomics.
In this part, we will look at primitive arrays.

But before that, some background in C/++ array handling is necessary.

<!-- preview -->

Here's a small recap:

* Primitive atomics include `int`, `char`, `bool` etc.
* Use setter/getter functions for deferred consumption.
* For instant consumption in a C/++ function, pass the JS data as arguments and recover the output as return value.
* C strings are **not** atomics.

---

## C/++ array notation is a lie

Working with arrays will be little bit trickier.
This is partly because in C/++, arrays are implemented as linear chunks of memory.
Accessing array elements is actually pointer arithmetic.
You can read more on this [here].

To access the i<sup>th</sup> element, we write `arr[i]` but it just `*(&arr[0] + i)`.
Let's break this notation down:

* `arr[0]` - First element of array
* `&arr[0]` - Address of first element of array
* `&arr[0] + i` - Address at offset `i` from address of first element of array
* `*(&arr[0] + i)` - Value at address at offset `i` from address of first element of array

One basic principle of pointer arithmetic:

> When take the address `A` of a variable of type `T` and add an integer `i`, the resultant address is not `A + i`,
> <br />
> but rather `A + (i * sizeof(T))`.

You can verify this with [this C code].

This property will be useful in just a short while.

---

## Primitive Arrays

Coming back to the topic, primitive arrays.

### Immediate consumption

Unlike JS, arrays are not first class citizens in C/++.
This means that arrays can only be passed by reference, not by value.

For this reason it is impossible to pass a JS array directly to a C/++ function.

### Deferred consumption

In the case of atomics, we could use getter/setter functions because atomics can be passed by value.
Since that is not the case with an array, getter/setter functions won't work.
We will have to read/write directly to and from the WebAssembly memory.

Let's first take up reading memory.


#### Reading from C/++

```c
// read.c

int arr[] = {11, 22, 33};

int *addr_arr() { return &arr[0]; }

int len_arr() { return sizeof(arr) / sizeof(arr[0]); }
```

```js
// main.js

loadWebassembly(...)
  .then(() => {
    const mem = wasm.memory.buffer;

    const arr = new Int32Array(mem, wasm.addr_arr(), wasm.len_arr());
    console.log(arr); // [11, 22, 33]
  });
```

_**Note**:
This was easy.
However, there can be complications if C/++ data type's size doesn't match JS typed array's `BYTES_PER_ELEMENT` property._

| JS Type           | BPS | C/++ Type       |
|-------------------|-------------------|-----------------|
| Int8Array         | 1                 | char            |
| Uint8Array        | 1                 | unsigned char   |
| Int16Array        | 2                 | short           |
| Uint16Array       | 2                 | unsigned short  |
| Int32Array        | 4                 | int             |
| Uint32Array       | 4                 | unsigned int    |
| Float32Array      | 4                 | float           |
| Float64Array      | 8                 | double          |

---

#### Writing to C/++

```c
// write.c

#define n 3
// C doesn't allow variable length array declaration

void log(int); // imported function

int arr[n];

int *addr_arr() { return &arr[0]; }

int len_arr() { return n; }

void print_arr() {
  for (int i = 0; i < n; i++) {
    log(arr[i]);
  }
}
```

```js
// main.js

loadWebassembly(...)
  .then(() => {
    const mem = wasm.memory.buffer;

    const arr = new Int32Array(mem, wasm.addr_arr(), wasm.len_arr());

    for (let i = 0; i < wasm.len_arr(); i++) {
      arr[i] = (i + 1) * 11;
    }

    wasm.print_arr();
    // 11
    // 22
    // 33
  });
```



{%comment%}
  <p id="str">
    <span>h</span>
    <span>e</span>
    <span>l</span>
    <span>l</span>
    <span>o</span>
    <span> </span>
    <span>w</span>
    <span>o</span>
    <span>r</span>
    <span>l</span>
    <span>d</span>
  </p>
  <p id="int">123</p>
  <canvas id="mem" style="width: 100%;"></canvas>
  <script>
    (function () {
      const rows = 5;
      const cols = 20;
      const size = 40;

      mem.width = cols * size;
      mem.height = rows * size;

      const ctx = mem.getContext('2d');

      function paintString() {
        ctx.font = `${0.8 * size}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < str.innerText.length; i++) {
          const char = str.innerText[i];
          const col = i % cols;
          const row = Math.floor(i / cols);

          ctx.fillStyle = 'lightgreen';
          ctx.fillRect(col * size, row * size, size, size)

          ctx.fillStyle = 'black';
          ctx.fillText(char, (col + 1 / 2) * size, (row + 1/ 2) * size);
        }

        paintGrid();
      }

      function paintInteger() {
        ctx.font = `${0.8 * size}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < int.innerText.length; i++) {
          const char = int.innerText[i];
          const col = i % cols;
          const row = Math.floor(i / cols);

          ctx.fillStyle = 'lightgreen';
          ctx.fillRect(col * size, row * size, size, size)

          ctx.fillStyle = 'black';
          ctx.fillText(char, (col + 1 / 2) * size, (row + 1/ 2) * size);
        }

        paintGrid();
      }

      function paintGrid() {
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 2;

        for (let i = 0; i <= rows; i++) {
          ctx.beginPath();
          ctx.moveTo(0,            i * size);
          ctx.lineTo(mem.width, i * size);
          ctx.stroke();
        }

        for (let i = 0; i <= cols; i++) {
          ctx.beginPath();
          ctx.moveTo(i * size, 0);
          ctx.lineTo(i * size, mem.height);
          ctx.stroke();
        }
      }

      function paintError() {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, mem.width, mem.height);

        paintGrid();
      }

      paintString();

      str.oninput = () => {
        if (str.innerText.length >= rows * cols) {
          paintError();
          return;
        }

        ctx.clearRect(0, 0, mem.width, mem.height);
        paintString();
      }
    })();
  </script>
{% endcomment %}

## The end

Combining what we covered in [part 1] we can now handle primitives, both atomic and arrays, for immediate and deferred consumption.

We have seen how to getter/setter functions with atomics and why they can't be used with arrays.
To bypass this, we saw how to access raw memory and read/write directly from/to it. 

In the next part, we'll see how to work with user defined data.

[part 1]: {% post_url 2017-08-08-webassembly-data-flow-1 %}
[here]: https://blog.feabhas.com/2016/12/a-convenient-untruth/
[this C code]: https://gist.github.com/zhirzh/dec5c1a69dce0bf042b47fba7ae54ab2#file-pointer-arithmetic-c
[TypedArray]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
