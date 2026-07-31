/*
==================================================
數學遊戲樂園：共用計算紙畫面元件
檔案：js/scratchpad-template.js
==================================================

功能：
1. 自動建立「開啟計算紙」按鈕
2. 自動建立計算紙浮動面板
3. 建立畫筆、橡皮擦、顏色、粗細工具
4. 建立復原、重做、清除、下載按鈕
5. 呼叫 scratchpad.js 啟動計算紙
6. 避免同一頁重複建立
==================================================
*/

(function () {
  "use strict";

  /*
  ------------------------------------------------
  建立計算紙 HTML
  ------------------------------------------------
  */

  function createScratchpadMarkup() {
    /*
    避免同一頁重複建立計算紙。
    */

    if (document.getElementById("scratchpadPanel")) {
      return;
    }

    /*
    建立最外層容器。
    */

    const wrapper = document.createElement("div");

    wrapper.id = "scratchpadComponent";

    /*
    開啟計算紙按鈕與浮動面板。
    */

    wrapper.innerHTML = `
      <!-- 開啟計算紙按鈕 -->
      <button
        type="button"
        id="scratchpadOpenButton"
        class="scratchpad-open-button"
        aria-controls="scratchpadPanel"
        aria-expanded="false"
      >
        <span
          class="scratchpad-open-button__icon"
          aria-hidden="true"
        >
          ✏️
        </span>

        <span>
          開啟計算紙
        </span>
      </button>


      <!-- 計算紙浮動面板 -->
      <section
        id="scratchpadPanel"
        class="scratchpad-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="scratchpadTitle"
        hidden
      >
        <!-- 標題列 -->
        <header
          id="scratchpadHeader"
          class="scratchpad-header"
        >
          <div class="scratchpad-header__title-area">
            <span
              class="scratchpad-header__icon"
              aria-hidden="true"
            >
              📝
            </span>

            <div>
              <h2
                id="scratchpadTitle"
                class="scratchpad-header__title"
              >
                我的計算紙
              </h2>

              <p class="scratchpad-header__subtitle">
                可以自由寫下計算過程
              </p>
            </div>
          </div>

          <button
            type="button"
            id="scratchpadCloseButton"
            class="scratchpad-close-button"
            aria-label="關閉計算紙"
            title="關閉計算紙"
          >
            ×
          </button>
        </header>


        <!-- 計算紙主要內容 -->
        <div class="scratchpad-content">

          <!-- 工具列 -->
          <div
            class="scratchpad-toolbar"
            role="toolbar"
            aria-label="計算紙工具列"
          >

            <!-- 畫筆與橡皮擦 -->
            <div class="scratchpad-tool-group">
              <span class="scratchpad-tool-group__label">
                工具
              </span>

              <button
                type="button"
                id="scratchpadPenButton"
                class="
                  scratchpad-tool-button
                  scratchpad-tool-button--active
                "
                aria-label="使用畫筆"
                aria-pressed="true"
                title="畫筆"
              >
                <span
                  class="scratchpad-tool-button__icon"
                  aria-hidden="true"
                >
                  ✏️
                </span>

                <span class="scratchpad-tool-button__text">
                  畫筆
                </span>
              </button>

              <button
                type="button"
                id="scratchpadEraserButton"
                class="scratchpad-tool-button"
                aria-label="使用橡皮擦"
                aria-pressed="false"
                title="橡皮擦"
              >
                <span
                  class="scratchpad-tool-button__icon"
                  aria-hidden="true"
                >
                  🧽
                </span>

                <span class="scratchpad-tool-button__text">
                  橡皮擦
                </span>
              </button>
            </div>


            <!-- 畫筆顏色 -->
            <div class="scratchpad-tool-group">
              <span class="scratchpad-tool-group__label">
                顏色
              </span>

              <button
                type="button"
                class="
                  scratchpad-color-button
                  scratchpad-color-button--black
                  scratchpad-tool-button--active
                "
                data-scratchpad-color="#111827"
                aria-label="黑色畫筆"
                aria-pressed="true"
                title="黑色"
              ></button>

              <button
                type="button"
                class="
                  scratchpad-color-button
                  scratchpad-color-button--blue
                "
                data-scratchpad-color="#2563eb"
                aria-label="藍色畫筆"
                aria-pressed="false"
                title="藍色"
              ></button>

              <button
                type="button"
                class="
                  scratchpad-color-button
                  scratchpad-color-button--red
                "
                data-scratchpad-color="#dc2626"
                aria-label="紅色畫筆"
                aria-pressed="false"
                title="紅色"
              ></button>

              <button
                type="button"
                class="
                  scratchpad-color-button
                  scratchpad-color-button--green
                "
                data-scratchpad-color="#16a34a"
                aria-label="綠色畫筆"
                aria-pressed="false"
                title="綠色"
              ></button>
            </div>


            <!-- 畫筆粗細 -->
            <div class="scratchpad-tool-group">
              <span class="scratchpad-tool-group__label">
                粗細
              </span>

              <button
                type="button"
                class="scratchpad-size-button"
                data-scratchpad-size="2"
                aria-label="細畫筆"
                aria-pressed="false"
                title="細畫筆"
              >
                <span
                  class="
                    scratchpad-size-dot
                    scratchpad-size-dot--small
                  "
                ></span>
              </button>

              <button
                type="button"
                class="
                  scratchpad-size-button
                  scratchpad-tool-button--active
                "
                data-scratchpad-size="4"
                aria-label="中畫筆"
                aria-pressed="true"
                title="中畫筆"
              >
                <span
                  class="
                    scratchpad-size-dot
                    scratchpad-size-dot--medium
                  "
                ></span>
              </button>

              <button
                type="button"
                class="scratchpad-size-button"
                data-scratchpad-size="8"
                aria-label="粗畫筆"
                aria-pressed="false"
                title="粗畫筆"
              >
                <span
                  class="
                    scratchpad-size-dot
                    scratchpad-size-dot--large
                  "
                ></span>
              </button>
            </div>


            <!-- 復原與重做 -->
            <div class="scratchpad-tool-group">
              <button
                type="button"
                id="scratchpadUndoButton"
                class="
                  scratchpad-tool-button
                  scratchpad-tool-button--compact
                "
                aria-label="復原上一筆"
                title="復原 Ctrl+Z"
                disabled
              >
                <span
                  class="scratchpad-tool-button__icon"
                  aria-hidden="true"
                >
                  ↶
                </span>

                <span class="scratchpad-tool-button__text">
                  復原
                </span>
              </button>

              <button
                type="button"
                id="scratchpadRedoButton"
                class="
                  scratchpad-tool-button
                  scratchpad-tool-button--compact
                "
                aria-label="重做下一筆"
                title="重做 Ctrl+Y"
                disabled
              >
                <span
                  class="scratchpad-tool-button__icon"
                  aria-hidden="true"
                >
                  ↷
                </span>

                <span class="scratchpad-tool-button__text">
                  重做
                </span>
              </button>
            </div>


            <!-- 清除與下載 -->
            <div class="scratchpad-tool-group">
              <button
                type="button"
                id="scratchpadClearButton"
                class="
                  scratchpad-tool-button
                  scratchpad-tool-button--danger
                  scratchpad-tool-button--compact
                "
                aria-label="清除全部計算內容"
                title="清除全部"
                disabled
              >
                <span
                  class="scratchpad-tool-button__icon"
                  aria-hidden="true"
                >
                  🗑️
                </span>

                <span class="scratchpad-tool-button__text">
                  清除
                </span>
              </button>

              <button
                type="button"
                id="scratchpadDownloadButton"
                class="
                  scratchpad-tool-button
                  scratchpad-tool-button--download
                  scratchpad-tool-button--compact
                "
                aria-label="下載計算紙圖片"
                title="下載圖片"
                disabled
              >
                <span
                  class="scratchpad-tool-button__icon"
                  aria-hidden="true"
                >
                  ⬇️
                </span>

                <span class="scratchpad-tool-button__text">
                  下載
                </span>
              </button>
            </div>
          </div>


          <!-- Canvas 畫布區域 -->
          <div class="scratchpad-canvas-container">
            <div
              id="scratchpadCanvasHint"
              class="scratchpad-canvas-hint"
            >
              在這裡寫下計算過程
            </div>

            <canvas
              id="scratchpadCanvas"
              class="scratchpad-canvas"
              tabindex="0"
              aria-label="數學計算紙畫布"
            >
              您的瀏覽器不支援 Canvas。
            </canvas>
          </div>
        </div>
      </section>
    `;

    /*
    將計算紙加到網頁 body 最下面。
    */

    document.body.appendChild(wrapper);
  }


  /*
  ------------------------------------------------
  啟動計算紙
  ------------------------------------------------
  */

  function initializeScratchpadComponent() {
    createScratchpadMarkup();

    /*
    確認 scratchpad.js 已載入。
    */

    if (
      typeof window.createScratchpad !==
      "function"
    ) {
      console.error(
        "找不到 createScratchpad()，請確認 scratchpad.js 已經正確載入。"
      );

      return null;
    }

    /*
    避免重複初始化。
    */

    if (window.mathScratchpad) {
      return window.mathScratchpad;
    }

    /*
    建立計算紙物件。

    這些 ID 必須與上方 HTML 一致。
    */

    window.mathScratchpad =
      window.createScratchpad({
        canvasId: "scratchpadCanvas",
        panelId: "scratchpadPanel",
        headerId: "scratchpadHeader",
        openButtonId: "scratchpadOpenButton",
        closeButtonId: "scratchpadCloseButton",

        penButtonId: "scratchpadPenButton",
        eraserButtonId: "scratchpadEraserButton",
        undoButtonId: "scratchpadUndoButton",
        redoButtonId: "scratchpadRedoButton",
        clearButtonId: "scratchpadClearButton",
        downloadButtonId:
          "scratchpadDownloadButton",

        defaultColor: "#111827",
        defaultSize: 4
      });

    /*
    計算紙成功建立後，
    綁定提示文字隱藏功能。
    */

    bindCanvasHint();

    return window.mathScratchpad;
  }


  /*
  ------------------------------------------------
  畫圖後隱藏提示文字
  ------------------------------------------------
  */

  function bindCanvasHint() {
    const canvas =
      document.getElementById(
        "scratchpadCanvas"
      );

    const hint =
      document.getElementById(
        "scratchpadCanvasHint"
      );

    if (!canvas || !hint) {
      return;
    }

    const hideHint = function () {
      hint.hidden = true;
    };

    canvas.addEventListener(
      "pointerdown",
      hideHint,
      {
        once: true
      }
    );
  }


  /*
  ------------------------------------------------
  新題目時清除計算紙
  ------------------------------------------------

  遊戲產生新題目時，可以使用：

  window.resetGameScratchpad();
  */

  window.resetGameScratchpad =
    function () {
      if (
        window.mathScratchpad &&
        typeof window.mathScratchpad
          .newQuestion === "function"
      ) {
        window.mathScratchpad
          .newQuestion();
      }

      const hint =
        document.getElementById(
          "scratchpadCanvasHint"
        );

      if (hint) {
        hint.hidden = false;
      }

      /*
      重新綁定第一次畫圖後隱藏提示。
      */

      bindCanvasHint();
    };


  /*
  ------------------------------------------------
  開啟計算紙
  ------------------------------------------------
  */

  window.openGameScratchpad =
    function () {
      if (
        window.mathScratchpad &&
        typeof window.mathScratchpad.open ===
          "function"
      ) {
        window.mathScratchpad.open();
      }
    };


  /*
  ------------------------------------------------
  關閉計算紙
  ------------------------------------------------
  */

  window.closeGameScratchpad =
    function () {
      if (
        window.mathScratchpad &&
        typeof window.mathScratchpad.close ===
          "function"
      ) {
        window.mathScratchpad.close();
      }
    };


  /*
  ------------------------------------------------
  網頁載入後自動啟動
  ------------------------------------------------
  */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeScratchpadComponent
    );
  } else {
    initializeScratchpadComponent();
  }
})();
