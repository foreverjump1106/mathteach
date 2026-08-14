/*
==================================================
數學遊戲樂園｜RadicalInput
檔案：js/radical-input.js
版本：6.0
==================================================

修正：
1. 根號斜線與橫線連接
2. 根號橫線加粗
3. 橫線完整包住根號內輸入框
4. 即時顯示目前答案
5. 不自動替學生化簡
==================================================
*/

(function () {

  "use strict";


  const DEFAULT_OPTIONS = {

    mountId: "",

    requireSimplifiedRadical: true,

    maxRadicand: 99999,

    theme: {

      primary: "#0288d1",

      light: "#e1f5fe",

      border: "#81d4fa"
    }
  };


  /*
  ==================================================
  工具
  ==================================================
  */

  function mergeOptions(
    defaults,
    options
  ) {

    return {

      ...defaults,
      ...options,

      theme: {

        ...defaults.theme,

        ...(options.theme || {})
      }
    };
  }


  function gcd(
    a,
    b
  ) {

    a =
      Math.abs(
        Number(a)
      );


    b =
      Math.abs(
        Number(b)
      );


    while (
      b !== 0
    ) {

      const temp =
        b;

      b =
        a % b;

      a =
        temp;
    }


    return a || 1;
  }


  function isPerfectSquare(
    value
  ) {

    const number =
      Number(value);


    return (
      Number.isInteger(number) &&
      number >= 0 &&
      Number.isInteger(
        Math.sqrt(number)
      )
    );
  }


  function getLargestSquareFactor(
    value
  ) {

    const number =
      Math.abs(
        Number(value)
      );


    if (
      !Number.isInteger(number) ||
      number <= 1
    ) {

      return 1;
    }


    for (
      let root =
        Math.floor(
          Math.sqrt(number)
        );

      root >= 2;

      root--
    ) {

      const square =
        root * root;


      if (
        number % square === 0
      ) {

        return square;
      }
    }


    return 1;
  }


  function isSimplifiedRadicand(
    value
  ) {

    const number =
      Number(value);


    return (
      Number.isInteger(number) &&
      number > 1 &&
      getLargestSquareFactor(number) === 1
    );
  }


  function simplifyRadical(
    coefficient,
    radicand
  ) {

    coefficient =
      Number(coefficient);


    radicand =
      Number(radicand);


    if (
      !Number.isInteger(coefficient) ||
      !Number.isInteger(radicand) ||
      radicand < 0
    ) {

      return null;
    }


    if (
      coefficient === 0 ||
      radicand === 0
    ) {

      return {

        type: "number",

        value: 0
      };
    }


    if (
      radicand === 1
    ) {

      return {

        type: "number",

        value: coefficient
      };
    }


    const squareFactor =
      getLargestSquareFactor(
        radicand
      );


    const outside =
      Math.sqrt(
        squareFactor
      );


    const remain =
      radicand /
      squareFactor;


    const finalCoefficient =
      coefficient *
      outside;


    if (
      remain === 1
    ) {

      return {

        type: "number",

        value:
          finalCoefficient
      };
    }


    return {

      type: "radical",

      coefficient:
        finalCoefficient,

      radicand:
        remain
    };
  }


  /*
  ==================================================
  MathML
  ==================================================
  */

  function mathWrap(
    content
  ) {

    return `

      <math
        xmlns="http://www.w3.org/1998/Math/MathML"
      >

        ${content}

      </math>
    `;
  }


  function sqrtNumberHTML(
    value
  ) {

    return mathWrap(

      `

        <msqrt>

          <mn>
            ${value}
          </mn>

        </msqrt>

      `
    );
  }


  function sqrtFractionHTML(
    numerator,
    denominator
  ) {

    return mathWrap(

      `

        <msqrt>

          <mfrac>

            <mn>
              ${numerator}
            </mn>

            <mn>
              ${denominator}
            </mn>

          </mfrac>

        </msqrt>

      `
    );
  }


  function sqrtSquareHTML(
    value
  ) {

    const number =
      Number(value);


    const base =

      number < 0

        ? `

            <mrow>

              <mo>(</mo>

              <mo>−</mo>

              <mn>
                ${Math.abs(number)}
              </mn>

              <mo>)</mo>

            </mrow>

          `

        : `

            <mn>
              ${number}
            </mn>

          `;


    return mathWrap(

      `

        <msqrt>

          <msup>

            ${base}

            <mn>
              2
            </mn>

          </msup>

        </msqrt>

      `
    );
  }


  function radicalToHTML(
    coefficient,
    radicand
  ) {

    coefficient =
      Number(coefficient);


    radicand =
      Number(radicand);


    if (
      coefficient === 0
    ) {

      return "0";
    }


    if (
      radicand === 1
    ) {

      return String(
        coefficient
      )
        .replace(
          "-",
          "−"
        );
    }


    let coefficientPart =
      "";


    if (
      coefficient === -1
    ) {

      coefficientPart =
        "<mo>−</mo>";

    } else if (
      coefficient !== 1
    ) {

      coefficientPart =

        coefficient < 0

          ? `

              <mo>−</mo>

              <mn>
                ${Math.abs(coefficient)}
              </mn>

            `

          : `

              <mn>
                ${coefficient}
              </mn>

            `;
    }


    return mathWrap(

      `

        <mrow>

          ${coefficientPart}

          <msqrt>

            <mn>
              ${radicand}
            </mn>

          </msqrt>

        </mrow>

      `
    );
  }


  /*
  ==================================================
  RadicalInput
  ==================================================
  */

  class RadicalInput {

    constructor(
      options = {}
    ) {

      this.options =
        mergeOptions(
          DEFAULT_OPTIONS,
          options
        );


      this.mount =
        document.getElementById(
          this.options.mountId
        );


      if (
        !this.mount
      ) {

        throw new Error(
          `RadicalInput 找不到：${this.options.mountId}`
        );
      }


      this.render();
    }


    /*
    ==================================================
    Render
    ==================================================
    */

    render() {

      this.mount.innerHTML =
        "";


      this.root =
        document.createElement(
          "div"
        );


      this.root.className =
        "radical-input";


      this.root.style.setProperty(
        "--ri-primary",
        this.options.theme.primary
      );


      this.root.style.setProperty(
        "--ri-light",
        this.options.theme.light
      );


      this.root.style.setProperty(
        "--ri-border",
        this.options.theme.border
      );


      this.root.innerHTML = `

        <style>

          .radical-input {

            width:
              min(
                100%,
                760px
              );

            margin:
              0 auto;
          }


          .ri-editor {

            display:
              flex;

            justify-content:
              center;

            align-items:
              flex-end;

            gap:
              14px;

            flex-wrap:
              wrap;
          }


          .ri-field {

            text-align:
              center;
          }


          .ri-field label {

            display:
              block;

            margin-bottom:
              6px;

            color:
              #64748b;

            font-size:
              13px;

            font-weight:
              900;
          }


          .ri-field input,
          .ri-field select {

            height:
              56px;

            padding:
              8px;

            border:
              2px solid
              var(--ri-border);

            border-radius:
              10px;

            background:
              white;

            color:
              #1f2937;

            font-size:
              22px;

            font-weight:
              900;

            text-align:
              center;

            outline:
              none;
          }


          .ri-field input:focus,
          .ri-field select:focus {

            border-color:
              var(--ri-primary);

            box-shadow:
              0 0 0 4px
              rgba(
                2,
                136,
                209,
                .12
              );
          }


          .ri-sign {

            width:
              92px;
          }


          .ri-coefficient {

            width:
              145px;
          }


          /*
          ==================================================
          根號輸入
          ==================================================

                   ━━━━━━━━━━━━━
                  √  [答案]

          重點：
          1. 橫線加粗
          2. 橫線往左延伸
          3. 與根號斜線重疊
          ==================================================
          */

          .ri-radicand-block {

            text-align:
              center;
          }


          .ri-radicand-label {

            display:
              block;

            margin-bottom:
              6px;

            color:
              #64748b;

            font-size:
              13px;

            font-weight:
              900;
          }


          .ri-sqrt-entry {

            position:
              relative;

            display:
              inline-flex;

            align-items:
              flex-end;

            /*
            上方留空間給根號橫線
            */

            padding:
              13px 2px 0 35px;

            min-height:
              69px;
          }


          /*
          根號本體
          */

          .ri-sqrt-entry::before {

            content:
              "√";

            position:
              absolute;

            /*
            往右一點，
            讓斜線頂端與橫線重疊
            */

            left:
              2px;

            bottom:
              -1px;

            z-index:
              2;

            color:
              #0f172a;

            font-family:
              "Cambria Math",
              "STIX Two Math",
              "Times New Roman",
              serif;

            font-size:
              61px;

            font-weight:
              500;

            line-height:
              1;
          }


          /*
          根號橫線

          ★ 4px
          ★ 往左延伸到根號頂端
          ★ 避免中間斷掉
          */

          .ri-sqrt-entry::after {

            content:
              "";

            position:
              absolute;

            left:
              28px;

            right:
              0;

            top:
              8px;

            z-index:
              3;

            height:
              4px;

            border-radius:
              2px 2px 0 0;

            background:
              #0f172a;
          }


          .ri-radicand {

            position:
              relative;

            z-index:
              1;

            width:
              180px;

            height:
              56px;

            padding:
              8px;

            border:
              2px solid
              var(--ri-border);

            border-radius:
              8px;

            background:
              white;

            color:
              #1f2937;

            font-size:
              22px;

            font-weight:
              900;

            text-align:
              center;

            outline:
              none;
          }


          .ri-radicand:focus {

            border-color:
              var(--ri-primary);

            box-shadow:
              0 0 0 4px
              rgba(
                2,
                136,
                209,
                .12
              );
          }


          /*
          ==================================================
          提醒
          ==================================================
          */

          .ri-message {

            min-height:
              28px;

            margin-top:
              13px;

            color:
              #b45309;

            text-align:
              center;

            font-weight:
              900;

            line-height:
              1.6;
          }


          /*
          ==================================================
          即時預覽
          ==================================================
          */

          .ri-preview {

            margin-top:
              14px;

            padding:
              14px;

            border:
              2px solid
              var(--ri-border);

            border-radius:
              13px;

            background:
              var(--ri-light);

            color:
              #334155;

            text-align:
              center;

            font-size:
              18px;

            font-weight:
              900;
          }


          .ri-preview-answer {

            display:
              inline-flex;

            align-items:
              center;

            margin-left:
              8px;

            color:
              var(--ri-primary);

            font-size:
              27px;
          }


          .ri-preview-answer math {

            font-size:
              1.15em;
          }


          .radical-input.disabled {

            opacity:
              .65;
          }


          @media(
            max-width:600px
          ) {

            .ri-editor {

              gap:
                8px;
            }


            .ri-coefficient {

              width:
                105px;
            }


            .ri-radicand {

              width:
                130px;
            }


            .ri-sqrt-entry {

              padding-left:
                34px;
            }

          }

        </style>


        <div class="ri-editor">


          <div class="ri-field">

            <label>
              正負號
            </label>

            <select
              id="ri-sign"
              class="ri-sign"
            >

              <option value="1">
                ＋
              </option>

              <option value="-1">
                －
              </option>

            </select>

          </div>


          <div class="ri-field">

            <label>
              根號外係數
            </label>

            <input
              id="ri-coefficient"
              class="ri-coefficient"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              value="1"
            >

          </div>


          <div class="ri-radicand-block">

            <label class="ri-radicand-label">
              根號內
            </label>


            <div class="ri-sqrt-entry">

              <input
                id="ri-radicand"
                class="ri-radicand"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="輸入"
              >

            </div>

          </div>


        </div>


        <div
          id="ri-message"
          class="ri-message"
        ></div>


        <div
          id="ri-preview"
          class="ri-preview"
        >

          目前尚未完成答案。

        </div>
      `;


      this.mount.appendChild(
        this.root
      );


      this.signInput =
        this.root.querySelector(
          "#ri-sign"
        );


      this.coefficientInput =
        this.root.querySelector(
          "#ri-coefficient"
        );


      this.radicandInput =
        this.root.querySelector(
          "#ri-radicand"
        );


      this.message =
        this.root.querySelector(
          "#ri-message"
        );


      this.preview =
        this.root.querySelector(
          "#ri-preview"
        );


      [
        this.signInput,
        this.coefficientInput,
        this.radicandInput
      ]
        .forEach(
          element => {

            element.addEventListener(
              "input",
              () => {

                this.clearMessage();

                this.updatePreview();
              }
            );


            element.addEventListener(
              "change",
              () => {

                this.clearMessage();

                this.updatePreview();
              }
            );
          }
        );


      this.updatePreview();
    }


    /*
    ==================================================
    取得答案
    ==================================================
    */

    getValue() {

      const coefficientRaw =
        this.coefficientInput
          ?.value
          .trim() ||
        "";


      const radicandRaw =
        this.radicandInput
          ?.value
          .trim() ||
        "";


      if (
        !/^\d+$/
          .test(
            coefficientRaw
          ) ||
        !/^\d+$/
          .test(
            radicandRaw
          )
      ) {

        return {

          valid:
            false
        };
      }


      const absoluteCoefficient =
        Number(
          coefficientRaw
        );


      const radicand =
        Number(
          radicandRaw
        );


      const sign =
        Number(
          this.signInput.value
        );


      const coefficient =
        sign *
        absoluteCoefficient;


      return {

        valid:
          true,

        coefficient,

        absoluteCoefficient,

        radicand,

        sign,

        display:
          radicalToHTML(
            coefficient,
            radicand
          )
      };
    }


    /*
    ==================================================
    驗證
    ==================================================
    */

    validate() {

      const value =
        this.getValue();


      if (
        !value.valid
      ) {

        return this.fail(
          "incomplete",
          "請把根式答案輸入完整。"
        );
      }


      if (
        value.absoluteCoefficient ===
        0
      ) {

        return this.fail(
          "zero-coefficient",
          "⚠️ 根號外係數若為 0，答案應直接整理成 0。"
        );
      }


      if (
        value.radicand <=
        0
      ) {

        return this.fail(
          "invalid-radicand",
          "⚠️ 根號內請輸入正整數。"
        );
      }


      if (
        value.radicand >
        this.options.maxRadicand
      ) {

        return this.fail(
          "too-large",
          `⚠️ 根號內請勿超過 ${this.options.maxRadicand}。`
        );
      }


      if (
        this.options
          .requireSimplifiedRadical
      ) {

        if (
          value.radicand ===
          1
        ) {

          return this.fail(
            "radical-is-integer",
            "⚠️ √1 可以直接化為整數，請再整理答案。"
          );
        }


        const squareFactor =
          getLargestSquareFactor(
            value.radicand
          );


        if (
          squareFactor >
          1
        ) {

          return this.fail(
            "not-simplified",
            `⚠️ √${value.radicand} 還可以繼續化簡，請整理成最簡根式後再提交。`
          );
        }
      }


      this.clearMessage();


      return {

        valid:
          true,

        value
      };
    }


    fail(
      reason,
      message
    ) {

      this.showMessage(
        message
      );


      return {

        valid:
          false,

        reason,

        message
      };
    }


    /*
    ==================================================
    即時預覽
    ==================================================
    */

    updatePreview() {

      const value =
        this.getValue();


      if (
        !value.valid
      ) {

        this.preview.innerHTML =
          "目前尚未完成答案。";


        return;
      }


      this.preview.innerHTML = `

        目前答案：

        <span class="ri-preview-answer">

          ${value.display}

        </span>
      `;
    }


    /*
    ==================================================
    公開操作
    ==================================================
    */

    showMessage(
      message
    ) {

      this.message.textContent =
        message;
    }


    clearMessage() {

      this.message.textContent =
        "";
    }


    setDisabled(
      disabled
    ) {

      this.root
        .querySelectorAll(
          "input, select"
        )
        .forEach(
          element => {

            element.disabled =
              Boolean(
                disabled
              );
          }
        );


      this.root
        .classList
        .toggle(
          "disabled",
          Boolean(
            disabled
          )
        );
    }


    focus() {

      this.radicandInput
        ?.focus();
    }

  }


  /*
  ==================================================
  公開
  ==================================================
  */

  window.RadicalInput =
    RadicalInput;


  window.RadicalInputUtils = {

    gcd,

    isPerfectSquare,

    getLargestSquareFactor,

    isSimplifiedRadicand,

    simplifyRadical,

    mathWrap,

    sqrtNumberHTML,

    sqrtFractionHTML,

    sqrtSquareHTML,

    radicalToHTML
  };

})();
