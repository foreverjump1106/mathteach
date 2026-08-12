/*
==================================================
數學遊戲樂園｜RadicalInput
檔案：js/radical-input.js
版本：2.0
==================================================

功能：

1. signedNumber
   ＋7
   －7
   ±7

2. radical
   √2
   3√2
   −3√5

3. 根號上方橫線使用 CSS 繪製

4. 最簡根式檢查
   例如：
   3√8
   不會自動化成 6√2

   而是提醒學生自行化簡。

==================================================
*/

(function () {

  "use strict";


  /*
  ==================================================
  預設
  ==================================================
  */

  const DEFAULT_OPTIONS = {

    mountId:
      "",

    mode:
      "radical",

    allowPositive:
      true,

    allowNegative:
      true,

    allowPlusMinus:
      false,

    allowZero:
      true,

    requireSimplifiedRadical:
      true,

    maxRadicand:
      99999,

    theme: {

      primary:
        "#0288d1",

      light:
        "#e1f5fe",

      border:
        "#81d4fa"
    },

    labels: {

      sign:
        "正負號",

      value:
        "數值",

      coefficient:
        "根號外係數",

      radicand:
        "根號內",

      preview:
        "目前答案"
    },

    onChange:
      null
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

        ...(
          options.theme ||
          {}
        )
      },

      labels: {

        ...defaults.labels,

        ...(
          options.labels ||
          {}
        )
      }
    };
  }


  function escapeHtml(
    value
  ) {

    return String(
      value
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }


  /*
  ==================================================
  最大公因數
  ==================================================
  */

  function gcd(
    a,
    b
  ) {

    a =
      Math.abs(
        Number(
          a
        )
      );


    b =
      Math.abs(
        Number(
          b
        )
      );


    while (
      b !==
      0
    ) {

      const temp =
        b;


      b =
        a %
        b;


      a =
        temp;
    }


    return a || 1;
  }


  /*
  ==================================================
  完全平方
  ==================================================
  */

  function isPerfectSquare(
    value
  ) {

    value =
      Number(
        value
      );


    if (
      !Number.isInteger(
        value
      ) ||
      value <
      0
    ) {

      return false;
    }


    return Number.isInteger(
      Math.sqrt(
        value
      )
    );
  }


  /*
  ==================================================
  最大平方因數
  ==================================================
  */

  function getLargestSquareFactor(
    value
  ) {

    value =
      Math.abs(
        Number(
          value
        )
      );


    if (
      !Number.isInteger(
        value
      ) ||
      value <=
      1
    ) {

      return 1;
    }


    const maxRoot =
      Math.floor(
        Math.sqrt(
          value
        )
      );


    for (
      let root =
        maxRoot;

      root >=
        2;

      root--
    ) {

      const square =
        root *
        root;


      if (
        value %
        square ===
        0
      ) {

        return square;
      }
    }


    return 1;
  }


  /*
  ==================================================
  是否最簡根式
  ==================================================
  */

  function isSimplifiedRadicand(
    value
  ) {

    value =
      Number(
        value
      );


    if (
      !Number.isInteger(
        value
      ) ||
      value <=
      1
    ) {

      return false;
    }


    return (
      getLargestSquareFactor(
        value
      ) ===
      1
    );
  }


  /*
  ==================================================
  系統用化簡

  注意：
  只供系統建立標準答案，
  不會拿來修改學生輸入。
  ==================================================
  */

  function simplifyRadical(
    coefficient,
    radicand
  ) {

    coefficient =
      Number(
        coefficient
      );


    radicand =
      Number(
        radicand
      );


    if (
      !Number.isInteger(
        coefficient
      ) ||
      !Number.isInteger(
        radicand
      ) ||
      radicand <
      0
    ) {

      return null;
    }


    if (
      coefficient ===
        0 ||
      radicand ===
        0
    ) {

      return {

        type:
          "number",

        value:
          0
      };
    }


    if (
      radicand ===
      1
    ) {

      return {

        type:
          "number",

        value:
          coefficient
      };
    }


    const squareFactor =
      getLargestSquareFactor(
        radicand
      );


    if (
      squareFactor ===
      1
    ) {

      return {

        type:
          "radical",

        coefficient,

        radicand
      };
    }


    const outside =
      Math.sqrt(
        squareFactor
      );


    const remain =
      radicand /
      squareFactor;


    const newCoefficient =
      coefficient *
      outside;


    if (
      remain ===
      1
    ) {

      return {

        type:
          "number",

        value:
          newCoefficient
      };
    }


    return {

      type:
        "radical",

      coefficient:
        newCoefficient,

      radicand:
        remain
    };
  }


  /*
  ==================================================
  ★ 根號 HTML

  不再直接顯示 √99
  改成：
  √ + CSS border-top

  這樣根號上方橫線不會消失。
  ==================================================
  */

  function sqrtHTML(
    content
  ) {

    return `

      <span class="math-sqrt">

        <span class="math-sqrt__symbol">
          √
        </span>

        <span class="math-sqrt__radicand">
          ${content}
        </span>

      </span>
    `;
  }


  function radicalToHTML(
    coefficient,
    radicand
  ) {

    coefficient =
      Number(
        coefficient
      );


    radicand =
      Number(
        radicand
      );


    if (
      coefficient ===
      0
    ) {

      return "0";
    }


    if (
      radicand ===
      1
    ) {

      return String(
        coefficient
      )
        .replace(
          "-",
          "−"
        );
    }


    let coefficientHTML =
      "";


    if (
      coefficient ===
      -1
    ) {

      coefficientHTML =
        "−";

    } else if (
      coefficient !==
      1
    ) {

      coefficientHTML =
        String(
          coefficient
        )
          .replace(
            "-",
            "−"
          );
    }


    return (
      coefficientHTML +
      sqrtHTML(
        radicand
      )
    );
  }


  /*
  ==================================================
  元件
  ==================================================
  */

  class RadicalInput {

    constructor(
      options =
        {}
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
          `RadicalInput 找不到掛載位置：${this.options.mountId}`
        );
      }


      this.mode =
        this.options.mode;


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
          "section"
        );


      this.root.className =
        "radical-input";


      this.root.style.setProperty(
        "--radical-primary",
        this.options.theme.primary
      );


      this.root.style.setProperty(
        "--radical-light",
        this.options.theme.light
      );


      this.root.style.setProperty(
        "--radical-border",
        this.options.theme.border
      );


      this.root.innerHTML = `

        <style>

          /*
          ==============================================
          RadicalInput
          ==============================================
          */

          .radical-input {

            width:
              min(
                100%,
                720px
              );

            margin:
              0 auto;
          }


          .radical-input__editor {

            display:
              flex;

            justify-content:
              center;

            align-items:
              end;

            gap:
              10px;

            flex-wrap:
              wrap;
          }


          .radical-input__field {

            text-align:
              center;
          }


          .radical-input__field label {

            display:
              block;

            margin-bottom:
              5px;

            color:
              #64748b;

            font-size:
              13px;

            font-weight:
              900;
          }


          .radical-input__field input,
          .radical-input__field select {

            min-width:
              82px;

            height:
              48px;

            padding:
              8px;

            border:
              2px solid
              var(
                --radical-border
              );

            border-radius:
              11px;

            background:
              white;

            color:
              #1f2937;

            font-size:
              21px;

            font-weight:
              900;

            text-align:
              center;

            outline:
              none;
          }


          .radical-input__field input:focus,
          .radical-input__field select:focus {

            border-color:
              var(
                --radical-primary
              );

            box-shadow:
              0 0 0 4px
              rgba(
                2,
                136,
                209,
                .12
              );
          }


          .radical-input__sqrt-symbol {

            min-height:
              48px;

            display:
              flex;

            align-items:
              center;

            padding-bottom:
              2px;

            color:
              #0f172a;

            font-family:
              "Times New Roman",
              serif;

            font-size:
              36px;

            font-weight:
              900;
          }


          /*
          ==============================================
          ★ 根號
          ==============================================
          */

          .radical-input .math-sqrt {

            display:
              inline-flex;

            align-items:
              flex-start;

            vertical-align:
              middle;

            white-space:
              nowrap;
          }


          .radical-input
          .math-sqrt__symbol {

            position:
              relative;

            top:
              .07em;

            margin-right:
              -.06em;

            font-family:
              "Times New Roman",
              "Cambria Math",
              serif;

            font-size:
              1.18em;

            line-height:
              1;
          }


          .radical-input
          .math-sqrt__radicand {

            display:
              inline-block;

            min-width:
              .6em;

            margin-top:
              .07em;

            padding:
              .04em .10em 0 .08em;

            border-top:
              .085em solid
              currentColor;

            line-height:
              1;
          }


          .radical-input__message {

            min-height:
              27px;

            margin-top:
              12px;

            color:
              #b45309;

            text-align:
              center;

            font-weight:
              900;

            line-height:
              1.6;
          }


          .radical-input__preview {

            margin-top:
              12px;

            padding:
              12px;

            border:
              2px solid
              var(
                --radical-border
              );

            border-radius:
              12px;

            background:
              var(
                --radical-light
              );

            color:
              #334155;

            text-align:
              center;

            font-size:
              18px;

            font-weight:
              900;
          }


          .radical-input__preview strong {

            margin-left:
              6px;

            color:
              var(
                --radical-primary
              );

            font-size:
              25px;
          }


          .radical-input.disabled {

            opacity:
              .65;
          }

        </style>


        <div
          id="radical-editor"
          class="radical-input__editor"
        ></div>


        <div
          id="radical-message"
          class="radical-input__message"
        ></div>


        <div
          id="radical-preview"
          class="radical-input__preview"
        >

          目前尚未完成答案。

        </div>
      `;


      this.mount.appendChild(
        this.root
      );


      this.editor =
        this.root.querySelector(
          "#radical-editor"
        );


      this.message =
        this.root.querySelector(
          "#radical-message"
        );


      this.preview =
        this.root.querySelector(
          "#radical-preview"
        );


      if (
        this.mode ===
        "signedNumber"
      ) {

        this.renderSignedNumber();

      } else {

        this.renderRadical();
      }


      this.updatePreview();
    }


    /*
    ==================================================
    ± Number
    ==================================================
    */

    renderSignedNumber() {

      this.editor.innerHTML = `

        <div class="radical-input__field">

          <label>
            ${escapeHtml(
              this.options.labels.sign
            )}
          </label>

          <select
            id="radical-sign"
          ></select>

        </div>


        <div class="radical-input__field">

          <label>
            ${escapeHtml(
              this.options.labels.value
            )}
          </label>

          <input
            id="radical-value"
            type="text"
            inputmode="numeric"
            autocomplete="off"
          >

        </div>
      `;


      this.signInput =
        this.root.querySelector(
          "#radical-sign"
        );


      this.valueInput =
        this.root.querySelector(
          "#radical-value"
        );


      const signs =
        [];


      if (
        this.options.allowPositive
      ) {

        signs.push(
          [
            "1",
            "＋"
          ]
        );
      }


      if (
        this.options.allowNegative
      ) {

        signs.push(
          [
            "-1",
            "－"
          ]
        );
      }


      if (
        this.options.allowPlusMinus
      ) {

        signs.push(
          [
            "pm",
            "±"
          ]
        );
      }


      this.signInput.innerHTML =
        signs
          .map(
            (
              [
                value,
                text
              ]
            ) => `

              <option
                value="${value}"
              >
                ${text}
              </option>
            `
          )
          .join("");


      [
        this.signInput,
        this.valueInput
      ]
        .forEach(
          element => {

            element.addEventListener(
              "input",
              () => {

                this.clearMessage();

                this.updatePreview();

                this.emitChange();
              }
            );


            element.addEventListener(
              "change",
              () => {

                this.clearMessage();

                this.updatePreview();

                this.emitChange();
              }
            );
          }
        );
    }


    /*
    ==================================================
    Radical
    ==================================================
    */

    renderRadical() {

      this.editor.innerHTML = `

        <div class="radical-input__field">

          <label>
            ${escapeHtml(
              this.options.labels.sign
            )}
          </label>

          <select
            id="radical-sign"
          >

            <option value="1">
              ＋
            </option>

            <option value="-1">
              －
            </option>

          </select>

        </div>


        <div class="radical-input__field">

          <label>
            ${escapeHtml(
              this.options.labels.coefficient
            )}
          </label>

          <input
            id="radical-coefficient"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            value="1"
          >

        </div>


        <div class="radical-input__sqrt-symbol">
          √
        </div>


        <div class="radical-input__field">

          <label>
            ${escapeHtml(
              this.options.labels.radicand
            )}
          </label>

          <input
            id="radical-radicand"
            type="text"
            inputmode="numeric"
            autocomplete="off"
          >

        </div>
      `;


      this.signInput =
        this.root.querySelector(
          "#radical-sign"
        );


      this.coefficientInput =
        this.root.querySelector(
          "#radical-coefficient"
        );


      this.radicandInput =
        this.root.querySelector(
          "#radical-radicand"
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

                this.emitChange();
              }
            );


            element.addEventListener(
              "change",
              () => {

                this.clearMessage();

                this.updatePreview();

                this.emitChange();
              }
            );
          }
        );
    }


    /*
    ==================================================
    讀值
    ==================================================
    */

    getValue() {

      if (
        this.mode ===
        "signedNumber"
      ) {

        const raw =
          this.valueInput
            ?.value
            .trim() ||
          "";


        if (
          !/^\d+$/
            .test(
              raw
            )
        ) {

          return {

            valid:
              false,

            mode:
              "signedNumber"
          };
        }


        const number =
          Number(
            raw
          );


        const sign =
          this.signInput
            ?.value ||
          "1";


        return {

          valid:
            true,

          mode:
            "signedNumber",

          sign,

          number,

          display:

            sign ===
            "pm"

              ? `±${number}`

              : sign ===
                "-1"

                ? `−${number}`

                : String(
                    number
                  )
        };
      }


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
            false,

          mode:
            "radical"
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
          this.signInput
            ?.value ||
          1
        );


      const coefficient =
        sign *
        absoluteCoefficient;


      return {

        valid:
          true,

        mode:
          "radical",

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

        const message =
          "請把答案輸入完整。";


        this.showMessage(
          message
        );


        return {

          valid:
            false,

          reason:
            "incomplete",

          message,

          value
        };
      }


      if (
        this.mode ===
        "signedNumber"
      ) {

        if (
          value.number ===
            0 &&
          !this.options.allowZero
        ) {

          const message =
            "此題答案不能是 0。";


          this.showMessage(
            message
          );


          return {

            valid:
              false,

            reason:
              "zero-not-allowed",

            message,

            value
          };
        }


        this.clearMessage();


        return {

          valid:
            true,

          reason:
            "ok",

          value
        };
      }


      /*
      --------------------------------------------------
      根式
      --------------------------------------------------
      */

      if (
        value.absoluteCoefficient ===
        0
      ) {

        const message =
          "⚠️ 係數為 0 時應直接整理成 0。";


        this.showMessage(
          message
        );


        return {

          valid:
            false,

          reason:
            "radical-equals-zero",

          message,

          value
        };
      }


      if (
        value.radicand <=
        0
      ) {

        const message =
          "⚠️ 根號內請輸入正整數。";


        this.showMessage(
          message
        );


        return {

          valid:
            false,

          reason:
            "invalid-radicand",

          message,

          value
        };
      }


      if (
        value.radicand >
        this.options.maxRadicand
      ) {

        const message =
          `根號內請勿超過 ${this.options.maxRadicand}。`;


        this.showMessage(
          message
        );


        return {

          valid:
            false,

          reason:
            "radicand-too-large",

          message,

          value
        };
      }


      /*
      --------------------------------------------------
      最簡根式
      --------------------------------------------------
      */

      if (
        this.options
          .requireSimplifiedRadical
      ) {

        if (
          value.radicand ===
          1
        ) {

          const message =
            "⚠️ √1 可以直接化成整數，請整理成最簡形式。";


          this.showMessage(
            message
          );


          return {

            valid:
              false,

            reason:
              "radical-can-be-integer",

            message,

            value
          };
        }


        const squareFactor =
          getLargestSquareFactor(
            value.radicand
          );


        if (
          squareFactor >
          1
        ) {

          const message =
            `⚠️ √${value.radicand} 還可以繼續化簡，請將答案整理成最簡根式後再提交。`;


          this.showMessage(
            message
          );


          return {

            valid:
              false,

            reason:
              "radical-not-simplified",

            squareFactor,

            message,

            value
          };
        }
      }


      this.clearMessage();


      return {

        valid:
          true,

        reason:
          "ok",

        value
      };
    }


    /*
    ==================================================
    Preview
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


      this.preview.innerHTML =
        `${escapeHtml(
          this.options.labels.preview
        )}：<strong>${value.display}</strong>`;
    }


    /*
    ==================================================
    Public
    ==================================================
    */

    setDisabled(
      disabled
    ) {

      this.root
        .querySelectorAll(
          "input,select,button"
        )
        .forEach(
          element => {

            element.disabled =
              Boolean(
                disabled
              );
          }
        );


      this.root.classList.toggle(
        "disabled",
        Boolean(
          disabled
        )
      );
    }


    focus() {

      if (
        this.mode ===
        "signedNumber"
      ) {

        this.valueInput
          ?.focus();

      } else {

        this.radicandInput
          ?.focus();
      }
    }


    reset() {

      this.render();
    }


    showMessage(
      message
    ) {

      if (
        this.message
      ) {

        this.message.textContent =
          String(
            message ||
            ""
          );
      }
    }


    clearMessage() {

      if (
        this.message
      ) {

        this.message.textContent =
          "";
      }
    }


    emitChange() {

      if (
        typeof this.options.onChange ===
        "function"
      ) {

        this.options.onChange(
          this.getValue(),
          this
        );
      }
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

    sqrtHTML,

    radicalToHTML
  };

})();
