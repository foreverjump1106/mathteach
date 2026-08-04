/*
==================================================
數學遊戲樂園：共用計算紙
檔案位置：js/scratchpad.js
==================================================
*/

(function () {
  "use strict";

  class Scratchpad {
    constructor(options = {}) {
      this.options = options;

      this.canvasId =
        options.canvasId || "scratchpadCanvas";

      this.panelId =
        options.panelId || "scratchpadPanel";

      this.headerId =
        options.headerId || "scratchpadHeader";

      this.openButtonId =
        options.openButtonId ||
        "scratchpadOpenButton";

      this.closeButtonId =
        options.closeButtonId ||
        "scratchpadCloseButton";

      this.penButtonId =
        options.penButtonId ||
        "scratchpadPenButton";

      this.eraserButtonId =
        options.eraserButtonId ||
        "scratchpadEraserButton";

      this.undoButtonId =
        options.undoButtonId ||
        "scratchpadUndoButton";

      this.redoButtonId =
        options.redoButtonId ||
        "scratchpadRedoButton";

      this.clearButtonId =
        options.clearButtonId ||
        "scratchpadClearButton";

      this.downloadButtonId =
        options.downloadButtonId ||
        "scratchpadDownloadButton";

      this.defaultColor =
        options.defaultColor ||
        "#111827";

      this.defaultSize =
        Number(options.defaultSize) || 4;

      this.canvas =
        document.getElementById(
          this.canvasId
        );

      this.panel =
        document.getElementById(
          this.panelId
        );

      this.header =
        document.getElementById(
          this.headerId
        );

      this.openButton =
        document.getElementById(
          this.openButtonId
        );

      this.closeButton =
        document.getElementById(
          this.closeButtonId
        );

      this.penButton =
        document.getElementById(
          this.penButtonId
        );

      this.eraserButton =
        document.getElementById(
          this.eraserButtonId
        );

      this.undoButton =
        document.getElementById(
          this.undoButtonId
        );

      this.redoButton =
        document.getElementById(
          this.redoButtonId
        );

      this.clearButton =
        document.getElementById(
          this.clearButtonId
        );

      this.downloadButton =
        document.getElementById(
          this.downloadButtonId
        );

      this.colorButtons = [];
      this.sizeButtons = [];

      this.ctx = null;

      this.tool = "pen";

      this.currentColor =
        this.defaultColor;

      this.currentSize =
        this.defaultSize;

      this.isDrawing = false;

      this.hasDrawnInCurrentStroke =
        false;

      this.lastX = 0;
      this.lastY = 0;

      this.isOpen = false;

      this.isOpeningPanel = false;

      this.isDraggingPanel = false;

      this.dragStartX = 0;
      this.dragStartY = 0;

      this.panelStartLeft = 0;
      this.panelStartTop = 0;

      this.undoStack = [];
      this.redoStack = [];

      this.maxHistory = 30;

      this.isRestoringHistory =
        false;

      /*
      保存同一題目前的計算內容。

      關閉計算紙時保存，
      再次開啟時還原。

      只有進入下一題時才清空。
      */

      this.currentQuestionImage =
        null;

      this.eventCleanups = [];

      this.panelResizeObserver =
        null;

      this.isDestroyed = false;

      if (!this.canvas) {
        console.error(
          `找不到 id="${this.canvasId}" 的 Canvas。`
        );

        return;
      }

      this.ctx =
        this.canvas.getContext("2d");

      if (!this.ctx) {
        console.error(
          "瀏覽器無法建立 Canvas 2D 繪圖環境。"
        );

        return;
      }

      this.initialize();
    }

    initialize() {
      this.setupCanvas(false);

      this.initializeDrawing();

      this.initializeWindow();

      this.initializeToolbar();

      this.initializeKeyboardShortcuts();

      this.initializeResizeListener();

      this.initializePanelResizeObserver();

      this.saveHistory();

      this.saveCurrentQuestionImage();

      this.updateToolbarState();
    }

    /*
    ==================================================
    共用事件
    ==================================================
    */

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

      this.eventCleanups.push(() => {
        element.removeEventListener(
          eventName,
          handler,
          options
        );
      });
    }

    /*
    ==================================================
    Canvas 尺寸與影像
    ==================================================
    */

    getPixelRatio() {
      return Math.max(
        1,
        window.devicePixelRatio || 1
      );
    }

    setupCanvas(
      preserveContent = false,
      savedImageOverride = null
    ) {
      if (
        !this.canvas ||
        !this.ctx
      ) {
        return Promise.resolve();
      }

      const rect =
        this.canvas
          .getBoundingClientRect();

      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        return Promise.resolve();
      }

      const oldImage =
        savedImageOverride ||
        (
          preserveContent &&
          this.canvas.width > 0 &&
          this.canvas.height > 0
            ? this.canvas.toDataURL(
                "image/png"
              )
            : null
        );

      const ratio =
        this.getPixelRatio();

      const requiredWidth =
        Math.max(
          1,
          Math.round(
            rect.width * ratio
          )
        );

      const requiredHeight =
        Math.max(
          1,
          Math.round(
            rect.height * ratio
          )
        );

      /*
      重新設定 Canvas 尺寸時，
      Canvas 內容會被清空。
      因此若 oldImage 存在，
      稍後會把圖片畫回來。
      */

      this.canvas.width =
        requiredWidth;

      this.canvas.height =
        requiredHeight;

      this.canvas.style.touchAction =
        "none";

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

      if (!oldImage) {
        return Promise.resolve();
      }

      return this.drawImageToCanvas(
        oldImage
      );
    }

    drawImageToCanvas(imageData) {
      return new Promise(
        (resolve, reject) => {
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

          image.onload = () => {
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

            this.ctx
              .globalCompositeOperation =
              "source-over";

            this.isRestoringHistory =
              false;

            resolve();
          };

          image.onerror = () => {
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
      /*
      面板剛開啟時，
      暫時不讓 ResizeObserver
      重複調整 Canvas。
      */

      if (
        this.isOpeningPanel ||
        !this.canvas
      ) {
        return;
      }

      const savedImage =
        this.canvas.toDataURL(
          "image/png"
        );

      await this.setupCanvas(
        false,
        savedImage
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
    畫筆功能
    ==================================================
    */

    initializeDrawing() {
      this.addEvent(
        this.canvas,
        "pointerdown",
        (event) => {
          this.startDrawing(event);
        }
      );

      this.addEvent(
        this.canvas,
        "pointermove",
        (event) => {
          this.draw(event);
        }
      );

      [
        "pointerup",
        "pointercancel",
        "pointerleave"
      ].forEach(
        (eventName) => {
          this.addEvent(
            this.canvas,
            eventName,
            (event) => {
              this.stopDrawing(
                event
              );
            }
          );
        }
      );
    }

    getPointerPosition(event) {
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

    startDrawing(event) {
      if (
        event.pointerType ===
          "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();

      try {
        this.canvas
          .setPointerCapture(
            event.pointerId
          );
      } catch (error) {
        // 不支援時可忽略。
      }

      const position =
        this.getPointerPosition(
          event
        );

      this.isDrawing = true;

      this
        .hasDrawnInCurrentStroke =
        false;

      this.lastX =
        position.x;

      this.lastY =
        position.y;
    }

    draw(event) {
      if (
        !this.isDrawing ||
        !this.ctx
      ) {
        return;
      }

      event.preventDefault();

      const position =
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
        this.ctx
          .globalCompositeOperation =
          "destination-out";

        this.ctx.strokeStyle =
          "rgba(0,0,0,1)";

        this.ctx.lineWidth =
          Math.max(
            this.currentSize * 4,
            16
          );
      } else {
        this.ctx
          .globalCompositeOperation =
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
        position.x,
        position.y
      );

      this.ctx.stroke();

      this.lastX =
        position.x;

      this.lastY =
        position.y;

      this
        .hasDrawnInCurrentStroke =
        true;
    }

    stopDrawing(event) {
      if (!this.isDrawing) {
        return;
      }

      this.isDrawing = false;

      if (this.ctx) {
        this.ctx.closePath();

        this.ctx
          .globalCompositeOperation =
          "source-over";
      }

      if (
        event &&
        this.canvas &&
        this.canvas
          .hasPointerCapture &&
        this.canvas
          .hasPointerCapture(
            event.pointerId
          )
      ) {
        try {
          this.canvas
            .releasePointerCapture(
              event.pointerId
            );
        } catch (error) {
          // 可忽略。
        }
      }

      if (
        this
          .hasDrawnInCurrentStroke
      ) {
        this.saveHistory();

        this.saveCurrentQuestionImage();
      }

      this
        .hasDrawnInCurrentStroke =
        false;

      this.updateToolbarState();
    }

    /*
    ==================================================
    工具設定
    ==================================================
    */

    usePen() {
      this.tool = "pen";

      this.notifyToolChange();
    }

    useEraser() {
      this.tool = "eraser";

      this.notifyToolChange();
    }

    setColor(color) {
      if (
        typeof color !==
          "string" ||
        color.trim() === ""
      ) {
        return;
      }

      this.currentColor =
        color;

      this.tool = "pen";

      this.notifyToolChange();
    }

    setSize(size) {
      const newSize =
        Number(size);

      if (
        !Number.isFinite(
          newSize
        ) ||
        newSize < 1 ||
        newSize > 50
      ) {
        return;
      }

      this.currentSize =
        newSize;

      this.notifyToolChange();
    }

    notifyToolChange() {
      this.updateToolbarState();

      if (!this.canvas) {
        return;
      }

      this.canvas.dispatchEvent(
        new CustomEvent(
          "scratchpadtoolchange",
          {
            detail: {
              tool:
                this.tool,

              color:
                this.currentColor,

              size:
                this.currentSize
            }
          }
        )
      );
    }

    /*
    ==================================================
    清除與空白判斷
    ==================================================
    */

    clear(saveToHistory = true) {
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

      this.ctx
        .globalCompositeOperation =
        "source-over";

      if (saveToHistory) {
        this.saveHistory();
      }

      this.saveCurrentQuestionImage();

      this.updateToolbarState();
    }

    isBlank() {
      if (!this.canvas) {
        return true;
      }

      const blankCanvas =
        document.createElement(
          "canvas"
        );

      blankCanvas.width =
        this.canvas.width;

      blankCanvas.height =
        this.canvas.height;

      return (
        this.canvas.toDataURL(
          "image/png"
        ) ===
        blankCanvas.toDataURL(
          "image/png"
        )
      );
    }

    /*
    ==================================================
    復原與重做
    ==================================================
    */

    getCanvasImage() {
      if (!this.canvas) {
        return null;
      }

      return this.canvas.toDataURL(
        "image/png"
      );
    }

    saveHistory() {
      if (
        this.isRestoringHistory ||
        !this.canvas
      ) {
        return;
      }

      const imageData =
        this.getCanvasImage();

      if (!imageData) {
        return;
      }

      const lastImage =
        this.undoStack[
          this.undoStack.length - 1
        ];

      if (
        lastImage ===
        imageData
      ) {
        this.notifyHistoryChange();
        return;
      }

      this.undoStack.push(
        imageData
      );

      if (
        this.undoStack.length >
        this.maxHistory
      ) {
        this.undoStack.shift();
      }

      this.redoStack = [];

      this.notifyHistoryChange();
    }

    async restoreCanvasImage(
      imageData
    ) {
      if (!imageData) {
        return;
      }

      await this.drawImageToCanvas(
        imageData
      );

      this.saveCurrentQuestionImage();

      this.updateToolbarState();
    }

    async undo() {
      if (!this.canUndo()) {
        return false;
      }

      const currentImage =
        this.undoStack.pop();

      this.redoStack.push(
        currentImage
      );

      const previousImage =
        this.undoStack[
          this.undoStack.length - 1
        ];

      await this.restoreCanvasImage(
        previousImage
      );

      this.notifyHistoryChange();

      return true;
    }

    async redo() {
      if (!this.canRedo()) {
        return false;
      }

      const nextImage =
        this.redoStack.pop();

      this.undoStack.push(
        nextImage
      );

      await this.restoreCanvasImage(
        nextImage
      );

      this.notifyHistoryChange();

      return true;
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

    notifyHistoryChange() {
      this.updateToolbarState();

      if (!this.canvas) {
        return;
      }

      this.canvas.dispatchEvent(
        new CustomEvent(
          "scratchpadhistorychange",
          {
            detail: {
              canUndo:
                this.canUndo(),

              canRedo:
                this.canRedo(),

              undoCount:
                Math.max(
                  this.undoStack
                    .length - 1,
                  0
                ),

              redoCount:
                this.redoStack
                  .length
            }
          }
        )
      );
    }

    resetHistory() {
      this.undoStack = [];
      this.redoStack = [];

      this.saveHistory();

      this.notifyHistoryChange();
    }

    /*
    只有換下一題時才清空。
    */

    newQuestion() {
      this.currentQuestionImage =
        null;

      this.clear(false);

      this.tool = "pen";

      this.currentColor =
        this.defaultColor;

      this.currentSize =
        this.defaultSize;

      this.resetHistory();

      this.saveCurrentQuestionImage();

      this.updateToolbarState();
    }

    /*
    ==================================================
    開啟與關閉
    ==================================================
    */

    initializeWindow() {
      if (!this.panel) {
        console.warn(
          `找不到 id="${this.panelId}" 的計算紙面板。`
        );

        return;
      }

      this.panel.hidden = true;

      this.addEvent(
        this.openButton,
        "click",
        () => {
          this.open();
        }
      );

      this.addEvent(
        this.closeButton,
        "click",
        () => {
          this.close();
        }
      );

      this.initializePanelDragging();

      this.updateResponsiveMode();
    }

    isMobileView() {
      return (
        window.innerWidth <= 768
      );
    }

    open() {
      if (
        !this.panel ||
        this.isOpen
      ) {
        return;
      }

      this.isOpen = true;

      this.isOpeningPanel =
        true;

      /*
      先記住同一題關閉前的畫面。
      */

      const savedImage =
        this.currentQuestionImage;

      this.panel.hidden =
        false;

      this.panel.classList.add(
        "scratchpad-panel--open"
      );

      if (this.openButton) {
        this.openButton.setAttribute(
          "aria-expanded",
          "true"
        );
      }

      this.updateResponsiveMode();

      requestAnimationFrame(() => {
        requestAnimationFrame(
          async () => {
            /*
            先依照目前面板實際尺寸
            重新建立 Canvas。
            */

            await this.setupCanvas(
              false
            );

            /*
            再把關閉前的計算內容
            還原回來。
            */

            if (savedImage) {
              this
                .currentQuestionImage =
                savedImage;

              await this
                .restoreCurrentQuestionImage();
            } else {
              this
                .saveCurrentQuestionImage();
            }

            if (
              this.undoStack
                .length === 0
            ) {
              this.saveHistory();
            }

            /*
            延遲解除開啟鎖定，
            避免 ResizeObserver
            把畫面再次清空。
            */

            window.setTimeout(
              () => {
                this
                  .isOpeningPanel =
                  false;
              },
              220
            );
          }
        );
      });

      this.panel.dispatchEvent(
        new CustomEvent(
          "scratchpadopen",
          {
            detail: {
              isOpen: true,

              isMobile:
                this.isMobileView()
            }
          }
        )
      );
    }

    close() {
      if (
        !this.panel ||
        !this.isOpen
      ) {
        return;
      }

      /*
      關閉前保存目前內容。
      關閉本身不清空。
      */

      this.saveCurrentQuestionImage();

      this.isOpen = false;

      this.isOpeningPanel =
        false;

      this.panel.classList.remove(
        "scratchpad-panel--open"
      );

      this.panel.hidden = true;

      if (this.openButton) {
        this.openButton.setAttribute(
          "aria-expanded",
          "false"
        );
      }

      this.panel.dispatchEvent(
        new CustomEvent(
          "scratchpadclose",
          {
            detail: {
              isOpen: false,

              isMobile:
                this.isMobileView()
            }
          }
        )
      );
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    /*
    ==================================================
    響應式與位置
    ==================================================
    */

    updateResponsiveMode() {
      if (!this.panel) {
        return;
      }

      this.panel.classList.toggle(
        "scratchpad-panel--fullscreen",
        this.isMobileView()
      );

      if (this.isMobileView()) {
        this.panel.style.left = "";
        this.panel.style.top = "";
        this.panel.style.right = "";
        this.panel.style.bottom = "";
      } else if (
        !this.panel.style.left ||
        !this.panel.style.top
      ) {
        this.setDefaultDesktopPosition();
      }
    }

    setDefaultDesktopPosition() {
      if (
        !this.panel ||
        this.isMobileView()
      ) {
        return;
      }

      const margin = 24;

      const panelWidth =
        this.panel.offsetWidth ||
        420;

      const panelHeight =
        this.panel.offsetHeight ||
        560;

      const left =
        Math.max(
          window.innerWidth -
            panelWidth -
            margin,
          margin
        );

      const top =
        Math.max(
          window.innerHeight -
            panelHeight -
            margin,
          margin
        );

      this.panel.style.left =
        `${left}px`;

      this.panel.style.top =
        `${top}px`;

      this.panel.style.right =
        "auto";

      this.panel.style.bottom =
        "auto";
    }

    initializePanelDragging() {
      if (
        !this.header ||
        !this.panel
      ) {
        return;
      }

      this.addEvent(
        this.header,
        "pointerdown",
        (event) => {
          this.startPanelDrag(
            event
          );
        }
      );

      this.addEvent(
        window,
        "pointermove",
        (event) => {
          this.movePanel(event);
        }
      );

      [
        "pointerup",
        "pointercancel"
      ].forEach(
        (eventName) => {
          this.addEvent(
            window,
            eventName,
            () => {
              this.stopPanelDrag();
            }
          );
        }
      );
    }

    startPanelDrag(event) {
      if (
        this.isMobileView() ||
        event.target.closest(
          "button"
        ) ||
        (
          event.pointerType ===
            "mouse" &&
          event.button !== 0
        )
      ) {
        return;
      }

      event.preventDefault();

      const rect =
        this.panel
          .getBoundingClientRect();

      this.isDraggingPanel =
        true;

      this.dragStartX =
        event.clientX;

      this.dragStartY =
        event.clientY;

      this.panelStartLeft =
        rect.left;

      this.panelStartTop =
        rect.top;

      this.panel.classList.add(
        "scratchpad-panel--dragging"
      );

      try {
        this.header
          .setPointerCapture(
            event.pointerId
          );
      } catch (error) {
        // 可忽略。
      }
    }

    movePanel(event) {
      if (
        !this.isDraggingPanel ||
        !this.panel
      ) {
        return;
      }

      const moveX =
        event.clientX -
        this.dragStartX;

      const moveY =
        event.clientY -
        this.dragStartY;

      const maxLeft =
        Math.max(
          window.innerWidth -
            this.panel
              .offsetWidth,
          0
        );

      const maxTop =
        Math.max(
          window.innerHeight -
            this.panel
              .offsetHeight,
          0
        );

      const newLeft =
        Math.min(
          Math.max(
            this.panelStartLeft +
              moveX,
            0
          ),
          maxLeft
        );

      const newTop =
        Math.min(
          Math.max(
            this.panelStartTop +
              moveY,
            0
          ),
          maxTop
        );

      this.panel.style.left =
        `${newLeft}px`;

      this.panel.style.top =
        `${newTop}px`;

      this.panel.style.right =
        "auto";

      this.panel.style.bottom =
        "auto";
    }

    stopPanelDrag() {
      if (
        !this.isDraggingPanel
      ) {
        return;
      }

      this.isDraggingPanel =
        false;

      if (this.panel) {
        this.panel.classList.remove(
          "scratchpad-panel--dragging"
        );
      }
    }

    keepPanelInsideViewport() {
      if (
        !this.panel ||
        this.isMobileView()
      ) {
        return;
      }

      const rect =
        this.panel
          .getBoundingClientRect();

      const maxLeft =
        Math.max(
          window.innerWidth -
            this.panel
              .offsetWidth,
          0
        );

      const maxTop =
        Math.max(
          window.innerHeight -
            this.panel
              .offsetHeight,
          0
        );

      this.panel.style.left =
        `${Math.min(
          Math.max(
            rect.left,
            0
          ),
          maxLeft
        )}px`;

      this.panel.style.top =
        `${Math.min(
          Math.max(
            rect.top,
            0
          ),
          maxTop
        )}px`;

      this.panel.style.right =
        "auto";

      this.panel.style.bottom =
        "auto";
    }

    /*
    ==================================================
    工具列
    ==================================================
    */

    initializeToolbar() {
      this.colorButtons =
        Array.from(
          document.querySelectorAll(
            "[data-scratchpad-color]"
          )
        );

      this.sizeButtons =
        Array.from(
          document.querySelectorAll(
            "[data-scratchpad-size]"
          )
        );

      this.addEvent(
        this.penButton,
        "click",
        () => {
          this.usePen();
        }
      );

      this.addEvent(
        this.eraserButton,
        "click",
        () => {
          this.useEraser();
        }
      );

      this.addEvent(
        this.undoButton,
        "click",
        async () => {
          try {
            await this.undo();
          } catch (error) {
            console.error(
              "復原失敗：",
              error
            );
          }
        }
      );

      this.addEvent(
        this.redoButton,
        "click",
        async () => {
          try {
            await this.redo();
          } catch (error) {
            console.error(
              "重做失敗：",
              error
            );
          }
        }
      );

      this.addEvent(
        this.clearButton,
        "click",
        () => {
          if (!this.isBlank()) {
            this.clear(true);
          }
        }
      );

      this.addEvent(
        this.downloadButton,
        "click",
        () => {
          if (!this.isBlank()) {
            this.downloadImage();
          }
        }
      );

      this.colorButtons.forEach(
        (button) => {
          this.addEvent(
            button,
            "click",
            () => {
              this.setColor(
                button.dataset
                  .scratchpadColor
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
                button.dataset
                  .scratchpadSize
              );
            }
          );
        }
      );
    }

    setButtonActiveState(
      button,
      isActive
    ) {
      if (!button) {
        return;
      }

      button.classList.toggle(
        "scratchpad-tool-button--active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    }

    updateToolbarState() {
      if (this.isDestroyed) {
        return;
      }

      if (
        !Array.isArray(
          this.colorButtons
        )
      ) {
        this.colorButtons = [];
      }

      if (
        !Array.isArray(
          this.sizeButtons
        )
      ) {
        this.sizeButtons = [];
      }

      this.setButtonActiveState(
        this.penButton,
        this.tool === "pen"
      );

      this.setButtonActiveState(
        this.eraserButton,
        this.tool === "eraser"
      );

      this.colorButtons.forEach(
        (button) => {
          this.setButtonActiveState(
            button,
            this.tool ===
              "pen" &&
            button.dataset
              .scratchpadColor ===
              this.currentColor
          );
        }
      );

      this.sizeButtons.forEach(
        (button) => {
          this.setButtonActiveState(
            button,
            Number(
              button.dataset
                .scratchpadSize
            ) ===
              Number(
                this.currentSize
              )
          );
        }
      );

      if (this.undoButton) {
        this.undoButton.disabled =
          !this.canUndo();

        this.undoButton.setAttribute(
          "aria-disabled",
          String(
            !this.canUndo()
          )
        );
      }

      if (this.redoButton) {
        this.redoButton.disabled =
          !this.canRedo();

        this.redoButton.setAttribute(
          "aria-disabled",
          String(
            !this.canRedo()
          )
        );
      }

      const blank =
        this.isBlank();

      if (this.clearButton) {
        this.clearButton.disabled =
          blank;

        this.clearButton.setAttribute(
          "aria-disabled",
          String(blank)
        );
      }

      if (this.downloadButton) {
        this.downloadButton.disabled =
          blank;

        this.downloadButton.setAttribute(
          "aria-disabled",
          String(blank)
        );
      }
    }

    /*
    ==================================================
    快捷鍵
    ==================================================
    */

    initializeKeyboardShortcuts() {
      this.addEvent(
        window,
        "keydown",
        (event) => {
          this.handleKeyboardShortcut(
            event
          );
        }
      );
    }

    handleKeyboardShortcut(event) {
      if (!this.isOpen) {
        return;
      }

      const activeElement =
        document.activeElement;

      const isTyping =
        activeElement &&
        (
          activeElement.tagName ===
            "INPUT" ||
          activeElement.tagName ===
            "TEXTAREA" ||
          activeElement
            .isContentEditable
        );

      if (isTyping) {
        return;
      }

      const controlPressed =
        event.ctrlKey ||
        event.metaKey;

      const key =
        event.key.toLowerCase();

      if (
        controlPressed &&
        key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        this.undo();

        return;
      }

      if (
        controlPressed &&
        (
          key === "y" ||
          (
            event.shiftKey &&
            key === "z"
          )
        )
      ) {
        event.preventDefault();

        this.redo();

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

      if (
        event.key ===
        "Delete"
      ) {
        event.preventDefault();

        if (!this.isBlank()) {
          this.clear(true);
        }
      }
    }

    /*
    ==================================================
    面板縮放
    ==================================================
    */

    initializePanelResizeObserver() {
      if (
        !this.panel ||
        typeof ResizeObserver !==
          "function"
      ) {
        return;
      }

      let resizeTimer =
        null;

      this.panelResizeObserver =
        new ResizeObserver(() => {
          if (
            !this.isOpen ||
            this.isOpeningPanel ||
            this.isDestroyed ||
            this.isMobileView()
          ) {
            return;
          }

          window.clearTimeout(
            resizeTimer
          );

          resizeTimer =
            window.setTimeout(
              async () => {
                if (
                  !this.isOpen ||
                  this
                    .isOpeningPanel ||
                  this.isDestroyed
                ) {
                  return;
                }

                await this
                  .resizeCanvasPreserveContent();

                this
                  .keepPanelInsideViewport();
              },
              160
            );
        });

      this.panelResizeObserver
        .observe(this.panel);

      this.eventCleanups.push(
        () => {
          window.clearTimeout(
            resizeTimer
          );

          if (
            this
              .panelResizeObserver
          ) {
            this
              .panelResizeObserver
              .disconnect();

            this
              .panelResizeObserver =
              null;
          }
        }
      );
    }

    initializeResizeListener() {
      let resizeTimer =
        null;

      this.addEvent(
        window,
        "resize",
        () => {
          window.clearTimeout(
            resizeTimer
          );

          resizeTimer =
            window.setTimeout(
              async () => {
                this
                  .updateResponsiveMode();

                if (
                  !this.isMobileView()
                ) {
                  this
                    .keepPanelInsideViewport();
                }

                if (
                  this.isOpen &&
                  !this
                    .isOpeningPanel
                ) {
                  await this
                    .resizeCanvasPreserveContent();
                }
              },
              180
            );
        }
      );
    }

    /*
    ==================================================
    下載圖片
    ==================================================
    */

    /*
==================================================
下載圖片
==================================================
*/

/*
建立下載檔名。

例如：
math-scratchpad-2026-08-04-1535.png
*/

createDownloadFilename() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  const hour =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minute =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  return (
    `math-scratchpad-` +
    `${year}-${month}-${day}-` +
    `${hour}${minute}.png`
  );
}


/*
下載計算紙圖片。

下載內容包含：
1. 白色背景
2. 淡藍色方格
3. 原本計算筆跡
*/

downloadImage(
  filename =
    this.createDownloadFilename()
) {
  if (!this.canvas) {
    console.warn(
      "下載失敗：找不到計算紙 Canvas。"
    );

    return false;
  }

  if (this.isBlank()) {
    console.warn(
      "計算紙目前是空白的，沒有可以下載的內容。"
    );

    return false;
  }

  if (
    typeof filename !== "string" ||
    filename.trim() === ""
  ) {
    filename =
      this.createDownloadFilename();
  }

  if (
    !filename
      .toLowerCase()
      .endsWith(".png")
  ) {
    filename += ".png";
  }

  /*
  建立專門輸出的 Canvas。
  */

  const exportCanvas =
    document.createElement(
      "canvas"
    );

  exportCanvas.width =
    this.canvas.width;

  exportCanvas.height =
    this.canvas.height;

  const exportContext =
    exportCanvas.getContext(
      "2d"
    );

  if (!exportContext) {
    console.error(
      "下載失敗：無法建立輸出 Canvas。"
    );

    return false;
  }

  /*
  先填入不透明白色背景。
  這能避免平板或深色圖片檢視器
  把透明背景顯示成黑色。
  */

  exportContext.save();

  exportContext.setTransform(
    1,
    0,
    0,
    1,
    0,
    0
  );

  exportContext.globalAlpha =
    1;

  exportContext
    .globalCompositeOperation =
    "source-over";

  exportContext.fillStyle =
    "#ffffff";

  exportContext.fillRect(
    0,
    0,
    exportCanvas.width,
    exportCanvas.height
  );

  /*
  畫淡藍色方格。
  */

  const pixelRatio =
    this.getPixelRatio();

  const gridSize =
    Math.max(
      16,
      Math.round(
        28 * pixelRatio
      )
    );

  exportContext.strokeStyle =
    "#dbeafe";

  exportContext.lineWidth =
    Math.max(
      1,
      Math.round(pixelRatio)
    );

  exportContext.beginPath();

  for (
    let x = 0;
    x <= exportCanvas.width;
    x += gridSize
  ) {
    exportContext.moveTo(
      x + 0.5,
      0
    );

    exportContext.lineTo(
      x + 0.5,
      exportCanvas.height
    );
  }

  for (
    let y = 0;
    y <= exportCanvas.height;
    y += gridSize
  ) {
    exportContext.moveTo(
      0,
      y + 0.5
    );

    exportContext.lineTo(
      exportCanvas.width,
      y + 0.5
    );
  }

  exportContext.stroke();

  /*
  最後疊上原本筆跡。
  */

  exportContext.drawImage(
    this.canvas,
    0,
    0,
    this.canvas.width,
    this.canvas.height,
    0,
    0,
    exportCanvas.width,
    exportCanvas.height
  );

  exportContext.restore();

  /*
  轉成 PNG。
  */

  let imageUrl = "";

  try {
    imageUrl =
      exportCanvas.toDataURL(
        "image/png",
        1
      );
  } catch (error) {
    console.error(
      "下載失敗：圖片轉換錯誤。",
      error
    );

    return false;
  }

  /*
  建立下載連結。
  */

  const link =
    document.createElement("a");

  link.href =
    imageUrl;

  link.download =
    filename;

  link.style.display =
    "none";

  document.body.appendChild(
    link
  );

  try {
    link.click();
  } catch (error) {
    console.error(
      "下載失敗：瀏覽器無法啟動下載。",
      error
    );

    link.remove();

    return false;
  }

  window.setTimeout(() => {
    link.remove();
  }, 0);

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

        isMobile:
          this.isMobileView(),

        isBlank:
          this.isBlank(),

        canUndo:
          this.canUndo(),

        canRedo:
          this.canRedo()
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
          } catch (error) {
            // 可忽略。
          }
        }
      );

      this.eventCleanups = [];

      this.undoStack = [];
      this.redoStack = [];

      this.currentQuestionImage =
        null;

      if (this.panel) {
        this.panel.hidden =
          true;

        this.panel.classList.remove(
          "scratchpad-panel--open",
          "scratchpad-panel--fullscreen",
          "scratchpad-panel--dragging"
        );
      }

      this.isDestroyed = true;

      this.ctx = null;
      this.canvas = null;
      this.panel = null;
      this.header = null;

      this.openButton = null;
      this.closeButton = null;

      this.colorButtons = [];
      this.sizeButtons = [];
    }
  }

  /*
  ==================================================
  對外提供
  ==================================================
  */

  window.Scratchpad =
    Scratchpad;

  window.createScratchpad =
    function (options = {}) {
      return new Scratchpad(
        options
      );
    };
})();
/*
==================================================
共用計算紙：桌面版八方向縮放擴充
請貼在原本 scratchpad.js 最底部
==================================================

支援方向：
上、下、左、右
左上、右上、左下、右下

特色：
1. 保留原本計算紙所有功能
2. 縮放時不會清空計算內容
3. 縮放結束後重新調整 Canvas 畫質
4. 手機版不啟用八方向縮放
5. 不需要修改 scratchpad-template.js
==================================================
*/

(function () {
  "use strict";

  /*
  確認原本共用計算紙已載入。
  */

  if (
    typeof window.Scratchpad !==
    "function"
  ) {
    console.error(
      "八方向縮放載入失敗：找不到 window.Scratchpad。"
    );

    return;
  }

  const Scratchpad =
    window.Scratchpad;

  /*
  避免程式被重複加入。
  */

  if (
    Scratchpad.prototype
      .eightDirectionResizeInstalled
  ) {
    return;
  }

  Scratchpad.prototype
    .eightDirectionResizeInstalled =
    true;

  /*
  ==================================================
  共用設定
  ==================================================
  */

  const RESIZE_STYLE_ID =
    "scratchpadEightDirectionResizeStyle";

  const HANDLE_CLASS =
    "scratchpad-resize-handle";

  const DIRECTIONS = [
    "top",
    "right",
    "bottom",
    "left",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right"
  ];

  /*
  ==================================================
  加入縮放控制點 CSS
  ==================================================
  */

  function installResizeStyles() {
    if (
      document.getElementById(
        RESIZE_STYLE_ID
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      RESIZE_STYLE_ID;

    style.textContent = `
      /*
      計算紙面板必須可以放置絕對定位控制點。
      */

      .scratchpad-panel {
        position: fixed;
      }

      /*
      縮放控制點預設透明，
      滑鼠靠近邊緣時會呈現對應游標。
      */

      .${HANDLE_CLASS} {
        position: absolute;
        z-index: 120;
        display: block;
        background: transparent;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }

      /*
      上方
      */

      .${HANDLE_CLASS}[data-resize-direction="top"] {
        top: -5px;
        left: 14px;
        right: 14px;
        height: 10px;
        cursor: ns-resize;
      }

      /*
      下方
      */

      .${HANDLE_CLASS}[data-resize-direction="bottom"] {
        bottom: -5px;
        left: 14px;
        right: 14px;
        height: 10px;
        cursor: ns-resize;
      }

      /*
      左側
      */

      .${HANDLE_CLASS}[data-resize-direction="left"] {
        top: 14px;
        bottom: 14px;
        left: -5px;
        width: 10px;
        cursor: ew-resize;
      }

      /*
      右側
      */

      .${HANDLE_CLASS}[data-resize-direction="right"] {
        top: 14px;
        right: -5px;
        bottom: 14px;
        width: 10px;
        cursor: ew-resize;
      }

      /*
      左上角
      */

      .${HANDLE_CLASS}[data-resize-direction="top-left"] {
        top: -7px;
        left: -7px;
        width: 18px;
        height: 18px;
        cursor: nwse-resize;
      }

      /*
      右上角
      */

      .${HANDLE_CLASS}[data-resize-direction="top-right"] {
        top: -7px;
        right: -7px;
        width: 18px;
        height: 18px;
        cursor: nesw-resize;
      }

      /*
      左下角
      */

      .${HANDLE_CLASS}[data-resize-direction="bottom-left"] {
        bottom: -7px;
        left: -7px;
        width: 18px;
        height: 18px;
        cursor: nesw-resize;
      }

      /*
      右下角
      */

      .${HANDLE_CLASS}[data-resize-direction="bottom-right"] {
        right: -7px;
        bottom: -7px;
        width: 18px;
        height: 18px;
        cursor: nwse-resize;
      }

      /*
      縮放進行中。
      */

      .scratchpad-panel--resizing {
        user-select: none !important;
        -webkit-user-select: none !important;
      }

      .scratchpad-panel--resizing iframe,
      .scratchpad-panel--resizing button,
      .scratchpad-panel--resizing canvas {
        pointer-events: none;
      }

      /*
      手機版維持全螢幕，不啟用縮放點。
      */

      @media (max-width: 768px) {
        .${HANDLE_CLASS} {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  /*
  ==================================================
  判斷方向
  ==================================================
  */

  function directionHas(
    direction,
    value
  ) {
    return direction
      .split("-")
      .includes(value);
  }

  /*
  ==================================================
  限制數值
  ==================================================
  */

  function clamp(
    value,
    minimum,
    maximum
  ) {
    return Math.min(
      Math.max(
        value,
        minimum
      ),
      maximum
    );
  }

  /*
  ==================================================
  建立八方向控制點
  ==================================================
  */

  Scratchpad.prototype
    .initializeEightDirectionResize =
    function () {
      if (
        !this.panel ||
        this
          .eightDirectionResizeReady
      ) {
        return;
      }

      installResizeStyles();

      this
        .eightDirectionResizeReady =
        true;

      this
        .isResizingPanel =
        false;

      this.resizeDirection =
        "";

      this.resizePointerId =
        null;

      this.resizeStartX =
        0;

      this.resizeStartY =
        0;

      this.resizeStartLeft =
        0;

      this.resizeStartTop =
        0;

      this.resizeStartWidth =
        0;

      this.resizeStartHeight =
        0;

      /*
      最小尺寸可在 createScratchpad() 傳入：

      resizeMinWidth: 320
      resizeMinHeight: 300
      */

      this.resizeMinWidth =
        Number(
          this.options
            ?.resizeMinWidth
        ) || 320;

      this.resizeMinHeight =
        Number(
          this.options
            ?.resizeMinHeight
        ) || 300;

      this.resizeHandles =
        [];

      DIRECTIONS.forEach(
        (direction) => {
          const handle =
            document.createElement(
              "div"
            );

          handle.className =
            HANDLE_CLASS;

          handle.dataset
            .resizeDirection =
            direction;

          handle.setAttribute(
            "aria-hidden",
            "true"
          );

          handle.title =
            `調整計算紙大小：${direction}`;

          this.panel.appendChild(
            handle
          );

          this.resizeHandles.push(
            handle
          );

          /*
          開始縮放。
          */

          this.addEvent(
            handle,
            "pointerdown",
            (event) => {
              this.startEightDirectionResize(
                event,
                direction,
                handle
              );
            }
          );
        }
      );

      /*
      在 window 上追蹤滑鼠，
      避免游標移出面板後縮放中斷。
      */

      this.addEvent(
        window,
        "pointermove",
        (event) => {
          this.moveEightDirectionResize(
            event
          );
        }
      );

      this.addEvent(
        window,
        "pointerup",
        (event) => {
          this.stopEightDirectionResize(
            event
          );
        }
      );

      this.addEvent(
        window,
        "pointercancel",
        (event) => {
          this.stopEightDirectionResize(
            event
          );
        }
      );
    };

  /*
  ==================================================
  開始八方向縮放
  ==================================================
  */

  Scratchpad.prototype
    .startEightDirectionResize =
    function (
      event,
      direction,
      handle
    ) {
      if (
        !this.panel ||
        !this.isOpen ||
        this.isMobileView() ||
        (
          event.pointerType ===
            "mouse" &&
          event.button !== 0
        )
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      /*
      開始縮放前先保存畫布，
      避免 ResizeObserver 重新設定 Canvas 時遺失內容。
      */

      if (
        typeof this
          .saveCurrentQuestionImage ===
        "function"
      ) {
        this
          .saveCurrentQuestionImage();
      }

      const rect =
        this.panel
          .getBoundingClientRect();

      this
        .isResizingPanel =
        true;

      this.resizeDirection =
        direction;

      this.resizePointerId =
        event.pointerId;

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

      /*
      固定成像素尺寸與位置，
      避免原本 right、bottom 或 CSS 寬高干擾。
      */

      this.panel.style.left =
        `${rect.left}px`;

      this.panel.style.top =
        `${rect.top}px`;

      this.panel.style.right =
        "auto";

      this.panel.style.bottom =
        "auto";

      this.panel.style.width =
        `${rect.width}px`;

      this.panel.style.height =
        `${rect.height}px`;

      this.panel.classList.add(
        "scratchpad-panel--resizing"
      );

      /*
      縮放時暫時阻止 ResizeObserver
      不斷重新建立 Canvas。
      */

      this.isOpeningPanel =
        true;

      try {
        handle.setPointerCapture(
          event.pointerId
        );
      } catch (error) {
        // 部分瀏覽器不支援時忽略。
      }
    };

  /*
  ==================================================
  執行八方向縮放
  ==================================================
  */

  Scratchpad.prototype
    .moveEightDirectionResize =
    function (event) {
      if (
        !this.isResizingPanel ||
        !this.panel ||
        event.pointerId !==
          this.resizePointerId
      ) {
        return;
      }

      event.preventDefault();

      const direction =
        this.resizeDirection;

      const deltaX =
        event.clientX -
        this.resizeStartX;

      const deltaY =
        event.clientY -
        this.resizeStartY;

      let left =
        this.resizeStartLeft;

      let top =
        this.resizeStartTop;

      let width =
        this.resizeStartWidth;

      let height =
        this.resizeStartHeight;

      /*
      右側縮放。
      */

      if (
        directionHas(
          direction,
          "right"
        )
      ) {
        width =
          this.resizeStartWidth +
          deltaX;
      }

      /*
      左側縮放。

      左邊界移動時，
      寬度與 left 必須同時改變。
      */

      if (
        directionHas(
          direction,
          "left"
        )
      ) {
        width =
          this.resizeStartWidth -
          deltaX;

        left =
          this.resizeStartLeft +
          deltaX;
      }

      /*
      下方縮放。
      */

      if (
        directionHas(
          direction,
          "bottom"
        )
      ) {
        height =
          this.resizeStartHeight +
          deltaY;
      }

      /*
      上方縮放。

      上邊界移動時，
      高度與 top 必須同時改變。
      */

      if (
        directionHas(
          direction,
          "top"
        )
      ) {
        height =
          this.resizeStartHeight -
          deltaY;

        top =
          this.resizeStartTop +
          deltaY;
      }

      /*
      視窗最大可用尺寸。
      */

      const viewportWidth =
        window.innerWidth;

      const viewportHeight =
        window.innerHeight;

      const margin =
        6;

      /*
      最小尺寸限制。
      */

      if (
        width <
        this.resizeMinWidth
      ) {
        if (
          directionHas(
            direction,
            "left"
          )
        ) {
          left =
            this.resizeStartLeft +
            (
              this.resizeStartWidth -
              this.resizeMinWidth
            );
        }

        width =
          this.resizeMinWidth;
      }

      if (
        height <
        this.resizeMinHeight
      ) {
        if (
          directionHas(
            direction,
            "top"
          )
        ) {
          top =
            this.resizeStartTop +
            (
              this.resizeStartHeight -
              this.resizeMinHeight
            );
        }

        height =
          this.resizeMinHeight;
      }

      /*
      左邊不能超出視窗。
      */

      if (left < margin) {
        if (
          directionHas(
            direction,
            "left"
          )
        ) {
          width +=
            left - margin;
        }

        left =
          margin;
      }

      /*
      上邊不能超出視窗。
      */

      if (top < margin) {
        if (
          directionHas(
            direction,
            "top"
          )
        ) {
          height +=
            top - margin;
        }

        top =
          margin;
      }

      /*
      右邊不能超出視窗。
      */

      if (
        left + width >
        viewportWidth - margin
      ) {
        if (
          directionHas(
            direction,
            "right"
          )
        ) {
          width =
            viewportWidth -
            margin -
            left;
        } else {
          left =
            viewportWidth -
            margin -
            width;
        }
      }

      /*
      下邊不能超出視窗。
      */

      if (
        top + height >
        viewportHeight - margin
      ) {
        if (
          directionHas(
            direction,
            "bottom"
          )
        ) {
          height =
            viewportHeight -
            margin -
            top;
        } else {
          top =
            viewportHeight -
            margin -
            height;
        }
      }

      /*
      再次套用最小值，
      避免視窗限制後尺寸小於最低尺寸。
      */

      width =
        Math.max(
          this.resizeMinWidth,
          width
        );

      height =
        Math.max(
          this.resizeMinHeight,
          height
        );

      /*
      寫入面板樣式。
      */

      this.panel.style.left =
        `${Math.round(left)}px`;

      this.panel.style.top =
        `${Math.round(top)}px`;

      this.panel.style.width =
        `${Math.round(width)}px`;

      this.panel.style.height =
        `${Math.round(height)}px`;

      this.panel.style.right =
        "auto";

      this.panel.style.bottom =
        "auto";
    };

  /*
  ==================================================
  結束八方向縮放
  ==================================================
  */

  Scratchpad.prototype
    .stopEightDirectionResize =
    async function (event) {
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

      this
        .isResizingPanel =
        false;

      this.panel?.classList.remove(
        "scratchpad-panel--resizing"
      );

      this.resizeDirection =
        "";

      this.resizePointerId =
        null;

      /*
      縮放停止後才讓 ResizeObserver
      與 Canvas 尺寸更新恢復運作。
      */

      this.isOpeningPanel =
        false;

      /*
      重新依面板大小設定 Canvas，
      並保留剛才的計算內容。
      */

      try {
        if (
          typeof this
            .resizeCanvasPreserveContent ===
          "function"
        ) {
          await this
            .resizeCanvasPreserveContent();
        } else if (
          typeof this.setupCanvas ===
          "function"
        ) {
          await this.setupCanvas(
            true
          );
        }

        if (
          typeof this
            .saveCurrentQuestionImage ===
          "function"
        ) {
          this
            .saveCurrentQuestionImage();
        }

        if (
          typeof this
            .keepPanelInsideViewport ===
          "function"
        ) {
          this
            .keepPanelInsideViewport();
        }

        if (
          typeof this
            .updateToolbarState ===
          "function"
        ) {
          this
            .updateToolbarState();
        }
      } catch (error) {
        console.error(
          "計算紙縮放後重新調整畫布失敗：",
          error
        );
      }
    };

  /*
  ==================================================
  包裝原本 initialize()
  ==================================================

  scratchpad-template.js 通常會在 scratchpad.js
  載入完成後才建立 Scratchpad 實例。

  因此在實例建立前包裝 initialize()，
  可以自動加入八方向縮放功能。
  */

  const originalInitialize =
    Scratchpad.prototype
      .initialize;

  Scratchpad.prototype
    .initialize =
    function () {
      originalInitialize.call(
        this
      );

      this
        .initializeEightDirectionResize();
    };

  /*
  ==================================================
  包裝原本拖曳開始
  ==================================================

  正在縮放時不可同時拖曳面板。
  */

  const originalStartPanelDrag =
    Scratchpad.prototype
      .startPanelDrag;

  Scratchpad.prototype
    .startPanelDrag =
    function (event) {
      if (
        this.isResizingPanel ||
        event.target.closest(
          `.${HANDLE_CLASS}`
        )
      ) {
        return;
      }

      originalStartPanelDrag.call(
        this,
        event
      );
    };

  /*
  ==================================================
  包裝原本響應式模式
  ==================================================

  從桌面切換到手機版時清除手動寬高，
  恢復原本全螢幕模式。
  */

  const originalUpdateResponsiveMode =
    Scratchpad.prototype
      .updateResponsiveMode;

  Scratchpad.prototype
    .updateResponsiveMode =
    function () {
      originalUpdateResponsiveMode.call(
        this
      );

      if (
        this.isMobileView() &&
        this.panel
      ) {
        this.panel.style.width =
          "";

        this.panel.style.height =
          "";
      }
    };

  /*
  ==================================================
  包裝 destroy()
  ==================================================
  */

  const originalDestroy =
    Scratchpad.prototype.destroy;

  Scratchpad.prototype.destroy =
    function () {
      if (
        Array.isArray(
          this.resizeHandles
        )
      ) {
        this.resizeHandles
          .forEach(
            (handle) => {
              handle.remove();
            }
          );
      }

      this.resizeHandles =
        [];

      originalDestroy.call(
        this
      );
    };

  console.log(
    "共用計算紙八方向縮放功能已載入。"
  );
})();