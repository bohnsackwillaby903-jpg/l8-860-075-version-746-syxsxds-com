import { H as Hls } from "./hls-vendor-dru42stk.js";

const mountPlayer = () => {
  const player = document.querySelector("[data-player]");

  if (!player) {
    return;
  }

  const video = player.querySelector("video");
  const button = player.querySelector("[data-play-button]");
  const source = player.dataset.source;
  let hls = null;
  let attached = false;

  const attach = () => {
    if (attached || !video || !source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    video.controls = true;
    attached = true;
  };

  const play = async () => {
    attach();

    if (button) {
      button.classList.add("is-hidden");
    }

    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  };

  if (button) {
    button.addEventListener("click", play);
  }

  if (video) {
    video.addEventListener("click", () => {
      if (!attached || video.paused) {
        play();
      }
    });
  }

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
};

mountPlayer();
