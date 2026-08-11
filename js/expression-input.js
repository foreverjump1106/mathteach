/*
==================================================
數學遊戲樂園：通用數學答案輸入器
檔案位置：js/expression-input.js

版本：2.0
==================================================

原有功能完整保留：
1. number
   一般數字答案

2. expression
   指數式／標準分解式
   例如：
   2² × 3³

新增功能：
3. polynomial
   多項式答案
   例如：
   4x² + 12x + 9

設計原則：
- 舊遊戲不需要修改
- 舊 API 保持相容
- polynomial 為新增功能
- 可取得結構化答案
- 可進行多項式等價比較

適用：
- 質因數分解
- 指數律
- 乘法公式
- 多項式加減
- 多項式乘除
- 後續因式分解等遊戲
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

    mountId: "",

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

    baseOptions: [
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

    exponentOptions: [
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

    polynomialExponentOptions: [
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

    requireDescendingPowers:
      false,

    disallowDuplicatePowers:
      false,

    omitPolynomialCoefficientOne:
      true,


    /*
    --------------------------------------------------
    主題
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
    文字
    --------------------------------------------------
    */

    labels: {

      numberMode:
        "答案乘開",

      expressionMode:
        "標準形式",

      polynomialMode:
        "多項式",

      numberLabel:
        "請輸入乘開後的答案",

      expressionLabel:
        "請輸入指數式",

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
        "選擇次方",

      polynomialSignLabel:
        "正負號",

      polynomialEditLabel:
        "編輯多項式"
    },


    /*
    --------------------------------------------------
    回呼
    --------------------------------------------------
    */

    onChange:
      null,

    onModeChange:
      null
  };


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


      if (
        !this.options.allowNumber &&
        !this.options.allowExpression &&
        !this.options.allowPolynomial
      ) {

        throw new Error(
          "ExpressionInput 至少必須啟用一種作答模式。"
        );
      }


      /*
      --------------------------------------------------
      指數式資料
      --------------------------------------------------
      */

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


      /*
      --------------------------------------------------
      多項式資料
      --------------------------------------------------
      */

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
    建立
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
    模式按鈕
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

      const modes =
        [];


      if (
        this.options.allowNumber
      ) {

        modes.push(
          "number"
        );
      }


      if (
        this.options.allowExpression
      ) {

        modes.push(
          "expression"
        );
      }


      if (
        this.options.allowPolynomial
      ) {

        modes.push(
          "polynomial"
        );
      }


      return modes;
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
    一般數字 Panel
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


      this.numberPanel.appendChild(
        label
      );


      this.numberPanel.appendChild(
        this.numberInput
      );


      this.root.appendChild(
        this.numberPanel
      );
    }


    /*
    ==================================================
    指數式 Panel
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


      this.expressionPanel.appendChild(
        label
      );


      this.expressionPanel.appendChild(
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


    /*
    ==================================================
    指數式：底數
    ==================================================
    */

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
        (
          base
        ) => {

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


    /*
    ==================================================
    指數式：指數
    ==================================================
    */

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
        (
          exponent
        ) => {

          const label =
            exponent === 1 &&
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


    /*
    ==================================================
    指數式：編輯
    ==================================================
    */

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
    多項式 Panel
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


      this.polynomialPanel.appendChild(
        label
      );


      this.polynomialPanel.appendChild(
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
    多項式：正負號
    ==================================================
    */

    renderPolynomialSignControls() {

      const group =
        this.createPolynomialControlGroup(
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
    多項式：係數
    ==================================================
    */

    renderPolynomialCoefficientControls() {

      const group =
        this.createPolynomialControlGroup(
          this.options.labels.polynomialCoefficientLabel
        );


      const row =
        group.querySelector(
          ".expression-input__button-row"
        );


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

          this.readPolynomialCoefficientInput();
        }
      );


      row.appendChild(
        this.polynomialCoefficientInput
      );


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
        (
          coefficient
        ) => {

          row.appendChild(

            this.createKeyButton(

              String(
                coefficient
              ),

              () => {

                this.setPolynomialCoefficient(
                  coefficient
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
    多項式：次方
    ==================================================
    */

    renderPolynomialExponentControls() {

      const group =
        this.createPolynomialControlGroup(
          this.options.labels.polynomialExponentLabel
        );


      const row =
        group.querySelector(
          ".expression-input__button-row"
        );


      this.options
        .polynomialExponentOptions
        .forEach(
          (
            exponent
          ) => {

            let label;


            if (
              exponent ===
              0
            ) {

              label =
                "常數";

            } else if (
              exponent ===
              1
            ) {

              label =
                this.options
                  .polynomialVariable;

            } else {

              label =
                (
                  this.options
                    .polynomialVariable +

                  toSuperscript(
                    exponent
                  )
                );
            }


            row.appendChild(

              this.createKeyButton(

                label,

                () => {

                  this.setPolynomialExponent(
                    Number(
                      exponent
                    )
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
    多項式：編輯
    ==================================================
    */

    renderPolynomialEditControls() {

      const group =
        this.createPolynomialControlGroup(
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
    共用控制群組
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


      group.appendChild(
        heading
      );


      group.appendChild(
        row
      );


      return group;
    }


    createPolynomialControlGroup(
      title
    ) {

      const group =
        this.createControlGroup(
          title
        );


      group.classList.add(
        "expression-input__polynomial-control-group"
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
        `expression-input__key ${extraClass}`
          .trim();


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

            ? `目前答案：<strong>${escapeHtml(
                value.raw
              )}</strong>`

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

            : "目前尚未完成指數式。";


        return;
      }


      this.previewElement.innerHTML =
        value.valid

          ? `目前答案：<strong>${value.html}</strong>`

          : "目前尚未完成多項式。";
    }


    /*
    ==================================================
    模式
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


      if (
        ![
          "number",
          "expression",
          "polynomial"
        ].includes(
          mode
        )
      ) {

        return;
      }


      this.mode =
        mode;


      this.clearMessage();

      this.syncPanels();

      this.syncPolynomialCoefficientField();

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


      if (
        this.numberModeButton
      ) {

        this.numberModeButton
          .classList
          .toggle(
            "active",
            this.mode ===
              "number"
          );
      }


      if (
        this.expressionModeButton
      ) {

        this.expressionModeButton
          .classList
          .toggle(
            "active",
            this.mode ===
              "expression"
          );
      }


      if (
        this.polynomialModeButton
      ) {

        this.polynomialModeButton
          .classList
          .toggle(
            "active",
            this.mode ===
              "polynomial"
          );
      }
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
        this.options
          .disallowDuplicateBases
      ) {

        const duplicate =
          this.terms.some(
            (
              term,
              index
            ) => {

              return (
                index !==
                  this.activeTermIndex &&
                term.base ===
                  base
              );
            }
          );


        if (
          duplicate
        ) {

          this.showMessage(
            "相同底數不可重複，請調整原本那一項的指數。"
          );

          return;
        }
      }


      if (
        this.options
          .requireAscendingBases &&
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
        let index =
          this.activeTermIndex -
          1;

        index >=
          0;

        index--
      ) {

        if (
          this.terms[
            index
          ].base !==
          null
        ) {

          return this.terms[
            index
          ].base;
        }
      }


      return null;
    }


    getNextBase() {

      for (
        let index =
          this.activeTermIndex +
          1;

        index <
          this.terms.length;

        index++
      ) {

        if (
          this.terms[
            index
          ].base !==
          null
        ) {

          return this.terms[
            index
          ].base;
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


      this.terms.push({
        base:
          null,

        exponent:
          1
      });


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

        this.terms[
          0
        ] = {

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


            this.expressionDisplay
              .appendChild(
                operator
              );
          }


          const termButton =
            document.createElement(
              "button"
            );


          termButton.type =
            "button";


          termButton.className =
            "expression-input__term";


          if (
            index ===
            this.activeTermIndex
          ) {

            termButton.classList.add(
              "active"
            );
          }


          termButton.addEventListener(
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


            termButton.appendChild(
              placeholder
            );

          } else {

            const baseElement =
              document.createElement(
                "span"
              );


            baseElement.className =
              "expression-input__base";


            baseElement.textContent =
              term.base;


            termButton.appendChild(
              baseElement
            );


            if (
              !(
                term.exponent ===
                  1 &&
                this.options
                  .omitExponentOne
              )
            ) {

              const exponentElement =
                document.createElement(
                  "span"
                );


              exponentElement.className =
                "expression-input__exponent";


              exponentElement.textContent =
                toSuperscript(
                  term.exponent
                );


              termButton.appendChild(
                exponentElement
              );
            }
          }


          this.expressionDisplay
            .appendChild(
              termButton
            );
        }
      );


      this.renderPreviewContent();
    }


    /*
    ==================================================
    多項式操作
    ==================================================
    */

    createEmptyPolynomialTerm() {

      return {

        sign:
          1,

        coefficient:
          null,

        variable:
          this.options
            ? this.options
                .polynomialVariable
            : "x",

        exponent:
          2
      };
    }


    setPolynomialSign(
      sign
    ) {

      const normalizedSign =
        Number(
          sign
        ) <
        0
          ? -1
          : 1;


      this.polynomialTerms[
        this.activePolynomialTermIndex
      ].sign =
        normalizedSign;


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

        this.showMessage(
          "係數必須是整數。"
        );

        return;
      }


      if (
        value <
          0
      ) {

        if (
          !this.options
            .allowNegativePolynomialCoefficient
        ) {

          this.showMessage(
            "此題型不允許負係數。"
          );

          return;
        }


        this.polynomialTerms[
          this.activePolynomialTermIndex
        ].sign =
          -1;


        this.polynomialTerms[
          this.activePolynomialTermIndex
        ].coefficient =
          Math.abs(
            value
          );

      } else {

        if (
          value ===
            0 &&
          !this.options
            .allowZeroPolynomialCoefficient
        ) {

          this.showMessage(
            "係數不可為 0。"
          );

          return;
        }


        this.polynomialTerms[
          this.activePolynomialTermIndex
        ].coefficient =
          value;
      }


      this.clearMessage();

      this.syncPolynomialCoefficientField();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    readPolynomialCoefficientInput() {

      if (
        !this.polynomialCoefficientInput
      ) {

        return;
      }


      const raw =
        this.polynomialCoefficientInput
          .value
          .trim();


      if (
        raw ===
        ""
      ) {

        this.polynomialTerms[
          this.activePolynomialTermIndex
        ].coefficient =
          null;


        this.clearMessage();

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
        !this.options
          .allowZeroPolynomialCoefficient
      ) {

        return;
      }


      if (
        value <
          0
      ) {

        if (
          !this.options
            .allowNegativePolynomialCoefficient
        ) {

          return;
        }


        this.polynomialTerms[
          this.activePolynomialTermIndex
        ].sign =
          -1;


        this.polynomialTerms[
          this.activePolynomialTermIndex
        ].coefficient =
          Math.abs(
            value
          );

      } else {

        this.polynomialTerms[
          this.activePolynomialTermIndex
        ].coefficient =
          value;
      }


      this.clearMessage();

      this.renderPolynomialTerms();

      this.emitChange();
    }


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

        this.showMessage(
          "次方必須是 0 以上的整數。"
        );

        return;
      }


      if (
        this.options
          .disallowDuplicatePowers
      ) {

        const duplicate =
          this.polynomialTerms
            .some(
              (
                term,
                index
              ) => {

                return (
                  index !==
                    this.activePolynomialTermIndex &&
                  term.coefficient !==
                    null &&
                  term.exponent ===
                    value
                );
              }
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
        this.options
          .requireDescendingPowers &&
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
        let index =
          this.activePolynomialTermIndex -
          1;

        index >=
          0;

        index--
      ) {

        const term =
          this.polynomialTerms[
            index
          ];


        if (
          term.coefficient !==
          null
        ) {

          return term.exponent;
        }
      }


      return null;
    }


    getNextPolynomialExponent() {

      for (
        let index =
          this.activePolynomialTermIndex +
          1;

        index <
          this.polynomialTerms.length;

        index++
      ) {

        const term =
          this.polynomialTerms[
            index
          ];


        if (
          term.coefficient !==
          null
        ) {

          return term.exponent;
        }
      }


      return null;
    }


    addPolynomialTerm() {

      if (
        this.polynomialTerms.length >=
        this.options
          .maxPolynomialTerms
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

      this.syncPolynomialCoefficientField();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    deleteActivePolynomialTerm() {

      if (
        this.polynomialTerms.length ===
        1
      ) {

        this.polynomialTerms[
          0
        ] =
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

      this.syncPolynomialCoefficientField();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    resetPolynomial() {

      this.polynomialTerms = [
        this.createEmptyPolynomialTerm()
      ];


      this.activePolynomialTermIndex =
        0;


      this.clearMessage();

      this.syncPolynomialCoefficientField();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    syncPolynomialCoefficientField() {

      if (
        !this.polynomialCoefficientInput
      ) {

        return;
      }


      const term =
        this.polynomialTerms[
          this.activePolynomialTermIndex
        ];


      if (
        !term ||
        term.coefficient ===
          null
      ) {

        this.polynomialCoefficientInput.value =
          "";

        return;
      }


      this.polynomialCoefficientInput.value =
        String(
          term.coefficient
        );
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


            this.polynomialDisplay
              .appendChild(
                operator
              );
          }


          const termButton =
            document.createElement(
              "button"
            );


          termButton.type =
            "button";


          termButton.className =
            "expression-input__polynomial-term";


          if (
            index ===
            this.activePolynomialTermIndex
          ) {

            termButton.classList.add(
              "active"
            );
          }


          termButton.addEventListener(
            "click",
            () => {

              this.activePolynomialTermIndex =
                index;


              this.clearMessage();

              this.syncPolynomialCoefficientField();

              this.renderPolynomialTerms();
            }
          );


          if (
            term.coefficient ===
            null
          ) {

            const placeholder =
              document.createElement(
                "span"
              );


            placeholder.className =
              "expression-input__placeholder";


            placeholder.textContent =
              "輸入一項";


            termButton.appendChild(
              placeholder
            );

          } else {

            termButton.innerHTML =
              polynomialTermToHtml(
                term,
                this.options
                  .polynomialVariable,
                {
                  isFirst:
                    index ===
                    0,

                  omitCoefficientOne:
                    this.options
                      .omitPolynomialCoefficientOne
                }
              );
          }


          this.polynomialDisplay
            .appendChild(
              termButton
            );
        }
      );


      this.renderPreviewContent();
    }


    /*
    ==================================================
    取得一般數字
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
    取得指數式
    ==================================================
    */

    getExpressionValue() {

      const incomplete =
        this.terms.some(
          (
            term
          ) =>
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
            this.options
              .omitExponentOne
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
    取得多項式
    ==================================================
    */

    getPolynomialValue() {

      const incomplete =
        this.polynomialTerms
          .some(
            (
              term
            ) =>
              term.coefficient ===
              null
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
            this.options
              .polynomialVariable,

          terms:
            this.clonePolynomialTerms(),

          normalizedTerms:
            [],

          html:
            "",

          plain:
            ""
        };
      }


      const normalizedTerms =
        normalizePolynomialTerms(
          this.polynomialTerms
        );


      return {

        mode:
          "polynomial",

        valid:
          normalizedTerms.length >
          0,

        variable:
          this.options
            .polynomialVariable,

        terms:
          this.clonePolynomialTerms(),

        normalizedTerms,

        html:
          polynomialTermsToHtml(
            normalizedTerms,
            this.options
              .polynomialVariable,
            {
              omitCoefficientOne:
                this.options
                  .omitPolynomialCoefficientOne
            }
          ),

        plain:
          polynomialTermsToPlain(
            normalizedTerms,
            this.options
              .polynomialVariable
          )
      };
    }


    /*
    ==================================================
    getValue
    ==================================================
    */

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
    validate
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
            "請輸入有效的一般數字答案。"
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
        this.options
          .requireDescendingPowers
      ) {

        const terms =
          value.terms;


        for (
          let index =
            1;

          index <
            terms.length;

          index++
        ) {

          if (
            terms[
              index
            ].exponent >=
            terms[
              index -
              1
            ].exponent
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
        this.options
          .disallowDuplicatePowers
      ) {

        const powers =
          value.terms.map(
            (
              term
            ) =>
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
    設定一般數字
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
    設定指數式
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


      const normalized =
        terms.map(
          (
            term
          ) => ({

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


      const invalid =
        normalized.some(
          (
            term
          ) =>
            !Number.isInteger(
              term.base
            ) ||
            !Number.isInteger(
              term.exponent
            )
        );


      if (
        invalid
      ) {

        this.showMessage(
          "指數式資料格式錯誤。"
        );

        return;
      }


      if (
        normalized.length >
        this.options.maxTerms
      ) {

        this.showMessage(
          `最多可輸入 ${this.options.maxTerms} 項。`
        );

        return;
      }


      this.terms =
        normalized;


      this.activeTermIndex =
        0;


      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();
    }


    /*
    ==================================================
    設定多項式
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


      if (
        terms.length >
        this.options
          .maxPolynomialTerms
      ) {

        this.showMessage(
          `最多可輸入 ${this.options.maxPolynomialTerms} 項。`
        );

        return;
      }


      const normalized =
        [];


      for (
        const term of
        terms
      ) {

        let coefficient;


        if (
          term.coefficient ===
            null ||
          term.coefficient ===
            undefined
        ) {

          this.showMessage(
            "多項式資料格式錯誤。"
          );

          return;
        }


        coefficient =
          Number(
            term.coefficient
          );


        let sign =
          term.sign ===
            undefined

            ? (
                coefficient <
                0
                  ? -1
                  : 1
              )

            : (
                Number(
                  term.sign
                ) <
                0
                  ? -1
                  : 1
              );


        coefficient =
          Math.abs(
            coefficient
          );


        const exponent =
          Number(
            term.exponent
          );


        if (
          !Number.isInteger(
            coefficient
          ) ||
          !Number.isInteger(
            exponent
          ) ||
          exponent <
            0
        ) {

          this.showMessage(
            "多項式資料格式錯誤。"
          );

          return;
        }


        normalized.push({

          sign,

          coefficient,

          variable:
            this.options
              .polynomialVariable,

          exponent
        });
      }


      this.polynomialTerms =
        normalized;


      this.activePolynomialTermIndex =
        0;


      this.clearMessage();

      this.syncPolynomialCoefficientField();

      this.renderPolynomialTerms();

      this.emitChange();
    }


    /*
    ==================================================
    舊功能：整數轉標準分解式
    ==================================================
    */

    setExpressionFromNumber(
      value
    ) {

      const number =
        Number(
          value
        );


      if (
        !Number.isInteger(
          number
        ) ||
        number <=
          0
      ) {

        this.showMessage(
          "只能將正整數轉成標準分解式。"
        );

        return false;
      }


      const terms =
        numberToPrimeFactorTerms(
          number
        );


      if (
        terms.length >
        this.options.maxTerms
      ) {

        this.showMessage(
          "轉換後的項目過多。"
        );

        return false;
      }


      this.setExpressionTerms(
        terms
      );


      return true;
    }


    syncNumberToExpression() {

      const value =
        this.getNumberValue();


      if (
        !value.valid ||
        !Number.isInteger(
          value.number
        ) ||
        value.number <=
          0
      ) {

        this.showMessage(
          "請先輸入正整數。"
        );

        return false;
      }


      return this.setExpressionFromNumber(
        value.number
      );
    }


    syncExpressionToNumber() {

      const value =
        this.getExpressionValue();


      if (
        !value.valid
      ) {

        this.showMessage(
          "請先完成指數式。"
        );

        return false;
      }


      if (
        !Number.isSafeInteger(
          value.number
        )
      ) {

        this.showMessage(
          "乘開後的數字太大，建議保留標準形式。"
        );

        return false;
      }


      this.numberInput.value =
        String(
          value.number
        );


      this.clearMessage();

      this.renderPreviewContent();

      this.emitChange();


      return true;
    }


    /*
    ==================================================
    指數式整理
    ==================================================
    */

    sortTermsAscending() {

      const value =
        this.getExpressionValue();


      if (
        !value.valid
      ) {

        this.showMessage(
          "請先完成所有底數。"
        );

        return false;
      }


      this.terms.sort(
        (
          first,
          second
        ) =>
          first.base -
          second.base
      );


      this.activeTermIndex =
        0;


      this.renderExpressionTerms();

      this.emitChange();


      return true;
    }


    mergeDuplicateBases() {

      const value =
        this.getExpressionValue();


      if (
        !value.valid
      ) {

        this.showMessage(
          "請先完成所有底數。"
        );

        return false;
      }


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


    /*
    ==================================================
    多項式整理
    ==================================================
    */

    sortPolynomialDescending() {

      const value =
        this.getPolynomialValue();


      if (
        !value.valid
      ) {

        this.showMessage(
          "請先完成多項式。"
        );

        return false;
      }


      this.polynomialTerms.sort(
        (
          first,
          second
        ) =>
          second.exponent -
          first.exponent
      );


      this.activePolynomialTermIndex =
        0;


      this.syncPolynomialCoefficientField();

      this.renderPolynomialTerms();

      this.emitChange();


      return true;
    }


    mergePolynomialLikeTerms() {

      const value =
        this.getPolynomialValue();


      if (
        !value.valid
      ) {

        this.showMessage(
          "請先完成多項式。"
        );

        return false;
      }


      const normalized =
        normalizePolynomialTerms(
          this.polynomialTerms
        );


      this.polynomialTerms =
        normalized.map(
          (
            term
          ) => ({

            sign:
              term.coefficient <
                0
                ? -1
                : 1,

            coefficient:
              Math.abs(
                term.coefficient
              ),

            variable:
              this.options
                .polynomialVariable,

            exponent:
              term.exponent
          })
        );


      if (
        this.polynomialTerms.length ===
        0
      ) {

        this.polynomialTerms = [
          {
            sign:
              1,

            coefficient:
              0,

            variable:
              this.options
                .polynomialVariable,

            exponent:
              0
          }
        ];
      }


      this.activePolynomialTermIndex =
        0;


      this.syncPolynomialCoefficientField();

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


      this.clearMessage();

      this.renderExpressionTerms();

      this.renderPolynomialTerms();

      this.syncPolynomialCoefficientField();

      this.syncPanels();

      this.renderPreviewContent();

      this.emitModeChange();

      this.emitChange();
    }


    /*
    ==================================================
    Disabled / Visible / Focus
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
          (
            element
          ) => {

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
        "expression"
      ) {

        const terms =
          this.expressionDisplay
            .querySelectorAll(
              ".expression-input__term"
            );


        terms[
          this.activeTermIndex
        ]?.focus();


        return;
      }


      this.polynomialCoefficientInput
        ?.focus();
    }


    /*
    ==================================================
    Message
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
        (
          term
        ) => ({

          base:
            term.base,

          exponent:
            term.exponent
        })
      );
    }


    clonePolynomialTerms() {

      return this.polynomialTerms.map(
        (
          term
        ) => ({

          sign:
            term.sign,

          coefficient:
            term.coefficient,

          variable:
            this.options
              .polynomialVariable,

          exponent:
            term.exponent
        })
      );
    }


    /*
    ==================================================
    Event
    ==================================================
    */

    emitChange() {

      if (
        typeof
          this.options.onChange ===
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
        typeof
          this.options
            .onModeChange ===
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
              ...options
                .polynomialExponentOptions
            ]

          : [
              ...defaults
                .polynomialExponentOptions
            ]
    };
  }


  /*
  ==================================================
  指數工具
  ==================================================
  */

  function toSuperscript(
    value
  ) {

    const digits = {

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
        (
          character
        ) =>
          digits[
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
        (
          term
        ) => {

          const base =
            escapeHtml(
              term.base
            );


          if (
            term.exponent ===
              1 &&
            omitExponentOne
          ) {

            return base;
          }


          return (
            `${base}` +
            `<sup>${escapeHtml(
              term.exponent
            )}</sup>`
          );
        }
      )
      .join(
        ` ${escapeHtml(
          operator
        )} `
      );
  }


  function termsToPlain(
    terms,
    operator =
      "×"
  ) {

    return terms
      .map(
        (
          term
        ) =>
          `${term.base}^${term.exponent}`
      )
      .join(
        operator
      );
  }


  function termsToSuperscriptText(
    terms,
    operator =
      "×",
    omitExponentOne =
      true
  ) {

    return terms
      .map(
        (
          term
        ) => {

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
            String(
              term.base
            ) +
            toSuperscript(
              term.exponent
            )
          );
        }
      )
      .join(
        ` ${operator} `
      );
  }


  /*
  ==================================================
  質因數工具
  ==================================================
  */

  function primeFactorize(
    value
  ) {

    let number =
      Number(
        value
      );


    if (
      !Number.isInteger(
        number
      ) ||
      number <=
        0
    ) {

      return {};
    }


    const factorMap =
      {};


    let divisor =
      2;


    while (
      divisor *
        divisor <=
      number
    ) {

      while (
        number %
          divisor ===
        0
      ) {

        factorMap[
          divisor
        ] =
          (
            factorMap[
              divisor
            ] ||
            0
          ) +
          1;


        number /=
          divisor;
      }


      divisor =
        divisor ===
          2

          ? 3

          : divisor +
            2;
    }


    if (
      number >
      1
    ) {

      factorMap[
        number
      ] =
        (
          factorMap[
            number
          ] ||
          0
        ) +
        1;
    }


    return factorMap;
  }


  function numberToPrimeFactorTerms(
    value
  ) {

    const number =
      Number(
        value
      );


    if (
      !Number.isInteger(
        number
      ) ||
      number <=
        0
    ) {

      return [];
    }


    if (
      number ===
      1
    ) {

      return [
        {
          base:
            1,

          exponent:
            1
        }
      ];
    }


    return Object.entries(
      primeFactorize(
        number
      )
    )
      .map(
        (
          [
            base,
            exponent
          ]
        ) => ({

          base:
            Number(
              base
            ),

          exponent:
            Number(
              exponent
            )
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
      (
        term
      ) => {

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


    return Array.from(
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
          first,
          second
        ) =>
          first.base -
          second.base
      );
  }


  function isPrime(
    value
  ) {

    const number =
      Number(
        value
      );


    if (
      !Number.isInteger(
        number
      ) ||
      number <
        2
    ) {

      return false;
    }


    if (
      number ===
      2
    ) {

      return true;
    }


    if (
      number %
        2 ===
      0
    ) {

      return false;
    }


    for (
      let divisor =
        3;

      divisor *
        divisor <=
        number;

      divisor +=
        2
    ) {

      if (
        number %
          divisor ===
        0
      ) {

        return false;
      }
    }


    return true;
  }


  function isStandardPrimeFactorization(
    terms
  ) {

    if (
      !Array.isArray(
        terms
      ) ||
      terms.length ===
        0
    ) {

      return false;
    }


    let previousBase =
      0;


    for (
      const term of
      terms
    ) {

      if (
        !Number.isInteger(
          term.base
        ) ||
        !Number.isInteger(
          term.exponent
        ) ||
        term.exponent <
          1 ||
        !isPrime(
          term.base
        ) ||
        term.base <=
          previousBase
      ) {

        return false;
      }


      previousBase =
        term.base;
    }


    return true;
  }


  function areTermsEqual(
    firstTerms,
    secondTerms,
    options = {}
  ) {

    let first =
      Array.isArray(
        firstTerms
      )
        ? firstTerms.map(
            (
              term
            ) => ({

              base:
                Number(
                  term.base
                ),

              exponent:
                Number(
                  term.exponent
                )
            })
          )
        : [];


    let second =
      Array.isArray(
        secondTerms
      )
        ? secondTerms.map(
            (
              term
            ) => ({

              base:
                Number(
                  term.base
                ),

              exponent:
                Number(
                  term.exponent
                )
            })
          )
        : [];


    if (
      options.mergeDuplicates
    ) {

      first =
        mergeTermsByBase(
          first
        );


      second =
        mergeTermsByBase(
          second
        );
    }


    if (
      options.ignoreOrder
    ) {

      first.sort(
        (
          a,
          b
        ) =>
          a.base -
          b.base
      );


      second.sort(
        (
          a,
          b
        ) =>
          a.base -
          b.base
      );
    }


    if (
      first.length !==
      second.length
    ) {

      return false;
    }


    return first.every(
      (
        term,
        index
      ) =>
        term.base ===
          second[
            index
          ].base &&
        term.exponent ===
          second[
            index
          ].exponent
    );
  }


  function areExpressionValuesEqual(
    firstTerms,
    secondTerms
  ) {

    return (
      evaluateTerms(
        firstTerms
      ) ===
      evaluateTerms(
        secondTerms
      )
    );
  }


  function termsToFactorMap(
    terms
  ) {

    const result =
      {};


    terms.forEach(
      (
        term
      ) => {

        result[
          term.base
        ] =
          (
            result[
              term.base
            ] ||
            0
          ) +
          Number(
            term.exponent
          );
      }
    );


    return result;
  }


  /*
  ==================================================
  多項式工具
  ==================================================
  */

  function normalizePolynomialTerm(
    term
  ) {

    let coefficient =
      Number(
        term.coefficient
      );


    const exponent =
      Number(
        term.exponent
      );


    if (
      !Number.isFinite(
        coefficient
      ) ||
      !Number.isInteger(
        exponent
      ) ||
      exponent <
        0
    ) {

      return null;
    }


    if (
      term.sign !==
        undefined
    ) {

      coefficient =
        Math.abs(
          coefficient
        ) *
        (
          Number(
            term.sign
          ) <
          0
            ? -1
            : 1
        );
    }


    return {

      coefficient,

      exponent
    };
  }


  function normalizePolynomialTerms(
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
      const sourceTerm of
      terms
    ) {

      const term =
        normalizePolynomialTerm(
          sourceTerm
        );


      if (
        !term
      ) {

        continue;
      }


      map.set(

        term.exponent,

        (
          map.get(
            term.exponent
          ) ||
          0
        ) +
        term.coefficient
      );
    }


    return Array.from(
      map.entries()
    )
      .map(
        (
          [
            exponent,
            coefficient
          ]
        ) => ({

          coefficient,

          exponent:
            Number(
              exponent
            )
        })
      )
      .filter(
        (
          term
        ) =>
          term.coefficient !==
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


  function polynomialTermToHtml(
    term,
    variable =
      "x",
    options = {}
  ) {

    const coefficient =
      Math.abs(
        Number(
          term.coefficient
        )
      );


    const sign =
      Number(
        term.sign
      ) <
      0
        ? -1
        : 1;


    const exponent =
      Number(
        term.exponent
      );


    const isFirst =
      options.isFirst ===
      true;


    const omitCoefficientOne =
      options.omitCoefficientOne !==
      false;


    let prefix =
      "";


    if (
      isFirst &&
      sign <
        0
    ) {

      prefix =
        "−";
    }


    if (
      exponent ===
      0
    ) {

      return (
        prefix +
        escapeHtml(
          coefficient
        )
      );
    }


    const coefficientText =
      coefficient ===
        1 &&
      omitCoefficientOne

        ? ""

        : escapeHtml(
            coefficient
          );


    const variableText =
      escapeHtml(
        variable
      );


    const exponentText =
      exponent ===
        1

        ? ""

        : `<sup>${escapeHtml(
            exponent
          )}</sup>`;


    return (
      prefix +
      coefficientText +
      variableText +
      exponentText
    );
  }


  function polynomialTermsToHtml(
    terms,
    variable =
      "x",
    options = {}
  ) {

    const normalized =
      normalizePolynomialTerms(
        terms
      );


    if (
      normalized.length ===
      0
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
            term.coefficient <
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


          const coefficient =
            Math.abs(
              term.coefficient
            );


          if (
            term.exponent ===
            0
          ) {

            return (
              sign +
              escapeHtml(
                coefficient
              )
            );
          }


          const coefficientText =
            coefficient ===
              1 &&
            options
              .omitCoefficientOne !==
              false

              ? ""

              : escapeHtml(
                  coefficient
                );


          const exponentText =
            term.exponent ===
              1

              ? ""

              : `<sup>${escapeHtml(
                  term.exponent
                )}</sup>`;


          return (
            sign +
            coefficientText +
            escapeHtml(
              variable
            ) +
            exponentText
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
      normalizePolynomialTerms(
        terms
      );


    if (
      normalized.length ===
      0
    ) {

      return "0";
    }


    return normalized
      .map(
        (
          term,
          index
        ) => {

          const coefficient =
            term.coefficient;


          const absolute =
            Math.abs(
              coefficient
            );


          const sign =
            index ===
              0

              ? (
                  coefficient <
                    0
                    ? "-"
                    : ""
                )

              : (
                  coefficient <
                    0
                    ? "-"
                    : "+"
                );


          if (
            term.exponent ===
            0
          ) {

            return (
              sign +
              absolute
            );
          }


          const coefficientText =
            absolute ===
              1
              ? ""
              : String(
                  absolute
                );


          const exponentText =
            term.exponent ===
              1

              ? ""

              : `^${term.exponent}`;


          return (
            sign +
            coefficientText +
            variable +
            exponentText
          );
        }
      )
      .join(
        ""
      );
  }


  function polynomialTermsToCoefficientMap(
    terms
  ) {

    const result =
      {};


    normalizePolynomialTerms(
      terms
    ).forEach(
      (
        term
      ) => {

        result[
          term.exponent
        ] =
          term.coefficient;
      }
    );


    return result;
  }


  function arePolynomialsEqual(
    firstTerms,
    secondTerms
  ) {

    const first =
      normalizePolynomialTerms(
        firstTerms
      );


    const second =
      normalizePolynomialTerms(
        secondTerms
      );


    if (
      first.length !==
      second.length
    ) {

      return false;
    }


    return first.every(
      (
        term,
        index
      ) => {

        return (
          term.exponent ===
            second[
              index
            ].exponent &&
          term.coefficient ===
            second[
              index
            ].coefficient
        );
      }
    );
  }


  /*
  ==================================================
  HTML
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
  對外
  ==================================================
  */

  window.ExpressionInput =
    ExpressionInput;


  window.ExpressionInputUtils = {

    /*
    舊功能
    */

    primeFactorize,

    numberToPrimeFactorTerms,

    evaluateTerms,

    mergeTermsByBase,

    termsToHtml,

    termsToPlain,

    termsToSuperscriptText,

    toSuperscript,

    isPrime,

    isStandardPrimeFactorization,

    areTermsEqual,

    areExpressionValuesEqual,

    termsToFactorMap,


    /*
    新增多項式功能
    */

    normalizePolynomialTerm,

    normalizePolynomialTerms,

    polynomialTermToHtml,

    polynomialTermsToHtml,

    polynomialTermsToPlain,

    polynomialTermsToCoefficientMap,

    arePolynomialsEqual
  };

})();