---
layout: post
title: Stream capturing with MediaRecorder
date: 2017-09-02
---

The new [`MediaRecorder`] WebAPI makes media recording super easy.
It allows storing chunks of data from a [media stream] as blobs, which can later be concatenated and saved as a single file.
As time passes, more sources of media streams are added.
We can capture media from:

* Media Devices
* Canvas
* Media Elements:
  * `<video />`
  * `<audio />`

<!-- preview -->

---

##  MediaStream

### Media Devices

The key component in using `MediaRecorder` is having access to a MediaStream.
The early uses of MediaStreams came with the use of `getUserMedia()` method to gain access to local media devices.

```js
navigator.mediaDevices.getUserMedia().then(function(stream) {
  console.log('Captured MediaStream:', stream);
});
```

### Canvas

The [`<canvas />`] element implements a method
[`captureStream()`](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/captureStream)
that captures content rendered on the canvas element, each time the content changes.

We can supply an optional argument that controls the number of frames recorded per second (FPS).

```js
// frames recorded only on re-renders
const stream = canvas.captureStream();

// 30 frames recorded per second
const stream = canvas.captureStream(30);
```

**Note:** To stream returned by `canvas.captureStream()` is of type [`CanvasCaptureMediaStream`] and not `MediaStream`.
This difference will be important later.

### Media Elements

In modern browsers, the `HTMLMediaElement` interface also adds the method
[`captureStream()`](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/captureStream)
that *pipes* the media content into a continuous stream.
Since `HTMLMediaElement` is implemented by both `<video />` and `<audio />` elements, we can capture media streams from both these elements.

But there's a difference.
Here, the frames are captured in *real time*.
If the video being recorded is paused, the frozen frame will be captured repeatedly.

**Note:** To use this method in Google Chrome, you need to enable the "Experimental Web Platform features" flag.
You can copy/paste the below for quick access.

```
chrome://flags/#enable-experimental-web-platform-features
```

---

## Using MediaRecorder

Using the `MediaRecorder` API is super simple.
Here's a short snippet that highlights all the key parts.

```js
// Get a MediaStream object to record
// and pass it to MediaRecorder constructor
// to create a MediaRecorder instance `recorder`
const stream = mediaElement.captureStream();
const recorder = new MediaRecorder(stream);

// When recording starts, the captured frames are emitted
// as `dataavailable` events on the `recorder`.
// These captured "chunks" can be collected in an array.
const allChunks = [];
recorder.ondataavailable = function(e) {
  allChunks.push(e.data);
}

// Start recording
recorder.start();

// We can pause capturing media and resume again later
// to deal with irregular media playback
// (likely due to user interactions or buffering)
recorder.pause();
recorder.resume();

// When we're done, we can stop recording.
// This ensures that no more media chunks are captured,
// even if media playback continues.
recorder.stop();

// We can now join all the chunks
// into a single "blob" ...
const fullBlob = new Blob(allChunks);

// ... which we can download using HTML5 `download` attribute on <a />
const link = document.createElement('a');
link.style.display = 'none';

const downloadUrl = window.URL.createObjectURL(fullBlob);
link.href = downloadUrl;
link.download = 'media.webm';

document.body.appendChild(link);
link.click();
link.remove();
```

---

## Customising

### 1. Media parameters

The constructor takes an optional argument that can have the following options:

* `mimeType`: The mime type to use for the recording.
* `audioBitsPerSecond`: The bitrate for the audio component of the media.
* `videoBitsPerSecond`: The bitrate for the video component of the media.
* `bitsPerSecond`: The bitrate for both, the audio and the video components of the media.

If `bitsPerSecond` is provided with one of `audioBitsPerSecond` or `videoBitsPerSecond`, it will be applied to the missing one.

Out of them all, `mimeType` is the most important one.
It controls the codecs used for encoding audio and video components.

```js
const codec = 'video/webm';

const recorder = new MediaRecorder(stream, {
  mimeType: codec,
  audioBitsPerSecond: 1000000 // 1 Mbps
  bitsPerSecond: 1000000      // 2 Mbps
  // videoBitsPerSecond will also be 2 Mbps
});
```

To check if a codec is supported, use [`MediaRecorder.isTypeSupported()`].

```js
MediaRecorder.isTypeSupported('video/webm'); // true
MediaRecorder.isTypeSupported('video/mp4');  // false
```

At the time of writing, the supported codecs are:

