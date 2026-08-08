/*
==================================================
數學遊戲樂園：共用計算紙
檔案位置：js/scratchpad.js
版本：2.0 - Pointer Events 統一拖曳版
==================================================

重點：
1. 滑鼠、平板、手機統一使用 Pointer Events。
2. 深黃色標題列可拖曳。
3. 淺黃色工具列空白處可拖曳。
4. 功能按鈕仍只執行原本功能，不啟動拖曳。
5. Canvas 只負責書寫，不啟動面板拖曳。
6. 使用 setPointerCapture()，手指移出原區域仍可持續拖曳。
7. 關閉再開啟保留最後位置；重新整理頁面才重設。
8. 桌面版保留八方向縮放；手機與平板不顯示縮放控制點。
==================================================
*/

(function () {
  "use strict";

  class Scratchpad {
    constructor(options = {}) {
      this.options = options;

      this.canvasId = options.canvasId || "scratchpadCanvas";
      this.panelId = options.panelId || "scratchpadPanel";
      this.headerId = options.headerId || "scratchpadHeader";
      this.openButtonId = options.openButtonId || "scratchpadOpenButton";
      this.closeButtonId = options.closeButtonId || "scratchpadCloseButton";
      this.penButtonId = options.penButtonId || "scratchpadPenButton";
      this.eraserButtonId = options.eraserButtonId || "scratchpadEraserButton";
      this.undoButtonId = options.undoButtonId || "scratchpadUndoButton";
      this.redoButtonId = options.redoButtonId || "scratchpadRedoButton";
      this.clearButtonId = options.clearButtonId || "scratchpadClearButton";
      this.downloadButtonId = options.downloadButtonId || "scratchpadDownloadButton";

      this.defaultColor = options.defaultColor || "#111827";
      this.defaultSize = Number(options.defaultSize) || 4;
      this.maxHistory = Number(options.maxHistory) || 30;

      this.canvas = document.getElementById(this.canvasId);
      this.panel = document.getElementById(this.panelId);
      this.header = document.getElementById(this.headerId);
      this.openButton = document.getElementById(this.openButtonId);
      this.closeButton = document.getElementById(this.closeButtonId);
      this.penButton = document.getElementById(this.penButtonId);
      this.eraserButton = document.getElementById(this.eraserButtonId);
      this.undoButton = document.getElementById(this.undoButtonId);
      this.redoButton = document.getElementById(this.redoButtonId);
      this.clearButton = document.getElementById(this.clearButtonId);
      this.downloadButton = document.getElementById(this.downloadButtonId);

      this.toolbar = this.panel?.querySelector(".scratchpad-toolbar") || null;

      this.colorButtons = this.panel
        ? Array.from(
            this.panel.querySelectorAll(
              "[data-scratchpad-color]"
            )
          )
        : [];

      this.sizeButtons = this.panel
        ? Array.from(
            this.panel.querySelectorAll(
              "[data-scratchpad-size]"
            )
          )
        : [];

      this.ctx = null;

      this.tool = "pen";
      this.currentColor = this.defaultColor;
      this.currentSize = this.defaultSize;

      this.isDrawing = false;
      this.drawingPointerId = null;
      this.hasDrawnInCurrentStroke = false;
      this.lastX = 0;
      this.lastY = 0;

      this.undoStack = [];
      this.redoStack = [];
      this.currentQuestionImage = null;
      this.isRestoringHistory = false;

      this.isOpen = false;
      this.isOpeningPanel = false;

      this.isDraggingPanel = false;
      this.dragPointerId = null;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
      this.savedPanelPosition = null;

      this.isResizingPanel = false;
      this.resizePointerId = null;
      this.resizeDirection = "";
      this.resizeStartX = 0;
      this.resizeStartY = 0;
      this.resizeStartLeft = 0;
      this.resizeStartTop = 0;
      this.resizeStartWidth = 0;
      this.resizeStartHeight = 0;

      this.resizeHandles = [];

      this.resizeMinWidth =
        Number(options.resizeMinWidth) || 320;

      this.resizeMinHeight =
        Number(options.resizeMinHeight) || 300;

      this.eventCleanups = [];
      this.resizeTimer = null;
      this.isDestroyed = false;

      if (
        !this.canvas ||
        !this.panel
      ) {
        console.error(
          "Scratchpad 初始化失敗：找不到 Canvas 或面板。"
        );

        return;
      }

      this.ctx =
        this.canvas.getContext(
          "2d"
        );

      if (!this.ctx) {
        console.error(
          "Scratchpad 初始化失敗：無法建立 Canvas 2D 環境。"
        );

        return;
      }

      this.initialize();
    }

    initialize() {
      this.initializeProtection();
      this.initializeDrawing();
      this.initializeToolbar();
      this.initializeWindow();
      this.initializeKeyboardShortcuts();
      this.initializeResizeHandles();
      this.initializeResizeListener();

      this.setupCanvas(false);
      this.saveHistory(true);
      this.saveCurrentQuestionImage();
      this.updateToolbarState();
    }

    addEvent(
      element,
      eventName,
      handler,
      options
    ) {
      if (!element) {
        return;
      }

      element.addEventListener(
        eventName,
        handler,
        options
      );

      this.eventCleanups.push(
        () => {
          element.removeEventListener(
            eventName,
            handler,
            options
          );
        }
      );
    }

    /*
    ==================================================
    裝置與尺寸
    ==================================================
    */

    isDesktopResizeView() {
      return (
        window.innerWidth >= 981
      );
    }

    getViewportMargin() {
      return (
        window.innerWidth <= 560
          ? 8
          : 12
      );
    }

    getDefaultPanelSize() {
      const width =
        window.innerWidth;

      const height =
        window.innerHeight;

      if (
        width <= 560
      ) {
        return {
          width:
            Math.max(
              280,
              Math.min(
                360,
                Math.round(
                  width * 0.86
                )
              )
            ),

          height:
            Math.max(
              360,
              Math.min(
                520,
                Math.round(
                  height * 0.70
                )
              )
            )
        };
      }

      if (
        width <= 980
      ) {
        return {
          width:
            Math.max(
              340,
              Math.min(
                460,
                Math.round(
                  width * 0.72
                )
              )
            ),

          height:
            Math.max(
              420,
              Math.min(
                580,
                Math.round(
                  height * 0.72
                )
              )
            )
        };
      }

      return {
        width: 430,
        height: 560
      };
    }

    applyResponsivePanelSize(
      force = false
    ) {
      if (!this.panel) {
        return;
      }

      if (
        !force &&
        this.isDesktopResizeView() &&
        this.panel.dataset.userResized ===
          "true"
      ) {
        return;
      }

      const size =
        this.getDefaultPanelSize();

      this.panel.style.width =
        `${
          Math.min(
            size.width,
            window.innerWidth -
              this.getViewportMargin() *
                2
          )
        }px`;

      this.panel.style.height =
        `${
          Math.min(
            size.height,
            window.innerHeight -
              this.getViewportMargin() *
                2
          )
        }px`;
    }

    /*
    ==================================================
    Canvas
    ==================================================
    */

    getPixelRatio() {
      return (
        Math.max(
          1,
          window.devicePixelRatio ||
            1
        )
      );
    }

    async setupCanvas(
      preserveContent = false,
      savedImageOverride = null
    ) {
      if (
        !this.canvas ||
        !this.ctx
      ) {
        return;
      }

      const rect =
        this.canvas
          .getBoundingClientRect();

      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        return;
      }

      const oldImage =
        savedImageOverride ||
        (
          preserveContent &&
          this.canvas.width &&
          this.canvas.height
            ? this.canvas.toDataURL(
                "image/png"
              )
            : null
        );

      const ratio =
        this.getPixelRatio();

      this.canvas.width =
        Math.max(
          1,
          Math.round(
            rect.width *
            ratio
          )
        );

      this.canvas.height =
        Math.max(
          1,
          Math.round(
            rect.height *
            ratio
          )
        );

      this.ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );

      this.ctx.lineCap =
        "round";

      this.ctx.lineJoin =
        "round";

      this.ctx.globalCompositeOperation =
        "source-over";

      if (oldImage) {
        await this.drawImageToCanvas(
          oldImage
        );
      }
    }

    drawImageToCanvas(
      imageData
    ) {
      return new Promise(
        (
          resolve,
          reject
        ) => {
          if (
            !imageData ||
            !this.canvas ||
            !this.ctx
          ) {
            resolve();
            return;
          }

          const image =
            new Image();

          image.onload =
            () => {
              if (
                !this.canvas ||
                !this.ctx
              ) {
                resolve();
                return;
              }

              this.isRestoringHistory =
                true;

              this.ctx.save();

              this.ctx.setTransform(
                1,
                0,
                0,
                1,
                0,
                0
              );

              this.ctx.clearRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height
              );

              this.ctx.drawImage(
                image,
                0,
                0,
                this.canvas.width,
                this.canvas.height
              );

              this.ctx.restore();

              const ratio =
                this.getPixelRatio();

              this.ctx.setTransform(
                ratio,
                0,
                0,
                ratio,
                0,
                0
              );

              this.ctx.lineCap =
                "round";

              this.ctx.lineJoin =
                "round";

              this.ctx.globalCompositeOperation =
                "source-over";

              this.isRestoringHistory =
                false;

              resolve();
            };

          image.onerror =
            () => {
              this.isRestoringHistory =
                false;

              reject(
                new Error(
                  "無法還原計算紙內容。"
                )
              );
            };

          image.src =
            imageData;
        }
      );
    }

    async resizeCanvasPreserveContent() {
      if (
        !this.canvas ||
        this.isOpeningPanel
      ) {
        return;
      }

      const saved =
        this.canvas.width &&
        this.canvas.height
          ? this.canvas.toDataURL(
              "image/png"
            )
          : this.currentQuestionImage;

      await this.setupCanvas(
        false,
        saved
      );

      this.saveCurrentQuestionImage();
      this.updateToolbarState();
    }

    saveCurrentQuestionImage() {
      if (!this.canvas) {
        return;
      }

      try {
        this.currentQuestionImage =
          this.canvas.toDataURL(
            "image/png"
          );
      } catch (error) {
        console.warn(
          "計算紙內容保存失敗：",
          error
        );
      }
    }

    async restoreCurrentQuestionImage() {
      if (
        !this.currentQuestionImage
      ) {
        return;
      }

      try {
        await this.drawImageToCanvas(
          this.currentQuestionImage
        );
      } catch (error) {
        console.warn(
          "計算紙內容還原失敗：",
          error
        );
      }
    }

    /*
    ==================================================
    畫筆
    ==================================================
    */

    initializeDrawing() {
      this.addEvent(
        this.canvas,
        "pointerdown",
        (event) =>
          this.startDrawing(
            event
          )
      );

      this.addEvent(
        this.canvas,
        "pointermove",
        (event) =>
          this.draw(
            event
          )
      );

      this.addEvent(
        this.canvas,
        "pointerup",
        (event) =>
          this.stopDrawing(
            event
          )
      );

      this.addEvent(
        this.canvas,
        "pointercancel",
        (event) =>
          this.stopDrawing(
            event
          )
      );

      this.addEvent(
        this.canvas,
        "contextmenu",
        (event) =>
          event.preventDefault()
      );
    }

    getPointerPosition(
      event
    ) {
      const rect =
        this.canvas
          .getBoundingClientRect();

      return {
        x:
          event.clientX -
          rect.left,

        y:
          event.clientY -
          rect.top
      };
    }

    startDrawing(
      event
    ) {
      if (
        event.pointerType ===
          "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      if (
        this.isDraggingPanel ||
        this.isResizingPanel
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      this.isDrawing =
        true;

      this.drawingPointerId =
        event.pointerId;

      this.hasDrawnInCurrentStroke =
        false;

      try {
        this.canvas.setPointerCapture(
          event.pointerId
        );
      } catch (_) {}

      const point =
        this.getPointerPosition(
          event
        );

      this.lastX =
        point.x;

      this.lastY =
        point.y;
    }

    draw(
      event
    ) {
      if (
        !this.isDrawing ||
        event.pointerId !==
          this.drawingPointerId ||
        !this.ctx
      ) {
        return;
      }

      event.preventDefault();

      const point =
        this.getPointerPosition(
          event
        );

      this.ctx.beginPath();

      this.ctx.lineCap =
        "round";

      this.ctx.lineJoin =
        "round";

      if (
        this.tool ===
        "eraser"
      ) {
        this.ctx.globalCompositeOperation =
          "destination-out";

        this.ctx.strokeStyle =
          "rgba(0,0,0,1)";

        this.ctx.lineWidth =
          Math.max(
            this.currentSize *
              4,
            16
          );
      } else {
        this.ctx.globalCompositeOperation =
          "source-over";

        this.ctx.strokeStyle =
          this.currentColor;

        this.ctx.lineWidth =
          this.currentSize;
      }

      this.ctx.moveTo(
        this.lastX,
        this.lastY
      );

      this.ctx.lineTo(
        point.x,
        point.y
      );

      this.ctx.stroke();

      this.lastX =
        point.x;

      this.lastY =
        point.y;

      this.hasDrawnInCurrentStroke =
        true;
    }

    stopDrawing(
      event
    ) {
      if (
        !this.isDrawing
      ) {
        return;
      }

      if (
        event &&
        this.drawingPointerId !==
          null &&
        event.pointerId !==
          this.drawingPointerId
      ) {
        return;
      }

      this.isDrawing =
        false;

      if (
        this.ctx
      ) {
        this.ctx.closePath();

        this.ctx.globalCompositeOperation =
          "source-over";
      }

      if (
        event &&
        this.canvas
          ?.hasPointerCapture
          ?.(event.pointerId)
      ) {
        try {
          this.canvas.releasePointerCapture(
            event.pointerId
          );
        } catch (_) {}
      }

      this.drawingPointerId =
        null;

      if (
        this.hasDrawnInCurrentStroke
      ) {
        this.saveHistory();
        this.saveCurrentQuestionImage();
      }

      this.hasDrawnInCurrentStroke =
        false;

      this.updateToolbarState();
    }

    /*
    ==================================================
    歷史紀錄
    ==================================================
    */

    getSnapshot() {
      try {
        return (
          this.canvas.toDataURL(
            "image/png"
          )
        );
      } catch (_) {
        return null;
      }
    }

    saveHistory(
      force = false
    ) {
      if (
        !this.canvas ||
        this.isRestoringHistory
      ) {
        return;
      }

      const snapshot =
        this.getSnapshot();

      if (!snapshot) {
        return;
      }

      if (
        !force &&
        this.undoStack[
          this.undoStack.length - 1
        ] === snapshot
      ) {
        return;
      }

      this.undoStack.push(
        snapshot
      );

      if (
        this.undoStack.length >
        this.maxHistory
      ) {
        this.undoStack.shift();
      }

      this.redoStack = [];

      this.updateToolbarState();
    }

    canUndo() {
      return (
        this.undoStack.length >
        1
      );
    }

    canRedo() {
      return (
        this.redoStack.length >
        0
      );
    }

    async undo() {
      if (
        !this.canUndo()
      ) {
        return;
      }

      const current =
        this.undoStack.pop();

      this.redoStack.push(
        current
      );

      const target =
        this.undoStack[
          this.undoStack.length - 1
        ];

      await this.drawImageToCanvas(
        target
      );

      this.saveCurrentQuestionImage();
      this.updateToolbarState();
    }

    async redo() {
      if (
        !this.canRedo()
      ) {
        return;
      }

      const target =
        this.redoStack.pop();

      this.undoStack.push(
        target
      );

      await this.drawImageToCanvas(
        target
      );

      this.saveCurrentQuestionImage();
      this.updateToolbarState();
    }

    isBlank() {
      if (
        !this.canvas ||
        !this.ctx
      ) {
        return true;
      }

      try {
        const pixels =
          this.ctx.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height
          ).data;

        for (
          let i = 3;
          i <
          pixels.length;
          i += 4
        ) {
          if (
            pixels[i] !== 0
          ) {
            return false;
          }
        }
      } catch (_) {
        return false;
      }

      return true;
    }

    clear(
      saveToHistory = true
    ) {
      if (
        !this.canvas ||
        !this.ctx
      ) {
        return;
      }

      this.ctx.save();

      this.ctx.setTransform(
        1,
        0,
        0,
        1,
        0,
        0
      );

      this.ctx.clearRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      this.ctx.restore();

      const ratio =
        this.getPixelRatio();

      this.ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );

      if (
        saveToHistory
      ) {
        this.saveHistory();
      }

      this.saveCurrentQuestionImage();
      this.updateToolbarState();
    }

    newQuestion() {
      this.clear(false);

      this.undoStack = [];
      this.redoStack = [];

      this.saveHistory(true);
      this.saveCurrentQuestionImage();
      this.updateToolbarState();
    }

    /*
    ==================================================
    工具列
    ==================================================
    */

    initializeToolbar() {
      this.colorButtons =
        this.panel
          ? Array.from(
              this.panel.querySelectorAll(
                "[data-scratchpad-color]"
              )
            )
          : [];

      this.sizeButtons =
        this.panel
          ? Array.from(
              this.panel.querySelectorAll(
                "[data-scratchpad-size]"
              )
            )
          : [];

      this.addEvent(
        this.penButton,
        "click",
        () =>
          this.setTool(
            "pen"
          )
      );

      this.addEvent(
        this.eraserButton,
        "click",
        () =>
          this.setTool(
            "eraser"
          )
      );

      this.addEvent(
        this.undoButton,
        "click",
        () =>
          this.undo()
      );

      this.addEvent(
        this.redoButton,
        "click",
        () =>
          this.redo()
      );

      this.addEvent(
        this.clearButton,
        "click",
        () =>
          this.clear(true)
      );

      this.addEvent(
        this.downloadButton,
        "click",
        () =>
          this.downloadImage()
      );

      this.colorButtons.forEach(
        (button) => {
          this.addEvent(
            button,
            "click",
            () => {
              this.setColor(
                button.dataset
                  .scratchpadColor ||
                this.defaultColor
              );
            }
          );
        }
      );

      this.sizeButtons.forEach(
        (button) => {
          this.addEvent(
            button,
            "click",
            () => {
              this.setSize(
                Number(
                  button.dataset
                    .scratchpadSize
                ) ||
                this.defaultSize
              );
            }
          );
        }
      );

      this.updateToolbarState();
    }

    setTool(
      tool
    ) {
      this.tool =
        tool === "eraser"
          ? "eraser"
          : "pen";

      this.updateToolbarState();
    }

    setColor(
      color
    ) {
      this.currentColor =
        color ||
        this.defaultColor;

      this.tool =
        "pen";

      this.updateToolbarState();
    }

    setSize(
      size
    ) {
      this.currentSize =
        Math.max(
          1,
          Number(size) ||
          this.defaultSize
        );

      this.updateToolbarState();
    }

    updateToolbarState() {
      if (
        this.penButton
      ) {
        this.penButton.classList.toggle(
          "scratchpad-tool-button--active",
          this.tool === "pen"
        );

        this.penButton.setAttribute(
          "aria-pressed",
          String(
            this.tool === "pen"
          )
        );
      }

      if (
        this.eraserButton
      ) {
        this.eraserButton.classList.toggle(
          "scratchpad-tool-button--active",
          this.tool === "eraser"
        );

        this.eraserButton.setAttribute(
          "aria-pressed",
          String(
            this.tool === "eraser"
          )
        );
      }

      this.colorButtons.forEach(
        (button) => {
          const active =
            this.tool === "pen" &&
            button.dataset
              .scratchpadColor ===
              this.currentColor;

          button.classList.toggle(
            "scratchpad-tool-button--active",
            active
          );

          button.setAttribute(
            "aria-pressed",
            String(active)
          );
        }
      );

      this.sizeButtons.forEach(
        (button) => {
          const active =
            Number(
              button.dataset
                .scratchpadSize
            ) ===
            this.currentSize;

          button.classList.toggle(
            "scratchpad-tool-button--active",
            active
          );

          button.setAttribute(
            "aria-pressed",
            String(active)
          );
        }
      );

      if (
        this.undoButton
      ) {
        this.undoButton.disabled =
          !this.canUndo();
      }

      if (
        this.redoButton
      ) {
        this.redoButton.disabled =
          !this.canRedo();
      }

      const blank =
        this.isBlank();

      if (
        this.clearButton
      ) {
        this.clearButton.disabled =
          blank;
      }

      if (
        this.downloadButton
      ) {
        this.downloadButton.disabled =
          blank;
      }
    }

    /*
    ==================================================
    右鍵、長按與互動保護
    ==================================================
    */

    initializeProtection() {
      const interactiveSelector = [
        "button",
        "input",
        "select",
        "textarea",
        "a",
        "canvas",
        "[role='button']",
        ".scratchpad-resize-handle"
      ].join(",");

      this.interactiveSelector =
        interactiveSelector;

      this.addEvent(
        this.panel,
        "contextmenu",
        (event) => {
          event.preventDefault();
        }
      );

      this.panel
        .querySelectorAll(
          "button, input, select, textarea, a"
        )
        .forEach(
          (control) => {
            this.addEvent(
              control,
              "pointerdown",
              (event) => {
                event.stopPropagation();

                if (
                  event.pointerType ===
                    "mouse" &&
                  event.button !== 0
                ) {
                  event.preventDefault();
                }
              }
            );

            this.addEvent(
              control,
              "contextmenu",
              (event) => {
                event.preventDefault();
                event.stopPropagation();
              }
            );

            this.addEvent(
              control,
              "dragstart",
              (event) =>
                event.preventDefault()
            );

            this.addEvent(
              control,
              "selectstart",
              (event) =>
                event.preventDefault()
            );
          }
        );
    }

    isInteractiveTarget(
      target
    ) {
      return (
        target instanceof Element &&
        Boolean(
          target.closest(
            this.interactiveSelector
          )
        )
      );
    }

    isAllowedDragTarget(
      target
    ) {
      if (
        !(
          target instanceof
          Element
        )
      ) {
        return false;
      }

      if (
        this.isInteractiveTarget(
          target
        )
      ) {
        return false;
      }

      if (
        target.closest(
          ".scratchpad-header"
        )
      ) {
        return true;
      }

      if (
        target.closest(
          ".scratchpad-toolbar"
        )
      ) {
        return true;
      }

      return false;
    }

    /*
    ==================================================
    開啟、關閉與位置
    ==================================================
    */

    initializeWindow() {
      this.addEvent(
        this.openButton,
        "click",
        () =>
          this.open()
      );

      this.addEvent(
        this.closeButton,
        "click",
        () =>
          this.close()
      );

      this.addEvent(
        this.panel,
        "pointerdown",
        (event) =>
          this.startPanelDrag(
            event
          )
      );

      this.addEvent(
        this.panel,
        "pointermove",
        (event) =>
          this.dragPanel(
            event
          )
      );

      this.addEvent(
        this.panel,
        "pointerup",
        (event) =>
          this.stopPanelDrag(
            event
          )
      );

      this.addEvent(
        this.panel,
        "pointercancel",
        (event) =>
          this.stopPanelDrag(
            event
          )
      );
    }

    async open() {
      if (!this.panel) {
        return;
      }

      this.isOpeningPanel =
        true;

      this.panel.hidden =
        false;

      this.panel.classList.add(
        "scratchpad-panel--open"
      );

      this.panel.classList.remove(
        "scratchpad-panel--fullscreen"
      );

      this.isOpen =
        true;

      if (
        this.openButton
      ) {
        this.openButton.setAttribute(
          "aria-expanded",
          "true"
        );
      }

      this.applyResponsivePanelSize(
        false
      );

      await new Promise(
        (resolve) => {
          requestAnimationFrame(
            () =>
              requestAnimationFrame(
                resolve
              )
          );
        }
      );

      if (
        this.savedPanelPosition
      ) {
        this.applySavedPanelPosition();
      } else {
        this.positionNearOpenButton();
      }

      this.keepPanelInsideViewport();

      this.isOpeningPanel =
        false;

      await this.setupCanvas(
        false,
        this.currentQuestionImage
      );

      this.updateToolbarState();
    }

    close() {
      if (!this.panel) {
        return;
      }

      this.savePanelPosition();
      this.saveCurrentQuestionImage();

      this.panel.classList.remove(
        "scratchpad-panel--open",
        "scratchpad-panel--dragging"
      );

      this.panel.hidden =
        true;

      this.isOpen =
        false;

      if (
        this.openButton
      ) {
        this.openButton.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }

    toggle() {
      if (
        this.isOpen
      ) {
        this.close();
      } else {
        this.open();
      }
    }

    positionNearOpenButton() {
      if (!this.panel) {
        return;
      }

      const margin =
        this.getViewportMargin();

      const gap =
        12;

      const panelRect =
        this.panel
          .getBoundingClientRect();

      const buttonRect =
        this.openButton
          ?.getBoundingClientRect();

      let left;
      let top;

      if (
        buttonRect
      ) {
        left =
          buttonRect.left +
          buttonRect.width /
            2 -
          panelRect.width /
            2;

        top =
          buttonRect.bottom +
          gap;

        const spaceBelow =
          window.innerHeight -
          buttonRect.bottom -
          margin;

        const spaceAbove =
          buttonRect.top -
          margin;

        if (
          spaceBelow <
            panelRect.height &&
          spaceAbove >
            spaceBelow
        ) {
          top =
            buttonRect.top -
            panelRect.height -
            gap;
        }
      } else {
        left =
          (
            window.innerWidth -
            panelRect.width
          ) /
          2;

        top =
          (
            window.innerHeight -
            panelRect.height
          ) /
          2;
      }

      const clamped =
        this.clampPanelPosition(
          left,
          top
        );

      this.setPanelPosition(
        clamped.left,
        clamped.top
      );
    }

    clampPanelPosition(
      left,
      top
    ) {
      const margin =
        this.getViewportMargin();

      const width =
        this.panel
          ?.offsetWidth ||
        0;

      const height =
        this.panel
          ?.offsetHeight ||
        0;

      const maxLeft =
        Math.max(
          margin,
          window.innerWidth -
            width -
            margin
        );

      const maxTop =
        Math.max(
          margin,
          window.innerHeight -
            height -
            margin
        );

      return {
        left:
          Math.min(
            maxLeft,
            Math.max(
              margin,
              left
            )
          ),

        top:
          Math.min(
            maxTop,
            Math.max(
              margin,
              top
            )
          )
      };
    }

    setPanelPosition(
      left,
      top
    ) {
      if (!this.panel) {
        return;
      }

      this.panel.style.left =
        `${left}px`;

      this.panel.style.top =
        `${top}px`;

      this.panel.style.right =
        "auto";

      this.panel.style.bottom =
        "auto";
    }

    savePanelPosition() {
      if (
        !this.panel ||
        this.panel.hidden
      ) {
        return;
      }

      const rect =
        this.panel
          .getBoundingClientRect();

      this.savedPanelPosition = {
        left:
          rect.left,

        top:
          rect.top
      };
    }

    applySavedPanelPosition() {
      if (
        !this.savedPanelPosition ||
        !this.panel
      ) {
        return;
      }

      const clamped =
        this.clampPanelPosition(
          this.savedPanelPosition
            .left,

          this.savedPanelPosition
            .top
        );

      this.savedPanelPosition =
        clamped;

      this.setPanelPosition(
        clamped.left,
        clamped.top
      );
    }

    keepPanelInsideViewport() {
      if (
        !this.panel ||
        this.panel.hidden
      ) {
        return;
      }

      const rect =
        this.panel
          .getBoundingClientRect();

      const clamped =
        this.clampPanelPosition(
          rect.left,
          rect.top
        );

      this.setPanelPosition(
        clamped.left,
        clamped.top
      );

      this.savedPanelPosition =
        clamped;
    }

    /*
    ==================================================
    Pointer Events 拖曳核心
    ==================================================
    */

    startPanelDrag(
      event
    ) {
      if (
        !this.panel ||
        this.isResizingPanel ||
        this.isDrawing
      ) {
        return;
      }

      if (
        event.pointerType ===
          "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      if (
        !this.isAllowedDragTarget(
          event.target
        )
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const rect =
        this.panel
          .getBoundingClientRect();

      this.isDraggingPanel =
        true;

      this.dragPointerId =
        event.pointerId;

      this.dragOffsetX =
        event.clientX -
        rect.left;

      this.dragOffsetY =
        event.clientY -
        rect.top;

      this.panel.classList.add(
        "scratchpad-panel--dragging"
      );

      this.setPanelPosition(
        rect.left,
        rect.top
      );

      /*
      關鍵：
      由整個 panel 捕捉 pointer。

      手指離開原本的淺黃色區域後，
      pointermove 仍會持續送到 panel。
      */

      try {
        this.panel.setPointerCapture(
          event.pointerId
        );
      } catch (_) {}
    }

    dragPanel(
      event
    ) {
      if (
        !this.isDraggingPanel ||
        event.pointerId !==
          this.dragPointerId
      ) {
        return;
      }

      event.preventDefault();

      const requestedLeft =
        event.clientX -
        this.dragOffsetX;

      const requestedTop =
        event.clientY -
        this.dragOffsetY;

      const clamped =
        this.clampPanelPosition(
          requestedLeft,
          requestedTop
        );

      this.setPanelPosition(
        clamped.left,
        clamped.top
      );
    }

    stopPanelDrag(
      event
    ) {
      if (
        !this.isDraggingPanel
      ) {
        return;
      }

      if (
        event &&
        this.dragPointerId !==
          null &&
        event.pointerId !==
          this.dragPointerId
      ) {
        return;
      }

      if (
        event &&
        this.panel
          ?.hasPointerCapture
          ?.(event.pointerId)
      ) {
        try {
          this.panel.releasePointerCapture(
            event.pointerId
          );
        } catch (_) {}
      }

      this.isDraggingPanel =
        false;

      this.dragPointerId =
        null;

      this.panel
        ?.classList
        .remove(
          "scratchpad-panel--dragging"
        );

      this.savePanelPosition();
    }

    /*
    ==================================================
    桌面版八方向縮放
    ==================================================
    */

    initializeResizeHandles() {
      if (!this.panel) {
        return;
      }

      const directions = [
        "top",
        "right",
        "bottom",
        "left",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right"
      ];

      directions.forEach(
        (direction) => {
          const handle =
            document.createElement(
              "div"
            );

          handle.className =
            "scratchpad-resize-handle";

          handle.dataset
            .resizeDirection =
              direction;

          handle.setAttribute(
            "aria-hidden",
            "true"
          );

          this.panel.appendChild(
            handle
          );

          this.resizeHandles.push(
            handle
          );

          this.addEvent(
            handle,
            "pointerdown",
            (event) =>
              this.startResize(
                event,
                direction
              )
          );

          this.addEvent(
            handle,
            "pointermove",
            (event) =>
              this.resizePanel(
                event
              )
          );

          this.addEvent(
            handle,
            "pointerup",
            (event) =>
              this.stopResize(
                event
              )
          );

          this.addEvent(
            handle,
            "pointercancel",
            (event) =>
              this.stopResize(
                event
              )
          );
        }
      );

      this.updateResizeHandleVisibility();
    }

    updateResizeHandleVisibility() {
      const visible =
        this.isDesktopResizeView();

      this.resizeHandles.forEach(
        (handle) => {
          handle.hidden =
            !visible;
        }
      );
    }

    startResize(
      event,
      direction
    ) {
      if (
        !this.isDesktopResizeView() ||
        !this.panel
      ) {
        return;
      }

      if (
        event.pointerType ===
          "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const rect =
        this.panel
          .getBoundingClientRect();

      this.isResizingPanel =
        true;

      this.resizePointerId =
        event.pointerId;

      this.resizeDirection =
        direction;

      this.resizeStartX =
        event.clientX;

      this.resizeStartY =
        event.clientY;

      this.resizeStartLeft =
        rect.left;

      this.resizeStartTop =
        rect.top;

      this.resizeStartWidth =
        rect.width;

      this.resizeStartHeight =
        rect.height;

      this.panel.classList.add(
        "scratchpad-panel--resizing"
      );

      try {
        event.currentTarget
          .setPointerCapture(
            event.pointerId
          );
      } catch (_) {}
    }

    resizePanel(
      event
    ) {
      if (
        !this.isResizingPanel ||
        event.pointerId !==
          this.resizePointerId ||
        !this.panel
      ) {
        return;
      }

      event.preventDefault();

      const margin =
        this.getViewportMargin();

      const dx =
        event.clientX -
        this.resizeStartX;

      const dy =
        event.clientY -
        this.resizeStartY;

      const direction =
        this.resizeDirection;

      let left =
        this.resizeStartLeft;

      let top =
        this.resizeStartTop;

      let width =
        this.resizeStartWidth;

      let height =
        this.resizeStartHeight;

      if (
        direction.includes(
          "right"
        )
      ) {
        width += dx;
      }

      if (
        direction.includes(
          "bottom"
        )
      ) {
        height += dy;
      }

      if (
        direction.includes(
          "left"
        )
      ) {
        width -= dx;
        left += dx;
      }

      if (
        direction.includes(
          "top"
        )
      ) {
        height -= dy;
        top += dy;
      }

      const maxWidth =
        window.innerWidth -
        margin * 2;

      const maxHeight =
        window.innerHeight -
        margin * 2;

      width =
        Math.min(
          maxWidth,
          Math.max(
            this.resizeMinWidth,
            width
          )
        );

      height =
        Math.min(
          maxHeight,
          Math.max(
            this.resizeMinHeight,
            height
          )
        );

      left =
        Math.min(
          window.innerWidth -
            width -
            margin,
          Math.max(
            margin,
            left
          )
        );

      top =
        Math.min(
          window.innerHeight -
            height -
            margin,
          Math.max(
            margin,
            top
          )
        );

      this.panel.style.width =
        `${width}px`;

      this.panel.style.height =
        `${height}px`;

      this.setPanelPosition(
        left,
        top
      );

      this.panel.dataset.userResized =
        "true";
    }

    async stopResize(
      event
    ) {
      if (
        !this.isResizingPanel
      ) {
        return;
      }

      if (
        event &&
        this.resizePointerId !==
          null &&
        event.pointerId !==
          this.resizePointerId
      ) {
        return;
      }

      if (
        event
          ?.currentTarget
          ?.hasPointerCapture
          ?.(event.pointerId)
      ) {
        try {
          event.currentTarget
            .releasePointerCapture(
              event.pointerId
            );
        } catch (_) {}
      }

      this.isResizingPanel =
        false;

      this.resizePointerId =
        null;

      this.resizeDirection =
        "";

      this.panel
        ?.classList
        .remove(
          "scratchpad-panel--resizing"
        );

      this.savePanelPosition();

      await this.resizeCanvasPreserveContent();
    }

    /*
    ==================================================
    鍵盤
    ==================================================
    */

    initializeKeyboardShortcuts() {
      this.addEvent(
        document,
        "keydown",
        (event) => {
          if (
            !this.isOpen
          ) {
            return;
          }

          if (
            event.key ===
            "Escape"
          ) {
            event.preventDefault();

            this.close();

            return;
          }

          const command =
            event.ctrlKey ||
            event.metaKey;

          if (!command) {
            return;
          }

          const key =
            event.key
              .toLowerCase();

          if (
            key === "z" &&
            !event.shiftKey
          ) {
            event.preventDefault();

            this.undo();

          } else if (
            key === "y" ||
            (
              key === "z" &&
              event.shiftKey
            )
          ) {
            event.preventDefault();

            this.redo();
          }
        }
      );
    }

    /*
    ==================================================
    視窗尺寸變化
    ==================================================
    */

    initializeResizeListener() {
      this.addEvent(
        window,
        "resize",
        () => {
          window.clearTimeout(
            this.resizeTimer
          );

          this.resizeTimer =
            window.setTimeout(
              async () => {
                this.updateResizeHandleVisibility();

                /*
                平板／手機轉向時，
                重新調整尺寸，
                但不會回到固定起始位置。
                */

                if (
                  !this.isDesktopResizeView()
                ) {
                  this.panel.dataset.userResized =
                    "false";

                  this.applyResponsivePanelSize(
                    true
                  );
                }

                if (
                  this.isOpen
                ) {
                  this.keepPanelInsideViewport();

                  await this.resizeCanvasPreserveContent();
                }
              },
              120
            );
        }
      );
    }

    /*
    ==================================================
    下載圖片
    ==================================================
    */

    createDownloadFilename() {
      const now =
        new Date();

      const pad =
        (value) =>
          String(value)
            .padStart(
              2,
              "0"
            );

      return (
        `math-scratchpad-` +
        `${now.getFullYear()}-` +
        `${pad(
          now.getMonth() +
          1
        )}-` +
        `${pad(
          now.getDate()
        )}-` +
        `${pad(
          now.getHours()
        )}` +
        `${pad(
          now.getMinutes()
        )}.png`
      );
    }

    downloadImage(
      filename =
        this.createDownloadFilename()
    ) {
      if (
        !this.canvas ||
        this.isBlank()
      ) {
        return false;
      }

      if (
        !filename
          .toLowerCase()
          .endsWith(
            ".png"
          )
      ) {
        filename +=
          ".png";
      }

      const link =
        document.createElement(
          "a"
        );

      link.href =
        this.canvas.toDataURL(
          "image/png"
        );

      link.download =
        filename;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      return true;
    }

    /*
    ==================================================
    狀態
    ==================================================
    */

    getState() {
      return {
        tool:
          this.tool,

        color:
          this.currentColor,

        size:
          this.currentSize,

        isOpen:
          this.isOpen,

        isBlank:
          this.isBlank(),

        canUndo:
          this.canUndo(),

        canRedo:
          this.canRedo(),

        position:
          this.savedPanelPosition
            ? {
                ...this.savedPanelPosition
              }
            : null
      };
    }

    isReady() {
      return Boolean(
        !this.isDestroyed &&
        this.canvas &&
        this.ctx
      );
    }

    destroy() {
      this.eventCleanups.forEach(
        (cleanup) => {
          try {
            cleanup();
          } catch (_) {}
        }
      );

      this.eventCleanups = [];

      this.resizeHandles.forEach(
        (handle) =>
          handle.remove()
      );

      this.resizeHandles = [];

      if (
        this.panel
      ) {
        this.panel.hidden =
          true;
      }

      this.isDestroyed =
        true;

      this.ctx =
        null;

      this.canvas =
        null;

      this.panel =
        null;

      this.header =
        null;

      this.toolbar =
        null;
    }
  }

  window.Scratchpad =
    Scratchpad;

  window.createScratchpad =
    function (
      options = {}
    ) {
      return new Scratchpad(
        options
      );
    };
})();
