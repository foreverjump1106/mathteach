/*
==================================================
Math Game Park 共用計算紙
檔案：js/scratchpad.js
版本：1.0
==================================================

Part 1 功能：
1. 建立 Scratchpad 類別
2. 取得 Canvas 畫布
3. 支援滑鼠、觸控筆與手指
4. 可以在畫布上畫線
5. 自動調整 Canvas 清晰度
==================================================
*/

class Scratchpad {
  constructor(options = {}) {
    /*
    options 是設定資料。

    未來不同遊戲使用計算紙時，可以傳入不同設定，例如：

    new Scratchpad({
      canvasId: "scratchpadCanvas",
      defaultColor: "#000000",
      defaultSize: 4
    });
    */

    this.canvasId = options.canvasId || "scratchpadCanvas";
    this.defaultColor = options.defaultColor || "#000000";
    this.defaultSize = options.defaultSize || 4;

    // 找到 HTML 裡的 Canvas。
    this.canvas = document.getElementById(this.canvasId);

    // 如果找不到 Canvas，就停止執行並顯示錯誤。
    if (!this.canvas) {
      console.error(
        `找不到 id="${this.canvasId}" 的 Canvas 元素。`
      );
      return;
    }

    // 取得 Canvas 的 2D 繪圖工具。
    this.ctx = this.canvas.getContext("2d");

    // 記錄目前是否正在畫線。
    this.isDrawing = false;

    // 記錄上一個座標。
    this.lastX = 0;
    this.lastY = 0;

    // 目前筆的顏色。
    this.currentColor = this.defaultColor;

    // 目前筆的粗細。
    this.currentSize = this.defaultSize;

    // 初始化畫布。
    this.setupCanvas();

    // 綁定滑鼠、觸控筆與手指事件。
    this.bindEvents();
  }

  setupCanvas() {
    /*
    devicePixelRatio 是裝置的螢幕像素比例。

    一般螢幕通常是 1。
    高解析度螢幕可能是 2 或 3。

    如果不處理，高解析度螢幕上的 Canvas
    可能會看起來模糊。
    */

    const pixelRatio = window.devicePixelRatio || 1;

    /*
    getBoundingClientRect() 可以取得 Canvas
    實際顯示在網頁上的寬度與高度。
    */

    const rect = this.canvas.getBoundingClientRect();

    /*
    Canvas 有兩種尺寸：

    1. CSS 顯示尺寸
    2. Canvas 內部繪圖尺寸

    內部尺寸乘上 pixelRatio，
    可以讓線條在高解析度螢幕上更清楚。
    */

    this.canvas.width = rect.width * pixelRatio;
    this.canvas.height = rect.height * pixelRatio;

    /*
    將繪圖座標縮放回正常的 CSS 尺寸。

    這樣我們畫線時，不需要自己把每個座標
    都乘上 pixelRatio。
    */

    this.ctx.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0
    );

    // 設定線條兩端為圓形。
    this.ctx.lineCap = "round";

    // 設定線條轉彎處為圓形。
    this.ctx.lineJoin = "round";
  }

  bindEvents() {
    /*
    Pointer Event 可以同時支援：

    1. 滑鼠
    2. 觸控筆
    3. 手指觸控

    所以不需要分別寫 mouse 和 touch 事件。
    */

    this.canvas.addEventListener(
      "pointerdown",
      (event) => this.startDrawing(event)
    );

    this.canvas.addEventListener(
      "pointermove",
      (event) => this.draw(event)
    );

    this.canvas.addEventListener(
      "pointerup",
      () => this.stopDrawing()
    );

    this.canvas.addEventListener(
      "pointercancel",
      () => this.stopDrawing()
    );

    this.canvas.addEventListener(
      "pointerleave",
      () => this.stopDrawing()
    );

    /*
    防止手機或平板在畫畫時，
    頁面跟著上下滑動。
    */

    this.canvas.style.touchAction = "none";
  }

  getPointerPosition(event) {
    /*
    取得 Canvas 在螢幕中的位置。
    */

    const rect = this.canvas.getBoundingClientRect();

    /*
    clientX、clientY 是指標在瀏覽器視窗中的位置。

    減掉 Canvas 左上角的位置後，
    就會得到指標在 Canvas 裡面的座標。
    */

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  startDrawing(event) {
    // 告訴瀏覽器，這個指標由 Canvas 負責處理。
    this.canvas.setPointerCapture(event.pointerId);

    // 開始畫線。
    this.isDrawing = true;

    // 取得起始座標。
    const position = this.getPointerPosition(event);

    this.lastX = position.x;
    this.lastY = position.y;
  }

  draw(event) {
    // 如果目前沒有按住滑鼠或觸控，就不畫線。
    if (!this.isDrawing) {
      return;
    }

    // 取得目前座標。
    const position = this.getPointerPosition(event);

    // 開始一條新的線段。
    this.ctx.beginPath();

    // 設定線條顏色。
    this.ctx.strokeStyle = this.currentColor;

    // 設定線條粗細。
    this.ctx.lineWidth = this.currentSize;

    // 從上一個座標開始。
    this.ctx.moveTo(this.lastX, this.lastY);

    // 畫到目前座標。
    this.ctx.lineTo(position.x, position.y);

    // 正式顯示線條。
    this.ctx.stroke();

    // 將目前座標記錄成下一次的上一個座標。
    this.lastX = position.x;
    this.lastY = position.y;
  }

  stopDrawing() {
    // 停止畫線。
    this.isDrawing = false;

    // 結束目前路徑。
    this.ctx.closePath();
  }
}

/*
將 Scratchpad 類別掛到 window 上。

這樣其他遊戲頁面就可以使用：

new Scratchpad();
*/

window.Scratchpad = Scratchpad;
/*
==================================================
Part 2：畫筆工具功能
==================================================

新增功能：
1. 改變畫筆顏色
2. 改變畫筆粗細
3. 使用橡皮擦
4. 切回畫筆
5. 清除整張計算紙
6. 取得目前工具狀態
==================================================
*/

/*
設定畫筆顏色。

使用方式：

scratchpad.setColor("#000000");
scratchpad.setColor("#2563eb");
scratchpad.setColor("#dc2626");
*/

Scratchpad.prototype.setColor = function (color) {
  /*
  確認傳入的 color 是文字。

  合法例子：
  "#000000"
  "#2563eb"
  "red"
  "blue"
  */

  if (typeof color !== "string" || color.trim() === "") {
    console.warn("setColor() 必須傳入有效的顏色文字。");
    return;
  }

  // 儲存新的畫筆顏色。
  this.currentColor = color;

  // 切換顏色時，自動切回畫筆模式。
  this.tool = "pen";
};


/*
設定畫筆粗細。

使用方式：

scratchpad.setSize(2);
scratchpad.setSize(4);
scratchpad.setSize(8);
*/

Scratchpad.prototype.setSize = function (size) {
  /*
  Number(size) 可以把文字數字轉成真正的數字。

  例如：
  "5" 會轉成 5
  */

  const newSize = Number(size);

  /*
  Number.isFinite() 用來確認它是不是有效數字。

  同時限制粗細不能小於 1，也不能大於 50。
  */

  if (
    !Number.isFinite(newSize) ||
    newSize < 1 ||
    newSize > 50
  ) {
    console.warn("畫筆粗細必須是 1 到 50 之間的數字。");
    return;
  }

  this.currentSize = newSize;
};


/*
切換成畫筆模式。

使用方式：

scratchpad.usePen();
*/

