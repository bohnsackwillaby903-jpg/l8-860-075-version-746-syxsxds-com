function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var overlay = document.getElementById('player-overlay');
  var hlsInstance = null;
  var sourceReady = false;

  if (!video || !streamUrl) {
    return;
  }

  function attachSource() {
    if (sourceReady) {
      return;
    }

    sourceReady = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.setAttribute('data-state', 'unsupported');
  }

  function startPlayback() {
    attachSource();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