```sh
# audio codecs
audio/webm
audio/webm;codecs=opus

# video codecs
video/webm
video/webm;codecs=avc1

video/webm;codecs=h264
video/webm;codecs=h264,opus

video/webm;codecs=vp8
video/webm;codecs=vp8,opus

video/webm;codecs=vp9
video/webm;codecs=vp9,opus

video/webm;codecs=h264,vp9,opus
video/webm;codecs=vp8,vp9,opus

video/x-matroska
video/x-matroska;codecs=avc1
```

### 2. Capturing time slices

We can pass an optional argument to `MediaRecorder.start()`.
This is the `timeslice`.
It is the duration (in milliseconds) of the segment of captured media, emitted in each event.

If not specified, all media captured will be returned in a single Blob.

---

## Polyfills

At the time of writing, the whole `MediaRecorder` API is *bleeding edge* and support for [`HTMLMediaElement.captureStream()`] is rare.
But there's a way to make it work.

For capturing audio stream, we can use the [Web Audio API].
There are 3 steps:

1. Create a source node from the media element.
2. Create a stream destination node.
3. Connect the source node to the stream destination node.

For capturing video stream, we can render a `<video />` element onto a `<canvas />` element and capture frames from it.

```js
// audio polyfill

function polyfillAudio(mediaElement) {
  const audioCtx = new AudioContext();

  // create a source node and a stream destination node
  const source = audioCtx.createMediaElementSource(mediaElement);
  const destination = audioCtx.createMediaStreamDestination();

  // Connect the source node to the stream destination node
  // to push audio content into the stream
  source.connect(destination);

  // Connect the source node to the audio context's destination node
  // so the playback can still deliver audio
  source.connect(audioCtx.destination);

  const audioStream = destination.stream;

  return audioStream;
}


// video polyfill

function polyfillVideo(mediaElement) {
  // Create a canvas element
  const canvas = document.createElement('canvas');

  // Start rendering video frames onto the canvas
  renderVideoFrame(canvas, videoElement);

  const videoStream = canvas.captureStream(60);

  return videoStream;
}

function renderVideoFrame(canvas, videoElement) {
  const ctx = canvas.getContext('2d');

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  setTimeout(() => renderVideoFrame(canvas, videoElement));
}
```

Now we need to do combine the 2 streams and *voila!*

```js
const stream = new MediaStream([
  ...audioStream.getTracks(),
  ...videoStream.getTracks(),
]);
```

---

## Rocky performance

There are a few bumps in using `MediaRecorder`.

### 1. Partial Metadata

One serious problem is that the saved recordings have no duration attribute.
To record media, `MediaRecorder` uses the [Matroska] container format.
The [Matroska format] doesn't treat duration as a mandatory element.

As a result, it is not embedded in the file's header.

Also, adding it isn't an easy procedure, nor is it simple - it's doable, but "takes more than a weekend" kind of doable.

### 2. Adaptive Streaming

When capturing videos served using [DASH Adaptive Streaming], changing the resolution causes frame corruption.
I haven't yet figured out a way to sole this problem, but using the `<canvas />` polyfill seems to work just fine.


Here's a demo video highlighting the 2 problems.

<video class="center-block" src="{{site.baseurl}}/media/2017-09-02-mediarecorder/media.webm" controls></video>

---

## The end

In the future, as browser support for grows, people and organisations alike will start rolling out extensions, plugins and softwares allowing client-side media capturing.
It can be used in an [electron apps] like camera, video calling, media player.
But for today, it is more or less an niche experimental toy.

At this point, it'd be good to have some [demos] and the source [code].


[`MediaRecorder`]: https://developer.mozilla.org/docs/Web/API/MediaRecorder
[media stream]: https://developer.mozilla.org/docs/Web/API/MediaStream
[`<canvas />`]: https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement
[`CanvasCaptureMediaStream`]: https://developer.mozilla.org/docs/Web/API/CanvasCaptureMediaStream
[`MediaRecorder.isTypeSupported()`]: https://developer.mozilla.org/docs/Web/API/MediaRecorder/isTypeSupported
[`HTMLMediaElement.captureStream()`]: https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/captureStream
[Web Audio API]: https://developer.mozilla.org/docs/Web/API/Web_Audio_API
[Matroska]: https://en.wikipedia.org/wiki/Matroska
[Matroska format]: https://www.matroska.org/technical/specs/index.html
[DASH Adaptive Streaming]: https://developer.mozilla.org/docs/Web/HTML/DASH_Adaptive_Streaming_for_HTML_5_Video
[electron apps]: https://electron.atom.io/apps
[demos]: {{site.baseurl}}/gists/2017-09-04-mediarecorder
[code]: https://github.com/zhirzh/zhirzh.github.io/blob/master/gists/2017-09-04-mediarecorder
