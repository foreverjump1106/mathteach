/*
==================================================
通用數學答案輸入器
檔案位置：js/expression-input.js
==================================================
*/

(function () {
  "use strict";

  const DEFAULT_OPTIONS = {
    mountId: "",

    defaultMode: "number",

    allowNumber: true,

    allowExpression: true,

    numberPlaceholder: "請輸入答案",

    numberInputMode: "numeric",

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

    allowCustomBase: true,

    allowNegativeBase: false,

    allowZeroBase: false,

    maxTerms: 7,

    operator: "×",

    requireAscendingBases: false,

    disallowDuplicateBases: false,

    omitExponentOne: true,

    theme: {
      primary: "#1565c0",
      light: "#eef7ff",
      border: "#90caf9"
    },

    labels: {
      numberMode: "答案乘開",
      expressionMode: "標準形式",
      numberLabel: "請輸入乘開後的答案",
      expressionLabel: "請輸入指數式",
      baseLabel: "選擇底數",
      exponentLabel: "選擇指數",
      editLabel: "編輯答案"
    },

    onChange: null,

    onModeChange: null
  };

  class ExpressionInput {
    constructor(options = {}) {
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
        !this.options.allowNumber &&
        !this.options.allowExpression
      ) {
        throw new Error(
          "ExpressionInput 至少必須啟用一種作答模式。"
        );
      }

      this.mode =
        this.resolveInitialMode();

      this.terms = [
        {
          base: null,
          exponent: 1
        }
      ];

      this.activeTermIndex = 0;

      this.render();

      this.emitChange();
    }

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

      return this.options.allowNumber
        ? "number"
        : "expression";
    }

    render() {
      this.mount.innerHTML = "";

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

      this.renderMessage();

      this.renderPreview();

      this.syncPanels();
    }

    renderModeSwitch() {
      if (
        !this.options.allowNumber ||
        !this.options.allowExpression
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
          this.options.labels.numberMode
        );

      this.expressionModeButton =
        this.createModeButton(
          "expression",
          this.options.labels.expressionMode
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

      button.type = "button";

      button.className =
        "expression-input__mode-button";

      button.textContent = label;

      button.addEventListener(
        "click",
        () => {
          this.setMode(mode);
        }
      );

      return button;
    }

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
              String(base),
              () => {
                this.setActiveBase(
                  Number(base)
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
              !Number.isFinite(base)
            ) {
              this.showMessage(
                "請輸入有效底數。"
              );

              return;
            }

            this.setActiveBase(base);

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
                  Number(exponent)
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

    createControlGroup(title) {
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

      heading.textContent = title;

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

    createKeyButton(
      label,
      callback,
      extraClass = ""
    ) {
      const button =
        document.createElement(
          "button"
        );

      button.type = "button";

      button.className =
        `expression-input__key ${extraClass}`
          .trim();

      button.textContent = label;

      button.addEventListener(
        "click",
        callback
      );

      return button;
    }

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
      if (!this.previewElement) {
        return;
      }

      const value =
        this.getValue();

      if (
        this.mode === "number"
      ) {
        this.previewElement.innerHTML =
          value.valid
            ? `目前答案：<strong>${escapeHtml(
                value.raw
              )}</strong>`
            : "目前尚未輸入答案。";

        return;
      }

      this.previewElement.innerHTML =
        value.valid
          ? `目前答案：<strong>${value.html}</strong>`
          : "目前尚未完成指數式。";
    }

    setMode(mode) {
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

      this.mode = mode;

      this.clearMessage();

      this.syncPanels();

      this.renderPreviewContent();

      this.emitModeChange();

      this.emitChange();
    }

    getMode() {
      return this.mode;
    }

    syncPanels() {
      this.numberPanel.classList.toggle(
        "active",
        this.mode === "number"
      );

      this.expressionPanel.classList.toggle(
        "active",
        this.mode === "expression"
      );

      if (
        this.numberModeButton
      ) {
        this.numberModeButton.classList.toggle(
          "active",
          this.mode === "number"
        );
      }

      if (
        this.expressionModeButton
      ) {
        this.expressionModeButton.classList.toggle(
          "active",
          this.mode === "expression"
        );
      }
    }

    setActiveBase(base) {
      if (
        !Number.isInteger(base)
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

      if (
        this.options.disallowDuplicateBases
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
                term.base === base
              );
            }
          );

        if (duplicate) {
          this.showMessage(
            "相同底數不可重複，請調整原本那一項的指數。"
          );

          return;
        }
      }

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
          this.terms[index].base !==
          null
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
        index <
          this.terms.length;
        index++
      ) {
        if (
          this.terms[index].base !==
          null
        ) {
          return this.terms[index].base;
        }
      }

      return null;
    }

    setActiveExponent(exponent) {
      if (
        !Number.isInteger(exponent)
      ) {
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
        base: null,
        exponent: 1
      });

      this.activeTermIndex =
        this.terms.length - 1;

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();
    }

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

    renderExpressionTerms() {
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
                term.exponent === 1 &&
                this.options.omitExponentOne
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

          this.expressionDisplay.appendChild(
            termButton
          );
        }
      );

      this.renderPreviewContent();
    }

    getNumberValue() {
      const raw =
        this.numberInput.value.trim();

      if (!raw) {
        return {
          mode: "number",
          valid: false,
          raw: "",
          number: null
        };
      }

      const number =
        Number(raw);

      return {
        mode: "number",
        valid:
          Number.isFinite(number),
        raw,
        number
      };
    }

    getExpressionValue() {
      const incomplete =
        this.terms.some(
          (term) =>
            term.base === null
        );

      if (incomplete) {
        return {
          mode: "expression",
          valid: false,
          terms:
            this.cloneTerms(),
          html: "",
          plain: "",
          number: null
        };
      }

      const number =
        evaluateTerms(
          this.terms
        );

      return {
        mode: "expression",

        valid:
          Number.isFinite(number),

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

    getValue() {
      return this.mode === "number"
        ? this.getNumberValue()
        : this.getExpressionValue();
    }

    validate() {
      const value =
        this.getValue();

      if (!value.valid) {
        this.showMessage(
          this.mode === "number"
            ? "請輸入有效的一般數字答案。"
            : "請完成所有底數與指數。"
        );

        return {
          valid: false,
          value
        };
      }

      this.clearMessage();

      return {
        valid: true,
        value
      };
    }

    setNumberValue(value) {
      this.numberInput.value =
        value === null ||
        value === undefined
          ? ""
          : String(value);

      this.clearMessage();

      this.renderPreviewContent();

      this.emitChange();
    }

    setExpressionTerms(terms) {
      if (
        !Array.isArray(terms) ||
        terms.length === 0
      ) {
        this.resetExpression();

        return;
      }

      const normalized =
        terms.map(
          (term) => ({
            base:
              Number(term.base),

            exponent:
              Number(term.exponent)
          })
        );

      const invalid =
        normalized.some(
          (term) =>
            !Number.isInteger(
              term.base
            ) ||
            !Number.isInteger(
              term.exponent
            )
        );

      if (invalid) {
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

      this.activeTermIndex = 0;

      this.clearMessage();

      this.renderExpressionTerms();

      this.emitChange();
    }

    setExpressionFromNumber(value) {
      const number =
        Number(value);

      if (
        !Number.isInteger(number) ||
        number <= 0
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
        value.number <= 0
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

      if (!value.valid) {
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
        String(value.number);

      this.clearMessage();

      this.renderPreviewContent();

      this.emitChange();

      return true;
    }

    sortTermsAscending() {
      const value =
        this.getExpressionValue();

      if (!value.valid) {
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

      this.activeTermIndex = 0;

      this.renderExpressionTerms();

      this.emitChange();

      return true;
    }

    mergeDuplicateBases() {
      const value =
        this.getExpressionValue();

      if (!value.valid) {
        this.showMessage(
          "請先完成所有底數。"
        );

        return false;
      }

      this.terms =
        mergeTermsByBase(
          this.terms
        );

      this.activeTermIndex = 0;

      this.renderExpressionTerms();

      this.emitChange();

      return true;
    }

    reset() {
      this.numberInput.value = "";

      this.terms = [
        {
          base: null,
          exponent: 1
        }
      ];

      this.activeTermIndex = 0;

      this.mode =
        this.resolveInitialMode();

      this.clearMessage();

      this.renderExpressionTerms();

      this.syncPanels();

      this.renderPreviewContent();

      this.emitModeChange();

      this.emitChange();
    }

    setDisabled(disabled) {
      this.root
        .querySelectorAll(
          "button, input"
        )
        .forEach(
          (element) => {
            element.disabled =
              Boolean(disabled);
          }
        );

      this.root.classList.toggle(
        "disabled",
        Boolean(disabled)
      );
    }

    setVisible(visible) {
      this.root.hidden =
        !Boolean(visible);
    }

    focus() {
      if (
        this.mode === "number"
      ) {
        this.numberInput.focus();

        return;
      }

      const terms =
        this.expressionDisplay
          .querySelectorAll(
            ".expression-input__term"
          );

      terms[
        this.activeTermIndex
      ]?.focus();
    }

    showMessage(message) {
      this.messageElement.textContent =
        String(message || "");
    }

    clearMessage() {
      this.messageElement.textContent =
        "";
    }

    cloneTerms() {
      return this.terms.map(
        (term) => ({
          base: term.base,
          exponent:
            term.exponent
        })
      );
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
          : [...defaults.exponentOptions]
    };
  }

  function primeFactorize(value) {
    let number =
      Number(value);

    if (
      !Number.isInteger(number) ||
      number <= 0
    ) {
      return {};
    }

    const factorMap = {};

    let divisor = 2;

    while (
      divisor * divisor <=
      number
    ) {
      while (
        number % divisor ===
        0
      ) {
        factorMap[divisor] =
          (
            factorMap[divisor] ||
            0
          ) + 1;

        number /=
          divisor;
      }

      divisor =
        divisor === 2
          ? 3
          : divisor + 2;
    }

    if (
      number > 1
    ) {
      factorMap[number] =
        (
          factorMap[number] ||
          0
        ) + 1;
    }

    return factorMap;
  }

  function numberToPrimeFactorTerms(
    value
  ) {
    const number =
      Number(value);

    if (
      !Number.isInteger(number) ||
      number <= 0
    ) {
      return [];
    }

    if (
      number === 1
    ) {
      return [
        {
          base: 1,
          exponent: 1
        }
      ];
    }

    return Object.entries(
      primeFactorize(number)
    )
      .map(
        (
          [
            base,
            exponent
          ]
        ) => ({
          base:
            Number(base),

          exponent:
            Number(exponent)
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

  function evaluateTerms(terms) {
    return terms.reduce(
      (
        product,
        term
      ) =>
        product *
        Math.pow(
          Number(term.base),
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
          term.base,
          (
            map.get(
              term.base
            ) ||
            0
          ) +
          term.exponent
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

  function termsToHtml(
    terms,
    operator = "×",
    omitExponentOne = true
  ) {
    return terms
      .map(
        (term) => {
          const base =
            escapeHtml(
              term.base
            );

          if (
            term.exponent === 1 &&
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
        ` ${escapeHtml(operator)} `
      );
  }

  function termsToPlain(
    terms,
    operator = "×"
  ) {
    return terms
      .map(
        (term) =>
          `${term.base}^${term.exponent}`
      )
      .join(operator);
  }

  function termsToSuperscriptText(
    terms,
    operator = "×",
    omitExponentOne = true
  ) {
    return terms
      .map(
        (term) => {
          if (
            term.exponent === 1 &&
            omitExponentOne
          ) {
            return String(
              term.base
            );
          }

          return (
            String(term.base) +
            toSuperscript(
              term.exponent
            )
          );
        }
      )
      .join(operator);
  }

  function toSuperscript(value) {
    const map = {
      "-": "⁻",
      "+": "⁺",
      0: "⁰",
      1: "¹",
      2: "²",
      3: "³",
      4: "⁴",
      5: "⁵",
      6: "⁶",
      7: "⁷",
      8: "⁸",
      9: "⁹"
    };

    return String(value)
      .split("")
      .map(
        (character) =>
          map[character] ||
          character
      )
      .join("");
  }

  function isPrime(value) {
    const number =
      Number(value);

    if (
      !Number.isInteger(number) ||
      number < 2
    ) {
      return false;
    }

    for (
      let divisor = 2;
      divisor * divisor <=
        number;
      divisor++
    ) {
      if (
        number % divisor ===
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
      !Array.isArray(terms) ||
      terms.length === 0
    ) {
      return false;
    }

    const bases =
      terms.map(
        (term) =>
          Number(term.base)
      );

    for (
      let index = 0;
      index <
        terms.length;
      index++
    ) {
      if (
        !isPrime(
          terms[index].base
        ) ||
        !Number.isInteger(
          Number(
            terms[index]
              .exponent
          )
        ) ||
        Number(
          terms[index]
            .exponent
        ) < 1
      ) {
        return false;
      }

      if (
        index > 0 &&
        bases[index] <=
          bases[index - 1]
      ) {
        return false;
      }
    }

    return (
      new Set(bases).size ===
      bases.length
    );
  }

  function areTermsEqual(
    firstTerms,
    secondTerms,
    options = {}
  ) {
    if (
      !Array.isArray(firstTerms) ||
      !Array.isArray(secondTerms)
    ) {
      return false;
    }

    let first =
      firstTerms.map(
        (term) => ({
          base:
            Number(term.base),
          exponent:
            Number(
              term.exponent
            )
        })
      );

    let second =
      secondTerms.map(
        (term) => ({
          base:
            Number(term.base),
          exponent:
            Number(
              term.exponent
            )
        })
      );

    if (
      options.mergeDuplicates
    ) {
      first =
        mergeTermsByBase(first);

      second =
        mergeTermsByBase(second);
    }

    if (
      options.ignoreOrder
    ) {
      first.sort(
        (a, b) =>
          a.base - b.base
      );

      second.sort(
        (a, b) =>
          a.base - b.base
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
          second[index].base &&
        term.exponent ===
          second[index]
            .exponent
    );
  }

  function areExpressionValuesEqual(
    firstTerms,
    secondTerms
  ) {
    return (
      evaluateTerms(firstTerms) ===
      evaluateTerms(secondTerms)
    );
  }

  function termsToFactorMap(
    terms
  ) {
    const result = {};

    terms.forEach(
      (term) => {
        result[term.base] =
          (
            result[term.base] ||
            0
          ) +
          term.exponent;
      }
    );

    return result;
  }

  function escapeHtml(value) {
    return String(value)
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

  window.ExpressionInput =
    ExpressionInput;

  window.ExpressionInputUtils = {
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
    termsToFactorMap
  };
})();