/*
==================================================
生活有解．心中有數：遊戲共用設定
檔案位置：js/game-config.js

版本：6.8
排行榜模式名稱同步修正版
==================================================

重要原則：

1. GAME_CONFIG 的 key
2. game.id
3. 遊戲 HTML 中 saveGameScore({ game: ... }) 的 game
4. Firestore 已儲存的 game

以上最好保持一致。

另外：

modes 的 key 必須與各遊戲實際儲存到
Firestore 的 mode 完全一致。

本版重點：
一元一次方程式仍使用：
"1"、"2"、"3"、"4"

只修改中文顯示名稱，
因此舊排行榜成績完全不需要重新測驗。
==================================================
*/


export const GAME_CONFIG = {


  /*
  ==================================================
  七年級上學期
  ==================================================
  */


  /*
  --------------------------------------------------
  1. 正負整數大挑戰
  --------------------------------------------------
  */

  integer: {

    id:
      "integer",

    name:
      "正負整數大挑戰",

    shortName:
      "正負整數",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      1,

    icon:
      "🎮",

    file:
      "games/integer.html",

    description:
      "七年級正負整數加減法，挑戰計算速度與正確率。",

    finished:
      true,

    difficulty:
      1,

    recommended:
      true,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {},

    theme: {

      primary:
        "#1976D2",

      dark:
        "#125CA6",

      light:
        "#E3F2FD",

      border:
        "#90CAF9"

    }

  },


  /*
  --------------------------------------------------
  2. 數的大小比較王
  --------------------------------------------------
  */

  compare: {

    id:
      "compare",

    name:
      "數的大小比較王",

    shortName:
      "數的大小比較",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      2,

    icon:
      "⚖️",

    file:
      "games/compare.html",

    description:
      "挑戰整數、分數與小數的大小比較，選出正確的 ＞、＝或＜。",

    finished:
      true,

    difficulty:
      1,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {

      easy:
        "初級｜整數比較",

      medium:
        "中級｜整數與分數",

      hard:
        "高級｜混合比較"

    },

    theme: {

      primary:
        "#F57C00",

      dark:
        "#D86600",

      light:
        "#FFF3E0",

      border:
        "#FFCC80"

    }

  },


  /*
  --------------------------------------------------
  3. 正負分數加減大挑戰
  --------------------------------------------------
  */

  fraction: {

    id:
      "fraction",

    name:
      "正負分數加減大挑戰",

    shortName:
      "正負分數加減",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      3,

    icon:
      "➗",

    file:
      "games/fraction.html",

    description:
      "先複習最小公倍數，再挑戰正負分數的同分母與異分母加減。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {

      lcm:
        "最小公倍數複習",

      fraction:
        "正負分數加減"

    },

    theme: {

      primary:
        "#2E7D32",

      dark:
        "#1B5E20",

      light:
        "#E8F5E9",

      border:
        "#A5D6A7"

    }

  },


  /*
  --------------------------------------------------
  4. 指數律大挑戰
  --------------------------------------------------
  */

  exponent: {

    id:
      "exponent",

    name:
      "指數律大挑戰",

    shortName:
      "指數律",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      4,

    icon:
      "🔢",

    file:
      "games/exponent.html",

    description:
      "練習同底數相乘、相除、冪的乘方、零次方與綜合指數律。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      multiplication:
        "同底數相乘",

      division:
        "同底數相除",

      powerOfPower:
        "冪的乘方",

      zeroExponent:
        "零次方",

      mixed:
        "綜合指數律"

    },

    theme: {

      primary:
        "#5E35B1",

      dark:
        "#4527A0",

      light:
        "#EDE7F6",

      border:
        "#B39DDB"

    }

  },


  /*
  --------------------------------------------------
  5. 正負數四則運算大挑戰
  --------------------------------------------------
  */

  "integer-operations": {

    id:
      "integer-operations",

    name:
      "正負數四則運算大挑戰",

    shortName:
      "正負數四則運算",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      5,

    icon:
      "➕",

    file:
      "games/integer-operations.html",

    description:
      "練習正負數乘除、絕對值、乘方，以及整數與分數混合四則運算。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      true,

    isNew:
      true,

    ranking: {

      type:
        "timed"

    },

    modes: {

      muldiv:
        "正負數的乘除",

      absolute:
        "絕對值運算",

      power:
        "乘方計算",

      mixed:
        "四則運算",

      advanced:
        "四則運算進階挑戰"

    },

    theme: {

      primary:
        "#8E24AA",

      dark:
        "#6A1B9A",

      light:
        "#F3E5F5",

      border:
        "#CE93D8"

    }

  },


  /*
  --------------------------------------------------
  6. 質因數分解、公因數公倍數大挑戰
  --------------------------------------------------
  */

  factor: {

    id:
      "factor",

    name:
      "質因數分解、公因數公倍數大挑戰",

    shortName:
      "質因數分解與公因數公倍數",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      6,

    icon:
      "🧩",

    file:
      "games/factor.html",

    description:
      "練習質因數分解，並用指數形式求最大公因數與最小公倍數。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {

      primeFactorization:
        "質因數分解",

      gcd:
        "最大公因數",

      lcm:
        "最小公倍數",

      mixed:
        "綜合挑戰"

    },

    theme: {

      primary:
        "#00897B",

      dark:
        "#00695C",

      light:
        "#E0F2F1",

      border:
        "#80CBC4"

    }

  },


  /*
  --------------------------------------------------
  7. 一元一次方程式

  equation.html 實際儲存：
  mode = "1" / "2" / "3" / "4"

  ★ 此處不可改成 basic 等英文 key。
  --------------------------------------------------
  */

  equation: {

    id:
      "equation",

    name:
      "一元一次方程式",

    shortName:
      "一元一次方程式",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      7,

    icon:
      "🧮",

    file:
      "games/equation.html",

    description:
      "解方程式闖關，練習移項、等量公理、括號化簡與分數方程式。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    /*
    ==================================================
    ★ 這裡就是本次真正修正的位置

    key 完全不動：
    "1"、"2"、"3"、"4"

    只把原本：
    模式一
    模式二
    模式三
    模式四

    改為正式模式名稱。
    ==================================================
    */

    modes: {

      "1":
        "基本一元一次方程式",

      "2":
        "移項與合併同類項",

      "3":
        "括號、負號與化簡",

      "4":
        "分數係數方程式"

    },

    theme: {

      primary:
        "#E53935",

      dark:
        "#C62828",

      light:
        "#FFEBEE",

      border:
        "#EF9A9A"

    }

  },


  /*
  ==================================================
  七年級下學期
  ==================================================
  */


  /*
  --------------------------------------------------
  二元一次聯立方程式
  --------------------------------------------------
  */

  simultaneousEquation: {

    id:
      "simultaneousEquation",

    name:
      "二元一次聯立方程式",

    shortName:
      "二元一次聯立方程式",

    semester:
      "grade7-second",

    grade:
      7,

    order:
      1,

    icon:
      "🔢",

    file:
      "games/simultaneous-equation.html",

    description:
      "練習代入消去法與加減消去法，解出兩個未知數。",

    finished:
      false,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {},

    theme: {

      primary:
        "#3949AB",

      dark:
        "#283593",

      light:
        "#E8EAF6",

      border:
        "#9FA8DA"

    }

  },


  /*
  --------------------------------------------------
  直角坐標與方程式圖形
  --------------------------------------------------
  */

  coordinate: {

    id:
      "coordinate",

    name:
      "直角坐標與方程式圖形",

    shortName:
      "直角坐標與方程式圖形",

    semester:
      "grade7-second",

    grade:
      7,

    order:
      2,

    icon:
      "📍",

    file:
      "games/coordinate.html",

    description:
      "認識坐標平面，練習描點與判讀二元一次方程式圖形。",

    finished:
      false,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {},

    theme: {

      primary:
        "#039BE5",

      dark:
        "#0277BD",

      light:
        "#E1F5FE",

      border:
        "#81D4FA"

    }

  },


  /*
  --------------------------------------------------
  比例式、正比與反比
  --------------------------------------------------
  */

  ratio: {

    id:
      "ratio",

    name:
      "比例式、正比與反比",

    shortName:
      "比例式、正比與反比",

    semester:
      "grade7-second",

    grade:
      7,

    order:
      3,

    icon:
      "📏",

    file:
      "games/ratio.html",

    description:
      "練習比例式、正比、反比與實際應用題。",

    finished:
      false,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {},

    theme: {

      primary:
        "#F4511E",

      dark:
        "#D84315",

      light:
        "#FBE9E7",

      border:
        "#FFAB91"

    }

  },


  /*
  --------------------------------------------------
  統計圖表
  --------------------------------------------------
  */

  statistics: {

    id:
      "statistics",

    name:
      "統計圖表",

    shortName:
      "統計圖表",

    semester:
      "grade7-second",

    grade:
      7,

    order:
      4,

    icon:
      "📊",

    file:
      "games/statistics.html",

    description:
      "練習次數分配、統計圖表與資料判讀。",

    finished:
      false,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {},

    theme: {

      primary:
        "#00838F",

      dark:
        "#006064",

      light:
        "#E0F7FA",

      border:
        "#80DEEA"

    }

  },


  /*
  ==================================================
  八年級上學期
  ==================================================
  */


  /*
  --------------------------------------------------
  1. 乘法公式大挑戰
  --------------------------------------------------
  */

  multiplicationFormula: {

    id:
      "multiplicationFormula",

    name:
      "乘法公式大挑戰",

    shortName:
      "乘法公式",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      1,

    icon:
      "🧩",

    file:
      "games/multiplication-formula.html",

    description:
      "練習平方公式、平方差公式，以及乘法公式的展開與判讀。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {},

    theme: {

      primary:
        "#3F51B5",

      dark:
        "#303F9F",

      light:
        "#E8EAF6",

      border:
        "#9FA8DA"

    }

  },


  /*
  --------------------------------------------------
  2. 多項式加減大挑戰
  --------------------------------------------------
  */

  polynomialAddSubtract: {

    id:
      "polynomialAddSubtract",

    name:
      "多項式加減大挑戰",

    shortName:
      "多項式加減",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      2,

    icon:
      "➕",

    file:
      "games/polynomial-add-subtract.html",

    description:
      "練習同類項合併、去括號，以及多項式的加法與減法。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      likeTerms:
        "同類項加減",

      addSubtract:
        "多項式加減法",

      mixed:
        "多項式綜合挑戰",

      advanced:
        "進階綜合挑戰"

    },

    theme: {

      primary:
        "#00897B",

      dark:
        "#00695C",

      light:
        "#E0F2F1",

      border:
        "#80CBC4"

    }

  },


  /*
  --------------------------------------------------
  3. 多項式乘除大挑戰
  --------------------------------------------------
  */

  polynomialMultiplyDivide: {

    id:
      "polynomialMultiplyDivide",

    name:
      "多項式乘除大挑戰",

    shortName:
      "多項式乘除",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      3,

    icon:
      "✖️",

    file:
      "games/polynomial-multiply-divide.html",

    description:
      "練習單項式乘除、分配律、乘法公式、多項式乘法與多項式除法。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      monomial:
        "單項式乘除",

      multiply:
        "多項式乘法",

      divide:
        "多項式除法",

      mixed:
        "乘除綜合挑戰"

    },

    theme: {

      primary:
        "#7B1FA2",

      dark:
        "#6A1B9A",

      light:
        "#F3E5F5",

      border:
        "#CE93D8"

    }

  },


  /*
  --------------------------------------------------
  4. 平方根
  --------------------------------------------------
  */

  squareRoot: {

    id:
      "squareRoot",

    name:
      "平方根概念大挑戰",

    shortName:
      "平方根",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      4,

    icon:
      "√",

    file:
      "games/square-root.html",

    description:
      "認識平方根、根號表示，以及平方與平方根之間的關係。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {},

    theme: {

      primary:
        "#0288D1",

      dark:
        "#0277BD",

      light:
        "#E1F5FE",

      border:
        "#81D4FA"

    }

  },


  /*
  --------------------------------------------------
  5. 根式運算
  --------------------------------------------------
  */

  radicalOperation: {

    id:
      "radicalOperation",

    name:
      "根式運算大挑戰",

    shortName:
      "根式運算",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      5,

    icon:
      "🌱",

    file:
      "games/radical-operation.html",

    description:
      "練習根式化簡、根式乘除，以及同類方根的加減運算。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      multiply:
        "根式乘法",

      divide:
        "除法與有理化",

      addSubtract:
        "根式加減",

      mixed:
        "根式四則綜合"

    },

    theme: {

      primary:
        "#43A047",

      dark:
        "#2E7D32",

      light:
        "#E8F5E9",

      border:
        "#A5D6A7"

    }

  },


  /*
  --------------------------------------------------
  6. 畢氏定理
  --------------------------------------------------
  */

  pythagorean: {

    id:
      "pythagorean",

    name:
      "畢氏定理大挑戰",

    shortName:
      "畢氏定理",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      6,

    icon:
      "📐",

    file:
      "games/pythagorean.html",

    description:
      "利用畢氏定理求邊長，並挑戰直角三角形、生活應用與兩點間距離。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      basic:
        "基本直角三角形",

      application:
        "生活應用與斜邊上的高",

      distance:
        "兩點間的距離"

    },

    theme: {

      primary:
        "#F57C00",

      dark:
        "#E65100",

      light:
        "#FFF3E0",

      border:
        "#FFCC80"

    }

  },


  /*
  --------------------------------------------------
  7. 因式分解大挑戰
  --------------------------------------------------
  */

  factorization: {

    id:
      "factorization",

    name:
      "因式分解大挑戰",

    shortName:
      "因式分解",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      7,

    icon:
      "🧩",

    file:
      "games/factorization-challenge.html",

    description:
      "練習提單項公因式、提兩項公因式、變號後提公因式，以及利用乘法公式進行因式分解。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      monomial:
        "提單項公因式",

      grouping:
        "提兩項或變號提公因式",

      formula:
        "乘法公式因式分解"

    },

    theme: {

      primary:
        "#00897B",

      dark:
        "#00695C",

      light:
        "#E0F2F1",

      border:
        "#80CBC4"

    }

  },


  /*
  --------------------------------------------------
  8. 十字交乘因式分解
  --------------------------------------------------
  */

  crossMultiplication: {

    id:
      "crossMultiplication",

    name:
      "十字交乘因式分解大挑戰",

    shortName:
      "十字交乘",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      8,

    icon:
      "❌",

    file:
      "games/cross-factorization.html",

    description:
      "練習二次項係數為 1、一般十字交乘，以及先提公因式、乘法公式與分數型態的綜合因式分解。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      leadingOne:
        "平方項係數為 1",

      general:
        "平方項係數不為 1",

      mixed:
        "進階綜合"

    },

    theme: {

      primary:
        "#D81B60",

      dark:
        "#AD1457",

      light:
        "#FCE4EC",

      border:
        "#F48FB1"

    }

  },


  /*
  --------------------------------------------------
  9. 一元二次方程式
  --------------------------------------------------
  */

  quadraticEquation: {

    id:
      "quadraticEquation",

    name:
      "一元二次方程式大挑戰",

    shortName:
      "一元二次方程式",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      9,

    icon:
      "x²",

    file:
      "games/quadratic-equation.html",

    description:
      "練習基礎概念、因式分解法、平方根與配方法、公式解與判別式，以及一元二次方程式應用問題。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      true,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    /*
    quadratic-equation.html 目前實際 mode
    */

    modes: {

      basic:
        "基礎概念",

      factor:
        "因式分解法",

      completeSquare:
        "平方根與配方法",

      formula:
        "公式解與判別式",

      application:
        "一元二次應用問題",

      mixed:
        "全章綜合挑戰"

    },

    theme: {

      primary:
        "#1565C0",

      dark:
        "#0D47A1",

      light:
        "#E3F2FD",

      border:
        "#90CAF9"

    }

  }

};



