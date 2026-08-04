/*
==================================================
數學遊戲樂園：共用數學工具
檔案位置：js/game-utils.js
==================================================

提供功能：
1. 隨機整數與隨機抽取
2. 陣列洗牌
3. 最大公因數與最小公倍數
4. 分數約分與四則運算
5. 假分數、帶分數互換
6. 分數比較與等值判定
7. 正負數與數學文字格式化
8. 安全數值檢查

使用方式：

MathGameUtils.randomInt(-10, 10);

MathGameUtils.gcd(12, 18);

MathGameUtils.fraction.add(
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 }
);
==================================================
*/

(function () {
  "use strict";

  /*
  ==================================================
  基本檢查
  ==================================================
  */

  function toNumber(value) {
    const number =
      Number(value);

    return Number.isFinite(number)
      ? number
      : null;
  }

  function isSafeInteger(value) {
    return Number.isSafeInteger(
      Number(value)
    );
  }

  function assertSafeInteger(
    value,
    name = "數值"
  ) {
    const number =
      Number(value);

    if (
      !Number.isSafeInteger(number)
    ) {
      throw new TypeError(
        `${name}必須是安全整數。`
      );
    }

    return number;
  }

  /*
  ==================================================
  隨機工具
  ==================================================
  */

  function randomInt(minimum, maximum) {
    let min =
      assertSafeInteger(
        minimum,
        "最小值"
      );

    let max =
      assertSafeInteger(
        maximum,
        "最大值"
      );

    if (min > max) {
      [min, max] =
        [max, min];
    }

    return Math.floor(
      Math.random() *
        (max - min + 1)
    ) + min;
  }

  function randomNonZeroInt(
    minimum,
    maximum
  ) {
    let min =
      assertSafeInteger(
        minimum,
        "最小值"
      );

    let max =
      assertSafeInteger(
        maximum,
        "最大值"
      );

    if (min > max) {
      [min, max] =
        [max, min];
    }

    if (
      min === 0 &&
      max === 0
    ) {
      throw new RangeError(
        "隨機範圍不能只有 0。"
      );
    }

    let value = 0;

    do {
      value =
        randomInt(min, max);
    } while (value === 0);

    return value;
  }

  function randomSign() {
    return Math.random() < 0.5
      ? -1
      : 1;
  }

  function chance(probability = 0.5) {
    const value =
      Number(probability);

    if (!Number.isFinite(value)) {
      return false;
    }

    const normalized =
      Math.min(
        Math.max(value, 0),
        1
      );

    return Math.random() <
      normalized;
  }

  function pickRandom(array) {
    if (
      !Array.isArray(array) ||
      array.length === 0
    ) {
      return undefined;
    }

    return array[
      randomInt(
        0,
        array.length - 1
      )
    ];
  }

  function shuffle(array) {
    if (!Array.isArray(array)) {
      return [];
    }

    const copied =
      [...array];

    for (
      let index =
        copied.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex =
        randomInt(0, index);

      [
        copied[index],
        copied[randomIndex]
      ] = [
        copied[randomIndex],
        copied[index]
      ];
    }

    return copied;
  }

  function sample(
    array,
    amount = 1
  ) {
    if (!Array.isArray(array)) {
      return [];
    }

    const count =
      Math.max(
        0,
        Math.min(
          assertSafeInteger(
            amount,
            "抽取數量"
          ),
          array.length
        )
      );

    return shuffle(array)
      .slice(0, count);
  }

  /*
  ==================================================
  最大公因數與最小公倍數
  ==================================================
  */

  function gcd(
    firstNumber,
    secondNumber
  ) {
    let a =
      Math.abs(
        assertSafeInteger(
          firstNumber,
          "第一個數"
        )
      );

    let b =
      Math.abs(
        assertSafeInteger(
          secondNumber,
          "第二個數"
        )
      );

    while (b !== 0) {
      const remainder =
        a % b;

      a = b;
      b = remainder;
    }

    return a;
  }

  function gcdMany(numbers) {
    if (
      !Array.isArray(numbers) ||
      numbers.length === 0
    ) {
      return 0;
    }

    return numbers.reduce(
      (result, value) =>
        gcd(result, value),
      0
    );
  }

  function lcm(
    firstNumber,
    secondNumber
  ) {
    const a =
      assertSafeInteger(
        firstNumber,
        "第一個數"
      );

    const b =
      assertSafeInteger(
        secondNumber,
        "第二個數"
      );

    if (
      a === 0 ||
      b === 0
    ) {
      return 0;
    }

    return Math.abs(
      (a / gcd(a, b)) * b
    );
  }

  function lcmMany(numbers) {
    if (
      !Array.isArray(numbers) ||
      numbers.length === 0
    ) {
      return 0;
    }

    return numbers.reduce(
      (result, value) =>
        lcm(result, value),
      1
    );
  }

  /*
  ==================================================
  分數核心
  ==================================================
  */

  function normalizeFraction(
    numerator,
    denominator = 1
  ) {
    let n =
      assertSafeInteger(
        numerator,
        "分子"
      );

    let d =
      assertSafeInteger(
        denominator,
        "分母"
      );

    if (d === 0) {
      throw new RangeError(
        "分母不可為 0。"
      );
    }

    if (n === 0) {
      return {
        numerator: 0,
        denominator: 1
      };
    }

    if (d < 0) {
      n = -n;
      d = -d;
    }

    const divisor =
      gcd(n, d);

    return {
      numerator:
        n / divisor,

      denominator:
        d / divisor
    };
  }

  function createFraction(
    numerator,
    denominator = 1
  ) {
    return normalizeFraction(
      numerator,
      denominator
    );
  }

  function readFraction(value) {
    if (
      typeof value === "number"
    ) {
      return normalizeFraction(
        value,
        1
      );
    }

    if (
      !value ||
      typeof value !== "object"
    ) {
      throw new TypeError(
        "分數格式不正確。"
      );
    }

    const numerator =
      value.numerator ??
      value.n;

    const denominator =
      value.denominator ??
      value.d ??
      1;

    return normalizeFraction(
      numerator,
      denominator
    );
  }

  function addFractions(
    first,
    second
  ) {
    const a =
      readFraction(first);

    const b =
      readFraction(second);

    return normalizeFraction(
      a.numerator *
        b.denominator +
      b.numerator *
        a.denominator,

      a.denominator *
        b.denominator
    );
  }

  function subtractFractions(
    first,
    second
  ) {
    const a =
      readFraction(first);

    const b =
      readFraction(second);

    return normalizeFraction(
      a.numerator *
        b.denominator -
      b.numerator *
        a.denominator,

      a.denominator *
        b.denominator
    );
  }

  function multiplyFractions(
    first,
    second
  ) {
    const a =
      readFraction(first);

    const b =
      readFraction(second);

    return normalizeFraction(
      a.numerator *
        b.numerator,

      a.denominator *
        b.denominator
    );
  }

  function divideFractions(
    first,
    second
  ) {
    const a =
      readFraction(first);

    const b =
      readFraction(second);

    if (b.numerator === 0) {
      throw new RangeError(
        "不可除以 0。"
      );
    }

    return normalizeFraction(
      a.numerator *
        b.denominator,

      a.denominator *
        b.numerator
    );
  }

  function negateFraction(value) {
    const fraction =
      readFraction(value);

    return {
      numerator:
        -fraction.numerator,

      denominator:
        fraction.denominator
    };
  }

  function absoluteFraction(value) {
    const fraction =
      readFraction(value);

    return {
      numerator:
        Math.abs(
          fraction.numerator
        ),

      denominator:
        fraction.denominator
    };
  }

  function reciprocalFraction(value) {
    const fraction =
      readFraction(value);

    if (
      fraction.numerator === 0
    ) {
      throw new RangeError(
        "0 沒有倒數。"
      );
    }

    return normalizeFraction(
      fraction.denominator,
      fraction.numerator
    );
  }

  function compareFractions(
    first,
    second
  ) {
    const a =
      readFraction(first);

    const b =
      readFraction(second);

    const difference =
      a.numerator *
        b.denominator -
      b.numerator *
        a.denominator;

    if (difference < 0) {
      return -1;
    }

    if (difference > 0) {
      return 1;
    }

    return 0;
  }

  function fractionsEqual(
    first,
    second
  ) {
    return (
      compareFractions(
        first,
        second
      ) === 0
    );
  }

  function isIntegerFraction(value) {
    return (
      readFraction(value)
        .denominator === 1
    );
  }

  function fractionToNumber(value) {
    const fraction =
      readFraction(value);

    return (
      fraction.numerator /
      fraction.denominator
    );
  }

  /*
  ==================================================
  假分數與帶分數
  ==================================================
  */

  function toMixedNumber(value) {
    const fraction =
      readFraction(value);

    const sign =
      fraction.numerator < 0
        ? -1
        : 1;

    const absoluteNumerator =
      Math.abs(
        fraction.numerator
      );

    const whole =
      Math.floor(
        absoluteNumerator /
          fraction.denominator
      );

    const numerator =
      absoluteNumerator %
      fraction.denominator;

    return {
      sign,
      whole,
      numerator,
      denominator:
        fraction.denominator,

      improperNumerator:
        fraction.numerator,

      improperDenominator:
        fraction.denominator
    };
  }

  function fromMixedNumber({
    sign = 1,
    whole = 0,
    numerator = 0,
    denominator = 1
  } = {}) {
    const safeSign =
      Number(sign) < 0
        ? -1
        : 1;

    const safeWhole =
      Math.abs(
        assertSafeInteger(
          whole,
          "帶分數整數部分"
        )
      );

    const safeNumerator =
      Math.abs(
        assertSafeInteger(
          numerator,
          "分子"
        )
      );

    const safeDenominator =
      assertSafeInteger(
        denominator,
        "分母"
      );

    if (
      safeDenominator <= 0
    ) {
      throw new RangeError(
        "分母必須大於 0。"
      );
    }

    return normalizeFraction(
      safeSign *
        (
          safeWhole *
            safeDenominator +
          safeNumerator
        ),

      safeDenominator
    );
  }

  /*
  ==================================================
  分數格式化
  ==================================================
  */

  function fractionToText(
    value,
    options = {}
  ) {
    const fraction =
      readFraction(value);

    const useUnicodeMinus =
      options.useUnicodeMinus !==
      false;

    const minus =
      useUnicodeMinus
        ? "−"
        : "-";

    if (
      fraction.denominator === 1
    ) {
      return String(
        fraction.numerator
      ).replace("-", minus);
    }

    const sign =
      fraction.numerator < 0
        ? minus
        : "";

    return (
      `${sign}` +
      `${Math.abs(
        fraction.numerator
      )}/` +
      `${fraction.denominator}`
    );
  }

  function mixedNumberToText(
    value,
    options = {}
  ) {
    const mixed =
      toMixedNumber(value);

    const minus =
      options.useUnicodeMinus ===
      false
        ? "-"
        : "−";

    const sign =
      mixed.sign < 0
        ? minus
        : "";

    if (
      mixed.numerator === 0
    ) {
      return (
        `${sign}${mixed.whole}`
      );
    }

    if (mixed.whole === 0) {
      return (
        `${sign}` +
        `${mixed.numerator}/` +
        `${mixed.denominator}`
      );
    }

    return (
      `${sign}${mixed.whole} ` +
      `${mixed.numerator}/` +
      `${mixed.denominator}`
    );
  }

  function fractionToHTML(
    value,
    options = {}
  ) {
    const fraction =
      readFraction(value);

    const className =
      options.className ||
      "math-frac";

    const showSign =
      options.showSign !== false;

    const negative =
      fraction.numerator < 0;

    const sign =
      showSign && negative
        ? "−"
        : "";

    const numerator =
      Math.abs(
        fraction.numerator
      );

    if (
      fraction.denominator === 1
    ) {
      return (
        `${sign}${numerator}`
      );
    }

    return `
      ${sign}<span class="${className}">
        <span class="top">
          ${numerator}
        </span>
        <span class="bottom">
          ${fraction.denominator}
        </span>
      </span>
    `;
  }

  /*
  ==================================================
  隨機分數
  ==================================================
  */

  function randomFraction(
    options = {}
  ) {
    const minimumDenominator =
      Number.isSafeInteger(
        options.minimumDenominator
      )
        ? options.minimumDenominator
        : 2;

    const maximumDenominator =
      Number.isSafeInteger(
        options.maximumDenominator
      )
        ? options.maximumDenominator
        : 12;

    const maximumNumerator =
      Number.isSafeInteger(
        options.maximumNumerator
      )
        ? Math.abs(
            options.maximumNumerator
          )
        : 15;

    const allowNegative =
      options.allowNegative !==
      false;

    const allowZero =
      options.allowZero === true;

    const requireProper =
      options.requireProper === true;

    const requireSimplest =
      options.requireSimplest !==
      false;

    let attempts = 0;

    while (attempts < 1000) {
      attempts += 1;

      const denominator =
        randomInt(
          minimumDenominator,
          maximumDenominator
        );

      let numerator =
        randomInt(
          allowZero ? 0 : 1,
          maximumNumerator
        );

      if (
        requireProper &&
        numerator >= denominator
      ) {
        numerator =
          randomInt(
            allowZero ? 0 : 1,
            denominator - 1
          );
      }

      if (
        allowNegative &&
        numerator !== 0 &&
        chance(0.5)
      ) {
        numerator =
          -numerator;
      }

      if (
        requireSimplest &&
        gcd(
          numerator,
          denominator
        ) !== 1
      ) {
        continue;
      }

      return normalizeFraction(
        numerator,
        denominator
      );
    }

    throw new Error(
      "無法產生符合條件的隨機分數。"
    );
  }

  /*
  ==================================================
  正負數與數學格式
  ==================================================
  */

  function formatInteger(
    value,
    options = {}
  ) {
    const number =
      assertSafeInteger(
        value,
        "整數"
      );

    const useParentheses =
      options.parentheses === true;

    const unicodeMinus =
      options.unicodeMinus !==
      false;

    let text =
      String(number);

    if (unicodeMinus) {
      text =
        text.replace("-", "−");
    }

    if (
      useParentheses &&
      number < 0
    ) {
      return `(${text})`;
    }

    return text;
  }

  function formatSignedTerm(
    value,
    options = {}
  ) {
    const number =
      assertSafeInteger(
        value,
        "數值"
      );

    const first =
      options.first === true;

    const absolute =
      Math.abs(number);

    if (first) {
      return number < 0
        ? `−${absolute}`
        : `${absolute}`;
    }

    return number < 0
      ? ` − ${absolute}`
      : ` + ${absolute}`;
  }

  function formatPower(
    base,
    exponent,
    options = {}
  ) {
    const safeBase =
      assertSafeInteger(
        base,
        "底數"
      );

    const safeExponent =
      assertSafeInteger(
        exponent,
        "指數"
      );

    const wrapNegative =
      options.wrapNegative !==
      false;

    const baseText =
      (
        wrapNegative &&
        safeBase < 0
      )
        ? `(${safeBase})`
        : String(safeBase);

    return (
      `${baseText}` +
      `<sup>${safeExponent}</sup>`
    );
  }

  /*
  ==================================================
  對外提供
  ==================================================
  */

  window.MathGameUtils = {
    number: {
      toNumber,
      isSafeInteger,
      assertSafeInteger
    },

    random: {
      int:
        randomInt,

      nonZeroInt:
        randomNonZeroInt,

      sign:
        randomSign,

      chance,

      pick:
        pickRandom,

      shuffle,

      sample,

      fraction:
        randomFraction
    },

    randomInt,
    randomNonZeroInt,
    randomSign,
    chance,
    pickRandom,
    shuffle,
    sample,

    gcd,
    gcdMany,
    lcm,
    lcmMany,

    fraction: {
      create:
        createFraction,

      read:
        readFraction,

      normalize:
        normalizeFraction,

      simplify:
        normalizeFraction,

      add:
        addFractions,

      subtract:
        subtractFractions,

      multiply:
        multiplyFractions,

      divide:
        divideFractions,

      negate:
        negateFraction,

      absolute:
        absoluteFraction,

      reciprocal:
        reciprocalFraction,

      compare:
        compareFractions,

      equals:
        fractionsEqual,

      isInteger:
        isIntegerFraction,

      toNumber:
        fractionToNumber,

      toMixed:
        toMixedNumber,

      fromMixed:
        fromMixedNumber,

      toText:
        fractionToText,

      toMixedText:
        mixedNumberToText,

      toHTML:
        fractionToHTML,

      random:
        randomFraction
    },

    format: {
      integer:
        formatInteger,

      signedTerm:
        formatSignedTerm,

      power:
        formatPower,

      fraction:
        fractionToText,

      mixedNumber:
        mixedNumberToText,

      fractionHTML:
        fractionToHTML
    }
  };

  console.log(
    "MathGameUtils 共用數學工具已載入。"
  );
})();