Scratchpad.prototype.usePen = function () {
  this.tool = "pen";
};


/*
切換成橡皮擦模式。

使用方式：

scratchpad.useEraser();
*/

Scratchpad.prototype.useEraser = function () {
  this.tool = "eraser";
};


/*
清除整張 Canvas。

使用方式：

scratchpad.clear();
*/

Scratchpad.prototype.clear = function () {
  /*
  Canvas 的內部尺寸可能因高解析度螢幕而放大。

  所以清除前，先把座標轉換暫時恢復成原始狀態。
  */

  this.ctx.save();

  /*
  resetTransform() 會暫時取消前面設定的縮放。

  這樣 clearRect() 才能確實清除整張畫布。
  */

  this.ctx.resetTransform();

  this.ctx.clearRect(
    0,
    0,
    this.canvas.width,
    this.canvas.height
  );

  /*
  恢復原本的高解析度縮放設定。
  */

  this.ctx.restore();
};


/*
取得目前計算紙的工具狀態。

使用方式：

const state = scratchpad.getState();
console.log(state);
*/

Scratchpad.prototype.getState = function () {
  return {
    tool: this.tool || "pen",
    color: this.currentColor,
    size: this.currentSize
  };
};


/*
==================================================
覆寫原本的 draw() 方法
==================================================

Part 1 的 draw() 只支援一般畫筆。

現在重新定義 draw()，
讓它同時支援畫筆與橡皮擦。
==================================================
*/

Scratchpad.prototype.draw = function (event) {
  // 如果目前沒有在畫線，就停止。
  if (!this.isDrawing) {
    return;
  }

  // 取得目前指標在 Canvas 裡的位置。
  const position = this.getPointerPosition(event);

  // 開始新的繪圖路徑。
  this.ctx.beginPath();

  // 設定線條兩端與轉角為圓形。
  this.ctx.lineCap = "round";
  this.ctx.lineJoin = "round";

  /*
  判斷目前使用的是橡皮擦還是畫筆。
  */

  if (this.tool === "eraser") {
    /*
    destination-out 的意思是：

    新畫出的部分會把原本的像素擦除。

    因此不需要使用白色畫筆假裝是橡皮擦，
    即使背景之後換成方格紙，也能真正擦除。
    */

    this.ctx.globalCompositeOperation = "destination-out";

    /*
    橡皮擦通常要比畫筆粗一點，
    所以將目前粗細乘以 4。

    Math.max() 確保橡皮擦至少有 16 像素寬。
    */

    this.ctx.lineWidth = Math.max(
      this.currentSize * 4,
      16
    );

    /*
    destination-out 模式主要看透明度，
    顏色本身不重要。
    */

    this.ctx.strokeStyle = "rgba(0, 0, 0, 1)";
  } else {
    /*
    source-over 是 Canvas 預設的正常繪圖模式。

    新畫出的線條會疊在舊內容上面。
    */

    this.ctx.globalCompositeOperation = "source-over";

    // 使用目前選擇的畫筆顏色。
    this.ctx.strokeStyle = this.currentColor;

    // 使用目前選擇的畫筆粗細。
    this.ctx.lineWidth = this.currentSize;
  }

  // 從上一個位置開始。
  this.ctx.moveTo(this.lastX, this.lastY);

  // 畫到目前位置。
  this.ctx.lineTo(position.x, position.y);

  // 顯示線條。
  this.ctx.stroke();

  /*
  將目前座標記錄下來，
  供下一次 pointermove 使用。
  */

  this.lastX = position.x;
  this.lastY = position.y;
};


/*
==================================================
初始化工具狀態
==================================================

Part 1 建立物件時還沒有 tool 屬性。

因此我們保留原本 constructor，
再補上一個初始化工具的方法。
==================================================
*/

Scratchpad.prototype.initializeTools = function () {
  this.tool = "pen";
  this.currentColor =
    this.currentColor || this.defaultColor || "#000000";

  this.currentSize =
    this.currentSize || this.defaultSize || 4;
};


/*
重新包裝原本的 Scratchpad 建立方法。

這個函式會在建立計算紙後，
自動初始化工具狀態。
*/

window.createScratchpad = function (options = {}) {
  const scratchpad = new Scratchpad(options);

  /*
  只有成功找到 Canvas 時，
  才執行初始化。
  */

  if (scratchpad.canvas) {
    scratchpad.initializeTools();
  }

  return scratchpad;
};
/*
==================================================
Part 3：復原、重做與題目切換
==================================================

新增功能：
1. 儲存畫布歷史紀錄
2. 復原 Undo
3. 重做 Redo
4. 每題開始時自動清除
5. 限制歷史紀錄數量
6. 查詢是否可以復原或重做
==================================================
*/


/*
初始化歷史紀錄。

undoStack：
儲存可以復原的畫布狀態。

redoStack：
儲存可以重做的畫布狀態。

maxHistory：
最多保存幾個歷史紀錄。
*/

Scratchpad.prototype.initializeHistory = function () {
  this.undoStack = [];
  this.redoStack = [];

  /*
  最多保存 30 個狀態。

  如果保存太多圖片資料，
  可能會占用過多記憶體。
  */

  this.maxHistory = 30;

  /*
  記錄目前是否正在還原圖片。

  避免 Undo 或 Redo 時，
  又被誤認為新的畫圖紀錄。
  */

  this.isRestoringHistory = false;

  /*
  儲存初始的空白畫布。

  這樣第一次畫圖後，
  才能復原回空白狀態。
  */

  this.saveHistory();
};


/*
取得目前畫布圖片。

toDataURL() 會將 Canvas 轉成圖片文字資料。

例如：

data:image/png;base64,......
*/

Scratchpad.prototype.getCanvasImage = function () {
  if (!this.canvas) {
    return null;
  }

  return this.canvas.toDataURL("image/png");
};


/*
儲存目前畫布狀態。
*/

Scratchpad.prototype.saveHistory = function () {
  /*
  如果正在執行 Undo 或 Redo，
  就不要再重複保存。
  */

  if (this.isRestoringHistory) {
    return;
  }

  const imageData = this.getCanvasImage();

  if (!imageData) {
    return;
  }

  /*
  取得最後一個歷史紀錄。

  如果目前圖片和最後一筆完全相同，
  就不重複保存。
  */

  const lastImage =
    this.undoStack[this.undoStack.length - 1];

  if (lastImage === imageData) {
    return;
  }

  // 將目前圖片加入復原紀錄。
  this.undoStack.push(imageData);

  /*
  如果超過最大紀錄數，
  就刪除最舊的一筆。
  */

  if (this.undoStack.length > this.maxHistory) {
    this.undoStack.shift();
  }

  /*
  使用者畫了新的內容後，
  原本的 Redo 紀錄就必須清除。

  例如：

  畫 A → 畫 B → Undo 回 A → 畫 C

  這時不能再 Redo 回 B，
  因為新的路線已經變成 A → C。
  */

  this.redoStack = [];

  // 通知工具列更新按鈕狀態。
  this.notifyHistoryChange();
};


/*
將圖片資料還原到 Canvas。
*/

