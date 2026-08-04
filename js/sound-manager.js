/*
==================================================
數學遊戲樂園：共用音效管理元件
檔案位置：js/sound-manager.js
==================================================

功能：
1. 答對提示音
2. 答錯提示音
3. 按鈕提示音
4. 倒數提醒音
5. 遊戲完成音
6. 音量控制
7. 靜音控制
8. 不需要另外準備 mp3 檔案
9. 使用 Web Audio API 即時產生溫和音效
==================================================
*/

(function () {
  "use strict";

  const STORAGE_KEYS = {
    muted: "mathGameSoundMuted",
    volume: "mathGameSoundVolume"
  };

  class SoundManager {
    constructor(options = {}) {
      this.options = options;

      this.audioContext = null;

      this.masterGain = null;

      this.isMuted =
        this.readStoredMuted();

      this.volume =
        this.readStoredVolume();

      this.minimumVolume = 0;
      this.maximumVolume = 1;

      this.isInitialized = false;

      this.activeOscillators =
        new Set();

      /*
      瀏覽器通常要求玩家先操作頁面，
      才允許播放音效。

      因此第一次點擊、觸控或按鍵時，
      自動啟用 AudioContext。
      */

      this.installAutoUnlock();
    }

    /*
    ==================================================
    儲存設定
    ==================================================
    */

    readStoredMuted() {
      try {
        return (
          window.localStorage.getItem(
            STORAGE_KEYS.muted
          ) === "true"
        );
      } catch (error) {
        return false;
      }
    }

    readStoredVolume() {
      try {
        const stored =
          Number(
            window.localStorage.getItem(
              STORAGE_KEYS.volume
            )
          );

        if (
          Number.isFinite(stored) &&
          stored >= 0 &&
          stored <= 1
        ) {
          return stored;
        }
      } catch (error) {
        // 使用預設音量。
      }

      return 0.45;
    }

    saveSettings() {
      try {
        window.localStorage.setItem(
          STORAGE_KEYS.muted,
          String(this.isMuted)
        );

        window.localStorage.setItem(
          STORAGE_KEYS.volume,
          String(this.volume)
        );
      } catch (error) {
        console.warn(
          "音效設定無法儲存：",
          error
        );
      }
    }

    /*
    ==================================================
    初始化 AudioContext
    ==================================================
    */

    initialize() {
      if (this.isInitialized) {
        return true;
      }

      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) {
        console.warn(
          "目前瀏覽器不支援 Web Audio API。"
        );

        return false;
      }

      try {
        this.audioContext =
          new AudioContextClass();

        this.masterGain =
          this.audioContext.createGain();

        this.masterGain.gain.value =
          this.isMuted
            ? 0
            : this.volume;

        this.masterGain.connect(
          this.audioContext.destination
        );

        this.isInitialized = true;

        return true;
      } catch (error) {
        console.error(
          "音效系統初始化失敗：",
          error
        );

        return false;
      }
    }

    async unlock() {
      if (!this.initialize()) {
        return false;
      }

      if (
        this.audioContext.state ===
        "suspended"
      ) {
        try {
          await this.audioContext.resume();
        } catch (error) {
          console.warn(
            "音效系統無法啟用：",
            error
          );

          return false;
        }
      }

      return (
        this.audioContext.state ===
        "running"
      );
    }

    installAutoUnlock() {
      const unlockEvents = [
        "pointerdown",
        "touchstart",
        "keydown"
      ];

      const unlockHandler =
        async () => {
          const success =
            await this.unlock();

          if (!success) {
            return;
          }

          unlockEvents.forEach(
            (eventName) => {
              window.removeEventListener(
                eventName,
                unlockHandler
              );
            }
          );
        };

      unlockEvents.forEach(
        (eventName) => {
          window.addEventListener(
            eventName,
            unlockHandler,
            {
              once: false,
              passive: true
            }
          );
        }
      );
    }

    /*
    ==================================================
    音量與靜音
    ==================================================
    */

    setVolume(value) {
      const numericValue =
        Number(value);

      if (!Number.isFinite(numericValue)) {
        return this.volume;
      }

      this.volume =
        Math.min(
          this.maximumVolume,
          Math.max(
            this.minimumVolume,
            numericValue
          )
        );

      if (
        this.masterGain &&
        !this.isMuted
      ) {
        this.masterGain.gain.setValueAtTime(
          this.volume,
          this.audioContext.currentTime
        );
      }

      this.saveSettings();

      return this.volume;
    }

    getVolume() {
      return this.volume;
    }

    mute() {
      this.isMuted = true;

      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(
          0,
          this.audioContext.currentTime
        );
      }

      this.saveSettings();
    }

    unmute() {
      this.isMuted = false;

      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(
          this.volume,
          this.audioContext.currentTime
        );
      }

      this.saveSettings();
    }

    toggleMute() {
      if (this.isMuted) {
        this.unmute();
      } else {
        this.mute();
      }

      return this.isMuted;
    }

    getMuted() {
      return this.isMuted;
    }

    /*
    ==================================================
    基本音符播放
    ==================================================
    */

    async playTone({
      frequency = 440,
      duration = 0.18,
      type = "sine",
      volume = 0.18,
      startDelay = 0,
      attack = 0.015,
      release = 0.08
    } = {}) {
      if (this.isMuted) {
        return false;
      }

      const ready =
        await this.unlock();

      if (
        !ready ||
        !this.audioContext ||
        !this.masterGain
      ) {
        return false;
      }

      const context =
        this.audioContext;

      const startTime =
        context.currentTime +
        Math.max(0, startDelay);

      const stopTime =
        startTime +
        Math.max(0.04, duration);

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.type =
        type;

      oscillator.frequency.setValueAtTime(
        Math.max(20, frequency),
        startTime
      );

      /*
      使用淡入與淡出，
      避免音效過於尖銳。
      */

      gain.gain.setValueAtTime(
        0.0001,
        startTime
      );

      gain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, volume),
        startTime +
          Math.max(0.005, attack)
      );

      gain.gain.setValueAtTime(
        Math.max(0.0001, volume),
        Math.max(
          startTime + attack,
          stopTime - release
        )
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        stopTime
      );

      oscillator.connect(gain);

      gain.connect(
        this.masterGain
      );

      this.activeOscillators.add(
        oscillator
      );

      oscillator.addEventListener(
        "ended",
        () => {
          this.activeOscillators.delete(
            oscillator
          );

          oscillator.disconnect();
          gain.disconnect();
        },
        {
          once: true
        }
      );

      oscillator.start(startTime);
      oscillator.stop(stopTime);

      return true;
    }

    /*
    ==================================================
    常用提示音
    ==================================================
    */

    async playCorrect() {
      /*
      溫和上升音：
      C5 → E5 → G5
      */

      await Promise.all([
        this.playTone({
          frequency: 523.25,
          duration: 0.18,
          type: "sine",
          volume: 0.16,
          startDelay: 0
        }),

        this.playTone({
          frequency: 659.25,
          duration: 0.2,
          type: "sine",
          volume: 0.15,
          startDelay: 0.11
        }),

        this.playTone({
          frequency: 783.99,
          duration: 0.25,
          type: "sine",
          volume: 0.14,
          startDelay: 0.22
        })
      ]);
    }

    async playWrong() {
      /*
      溫和下降音：
      E4 → C4

      避免使用刺耳蜂鳴聲。
      */

      await Promise.all([
        this.playTone({
          frequency: 329.63,
          duration: 0.2,
          type: "triangle",
          volume: 0.13,
          startDelay: 0
        }),

        this.playTone({
          frequency: 261.63,
          duration: 0.26,
          type: "triangle",
          volume: 0.12,
          startDelay: 0.15
        })
      ]);
    }

    async playClick() {
      await this.playTone({
        frequency: 520,
        duration: 0.07,
        type: "sine",
        volume: 0.08,
        attack: 0.005,
        release: 0.035
      });
    }

    async playCountdown() {
      await this.playTone({
        frequency: 880,
        duration: 0.1,
        type: "sine",
        volume: 0.1,
        attack: 0.005,
        release: 0.045
      });
    }

    async playUrgentCountdown() {
      await Promise.all([
        this.playTone({
          frequency: 880,
          duration: 0.08,
          type: "square",
          volume: 0.06,
          startDelay: 0
        }),

        this.playTone({
          frequency: 1046.5,
          duration: 0.08,
          type: "square",
          volume: 0.055,
          startDelay: 0.1
        })
      ]);
    }

    async playStart() {
      await Promise.all([
        this.playTone({
          frequency: 392,
          duration: 0.14,
          type: "sine",
          volume: 0.12,
          startDelay: 0
        }),

        this.playTone({
          frequency: 523.25,
          duration: 0.2,
          type: "sine",
          volume: 0.13,
          startDelay: 0.12
        })
      ]);
    }

    async playComplete() {
      /*
      遊戲完成：
      C5 → E5 → G5 → C6
      */

      await Promise.all([
        this.playTone({
          frequency: 523.25,
          duration: 0.2,
          type: "sine",
          volume: 0.14,
          startDelay: 0
        }),

        this.playTone({
          frequency: 659.25,
          duration: 0.2,
          type: "sine",
          volume: 0.14,
          startDelay: 0.13
        }),

        this.playTone({
          frequency: 783.99,
          duration: 0.22,
          type: "sine",
          volume: 0.14,
          startDelay: 0.26
        }),

        this.playTone({
          frequency: 1046.5,
          duration: 0.34,
          type: "sine",
          volume: 0.13,
          startDelay: 0.4
        })
      ]);
    }

    async playLevelUp() {
      await Promise.all([
        this.playTone({
          frequency: 392,
          duration: 0.16,
          type: "triangle",
          volume: 0.12,
          startDelay: 0
        }),

        this.playTone({
          frequency: 523.25,
          duration: 0.18,
          type: "triangle",
          volume: 0.13,
          startDelay: 0.12
        }),

        this.playTone({
          frequency: 659.25,
          duration: 0.2,
          type: "triangle",
          volume: 0.13,
          startDelay: 0.24
        }),

        this.playTone({
          frequency: 783.99,
          duration: 0.28,
          type: "triangle",
          volume: 0.13,
          startDelay: 0.36
        })
      ]);
    }

    /*
    ==================================================
    停止音效
    ==================================================
    */

    stopAll() {
      this.activeOscillators.forEach(
        (oscillator) => {
          try {
            oscillator.stop();
          } catch (error) {
            // 已停止的音效可以忽略。
          }
        }
      );

      this.activeOscillators.clear();
    }

    /*
    ==================================================
    取得狀態
    ==================================================
    */

    getState() {
      return {
        muted: this.isMuted,
        volume: this.volume,
        initialized:
          this.isInitialized,
        contextState:
          this.audioContext?.state ||
          "not-created"
      };
    }
  }

  /*
  ==================================================
  建立全站共用實例
  ==================================================
  */

  const soundManager =
    new SoundManager();

  window.MathGameSound =
    soundManager;

  /*
  提供較短的別名。
  */

  window.GameSound =
    soundManager;

  console.log(
    "共用音效管理元件已載入。"
  );
})();