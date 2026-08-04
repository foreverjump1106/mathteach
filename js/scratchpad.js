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
        options.openButtonId || "scratchpadOpenButton";

      this.closeButtonId =
        options.closeButtonId || "scratchpadCloseButton";

      this.penButtonId =
        options.penButtonId || "scratchpadPenButton";

      this.eraserButtonId =
        options.eraserButtonId || "scratchpadEraserButton";

      this.undoButtonId =
        options.undoButtonId || "scratchpadUndoButton";

      this.redoButtonId =
        options.redoButtonId || "scratchpadRedoButton";

      this.clearButtonId =
        options.clearButtonId || "scratchpadClearButton";

      this.downloadButtonId =
        options.downloadButtonId ||
        "scratchpadDownloadButton";

      this.defaultColor =
        options.defaultColor || "#111827";

      this.defaultSize =
        Number(options.defaultSize) || 4;

      this.canvas =
        document.getElementById(this.canvasId);

      this.panel =
        document.getElementById(this.panelId);

      this.header =
        document.getElementById(this.headerId);

      this.openButton =
        document.getElementById(this.openButtonId);

      this.closeButton =
        document.getElementById(this.closeButtonId);

      this.penButton =
        document.getElementById(this.penButtonId);

      this.eraserButton =
        document.getElementById(this.eraserButtonId);

      this.undoButton =
        document.getElementById(this.undoButtonId);

      this.redoButton =
        document.getElementById(this.redoButtonId);

      this.clearButton =
        document.getElementById(this.clearButtonId);

      this.downloadButton =
        document.getElementById(this.downloadButtonId);

      /*
      先建立空陣列，避免工具列尚未初始化時
      呼叫 forEach() 產生錯誤。
      */
      this.colorButtons = [];
      this.sizeButtons = [];

      this.ctx = null;

      this.tool = "pen";
      this.currentColor = this.defaultColor;
      this.currentSize = this.defaultSize;

      this.isDrawing = false;
      this.hasDrawnInCurrentStroke = false;

      this.lastX = 0;
      this.lastY = 0;

      this.isOpen = false;

      this.isDraggingPanel = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.panelStartLeft = 0;
      this.panelStartTop = 0;

      this.undoStack = [];
      this.redoStack = [];
      this.maxHistory = 30;
      this.isRestoringHistory = false;

      this.eventCleanups = [];
      this.isDestroyed = false;

      if (!this.canvas) {
        console.error(
          `找不到 id="${this.canvasId}" 的 Canvas。`
        );

        return;
      }

      this.ctx = this.canvas.getContext("2d");

      if (!this.ctx) {
        console.error("瀏覽器無法建立 Canvas 2D 繪圖環境。");
        return;
      }

      this.initialize();
    }

    initialize() {
      this.setupCanvas();
      this.initializeDrawing();
      this.initializeWindow();
      this.initializeToolbar();
      this.initializeKeyboardShortcuts();
      this.initializeResizeListener();
      this.initializePanelResizeObserver();
      
      this.saveHistory();
      this.updateToolbarState();
    }

    /*
    ==================================================
    共用事件綁定
    ==================================================
    */

    addEvent(element, eventName, handler, options) {
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
    Canvas 尺寸
    ==================================================
    */

    setupCanvas(preserveContent = false) {
      if (!this.canvas || !this.ctx) {
        return;
      }

      const rect =
        this.canvas.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      let oldImage = null;

      if (
        preserveContent &&
        this.canvas.width > 0 &&
        this.canvas.height > 0
      ) {
        oldImage = this.canvas.toDataURL("image/png");
      }

      const ratio =
        window.devicePixelRatio || 1;

      this.canvas.width =
        Math.max(1, Math.round(rect.width * ratio));

      this.canvas.height =
        Math.max(1, Math.round(rect.height * ratio));

      this.ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );

      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      this.canvas.style.touchAction = "none";

      if (oldImage) {
        const image = new Image();

        image.onload = () => {
          if (!this.ctx || !this.canvas) {
            return;
          }

          this.ctx.save();
          this.ctx.resetTransform();

          this.ctx.drawImage(
            image,
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );

          this.ctx.restore();

          this.resetHistory();
        };

        image.src = oldImage;
      }
    }

    resizeCanvasPreserveContent() {
      this.setupCanvas(true);
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
        (event) => this.startDrawing(event)
      );

      this.addEvent(
        this.canvas,
        "pointermove",
        (event) => this.draw(event)
      );

      this.addEvent(
        this.canvas,
        "pointerup",
        (event) => this.stopDrawing(event)
      );

      this.addEvent(
        this.canvas,
        "pointercancel",
        (event) => this.stopDrawing(event)
      );

      this.addEvent(
        this.canvas,
        "pointerleave",
        (event) => this.stopDrawing(event)
      );
    }

    getPointerPosition(event) {
      const rect =
        this.canvas.getBoundingClientRect();

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }

    startDrawing(event) {
      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();

      try {
        this.canvas.setPointerCapture(
          event.pointerId
        );
      } catch (error) {
        // 某些瀏覽器不支援時可忽略。
      }

      const position =
        this.getPointerPosition(event);

      this.isDrawing = true;
      this.hasDrawnInCurrentStroke = false;

      this.lastX = position.x;
      this.lastY = position.y;
    }

    draw(event) {
      if (!this.isDrawing || !this.ctx) {
        return;
      }

      event.preventDefault();

      const position =
        this.getPointerPosition(event);

      this.ctx.beginPath();
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      if (this.tool === "eraser") {
        this.ctx.globalCompositeOperation =
          "destination-out";

        this.ctx.strokeStyle =
          "rgba(0, 0, 0, 1)";

        this.ctx.lineWidth =
          Math.max(this.currentSize * 4, 16);
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
        position.x,
        position.y
      );

      this.ctx.stroke();

      this.lastX = position.x;
      this.lastY = position.y;

      this.hasDrawnInCurrentStroke = true;
    }

    stopDrawing(event) {
      if (!this.isDrawing) {
        return;
      }

      this.isDrawing = false;

      if (this.ctx) {
        this.ctx.closePath();
        this.ctx.globalCompositeOperation =
          "source-over";
      }

      if (
        event &&
        this.canvas &&
        this.canvas.hasPointerCapture &&
        this.canvas.hasPointerCapture(event.pointerId)
      ) {
        try {
          this.canvas.releasePointerCapture(
            event.pointerId
          );
        } catch (error) {
          // 可忽略。
        }
      }

      if (this.hasDrawnInCurrentStroke) {
        this.saveHistory();
      }

      this.hasDrawnInCurrentStroke = false;
      this.updateToolbarState();
    }

    /*
    ==================================================
    工具切換
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
        typeof color !== "string" ||
        color.trim() === ""
      ) {
        return;
      }

      this.currentColor = color;
      this.tool = "pen";

      this.notifyToolChange();
    }

    setSize(size) {
      const newSize = Number(size);

      if (
        !Number.isFinite(newSize) ||
        newSize < 1 ||
        newSize > 50
      ) {
        return;
      }

      this.currentSize = newSize;

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
              tool: this.tool,
              color: this.currentColor,
              size: this.currentSize
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
      if (!this.canvas || !this.ctx) {
        return;
      }

      this.ctx.save();
      this.ctx.resetTransform();

      this.ctx.clearRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      this.ctx.restore();

      this.ctx.globalCompositeOperation =
        "source-over";

      if (saveToHistory) {
        this.saveHistory();
      }

      this.updateToolbarState();
    }

    isBlank() {
      if (!this.canvas) {
        return true;
      }

      const blankCanvas =
        document.createElement("canvas");

      blankCanvas.width =
        this.canvas.width;

      blankCanvas.height =
        this.canvas.height;

      return (
        this.canvas.toDataURL("image/png") ===
        blankCanvas.toDataURL("image/png")
      );
    }

    /*
    ==================================================
    歷史紀錄
    ==================================================
    */

    getCanvasImage() {
      if (!this.canvas) {
        return null;
      }

      return this.canvas.toDataURL("image/png");
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

      if (lastImage === imageData) {
        this.notifyHistoryChange();
        return;
      }

      this.undoStack.push(imageData);

      if (
        this.undoStack.length >
        this.maxHistory
      ) {
        this.undoStack.shift();
      }

      this.redoStack = [];

      this.notifyHistoryChange();
    }

    restoreCanvasImage(imageData) {
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

          const image = new Image();

          image.onload = () => {
            this.isRestoringHistory = true;

            this.ctx.save();
            this.ctx.resetTransform();

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

            this.ctx.globalCompositeOperation =
              "source-over";

            this.isRestoringHistory = false;

            this.updateToolbarState();
            resolve();
          };

          image.onerror = () => {
            this.isRestoringHistory = false;

            reject(
              new Error(
                "無法還原計算紙內容。"
              )
            );
          };

          image.src = imageData;
        }
      );
    }

    async undo() {
      if (!this.canUndo()) {
        return false;
      }

      const currentImage =
        this.undoStack.pop();

      this.redoStack.push(currentImage);

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

      this.undoStack.push(nextImage);

      await this.restoreCanvasImage(
        nextImage
      );

      this.notifyHistoryChange();

      return true;
    }

    canUndo() {
      return this.undoStack.length > 1;
    }

    canRedo() {
      return this.redoStack.length > 0;
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
              canUndo: this.canUndo(),
              canRedo: this.canRedo(),
              undoCount: Math.max(
                this.undoStack.length - 1,
                0
              ),
              redoCount:
                this.redoStack.length
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

    newQuestion() {
      this.clear(false);

      this.tool = "pen";
      this.currentColor =
        this.defaultColor;

      this.currentSize =
        this.defaultSize;

      this.resetHistory();
      this.updateToolbarState();
    }

    /*
    ==================================================
    開啟與關閉面板
    ==================================================
    */

    initializeWindow() {
      if (!this.panel) {
        console.warn(
          `找不到 id="${this.panelId}" 的計算紙面板。`
        );

        return;
      }

      if (this.panel.hidden === false) {
        this.panel.hidden = true;
      }

      this.addEvent(
        this.openButton,
        "click",
        () => this.open()
      );

      this.addEvent(
        this.closeButton,
        "click",
        () => this.close()
      );

      this.initializePanelDragging();
      this.updateResponsiveMode();
    }

    isMobileView() {
      return window.innerWidth <= 768;
    }

    open() {
      if (!this.panel) {
        return;
      }

      this.isOpen = true;
      this.panel.hidden = false;

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
        requestAnimationFrame(() => {
          this.setupCanvas(true);

          if (
            this.undoStack.length === 0
          ) {
            this.saveHistory();
          }
        });
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
      if (!this.panel) {
        return;
      }

      this.isOpen = false;

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
        this.panel.offsetWidth || 420;

      const panelHeight =
        this.panel.offsetHeight || 560;

      const left = Math.max(
        window.innerWidth -
          panelWidth -
          margin,
        margin
      );

      const top = Math.max(
        window.innerHeight -
          panelHeight -
          margin,
        margin
      );

      this.panel.style.left =
        `${left}px`;

      this.panel.style.top =
        `${top}px`;

      this.panel.style.right = "auto";
      this.panel.style.bottom = "auto";
    }

    /*
    ==================================================
    拖曳視窗
    ==================================================
    */

    initializePanelDragging() {
      if (!this.header || !this.panel) {
        return;
      }

      this.addEvent(
        this.header,
        "pointerdown",
        (event) =>
          this.startPanelDrag(event)
      );

      this.addEvent(
        window,
        "pointermove",
        (event) =>
          this.movePanel(event)
      );

      this.addEvent(
        window,
        "pointerup",
        () => this.stopPanelDrag()
      );

      this.addEvent(
        window,
        "pointercancel",
        () => this.stopPanelDrag()
      );
    }

    startPanelDrag(event) {
      if (
        this.isMobileView() ||
        event.target.closest("button")
      ) {
        return;
      }

      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();

      const rect =
        this.panel.getBoundingClientRect();

      this.isDraggingPanel = true;

      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;

      this.panelStartLeft = rect.left;
      this.panelStartTop = rect.top;

      this.panel.classList.add(
        "scratchpad-panel--dragging"
      );

      try {
        this.header.setPointerCapture(
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

      const maxLeft = Math.max(
        window.innerWidth -
          this.panel.offsetWidth,
        0
      );

      const maxTop = Math.max(
        window.innerHeight -
          this.panel.offsetHeight,
        0
      );

      const newLeft = Math.min(
        Math.max(
          this.panelStartLeft + moveX,
          0
        ),
        maxLeft
      );

      const newTop = Math.min(
        Math.max(
          this.panelStartTop + moveY,
          0
        ),
        maxTop
      );

      this.panel.style.left =
        `${newLeft}px`;

      this.panel.style.top =
        `${newTop}px`;

      this.panel.style.right = "auto";
      this.panel.style.bottom = "auto";
    }

    stopPanelDrag() {
      if (!this.isDraggingPanel) {
        return;
      }

      this.isDraggingPanel = false;

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
        this.panel.getBoundingClientRect();

      const maxLeft = Math.max(
        window.innerWidth -
          this.panel.offsetWidth,
        0
      );

      const maxTop = Math.max(
        window.innerHeight -
          this.panel.offsetHeight,
        0
      );

      this.panel.style.left =
        `${Math.min(
          Math.max(rect.left, 0),
          maxLeft
        )}px`;

      this.panel.style.top =
        `${Math.min(
          Math.max(rect.top, 0),
          maxTop
        )}px`;

      this.panel.style.right = "auto";
      this.panel.style.bottom = "auto";
    }

    /*
    ==================================================
    工具列
    ==================================================
    */

    initializeToolbar() {
      this.colorButtons = Array.from(
        document.querySelectorAll(
          "[data-scratchpad-color]"
        )
      );

      this.sizeButtons = Array.from(
        document.querySelectorAll(
          "[data-scratchpad-size]"
        )
      );

      this.addEvent(
        this.penButton,
        "click",
        () => this.usePen()
      );

      this.addEvent(
        this.eraserButton,
        "click",
        () => this.useEraser()
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

      /*
      再次保護，避免尚未建立陣列時出錯。
      */
      if (!Array.isArray(this.colorButtons)) {
        this.colorButtons = [];
      }

      if (!Array.isArray(this.sizeButtons)) {
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
          const isActive =
            this.tool === "pen" &&
            button.dataset
              .scratchpadColor ===
              this.currentColor;

          this.setButtonActiveState(
            button,
            isActive
          );
        }
      );

      this.sizeButtons.forEach(
        (button) => {
          const isActive =
            Number(
              button.dataset
                .scratchpadSize
            ) ===
            Number(this.currentSize);

          this.setButtonActiveState(
            button,
            isActive
          );
        }
      );

      if (this.undoButton) {
        this.undoButton.disabled =
          !this.canUndo();

        this.undoButton.setAttribute(
          "aria-disabled",
          String(!this.canUndo())
        );
      }

      if (this.redoButton) {
        this.redoButton.disabled =
          !this.canRedo();

        this.redoButton.setAttribute(
          "aria-disabled",
          String(!this.canRedo())
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
    鍵盤快捷鍵
    ==================================================
    */

    initializeKeyboardShortcuts() {
      this.addEvent(
        window,
        "keydown",
        (event) =>
          this.handleKeyboardShortcut(
            event
          )
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
          activeElement.isContentEditable
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

      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
        return;
      }

      if (event.key === "Delete") {
        event.preventDefault();

        if (!this.isBlank()) {
          this.clear(true);
        }
      }
    }

    /*
    ==================================================
    視窗大小改變
    ==================================================
    */
/*
==================================================
監聽計算紙面板拉大與縮小
==================================================

當使用者拖曳面板右下角時，
ResizeObserver 會偵測面板尺寸改變。

調整完成後：
1. 重新設定 Canvas 大小
2. 保留原本的計算內容
3. 防止面板超出瀏覽器畫面
*/

initializePanelResizeObserver() {
  if (
    !this.panel ||
    typeof ResizeObserver !== "function"
  ) {
    return;
  }

  let resizeTimer = null;

  this.panelResizeObserver =
    new ResizeObserver(() => {
      /*
      面板尚未開啟時不處理。
      */

      if (
        !this.isOpen ||
        this.isDestroyed
      ) {
        return;
      }

      /*
      手機版使用全螢幕，
      不需要處理手動縮放。
      */

      if (this.isMobileView()) {
        return;
      }

      /*
      使用延遲處理，
      避免使用者拖曳過程中
      Canvas 每一瞬間都重新建立。
      */

      window.clearTimeout(resizeTimer);

      resizeTimer =
        window.setTimeout(() => {
          if (
            !this.isOpen ||
            this.isDestroyed
          ) {
            return;
          }

          /*
          Canvas 配合新的面板尺寸，
          並保留原本畫面。
          */

          this.resizeCanvasPreserveContent();

          /*
          防止拉大後超出瀏覽器範圍。
          */

          this.keepPanelInsideViewport();
        }, 120);
    });

  this.panelResizeObserver.observe(
    this.panel
  );

  /*
  Scratchpad 銷毀時，
  一起停止 ResizeObserver。
  */

  this.eventCleanups.push(() => {
    window.clearTimeout(resizeTimer);

    if (this.panelResizeObserver) {
      this.panelResizeObserver.disconnect();
      this.panelResizeObserver = null;
    }
  });
}
    initializeResizeListener() {
      let resizeTimer = null;

      this.addEvent(
        window,
        "resize",
        () => {
          window.clearTimeout(
            resizeTimer
          );

          resizeTimer =
            window.setTimeout(
              () => {
                this.updateResponsiveMode();

                if (
                  !this.isMobileView()
                ) {
                  this.keepPanelInsideViewport();
                }

                if (this.isOpen) {
                  this.resizeCanvasPreserveContent();
                }
              },
              150
            );
        }
      );
    }

    /*
    ==================================================
    圖片下載
    ==================================================
    */

    createDownloadFilename() {
      const now = new Date();

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
          .endsWith(".png")
      ) {
        filename += ".png";
      }

      const link =
        document.createElement("a");

      link.href =
        this.canvas.toDataURL(
          "image/png"
        );

      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    }

    /*
    ==================================================
    狀態與銷毀
    ==================================================
    */

    getState() {
      return {
        tool: this.tool,
        color: this.currentColor,
        size: this.currentSize,
        isOpen: this.isOpen,
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

      if (this.panel) {
        this.panel.hidden = true;

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
  提供給 scratchpad-template.js 使用
  ==================================================
  */

  window.Scratchpad = Scratchpad;

  window.createScratchpad =
    function (options = {}) {
      return new Scratchpad(options);
    };
})();
/*