/*
==================================================
取得單一遊戲設定
==================================================
*/

export function getGameConfig(
  gameId
) {

  return (
    GAME_CONFIG[
      gameId
    ] ||
    null
  );
}



/*
==================================================
取得遊戲中文名稱
==================================================
*/

export function getGameName(
  gameId
) {

  return (
    GAME_CONFIG[
      gameId
    ]?.name ||
    gameId ||
    "數學遊戲"
  );
}



/*
==================================================
取得遊戲短名稱
==================================================
*/

export function getGameShortName(
  gameId
) {

  return (
    GAME_CONFIG[
      gameId
    ]?.shortName ||
    GAME_CONFIG[
      gameId
    ]?.name ||
    gameId ||
    "數學遊戲"
  );
}



/*
==================================================
取得遊戲模式
==================================================
*/

export function getGameModes(
  gameId
) {

  const modes =
    GAME_CONFIG[
      gameId
    ]?.modes;


  if (
    !modes ||
    typeof modes !==
      "object"
  ) {

    return {};
  }


  return modes;
}



/*
==================================================
取得遊戲模式數量
==================================================
*/

export function getGameModeCount(
  gameId
) {

  return Object.keys(
    getGameModes(
      gameId
    )
  ).length;
}



/*
==================================================
取得遊戲模式中文名稱
==================================================
*/

