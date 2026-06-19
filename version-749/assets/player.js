(function () {
    function setupPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play]');
        var message = player.querySelector('.player-message');
        var source = video ? video.querySelector('source') : null;
        var streamUrl = source ? source.getAttribute('src') : '';
        var hls = null;
        var prepared = false;
        var pendingPlay = false;

        if (!video || !streamUrl) {
            if (message) {
                message.textContent = '视频暂时无法播放';
            }
            return;
        }

        function showMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function requestPlay() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    showMessage('点击视频区域继续播放');
                });
            }
        }

        function prepareVideo() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (pendingPlay) {
                        requestPlay();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (_event, data) {
                    if (data && data.fatal) {
                        showMessage('视频加载失败，请稍后重试');
                    }
                });
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.load();
                return;
            }
            showMessage('播放功能暂时不可用');
        }

        function playVideo() {
            pendingPlay = true;
            prepareVideo();
            requestPlay();
        }

        if (button) {
            button.addEventListener('click', function () {
                playVideo();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
            pendingPlay = false;
            showMessage('');
        });

        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
        });

        video.addEventListener('error', function () {
            showMessage('视频加载失败，请稍后重试');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(setupPlayer);
    });
}());
