function debounce(fn, delta, context) {
  var timeoutID = null;

  return function() {
    clearTimeout(timeoutID);

    var args = arguments;
    timeoutID = setTimeout(function() {
      fn.apply(context, args);
    }, delta);
  };
}

function immediate(fn, delta, context) {
  var timeoutID = null;
  var safe = true;

  return function() {
    var args = arguments;

    if (safe) {
      fn.call(context, args);
      safe = false;
    }

    clearTimeout(timeoutID);
    timeoutID = setTimeout(function() {
      safe = true;
    }, delta);
  };
}

function throttle(fn, delta, context) {
  var safe = true;

  return function() {
    var args = arguments;

    if (safe) {
      fn.call(context, args);

      safe = false;
      setTimeout(function() {
        safe = true;
      }, delta);
    }
  };
}

// alternate implementation
function throttle(fn, delta, context) {
  return function() {
    var args = arguments;
    var then = 0;

    function repeat(now) {
      requestAnimationFrame(repeat);
      if (now - then >= delta) {
        then = now;
        fn.call(context, args);
      }
    }

    requestAnimationFrame(repeat);
  }
}
