(function () {
  function startPlayer(box) {
    var video = box.querySelector("video");
    var layer = box.querySelector(".player-cover");
    var url = box.getAttribute("data-video");
    var opened = false;
    function play() {
      if (!video || !url) {
        return;
      }
      if (layer) {
        layer.classList.add("is-hidden");
      }
      if (opened) {
        video.play().catch(function () {});
        return;
      }
      opened = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          maxBufferLength: 45
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = url;
      video.play().catch(function () {});
    }
    if (layer) {
      layer.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", play);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell[data-video]")).forEach(startPlayer);
  });
}());
