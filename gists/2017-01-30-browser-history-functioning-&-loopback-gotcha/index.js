(function init() {
  'use strict';

  const data = {
    history: [
      // 'New Tab',
      window.location.hash.slice(1),
    ],
    active: 0,
  };


  // create copies of window.history methods
  const historyPushState = history.pushState;
  const historyBack = history.back;
  const historyForward = history.forward;

  // override window.history
  function pushState(state, title, url) {
    let isNew = false;
    if (data.active < data.history.length-1) {
      // new history branch
      isNew = true;

      const currentBranchNodes = Array.from(document.querySelectorAll('#historyStructure .node'));
      currentBranchNodes.slice(data.active + 1)
        .forEach((span, i) => {
          span.classList.add('deleted');
        });

      historyStructure.removeAttribute('id');
      historyStructures.innerHTML = `<div id="historyStructure"></div>${historyStructures.innerHTML}`;

      // truncate history list
      data.history.length = data.active + 1;
    }

    data.history.push(url.match(/#(.*)/)[1]);
    data.active++;

    render(isNew);

    historyPushState.call(history, state, title, url);
  }

  function back() {
    if (data.active <= 0) {
      return;
    }

    data.active--;

    historyBack.call(history);
    render();
  }

  function forward() {
    if (data.active >= data.history.length - 1) {
      return;
    }

    data.active++;

    historyForward.call(history);
    render();
  }


  // DOM interaction
  function backBtnOnclick() {
    history.back();
  }

  function forwardBtnOnclick() {
    history.forward();
  }

  function navOnclick() {
    const href = this.getAttribute('href');
    history.pushState({
      timestamp: +(new Date()),
    }, '', href);

    // return false;
  }

  function render(isNew = false) {
    historyStructure.innerHTML = data.history.map((x, i) => (
      `<span class="node ${(i === data.active) ? 'active' : ''}">
        ${x}
      </span>`
    )).join('<span class="arrow">&harr;</span>');
  }


  history.pushState = pushState;
  history.back = back;
  history.forward = forward;

  backBtn.onclick = backBtnOnclick;
  forwardBtn.onclick = forwardBtnOnclick;

  Array.from(document.querySelectorAll('a')).forEach((a) => (a.onclick = navOnclick));

  window.onpopstate = function(e) {
    // connect browser's back/forward button to the app
  };

  render();
})();