Scratchpad.prototype.restoreCanvasImage = function (
  imageData
) {
  return new Promise((resolve, reject) => {
    if (!imageData) {
      resolve();
      return;
    }

    const image = new Image();

    image.onload = () => {
      /*
      設定正在還原歷史狀態。

      避免還原過程被誤判成新畫圖。
      */

      this.isRestoringHistory = true;

      /*
      清除目前 Canvas。

      這裡使用 Canvas 內部實際尺寸。
      */

      this.ctx.save();
      this.ctx.resetTransform();

      this.ctx.clearRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      /*
      將圖片畫回 Canvas。

      圖片尺寸與 Canvas 內部尺寸一致。
      */

      this.ctx.drawImage(
        image,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      this.ctx.restore();

      this.isRestoringHistory = false;

      resolve();
    };

    image.onerror = () => {
      this.isRestoringHistory = false;

      console.error("計算紙歷史圖片載入失敗。");

      reject(
        new Error("無法還原計算紙歷史紀錄。")
      );
    };

    image.src = imageData;
  });
};


/*
復原上一個動作。

使用方式：

scratchpad.undo();
*/

Scratchpad.prototype.undo = async function () {
  /*
  至少需要兩筆紀錄才能復原。

  第一筆通常是空白畫布，
  第二筆是第一次畫圖後的狀態。
  */

  if (this.undoStack.length <= 1) {
    return false;
  }

  /*
  取出目前畫面，
  放進 redoStack。
  */

  const currentImage = this.undoStack.pop();

  this.redoStack.push(currentImage);

  /*
  undoStack 最後一筆，
  就是要恢復的上一個狀態。
  */

  const previousImage =
    this.undoStack[this.undoStack.length - 1];

  await this.restoreCanvasImage(previousImage);

  this.notifyHistoryChange();

  return true;
};


/*
重做剛才復原的動作。

使用方式：

scratchpad.redo();
*/

Scratchpad.prototype.redo = async function () {
  if (this.redoStack.length === 0) {
    return false;
  }

  /*
  從 redoStack 取出下一個狀態。
  */

  const nextImage = this.redoStack.pop();

  /*
  將這個狀態重新放回 undoStack。
  */

  this.undoStack.push(nextImage);

  await this.restoreCanvasImage(nextImage);

  this.notifyHistoryChange();

  return true;
};


/*
判斷目前是否可以復原。
*/

Scratchpad.prototype.canUndo = function () {
  return this.undoStack.length > 1;
};


/*
判斷目前是否可以重做。
*/

Scratchpad.prototype.canRedo = function () {
  return this.redoStack.length > 0;
};


/*
取得歷史紀錄狀態。
*/

Scratchpad.prototype.getHistoryState = function () {
  return {
    canUndo: this.canUndo(),
    canRedo: this.canRedo(),
    undoCount: Math.max(
      this.undoStack.length - 1,
      0
    ),
    redoCount: this.redoStack.length
  };
};


/*
通知外部：

復原與重做狀態已經改變。

之後工具列可以監聽這個事件，
決定是否停用 Undo 或 Redo 按鈕。
*/

Scratchpad.prototype.notifyHistoryChange = function () {
  if (!this.canvas) {
    return;
  }

  const historyState = this.getHistoryState();

  const historyEvent = new CustomEvent(
    "scratchpadhistorychange",
    {
      detail: historyState
    }
  );

  this.canvas.dispatchEvent(historyEvent);
};


/*
==================================================
重新定義 startDrawing()
==================================================

Part 1 的 startDrawing() 已經可以開始畫線。

現在補強：

1. 確認滑鼠按鍵
2. 防止不必要的瀏覽器行為
3. 安全取得 Pointer Capture
==================================================
*/

Scratchpad.prototype.startDrawing = function (event) {
  /*
  滑鼠左鍵的 button 是 0。

  觸控與觸控筆也通常會回傳 0。

  如果是滑鼠右鍵或中鍵，
  就不要開始畫圖。
  */

  if (
    event.pointerType === "mouse" &&
    event.button !== 0
  ) {
    return;
  }

  event.preventDefault();

  /*
  Pointer Capture 可以讓使用者的指標
  暫時離開 Canvas 時，
  仍然持續接收移動事件。
  */

  try {
    this.canvas.setPointerCapture(event.pointerId);
  } catch (error) {
    console.warn(
      "無法設定 Pointer Capture：",
      error
    );
  }

  this.isDrawing = true;

  const position = this.getPointerPosition(event);

  this.lastX = position.x;
  this.lastY = position.y;

  /*
  保存這一筆畫圖開始前的狀態。

  不過因為前一個動作完成時已保存，
  saveHistory() 會自動檢查重複，
  所以不會產生多餘紀錄。
  */

  this.saveHistory();
};


/*
==================================================
重新定義 stopDrawing()
==================================================

當一次畫線結束時，
將完成後的畫布存進歷史紀錄。
==================================================
*/

Scratchpad.prototype.stopDrawing = function () {
  /*
  如果本來沒有在畫，
  就不用重複處理。

  pointerup、pointerleave、pointercancel
  有時可能連續觸發。
  */

  if (!this.isDrawing) {
    return;
  }

  this.isDrawing = false;

  this.ctx.closePath();

  /*
  一筆線條完成後，
  保存新的畫布狀態。
  */

  this.saveHistory();
};


/*
==================================================
重新定義 clear()
==================================================

Part 2 的 clear() 可以清除 Canvas。

現在增加：

1. 可選擇是否保存歷史
2. 清除後可以使用 Undo 復原
==================================================
*/

Scratchpad.prototype.clear = function (
  saveToHistory = true
) {
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

  /*
  如果 saveToHistory 是 true，
  清除動作也會被保存。

  因此學生誤按清除時，
  可以按 Undo 找回內容。
  */

  if (saveToHistory) {
    this.saveHistory();
  }
};


/*
開始新題目。

使用方式：

scratchpad.newQuestion();
*/

Scratchpad.prototype.newQuestion = function () {
  /*
  新題目直接清空，
  但不把清空動作加入舊題目的紀錄。
  */

  this.clear(false);

  /*
  清除上一題的 Undo 與 Redo。
  */

  this.undoStack = [];
  this.redoStack = [];

  /*
  重新保存新題目的空白狀態。
  */

  this.saveHistory();

  this.notifyHistoryChange();
};


/*
完全重設歷史紀錄。

這個方法不會清除畫面，
只會將目前畫面當成新的起點。
*/

Scratchpad.prototype.resetHistory = function () {
  this.undoStack = [];
  this.redoStack = [];

  this.saveHistory();

  this.notifyHistoryChange();
};


/*
==================================================
更新 createScratchpad()
==================================================

Part 2 已經建立 createScratchpad()。

現在重新定義，
讓建立計算紙時同時初始化：

1. 畫筆工具
2. 歷史紀錄
==================================================
*/

window.createScratchpad = function (options = {}) {
  const scratchpad = new Scratchpad(options);

  if (scratchpad.canvas) {
    scratchpad.initializeTools();
    scratchpad.initializeHistory();
  }

  return scratchpad;
};
/*
==================================================
Part 4：視窗開關、拖曳與全螢幕
==================================================

新增功能：
1. 開啟計算紙
2. 關閉計算紙
3. 切換開啟／關閉
4. 桌面版可以拖曳
5. 手機版自動全螢幕
6. 監聽視窗大小改變
7. 防止拖曳超出畫面
==================================================
*/


/*
初始化計算紙視窗功能。

需要 HTML 裡面有：

scratchpadPanel
scratchpadHeader
scratchpadOpenButton
scratchpadCloseButton

如果某個元素不存在，
程式不會中斷，只會略過該功能。
*/

Scratchpad.prototype.initializeWindow = function (
  options = {}
) {
  /*
  設定各個 HTML 元素的 id。

  如果建立 Scratchpad 時沒有指定，
  就使用下面的預設名稱。
  */

  this.panelId =
    options.panelId || "scratchpadPanel";

  this.headerId =
    options.headerId || "scratchpadHeader";

  this.openButtonId =
    options.openButtonId || "scratchpadOpenButton";

  this.closeButtonId =
    options.closeButtonId || "scratchpadCloseButton";

  /*
  找到各個 HTML 元素。
  */

  this.panel =
    document.getElementById(this.panelId);

  this.header =
    document.getElementById(this.headerId);

  this.openButton =
    document.getElementById(this.openButtonId);

  this.closeButton =
    document.getElementById(this.closeButtonId);

  /*
  記錄目前是否開啟。
  */

  this.isOpen = false;

  /*
  拖曳相關狀態。
  */

  this.isDraggingPanel = false;

  this.dragStartX = 0;
  this.dragStartY = 0;

  this.panelStartLeft = 0;
  this.panelStartTop = 0;

  /*
  如果找不到 panel，
  就無法建立視窗功能。
  */

  if (!this.panel) {
    console.warn(
      `找不到 id="${this.panelId}" 的計算紙面板。`
    );

    return;
  }

  /*
  綁定開啟按鈕。
  */

  if (this.openButton) {
    this.openButton.addEventListener(
      "click",
      () => this.open()
    );
  }

  /*
  綁定關閉按鈕。
  */

  if (this.closeButton) {
    this.closeButton.addEventListener(
      "click",
      () => this.close()
    );
  }

  /*
  如果有標題列，
  就建立拖曳功能。
  */

  if (this.header) {
    this.bindPanelDragEvents();
  }

  /*
  視窗大小改變時，
  重新判斷手機版或桌面版。
  */

  window.addEventListener(
    "resize",
    () => this.handleWindowResize()
  );

  /*
  一開始先設定適合目前裝置的版面。
  */

  this.updateResponsiveMode();
};


/*
判斷目前是否為手機或小型平板。

這裡用 768px 作為分界。

寬度小於或等於 768px：
使用全螢幕模式。

寬度大於 768px：
使用桌面浮動視窗。
*/

Scratchpad.prototype.isMobileView = function () {
  return window.innerWidth <= 768;
};


/*
開啟計算紙。
*/

Scratchpad.prototype.open = function () {
  if (!this.panel) {
    return;
  }

  this.isOpen = true;

  /*
  移除 hidden 屬性。
  */

  this.panel.hidden = false;

  /*
  加入開啟中的 class。

  CSS 之後會根據這個 class
  顯示計算紙視窗。
  */

  this.panel.classList.add(
    "scratchpad-panel--open"
  );

  /*
  根據裝置更新顯示模式。
  */

  this.updateResponsiveMode();

  /*
  Canvas 原本如果在隱藏狀態，
  getBoundingClientRect() 可能會取得 0。

  因此開啟後重新調整 Canvas 尺寸。
  */

  requestAnimationFrame(() => {
    this.resizeCanvasPreserveContent();
  });

  /*
  通知外部計算紙已經開啟。
  */

  this.dispatchWindowEvent("scratchpadopen");
};


/*
關閉計算紙。
*/

Scratchpad.prototype.close = function () {
  if (!this.panel) {
    return;
  }

  this.isOpen = false;

  this.panel.classList.remove(
    "scratchpad-panel--open"
  );

  /*
  hidden 會讓元素完全不佔版面。

  延遲一點點再 hidden，
  之後 CSS 才能加入淡出動畫。
  */

  window.setTimeout(() => {
    if (!this.isOpen) {
      this.panel.hidden = true;
    }
  }, 200);

  /*
  通知外部計算紙已經關閉。
  */

  this.dispatchWindowEvent("scratchpadclose");
};


/*
切換計算紙開啟與關閉。

使用方式：

scratchpad.toggle();
*/

Scratchpad.prototype.toggle = function () {
  if (this.isOpen) {
    this.close();
  } else {
    this.open();
  }
};


/*
通知外部視窗狀態改變。

例如：

scratchpadopen
scratchpadclose
*/

Scratchpad.prototype.dispatchWindowEvent = function (
  eventName
) {
  if (!this.panel) {
    return;
  }

  const customEvent = new CustomEvent(
    eventName,
    {
      detail: {
        isOpen: this.isOpen,
        isMobile: this.isMobileView()
      }
    }
  );

  this.panel.dispatchEvent(customEvent);
};


/*
根據目前裝置，
設定手機版或桌面版。
*/

Scratchpad.prototype.updateResponsiveMode =
function () {
  if (!this.panel) {
    return;
  }

  if (this.isMobileView()) {
    /*
    手機版加入 fullscreen class。
    */

    this.panel.classList.add(
      "scratchpad-panel--fullscreen"
    );

    /*
    手機版不使用拖曳定位。
    */

    this.panel.style.left = "";
    this.panel.style.top = "";
    this.panel.style.right = "";
    this.panel.style.bottom = "";
  } else {
    /*
    桌面版移除 fullscreen class。
    */

    this.panel.classList.remove(
      "scratchpad-panel--fullscreen"
    );

    /*
    如果目前沒有定位，
    就放在畫面右下方。
    */

    if (
      !this.panel.style.left &&
      !this.panel.style.top
    ) {
      this.setDefaultDesktopPosition();
    }
  }
};


/*
設定桌面版預設位置。

計算紙會放在畫面右下方，
並保留 24px 邊距。
*/

Scratchpad.prototype.setDefaultDesktopPosition =
function () {
  if (!this.panel || this.isMobileView()) {
    return;
  }

  const margin = 24;

  const panelWidth =
    this.panel.offsetWidth || 420;

  const panelHeight =
    this.panel.offsetHeight || 560;

  const left =
    window.innerWidth -
    panelWidth -
    margin;

  const top =
    window.innerHeight -
    panelHeight -
    margin;

  this.panel.style.left =
    `${Math.max(left, margin)}px`;

  this.panel.style.top =
    `${Math.max(top, margin)}px`;

  this.panel.style.right = "auto";
  this.panel.style.bottom = "auto";
};


/*
綁定桌面拖曳事件。
*/

Scratchpad.prototype.bindPanelDragEvents =
function () {
  if (!this.header || !this.panel) {
    return;
  }

  /*
  標題列按下時開始拖曳。
  */

  this.header.addEventListener(
    "pointerdown",
    (event) => this.startPanelDrag(event)
  );

  /*
  pointermove 和 pointerup
  綁在 window 上。

  即使滑鼠暫時離開標題列，
  還是能繼續拖曳。
  */

  window.addEventListener(
    "pointermove",
    (event) => this.movePanel(event)
  );

  window.addEventListener(
    "pointerup",
    () => this.stopPanelDrag()
  );

  window.addEventListener(
    "pointercancel",
    () => this.stopPanelDrag()
  );
};


/*
開始拖曳面板。
*/

Scratchpad.prototype.startPanelDrag =
function (event) {
  /*
  手機版是全螢幕，
  不允許拖曳。
  */

  if (this.isMobileView()) {
    return;
  }

  /*
  如果點到按鈕，
  不啟動拖曳。

  closest("button") 會檢查
  點擊位置是不是按鈕或按鈕內部元素。
  */

  if (event.target.closest("button")) {
    return;
  }

  /*
  滑鼠只允許左鍵拖曳。
  */

  if (
    event.pointerType === "mouse" &&
    event.button !== 0
  ) {
    return;
  }

  event.preventDefault();

  this.isDraggingPanel = true;

  /*
  記錄開始拖曳時，
  指標的位置。
  */

  this.dragStartX = event.clientX;
  this.dragStartY = event.clientY;

  /*
  取得面板目前的位置。
  */

  const panelRect =
    this.panel.getBoundingClientRect();

  this.panelStartLeft = panelRect.left;
  this.panelStartTop = panelRect.top;

  /*
  加入拖曳中的 class。

  CSS 可以改變游標或陰影。
  */

  this.panel.classList.add(
    "scratchpad-panel--dragging"
  );

  /*
  捕捉目前 Pointer。
  */

  try {
    this.header.setPointerCapture(
      event.pointerId
    );
  } catch (error) {
    console.warn(
      "標題列無法設定 Pointer Capture：",
      error
    );
  }
};


/*
拖曳面板。
*/

Scratchpad.prototype.movePanel =
function (event) {
  if (!this.isDraggingPanel) {
    return;
  }

  /*
  計算指標移動距離。
  */

  const moveX =
    event.clientX - this.dragStartX;

  const moveY =
    event.clientY - this.dragStartY;

  /*
  計算新的面板位置。
  */

  let newLeft =
    this.panelStartLeft + moveX;

  let newTop =
    this.panelStartTop + moveY;

  /*
  防止面板移出畫面。
  */

  const maxLeft =
    window.innerWidth -
    this.panel.offsetWidth;

  const maxTop =
    window.innerHeight -
    this.panel.offsetHeight;

  newLeft = Math.min(
    Math.max(newLeft, 0),
    Math.max(maxLeft, 0)
  );

  newTop = Math.min(
    Math.max(newTop, 0),
    Math.max(maxTop, 0)
  );

  /*
  更新面板位置。
  */

  this.panel.style.left = `${newLeft}px`;
  this.panel.style.top = `${newTop}px`;

  this.panel.style.right = "auto";
  this.panel.style.bottom = "auto";
};


/*
停止拖曳。
*/

Scratchpad.prototype.stopPanelDrag =
function () {
  if (!this.isDraggingPanel) {
    return;
  }

  this.isDraggingPanel = false;

  this.panel.classList.remove(
    "scratchpad-panel--dragging"
  );
};


/*
視窗大小改變時執行。
*/

Scratchpad.prototype.handleWindowResize =
function () {
  /*
  更新手機版或桌面版狀態。
  */

  this.updateResponsiveMode();

  /*
  桌面版要確認視窗沒有跑到畫面外。
  */

  if (!this.isMobileView()) {
    this.keepPanelInsideViewport();
  }

  /*
  計算紙開啟時，
  重新調整 Canvas 尺寸。
  */

  if (this.isOpen) {
    this.resizeCanvasPreserveContent();
  }
};


/*
防止桌面版面板超出畫面。
*/

Scratchpad.prototype.keepPanelInsideViewport =
function () {
  if (!this.panel || this.isMobileView()) {
    return;
  }

  const rect =
    this.panel.getBoundingClientRect();

  const maxLeft =
    window.innerWidth -
    this.panel.offsetWidth;

  const maxTop =
    window.innerHeight -
    this.panel.offsetHeight;

  const safeLeft = Math.min(
    Math.max(rect.left, 0),
    Math.max(maxLeft, 0)
  );

  const safeTop = Math.min(
    Math.max(rect.top, 0),
    Math.max(maxTop, 0)
  );

  this.panel.style.left = `${safeLeft}px`;
  this.panel.style.top = `${safeTop}px`;

  this.panel.style.right = "auto";
  this.panel.style.bottom = "auto";
};


/*
調整 Canvas 尺寸，
同時保留原本畫面內容。
*/

Scratchpad.prototype.resizeCanvasPreserveContent =
function () {
  if (!this.canvas || !this.ctx) {
    return;
  }

  /*
  如果 Canvas 沒有顯示，
  寬高可能是 0，
  這時不調整。
  */

  const rect =
    this.canvas.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return;
  }

  /*
  先把目前畫面存成圖片。
  */

  const oldImageData =
    this.canvas.toDataURL("image/png");

  const pixelRatio =
    window.devicePixelRatio || 1;

  /*
  更新 Canvas 內部尺寸。
  */

  this.canvas.width =
    Math.round(rect.width * pixelRatio);

  this.canvas.height =
    Math.round(rect.height * pixelRatio);

  /*
  重新設定座標比例。
  */

  this.ctx.setTransform(
    pixelRatio,
    0,
    0,
    pixelRatio,
    0,
    0
  );

  this.ctx.lineCap = "round";
  this.ctx.lineJoin = "round";

  /*
  將原本內容畫回去。
  */

  const image = new Image();

  image.onload = () => {
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

    /*
    尺寸調整後，
    將目前畫面設定為新的歷史起點。

    避免 Undo 還原到舊尺寸圖片時變形。
    */

    if (
      Array.isArray(this.undoStack) &&
      Array.isArray(this.redoStack)
    ) {
      this.resetHistory();
    }
  };

  image.src = oldImageData;
};