export function getModeName(
  gameId,
  mode
) {

  if (
    mode === undefined ||
    mode === null ||
    mode === ""
  ) {

    return "";
  }


  const modeKey =
    String(
      mode
    );


  return (
    GAME_CONFIG[
      gameId
    ]?.modes?.[
      modeKey
    ] ||
    modeKey
  );
}



/*
==================================================
取得遊戲主題
==================================================
*/

export function getGameTheme(
  gameId
) {

  return (
    GAME_CONFIG[
      gameId
    ]?.theme ||
    {

      primary:
        "#1976D2",

      dark:
        "#125CA6",

      light:
        "#E3F2FD",

      border:
        "#90CAF9"

    }
  );
}



/*
==================================================
取得遊戲難度
==================================================
*/

export function getGameDifficulty(
  gameId
) {

  const difficulty =
    Number(
      GAME_CONFIG[
        gameId
      ]?.difficulty
    );


  if (
    !Number.isFinite(
      difficulty
    )
  ) {

    return 1;
  }


  return Math.min(
    3,
    Math.max(
      1,
      Math.round(
        difficulty
      )
    )
  );
}



/*
==================================================
難度星號
==================================================
*/

export function getDifficultyStars(
  gameId
) {

  return "⭐".repeat(
    getGameDifficulty(
      gameId
    )
  );
}



