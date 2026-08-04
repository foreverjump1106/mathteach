/*
==================================================
數學遊戲樂園：共用答案輸入元件
檔案位置：js/answer-input.js
==================================================

支援格式：
1. 整數答案：單一輸入格
2. 分數答案：
   - 正負號選單
   - 整數部分（可留空）
   - 分子
   - 分母
3. 接受最簡假分數
4. 接受等值的最簡帶分數
5. 可檢查：
   - 分母不可為 0
   - 分數需為最簡
   - 帶分數分子需小於分母

使用方式：

const answerInput = MathAnswerInput.create({
  mountId: "answerInputMount"
});

answerInput.showInteger();

或：

answerInput.showFraction();

取得答案：

const result = answerInput.getValue();

result 範例：
{
  valid: true,
  numerator: -68,
  denominator: 9,
  isInteger: false,
  isMixedNumber: true,
  simplest: true
}
==================================================
*/

(function () {
  "use strict";

  const STYLE_ID =
    "mathAnswerInputStyle";

  let instanceCount = 0;

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);

    while (y !== 0) {
      const remainder = x % y;
      x = y;
      y = remainder;
    }

    return x || 1;
  }

  function simplifyFraction(
    numerator,
    denominator
  ) {
    if (denominator === 0) {
      return {
        numerator,
        denominator
      };
    }

    let n = numerator;
    let d = denominator;

    if (d < 0) {
      n = -n;
      d = -d;
    }

    const divisor = gcd(n, d);

    return {
      numerator: n / divisor,
      denominator: d / divisor
    };
  }

  function createStyle() {
    if (
      document.getElementById(
        STYLE_ID
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id = STYLE_ID;

    style.textContent = `
      .math-answer-input {
        display: flex;
        justify-content: center;
        width: 100%;
      }

      .math-answer-input-box {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        min-height: 94px;
        padding: 14px 18px;
        border: 2px solid #bfdbfe;
        border-radius: 16px;
        background: #ffffff;
        box-shadow:
          0 6px 16px
          rgba(30, 64, 175, 0.10);
      }

      .math-answer-integer-input {
        width: 150px;
        min-height: 58px;
        padding: 8px 12px;
        border: 2px solid #93c5fd;
        border-radius: 12px;
        background: #ffffff;
        color: #1e293b;
        font-size: 26px;
        font-weight: 800;
        text-align: center;
        outline: none;
      }

      .math-answer-integer-input:focus,
      .math-answer-whole-input:focus,
      .math-answer-fraction-input:focus,
      .math-answer-sign-select:focus {
        border-color: #2563eb;
        box-shadow:
          0 0 0 4px
          rgba(37, 99, 235, 0.14);
      }

      .math-answer-fraction-group {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .math-answer-sign-select {
        width: 66px;
        min-height: 52px;
        padding: 6px;
        border: 2px solid #93c5fd;
        border-radius: 11px;
        background: #ffffff;
        color: #1e293b;
        font-size: 23px;
        font-weight: 800;
        text-align: center;
        outline: none;
        cursor: pointer;
      }

      .math-answer-whole-input {
        width: 82px;
        min-height: 54px;
        padding: 7px 8px;
        border: 2px solid #93c5fd;
        border-radius: 11px;
        background: #ffffff;
        color: #1e293b;
        font-size: 24px;
        font-weight: 800;
        text-align: center;
        outline: none;
      }

      .math-answer-fraction-stack {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 104px;
      }

      .math-answer-fraction-input {
        width: 100%;
        min-height: 45px;
        padding: 5px 8px;
        border: 2px solid #93c5fd;
        border-radius: 9px;
        background: #ffffff;
        color: #1e293b;
        font-size: 22px;
        font-weight: 800;
        text-align: center;
        outline: none;
      }

      .math-answer-fraction-line {
        display: block;
        width: 100%;
        height: 3px;
        margin: 5px 0;
        border-radius: 999px;
        background: #334155;
      }

      .math-answer-message {
        min-height: 24px;
        margin-top: 8px;
        color: #c2410c;
        font-size: 14px;
        font-weight: 700;
        text-align: center;
      }

      .math-answer-hidden {
        display: none !important;
      }

      @media (max-width: 480px) {
        .math-answer-input-box {
          width: 100%;
          gap: 8px;
          padding: 12px 10px;
        }

        .math-answer-fraction-group {
          gap: 8px;
        }

        .math-answer-sign-select {
          width: 58px;
        }

        .math-answer-whole-input {
          width: 72px;
        }

        .math-answer-fraction-stack {
          width: 92px;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  class AnswerInput {
    constructor(options = {}) {
      instanceCount += 1;

      this.options = options;

      this.mountId =
        options.mountId ||
        "";

      this.mode =
        options.mode ||
        "integer";

      this.requireSimplest =
        options.requireSimplest !== false;

      this.allowMixedNumber =
        options.allowMixedNumber !== false;

      this.allowImproperFraction =
        options.allowImproperFraction !== false;

      this.idPrefix =
        options.idPrefix ||
        `mathAnswerInput${instanceCount}`;

      this.mount =
        this.mountId
          ? document.getElementById(
              this.mountId
            )
          : null;

      this.root = null;
      this.integerBox = null;
      this.fractionBox = null;
      this.messageElement = null;

      this.integerInput = null;
      this.signSelect = null;
      this.wholeInput = null;
      this.numeratorInput = null;
      this.denominatorInput = null;

      createStyle();

      if (!this.mount) {
        console.error(
          `找不到答案輸入元件掛載位置：${this.mountId}`
        );

        return;
      }

      this.render();
      this.setMode(this.mode);
    }

    render() {
      this.root =
        document.createElement(
          "div"
        );

      this.root.className =
        "math-answer-input";

      this.root.innerHTML = `
        <div class="math-answer-input-box">

          <div
            id="${this.idPrefix}IntegerBox"
          >
            <input
              id="${this.idPrefix}Integer"
              class="math-answer-integer-input"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              aria-label="整數答案"
              placeholder="輸入答案"
            >
          </div>

          <div
            id="${this.idPrefix}FractionBox"
            class="math-answer-fraction-group math-answer-hidden"
          >
            <select
              id="${this.idPrefix}Sign"
              class="math-answer-sign-select"
              aria-label="答案正負號"
            >
              <option value="1">＋</option>
              <option value="-1">−</option>
            </select>

            <input
              id="${this.idPrefix}Whole"
              class="math-answer-whole-input"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              aria-label="帶分數整數部分"
              placeholder="整數"
            >

            <div class="math-answer-fraction-stack">
              <input
                id="${this.idPrefix}Numerator"
                class="math-answer-fraction-input"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                aria-label="分子"
                placeholder="分子"
              >

              <span
                class="math-answer-fraction-line"
                aria-hidden="true"
              ></span>

              <input
                id="${this.idPrefix}Denominator"
                class="math-answer-fraction-input"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                aria-label="分母"
                placeholder="分母"
              >
            </div>
          </div>

        </div>

        <div
          id="${this.idPrefix}Message"
          class="math-answer-message"
          aria-live="polite"
        ></div>
      `;

      this.mount.innerHTML = "";
      this.mount.appendChild(
        this.root
      );

      this.integerBox =
        document.getElementById(
          `${this.idPrefix}IntegerBox`
        );

      this.fractionBox =
        document.getElementById(
          `${this.idPrefix}FractionBox`
        );

      this.messageElement =
        document.getElementById(
          `${this.idPrefix}Message`
        );

      this.integerInput =
        document.getElementById(
          `${this.idPrefix}Integer`
        );

      this.signSelect =
        document.getElementById(
          `${this.idPrefix}Sign`
        );

      this.wholeInput =
        document.getElementById(
          `${this.idPrefix}Whole`
        );

      this.numeratorInput =
        document.getElementById(
          `${this.idPrefix}Numerator`
        );

      this.denominatorInput =
        document.getElementById(
          `${this.idPrefix}Denominator`
        );

      if (!this.allowMixedNumber) {
        this.wholeInput.classList.add(
          "math-answer-hidden"
        );
      }

      [
        this.integerInput,
        this.wholeInput,
        this.numeratorInput,
        this.denominatorInput
      ].forEach((input) => {
        input?.addEventListener(
          "input",
          () => {
            this.clearMessage();
          }
        );
      });
    }

    setMode(mode) {
      const normalizedMode =
        mode === "fraction"
          ? "fraction"
          : "integer";

      this.mode =
        normalizedMode;

      const isInteger =
        normalizedMode ===
        "integer";

      this.integerBox.classList.toggle(
        "math-answer-hidden",
        !isInteger
      );

      this.fractionBox.classList.toggle(
        "math-answer-hidden",
        isInteger
      );

      this.clearMessage();

      window.setTimeout(() => {
        this.focus();
      }, 0);
    }

    showInteger() {
      this.setMode("integer");
    }

    showFraction() {
      this.setMode("fraction");
    }

    focus() {
      if (
        this.mode === "integer"
      ) {
        this.integerInput?.focus();
      } else {
        this.numeratorInput?.focus();
      }
    }

    reset() {
      if (this.integerInput) {
        this.integerInput.value = "";
      }

      if (this.signSelect) {
        this.signSelect.value = "1";
      }

      if (this.wholeInput) {
        this.wholeInput.value = "";
      }

      if (this.numeratorInput) {
        this.numeratorInput.value = "";
      }

      if (this.denominatorInput) {
        this.denominatorInput.value = "";
      }

      this.clearMessage();
    }

    setMessage(message) {
      if (!this.messageElement) {
        return;
      }

      this.messageElement.textContent =
        message || "";
    }

    clearMessage() {
      this.setMessage("");
    }

    getIntegerValue() {
      const raw =
        this.integerInput
          .value
          .trim();

      if (raw === "") {
        return {
          valid: false,
          reason: "empty",
          message:
            "請輸入答案。"
        };
      }

      if (!/^-?\d+$/.test(raw)) {
        return {
          valid: false,
          reason: "invalid-integer",
          message:
            "請輸入正確的整數。"
        };
      }

      const value =
        Number(raw);

      if (!Number.isSafeInteger(value)) {
        return {
          valid: false,
          reason: "integer-too-large",
          message:
            "輸入的整數過大。"
        };
      }

      return {
        valid: true,
        value,
        numerator: value,
        denominator: 1,
        isInteger: true,
        isMixedNumber: false,
        simplest: true
      };
    }

    getFractionValue() {
      const sign =
        Number(
          this.signSelect.value
        );

      const wholeText =
        this.wholeInput
          .value
          .trim();

      const numeratorText =
        this.numeratorInput
          .value
          .trim();

      const denominatorText =
        this.denominatorInput
          .value
          .trim();

      if (
        numeratorText === "" ||
        denominatorText === ""
      ) {
        return {
          valid: false,
          reason: "incomplete-fraction",
          message:
            "請完整輸入分子與分母。"
        };
      }

      if (
        !/^\d*$/.test(wholeText) ||
        !/^\d+$/.test(
          numeratorText
        ) ||
        !/^\d+$/.test(
          denominatorText
        )
      ) {
        return {
          valid: false,
          reason: "invalid-fraction",
          message:
            "整數部分、分子與分母只能輸入非負整數。"
        };
      }

      const whole =
        wholeText === ""
          ? 0
          : Number(wholeText);

      const numerator =
        Number(numeratorText);

      const denominator =
        Number(denominatorText);

      if (
        !Number.isSafeInteger(
          whole
        ) ||
        !Number.isSafeInteger(
          numerator
        ) ||
        !Number.isSafeInteger(
          denominator
        )
      ) {
        return {
          valid: false,
          reason: "number-too-large",
          message:
            "輸入的數字過大。"
        };
      }

      if (denominator === 0) {
        return {
          valid: false,
          reason: "zero-denominator",
          message:
            "分母不可為 0。"
        };
      }

      const isMixedNumber =
        whole > 0;

      if (
        isMixedNumber &&
        !this.allowMixedNumber
      ) {
        return {
          valid: false,
          reason: "mixed-not-allowed",
          message:
            "此題不接受帶分數。"
        };
      }

      if (
        isMixedNumber &&
        numerator >= denominator
      ) {
        return {
          valid: false,
          reason:
            "invalid-mixed-number",
          message:
            "帶分數的分子必須小於分母。"
        };
      }

      if (
        !isMixedNumber &&
        numerator >= denominator &&
        !this.allowImproperFraction
      ) {
        return {
          valid: false,
          reason:
            "improper-not-allowed",
          message:
            "此題不接受假分數。"
        };
      }

      const simplest =
        gcd(
          numerator,
          denominator
        ) === 1;

      if (
        this.requireSimplest &&
        !simplest
      ) {
        return {
          valid: false,
          reason: "not-simplest",
          message:
            "分數尚未化成最簡分數。"
        };
      }

      const improperNumerator =
        whole * denominator +
        numerator;

      const signedNumerator =
        sign *
        improperNumerator;

      const simplified =
        simplifyFraction(
          signedNumerator,
          denominator
        );

      return {
        valid: true,
        numerator:
          simplified.numerator,
        denominator:
          simplified.denominator,
        isInteger:
          simplified.denominator === 1,
        isMixedNumber,
        whole,
        fractionNumerator:
          numerator,
        fractionDenominator:
          denominator,
        sign,
        simplest
      };
    }

    getValue({
      showMessage = true
    } = {}) {
      const result =
        this.mode === "integer"
          ? this.getIntegerValue()
          : this.getFractionValue();

      if (
        !result.valid &&
        showMessage
      ) {
        this.setMessage(
          result.message
        );
      } else if (
        result.valid
      ) {
        this.clearMessage();
      }

      return result;
    }

    setIntegerValue(value) {
      this.showInteger();

      this.integerInput.value =
        String(value);
    }

    setFractionValue({
      sign = 1,
      whole = "",
      numerator = "",
      denominator = ""
    } = {}) {
      this.showFraction();

      this.signSelect.value =
        Number(sign) < 0
          ? "-1"
          : "1";

      this.wholeInput.value =
        whole === null ||
        whole === undefined
          ? ""
          : String(whole);

      this.numeratorInput.value =
        numerator === null ||
        numerator === undefined
          ? ""
          : String(numerator);

      this.denominatorInput.value =
        denominator === null ||
        denominator === undefined
          ? ""
          : String(denominator);
    }

    equals(
      expectedNumerator,
      expectedDenominator = 1
    ) {
      const result =
        this.getValue();

      if (!result.valid) {
        return false;
      }

      const expected =
        simplifyFraction(
          expectedNumerator,
          expectedDenominator
        );

      return (
        result.numerator ===
          expected.numerator &&
        result.denominator ===
          expected.denominator
      );
    }

    destroy() {
      if (this.mount) {
        this.mount.innerHTML = "";
      }

      this.root = null;
      this.mount = null;
      this.integerBox = null;
      this.fractionBox = null;
      this.messageElement = null;

      this.integerInput = null;
      this.signSelect = null;
      this.wholeInput = null;
      this.numeratorInput = null;
      this.denominatorInput = null;
    }
  }

  window.MathAnswerInput = {
    create(options = {}) {
      return new AnswerInput(
        options
      );
    },

    simplify:
      simplifyFraction,

    gcd
  };
})();