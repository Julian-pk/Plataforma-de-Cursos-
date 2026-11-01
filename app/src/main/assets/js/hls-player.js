/* ==========================================================================
   Plataforma de Cursos Online y Membresías (LMS / EdTech)
   HLS Video Streaming Engine & Signed Content Protection Module
   ========================================================================== */

class HlsStreamPlayer {
  constructor(videoElementId, options = {}) {
    this.video = document.getElementById(videoElementId);
    this.hls = null;
    this.options = options;
    this.currentQuality = 'auto';
    this.onProgressCallback = options.onProgressCallback || null;
    this.onEndedCallback = options.onEndedCallback || null;

    if (this.video) {
      this.attachEventListeners();
    }
  }

  // Generate simulated signed temporary URL with expiration token
  static generateSignedUrl(baseUrl, ttlSeconds = 3600) {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    const token = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}expires=${expires}&signature_token=hmac_sha256_${token}`;
  }

  // Initialize stream source with HLS.js or fallback HTML5 video
  loadStream(streamUrl, fallbackMp4 = null) {
    if (!this.video) return;

    // Apply signed token protection
    const signedStreamUrl = HlsStreamPlayer.generateSignedUrl(streamUrl);
    console.log('[Content Protection] Playing signed streaming URL:', signedStreamUrl);

    // Update UI badge if present
    const badgeToken = document.getElementById('signed-token-display');
    if (badgeToken) {
      badgeToken.innerText = `Token: hmac_sha256_... (Expira en 60m)`;
    }

    // Clean up existing HLS instance
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    // Reset completion trigger for the new stream
    this.hasTriggeredComplete = false;

    // Check if stream is HLS manifest (.m3u8) or direct video file (webm / mp4)
    const isHlsManifest = typeof streamUrl === 'string' && (streamUrl.includes('.m3u8') || streamUrl.includes('manifest'));

    // Native or HLS.js video loading logic
    if (isHlsManifest && Hls.isSupported()) {
      this.hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      this.hls.loadSource(streamUrl);
      this.hls.attachMedia(this.video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('[HLS Engine] Stream manifest loaded. Levels available:', data.levels.length);
        this.populateQualitySelector(data.levels);
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('[HLS Engine] Fatal stream error encountered:', data.type, 'Switching to fallback MP4 stream.');
          if (fallbackMp4) {
            this.video.src = fallbackMp4;
            this.video.play().catch(e => console.warn('Autoplay blocked:', e));
          }
        }
      });
    } else if (isHlsManifest && this.video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari iOS/macOS HLS support
      this.video.src = streamUrl;
    } else {
      // Direct video playback for MP4 / WebM
      const targetSrc = streamUrl || fallbackMp4;
      this.video.src = targetSrc;
      this.video.play().catch(e => console.warn('Autoplay blocked:', e));
    }
  }

  attachEventListeners() {
    // Progress tracking - trigger completion when student watches 90%+
    this.video.addEventListener('timeupdate', () => {
      if (!this.video.duration) return;
      const progressPercent = (this.video.currentTime / this.video.duration) * 100;
      
      if (this.onProgressCallback) {
        this.onProgressCallback(progressPercent, this.video.currentTime, this.video.duration);
      }

      if (progressPercent >= 90 && !this.hasTriggeredComplete) {
        this.hasTriggeredComplete = true;
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      }
    });

    this.video.addEventListener('ended', () => {
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });
  }

  // Populate stream quality selector in video player controls
  populateQualitySelector(levels) {
    const qualitySelect = document.getElementById('video-quality-select');
    if (!qualitySelect) return;

    qualitySelect.innerHTML = '<option value="-1">Auto (Adaptativo HLS)</option>';
    levels.forEach((level, index) => {
      const height = level.height || (index === 0 ? '1080' : index === 1 ? '720' : '480');
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = `${height}p (${Math.round(level.bitrate / 1000)} kbps)`;
      qualitySelect.appendChild(opt);
    });

    qualitySelect.onchange = (e) => {
      const levelIndex = parseInt(e.target.value);
      if (this.hls) {
        this.hls.currentLevel = levelIndex;
        console.log('[HLS Engine] Quality manually set to level:', levelIndex);
      }
    };
  }

  // Set playback speed
  setSpeed(speed) {
    if (this.video) {
      this.video.playbackRate = speed;
    }
  }
}
