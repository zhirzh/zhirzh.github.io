---
layout: post
title: Tiny transfers
date: 2017-08-27
tags: experiment tutorial
---

It's hard to pin down why JSON transfers is so popular.
But one thing's for sure, it is **not** the most efficient when it comes to data transfers.

The nested nature of JSON makes it prone to redundant storage and transferring redundant JSON files only puts strain on the server's and the client's bandwidth.

It is always a good idea to *deflate* your JSON data before transferring to the other side.

<!-- preview -->

---

## Working dataset

The first thing we need is a rich dataset.
Google's doodle database is the perfect fit.
Use the 2 scripts to download all doodles from the year 2016 ...

```sh
# fetch.sh

DATA_PATH="raw"
mkdir -p $DATA_PATH

for (( MONTH = 1; MONTH <= 12; MONTH++ )) do
  ZERO_MONTH=$(printf %02d $MONTH)

  URL="https://www.google.com/doodles/json/2016/$ZERO_MONTH?full=1"
  FILEPATH="$DATA_PATH/2016-$ZERO_MONTH.json"

  if [[ -f "$FILEPATH" ]]
  then
    FILESIZE=$(wc -c < "$FILEPATH")
    NULL_FILESIZE=2

    if [[ $FILESIZE -eq $NULL_FILESIZE ]]
    then
      wget -c $URL -O "$FILEPATH"
    else
      echo "SKIP: $FILEPATH"
    fi
  else
    wget -c $URL -O "$FILEPATH"
  fi
done
```

... and consolidate them in a single file.

```js
// aggregate.js

const fs = require('fs');
const path = require('path');

const rawDirPath = path.join(__dirname, 'raw');
const allDoodlesPath = path.join(__dirname, 'doodles.all.json');

const allDoodles = fs
  .readdirSync(rawDirPath)
  .reduce((_allDoodles, fileName) => {
    const filePath = path.join(rawDirPath, fileName);
    const fileDoodles = JSON.parse(fs.readFileSync(filePath));

    return _allDoodles.concat(fileDoodles);
  }, []);

fs.writeFileSync(allDoodlesPath, JSON.stringify(allDoodles));
```

If everything goes well, you'll end up with the following files.
The exact sizes might differ (more on this later).

```sh
$ du -sh raw/*
724K  raw/2016-01.json
592K  raw/2016-02.json
1.2M  raw/2016-03.json
644K  raw/2016-04.json
660K  raw/2016-05.json
872K  raw/2016-06.json
488K  raw/2016-07.json
1.9M  raw/2016-08.json
1.1M  raw/2016-09.json
512K  raw/2016-10.json
644K  raw/2016-11.json
836K  raw/2016-12.json

$ du -sh doodles.all.json
8.1M  doodles.all.json
```

---

## Understanding the data

Before we can begin the cleaning process, we need to understand the structure of our data.

```js
// structure.js

const fs = require('fs');
const path = require('path');

const allDoodlesPath = path.join(__dirname, 'doodles.all.json');
const allDoodles = require(allDoodlesPath);

const keys = {};
allDoodles.forEach(doodle => {
  Object.keys(doodle).forEach(k => keys[k] = doodle[k].constructor);
});

console.log(keys);
```

This gives us the following list.

```
alternate_url            : String,
blog_text                : String,
call_to_action_image_url : String,
collection_id            : Number,
countries                : Array,
doodle_args              : Array,
doodle_type              : String,
height                   : Number,
hires_height             : Number,
hires_url                : String,
hires_width              : Number,
history_doodles          : Array,
id                       : Number,
is_animated_gif          : Boolean,
is_dynamic               : Boolean,
is_global                : Boolean,
is_highlighted           : Boolean,
name                     : String,
next_doodle              : Object,
persistent_id            : Number,
prev_doodle              : Object,
query                    : String,
related_doodles          : Array,
run_date_array           : Array,
share_text               : String,
standalone_html          : String,
tags                     : Array,
title                    : String,
translations             : Object,
url                      : String,
width                    : Number,
youtube_id               : String,
```

We can work on this initial list of keys to workout more semantic types - URLs, IDs, self references, etc.

```
history_doodles : Array<Doodle>,
next_doodle     : Doodle,
prev_doodle     : Doodle,
related_doodles : Array<Doodle>,

alternate_url            : URL,
call_to_action_image_url : URL,
hires_url                : URL,
standalone_html          : URL,
url                      : URL,
```