/*
取得目前視窗狀態。
*/

Scratchpad.prototype.getWindowState =
function () {
  return {
    isOpen: this.isOpen,
    isMobile: this.isMobileView(),
    isDragging: this.isDraggingPanel
  };
};


/*
==================================================
更新 createScratchpad()
==================================================

Part 3 已經初始化：

1. 畫筆工具
2. 歷史紀錄

Part 4 再加入：

3. 視窗開關
4. 拖曳功能
5. 手機全螢幕
==================================================
*/

window.createScratchpad = function (options = {}) {
  const scratchpad = new Scratchpad(options);

  if (scratchpad.canvas) {
    scratchpad.initializeTools();
    scratchpad.initializeHistory();
    scratchpad.initializeWindow(options);
  }

  return scratchpad;
};
/*
==================================================
Part 5：快捷鍵、圖片匯出與安全銷毀
==================================================

新增功能：
1. Ctrl + Z 復原
2. Ctrl + Y 重做
3. Ctrl + Shift + Z 重做
4. Delete 清除計算紙
5. Escape 關閉計算紙
6. 將計算紙下載成 PNG 圖片
7. 取得圖片資料
8. 安全移除事件監聽
9. 銷毀 Scratchpad 物件
==================================================
*/


/*
初始化鍵盤快捷鍵。

使用方式：

建立 Scratchpad 時會自動執行。
*/

