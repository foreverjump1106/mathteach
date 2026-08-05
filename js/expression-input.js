/*
==================================================
通用數學答案輸入器
檔案位置：js/expression-input.js
==================================================

用途：
1. 一般數字作答
2. 指數式／標準形式作答
3. 可限制底數、指數、項數與排列規則
4. 可取得結構化答案資料
5. 可套用於：
   - 質因數分解、公因數公倍數
   - 指數律
==================================================
*/

(function () {
  "use strict";

  const DEFAULT_OPTIONS = {
    mountId: "",

    defaultMode:
      "number",

    allowNumber:
      true,

    allowExpression:
      true,

    numberPlaceholder:
      "請輸入答案",

    numberInputMode:
      "numeric",

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

    theme: {
      primary:
        "#1565c0",

      light:
        "#eef7ff",

      border:
        "#90caf9"
    },

    labels: {
      numberMode:
        "答案乘開",

      expressionMode:
        "標準形式",

      numberLabel:
        "請輸入乘開後的答案",

      expressionLabel:
        "請輸入指數式",

      baseLabel:
        "選擇底數",

      exponentLabel:
        "選擇指數",

      editLabel:
        "編輯答案"
    },

    onChange:
      null,

    onModeChange:
      null
  };

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

      if (!this.mount) {
        throw new Error(
          `ExpressionInput 找不到掛載位置：${this.options.mountId}`
        );
      }

      if (
        !this.options
          .allowNumber &&
        !this.options
          .allowExpression
      ) {
        throw new Error(
          "ExpressionInput 至少必須啟用一種作答模式。"
        );
      }

      this.mode =
        this.resolveInitialMode();

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

      this.render();

      this.emitChange();
    }

    /*
    ==================================================
    決定初始模式
    ==================================================
    */

    resolveInitialMode() {
      if (
        this.options
          .defaultMode ===
          "number" &&
        this.options
          .allowNumber
      ) {
        return "number";
      }

      if (
        this.options
          .defaultMode ===
          "expression" &&
        this.options
          .allowExpression
      ) {
        return "expression";
      }

      return this.options
        .allowNumber
          ? "number"
          : "expression";
    }

    /*
    ==================================================
    建立完整元件
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
        this.options
          .theme
          .primary
      );

      this.root.style.setProperty(
        "--expression-light",
        this.options
          .theme
          .light
      );

      this.root.style.setProperty(
        "--expression-border",
        this.options
          .theme
          .border
      );

      this.mount.appendChild(
        this.root
      );

      this.renderModeSwitch();

      this.renderNumberPanel();

      this.renderExpressionPanel();

      this.renderMessage();

      this.renderPreview();

      this.syncPanels();
    }

    /*
    ==================================================
    建立模式切換按鈕
    ==================================================
    */

    renderModeSwitch() {
      if (
        !this.options
          .allowNumber ||
        !this.options
          .allowExpression
      ) {
        return;
      }

      const switcher =
        document.createElement(
          "div"
        );

      switcher.className =
        "expression-input__mode-switch";

      this.numberModeButton =
        this.createModeButton(
          "number",
          this.options
            .labels
            .numberMode
        );

      this.expressionModeButton =
        this.createModeButton(
          "expression",
          this.options
            .labels
            .expressionMode
        );

      switcher.appendChild(
        this.numberModeButton
      );

      switcher.appendChild(
        this.expressionModeButton
      );

      this.root.appendChild(
        switcher
      );
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
    建立一般數字輸入區
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
        this.options
          .labels
          .numberLabel;

      this.numberInput =
        document.createElement(
          "input"
        );

      this.numberInput.type =
        "text";

      this.numberInput.className =
        "expression-input__number-input";

      this.numberInput.placeholder =
        this.options
          .numberPlaceholder;

      this.numberInput.inputMode =
        this.options
          .numberInputMode;

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
    建立指數式輸入區
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
        this.options
          .labels
          .expressionLabel;

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
    建立底數按鍵
    ==================================================
    */

    renderBaseControls() {
      const group =
        this.createControlGroup(
          this.options
            .labels
            .baseLabel
        );

      const row =
        group.querySelector(
          ".expression-input__button-row"
        );

      this.options
        .baseOptions
        .forEach(
          (base) => {
            const button =
              this.createKeyButton(
                String(base),

                () => {
                  this.setActiveBase(
                    Number(base)
                  );
                }
              );

            row.appendChild(
              button
            );
          }
        );

      /*
      允許輸入按鍵中沒有的其他底數
      */

      if (
        this.options
          .allowCustomBase
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
                this.customBaseInput
                  .value
              );

            if (
              !Number.isFinite(
                value
              )
            ) {
              this.showMessage(
                "請輸入有效底數。"
              );

              return;
            }

            this.setActiveBase(
              value
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
    建立指數按鍵
    ==================================================
    */

    renderExponentControls() {
      const group =
        this.createControlGroup(
          this.options
            .labels
            .exponentLabel
        );

      const row =
        group.querySelector(
          ".expression-input__button-row"
        );

      this.options
        .exponentOptions
        .forEach(
          (exponent) => {
            const label =
              exponent === 1 &&
              this.options
                .omitExponentOne
                ? "1（省略）"
                : toSuperscript(
                    exponent
                  );

            const button =
              this.createKeyButton(
                label,

                () => {
                  this.setActiveExponent(
                    Number(
                      exponent
                    )
                  );
                }
              );

            row.appendChild(
              button
            );
          }
        );

      this.controls.appendChild(
        group
      );
    }

    /*
    ==================================================
    建立新增、刪除、清除按鍵
    ==================================================
    */

    renderEditControls() {
      const group =
        this.createControlGroup(
          this.options
            .labels
            .editLabel
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
    建立一組控制區
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

    /*
    ==================================================
    建立單一按鍵
    ==================================================
    */

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
    建立提示訊息區
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
    建立目前答案預覽
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
    更新目前答案預覽
    ==================================================
    */

    renderPreviewContent() {
      const value =
        this.getValue();

      if (
        this.mode ===
        "number"
      ) {
        this.previewElement.innerHTML =
          value.valid
            ? (
                "目前答案：<strong>" +
                escapeHtml(
                  value.raw
                ) +
                "</strong>"
              )
            : "目前尚未輸入答案。";

        return;
      }

      this.previewElement.innerHTML =
        value.valid
          ? (
              "目前答案：<strong>" +
              value.html +
              "</strong>"
            )
          : "目前尚未完成指數式。";
    }

    /*
    ==================================================
    切換作答模式
    ==================================================
    */

    setMode(
      mode
    ) {
      if (
        mode === "number" &&
        !this.options
          .allowNumber
      ) {
        return;
      }

      if (
        mode ===
          "expression" &&
        !this.options
          .allowExpression
      ) {
        return;
      }

      this.mode =
        mode;

      this.clearMessage();

      this.syncPanels();

      this.renderPreviewContent();

      this.emitModeChange();

      this.emitChange();
    }

    /*
    ==================================================
    同步顯示中的輸入區
    ==================================================
    */

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
    }
        /*
    ==================================================
    設定目前選取項目的底數
    ==================================================
    */

    setActiveBase(base) {

      if (!Number.isInteger(base)) {
        this.showMessage(
          "底數必須為整數。"
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

      /*
      =============================
      相同底數不可重複
      =============================
      */

      if (
        this.options.disallowDuplicateBases
      ) {

        const duplicate =
          this.terms.some(
            (term, index) => {

              return (
                index !==
                  this.activeTermIndex &&
                term.base === base
              );

            }
          );

        if (duplicate) {

          this.showMessage(
            "相同底數不可重複。"
          );

          return;

        }

      }

      /*
      =============================
      是否限制由小到大
      =============================
      */

      if (
        this.options.requireAscendingBases &&
        !this.canPlaceBaseAscending(base)
      ) {

        this.showMessage(
          "底數必須由小到大排列。"
        );

        return;

      }

      this.terms[
        this.activeTermIndex
      ].base = base;

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();

    }

    /*
    ==================================================
    是否可以依照遞增排列
    ==================================================
    */

    canPlaceBaseAscending(base) {

      const previous =
        this.getPreviousBase();

      const next =
        this.getNextBase();

      if (
        previous !== null &&
        base <= previous
      ) {
        return false;
      }

      if (
        next !== null &&
        base >= next
      ) {
        return false;
      }

      return true;

    }

    getPreviousBase() {

      for (
        let index =
          this.activeTermIndex - 1;
        index >= 0;
        index--
      ) {

        if (
          this.terms[index].base !== null
        ) {
          return this.terms[index].base;
        }

      }

      return null;

    }

    getNextBase() {

      for (
        let index =
          this.activeTermIndex + 1;
        index < this.terms.length;
        index++
      ) {

        if (
          this.terms[index].base !== null
        ) {
          return this.terms[index].base;
        }

      }

      return null;

    }

    /*
    ==================================================
    設定目前選取項目的指數
    ==================================================
    */

    setActiveExponent(exponent) {

      if (!Number.isInteger(exponent)) {

        this.showMessage(
          "指數必須是整數。"
        );

        return;

      }

      this.terms[
        this.activeTermIndex
      ].exponent = exponent;

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();

    }

    /*
    ==================================================
    新增一項
    ==================================================
    */

    addTerm() {

      if (
        this.terms.length >=
        this.options.maxTerms
      ) {

        this.showMessage(
          `最多只能 ${this.options.maxTerms} 項`
        );

        return;

      }

      this.terms.push({

        base: null,

        exponent: 1

      });

      this.activeTermIndex =
        this.terms.length - 1;

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();

    }

    /*
    ==================================================
    刪除目前項目
    ==================================================
    */

    deleteActiveTerm() {

      if (
        this.terms.length === 1
      ) {

        this.terms[0] = {

          base: null,

          exponent: 1

        };

        this.activeTermIndex = 0;

      } else {

        this.terms.splice(

          this.activeTermIndex,

          1

        );

        this.activeTermIndex =

          Math.max(

            0,

            this.activeTermIndex - 1

          );

      }

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();

    }

    /*
    ==================================================
    全部清除
    ==================================================
    */

    resetExpression() {

      this.terms = [

        {

          base: null,

          exponent: 1

        }

      ];

      this.activeTermIndex = 0;

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();

    }
        /*
    ==================================================
    畫出指數式答案
    ==================================================
    */

    renderExpressionTerms() {

      this.expressionDisplay.innerHTML =
        "";

      this.terms.forEach(
        (
          term,
          index
        ) => {

          /*
          第一項以後，自動加入乘號
          */

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

            this.expressionDisplay
              .appendChild(
                operator
              );

          }

          /*
          建立單一底數與指數格
          */

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

          /*
          點選某一項後，
          該項成為目前編輯中的項目
          */

          termButton.addEventListener(
            "click",
            () => {

              this.activeTermIndex =
                index;

              this.clearMessage();

              this.renderExpressionTerms();

            }
          );

          /*
          尚未選擇底數
          */

          if (
            term.base === null
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

            /*
            顯示底數
            */

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

            /*
            指數為 1 時，
            可依設定省略不顯示
            */

            const shouldShowExponent =
              !(
                term.exponent === 1 &&
                this.options
                  .omitExponentOne
              );

            if (
              shouldShowExponent
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
    取得目前輸入值
    ==================================================
    */

    getValue() {

      /*
      一般數字模式
      */

      if (
        this.mode ===
        "number"
      ) {

        const raw =
          this.numberInput
            .value
            .trim();

        if (!raw) {

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
          Number(raw);

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
      指數式模式
      */

      const hasIncompleteTerm =
        this.terms.some(
          (term) => {

            return (
              term.base ===
              null
            );

          }
        );

      if (
        hasIncompleteTerm
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

      /*
      計算整個指數式的實際數值
      */

      const number =
        this.terms.reduce(
          (
            product,
            term
          ) => {

            return (
              product *
              Math.pow(
                term.base,
                term.exponent
              )
            );

          },
          1
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
    取得目前模式
    ==================================================
    */

    getMode() {

      return this.mode;

    }

    /*
    ==================================================
    設定一般數字答案
    ==================================================
    */

    setNumberValue(
      value
    ) {

      if (
        value === null ||
        value === undefined
      ) {

        this.numberInput.value =
          "";

      } else {

        this.numberInput.value =
          String(value);

      }

      this.clearMessage();

      this.renderPreviewContent();

      this.emitChange();

    }

    /*
    ==================================================
    設定指數式答案
    ==================================================
    */

    setExpressionTerms(
      terms
    ) {

      if (
        !Array.isArray(
          terms
        ) ||
        terms.length === 0
      ) {

        this.resetExpression();

        return;

      }

      const normalizedTerms =
        [];

      for (
        const term of
        terms
      ) {

        const base =
          Number(
            term.base
          );

        const exponent =
          Number(
            term.exponent
          );

        if (
          !Number.isInteger(
            base
          ) ||
          !Number.isInteger(
            exponent
          )
        ) {

          this.showMessage(
            "指數式資料格式錯誤。"
          );

          return;

        }

        normalizedTerms.push({

          base,

          exponent

        });

      }

      if (
        normalizedTerms.length >
        this.options.maxTerms
      ) {

        this.showMessage(
          `最多只能輸入 ${this.options.maxTerms} 項。`
        );

        return;

      }

      this.terms =
        normalizedTerms;

      this.activeTermIndex =
        0;

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();

    }

    /*
    ==================================================
    將目前指數式依底數排序
    ==================================================
    */

    sortTermsAscending() {

      const incomplete =
        this.terms.some(
          (term) =>
            term.base ===
            null
        );

      if (
        incomplete
      ) {

        this.showMessage(
          "請先完成所有底數，再進行排序。"
        );

        return false;

      }

      this.terms.sort(
        (
          firstTerm,
          secondTerm
        ) => {

          return (
            firstTerm.base -
            secondTerm.base
          );

        }
      );

      this.activeTermIndex =
        0;

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();

      return true;

    }

    /*
    ==================================================
    合併相同底數
    ==================================================
    */

    mergeDuplicateBases() {

      const incomplete =
        this.terms.some(
          (term) =>
            term.base ===
            null
        );

      if (
        incomplete
      ) {

        this.showMessage(
          "請先完成所有底數，再合併同底數。"
        );

        return false;

      }

      const mergedMap =
        new Map();

      this.terms.forEach(
        (term) => {

          const currentExponent =
            mergedMap.get(
              term.base
            ) || 0;

          mergedMap.set(
            term.base,
            currentExponent +
              term.exponent
          );

        }
      );

      this.terms =
        Array.from(
          mergedMap.entries()
        )
          .map(
            (
              [
                base,
                exponent
              ]
            ) => {

              return {

                base,

                exponent

              };

            }
          )
          .sort(
            (
              firstTerm,
              secondTerm
            ) => {

              return (
                firstTerm.base -
                secondTerm.base
              );

            }
          );

      this.activeTermIndex =
        0;

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();

      return true;

    }
        /*
    ==================================================
    將一般整數轉成質因數標準分解式
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
        number <= 0
      ) {
        this.showMessage(
          "只能將正整數轉成標準分解式。"
        );

        return false;
      }

      if (
        number === 1
      ) {
        this.terms = [
          {
            base:
              1,

            exponent:
              1
          }
        ];

        this.activeTermIndex =
          0;

        this.clearMessage();

        this.renderExpressionTerms();

        this.emitChange();

        return true;
      }

      const factorMap =
        primeFactorize(
          number
        );

      const terms =
        Object.entries(
          factorMap
        )
          .map(
            (
              [
                base,
                exponent
              ]
            ) => {
              return {
                base:
                  Number(
                    base
                  ),

                exponent:
                  Number(
                    exponent
                  )
              };
            }
          )
          .sort(
            (
              firstTerm,
              secondTerm
            ) => {
              return (
                firstTerm.base -
                secondTerm.base
              );
            }
          );

      if (
        terms.length >
        this.options.maxTerms
      ) {
        this.showMessage(
          `轉換後超過 ${this.options.maxTerms} 項，無法顯示。`
        );

        return false;
      }

      this.terms =
        terms;

      this.activeTermIndex =
        0;

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();

      return true;
    }

    /*
    ==================================================
    將目前指數式的數值寫入一般數字欄
    ==================================================
    */

    syncExpressionToNumber() {
      const value =
        this.getExpressionValue();

      if (
        !value.valid
      ) {
        this.showMessage(
          "請先完成指數式，再轉成一般數字。"
        );

        return false;
      }

      if (
        !Number.isSafeInteger(
          value.number
        )
      ) {
        this.showMessage(
          "乘開後的數字過大，建議保留標準形式。"
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
    將一般數字欄轉成標準分解式
    ==================================================
    */

    syncNumberToExpression() {
      const raw =
        this.numberInput
          .value
          .trim();

      if (!raw) {
        this.showMessage(
          "請先輸入一般數字。"
        );

        return false;
      }

      const number =
        Number(
          raw
        );

      if (
        !Number.isInteger(
          number
        ) ||
        number <= 0
      ) {
        this.showMessage(
          "只能將正整數轉成標準分解式。"
        );

        return false;
      }

      return this
        .setExpressionFromNumber(
          number
        );
    }

    /*
    ==================================================
    取得指數式模式的資料
    不受目前切換模式影響
    ==================================================
    */

    getExpressionValue() {
      const incomplete =
        this.terms.some(
          (term) => {
            return (
              term.base ===
              null
            );
          }
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

      const hasInvalidTerm =
        this.terms.some(
          (term) => {
            return (
              !Number.isInteger(
                term.base
              ) ||
              !Number.isInteger(
                term.exponent
              )
            );
          }
        );

      if (
        hasInvalidTerm
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
        this.terms.reduce(
          (
            product,
            term
          ) => {
            return (
              product *
              Math.pow(
                term.base,
                term.exponent
              )
            );
          },
          1
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
    取得一般數字模式資料
    不受目前切換模式影響
    ==================================================
    */

    getNumberValue() {
      const raw =
        this.numberInput
          .value
          .trim();

      if (!raw) {
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
    驗證目前答案是否完整
    ==================================================
    */

    validate() {
      const value =
        this.getValue();

      if (
        !value.valid
      ) {
        this.showMessage(
          this.mode ===
            "number"
            ? "請輸入有效的一般數字答案。"
            : "請完成所有底數與指數。"
        );

        return {
          valid:
            false,

          value
        };
      }

      if (
        this.mode ===
          "expression"
      ) {
        if (
          this.options
            .requireAscendingBases
        ) {
          const bases =
            value.terms.map(
              (term) =>
                term.base
            );

          for (
            let index =
              1;
            index <
              bases.length;
            index++
          ) {
            if (
              bases[index] <=
              bases[
                index - 1
              ]
            ) {
              this.showMessage(
                "底數必須由小到大排列。"
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
          this.options
            .disallowDuplicateBases
        ) {
          const bases =
            value.terms.map(
              (term) =>
                term.base
            );

          const uniqueBases =
            new Set(
              bases
            );

          if (
            uniqueBases.size !==
            bases.length
          ) {
            this.showMessage(
              "相同底數不可重複。"
            );

            return {
              valid:
                false,

              value
            };
          }
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
    重設整個輸入器
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

      this.mode =
        this.resolveInitialMode();

      this.clearMessage();

      this.renderExpressionTerms();

      this.syncPanels();

      this.renderPreviewContent();

      this.emitModeChange();

      this.emitChange();
    }

    /*
    ==================================================
    啟用或停用整個輸入器
    ==================================================
    */

    setDisabled(
      disabled
    ) {
      const isDisabled =
        Boolean(
          disabled
        );

      this.root
        .querySelectorAll(
          "button, input"
        )
        .forEach(
          (element) => {
            element.disabled =
              isDisabled;
          }
        );

      this.root.classList.toggle(
        "disabled",
        isDisabled
      );
    }

    /*
    ==================================================
    顯示或隱藏整個輸入器
    ==================================================
    */

    setVisible(
      visible
    ) {
      this.root.hidden =
        !Boolean(
          visible
        );
    }

    /*
    ==================================================
    將焦點移到目前作答位置
    ==================================================
    */

    focus() {
      if (
        this.mode ===
        "number"
      ) {
        this.numberInput.focus();

        return;
      }

      const activeTerm =
        this.expressionDisplay
          .querySelectorAll(
            ".expression-input__term"
          )[
            this.activeTermIndex
          ];

      if (
        activeTerm
      ) {
        activeTerm.focus();
      }
    }

    /*
    ==================================================
    設定提示文字
    ==================================================
    */

    showMessage(
      message
    ) {
      this.messageElement.textContent =
        String(
          message ||
          ""
        );
    }

    clearMessage() {
      this.messageElement.textContent =
        "";
    }

    /*
    ==================================================
    複製指數式資料
    防止外部直接修改元件內部資料
    ==================================================
    */

    cloneTerms() {
      return this.terms.map(
        (term) => {
          return {
            base:
              term.base,

            exponent:
              term.exponent
          };
        }
      );
    }
        /*
    ==================================================
    對外通知答案變更
    ==================================================
    */

    emitChange() {
      if (
        typeof this.options
          .onChange !==
        "function"
      ) {
        return;
      }

      this.options.onChange(
        this.getValue(),
        this
      );
    }

    /*
    ==================================================
    對外通知作答模式變更
    ==================================================
    */

    emitModeChange() {
      if (
        typeof this.options
          .onModeChange !==
        "function"
      ) {
        return;
      }

      this.options.onModeChange(
        this.mode,
        this
      );
    }
  }

  /*
  ==================================================
  合併元件設定
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
              ...options
                .baseOptions
            ]
          : [
              ...defaults
                .baseOptions
            ],

      exponentOptions:
        Array.isArray(
          options.exponentOptions
        )
          ? [
              ...options
                .exponentOptions
            ]
          : [
              ...defaults
                .exponentOptions
            ]
    };
  }

  /*
  ==================================================
  質因數分解
  將正整數轉成：
  {
    2: 3,
    3: 2,
    5: 1
  }
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
      number <= 0
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

        number =
          number /
          divisor;
      }

      divisor =
        divisor === 2
          ? 3
          : divisor + 2;
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

  /*
  ==================================================
  判斷是否為質數
  ==================================================
  */

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

  /*
  ==================================================
  將指數轉成上標字元
  例如：
  6  -> ⁶
  10 -> ¹⁰
  -2 -> ⁻²
  ==================================================
  */

  function toSuperscript(
    value
  ) {
    const superscriptMap = {
      "-":
        "⁻",

      "+":
        "⁺",

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
        (character) => {
          return (
            superscriptMap[
              character
            ] ||
            character
          );
        }
      )
      .join("");
  }

  /*
  ==================================================
  將指數式資料轉成 HTML
  例如：
  [
    { base: 2, exponent: 3 },
    { base: 5, exponent: 2 }
  ]

  轉成：
  2<sup>3</sup> × 5<sup>2</sup>
  ==================================================
  */

  function termsToHtml(
    terms,
    operator = "×",
    omitExponentOne = true
  ) {
    if (
      !Array.isArray(
        terms
      ) ||
      terms.length ===
        0
    ) {
      return "";
    }

    return terms
      .map(
        (term) => {
          const base =
            escapeHtml(
              term.base
            );

          const exponent =
            Number(
              term.exponent
            );

          if (
            exponent ===
              1 &&
            omitExponentOne
          ) {
            return base;
          }

          return (
            `${base}` +
            `<sup>${escapeHtml(
              exponent
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

  /*
  ==================================================
  將指數式資料轉成純文字
  例如：
  2^3×5^2
  ==================================================
  */

  function termsToPlain(
    terms,
    operator = "×"
  ) {
    if (
      !Array.isArray(
        terms
      ) ||
      terms.length ===
        0
    ) {
      return "";
    }

    return terms
      .map(
        (term) => {
          return (
            `${term.base}` +
            `^` +
            `${term.exponent}`
          );
        }
      )
      .join(
        operator
      );
  }

  /*
  ==================================================
  將指數式資料轉成上標純文字
  例如：
  2³×5²
  ==================================================
  */

  function termsToSuperscriptText(
    terms,
    operator = "×",
    omitExponentOne = true
  ) {
    if (
      !Array.isArray(
        terms
      ) ||
      terms.length ===
        0
    ) {
      return "";
    }

    return terms
      .map(
        (term) => {
          const base =
            String(
              term.base
            );

          const exponent =
            Number(
              term.exponent
            );

          if (
            exponent ===
              1 &&
            omitExponentOne
          ) {
            return base;
          }

          return (
            base +
            toSuperscript(
              exponent
            )
          );
        }
      )
      .join(
        operator
      );
  }

  /*
  ==================================================
  計算指數式的實際數值
  ==================================================
  */

  function evaluateTerms(
    terms
  ) {
    if (
      !Array.isArray(
        terms
      ) ||
      terms.length ===
        0
    ) {
      return {
        valid:
          false,

        number:
          null
      };
    }

    const incomplete =
      terms.some(
        (term) => {
          return (
            term.base ===
              null ||
            term.base ===
              undefined ||
            !Number.isInteger(
              Number(
                term.base
              )
            ) ||
            !Number.isInteger(
              Number(
                term.exponent
              )
            )
          );
        }
      );

    if (
      incomplete
    ) {
      return {
        valid:
          false,

        number:
          null
      };
    }

    const number =
      terms.reduce(
        (
          product,
          term
        ) => {
          return (
            product *
            Math.pow(
              Number(
                term.base
              ),
              Number(
                term.exponent
              )
            )
          );
        },
        1
      );

    return {
      valid:
        Number.isFinite(
          number
        ),

      number
    };
  }

  /*
  ==================================================
  合併同底數
  不直接修改原陣列
  ==================================================
  */

  function mergeTermsByBase(
    terms
  ) {
    if (
      !Array.isArray(
        terms
      )
    ) {
      return [];
    }

    const mergedMap =
      new Map();

    terms.forEach(
      (term) => {
        const base =
          Number(
            term.base
          );

        const exponent =
          Number(
            term.exponent
          );

        if (
          !Number.isInteger(
            base
          ) ||
          !Number.isInteger(
            exponent
          )
        ) {
          return;
        }

        mergedMap.set(
          base,
          (
            mergedMap.get(
              base
            ) ||
            0
          ) +
          exponent
        );
      }
    );

    return Array.from(
      mergedMap.entries()
    )
      .map(
        (
          [
            base,
            exponent
          ]
        ) => {
          return {
            base,
            exponent
          };
        }
      )
      .sort(
        (
          firstTerm,
          secondTerm
        ) => {
          return (
            firstTerm.base -
            secondTerm.base
          );
        }
      );
  }
    /*
  ==================================================
  HTML 安全處理
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
  將一般數字轉成標準分解式項目
  ==================================================
  */

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
      number <= 0
    ) {
      return [];
    }

    if (
      number === 1
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

    const factorMap =
      primeFactorize(
        number
      );

    return Object.entries(
      factorMap
    )
      .map(
        (
          [
            base,
            exponent
          ]
        ) => {
          return {
            base:
              Number(
                base
              ),

            exponent:
              Number(
                exponent
              )
          };
        }
      )
      .sort(
        (
          firstTerm,
          secondTerm
        ) => {
          return (
            firstTerm.base -
            secondTerm.base
          );
        }
      );
  }

  /*
  ==================================================
  判斷兩組指數式是否完全相同
  ==================================================
  */

  function areTermsEqual(
    firstTerms,
    secondTerms,
    options = {}
  ) {
    const {
      ignoreOrder =
        false,

      mergeDuplicates =
        false
    } =
      options;

    if (
      !Array.isArray(
        firstTerms
      ) ||
      !Array.isArray(
        secondTerms
      )
    ) {
      return false;
    }

    let normalizedFirst =
      firstTerms.map(
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

    let normalizedSecond =
      secondTerms.map(
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

    if (
      mergeDuplicates
    ) {
      normalizedFirst =
        mergeTermsByBase(
          normalizedFirst
        );

      normalizedSecond =
        mergeTermsByBase(
          normalizedSecond
        );
    }

    if (
      ignoreOrder
    ) {
      normalizedFirst.sort(
        (
          firstTerm,
          secondTerm
        ) => {
          return (
            firstTerm.base -
            secondTerm.base
          );
        }
      );

      normalizedSecond.sort(
        (
          firstTerm,
          secondTerm
        ) => {
          return (
            firstTerm.base -
            secondTerm.base
          );
        }
      );
    }

    if (
      normalizedFirst.length !==
      normalizedSecond.length
    ) {
      return false;
    }

    return normalizedFirst.every(
      (
        term,
        index
      ) => {
        return (
          term.base ===
            normalizedSecond[
              index
            ].base &&
          term.exponent ===
            normalizedSecond[
              index
            ].exponent
        );
      }
    );
  }

  /*
  ==================================================
  判斷兩組答案是否數值相等
  ==================================================
  */

  function areExpressionValuesEqual(
    firstTerms,
    secondTerms
  ) {
    const firstValue =
      evaluateTerms(
        firstTerms
      );

    const secondValue =
      evaluateTerms(
        secondTerms
      );

    if (
      !firstValue.valid ||
      !secondValue.valid
    ) {
      return false;
    }

    return (
      firstValue.number ===
      secondValue.number
    );
  }

  /*
  ==================================================
  建立標準分解式資料物件
  ==================================================
  */

  function termsToFactorMap(
    terms
  ) {
    const factorMap =
      {};

    if (
      !Array.isArray(
        terms
      )
    ) {
      return factorMap;
    }

    terms.forEach(
      (term) => {
        const base =
          Number(
            term.base
          );

        const exponent =
          Number(
            term.exponent
          );

        if (
          !Number.isInteger(
            base
          ) ||
          !Number.isInteger(
            exponent
          )
        ) {
          return;
        }

        factorMap[
          base
        ] =
          (
            factorMap[
              base
            ] ||
            0
          ) +
          exponent;
      }
    );

    return factorMap;
  }

  /*
  ==================================================
  判斷是否為標準質因數分解式
  ==================================================
  */

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

    const bases =
      [];

    for (
      const term of
      terms
    ) {
      const base =
        Number(
          term.base
        );

      const exponent =
        Number(
          term.exponent
        );

      if (
        !isPrime(
          base
        ) ||
        !Number.isInteger(
          exponent
        ) ||
        exponent <
          1
      ) {
        return false;
      }

      bases.push(
        base
      );
    }

    const uniqueBases =
      new Set(
        bases
      );

    if (
      uniqueBases.size !==
      bases.length
    ) {
      return false;
    }

    for (
      let index =
        1;
      index <
        bases.length;
      index++
    ) {
      if (
        bases[index] <=
        bases[
          index - 1
        ]
      ) {
        return false;
      }
    }

    return true;
  }

  /*
  ==================================================
  對外公開主元件
  ==================================================
  */

  window.ExpressionInput =
    ExpressionInput;

  /*
  ==================================================
  對外公開工具函式
  ==================================================
  */

  window.ExpressionInputUtils = {
    primeFactorize,

    isPrime,

    toSuperscript,

    termsToHtml,

    termsToPlain,

    termsToSuperscriptText,

    evaluateTerms,

    mergeTermsByBase,

    numberToPrimeFactorTerms,

    areTermsEqual,

    areExpressionValuesEqual,

    termsToFactorMap,

    isStandardPrimeFactorization
  };
})();