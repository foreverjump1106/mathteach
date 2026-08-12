/*
==================================================
數學遊戲樂園｜ExpressionInput 共用輸入元件
版本：5.0
==================================================

支援：

1. number
2. expression
3. polynomial
4. 整數係數
5. 分數係數
6. 最簡分數檢查
7. 保留學生原始分子／分母
8. 多項式等價比較
9. 舊遊戲相容

重要：

requireSimplifiedFraction: true

例如學生輸入：

2 / 4

不會自動變成：

1 / 2

validate() 會回傳提醒，
要求學生自行約分後才能提交。

==================================================
*/

(function () {

  "use strict";


  /*
  ==================================================
  預設設定
  ==================================================
  */

  const DEFAULT_OPTIONS = {

    mountId:
      "",


    /*
    模式
    */

    defaultMode:
      "number",

    allowNumber:
      true,

    allowExpression:
      true,

    allowPolynomial:
      false,


    /*
    Number
    */

    numberPlaceholder:
      "請輸入答案",

    numberInputMode:
      "numeric",


    /*
    Expression
    */

    baseOptions:
      [
        1,2,3,4,5,6,7,
        8,9,10,11,12,13
      ],

    exponentOptions:
      [
        0,1,2,3,4,5,
        6,7,8,9,10
      ],

    allowCustomBase:
      true,

    allowNegativeBase:
      false,

    allowZeroBase:
      false,

    maxTerms:
      7,

    operator:
      "×",

    requireAscendingBases:
      false,

    disallowDuplicateBases:
      false,

    omitExponentOne:
      true,


    /*
    Polynomial
    */

    polynomialVariable:
      "x",

    polynomialExponentOptions:
      [
        3,
        2,
        1,
        0
      ],

    maxPolynomialTerms:
      5,

    allowNegativePolynomialCoefficient:
      true,

    allowZeroPolynomialCoefficient:
      false,

    allowFractionPolynomialCoefficient:
      false,


    /*
    ★ 新功能

    false：
    學生輸入 2/4，
    判定時可視為 1/2。

    true：
    學生必須自行輸入最簡分數。
    2/4 不允許提交。
    */

    requireSimplifiedFraction:
      false,


    requireDescendingPowers:
      false,

    disallowDuplicatePowers:
      false,

    omitPolynomialCoefficientOne:
      true,


    /*
    Theme
    */

    theme: {

      primary:
        "#1565c0",

      light:
        "#eef7ff",

      border:
        "#90caf9"
    },


    /*
    Labels
    */

    labels: {

      numberMode:
        "一般答案",

      expressionMode:
        "標準形式",

      polynomialMode:
        "多項式",

      numberLabel:
        "請輸入答案",

      expressionLabel:
        "請輸入標準形式",

      polynomialLabel:
        "請輸入完整多項式",

      baseLabel:
        "選擇底數",

      exponentLabel:
        "選擇指數",

      editLabel:
        "編輯答案",

      polynomialSignLabel:
        "正負號",

      polynomialCoefficientLabel:
        "輸入係數",

      polynomialExponentLabel:
        "選擇這一項",

      polynomialEditLabel:
        "編輯多項式",

      numeratorLabel:
        "分子",

      denominatorLabel:
        "分母"
    },


    onChange:
      null,

    onModeChange:
      null
  };


  /*
  ==================================================
  基本工具
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
      },

      labels: {

        ...defaults.labels,
        ...(options.labels || {})
      },

      baseOptions:

        Array.isArray(
          options.baseOptions
        )

          ? [...options.baseOptions]

          : [...defaults.baseOptions],


      exponentOptions:

        Array.isArray(
          options.exponentOptions
        )

          ? [...options.exponentOptions]

          : [...defaults.exponentOptions],


      polynomialExponentOptions:

        Array.isArray(
          options.polynomialExponentOptions
        )

          ? [...options.polynomialExponentOptions]

          : [...defaults.polynomialExponentOptions]
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


  function isSimplifiedFraction(
    numerator,
    denominator
  ) {

    numerator =
      Number(
        numerator
      );


    denominator =
      Number(
        denominator
      );


    if (
      !Number.isInteger(numerator) ||
      !Number.isInteger(denominator) ||
      denominator === 0
    ) {

      return false;
    }


    /*
    0 一律視為 0/1
    */

    if (
      numerator === 0
    ) {

      return (
        Math.abs(
          denominator
        ) === 1
      );
    }


    return (
      gcd(
        numerator,
        denominator
      ) === 1
    );
  }


  function normalizeFraction(
    numerator,
    denominator = 1
  ) {

    numerator =
      Number(
        numerator
      );


    denominator =
      Number(
        denominator
      );


    if (
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator)
    ) {

      return {

        numerator:
          NaN,

        denominator:
          NaN
      };
    }


    if (
      denominator === 0
    ) {

      return {

        numerator,

        denominator:
          0
      };
    }


    if (
      numerator === 0
    ) {

      return {

        numerator:
          0,

        denominator:
          1
      };
    }


    if (
      denominator < 0
    ) {

      numerator =
        -numerator;

      denominator =
        -denominator;
    }


    const divisor =
      gcd(
        numerator,
        denominator
      );


    return {

      numerator:
        numerator /
        divisor,

      denominator:
        denominator /
        divisor
    };
  }


  function addFractions(
    first,
    second
  ) {

    return normalizeFraction(

      first.numerator *
        second.denominator +

      second.numerator *
        first.denominator,

      first.denominator *
        second.denominator
    );
  }


  function subtractFractions(
    first,
    second
  ) {

    return addFractions(

      first,

      {
        numerator:
          -second.numerator,

        denominator:
          second.denominator
      }
    );
  }


  function multiplyFractions(
    first,
    second
  ) {

    return normalizeFraction(

      first.numerator *
        second.numerator,

      first.denominator *
        second.denominator
    );
  }


  function divideFractions(
    first,
    second
  ) {

    return normalizeFraction(

      first.numerator *
        second.denominator,

      first.denominator *
        second.numerator
    );
  }


  function multiplyFraction(
    fraction,
    multiplier
  ) {

    return normalizeFraction(

      fraction.numerator *
        multiplier,

      fraction.denominator
    );
  }


  function coefficientToFraction(
    coefficient,
    sign
  ) {

    if (
      coefficient === null ||
      coefficient === undefined
    ) {

      return null;
    }


    let result;


    if (
      typeof coefficient ===
      "number"
    ) {

      result =
        normalizeFraction(
          coefficient,
          1
        );

    } else if (
      typeof coefficient ===
      "object"
    ) {

      if (
        coefficient.numerator === null ||
        coefficient.numerator === undefined ||
        coefficient.numerator === ""
      ) {

        return null;
      }


      result =
        normalizeFraction(

          Number(
            coefficient.numerator
          ),

          coefficient.denominator === null ||
          coefficient.denominator === undefined ||
          coefficient.denominator === ""

            ? 1

            : Number(
                coefficient.denominator
              )
        );

    } else {

      return null;
    }


    if (
      sign !== undefined
    ) {

      result =
        normalizeFraction(

          Math.abs(
            result.numerator
          ) *

          (
            Number(sign) < 0
              ? -1
              : 1
          ),

          result.denominator
        );
    }


    return result;
  }


  function fractionToCompatibleCoefficient(
    fraction
  ) {

    const normalized =
      normalizeFraction(

        fraction.numerator,
        fraction.denominator
      );


    if (
      normalized.denominator ===
      1
    ) {

      return normalized.numerator;
    }


    return {

      numerator:
        normalized.numerator,

      denominator:
        normalized.denominator
    };
  }


  function isCoefficientEmpty(
    coefficient
  ) {

    if (
      coefficient === null ||
      coefficient === undefined
    ) {

      return true;
    }


    if (
      typeof coefficient ===
      "object"
    ) {

      return (

        coefficient.numerator === null ||

        coefficient.numerator === undefined ||

        coefficient.numerator === ""
      );
    }


    return false;
  }


  function cloneCoefficient(
    coefficient
  ) {

    if (
      coefficient &&
      typeof coefficient ===
      "object"
    ) {

      return {

        ...coefficient
      };
    }


    return coefficient;
  }


  /*
  ==================================================
  Polynomial utils
  ==================================================
  */

  function normalizePolynomialTermsAsFractions(
    terms
  ) {

    if (
      !Array.isArray(
        terms
      )
    ) {

      return [];
    }


    const map =
      new Map();


    for (
      const term of
      terms
    ) {

      if (
        isCoefficientEmpty(
          term.coefficient
        )
      ) {

        continue;
      }


      const exponent =
        Number(
          term.exponent
        );


      if (
        !Number.isInteger(
          exponent
        ) ||
        exponent < 0
      ) {

        continue;
      }


      const coefficient =
        coefficientToFraction(

          term.coefficient,
          term.sign
        );


      if (
        !coefficient ||
        coefficient.denominator === 0
      ) {

        continue;
      }


      const previous =
        map.get(
          exponent
        ) ||

        {
          numerator:
            0,

          denominator:
            1
        };


      map.set(

        exponent,

        addFractions(
          previous,
          coefficient
        )
      );
    }


    return [
      ...map.entries()
    ]

      .map(
        (
          [
            exponent,
            coefficient
          ]
        ) => ({

          exponent:
            Number(
              exponent
            ),

          coefficient:
            normalizeFraction(

              coefficient.numerator,
              coefficient.denominator
            )
        })
      )

      .filter(
        term =>
          term.coefficient.numerator !==
          0
      )

      .sort(
        (
          first,
          second
        ) =>
          second.exponent -
          first.exponent
      );
  }


  function normalizePolynomialTerms(
    terms
  ) {

    return normalizePolynomialTermsAsFractions(
      terms
    )

      .map(
        term => ({

          exponent:
            term.exponent,

          coefficient:
            fractionToCompatibleCoefficient(
              term.coefficient
            )
        })
      );
  }


  function arePolynomialsEqual(
    first,
    second
  ) {

    const a =
      normalizePolynomialTermsAsFractions(
        first
      );


    const b =
      normalizePolynomialTermsAsFractions(
        second
      );


    if (
      a.length !==
      b.length
    ) {

      return false;
    }


    return a.every(
      (
        term,
        index
      ) => (

        term.exponent ===
          b[index].exponent &&

        term.coefficient.numerator ===
          b[index].coefficient.numerator &&

        term.coefficient.denominator ===
          b[index].coefficient.denominator
      )
    );
  }


  /*
  ==================================================
  HTML 顯示
  ==================================================
  */

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


  function fractionToHtml(
    fraction
  ) {

    const value =
      normalizeFraction(

        Math.abs(
          fraction.numerator
        ),

        fraction.denominator
      );


    if (
      value.denominator === 1
    ) {

      return String(
        value.numerator
      );
    }


    return `

      <span class="expression-input__inline-fraction">

        <span>
          ${value.numerator}
        </span>

        <span>
          ${value.denominator}
        </span>

      </span>
    `;
  }


  function polynomialTermsToHtml(
    terms,
    variable = "x",
    options = {}
  ) {

    const normalized =
      normalizePolynomialTermsAsFractions(
        terms
      );


    if (
      !normalized.length
    ) {

      return "0";
    }


    return normalized
      .map(
        (
          term,
          index
        ) => {

          const negative =
            term.coefficient.numerator <
            0;


          const sign =

            index === 0

              ? (
                  negative
                    ? "−"
                    : ""
                )

              : (
                  negative
                    ? " − "
                    : " ＋ "
                );


          const absolute =
            normalizeFraction(

              Math.abs(
                term.coefficient.numerator
              ),

              term.coefficient.denominator
            );


          if (
            term.exponent ===
            0
          ) {

            return (
              sign +
              fractionToHtml(
                absolute
              )
            );
          }


          const coefficientIsOne =

            absolute.numerator === 1 &&
            absolute.denominator === 1;


          const coefficientHtml =

            coefficientIsOne &&
            options.omitCoefficientOne !== false

              ? ""

              : fractionToHtml(
                  absolute
                );


          return (

            sign +

            coefficientHtml +

            escapeHtml(
              variable
            ) +

            (
              term.exponent === 1

                ? ""

                : `<sup>${term.exponent}</sup>`
            )
          );
        }
      )

      .join("");
  }


  function polynomialTermsToPlain(
    terms,
    variable = "x"
  ) {

    const normalized =
      normalizePolynomialTermsAsFractions(
        terms
      );


    if (
      !normalized.length
    ) {

      return "0";
    }


    return normalized

      .map(
        (
          term,
          index
        ) => {

          const negative =
            term.coefficient.numerator <
            0;


          const sign =

            index === 0

              ? (
                  negative
                    ? "-"
                    : ""
                )

              : (
                  negative
                    ? "-"
                    : "+"
                );


          const absolute =
            normalizeFraction(

              Math.abs(
                term.coefficient.numerator
              ),

              term.coefficient.denominator
            );


          const coefficientText =

            absolute.denominator === 1

              ? String(
                  absolute.numerator
                )

              : `${absolute.numerator}/${absolute.denominator}`;


          if (
            term.exponent === 0
          ) {

            return (
              sign +
              coefficientText
            );
          }


          const coefficientIsOne =

            absolute.numerator === 1 &&
            absolute.denominator === 1;


          return (

            sign +

            (
              coefficientIsOne
                ? ""
                : coefficientText
            ) +

            variable +

            (
              term.exponent === 1
                ? ""
                : `^${term.exponent}`
            )
          );
        }
      )

      .join("");
  }


  /*
  ==================================================
  Expression utils
  ==================================================
  */

  function toSuperscript(
    value
  ) {

    const map = {

      "-":
        "⁻",

      0:
        "⁰",

      1:
        "¹",

      2:
        "²",

      3:
        "³",

      4:
        "⁴",

      5:
        "⁵",

      6:
        "⁶",

      7:
        "⁷",

      8:
        "⁸",

      9:
        "⁹"
    };


    return String(
      value
    )

      .split("")

      .map(
        character =>
          map[character] ||
          character
      )

      .join("");
  }


  function termsToHtml(
    terms,
    operator = "×",
    omitExponentOne = true
  ) {

    return terms

      .map(
        term => {

          if (
            term.exponent === 1 &&
            omitExponentOne
          ) {

            return String(
              term.base
            );
          }


          return (
            `${term.base}<sup>${term.exponent}</sup>`
          );
        }
      )

      .join(
        ` ${operator} `
      );
  }


  function termsToPlain(
    terms,
    operator = "×"
  ) {

    return terms

      .map(
        term =>
          `${term.base}^${term.exponent}`
      )

      .join(
        operator
      );
  }


  function evaluateTerms(
    terms
  ) {

    return terms.reduce(

      (
        product,
        term
      ) =>

        product *

        Math.pow(

          Number(
            term.base
          ),

          Number(
            term.exponent
          )
        ),

      1
    );
  }


  function mergeTermsByBase(
    terms
  ) {

    const map =
      new Map();


    terms.forEach(
      term => {

        const base =
          Number(
            term.base
          );


        map.set(

          base,

          (
            map.get(
              base
            ) ||
            0
          ) +

          Number(
            term.exponent
          )
        );
      }
    );


    return [
      ...map.entries()
    ]

      .map(
        (
          [
            base,
            exponent
          ]
        ) => ({

          base,
          exponent
        })
      )

      .sort(
        (
          first,
          second
        ) =>
          first.base -
          second.base
      );
  }


  /*
  ==================================================
  ExpressionInput
  ==================================================
  */

  class ExpressionInput {

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
          `ExpressionInput 找不到掛載位置：${this.options.mountId}`
        );
      }


      this.terms = [

        {
          base:
            null,

          exponent:
            1
        }
      ];


      this.activeTermIndex =
        0;


      this.polynomialTerms = [

        this.createEmptyPolynomialTerm()
      ];


      this.activePolynomialTermIndex =
        0;


      this.mode =
        this.resolveInitialMode();


      this.render();


      this.emitChange();
    }


    /*
    ==================================================
    Mode
    ==================================================
    */

    resolveInitialMode() {

      if (
        this.options.defaultMode === "number" &&
        this.options.allowNumber
      ) {

        return "number";
      }


      if (
        this.options.defaultMode === "expression" &&
        this.options.allowExpression
      ) {

        return "expression";
      }


      if (
        this.options.defaultMode === "polynomial" &&
        this.options.allowPolynomial
      ) {

        return "polynomial";
      }


      if (
        this.options.allowNumber
      ) {

        return "number";
      }


      if (
        this.options.allowExpression
      ) {

        return "expression";
      }


      return "polynomial";
    }


    getMode() {

      return this.mode;
    }


    setMode(
      mode
    ) {

      if (
        mode === "number" &&
        !this.options.allowNumber
      ) {

        return;
      }


      if (
        mode === "expression" &&
        !this.options.allowExpression
      ) {

        return;
      }


      if (
        mode === "polynomial" &&
        !this.options.allowPolynomial
      ) {

        return;
      }


      this.mode =
        mode;


      this.clearMessage();

      this.syncPanels();

      this.syncPolynomialInputs();

      this.renderPreview();

      this.emitModeChange();

      this.emitChange();
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
        "expression-input";


      this.root.style.setProperty(

        "--expression-primary",
        this.options.theme.primary
      );


      this.root.style.setProperty(

        "--expression-light",
        this.options.theme.light
      );


      this.root.style.setProperty(

        "--expression-border",
        this.options.theme.border
      );


      this.mount.appendChild(
        this.root
      );


      this.renderModeSwitch();

      this.renderNumberPanel();

      this.renderExpressionPanel();

      this.renderPolynomialPanel();


      this.messageElement =
        document.createElement(
          "div"
        );


      this.messageElement.className =
        "expression-input__message";


      this.root.appendChild(
        this.messageElement
      );


      this.previewElement =
        document.createElement(
          "div"
        );


      this.previewElement.className =
        "expression-input__preview";


      this.root.appendChild(
        this.previewElement
      );


      this.syncPanels();

      this.renderPreview();
    }


    renderModeSwitch() {

      const modes =
        [];


      if (
        this.options.allowNumber
      ) {

        modes.push(
          [
            "number",
            this.options.labels.numberMode
          ]
        );
      }


      if (
        this.options.allowExpression
      ) {

        modes.push(
          [
            "expression",
            this.options.labels.expressionMode
          ]
        );
      }


      if (
        this.options.allowPolynomial
      ) {

        modes.push(
          [
            "polynomial",
            this.options.labels.polynomialMode
          ]
        );
      }


      if (
        modes.length <= 1
      ) {

        return;
      }


      const switcher =
        document.createElement(
          "div"
        );


      switcher.className =
        "expression-input__mode-switch";


      modes.forEach(
        (
          [
            mode,
            label
          ]
        ) => {

          const button =
            document.createElement(
              "button"
            );


          button.type =
            "button";


          button.className =
            "expression-input__mode-button";


          button.textContent =
            label;


          button.addEventListener(
            "click",
            () =>
              this.setMode(
                mode
              )
          );


          this[
            `${mode}ModeButton`
          ] =
            button;


          switcher.appendChild(
            button
          );
        }
      );


      this.root.appendChild(
        switcher
      );
    }


    syncPanels() {

      [
        "number",
        "expression",
        "polynomial"
      ]

        .forEach(
          mode => {

            this[
              `${mode}Panel`
            ]
              ?.classList
              .toggle(

                "active",
                this.mode === mode
              );


            this[
              `${mode}ModeButton`
            ]
              ?.classList
              .toggle(

                "active",
                this.mode === mode
              );
          }
        );
    }


    /*
    ==================================================
    Number
    ==================================================
    */

    renderNumberPanel() {

      this.numberPanel =
        document.createElement(
          "div"
        );


      this.numberPanel.className =
        "expression-input__panel";


      const label =
        document.createElement(
          "div"
        );


      label.className =
        "expression-input__label";


      label.textContent =
        this.options.labels.numberLabel;


      this.numberInput =
        document.createElement(
          "input"
        );


      this.numberInput.type =
        "text";


      this.numberInput.className =
        "expression-input__number-input";


      this.numberInput.placeholder =
        this.options.numberPlaceholder;


      this.numberInput.inputMode =
        this.options.numberInputMode;


      this.numberInput.autocomplete =
        "off";


      this.numberInput.addEventListener(
        "input",
        () => {

          this.clearMessage();

          this.renderPreview();

          this.emitChange();
        }
      );


      this.numberPanel.append(
        label,
        this.numberInput
      );


      this.root.appendChild(
        this.numberPanel
      );
    }


    /*
    ==================================================
    Control helpers
    ==================================================
    */

    createControlGroup(
      title
    ) {

      const group =
        document.createElement(
          "div"
        );


      group.className =
        "expression-input__control-group";


      const heading =
        document.createElement(
          "div"
        );


      heading.className =
        "expression-input__control-title";


      heading.textContent =
        title;


      const row =
        document.createElement(
          "div"
        );


      row.className =
        "expression-input__button-row";


      group.append(
        heading,
        row
      );


      return group;
    }


    createKeyButton(
      label,
      callback,
      extraClass = ""
    ) {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        `expression-input__key ${extraClass}`.trim();


      button.textContent =
        label;


      button.addEventListener(
        "click",
        callback
      );


      return button;
    }


    /*
    ==================================================
    Expression
    ==================================================
    */

    renderExpressionPanel() {

      this.expressionPanel =
        document.createElement(
          "div"
        );


      this.expressionPanel.className =
        "expression-input__panel";


      const title =
        document.createElement(
          "div"
        );


      title.className =
        "expression-input__label";


      title.textContent =
        this.options.labels.expressionLabel;


      this.expressionDisplay =
        document.createElement(
          "div"
        );


      this.expressionDisplay.className =
        "expression-input__expression-display";


      this.expressionPanel.append(
        title,
        this.expressionDisplay
      );


      /*
      Base
      */

      let group =
        this.createControlGroup(
          this.options.labels.baseLabel
        );


      let row =
        group.querySelector(
          ".expression-input__button-row"
        );


      this.options.baseOptions
        .forEach(
          base => {

            row.appendChild(

              this.createKeyButton(

                String(
                  base
                ),

                () =>
                  this.setActiveBase(
                    Number(base)
                  )
              )
            );
          }
        );


      if (
        this.options.allowCustomBase
      ) {

        this.customBaseInput =
          document.createElement(
            "input"
          );


        this.customBaseInput.type =
          "number";


        this.customBaseInput.className =
          "expression-input__custom-base";


        this.customBaseInput.placeholder =
          "其他底數";


        this.customBaseInput.addEventListener(
          "change",
          () => {

            const value =
              Number(
                this.customBaseInput.value
              );


            if (
              Number.isFinite(
                value
              )
            ) {

              this.setActiveBase(
                value
              );
            }


            this.customBaseInput.value =
              "";
          }
        );


        row.appendChild(
          this.customBaseInput
        );
      }


      this.expressionPanel.appendChild(
        group
      );


      /*
      Exponent
      */

      group =
        this.createControlGroup(
          this.options.labels.exponentLabel
        );


      row =
        group.querySelector(
          ".expression-input__button-row"
        );


      this.options.exponentOptions
        .forEach(
          exponent => {

            row.appendChild(

              this.createKeyButton(

                exponent === 1 &&
                this.options.omitExponentOne

                  ? "1（省略）"

                  : toSuperscript(
                      exponent
                    ),

                () =>
                  this.setActiveExponent(
                    exponent
                  )
              )
            );
          }
        );


      this.expressionPanel.appendChild(
        group
      );


      /*
      Edit
      */

      group =
        this.createControlGroup(
          this.options.labels.editLabel
        );


      row =
        group.querySelector(
          ".expression-input__button-row"
        );


      row.append(

        this.createKeyButton(
          "＋ 新增一項",
          () => this.addTerm(),
          "action"
        ),

        this.createKeyButton(
          "⌫ 刪除",
          () => this.deleteActiveTerm(),
          "action"
        ),

        this.createKeyButton(
          "清除",
          () => this.resetExpression(),
          "danger"
        )
      );


      this.expressionPanel.appendChild(
        group
      );


      this.root.appendChild(
        this.expressionPanel
      );


      this.renderExpressionTerms();
    }


    setActiveBase(
      base
    ) {

      if (
        !Number.isInteger(
          base
        )
      ) {

        this.showMessage(
          "底數必須是整數。"
        );

        return;
      }


      if (
        base === 0 &&
        !this.options.allowZeroBase
      ) {

        this.showMessage(
          "此題型不允許底數為 0。"
        );

        return;
      }


      if (
        base < 0 &&
        !this.options.allowNegativeBase
      ) {

        this.showMessage(
          "此題型不允許負底數。"
        );

        return;
      }


      this.terms[
        this.activeTermIndex
      ].base =
        base;


      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();
    }


    setActiveExponent(
      exponent
    ) {

      this.terms[
        this.activeTermIndex
      ].exponent =
        Number(
          exponent
        );


      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();
    }


    addTerm() {

      if (
        this.terms.length >=
        this.options.maxTerms
      ) {

        this.showMessage(
          `最多可輸入 ${this.options.maxTerms} 項。`
        );

        return;
      }


      this.terms.push(
        {

          base:
            null,

          exponent:
            1
        }
      );


      this.activeTermIndex =
        this.terms.length -
        1;


      this.renderExpressionTerms();

      this.emitChange();
    }


    deleteActiveTerm() {

      if (
        this.terms.length === 1
      ) {

        this.terms[0] = {

          base:
            null,

          exponent:
            1
        };

      } else {

        this.terms.splice(
          this.activeTermIndex,
          1
        );
      }


      this.activeTermIndex =
        Math.max(

          0,

          Math.min(

            this.activeTermIndex,

            this.terms.length -
            1
          )
        );


      this.renderExpressionTerms();

      this.emitChange();
    }


    resetExpression() {

      this.terms = [

        {
          base:
            null,

          exponent:
            1
        }
      ];


      this.activeTermIndex =
        0;


      this.renderExpressionTerms();

      this.emitChange();
    }


    renderExpressionTerms() {

      if (
        !this.expressionDisplay
      ) {

        return;
      }


      this.expressionDisplay.innerHTML =
        "";


      this.terms.forEach(
        (
          term,
          index
        ) => {

          if (
            index > 0
          ) {

            const operator =
              document.createElement(
                "span"
              );


            operator.className =
              "expression-input__operator";


            operator.textContent =
              this.options.operator;


            this.expressionDisplay.appendChild(
              operator
            );
          }


          const button =
            document.createElement(
              "button"
            );


          button.type =
            "button";


          button.className =
            "expression-input__term";


          button.classList.toggle(

            "active",

            index ===
              this.activeTermIndex
          );


          button.addEventListener(
            "click",
            () => {

              this.activeTermIndex =
                index;


              this.renderExpressionTerms();
            }
          );


          if (
            term.base ===
            null
          ) {

            button.innerHTML =
              `<span class="expression-input__placeholder">選底數</span>`;

          } else {

            button.innerHTML =

              `${term.base}` +

              (
                term.exponent === 1 &&
                this.options.omitExponentOne

                  ? ""

                  : `<sup>${term.exponent}</sup>`
              );
          }


          this.expressionDisplay.appendChild(
            button
          );
        }
      );


      this.renderPreview();
    }


    /*
    ==================================================
    Polynomial
    ==================================================
    */

    createEmptyPolynomialTerm() {

      return {

        sign:
          1,


        /*
        ★ rawNumerator / rawDenominator
        保留學生實際輸入
        */

        coefficient: {

          numerator:
            null,

          denominator:
            1,

          rawNumerator:
            "",

          rawDenominator:
            "1"
        },


        exponent:
          this.options
            ?.polynomialExponentOptions
            ?.[0] ??
          2
      };
    }


    renderPolynomialPanel() {

      this.polynomialPanel =
        document.createElement(
          "div"
        );


      this.polynomialPanel.className =
        "expression-input__panel";


      const title =
        document.createElement(
          "div"
        );


      title.className =
        "expression-input__label";


      title.textContent =
        this.options.labels.polynomialLabel;


      this.polynomialDisplay =
        document.createElement(
          "div"
        );


      this.polynomialDisplay.className =
        "expression-input__polynomial-display";


      this.polynomialPanel.append(
        title,
        this.polynomialDisplay
      );


      /*
      Sign
      */

      let group =
        this.createControlGroup(
          this.options.labels.polynomialSignLabel
        );


      let row =
        group.querySelector(
          ".expression-input__button-row"
        );


      row.append(

        this.createKeyButton(
          "＋",
          () => this.setPolynomialSign(1),
          "sign-key"
        ),

        this.createKeyButton(
          "－",
          () => this.setPolynomialSign(-1),
          "sign-key"
        )
      );


      this.polynomialPanel.appendChild(
        group
      );


      /*
      Coefficient
      */

      group =
        this.createControlGroup(
          this.options.labels.polynomialCoefficientLabel
        );


      row =
        group.querySelector(
          ".expression-input__button-row"
        );


      if (
        this.options.allowFractionPolynomialCoefficient
      ) {

        const fractionBox =
          document.createElement(
            "div"
          );


        fractionBox.className =
          "expression-input__fraction-coefficient";


        /*
        Numerator
        */

        const numeratorWrap =
          document.createElement(
            "label"
          );


        numeratorWrap.className =
          "expression-input__fraction-field";


        const numeratorLabel =
          document.createElement(
            "span"
          );


        numeratorLabel.textContent =
          this.options.labels.numeratorLabel;


        this.polynomialNumeratorInput =
          document.createElement(
            "input"
          );


        this.polynomialNumeratorInput.type =
          "text";


        this.polynomialNumeratorInput.inputMode =
          "numeric";


        this.polynomialNumeratorInput.autocomplete =
          "off";


        this.polynomialNumeratorInput.placeholder =
          "分子";


        numeratorWrap.append(

          numeratorLabel,
          this.polynomialNumeratorInput
        );


        /*
        Slash
        */

        const slash =
          document.createElement(
            "span"
          );


        slash.className =
          "expression-input__fraction-slash";


        slash.textContent =
          "/";


        /*
        Denominator
        */

        const denominatorWrap =
          document.createElement(
            "label"
          );


        denominatorWrap.className =
          "expression-input__fraction-field";


        const denominatorLabel =
          document.createElement(
            "span"
          );


        denominatorLabel.textContent =
          this.options.labels.denominatorLabel;


        this.polynomialDenominatorInput =
          document.createElement(
            "input"
          );


        this.polynomialDenominatorInput.type =
          "text";


        this.polynomialDenominatorInput.inputMode =
          "numeric";


        this.polynomialDenominatorInput.autocomplete =
          "off";


        this.polynomialDenominatorInput.placeholder =
          "分母";


        this.polynomialDenominatorInput.value =
          "1";


        denominatorWrap.append(

          denominatorLabel,
          this.polynomialDenominatorInput
        );


        fractionBox.append(

          numeratorWrap,
          slash,
          denominatorWrap
        );


        row.appendChild(
          fractionBox
        );


        /*
        ★ 這裡不約分
        */

        this.polynomialNumeratorInput
          .addEventListener(
            "input",
            () =>
              this.readPolynomialFractionRaw()
          );


        this.polynomialDenominatorInput
          .addEventListener(
            "input",
            () =>
              this.readPolynomialFractionRaw()
          );

      } else {

        this.polynomialCoefficientInput =
          document.createElement(
            "input"
          );


        this.polynomialCoefficientInput.type =
          "text";


        this.polynomialCoefficientInput.inputMode =
          "numeric";


        this.polynomialCoefficientInput.autocomplete =
          "off";


        this.polynomialCoefficientInput.className =
          "expression-input__coefficient-input";


        this.polynomialCoefficientInput.placeholder =
          "係數";


        this.polynomialCoefficientInput
          .addEventListener(
            "input",
            () =>
              this.readPolynomialInteger()
          );


        row.appendChild(
          this.polynomialCoefficientInput
        );
      }


      /*
      快速數字
      */

      for (
        let value = 1;
        value <= 9;
        value++
      ) {

        row.appendChild(

          this.createKeyButton(

            String(value),

            () =>
              this.setPolynomialCoefficient(
                value
              )
          )
        );
      }


      this.polynomialPanel.appendChild(
        group
      );


      /*
      Exponent
      */

      group =
        this.createControlGroup(
          this.options.labels.polynomialExponentLabel
        );


      row =
        group.querySelector(
          ".expression-input__button-row"
        );


      this.options.polynomialExponentOptions
        .forEach(
          exponent => {

            const label =

              exponent === 0

                ? "常數"

                : exponent === 1

                  ? this.options.polynomialVariable

                  : this.options.polynomialVariable +
                    toSuperscript(
                      exponent
                    );


            row.appendChild(

              this.createKeyButton(

                label,

                () =>
                  this.setPolynomialExponent(
                    exponent
                  )
              )
            );
          }
        );


      this.polynomialPanel.appendChild(
        group
      );


      /*
      Edit
      */

      group =
        this.createControlGroup(
          this.options.labels.polynomialEditLabel
        );


      row =
        group.querySelector(
          ".expression-input__button-row"
        );


      row.append(

        this.createKeyButton(

          "＋ 新增一項",

          () =>
            this.addPolynomialTerm(),

          "action"
        ),

        this.createKeyButton(

          "⌫ 刪除",

          () =>
            this.deleteActivePolynomialTerm(),

          "action"
        ),

        this.createKeyButton(

          "清除",

          () =>
            this.resetPolynomial(),

          "danger"
        )
      );


      this.polynomialPanel.appendChild(
        group
      );


      this.root.appendChild(
        this.polynomialPanel
      );


      this.renderPolynomialTerms();
    }


    setPolynomialSign(
      sign
    ) {

      this.polynomialTerms[
        this.activePolynomialTermIndex
      ].sign =

        Number(sign) < 0
          ? -1
          : 1;


      this.clearMessage();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    setPolynomialCoefficient(
      coefficient
    ) {

      const value =
        Number(
          coefficient
        );


      if (
        !Number.isInteger(
          value
        )
      ) {

        return;
      }


      const term =
        this.polynomialTerms[
          this.activePolynomialTermIndex
        ];


      term.coefficient = {

        numerator:
          Math.abs(
            value
          ),

        denominator:
          1,

        rawNumerator:
          String(
            Math.abs(value)
          ),

        rawDenominator:
          "1"
      };


      this.syncPolynomialInputs();

      this.clearMessage();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    readPolynomialInteger() {

      const raw =
        this.polynomialCoefficientInput
          ?.value
          .trim() ||
        "";


      const term =
        this.polynomialTerms[
          this.activePolynomialTermIndex
        ];


      if (
        raw === ""
      ) {

        term.coefficient = {

          numerator:
            null,

          denominator:
            1,

          rawNumerator:
            "",

          rawDenominator:
            "1"
        };


        this.renderPolynomialTerms();

        this.emitChange();

        return;
      }


      if (
        !/^-?\d+$/
          .test(
            raw
          )
      ) {

        return;
      }


      const value =
        Number(
          raw
        );


      if (
        value === 0 &&
        !this.options.allowZeroPolynomialCoefficient
      ) {

        return;
      }


      if (
        value < 0
      ) {

        term.sign =
          -1;
      }


      term.coefficient = {

        numerator:
          Math.abs(
            value
          ),

        denominator:
          1,

        rawNumerator:
          String(
            Math.abs(value)
          ),

        rawDenominator:
          "1"
      };


      this.renderPolynomialTerms();

      this.emitChange();
    }


    /*
    ==================================================
    ★ 分數原始輸入

    不約分。
    ==================================================
    */

    readPolynomialFractionRaw() {

      const numeratorRaw =
        this.polynomialNumeratorInput
          ?.value
          .trim() ||
        "";


      const denominatorRaw =
        this.polynomialDenominatorInput
          ?.value
          .trim() ||
        "";


      const term =
        this.polynomialTerms[
          this.activePolynomialTermIndex
        ];


      /*
      沒輸入分子
      */

      if (
        numeratorRaw === ""
      ) {

        term.coefficient = {

          numerator:
            null,

          denominator:
            1,

          rawNumerator:
            "",

          rawDenominator:
            denominatorRaw ||
            "1"
        };


        this.renderPolynomialTerms();

        this.emitChange();

        return;
      }


      if (
        !/^-?\d+$/
          .test(
            numeratorRaw
          )
      ) {

        return;
      }


      const actualDenominatorRaw =

        denominatorRaw === ""
          ? "1"
          : denominatorRaw;


      if (
        !/^-?\d+$/
          .test(
            actualDenominatorRaw
          )
      ) {

        return;
      }


      let numerator =
        Number(
          numeratorRaw
        );


      let denominator =
        Number(
          actualDenominatorRaw
        );


      if (
        denominator === 0
      ) {

        this.showMessage(
          "⚠️ 分母不能是 0。"
        );


        /*
        保留學生輸入，
        不讓系統偷偷更改。
        */

        term.coefficient = {

          numerator:
            Math.abs(
              numerator
            ),

          denominator:
            0,

          rawNumerator:
            String(
              Math.abs(numerator)
            ),

          rawDenominator:
            "0"
        };


        return;
      }


      /*
      分母為負數：
      把負號移到多項式正負號。
      這不是約分。
      */

      if (
        denominator < 0
      ) {

        denominator =
          Math.abs(
            denominator
          );


        numerator =
          -numerator;
      }


      if (
        numerator < 0
      ) {

        term.sign =
          -1;

        numerator =
          Math.abs(
            numerator
          );
      }


      /*
      ★ 關鍵：
      直接保留原始分子與分母。

      不呼叫 normalizeFraction。
      */

      term.coefficient = {

        numerator,

        denominator,

        rawNumerator:
          String(
            numerator
          ),

        rawDenominator:
          String(
            denominator
          )
      };


      this.clearMessage();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    setPolynomialExponent(
      exponent
    ) {

      exponent =
        Number(
          exponent
        );


      if (
        !Number.isInteger(
          exponent
        ) ||
        exponent < 0
      ) {

        return;
      }


      if (
        this.options.disallowDuplicatePowers
      ) {

        const duplicate =
          this.polynomialTerms.some(

            (
              term,
              index
            ) =>

              index !==
                this.activePolynomialTermIndex &&

              !isCoefficientEmpty(
                term.coefficient
              ) &&

              term.exponent ===
                exponent
          );


        if (
          duplicate
        ) {

          this.showMessage(
            "相同次方不可重複，請先合併同類項。"
          );

          return;
        }
      }


      if (
        this.options.requireDescendingPowers
      ) {

        const previous =
          this.findPreviousPolynomialExponent();


        const next =
          this.findNextPolynomialExponent();


        if (
          previous !== null &&
          exponent >= previous
        ) {

          this.showMessage(
            "多項式請依次方由大到小排列。"
          );

          return;
        }


        if (
          next !== null &&
          exponent <= next
        ) {

          this.showMessage(
            "多項式請依次方由大到小排列。"
          );

          return;
        }
      }


      this.polynomialTerms[
        this.activePolynomialTermIndex
      ].exponent =
        exponent;


      this.clearMessage();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    findPreviousPolynomialExponent() {

      for (
        let i =
          this.activePolynomialTermIndex -
          1;

        i >= 0;

        i--
      ) {

        if (
          !isCoefficientEmpty(
            this.polynomialTerms[i]
              .coefficient
          )
        ) {

          return this.polynomialTerms[i]
            .exponent;
        }
      }


      return null;
    }


    findNextPolynomialExponent() {

      for (
        let i =
          this.activePolynomialTermIndex +
          1;

        i <
        this.polynomialTerms.length;

        i++
      ) {

        if (
          !isCoefficientEmpty(
            this.polynomialTerms[i]
              .coefficient
          )
        ) {

          return this.polynomialTerms[i]
            .exponent;
        }
      }


      return null;
    }


    addPolynomialTerm() {

      if (
        this.polynomialTerms.length >=
        this.options.maxPolynomialTerms
      ) {

        this.showMessage(
          `最多可輸入 ${this.options.maxPolynomialTerms} 項。`
        );

        return;
      }


      this.polynomialTerms.push(
        this.createEmptyPolynomialTerm()
      );


      this.activePolynomialTermIndex =
        this.polynomialTerms.length -
        1;


      this.syncPolynomialInputs();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    deleteActivePolynomialTerm() {

      if (
        this.polynomialTerms.length === 1
      ) {

        this.polynomialTerms[0] =
          this.createEmptyPolynomialTerm();

      } else {

        this.polynomialTerms.splice(

          this.activePolynomialTermIndex,
          1
        );
      }


      this.activePolynomialTermIndex =
        Math.max(

          0,

          Math.min(

            this.activePolynomialTermIndex,

            this.polynomialTerms.length -
            1
          )
        );


      this.syncPolynomialInputs();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    resetPolynomial() {

      this.polynomialTerms = [

        this.createEmptyPolynomialTerm()
      ];


      this.activePolynomialTermIndex =
        0;


      this.syncPolynomialInputs();

      this.clearMessage();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    syncPolynomialInputs() {

      const term =
        this.polynomialTerms[
          this.activePolynomialTermIndex
        ];


      if (
        !term
      ) {

        return;
      }


      if (
        this.options.allowFractionPolynomialCoefficient
      ) {

        if (
          this.polynomialNumeratorInput
        ) {

          this.polynomialNumeratorInput.value =

            term.coefficient
              ?.rawNumerator ??

            term.coefficient
              ?.numerator ??

            "";
        }


        if (
          this.polynomialDenominatorInput
        ) {

          this.polynomialDenominatorInput.value =

            term.coefficient
              ?.rawDenominator ??

            term.coefficient
              ?.denominator ??

            "1";
        }

      } else {

        if (
          this.polynomialCoefficientInput
        ) {

          this.polynomialCoefficientInput.value =

            term.coefficient
              ?.numerator ??
            "";
        }
      }
    }


    renderPolynomialTerms() {

      if (
        !this.polynomialDisplay
      ) {

        return;
      }


      this.polynomialDisplay.innerHTML =
        "";


      this.polynomialTerms.forEach(
        (
          term,
          index
        ) => {

          if (
            index > 0
          ) {

            const sign =
              document.createElement(
                "span"
              );


            sign.className =
              "expression-input__polynomial-operator";


            sign.textContent =

              term.sign < 0
                ? "−"
                : "+";


            this.polynomialDisplay.appendChild(
              sign
            );
          }


          const button =
            document.createElement(
              "button"
            );


          button.type =
            "button";


          button.className =
            "expression-input__polynomial-term";


          button.classList.toggle(

            "active",

            index ===
              this.activePolynomialTermIndex
          );


          button.addEventListener(
            "click",
            () => {

              this.activePolynomialTermIndex =
                index;


              this.syncPolynomialInputs();

              this.renderPolynomialTerms();
            }
          );


          if (
            isCoefficientEmpty(
              term.coefficient
            )
          ) {

            button.innerHTML =
              `<span class="expression-input__placeholder">輸入一項</span>`;

          } else {

            /*
            顯示學生原始分數。
            */

            const numerator =
              Number(
                term.coefficient.numerator
              );


            const denominator =
              Number(
                term.coefficient.denominator
              );


            const signText =

              index === 0 &&
              term.sign < 0

                ? "−"

                : "";


            const isOne =

              numerator === 1 &&
              denominator === 1;


            let coefficientHtml =
              "";


            if (
              denominator !== 1
            ) {

              coefficientHtml = `

                <span class="expression-input__inline-fraction">

                  <span>
                    ${numerator}
                  </span>

                  <span>
                    ${denominator}
                  </span>

                </span>
              `;

            } else if (
              !(
                isOne &&
                term.exponent > 0 &&
                this.options.omitPolynomialCoefficientOne
              )
            ) {

              coefficientHtml =
                String(
                  numerator
                );
            }


            button.innerHTML =

              signText +

              coefficientHtml +

              (
                term.exponent === 0

                  ? ""

                  : this.options.polynomialVariable +
                    (
                      term.exponent === 1

                        ? ""

                        : `<sup>${term.exponent}</sup>`
                    )
              );
          }


          this.polynomialDisplay.appendChild(
            button
          );
        }
      );


      this.renderPreview();
    }


    /*
    ==================================================
    Value
    ==================================================
    */

    getNumberValue() {

      const raw =
        this.numberInput
          .value
          .trim();


      const number =
        Number(
          raw
        );


      return {

        mode:
          "number",

        valid:

          raw !== "" &&
          Number.isFinite(
            number
          ),

        raw,

        number:

          raw === ""
            ? null
            : number
      };
    }


    getExpressionValue() {

      const valid =
        !this.terms.some(
          term =>
            term.base ===
            null
        );


      return {

        mode:
          "expression",

        valid,

        terms:
          this.terms.map(
            term => ({
              ...term
            })
          ),

        html:

          valid

            ? termsToHtml(

                this.terms,
                this.options.operator,
                this.options.omitExponentOne
              )

            : "",

        plain:

          valid

            ? termsToPlain(

                this.terms,
                this.options.operator
              )

            : "",

        number:

          valid

            ? evaluateTerms(
                this.terms
              )

            : null
      };
    }


    getPolynomialValue() {

      const complete =
        !this.polynomialTerms.some(
          term =>
            isCoefficientEmpty(
              term.coefficient
            )
        );


      if (
        !complete
      ) {

        return {

          mode:
            "polynomial",

          valid:
            false,

          terms:
            this.clonePolynomialTerms(),

          fractionTerms:
            [],

          normalizedTerms:
            [],

          html:
            "",

          plain:
            ""
        };
      }


      /*
      ★ fractionTerms 用來判答案。
      在這裡才 normalize，
      但學生 UI 仍保留原始輸入。
      */

      const fractionTerms =
        normalizePolynomialTermsAsFractions(
          this.polynomialTerms
        );


      return {

        mode:
          "polynomial",

        valid:
          fractionTerms.length >
          0,

        terms:
          this.clonePolynomialTerms(),

        fractionTerms,

        normalizedTerms:

          fractionTerms.map(
            term => ({

              exponent:
                term.exponent,

              coefficient:
                fractionToCompatibleCoefficient(
                  term.coefficient
                )
            })
          ),

        html:
          polynomialTermsToHtml(

            fractionTerms,
            this.options.polynomialVariable,

            {
              omitCoefficientOne:
                this.options.omitPolynomialCoefficientOne
            }
          ),

        plain:
          polynomialTermsToPlain(

            fractionTerms,
            this.options.polynomialVariable
          )
      };
    }


    getValue() {

      if (
        this.mode ===
        "number"
      ) {

        return this.getNumberValue();
      }


      if (
        this.mode ===
        "expression"
      ) {

        return this.getExpressionValue();
      }


      return this.getPolynomialValue();
    }


    clonePolynomialTerms() {

      return this.polynomialTerms.map(
        term => ({

          sign:
            term.sign,

          exponent:
            term.exponent,

          coefficient:
            cloneCoefficient(
              term.coefficient
            )
        })
      );
    }


    /*
    ==================================================
    ★ 最簡分數驗證
    ==================================================
    */

    findUnsimplifiedFractions() {

      const result =
        [];


      if (
        !this.options
          .allowFractionPolynomialCoefficient
      ) {

        return result;
      }


      this.polynomialTerms.forEach(
        (
          term,
          index
        ) => {

          if (
            isCoefficientEmpty(
              term.coefficient
            )
          ) {

            return;
          }


          const numerator =
            Number(
              term.coefficient.numerator
            );


          const denominator =
            Number(
              term.coefficient.denominator
            );


          if (
            denominator === 0
          ) {

            result.push(
              {

                index,

                type:
                  "zero-denominator",

                numerator,

                denominator
              }
            );


            return;
          }


          /*
          分母 1 已經是整數。
          */

          if (
            denominator === 1
          ) {

            return;
          }


          if (
            !isSimplifiedFraction(
              numerator,
              denominator
            )
          ) {

            result.push(
              {

                index,

                type:
                  "unsimplified",

                numerator,

                denominator
              }
            );


            return;
          }


          /*
          例如 6/3。
          gcd=3，本來上面就會抓到。
          */
        }
      );


      return result;
    }


    validate() {

      const value =
        this.getValue();


      if (
        !value.valid
      ) {

        this.showMessage(

          this.mode === "number"

            ? "請輸入有效答案。"

            : this.mode === "expression"

              ? "請完成所有底數與指數。"

              : "請完成多項式的每一項。"
        );


        return {

          valid:
            false,

          reason:
            "incomplete",

          value
        };
      }


      /*
      ==================================================
      ★ 最簡分數檢查
      ==================================================
      */

      if (
        this.mode ===
          "polynomial" &&

        this.options
          .requireSimplifiedFraction
      ) {

        const problems =
          this.findUnsimplifiedFractions();


        const zeroDenominator =
          problems.find(
            problem =>
              problem.type ===
              "zero-denominator"
          );


        if (
          zeroDenominator
        ) {

          const message =
            "⚠️ 分母不能是 0，請修改後再提交。";


          this.showMessage(
            message
          );


          return {

            valid:
              false,

            reason:
              "zero-denominator",

            message,

            value
          };
        }


        const unsimplified =
          problems.filter(
            problem =>
              problem.type ===
              "unsimplified"
          );


        if (
          unsimplified.length
        ) {

          const fractions =
            unsimplified

              .map(
                item =>
                  `${item.numerator}/${item.denominator}`
              )

              .join(
                "、"
              );


          const message =

            `⚠️ ${fractions} 還不是最簡分數，請先約分後再提交。`;


          this.showMessage(
            message
          );


          return {

            valid:
              false,

            reason:
              "fraction-not-simplified",

            message,

            fractions:
              unsimplified,

            value
          };
        }
      }


      /*
      降冪
      */

      if (
        this.mode ===
          "polynomial" &&

        this.options
          .requireDescendingPowers
      ) {

        for (
          let i = 1;
          i < value.terms.length;
          i++
        ) {

          if (
            Number(
              value.terms[i].exponent
            ) >=
            Number(
              value.terms[i - 1].exponent
            )
          ) {

            const message =
              "請依照次方由大到小排列答案。";


            this.showMessage(
              message
            );


            return {

              valid:
                false,

              reason:
                "wrong-order",

              message,

              value
            };
          }
        }
      }


      /*
      重複次方
      */

      if (
        this.mode ===
          "polynomial" &&

        this.options
          .disallowDuplicatePowers
      ) {

        const powers =
          value.terms.map(
            term =>
              Number(
                term.exponent
              )
          );


        if (
          new Set(
            powers
          ).size !==
          powers.length
        ) {

          const message =
            "請先合併同類項，相同次方不可重複。";


          this.showMessage(
            message
          );


          return {

            valid:
              false,

            reason:
              "duplicate-power",

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
    Public helpers
    ==================================================
    */

    setDisabled(
      disabled
    ) {

      this.root
        .querySelectorAll(
          "button,input"
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
        "number"
      ) {

        this.numberInput
          ?.focus();

        return;
      }


      if (
        this.mode ===
        "polynomial"
      ) {

        if (
          this.options
            .allowFractionPolynomialCoefficient
        ) {

          this.polynomialNumeratorInput
            ?.focus();

        } else {

          this.polynomialCoefficientInput
            ?.focus();
        }
      }
    }


    reset() {

      this.numberInput.value =
        "";


      this.resetExpression();

      this.resetPolynomial();


      this.mode =
        this.resolveInitialMode();


      this.syncPanels();

      this.clearMessage();

      this.renderPreview();
    }


    showMessage(
      message
    ) {

      if (
        this.messageElement
      ) {

        this.messageElement.textContent =
          String(
            message || ""
          );
      }
    }


    clearMessage() {

      if (
        this.messageElement
      ) {

        this.messageElement.textContent =
          "";
      }
    }


    renderPreview() {

      if (
        !this.previewElement
      ) {

        return;
      }


      if (
        this.mode ===
        "number"
      ) {

        const value =
          this.getNumberValue();


        this.previewElement.innerHTML =

          value.valid

            ? `目前答案：<strong>${escapeHtml(value.raw)}</strong>`

            : "目前尚未輸入答案。";


        return;
      }


      if (
        this.mode ===
        "expression"
      ) {

        const value =
          this.getExpressionValue();


        this.previewElement.innerHTML =

          value.valid

            ? `目前答案：<strong>${value.html}</strong>`

            : "目前尚未完成標準形式。";


        return;
      }


      /*
      Polynomial preview
      使用學生原始輸入顯示，
      不偷偷約分。
      */

      const complete =
        !this.polynomialTerms.some(
          term =>
            isCoefficientEmpty(
              term.coefficient
            )
        );


      if (
        !complete
      ) {

        this.previewElement.innerHTML =
          "目前尚未完成多項式。";

        return;
      }


      let html =
        "";


      this.polynomialTerms.forEach(
        (
          term,
          index
        ) => {

          const numerator =
            Number(
              term.coefficient.numerator
            );


          const denominator =
            Number(
              term.coefficient.denominator
            );


          const negative =
            term.sign <
            0;


          const sign =

            index === 0

              ? (
                  negative
                    ? "−"
                    : ""
                )

              : (
                  negative
                    ? " − "
                    : " ＋ "
                );


          let coefficientHtml =
            "";


          const isOne =

            numerator === 1 &&
            denominator === 1;


          if (
            denominator === 1
          ) {

            if (
              !(
                isOne &&
                term.exponent > 0 &&
                this.options
                  .omitPolynomialCoefficientOne
              )
            ) {

              coefficientHtml =
                String(
                  numerator
                );
            }

          } else {

            coefficientHtml = `

              <span class="expression-input__inline-fraction">

                <span>
                  ${numerator}
                </span>

                <span>
                  ${denominator}
                </span>

              </span>
            `;
          }


          html +=

            sign +

            coefficientHtml +

            (
              term.exponent === 0

                ? ""

                : this.options.polynomialVariable +

                  (
                    term.exponent === 1

                      ? ""

                      : `<sup>${term.exponent}</sup>`
                  )
            );
        }
      );


      this.previewElement.innerHTML =
        `目前答案：<strong>${html}</strong>`;
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


    emitModeChange() {

      if (
        typeof this.options.onModeChange ===
        "function"
      ) {

        this.options.onModeChange(

          this.mode,
          this
        );
      }
    }
  }


  /*
  ==================================================
  對外
  ==================================================
  */

  window.ExpressionInput =
    ExpressionInput;


  window.ExpressionInputUtils = {

    gcd,

    isSimplifiedFraction,

    normalizeFraction,

    addFractions,

    subtractFractions,

    multiplyFractions,

    divideFractions,

    multiplyFraction,

    coefficientToFraction,

    normalizePolynomialTerms,

    normalizePolynomialTermsAsFractions,

    polynomialTermsToHtml,

    polynomialTermsToPlain,

    arePolynomialsEqual,

    toSuperscript,

    termsToHtml,

    termsToPlain,

    evaluateTerms,

    mergeTermsByBase
  };

})();
