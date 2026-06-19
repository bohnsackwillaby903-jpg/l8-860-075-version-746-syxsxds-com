(function () {
  window.initMoviePlayer = function (playUrl) {
    function ready(callback) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
      } else {
        callback();
      }
    }

    ready(function () {
      var shell = document.querySelector(".player-shell");
      if (!shell) {
        return;
      }

      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var button = shell.querySelector(".player-button");
      var loaded = false;
      var hls = null;

      function bindSource() {
        if (loaded || !video || !playUrl) {
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(playUrl);
          hls.attachMedia(video);
        } else {
          video.src = playUrl;
        }
      }

      function startPlayback(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        bindSource();

        if (overlay) {
          overlay.classList.add("hidden");
        }

        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            video.controls = true;
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!loaded) {
            startPlayback();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  };
})();