/*
==================================================
取得全部遊戲
==================================================
*/

export function getAllGames() {

  return Object.values(
    GAME_CONFIG
  );
}



/*
==================================================
依學期取得遊戲
==================================================
*/

export function getGamesBySemester(
  semester
) {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game =>
        game.semester ===
        semester
    )
    .sort(
      (
        gameA,
        gameB
      ) =>
        gameA.order -
        gameB.order
    );
}



/*
==================================================
取得已完成遊戲
==================================================
*/

export function getFinishedGames() {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game =>
        game.finished ===
        true
    )
    .sort(
      (
        gameA,
        gameB
      ) => {

        if (
          gameA.semester ===
          gameB.semester
        ) {

          return (
            gameA.order -
            gameB.order
          );
        }


        return gameA.semester
          .localeCompare(
            gameB.semester
          );
      }
    );
}



/*
==================================================
依學期取得已完成遊戲
==================================================
*/

export function getFinishedGamesBySemester(
  semester
) {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game =>
        game.semester ===
          semester &&
        game.finished ===
          true
    )
    .sort(
      (
        gameA,
        gameB
      ) =>
        gameA.order -
        gameB.order
    );
}



/*
==================================================
依年級取得遊戲
==================================================
*/

export function getGamesByGrade(
  grade
) {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game =>
        game.grade ===
        Number(
          grade
        )
    )
    .sort(
      (
        gameA,
        gameB
      ) =>
        gameA.order -
        gameB.order
    );
}