Scratchpad.prototype.initializeKeyboardShortcuts =
function () {
  /*
  使用 bind() 固定 this。

  如果直接寫：

  window.addEventListener(
    "keydown",
    this.handleKeyboardShortcut
  );

  那麼事件執行時，
  this 可能不再是 Scratchpad。

  bind(this) 可以確保 this
  永遠指向目前這個計算紙物件。
  */

  this.boundKeyboardHandler =
    this.handleKeyboardShortcut.bind(this);

  window.addEventListener(
    "keydown",
    this.boundKeyboardHandler
  );
};


/*
處理鍵盤快捷鍵。
*/

Scratchpad.prototype.handleKeyboardShortcut =
function (event) {
  /*
  如果計算紙沒有開啟，
  就不處理快捷鍵。

  避免學生在回答題目時，
  不小心觸發計算紙功能。
  */

  if (!this.isOpen) {
    return;
  }

  /*
  如果目前游標正在輸入框裡，
  不攔截鍵盤事件。

  例如學生正在答案欄輸入數字時，
  Delete 和 Ctrl + Z 應由輸入框自行處理。
  */

  const activeElement = document.activeElement;

  const isTyping =
    activeElement &&
    (
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.isContentEditable
    );

  if (isTyping) {
    return;
  }

  /*
  event.ctrlKey：
  Windows 的 Ctrl 鍵。

  event.metaKey：
  Mac 的 Command 鍵。

  因此 Windows 和 Mac 都能使用。
  */

  const controlPressed =
    event.ctrlKey || event.metaKey;

  const key = event.key.toLowerCase();


  /*
  Ctrl + Z：
  復原。
  */

  if (
    controlPressed &&
    key === "z" &&
    !event.shiftKey
  ) {
    event.preventDefault();

    this.undo();

    return;
  }


  /*
  Ctrl + Y：
  重做。
  */

  if (
    controlPressed &&
    key === "y"
  ) {
    event.preventDefault();

    this.redo();

    return;
  }


  /*
  Ctrl + Shift + Z：
  重做。

  這是 Mac 與部分軟體常見的快捷鍵。
  */

  if (
    controlPressed &&
    event.shiftKey &&
    key === "z"
  ) {
    event.preventDefault();

    this.redo();

    return;
  }


  /*
  Escape：
  關閉計算紙。
  */

  if (event.key === "Escape") {
    event.preventDefault();

    this.close();

    return;
  }


  /*
  Delete：
  清除整張計算紙。

  清除後仍可以按 Undo 復原。
  */

  if (event.key === "Delete") {
    event.preventDefault();

    this.clear(true);
  }
};


