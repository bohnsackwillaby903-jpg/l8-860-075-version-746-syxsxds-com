import { H as Hls } from "./hls-dru42stk.js";

export function initMoviePlayer(src) {
    const ready = () => {
        const video = document.querySelector("[data-player-video]");
        const overlay = document.querySelector("[data-player-overlay]");
        const status = document.querySelector("[data-player-status]");
        let prepared = false;
        let hls = null;

        if (!video || !overlay) {
            return;
        }

        const setStatus = (text) => {
            if (status) {
                status.textContent = text;
            }
        };

        const prepare = () => {
            if (prepared) {
                return;
            }
            prepared = true;
            video.controls = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                setStatus("视频暂时无法播放");
            }
        };

        const play = () => {
            prepare();
            overlay.classList.add("is-hidden");
            const result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(() => {
                    overlay.classList.remove("is-hidden");
                    setStatus("点击继续播放");
                });
            }
        };

        overlay.addEventListener("click", play);
        video.addEventListener("click", () => {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", () => {
            overlay.classList.add("is-hidden");
            setStatus("");
        });
        video.addEventListener("pause", () => {
            if (!video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
        video.addEventListener("error", () => {
            setStatus("视频暂时无法播放");
        });
        window.addEventListener("beforeunload", () => {
            if (hls) {
                hls.destroy();
            }
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", ready, { once: true });
    } else {
        ready();
    }
}
