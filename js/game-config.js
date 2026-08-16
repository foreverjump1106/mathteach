/*
==================================================
數學遊戲樂園：遊戲共用設定
檔案位置：js/game-config.js

版本：7.0
八上六款正式上線版
==================================================

功能：
1. 集中管理所有遊戲名稱
2. 集中管理遊戲排列順序
3. 集中管理遊戲路徑
4. 集中管理遊戲介紹
5. 集中管理開發狀態
6. 集中管理各遊戲模式
7. 集中管理排行榜類型
8. 集中管理首頁卡片配色
9. 集中管理遊戲難度與標籤

排行榜：

ranking.type = "timed"
固定時間挑戰型
排序：
1. 分數高
2. 答對多
3. 答錯少
4. 最高連擊高
5. 較早達成

ranking.type = "speed"
固定題數／完成型
排序：
1. 分數高
2. 完成時間短
3. 答對多
4. 答錯少
5. 最高連擊高
6. 較早達成

重要：
modes 的 key
必須與各遊戲存入 Firestore 的 mode 完全一致。
==================================================
*/


export const GAME_CONFIG = {


  /*
  ==================================================
  七年級上學期
  ==================================================
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
      "🧮",

    file:
      "games/integer-operations.html",

    description:
      "綜合挑戰正負數的加、減、乘、除與四則混合運算。",

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

      multiplicationDivision:
        "正負數乘除",

      mixed:
        "四則混合運算"
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


  factor: {

    id:
      "factor",

    name:
      "質因數分解大挑戰",

    shortName:
      "質因數分解",

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
      "練習質數、質因數分解、公因數、公倍數與相關計算。",

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
        "#C62828",

      dark:
        "#B71C1C",

      light:
        "#FFEBEE",

      border:
        "#EF9A9A"
    }
  },


  equation: {

    id:
      "equation",

    name:
      "一元一次方程式大挑戰",

    shortName:
      "一元一次方程式",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      7,

    icon:
      "🎯",

    file:
      "games/equation.html",

    description:
      "從基本移項到括號、分數與課本應用題，挑戰一元一次方程式。",

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
        "基礎方程式",

      negative:
        "負數與移項",

      fraction:
        "分數方程式",

      application:
        "綜合應用"
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
  },


  /*
  ==================================================
  七年級下學期
  ==================================================
  */


  linearExpression: {

    id:
      "linearExpression",

    name:
      "一元一次式",

    shortName:
      "一元一次式",

    semester:
      "grade7-second",

    grade:
      7,

    order:
      1,

    icon:
      "✏️",

    file:
      "games/linear-expression.html",

    description:
      "練習一元一次式的化簡、代入與基本計算。",

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
        "speed"
    },

    modes: {},

    theme: {

      primary:
        "#7E57C2",

      dark:
        "#5E35B1",

      light:
        "#EDE7F6",

      border:
        "#B39DDB"
    }
  },


  coordinate: {

    id:
      "coordinate",

    name:
      "直角坐標與二元一次方程式",

    shortName:
      "直角坐標",

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
      "練習直角坐標平面、座標判讀與二元一次方程式。",

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
        "speed"
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
  ★ 第一階段正式開放六款
  ==================================================
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
      true,

    isNew:
      true,

    ranking: {

      type:
        "speed"
    },

    modes: {

      numberBasic:
        "數字乘法公式",

      numberMixed:
        "數字變化計算",

      polynomial:
        "多項式與公式判讀",

      mixed:
        "乘法公式綜合挑戰"
    },

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
      "練習單項式乘除、多項式乘法，以及多項式除法。",

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
      "熟練平方數、平方根、根式化簡、十分逼近與平方根觀念。",

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

      squarePractice:
        "平方數熟練場",

      simplify:
        "根式化簡訓練",

      approximation:
        "根號值與十分逼近",

      meaning:
        "平方根觀念應用"
    },

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
  ★ 注意
  遊戲真正存入 Firestore 的 ID 是 radicalOperations，
  不是舊版 radicalOperation。
  */


  radicalOperations: {

    id:
      "radicalOperations",

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
      "games/radical-operations.html",

    description:
      "練習根式乘法、根式除法、分母有理化、根式加減與四則運算。",

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
      "利用畢氏定理求邊長、判斷直角三角形、解生活應用與兩點距離。",

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
        "畢氏定理基礎",

      application:
        "生活應用與斜邊上的高",

      distance:
        "平面上兩點的距離"
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
  ==================================================
  八上後續遊戲
  目前仍維持未開放
  ==================================================
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
      "games/factorization.html",

    description:
      "練習提公因式，以及利用乘法公式進行因式分解。",

    finished:
      false,

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

    modes: {},

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


  crossMultiplication: {

    id:
      "crossMultiplication",

    name:
      "十字交乘大挑戰",

    shortName:
      "十字交乘",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      8,

    icon:
      "❎",

    file:
      "games/cross-multiplication.html",

    description:
      "利用十字交乘法，挑戰二次三項式的因式分解。",

    finished:
      false,

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

    modes: {},

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
      "🎯",

    file:
      "games/quadratic-equation.html",

    description:
      "練習因式分解法、配方法、公式解與一元二次方程式應用題。",

    finished:
      false,

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

      factorization:
        "因式分解法",

      completingSquare:
        "配方法",

      formula:
        "公式解",

      mixed:
        "混合挑戰",

      application:
        "應用問題"
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
取得遊戲主題配色
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
取得難度星號
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
依學期取得所有遊戲
包含尚未完成遊戲
主要提供首頁預建卡片使用
==================================================
*/

export function getGamesBySemester(
  semester
) {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      (
        game
      ) =>
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
依學期取得「正式開放」遊戲
排行榜可直接使用此函式
==================================================
*/

export function getFinishedGamesBySemester(
  semester
) {

  return getGamesBySemester(
    semester
  )
    .filter(
      (
        game
      ) =>
        game.finished ===
        true
    );
}


/*
==================================================
取得全部已完成遊戲
==================================================
*/

export function getFinishedGames() {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      (
        game
      ) =>
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
取得推薦遊戲
==================================================
*/

export function getRecommendedGames() {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      (
        game
      ) =>
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
取得新遊戲
==================================================
*/

export function getNewGames() {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      (
        game
      ) =>
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
取得遊戲排列順序
「我的成績」會使用這個順序
==================================================
*/

export function getGameOrder() {

  return getFinishedGames()
    .map(
      (
        game
      ) =>
        game.id
    );
}


/*
==================================================
取得排行榜類型
==================================================
*/

export function getRankingType(
  gameId
) {

  const type =
    getGameConfig(
      gameId
    )?.ranking?.type;


  return (
    type ===
    "timed"

      ? "timed"

      : "speed"
  );
}


/*
==================================================
確認遊戲是否完成
==================================================
*/

export function isGameFinished(
  gameId
) {

  return (
    getGameConfig(
      gameId
    )?.finished ===
    true
  );
}


/*
==================================================
取得遊戲路徑
==================================================
*/

export function getGameFile(
  gameId
) {

  return (
    getGameConfig(
      gameId
    )?.file ||
    ""
  );
}