/*
==================================================
推薦遊戲
==================================================
*/

export function getRecommendedGames() {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game =>
        game.finished ===
          true &&
        game.recommended ===
          true
    )
    .sort(
      (
        gameA,
        gameB
      ) =>
        gameA.order -
        gameB.order
    );
}



/*
==================================================
新遊戲
==================================================
*/

export function getNewGames() {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game =>
        game.finished ===
          true &&
        game.isNew ===
          true
    )
    .sort(
      (
        gameA,
        gameB
      ) =>
        gameA.order -
        gameB.order
    );
}



/*
==================================================
遊戲排列
==================================================
*/

export function getGameOrder() {

  return getFinishedGames()
    .map(
      game =>
        game.id
    );
}



/*
==================================================
是否已上架
==================================================
*/

export function isGameFinished(
  gameId
) {

  return (
    GAME_CONFIG[
      gameId
    ]?.finished ===
    true
  );
}



/*
==================================================
排行榜類型
==================================================
*/

export function getGameRankingType(
  gameId
) {

  const type =
    GAME_CONFIG[
      gameId
    ]?.ranking?.type;


  return (
    type ===
      "timed"

      ? "timed"

      : "speed"
  );
}



/*
==================================================
是否為固定時間排行榜
==================================================
*/

export function isTimedRankingGame(
  gameId
) {

  return (
    getGameRankingType(
      gameId
    ) ===
    "timed"
  );
}



/*
==================================================
是否為多模式遊戲
==================================================
*/

export function isMultiModeGame(
  gameId
) {

  return (
    getGameModeCount(
      gameId
    ) >
    1
  );
}



/*
==================================================
取得完整顯示名稱
==================================================
*/

export function getGameDisplayName(
  gameId,
  mode
) {

  const gameName =
    getGameName(
      gameId
    );


  if (
    !isMultiModeGame(
      gameId
    )
  ) {

    return gameName;
  }


  const modeName =
    getModeName(
      gameId,
      mode
    );


  if (
    !modeName
  ) {

    return gameName;
  }


  return (
    `${gameName}｜${modeName}`
  );
}



/*
==================================================
確認設定檔載入
==================================================
*/

console.log(
  "game-config.js v6.8 已成功載入"
);


console.log(
  "正式上架遊戲數量：",
  getFinishedGames()
    .length
);


console.log(
  "七年級上學期：",
  getFinishedGamesBySemester(
    "grade7-first"
  )
    .map(
      game =>
        game.name
    )
);


console.log(
  "八年級上學期：",
  getFinishedGamesBySemester(
    "grade8-first"
  )
    .map(
      game =>
        game.name
    )
);