/*
取得 Canvas 的圖片資料。

format 可使用：

"image/png"
"image/jpeg"
"image/webp"

quality 主要用於 JPEG 和 WebP，
範圍是 0 到 1。
*/

Scratchpad.prototype.getImageDataURL =
function (
  format = "image/png",
  quality = 1
) {
  if (!this.canvas) {
    return null;
  }

  /*
  確認圖片格式是否合法。
  */

  const allowedFormats = [
    "image/png",
    "image/jpeg",
    "image/webp"
  ];

  if (!allowedFormats.includes(format)) {
    console.warn(
      `不支援的圖片格式：${format}，改用 image/png。`
    );

    format = "image/png";
  }

  /*
  quality 限制在 0 到 1。
  */

  const safeQuality = Math.min(
    Math.max(Number(quality) || 1, 0),
    1
  );

  return this.canvas.toDataURL(
    format,
    safeQuality
  );
};


/*
將 Canvas 轉成 Blob。

Blob 是瀏覽器用來處理檔案資料的格式。

之後可用於：

1. 下載檔案
2. 上傳 Firebase Storage
3. 傳送到伺服器
*/

Scratchpad.prototype.getImageBlob =
function (
  format = "image/png",
  quality = 1
) {
  return new Promise((resolve, reject) => {
    if (!this.canvas) {
      reject(
        new Error("找不到計算紙 Canvas。")
      );

      return;
    }

    this.canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error("計算紙圖片轉換失敗。")
          );

          return;
        }

        resolve(blob);
      },
      format,
      quality
    );
  });
};


/*
下載計算紙圖片。

使用方式：

scratchpad.downloadImage();

或：

scratchpad.downloadImage(
  "我的計算過程.png"
);
*/

Scratchpad.prototype.downloadImage =
function (
  filename = "math-scratchpad.png"
) {
  if (!this.canvas) {
    return false;
  }

  /*
  確保副檔名是 .png。
  */

  if (!filename.toLowerCase().endsWith(".png")) {
    filename += ".png";
  }

  /*
  將 Canvas 轉成圖片網址。
  */

  const imageData =
    this.getImageDataURL("image/png");

  if (!imageData) {
    return false;
  }

  /*
  建立一個暫時的 <a> 下載連結。
  */

  const downloadLink =
    document.createElement("a");

  downloadLink.href = imageData;
  downloadLink.download = filename;

  /*
  有些瀏覽器需要先將連結加入頁面，
  才能正常執行 click()。
  */

  document.body.appendChild(downloadLink);

  downloadLink.click();

  /*
  下載開始後移除暫時連結。
  */

  document.body.removeChild(downloadLink);

  return true;
};


/*
判斷計算紙是否為空白。

原理：

建立一張相同大小的空白 Canvas，
再比較兩者的圖片資料。
*/

Scratchpad.prototype.isBlank =
function () {
  if (!this.canvas) {
    return true;
  }

  const blankCanvas =
    document.createElement("canvas");

  blankCanvas.width = this.canvas.width;
  blankCanvas.height = this.canvas.height;

  return (
    this.canvas.toDataURL() ===
    blankCanvas.toDataURL()
  );
};


/*
取得計算紙完整狀態。

之後除錯或儲存資料時可以使用。
*/

Scratchpad.prototype.getFullState =
function () {
  return {
    tool: this.tool || "pen",
    color: this.currentColor,
    size: this.currentSize,
    isOpen: Boolean(this.isOpen),
    isMobile: this.isMobileView(),
    isBlank: this.isBlank(),
    history: this.getHistoryState(),
    canvasWidth: this.canvas
      ? this.canvas.width
      : 0,
    canvasHeight: this.canvas
      ? this.canvas.height
      : 0
  };
};


/*
匯出計算紙資料。

這個方法不會直接下載，
而是回傳一個物件。

未來可以儲存到 Firebase。
*/

Scratchpad.prototype.exportData =
function () {
  return {
    version: "1.0",
    createdAt: new Date().toISOString(),
    image: this.getImageDataURL("image/png"),
    state: this.getFullState()
  };
};


/*
移除鍵盤快捷鍵事件。
*/

Scratchpad.prototype.removeKeyboardShortcuts =
function () {
  if (!this.boundKeyboardHandler) {
    return;
  }

  window.removeEventListener(
    "keydown",
    this.boundKeyboardHandler
  );

  this.boundKeyboardHandler = null;
};


/*
安全銷毀 Scratchpad。

當未來使用單頁式網站，
或需要重新建立計算紙時，
可以先執行：

scratchpad.destroy();
*/

Scratchpad.prototype.destroy =
function () {
  /*
  停止畫圖與拖曳。
  */

  this.isDrawing = false;
  this.isDraggingPanel = false;

  /*
  移除鍵盤監聽。
  */

  this.removeKeyboardShortcuts();

  /*
  清除歷史紀錄。
  */

  this.undoStack = [];
  this.redoStack = [];

  /*
  關閉計算紙。
  */

  if (this.panel) {
    this.panel.hidden = true;

    this.panel.classList.remove(
      "scratchpad-panel--open",
      "scratchpad-panel--fullscreen",
      "scratchpad-panel--dragging"
    );
  }

  /*
  清除 Canvas。
  */

  if (this.canvas && this.ctx) {
    this.clear(false);
  }

  /*
  將主要物件參考設為 null。

  這可以幫助瀏覽器釋放記憶體。
  */

  this.ctx = null;
  this.canvas = null;
  this.panel = null;
  this.header = null;
  this.openButton = null;
  this.closeButton = null;

  /*
  標記為已銷毀。
  */

  this.isDestroyed = true;

  console.log(
    "Scratchpad 已安全銷毀。"
  );
};


/*
判斷 Scratchpad 是否已經被銷毀。
*/