Next, we will extract data instances where duplicates are a possibility.
This happens with collection attributes (like arrays) over a closed set (like countries of the world).

```
countries : Array<Country>,
tags      : Array<Tag>,
```

---

## Normalisation

Now we can perform the actual normalisation.
There are 3 steps:

1. Extract unique instances for all Models:
  * Doodle
  * Country
  * Tag
2. Replace redundant instances with unique IDs
3. Save all model instances as separate JSON files

```js
// normalise.js

// step 1
const uniqueDoodles = {};
const uniqueCountriesSet = new Set();
const uniqueTagsSet = new Set();

allDoodles.forEach(doodle => {
  doodle._id = generateDoodleHash(doodle);

  uniqueDoodles[doodle._id] = doodle;

  doodle.countries.forEach(country => {
    country = country.trim().toLowerCase();

    uniqueCountriesSet.add(country);
  });

  doodle.tags.forEach(tag => {
    tag = tag.trim().toLowerCase();

    uniqueTagsSet.add(tag);
  });
});

// step 2
const uniqueCountries = Array.from(uniqueCountriesSet);
const uniqueTags = Array.from(uniqueTagsSet);

allDoodles.forEach(doodle => {
  if (doodle.next_doodle !== null) {
    const nextDoodle = doodle.next_doodle;
    const nextDoodleHash = generateDoodleHash(nextDoodle);

    doodle.next_doodle = nextDoodleHash;
  }

  if (doodle.prev_doodle !== null) {
    const prevDoodle = doodle.prev_doodle;
    const prevDoodleHash = generateDoodleHash(prevDoodle);

    doodle.prev_doodle = prevDoodleHash;
  }

  doodle.related_doodles = doodle.related_doodles.map(relatedDoodle => {
    const relatedDoodleHash = generateDoodleHash(relatedDoodle);

    return relatedDoodleHash;
  });

  doodle.history_doodles = doodle.history_doodles.map(historyDoodle => {
    const historyDoodleHash = generateDoodleHash(historyDoodle);

    return historyDoodleHash;
  });

  doodle.countries = doodle.countries.map(country =>
    uniqueCountries.indexOf(country.trim().toLowerCase()),
  );

  doodle.tags = doodle.tags.map(tag =>
    uniqueTags.indexOf(tag.trim().toLowerCase()),
  );
});

// step 3
function writeJSON(filepath, json, pretty = false) {
  fs.writeFileSync(filepath, JSON.stringify(json, null, pretty ? 2 : 0));
}

writeJSON('doodles.all.norm.json', allDoodles);
writeJSON('countries.json', uniqueCountries);
writeJSON('tags.json', uniqueTags);
```

We can also apply the same process to other properties, such as the different types of URLs.
Find all the possible [origins] and common pathnames, and store them as a separate JSON file.
This means we can further reduce file sizes by replace long repeating URLs.

All doodles can have any of the following URL types:

* `alternate_url`
* `call_to_action_image_url`
* `hires_url`
* `standalone_html`
* `url`

And all of those URLs have the following common starting paths:

* `https://lh3.googleusercontent.com`
* `https://www.google.com/logos/doodles`
* `https://www.google.com/logos`

```js
// normalise.js

// ...

const linkTypes = [
  'alternate_url',
  'call_to_action_image_url',
  'hires_url',
  'standalone_html',
  'url',
];

const urlPrefixes = [
  'lh3.googleusercontent.com',
  'www.google.com/logos',
  'www.google.com/logos/doodles',
];

allDoodles.forEach(doodle => {
  linkTypes.forEach(linkType => {
    const link = doodle[linkType];

    switch (true) {
      case link.startsWith('https://lh3.googleusercontent.com'):
        doodle[linkType] = link.replace('https://lh3.googleusercontent.com', 0);
        break;

      case link.startsWith('//www.google.com/logos'):
        doodle[linkType] = link.replace('//www.google.com/logos', 1);
        break;

      case link.startsWith('/logos'):
        doodle[linkType] = link.replace('/logos', 1);
        break;

      case link.startsWith('//www.google.com/logos/doodles'):
        doodle[linkType] = link.replace('//www.google.com/logos/doodles', 2);
        break;
    }
  });
});

writeJSON('doodles.all.norm.json', allDoodles);
writeJSON('urls.json', urlPrefixes);
```

