/*
==================================================
數學遊戲樂園｜共用 ExpressionInput
檔案：js/expression-input.js
版本：4.0

支援：
1. number
2. expression
3. polynomial
4. 多項式整數係數
5. 多項式分數係數
6. 分數自動約分
7. 整數／分數多項式等價判定

重點：
舊遊戲原本的功能維持相容。
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
    --------------------------------------------------
    模式
    --------------------------------------------------
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
    --------------------------------------------------
    一般數字
    --------------------------------------------------
    */

    numberPlaceholder:
      "請輸入答案",

    numberInputMode:
      "numeric",


    /*
    --------------------------------------------------
    指數式
    --------------------------------------------------
    */

    baseOptions:
      [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13
      ],

    exponentOptions:
      [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10
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
    --------------------------------------------------
    多項式
    --------------------------------------------------
    */

    polynomialVariable:
      "x",

    polynomialExponentOptions:
      [
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

    /*
    true 時：
    係數使用分子／分母輸入。

    false 時：
    維持原本整數係數輸入。
    */
    allowFractionPolynomialCoefficient:
      false,

    /*
    false：
    2/4 也接受，系統會化成 1/2 後判定。

    true：
    要求學生自己先約成最簡分數。
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
    --------------------------------------------------
    顏色
    --------------------------------------------------
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
    --------------------------------------------------
    顯示文字
    --------------------------------------------------
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

      polynomialCoefficientLabel:
        "輸入係數",

      polynomialExponentLabel:
        "選擇這一項",

      polynomialSignLabel:
        "正負號",

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
  主元件
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


      if (
        !this.options.allowNumber &&
        !this.options.allowExpression &&
        !this.options.allowPolynomial
      ) {

        throw new Error(
          "ExpressionInput 至少必須開啟一種輸入模式。"
        );
      }


      /*
      --------------------------------------------------
      指數式資料
      --------------------------------------------------
      */

      this.terms =
        [
          {
            base:
              null,

            exponent:
              1
          }
        ];


      this.activeTermIndex =
        0;


      /*
      --------------------------------------------------
      多項式資料
      --------------------------------------------------
      */

      this.polynomialTerms =
        [
          this.createEmptyPolynomialTerm()
        ];


      this.activePolynomialTermIndex =
        0;


      /*
      --------------------------------------------------
      模式
      --------------------------------------------------
      */

      this.mode =
        this.resolveInitialMode();


      this.render();


      this.emitChange();
    }


    /*
    ==================================================
    初始模式
    ==================================================
    */

    resolveInitialMode() {

      if (
        this.options.defaultMode ===
          "number" &&
        this.options.allowNumber
      ) {

        return "number";
      }


      if (
        this.options.defaultMode ===
          "expression" &&
        this.options.allowExpression
      ) {

        return "expression";
      }


      if (
        this.options.defaultMode ===
          "polynomial" &&
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


    /*
    ==================================================
    建立整個介面
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

      this.renderMessage();

      this.renderPreview();

      this.syncPanels();
    }


    /*
    ==================================================
    模式切換
    ==================================================
    */

    renderModeSwitch() {

      const enabledModes =
        this.getEnabledModes();


      if (
        enabledModes.length <=
        1
      ) {

        return;
      }


      const switcher =
        document.createElement(
          "div"
        );


      switcher.className =
        "expression-input__mode-switch";


      if (
        this.options.allowNumber
      ) {

        this.numberModeButton =
          this.createModeButton(
            "number",
            this.options.labels.numberMode
          );


        switcher.appendChild(
          this.numberModeButton
        );
      }


      if (
        this.options.allowExpression
      ) {

        this.expressionModeButton =
          this.createModeButton(
            "expression",
            this.options.labels.expressionMode
          );


        switcher.appendChild(
          this.expressionModeButton
        );
      }


      if (
        this.options.allowPolynomial
      ) {

        this.polynomialModeButton =
          this.createModeButton(
            "polynomial",
            this.options.labels.polynomialMode
          );


        switcher.appendChild(
          this.polynomialModeButton
        );
      }


      this.root.appendChild(
        switcher
      );
    }


    getEnabledModes() {

      const result =
        [];


      if (
        this.options.allowNumber
      ) {

        result.push(
          "number"
        );
      }


      if (
        this.options.allowExpression
      ) {

        result.push(
          "expression"
        );
      }


      if (
        this.options.allowPolynomial
      ) {

        result.push(
          "polynomial"
        );
      }


      return result;
    }


    createModeButton(
      mode,
      label
    ) {

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
        () => {

          this.setMode(
            mode
          );
        }
      );


      return button;
    }


    /*
    ==================================================
    一般數字
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

          this.renderPreviewContent();

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
    指數式
    ==================================================
    */

    renderExpressionPanel() {

      this.expressionPanel =
        document.createElement(
          "div"
        );


      this.expressionPanel.className =
        "expression-input__panel";


      const label =
        document.createElement(
          "div"
        );


      label.className =
        "expression-input__label";


      label.textContent =
        this.options.labels.expressionLabel;


      this.expressionDisplay =
        document.createElement(
          "div"
        );


      this.expressionDisplay.className =
        "expression-input__expression-display";


      this.controls =
        document.createElement(
          "div"
        );


      this.controls.className =
        "expression-input__controls";


      this.expressionPanel.append(
        label,
        this.expressionDisplay
      );


      this.renderBaseControls();

      this.renderExponentControls();

      this.renderEditControls();


      this.expressionPanel.appendChild(
        this.controls
      );


      this.root.appendChild(
        this.expressionPanel
      );


      this.renderExpressionTerms();
    }


    renderBaseControls() {

      const group =
        this.createControlGroup(
          this.options.labels.baseLabel
        );


      const row =
        group.querySelector(
          ".expression-input__button-row"
        );


      this.options.baseOptions.forEach(
        (base) => {

          row.appendChild(
            this.createKeyButton(
              String(
                base
              ),
              () => {

                this.setActiveBase(
                  Number(
                    base
                  )
                );
              }
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

            const base =
              Number(
                this.customBaseInput.value
              );


            if (
              !Number.isFinite(
                base
              )
            ) {

              this.showMessage(
                "請輸入有效底數。"
              );

              return;
            }


            this.setActiveBase(
              base
            );


            this.customBaseInput.value =
              "";
          }
        );


        row.appendChild(
          this.customBaseInput
        );
      }


      this.controls.appendChild(
        group
      );
    }


    renderExponentControls() {

      const group =
        this.createControlGroup(
          this.options.labels.exponentLabel
        );


      const row =
        group.querySelector(
          ".expression-input__button-row"
        );


      this.options.exponentOptions.forEach(
        (exponent) => {

          const label =
            exponent ===
              1 &&
            this.options.omitExponentOne
              ? "1（省略）"
              : toSuperscript(
                  exponent
                );


          row.appendChild(
            this.createKeyButton(
              label,
              () => {

                this.setActiveExponent(
                  Number(
                    exponent
                  )
                );
              }
            )
          );
        }
      );


      this.controls.appendChild(
        group
      );
    }


    renderEditControls() {

      const group =
        this.createControlGroup(
          this.options.labels.editLabel
        );


      const row =
        group.querySelector(
          ".expression-input__button-row"
        );


      row.appendChild(
        this.createKeyButton(
          "＋ 新增一項",
          () => {

            this.addTerm();
          },
          "action"
        )
      );


      row.appendChild(
        this.createKeyButton(
          "⌫ 刪除",
          () => {

            this.deleteActiveTerm();
          },
          "action"
        )
      );


      row.appendChild(
        this.createKeyButton(
          "清除",
          () => {

            this.resetExpression();
          },
          "danger"
        )
      );


      this.controls.appendChild(
        group
      );
    }


    /*
    ==================================================
    多項式
    ==================================================
    */

    renderPolynomialPanel() {

      this.polynomialPanel =
        document.createElement(
          "div"
        );


      this.polynomialPanel.className =
        "expression-input__panel";


      const label =
        document.createElement(
          "div"
        );


      label.className =
        "expression-input__label";


      label.textContent =
        this.options.labels.polynomialLabel;


      this.polynomialDisplay =
        document.createElement(
          "div"
        );


      this.polynomialDisplay.className =
        "expression-input__polynomial-display";


      this.polynomialControls =
        document.createElement(
          "div"
        );


      this.polynomialControls.className =
        "expression-input__controls";


      this.polynomialPanel.append(
        label,
        this.polynomialDisplay
      );


      this.renderPolynomialSignControls();

      this.renderPolynomialCoefficientControls();

      this.renderPolynomialExponentControls();

      this.renderPolynomialEditControls();


      this.polynomialPanel.appendChild(
        this.polynomialControls
      );


      this.root.appendChild(
        this.polynomialPanel
      );


      this.renderPolynomialTerms();
    }


    /*
    ==================================================
    多項式正負號
    ==================================================
    */

    renderPolynomialSignControls() {

      const group =
        this.createControlGroup(
          this.options.labels.polynomialSignLabel
        );


      const row =
        group.querySelector(
          ".expression-input__button-row"
        );


      row.appendChild(
        this.createKeyButton(
          "＋",
          () => {

            this.setPolynomialSign(
              1
            );
          },
          "sign-key"
        )
      );


      row.appendChild(
        this.createKeyButton(
          "－",
          () => {

            this.setPolynomialSign(
              -1
            );
          },
          "sign-key"
        )
      );


      this.polynomialControls.appendChild(
        group
      );
    }


    /*
    ==================================================
    多項式係數
    ==================================================
    */

    renderPolynomialCoefficientControls() {

      const group =
        this.createControlGroup(
          this.options.labels.polynomialCoefficientLabel
        );


      const row =
        group.querySelector(
          ".expression-input__button-row"
        );


      /*
      --------------------------------------------------
      分數係數
      --------------------------------------------------
      */

      if (
        this.options.allowFractionPolynomialCoefficient
      ) {

        const box =
          document.createElement(
            "div"
          );


        box.className =
          "expression-input__fraction-coefficient";


        const numeratorWrapper =
          document.createElement(
            "label"
          );


        numeratorWrapper.className =
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


        numeratorWrapper.append(
          numeratorLabel,
          this.polynomialNumeratorInput
        );


        const slash =
          document.createElement(
            "span"
          );


        slash.className =
          "expression-input__fraction-slash";


        slash.textContent =
          "/";


        const denominatorWrapper =
          document.createElement(
            "label"
          );


        denominatorWrapper.className =
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


        denominatorWrapper.append(
          denominatorLabel,
          this.polynomialDenominatorInput
        );


        box.append(
          numeratorWrapper,
          slash,
          denominatorWrapper
        );


        row.appendChild(
          box
        );


        this.polynomialNumeratorInput.addEventListener(
          "input",
          () => {

            this.readPolynomialFractionInputs();
          }
        );


        this.polynomialDenominatorInput.addEventListener(
          "input",
          () => {

            this.readPolynomialFractionInputs();
          }
        );

      } else {

        /*
        --------------------------------------------------
        整數係數
        --------------------------------------------------
        */

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


        this.polynomialCoefficientInput.addEventListener(
          "input",
          () => {

            this.readPolynomialIntegerInput();
          }
        );


        row.appendChild(
          this.polynomialCoefficientInput
        );
      }


      /*
      --------------------------------------------------
      快速係數鍵
      --------------------------------------------------
      */

      [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
      ].forEach(
        (value) => {

          row.appendChild(
            this.createKeyButton(
              String(
                value
              ),
              () => {

                this.setPolynomialCoefficient(
                  value
                );
              }
            )
          );
        }
      );


      this.polynomialControls.appendChild(
        group
      );
    }


    /*
    ==================================================
    多項式次方
    ==================================================
    */

    renderPolynomialExponentControls() {

      const group =
        this.createControlGroup(
          this.options.labels.polynomialExponentLabel
        );


      const row =
        group.querySelector(
          ".expression-input__button-row"
        );


      this.options
        .polynomialExponentOptions
        .forEach(
          (exponent) => {

            let text;


            if (
              exponent ===
              0
            ) {

              text =
                "常數";

            } else if (
              exponent ===
              1
            ) {

              text =
                this.options.polynomialVariable;

            } else {

              text =
                this.options.polynomialVariable +
                toSuperscript(
                  exponent
                );
            }


            row.appendChild(
              this.createKeyButton(
                text,
                () => {

                  this.setPolynomialExponent(
                    exponent
                  );
                }
              )
            );
          }
        );


      this.polynomialControls.appendChild(
        group
      );
    }


    /*
    ==================================================
    多項式編輯
    ==================================================
    */

    renderPolynomialEditControls() {

      const group =
        this.createControlGroup(
          this.options.labels.polynomialEditLabel
        );


      const row =
        group.querySelector(
          ".expression-input__button-row"
        );


      row.appendChild(
        this.createKeyButton(
          "＋ 新增一項",
          () => {

            this.addPolynomialTerm();
          },
          "action"
        )
      );


      row.appendChild(
        this.createKeyButton(
          "⌫ 刪除",
          () => {

            this.deleteActivePolynomialTerm();
          },
          "action"
        )
      );


      row.appendChild(
        this.createKeyButton(
          "清除",
          () => {

            this.resetPolynomial();
          },
          "danger"
        )
      );


      this.polynomialControls.appendChild(
        group
      );
    }


    /*
    ==================================================
    共用控制 UI
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
      extraClass =
        ""
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
    訊息
    ==================================================
    */

    renderMessage() {

      this.messageElement =
        document.createElement(
          "div"
        );


      this.messageElement.className =
        "expression-input__message";


      this.root.appendChild(
        this.messageElement
      );
    }


    /*
    ==================================================
    預覽
    ==================================================
    */

    renderPreview() {

      this.previewElement =
        document.createElement(
          "div"
        );


      this.previewElement.className =
        "expression-input__preview";


      this.root.appendChild(
        this.previewElement
      );


      this.renderPreviewContent();
    }


    /*
    ==================================================
    模式操作
    ==================================================
    */

    setMode(
      mode
    ) {

      if (
        mode ===
          "number" &&
        !this.options.allowNumber
      ) {

        return;
      }


      if (
        mode ===
          "expression" &&
        !this.options.allowExpression
      ) {

        return;
      }


      if (
        mode ===
          "polynomial" &&
        !this.options.allowPolynomial
      ) {

        return;
      }


      this.mode =
        mode;


      this.clearMessage();

      this.syncPanels();

      this.syncPolynomialCoefficientFields();

      this.renderPreviewContent();

      this.emitModeChange();

      this.emitChange();
    }


    getMode() {

      return this.mode;
    }


    syncPanels() {

      this.numberPanel
        .classList
        .toggle(
          "active",
          this.mode ===
            "number"
        );


      this.expressionPanel
        .classList
        .toggle(
          "active",
          this.mode ===
            "expression"
        );


      this.polynomialPanel
        .classList
        .toggle(
          "active",
          this.mode ===
            "polynomial"
        );


      this.numberModeButton
        ?.classList
        .toggle(
          "active",
          this.mode ===
            "number"
        );


      this.expressionModeButton
        ?.classList
        .toggle(
          "active",
          this.mode ===
            "expression"
        );


      this.polynomialModeButton
        ?.classList
        .toggle(
          "active",
          this.mode ===
            "polynomial"
        );
    }


    /*
    ==================================================
    指數式操作
    ==================================================
    */

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
        base ===
          0 &&
        !this.options.allowZeroBase
      ) {

        this.showMessage(
          "此題型不允許底數為 0。"
        );

        return;
      }


      if (
        base <
          0 &&
        !this.options.allowNegativeBase
      ) {

        this.showMessage(
          "此題型不允許負底數。"
        );

        return;
      }


      if (
        this.options.disallowDuplicateBases
      ) {

        const duplicate =
          this.terms.some(
            (
              term,
              index
            ) =>
              index !==
                this.activeTermIndex &&
              term.base ===
                base
          );


        if (
          duplicate
        ) {

          this.showMessage(
            "相同底數不可重複。"
          );

          return;
        }
      }


      if (
        this.options.requireAscendingBases &&
        !this.canPlaceBaseAscending(
          base
        )
      ) {

        this.showMessage(
          "底數必須由小到大排列。"
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


    canPlaceBaseAscending(
      base
    ) {

      const previous =
        this.getPreviousBase();


      const next =
        this.getNextBase();


      if (
        previous !==
          null &&
        base <=
          previous
      ) {

        return false;
      }


      if (
        next !==
          null &&
        base >=
          next
      ) {

        return false;
      }


      return true;
    }


    getPreviousBase() {

      for (
        let i =
          this.activeTermIndex -
          1;

        i >=
        0;

        i--
      ) {

        if (
          this.terms[i].base !==
          null
        ) {

          return this.terms[i].base;
        }
      }


      return null;
    }


    getNextBase() {

      for (
        let i =
          this.activeTermIndex +
          1;

        i <
        this.terms.length;

        i++
      ) {

        if (
          this.terms[i].base !==
          null
        ) {

          return this.terms[i].base;
        }
      }


      return null;
    }


    setActiveExponent(
      exponent
    ) {

      if (
        !Number.isInteger(
          exponent
        )
      ) {

        this.showMessage(
          "指數必須是整數。"
        );

        return;
      }


      this.terms[
        this.activeTermIndex
      ].exponent =
        exponent;


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


      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();
    }


    deleteActiveTerm() {

      if (
        this.terms.length ===
        1
      ) {

        this.terms[0] =
          {
            base:
              null,

            exponent:
              1
          };


        this.activeTermIndex =
          0;

      } else {

        this.terms.splice(
          this.activeTermIndex,
          1
        );


        this.activeTermIndex =
          Math.max(
            0,
            this.activeTermIndex -
              1
          );
      }


      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();
    }


    resetExpression() {

      this.terms =
        [
          {
            base:
              null,

            exponent:
              1
          }
        ];


      this.activeTermIndex =
        0;


      this.clearMessage();

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
            index >
            0
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


              this.clearMessage();

              this.renderExpressionTerms();
            }
          );


          if (
            term.base ===
            null
          ) {

            const placeholder =
              document.createElement(
                "span"
              );


            placeholder.className =
              "expression-input__placeholder";


            placeholder.textContent =
              "選底數";


            button.appendChild(
              placeholder
            );

          } else {

            const base =
              document.createElement(
                "span"
              );


            base.className =
              "expression-input__base";


            base.textContent =
              term.base;


            button.appendChild(
              base
            );


            if (
              !(
                term.exponent ===
                  1 &&
                this.options.omitExponentOne
              )
            ) {

              const exponent =
                document.createElement(
                  "span"
                );


              exponent.className =
                "expression-input__exponent";


              exponent.textContent =
                toSuperscript(
                  term.exponent
                );


              button.appendChild(
                exponent
              );
            }
          }


          this.expressionDisplay.appendChild(
            button
          );
        }
      );


      this.renderPreviewContent();
    }


    /*
    ==================================================
    多項式資料
    ==================================================
    */

    createEmptyPolynomialTerm() {

      return {

        sign:
          1,

        coefficient:
          {
            numerator:
              null,

            denominator:
              1
          },

        variable:
          this.options
            ?.polynomialVariable ||
          "x",

        exponent:
          this.options
            ?.polynomialExponentOptions
            ?.[0] ??
          2
      };
    }


    setPolynomialSign(
      sign
    ) {

      this.polynomialTerms[
        this.activePolynomialTermIndex
      ].sign =
        Number(
          sign
        ) <
        0
          ? -1
          : 1;


      this.clearMessage();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    /*
    ==================================================
    快速整數係數
    ==================================================
    */

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


      if (
        value ===
          0 &&
        !this.options.allowZeroPolynomialCoefficient
      ) {

        this.showMessage(
          "係數不可為 0。"
        );

        return;
      }


      const term =
        this.polynomialTerms[
          this.activePolynomialTermIndex
        ];


      term.sign =
        value <
        0
          ? -1
          : term.sign;


      term.coefficient =
        {
          numerator:
            Math.abs(
              value
            ),

          denominator:
            1
        };


      this.clearMessage();

      this.syncPolynomialCoefficientFields();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    /*
    ==================================================
    整數係數輸入
    ==================================================
    */

    readPolynomialIntegerInput() {

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
        raw ===
        ""
      ) {

        term.coefficient =
          {
            numerator:
              null,

            denominator:
              1
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
        value ===
          0 &&
        !this.options.allowZeroPolynomialCoefficient
      ) {

        return;
      }


      if (
        value <
          0 &&
        !this.options.allowNegativePolynomialCoefficient
      ) {

        return;
      }


      term.sign =
        value <
        0
          ? -1
          : 1;


      term.coefficient =
        {
          numerator:
            Math.abs(
              value
            ),

          denominator:
            1
        };


      this.clearMessage();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    /*
    ==================================================
    分數係數輸入
    ==================================================
    */

    readPolynomialFractionInputs() {

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


      if (
        numeratorRaw ===
        ""
      ) {

        term.coefficient =
          {
            numerator:
              null,

            denominator:
              1
          };


        this.clearMessage();

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


      const denominatorText =
        denominatorRaw ===
          ""
          ? "1"
          : denominatorRaw;


      if (
        !/^-?\d+$/
          .test(
            denominatorText
          )
      ) {

        return;
      }


      const numerator =
        Number(
          numeratorRaw
        );


      const denominator =
        Number(
          denominatorText
        );


      if (
        denominator ===
        0
      ) {

        this.showMessage(
          "分母不可為 0。"
        );

        return;
      }


      if (
        numerator ===
          0 &&
        !this.options.allowZeroPolynomialCoefficient
      ) {

        return;
      }


      const value =
        normalizeFraction(
          numerator,
          denominator
        );


      if (
        value.numerator <
          0 &&
        !this.options.allowNegativePolynomialCoefficient
      ) {

        return;
      }


      term.sign =
        value.numerator <
        0
          ? -1
          : 1;


      term.coefficient =
        {
          numerator:
            Math.abs(
              value.numerator
            ),

          denominator:
            value.denominator
        };


      this.clearMessage();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    /*
    ==================================================
    多項式次方
    ==================================================
    */

    setPolynomialExponent(
      exponent
    ) {

      const value =
        Number(
          exponent
        );


      if (
        !Number.isInteger(
          value
        ) ||
        value <
          0
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
                value
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
        this.options.requireDescendingPowers &&
        !this.canPlacePolynomialExponentDescending(
          value
        )
      ) {

        this.showMessage(
          "多項式請依次方由大到小排列。"
        );

        return;
      }


      this.polynomialTerms[
        this.activePolynomialTermIndex
      ].exponent =
        value;


      this.clearMessage();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    canPlacePolynomialExponentDescending(
      exponent
    ) {

      const previous =
        this.getPreviousPolynomialExponent();


      const next =
        this.getNextPolynomialExponent();


      if (
        previous !==
          null &&
        exponent >=
          previous
      ) {

        return false;
      }


      if (
        next !==
          null &&
        exponent <=
          next
      ) {

        return false;
      }


      return true;
    }


    getPreviousPolynomialExponent() {

      for (
        let i =
          this.activePolynomialTermIndex -
          1;

        i >=
        0;

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


    getNextPolynomialExponent() {

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


    /*
    ==================================================
    多項式新增／刪除
    ==================================================
    */

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


      this.clearMessage();

      this.syncPolynomialCoefficientFields();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    deleteActivePolynomialTerm() {

      if (
        this.polynomialTerms.length ===
        1
      ) {

        this.polynomialTerms[0] =
          this.createEmptyPolynomialTerm();


        this.activePolynomialTermIndex =
          0;

      } else {

        this.polynomialTerms.splice(
          this.activePolynomialTermIndex,
          1
        );


        this.activePolynomialTermIndex =
          Math.max(
            0,
            this.activePolynomialTermIndex -
              1
          );
      }


      this.clearMessage();

      this.syncPolynomialCoefficientFields();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    resetPolynomial() {

      this.polynomialTerms =
        [
          this.createEmptyPolynomialTerm()
        ];


      this.activePolynomialTermIndex =
        0;


      this.clearMessage();

      this.syncPolynomialCoefficientFields();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    /*
    ==================================================
    係數輸入欄同步
    ==================================================
    */

    syncPolynomialCoefficientFields() {

      const term =
        this.polynomialTerms[
          this.activePolynomialTermIndex
        ];


      if (
        !term
      ) {

        return;
      }


      const coefficient =
        coefficientToFraction(
          term.coefficient
        );


      if (
        this.options.allowFractionPolynomialCoefficient
      ) {

        if (
          this.polynomialNumeratorInput
        ) {

          this.polynomialNumeratorInput.value =
            coefficient
              ? String(
                  coefficient.numerator
                )
              : "";
        }


        if (
          this.polynomialDenominatorInput
        ) {

          this.polynomialDenominatorInput.value =
            coefficient
              ? String(
                  coefficient.denominator
                )
              : "1";
        }


        return;
      }


      if (
        !this.polynomialCoefficientInput
      ) {

        return;
      }


      if (
        !coefficient
      ) {

        this.polynomialCoefficientInput.value =
          "";

        return;
      }


      this.polynomialCoefficientInput.value =
        coefficient.denominator ===
          1
          ? String(
              coefficient.numerator
            )
          : "";
    }


    /*
    ==================================================
    顯示多項式
    ==================================================
    */

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
            index >
            0
          ) {

            const operator =
              document.createElement(
                "span"
              );


            operator.className =
              "expression-input__polynomial-operator";


            operator.textContent =
              term.sign <
              0
                ? "−"
                : "+";


            this.polynomialDisplay.appendChild(
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


              this.clearMessage();

              this.syncPolynomialCoefficientFields();

              this.renderPolynomialTerms();
            }
          );


          if (
            isCoefficientEmpty(
              term.coefficient
            )
          ) {

            const placeholder =
              document.createElement(
                "span"
              );


            placeholder.className =
              "expression-input__placeholder";


            placeholder.textContent =
              "輸入一項";


            button.appendChild(
              placeholder
            );

          } else {

            button.innerHTML =
              polynomialTermToHtml(
                term,
                this.options.polynomialVariable,
                {
                  isFirst:
                    index ===
                    0,

                  omitCoefficientOne:
                    this.options.omitPolynomialCoefficientOne
                }
              );
          }


          this.polynomialDisplay.appendChild(
            button
          );
        }
      );


      this.renderPreviewContent();
    }


    /*
    ==================================================
    取得 number
    ==================================================
    */

    getNumberValue() {

      const raw =
        this.numberInput
          .value
          .trim();


      if (
        !raw
      ) {

        return {

          mode:
            "number",

          valid:
            false,

          raw:
            "",

          number:
            null
        };
      }


      const number =
        Number(
          raw
        );


      return {

        mode:
          "number",

        valid:
          Number.isFinite(
            number
          ),

        raw,

        number
      };
    }


    /*
    ==================================================
    取得 expression
    ==================================================
    */

    getExpressionValue() {

      const incomplete =
        this.terms.some(
          (term) =>
            term.base ===
            null
        );


      if (
        incomplete
      ) {

        return {

          mode:
            "expression",

          valid:
            false,

          terms:
            this.cloneTerms(),

          html:
            "",

          plain:
            "",

          number:
            null
        };
      }


      const number =
        evaluateTerms(
          this.terms
        );


      return {

        mode:
          "expression",

        valid:
          Number.isFinite(
            number
          ),

        terms:
          this.cloneTerms(),

        html:
          termsToHtml(
            this.terms,
            this.options.operator,
            this.options.omitExponentOne
          ),

        plain:
          termsToPlain(
            this.terms,
            this.options.operator
          ),

        number
      };
    }


    /*
    ==================================================
    取得 polynomial
    ==================================================
    */

    getPolynomialValue() {

      const incomplete =
        this.polynomialTerms.some(
          (term) =>
            isCoefficientEmpty(
              term.coefficient
            )
        );


      if (
        incomplete
      ) {

        return {

          mode:
            "polynomial",

          valid:
            false,

          variable:
            this.options.polynomialVariable,

          terms:
            this.clonePolynomialTerms(),

          normalizedTerms:
            [],

          fractionTerms:
            [],

          html:
            "",

          plain:
            ""
        };
      }


      const fractionTerms =
        normalizePolynomialTermsAsFractions(
          this.polynomialTerms
        );


      const normalizedTerms =
        fractionTerms.map(
          (term) => ({

            exponent:
              term.exponent,

            coefficient:
              fractionToCompatibleCoefficient(
                term.coefficient
              )
          })
        );


      return {

        mode:
          "polynomial",

        valid:
          fractionTerms.length >
          0,

        variable:
          this.options.polynomialVariable,

        terms:
          this.clonePolynomialTerms(),

        /*
        舊遊戲使用這個。
        整數仍回傳 number。
        分數才回傳 object。
        */
        normalizedTerms,

        /*
        新遊戲可直接使用統一分數格式。
        */
        fractionTerms,

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

        if (
          this.mode ===
          "number"
        ) {

          this.showMessage(
            "請輸入有效答案。"
          );

        } else if (
          this.mode ===
          "expression"
        ) {

          this.showMessage(
            "請完成所有底數與指數。"
          );

        } else {

          this.showMessage(
            "請完成多項式的每一項。"
          );
        }


        return {

          valid:
            false,

          value
        };
      }


      if (
        this.mode ===
          "polynomial" &&
        this.options.requireDescendingPowers
      ) {

        for (
          let i =
            1;

          i <
            value.terms.length;

          i++
        ) {

          if (
            value.terms[i].exponent >=
            value.terms[i - 1].exponent
          ) {

            this.showMessage(
              "多項式請依次方由大到小排列。"
            );


            return {

              valid:
                false,

              value
            };
          }
        }
      }


      if (
        this.mode ===
          "polynomial" &&
        this.options.disallowDuplicatePowers
      ) {

        const powers =
          value.terms.map(
            (term) =>
              term.exponent
          );


        if (
          new Set(
            powers
          ).size !==
          powers.length
        ) {

          this.showMessage(
            "請先合併同類項，不可重複相同次方。"
          );


          return {

            valid:
              false,

            value
          };
        }
      }


      this.clearMessage();


      return {

        valid:
          true,

        value
      };
    }


    /*
    ==================================================
    設定 number
    ==================================================
    */

    setNumberValue(
      value
    ) {

      this.numberInput.value =
        value ===
          null ||
        value ===
          undefined
          ? ""
          : String(
              value
            );


      this.clearMessage();

      this.renderPreviewContent();

      this.emitChange();
    }


    /*
    ==================================================
    設定 expression
    ==================================================
    */

    setExpressionTerms(
      terms
    ) {

      if (
        !Array.isArray(
          terms
        ) ||
        terms.length ===
          0
      ) {

        this.resetExpression();

        return;
      }


      this.terms =
        terms.map(
          (term) => ({

            base:
              Number(
                term.base
              ),

            exponent:
              Number(
                term.exponent
              )
          })
        );


      this.activeTermIndex =
        0;


      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();
    }


    /*
    ==================================================
    設定 polynomial
    ==================================================
    */

    setPolynomialTerms(
      terms
    ) {

      if (
        !Array.isArray(
          terms
        ) ||
        terms.length ===
          0
      ) {

        this.resetPolynomial();

        return;
      }


      const result =
        [];


      for (
        const term of
        terms
      ) {

        const fraction =
          coefficientToFraction(
            term.coefficient,
            term.sign
          );


        if (
          !fraction
        ) {

          continue;
        }


        result.push(
          {

            sign:
              fraction.numerator <
              0
                ? -1
                : 1,

            coefficient:
              {
                numerator:
                  Math.abs(
                    fraction.numerator
                  ),

                denominator:
                  fraction.denominator
              },

            variable:
              this.options.polynomialVariable,

            exponent:
              Number(
                term.exponent
              )
          }
        );
      }


      if (
        !result.length
      ) {

        this.resetPolynomial();

        return;
      }


      this.polynomialTerms =
        result;


      this.activePolynomialTermIndex =
        0;


      this.clearMessage();

      this.syncPolynomialCoefficientFields();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    /*
    ==================================================
    排序
    ==================================================
    */

    sortTermsAscending() {

      this.terms.sort(
        (
          a,
          b
        ) =>
          a.base -
          b.base
      );


      this.activeTermIndex =
        0;


      this.renderExpressionTerms();

      this.emitChange();


      return true;
    }


    mergeDuplicateBases() {

      this.terms =
        mergeTermsByBase(
          this.terms
        );


      this.activeTermIndex =
        0;


      this.renderExpressionTerms();

      this.emitChange();


      return true;
    }


    sortPolynomialDescending() {

      this.polynomialTerms.sort(
        (
          a,
          b
        ) =>
          b.exponent -
          a.exponent
      );


      this.activePolynomialTermIndex =
        0;


      this.syncPolynomialCoefficientFields();

      this.renderPolynomialTerms();

      this.emitChange();


      return true;
    }


    mergePolynomialLikeTerms() {

      const normalized =
        normalizePolynomialTermsAsFractions(
          this.polynomialTerms
        );


      this.polynomialTerms =
        normalized.map(
          (term) => ({

            sign:
              term.coefficient.numerator <
              0
                ? -1
                : 1,

            coefficient:
              {
                numerator:
                  Math.abs(
                    term.coefficient.numerator
                  ),

                denominator:
                  term.coefficient.denominator
              },

            variable:
              this.options.polynomialVariable,

            exponent:
              term.exponent
          })
        );


      this.activePolynomialTermIndex =
        0;


      this.syncPolynomialCoefficientFields();

      this.renderPolynomialTerms();

      this.emitChange();


      return true;
    }


    /*
    ==================================================
    Reset
    ==================================================
    */

    reset() {

      this.numberInput.value =
        "";


      this.terms =
        [
          {
            base:
              null,

            exponent:
              1
          }
        ];


      this.activeTermIndex =
        0;


      this.polynomialTerms =
        [
          this.createEmptyPolynomialTerm()
        ];


      this.activePolynomialTermIndex =
        0;


      this.mode =
        this.resolveInitialMode();


      this.clearMessage();

      this.renderExpressionTerms();

      this.renderPolynomialTerms();

      this.syncPolynomialCoefficientFields();

      this.syncPanels();

      this.renderPreviewContent();

      this.emitChange();
    }


    /*
    ==================================================
    Disabled
    ==================================================
    */

    setDisabled(
      disabled
    ) {

      this.root
        .querySelectorAll(
          "button, input"
        )
        .forEach(
          (element) => {

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


    setVisible(
      visible
    ) {

      this.root.hidden =
        !Boolean(
          visible
        );
    }


    focus() {

      if (
        this.mode ===
        "number"
      ) {

        this.numberInput.focus();

        return;
      }


      if (
        this.mode ===
        "polynomial"
      ) {

        if (
          this.options.allowFractionPolynomialCoefficient
        ) {

          this.polynomialNumeratorInput
            ?.focus();

        } else {

          this.polynomialCoefficientInput
            ?.focus();
        }
      }
    }


    /*
    ==================================================
    訊息
    ==================================================
    */

    showMessage(
      message
    ) {

      if (
        this.messageElement
      ) {

        this.messageElement.textContent =
          String(
            message ||
            ""
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


    /*
    ==================================================
    Clone
    ==================================================
    */

    cloneTerms() {

      return this.terms.map(
        (term) => ({

          base:
            term.base,

          exponent:
            term.exponent
        })
      );
    }


    clonePolynomialTerms() {

      return this.polynomialTerms.map(
        (term) => ({

          sign:
            term.sign,

          coefficient:
            cloneCoefficient(
              term.coefficient
            ),

          variable:
            this.options.polynomialVariable,

          exponent:
            term.exponent
        })
      );
    }


    /*
    ==================================================
    Preview
    ==================================================
    */

    renderPreviewContent() {

      if (
        !this.previewElement
      ) {

        return;
      }


      const value =
        this.getValue();


      if (
        this.mode ===
        "number"
      ) {

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

        this.previewElement.innerHTML =
          value.valid
            ? `目前答案：<strong>${value.html}</strong>`
            : "目前尚未完成標準形式。";


        return;
      }


      this.previewElement.innerHTML =
        value.valid
          ? `目前答案：<strong>${value.html}</strong>`
          : "目前尚未完成多項式。";
    }


    /*
    ==================================================
    Events
    ==================================================
    */

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
  Options
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
      },

      baseOptions:
        Array.isArray(
          options.baseOptions
        )
          ? [
              ...options.baseOptions
            ]
          : [
              ...defaults.baseOptions
            ],

      exponentOptions:
        Array.isArray(
          options.exponentOptions
        )
          ? [
              ...options.exponentOptions
            ]
          : [
              ...defaults.exponentOptions
            ],

      polynomialExponentOptions:
        Array.isArray(
          options.polynomialExponentOptions
        )
          ? [
              ...options.polynomialExponentOptions
            ]
          : [
              ...defaults.polynomialExponentOptions
            ]
    };
  }


  /*
  ==================================================
  分數
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


    return (
      a ||
      1
    );
  }


  function normalizeFraction(
    numerator,
    denominator =
      1
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
      denominator ===
      0
    ) {

      return {

        numerator,

        denominator:
          0
      };
    }


    if (
      numerator ===
      0
    ) {

      return {

        numerator:
          0,

        denominator:
          1
      };
    }


    if (
      denominator <
      0
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
      coefficient ===
        null ||
      coefficient ===
        undefined
    ) {

      return null;
    }


    if (
      typeof coefficient ===
      "number"
    ) {

      let value =
        normalizeFraction(
          coefficient,
          1
        );


      if (
        sign !==
        undefined
      ) {

        value =
          normalizeFraction(
            Math.abs(
              value.numerator
            ) *
            (
              Number(
                sign
              ) <
              0
                ? -1
                : 1
            ),
            value.denominator
          );
      }


      return value;
    }


    if (
      typeof coefficient ===
      "object"
    ) {

      if (
        coefficient.numerator ===
          null ||
        coefficient.numerator ===
          undefined ||
        coefficient.numerator ===
          ""
      ) {

        return null;
      }


      let value =
        normalizeFraction(
          Number(
            coefficient.numerator
          ),
          coefficient.denominator ===
            null ||
          coefficient.denominator ===
            undefined ||
          coefficient.denominator ===
            ""
            ? 1
            : Number(
                coefficient.denominator
              )
        );


      if (
        sign !==
        undefined
      ) {

        value =
          normalizeFraction(
            Math.abs(
              value.numerator
            ) *
            (
              Number(
                sign
              ) <
              0
                ? -1
                : 1
            ),
            value.denominator
          );
      }


      return value;
    }


    return null;
  }


  function fractionToCompatibleCoefficient(
    fraction
  ) {

    const value =
      normalizeFraction(
        fraction.numerator,
        fraction.denominator
      );


    if (
      value.denominator ===
      1
    ) {

      return value.numerator;
    }


    return {

      numerator:
        value.numerator,

      denominator:
        value.denominator
    };
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

        numerator:
          coefficient.numerator,

        denominator:
          coefficient.denominator
      };
    }


    return coefficient;
  }


  function isCoefficientEmpty(
    coefficient
  ) {

    if (
      coefficient ===
        null ||
      coefficient ===
        undefined
    ) {

      return true;
    }


    if (
      typeof coefficient ===
      "object"
    ) {

      return (
        coefficient.numerator ===
          null ||
        coefficient.numerator ===
          undefined ||
        coefficient.numerator ===
          ""
      );
    }


    return false;
  }


  /*
  ==================================================
  多項式標準化
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


    terms.forEach(
      (term) => {

        if (
          isCoefficientEmpty(
            term.coefficient
          )
        ) {

          return;
        }


        const exponent =
          Number(
            term.exponent
          );


        const coefficient =
          coefficientToFraction(
            term.coefficient,
            term.sign
          );


        if (
          !coefficient ||
          coefficient.denominator ===
            0
        ) {

          return;
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
    );


    return Array
      .from(
        map.entries()
      )
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
        (term) =>
          term.coefficient.numerator !==
          0
      )
      .sort(
        (
          a,
          b
        ) =>
          b.exponent -
          a.exponent
      );
  }


  function normalizePolynomialTerms(
    terms
  ) {

    return normalizePolynomialTermsAsFractions(
      terms
    )
      .map(
        (term) => ({

          exponent:
            term.exponent,

          coefficient:
            fractionToCompatibleCoefficient(
              term.coefficient
            )
        })
      );
  }


  /*
  ==================================================
  多項式 HTML
  ==================================================
  */

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
      value.denominator ===
      1
    ) {

      return String(
        value.numerator
      );
    }


    return (
      `<span class="expression-input__inline-fraction">` +
        `<span>${value.numerator}</span>` +
        `<span>${value.denominator}</span>` +
      `</span>`
    );
  }


  function polynomialTermToHtml(
    term,
    variable =
      "x",
    options =
      {}
  ) {

    const coefficient =
      coefficientToFraction(
        term.coefficient,
        term.sign
      );


    if (
      !coefficient
    ) {

      return "";
    }


    const negative =
      coefficient.numerator <
      0;


    const absolute =
      normalizeFraction(
        Math.abs(
          coefficient.numerator
        ),
        coefficient.denominator
      );


    const exponent =
      Number(
        term.exponent
      );


    const prefix =
      options.isFirst &&
      negative
        ? "−"
        : "";


    if (
      exponent ===
      0
    ) {

      return (
        prefix +
        fractionToHtml(
          absolute
        )
      );
    }


    const isOne =
      absolute.numerator ===
        1 &&
      absolute.denominator ===
        1;


    const coefficientHtml =
      isOne &&
      options.omitCoefficientOne !==
        false
        ? ""
        : fractionToHtml(
            absolute
          );


    const exponentHtml =
      exponent ===
        1
        ? ""
        : `<sup>${exponent}</sup>`;


    return (
      prefix +
      coefficientHtml +
      escapeHtml(
        variable
      ) +
      exponentHtml
    );
  }


  function polynomialTermsToHtml(
    terms,
    variable =
      "x",
    options =
      {}
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
            index ===
            0
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


          const isOne =
            absolute.numerator ===
              1 &&
            absolute.denominator ===
              1;


          const coefficientHtml =
            isOne &&
            options.omitCoefficientOne !==
              false
              ? ""
              : fractionToHtml(
                  absolute
                );


          return (
            sign +
            coefficientHtml +
            variable +
            (
              term.exponent ===
              1
                ? ""
                : `<sup>${term.exponent}</sup>`
            )
          );
        }
      )
      .join(
        ""
      );
  }


  function polynomialTermsToPlain(
    terms,
    variable =
      "x"
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
            index ===
            0
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


          const coefficient =
            absolute.denominator ===
              1
              ? String(
                  absolute.numerator
                )
              : `${absolute.numerator}/${absolute.denominator}`;


          if (
            term.exponent ===
            0
          ) {

            return (
              sign +
              coefficient
            );
          }


          const omitOne =
            absolute.numerator ===
              1 &&
            absolute.denominator ===
              1;


          return (
            sign +
            (
              omitOne
                ? ""
                : coefficient
            ) +
            variable +
            (
              term.exponent ===
              1
                ? ""
                : `^${term.exponent}`
            )
          );
        }
      )
      .join(
        ""
      );
  }


  /*
  ==================================================
  比較多項式
  ==================================================
  */

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
      ) => {

        return (
          term.exponent ===
            b[index].exponent &&

          term.coefficient.numerator ===
            b[index].coefficient.numerator &&

          term.coefficient.denominator ===
            b[index].coefficient.denominator
        );
      }
    );
  }


  /*
  ==================================================
  指數工具
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
      .split(
        ""
      )
      .map(
        (character) =>
          map[
            character
          ] ||
          character
      )
      .join(
        ""
      );
  }


  function termsToHtml(
    terms,
    operator =
      "×",
    omitExponentOne =
      true
  ) {

    return terms
      .map(
        (term) => {

          if (
            term.exponent ===
              1 &&
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
    operator =
      "×"
  ) {

    return terms
      .map(
        (term) =>
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
      (term) => {

        map.set(
          Number(
            term.base
          ),
          (
            map.get(
              Number(
                term.base
              )
            ) ||
            0
          ) +
          Number(
            term.exponent
          )
        );
      }
    );


    return Array
      .from(
        map.entries()
      )
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
          a,
          b
        ) =>
          a.base -
          b.base
      );
  }


  /*
  ==================================================
  HTML escape
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


  /*
  ==================================================
  對外公開
  ==================================================
  */

  window.ExpressionInput =
    ExpressionInput;


  window.ExpressionInputUtils = {

    gcd,

    normalizeFraction,

    addFractions,

    multiplyFraction,

    coefficientToFraction,

    normalizePolynomialTerms,

    normalizePolynomialTermsAsFractions,

    polynomialTermToHtml,

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