Scratchpad.prototype.isReady =
function () {
  return Boolean(
    !this.isDestroyed &&
    this.canvas &&
    this.ctx
  );
};


/*
==================================================
更新 createScratchpad()
==================================================

Part 5 完成後，建立計算紙時會初始化：

1. Canvas 畫線
2. 畫筆與橡皮擦
3. Undo / Redo
4. 視窗開關與拖曳
5. 鍵盤快捷鍵
==================================================
*/

window.createScratchpad = function (options = {}) {
  const scratchpad = new Scratchpad(options);

  if (scratchpad.canvas) {
    scratchpad.initializeTools();
    scratchpad.initializeHistory();
    scratchpad.initializeWindow(options);
    scratchpad.initializeKeyboardShortcuts();
  }

  return scratchpad;
};
/*
==================================================
Part 6：工具列按鈕自動綁定
==================================================

新增功能：
1. 畫筆按鈕
2. 橡皮擦按鈕
3. 顏色按鈕
4. 粗細按鈕
5. 復原按鈕
6. 重做按鈕
7. 清除按鈕
8. 下載按鈕
9. 自動更新按鈕狀態
10. 無障礙狀態 aria-pressed
==================================================
*/


/*
初始化工具列。

預設使用的按鈕 id：

scratchpadPenButton
scratchpadEraserButton
scratchpadUndoButton
scratchpadRedoButton
scratchpadClearButton
scratchpadDownloadButton

顏色按鈕使用：

data-scratchpad-color="#000000"

粗細按鈕使用：

data-scratchpad-size="4"
*/

Scratchpad.prototype.initializeToolbar =
function (options = {}) {
  /*
  避免同一個 Scratchpad
  重複初始化工具列。
  */

  if (this.toolbarInitialized) {
    return;
  }

  this.toolbarInitialized = true;

  /*
  工具列設定。

  未來不同遊戲如果使用不同 id，
  可以在 createScratchpad() 裡傳入設定。
  */

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

  /*
  尋找一般功能按鈕。
  */

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

  /*
  尋找所有顏色按鈕。

  HTML 之後會寫成：

  <button
    data-scratchpad-color="#000000"
  >
    黑色
  </button>
  */

  this.colorButtons = Array.from(
    document.querySelectorAll(
      "[data-scratchpad-color]"
    )
  );

  /*
  尋找所有粗細按鈕。

  HTML 之後會寫成：

  <button
    data-scratchpad-size="4"
  >
    中
  </button>
  */

  this.sizeButtons = Array.from(
    document.querySelectorAll(
      "[data-scratchpad-size]"
    )
  );

  /*
  建立工具列事件清單。

  destroy() 時可以逐一移除事件。
  */

  this.toolbarEventCleanups = [];

  /*
  綁定畫筆按鈕。
  */

  this.addToolbarEvent(
    this.penButton,
    "click",
    () => {
      this.usePen();
    }
  );

  /*
  綁定橡皮擦按鈕。
  */

  this.addToolbarEvent(
    this.eraserButton,
    "click",
    () => {
      this.useEraser();
    }
  );

  /*
  綁定復原按鈕。
  */

  this.addToolbarEvent(
    this.undoButton,
    "click",
    async () => {
      /*
      如果不能復原，
      就不執行。
      */

      if (!this.canUndo()) {
        return;
      }

      /*
      暫時停用按鈕，
      避免連續快速點擊。
      */

      this.undoButton.disabled = true;

      try {
        await this.undo();
      } catch (error) {
        console.error(
          "復原計算紙失敗：",
          error
        );
      }

      this.updateToolbarState();
    }
  );

  /*
  綁定重做按鈕。
  */

  this.addToolbarEvent(
    this.redoButton,
    "click",
    async () => {
      if (!this.canRedo()) {
        return;
      }

      this.redoButton.disabled = true;

      try {
        await this.redo();
      } catch (error) {
        console.error(
          "重做計算紙失敗：",
          error
        );
      }

      this.updateToolbarState();
    }
  );

  /*
  綁定清除按鈕。

  清除動作會保存到歷史紀錄，
  所以按 Undo 可以恢復。
  */

  this.addToolbarEvent(
    this.clearButton,
    "click",
    () => {
      /*
      空白時不需要再清除。
      */

      if (this.isBlank()) {
        return;
      }

      this.clear(true);

      this.updateToolbarState();
    }
  );

  /*
  綁定下載圖片按鈕。
  */

  this.addToolbarEvent(
    this.downloadButton,
    "click",
    () => {
      /*
      計算紙是空白時，
      不下載圖片。
      */

      if (this.isBlank()) {
        console.warn(
          "計算紙目前是空白的，沒有可以下載的內容。"
        );

        return;
      }

      /*
      依照目前日期與時間建立檔名。

      例如：

      math-scratchpad-2026-07-31-1015.png
      */

      const filename =
        this.createDownloadFilename();

      this.downloadImage(filename);
    }
  );

  /*
  綁定顏色按鈕。
  */

  this.colorButtons.forEach(
    (button) => {
      this.addToolbarEvent(
        button,
        "click",
        () => {
          const color =
            button.dataset.scratchpadColor;

          if (!color) {
            return;
          }

          this.setColor(color);
        }
      );
    }
  );

  /*
  綁定畫筆粗細按鈕。
  */

  this.sizeButtons.forEach(
    (button) => {
      this.addToolbarEvent(
        button,
        "click",
        () => {
          const size =
            button.dataset.scratchpadSize;

          if (!size) {
            return;
          }

          this.setSize(size);
        }
      );
    }
  );

  /*
  監聽歷史紀錄變化。

  Undo 或 Redo 狀態改變時，
  自動更新按鈕。
  */

  this.boundHistoryChangeHandler =
    () => {
      this.updateToolbarState();
    };

  this.canvas.addEventListener(
    "scratchpadhistorychange",
    this.boundHistoryChangeHandler
  );

  this.toolbarEventCleanups.push(
    () => {
      if (
        this.canvas &&
        this.boundHistoryChangeHandler
      ) {
        this.canvas.removeEventListener(
          "scratchpadhistorychange",
          this.boundHistoryChangeHandler
        );
      }
    }
  );

  /*
  初始化完成後，
  先更新一次所有按鈕。
  */

  this.updateToolbarState();
};


/*
==================================================
統一加入工具列事件
==================================================

這個方法會：

1. 加入事件
2. 保存移除事件的方法
3. destroy() 時方便清理
*/

Scratchpad.prototype.addToolbarEvent =
function (
  element,
  eventName,
  handler
) {
  if (!element) {
    return;
  }

  element.addEventListener(
    eventName,
    handler
  );

  /*
  將清除函式保存起來。
  */

  this.toolbarEventCleanups.push(
    () => {
      element.removeEventListener(
        eventName,
        handler
      );
    }
  );
};


/*
==================================================
更新工具列狀態
==================================================

這個方法會根據：

1. 目前使用工具
2. 目前畫筆顏色
3. 目前畫筆粗細
4. 是否可以復原
5. 是否可以重做
6. 畫布是否空白

自動更新所有按鈕。
*/