### Measuring performance

```sh
$ du -sh *.json
4.0K  countries.json
8.1M  doodles.all.json
1.9M  doodles.all.norm.json
12K tags.json
4.0K  urls.json
```

The raw data is `8.1MB`.
After normalising, we get `1.9M + 4.0K + 12K + 4.0KB`, which is still `1.9MB`.

We have reduced our transfer sizes by over 4 times.

---

## Cleaning up the gunk

There's still more work we can do.
Right now, we are transferring all the 32 key-value pairs.
Most of which we might not even need.

Once we decide what attributes we must keep, we can create a schema for our data.

> **Schema**
> a representation of a plan or theory in the form of an outline or model.

```js
// normalise.js

// ...

const schema = [
  /*
  'alternate_url',
  'blog_text',
  'call_to_action_image_url',
  'collection_id',
  'countries',
  'doodle_args',
  'doodle_type',
  'height',
  'hires_height',
  'hires_width',
  'history_doodles',
  'id',
  'is_animated_gif',
  'is_dynamic',
  'is_global',
  'is_highlighted',
  'name',
  'persistent_id',
  'query',
  'related_doodles',
  'share_text',
  'standalone_html',
  'tags',
  'translations',
  'width',
  'youtube_id',
  */

  'hires_url',
  'next_doodle',
  'prev_doodle',
  'run_date_array',
  'title',
  'url',

  '_id', // unique ID for each doodle
];

const cleanDoodles = allDoodles.map(doodle => schema.map(key => doodle[key]));

writeJSON('doodles.clean.json', cleanDoodles);
writeJSON('schema.json', schema);
```

### Measuring performance

Needless to say, removing such a large portion of our data will have strong impact on file size.
Going from `1.9MB` to `116KB` is more than 16 times smaller.

```sh
$ du -sh doodles.clean.json
116K  doodles.clean.json
```

---

## Packaging and Compression

### Packaging

The final part is packaging and compression.
At the end of normalisation, we end up the following files:

* `schema.json`
* `countries.json`
* `tags.json`
* `urls.json`

Fetching these 4 files require 8 round trips - from the client, to the server, and back to the client.
On slow or intermittent connection, chances of any of those requests failing are high.
We cannot start work on client-side until we have all the parts.

We can bypass this small issue by writing everything to a single file:

```js
// normalise.js

// ...

writeJSON('meta.json', {
  schema,
  countries: uniqueCountries,
  tags: uniqueTags,
  urls: urlPrefixes,
});

// 12K
```

### Compression

We can now compress our final JSON file with `bzip2` or use a higher compression ratio algorithm, like [`LZMA`] or [`brotli`].

```sh
$ du -sh doodles.clean.json
116K  doodles.clean.json

$ bzip2 -kf doodles.clean.json

$ du -sh doodles.clean.json.bz2
24K doodles.clean.json.bz2
```

### Measuring performance

Packaging reduces the number of requests to the server and compression reduces our final size by another 4.8 times.

To put things in contrast, we started out with 1 huge `8.1MB` file and ended up with 2 files that add up to `40KB`.
This is a 200 times reduction.

---

## The end

Here, we worked with 386 doodles, released in the year 2016 alone and although this gives us 200 times better transfers, going from `8MB` to `40KB` isn't all that helpful.

But Google has been releasing doodles since 1998.
There are 3245 doodles released at time of writing this post that add up to `60MB`.

If we apply the same pipeline on their entire dataset, we get out `52KB + 340KB` of metadata and compressed data.
This is still 150 times better and more importantly, under `1MB`.
This is **HUGE!!**

The rationale behind this is pretty straightforward.
As the data size increases, so does redundancy.
Reducing redundancy by performing normalising, proper filtering and finally performing compression will always bring down sizes in redundant data.
And higher redundancy will mean better gains.

The entire code used here is available in [this gist].

[origins]: https://developer.mozilla.org/docs/Web/HTTP/Headers/Origin
[`LZMA`]: https://wikipedia.org/wiki/Lempel–Ziv–Markov_chain_algorithm
[`brotli`]: https://wikipedia.org/wiki/Brotli
[this gist]: https://gist.github.com/zhirzh/7666c2742a2c7dfbd9859b05ee76aef1
