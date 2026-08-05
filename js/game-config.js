/*
==================================================
數學遊戲樂園：遊戲共用設定
檔案位置：js/game-config.js
==================================================

功能：
1. 集中管理所有遊戲名稱
2. 集中管理遊戲排列順序
3. 集中管理遊戲路徑
4. 集中管理遊戲介紹
5. 集中管理開發狀態
6. 集中管理各遊戲模式名稱
7. 集中管理首頁卡片配色
8. 集中管理遊戲難度與標籤

之後新增遊戲時，
主要只需要修改這個檔案。
==================================================
*/

export const GAME_CONFIG = {
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

    theme: {
      primary:
        "#1976D2",

      dark:
        "#125CA6",

      light:
        "#E3F2FD",

      border:
        "#90CAF9"
    },

    modes: {
      "1":
        "模式一",

      "2":
        "模式二",

      "3":
        "模式三",

      "4":
        "模式四"
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

    theme: {
      primary:
        "#F57C00",

      dark:
        "#D86600",

      light:
        "#FFF3E0",

      border:
        "#FFCC80"
    },

    modes: {
      "1":
        "模式一",

      "2":
        "模式二",

      "3":
        "模式三",

      "4":
        "模式四"
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

    theme: {
      primary:
        "#2E7D32",

      dark:
        "#1B5E20",

      light:
        "#E8F5E9",

      border:
        "#A5D6A7"
    },

    modes: {
      lcm:
        "最小公倍數複習",

      fraction:
        "正負分數加減"
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
      false,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    theme: {
      primary:
        "#5E35B1",

      dark:
        "#4527A0",

      light:
        "#EDE7F6",

      border:
        "#B39DDB"
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

    theme: {
      primary:
        "#8E24AA",

      dark:
        "#6A1B9A",

      light:
        "#F3E5F5",

      border:
        "#CE93D8"
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
    }
  },

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
      false,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    theme: {
      primary:
        "#00897B",

      dark:
        "#00695C",

      light:
        "#E0F2F1",

      border:
        "#80CBC4"
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
    }
  },

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
      "解方程式闖關，練習移項、等量公理與分數方程式。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      false,

    theme: {
      primary:
        "#E53935",

      dark:
        "#C62828",

      light:
        "#FFEBEE",

      border:
        "#EF9A9A"
    },

    modes: {
      "1":
        "模式一",

      "2":
        "模式二",

      "3":
        "模式三",

      "4":
        "模式四"
    }
  },

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

    theme: {
      primary:
        "#3949AB",

      dark:
        "#283593",

      light:
        "#E8EAF6",

      border:
        "#9FA8DA"
    },

    modes: {}
  },

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

    theme: {
      primary:
        "#039BE5",

      dark:
        "#0277BD",

      light:
        "#E1F5FE",

      border:
        "#81D4FA"
    },

    modes: {}
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

    theme: {
      primary:
        "#F4511E",

      dark:
        "#D84315",

      light:
        "#FBE9E7",

      border:
        "#FFAB91"
    },

    modes: {}
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

    theme: {
      primary:
        "#00838F",

      dark:
        "#006064",

      light:
        "#E0F7FA",

      border:
        "#80DEEA"
    },

    modes: {}
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
    GAME_CONFIG[gameId] ||
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
    GAME_CONFIG[gameId]?.name ||
    gameId ||
    "數學遊戲"
  );
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
    String(mode);

  return (
    GAME_CONFIG[gameId]
      ?.modes?.[modeKey] ||
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
    GAME_CONFIG[gameId]?.theme || {
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
      GAME_CONFIG[gameId]
        ?.difficulty
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
取得難度星號文字
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
      (game) =>
        game.semester ===
        semester
    )
    .sort(
      (gameA, gameB) =>
        gameA.order -
        gameB.order
    );
}


/*
==================================================
取得已完成的遊戲
==================================================
*/

export function getFinishedGames() {
  return Object.values(
    GAME_CONFIG
  )
    .filter(
      (game) =>
        game.finished ===
        true
    )
    .sort(
      (gameA, gameB) => {
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
      (game) =>
        game.finished === true &&
        game.recommended === true
    )
    .sort(
      (gameA, gameB) =>
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
      (game) =>
        game.finished === true &&
        game.isNew === true
    )
    .sort(
      (gameA, gameB) =>
        gameA.order -
        gameB.order
    );
}


/*
==================================================
取得遊戲排列順序
==================================================
*/

export function getGameOrder() {
  return getFinishedGames()
    .map(
      (game) =>
        game.id
    );
}


/*
==================================================
檢查遊戲是否已完成
==================================================
*/

export function isGameFinished(
  gameId
) {
  return (
    GAME_CONFIG[gameId]
      ?.finished === true
  );
}


/*
==================================================
建立遊戲完整顯示名稱
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

  const modeName =
    getModeName(
      gameId,
      mode
    );

  if (!modeName) {
    return gameName;
  }

  return (
    `${gameName}｜${modeName}`
  );
}