Scratchpad.prototype.updateToolbarState =
function () {
  /*
  如果物件已經被銷毀，
  就不更新。
  */

  if (this.isDestroyed) {
    return;
  }

  const currentTool =
    this.tool || "pen";

  /*
  更新畫筆按鈕。
  */

  this.setButtonActiveState(
    this.penButton,
    currentTool === "pen"
  );

  /*
  更新橡皮擦按鈕。
  */

  this.setButtonActiveState(
    this.eraserButton,
    currentTool === "eraser"
  );

  /*
  更新顏色按鈕。
  */

  this.colorButtons.forEach(
    (button) => {
      const buttonColor =
        button.dataset.scratchpadColor;

      const isActive =
        currentTool === "pen" &&
        buttonColor === this.currentColor;

      this.setButtonActiveState(
        button,
        isActive
      );
    }
  );

  /*
  更新粗細按鈕。

  dataset 取得的是文字，
  因此使用 Number() 轉成數字比較。
  */

  this.sizeButtons.forEach(
    (button) => {
      const buttonSize = Number(
        button.dataset.scratchpadSize
      );

      const isActive =
        buttonSize ===
        Number(this.currentSize);

      this.setButtonActiveState(
        button,
        isActive
      );
    }
  );

  /*
  更新 Undo 按鈕。
  */

  if (this.undoButton) {
    this.undoButton.disabled =
      !this.canUndo();

    this.undoButton.setAttribute(
      "aria-disabled",
      String(!this.canUndo())
    );
  }

  /*
  更新 Redo 按鈕。
  */

  if (this.redoButton) {
    this.redoButton.disabled =
      !this.canRedo();

    this.redoButton.setAttribute(
      "aria-disabled",
      String(!this.canRedo())
    );
  }

  /*
  更新清除與下載按鈕。

  空白計算紙時停用。
  */

  const canvasIsBlank =
    this.isBlank();

  if (this.clearButton) {
    this.clearButton.disabled =
      canvasIsBlank;

    this.clearButton.setAttribute(
      "aria-disabled",
      String(canvasIsBlank)
    );
  }

  if (this.downloadButton) {
    this.downloadButton.disabled =
      canvasIsBlank;

    this.downloadButton.setAttribute(
      "aria-disabled",
      String(canvasIsBlank)
    );
  }
};


/*
設定按鈕是否為選取狀態。

選取時會加入：

scratchpad-tool-button--active

CSS 之後會用這個 class
顯示不同背景與邊框。
*/

Scratchpad.prototype.setButtonActiveState =
function (
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

  /*
  aria-pressed 可以讓螢幕閱讀器知道
  目前按鈕是否被選取。
  */

  button.setAttribute(
    "aria-pressed",
    String(isActive)
  );
};


/*
建立下載圖片檔名。
*/

Scratchpad.prototype.createDownloadFilename =
function () {
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
};


/*
==================================================
通知工具改變
==================================================

每次：

1. 切換畫筆
2. 切換橡皮擦
3. 改變顏色
4. 改變粗細

都會通知外部並更新工具列。
*/

Scratchpad.prototype.notifyToolChange =
function () {
  this.updateToolbarState();

  if (!this.canvas) {
    return;
  }

  const toolEvent = new CustomEvent(
    "scratchpadtoolchange",
    {
      detail: {
        tool: this.tool || "pen",
        color: this.currentColor,
        size: this.currentSize
      }
    }
  );

  this.canvas.dispatchEvent(toolEvent);
};


/*
==================================================
包裝原本的 setColor()
==================================================

保留 Part 2 原本的功能，
再增加工具列更新。
*/

const originalScratchpadSetColor =
  Scratchpad.prototype.setColor;

Scratchpad.prototype.setColor =
function (color) {
  originalScratchpadSetColor.call(
    this,
    color
  );

  this.notifyToolChange();
};


/*
==================================================
包裝原本的 setSize()
==================================================
*/

const originalScratchpadSetSize =
  Scratchpad.prototype.setSize;

Scratchpad.prototype.setSize =
function (size) {
  originalScratchpadSetSize.call(
    this,
    size
  );

  this.notifyToolChange();
};


/*
==================================================
包裝原本的 usePen()
==================================================
*/

const originalScratchpadUsePen =
  Scratchpad.prototype.usePen;

Scratchpad.prototype.usePen =
function () {
  originalScratchpadUsePen.call(this);

  this.notifyToolChange();
};


/*
==================================================
包裝原本的 useEraser()
==================================================
*/

const originalScratchpadUseEraser =
  Scratchpad.prototype.useEraser;

Scratchpad.prototype.useEraser =
function () {
  originalScratchpadUseEraser.call(this);

  this.notifyToolChange();
};


/*
==================================================
包裝原本的 saveHistory()
==================================================

每次畫完一筆後，
除了保存歷史紀錄，
也更新清除與下載按鈕。
*/

const originalScratchpadSaveHistory =
  Scratchpad.prototype.saveHistory;

Scratchpad.prototype.saveHistory =
function () {
  originalScratchpadSaveHistory.call(
    this
  );

  /*
  initializeHistory() 執行時，
  工具列可能還沒初始化。

  updateToolbarState() 本身有安全檢查，
  所以可以直接呼叫。
  */

  this.updateToolbarState();
};


/*
==================================================
包裝原本的 newQuestion()
==================================================

開始新題目後，
工具列會回到：

1. 畫筆模式
2. 預設畫筆顏色
3. Undo / Redo 停用
4. 清除與下載停用
*/

const originalScratchpadNewQuestion =
  Scratchpad.prototype.newQuestion;

Scratchpad.prototype.newQuestion =
function () {
  originalScratchpadNewQuestion.call(
    this
  );

  this.usePen();

  this.updateToolbarState();
};


/*
==================================================
移除工具列事件
==================================================
*/

Scratchpad.prototype.removeToolbarEvents =
function () {
  if (
    !Array.isArray(
      this.toolbarEventCleanups
    )
  ) {
    return;
  }

  /*
  逐一執行事件清除函式。
  */

  this.toolbarEventCleanups.forEach(
    (cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn(
          "移除工具列事件失敗：",
          error
        );
      }
    }
  );

  this.toolbarEventCleanups = [];

  this.boundHistoryChangeHandler = null;

  this.toolbarInitialized = false;
};


/*
==================================================
包裝原本的 destroy()
==================================================

Part 5 的 destroy() 已經處理：

1. 鍵盤事件
2. 歷史紀錄
3. Canvas
4. 視窗元素

Part 6 再加入工具列事件清除。
*/

const originalScratchpadDestroy =
  Scratchpad.prototype.destroy;

Scratchpad.prototype.destroy =
function () {
  /*
  必須先移除工具列事件，
  因為原本 destroy() 執行後
  canvas 會被設為 null。
  */

  this.removeToolbarEvents();

  originalScratchpadDestroy.call(this);

  /*
  清除工具列按鈕參考。
  */

  this.penButton = null;
  this.eraserButton = null;
  this.undoButton = null;
  this.redoButton = null;
  this.clearButton = null;
  this.downloadButton = null;

  this.colorButtons = [];
  this.sizeButtons = [];
};


/*
==================================================
最終版 createScratchpad()
==================================================

建立計算紙時會依序初始化：

1. Canvas 畫線
2. 畫筆與橡皮擦
3. Undo / Redo
4. 視窗開關與拖曳
5. 鍵盤快捷鍵
6. 工具列按鈕
==================================================
*/

window.createScratchpad =
function (options = {}) {
  const scratchpad =
    new Scratchpad(options);

  if (scratchpad.canvas) {
    scratchpad.initializeTools();

    scratchpad.initializeHistory();

    scratchpad.initializeWindow(
      options
    );

    scratchpad
      .initializeKeyboardShortcuts();

    scratchpad.initializeToolbar(
      options
    );
  }

  return scratchpad;
};
