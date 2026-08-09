/*
==================================================
數學遊戲樂園：遊戲共用設定
檔案位置：js/game-config.js
版本：排行榜模式同步版
==================================================

排行榜判定原則：

1. modes: {}
   → 單模式遊戲
   → 排行榜直接顯示前 20 名
   → 不顯示模式按鈕

2. modes 有兩個以上項目
   → 多模式遊戲
   → 每個模式各自獨立前 20 名

3. modes 的 key
   必須與遊戲實際儲存的 mode 完全一致。

4. 排行榜以本檔案作為正式模式來源，
   不再因 Firestore 舊資料自動產生「其他模式」。
==================================================
*/

export const GAME_CONFIG = {

  /*
  ==================================================
  1. 正負整數大挑戰
  單模式
  ==================================================
  */

  integer: {
    id: "integer",

    name: "正負整數大挑戰",

    shortName: "正負整數",

    semester: "grade7-first",

    grade: 7,

    order: 1,

    icon: "🎮",

    file: "games/integer.html",

    description:
      "七年級正負整數加減法，挑戰計算速度與正確率。",

    finished: true,

    difficulty: 1,

    recommended: true,

    isNew: false,

    theme: {
      primary: "#1976D2",
      dark: "#125CA6",
      light: "#E3F2FD",
      border: "#90CAF9"
    },

    /*
    正負整數目前沒有模式選擇，
    因此是單模式遊戲。
    */

    modes: {}
  },


  /*
  ==================================================
  2. 數的大小比較王
  三模式
  ==================================================
  */

  compare: {
    id: "compare",

    name: "數的大小比較王",

    shortName: "數的大小比較",

    semester: "grade7-first",

    grade: 7,

    order: 2,

    icon: "⚖️",

    file: "games/compare.html",

    description:
      "挑戰整數、分數與小數的大小比較，選出正確的 ＞、＝或＜。",

    finished: true,

    difficulty: 1,

    recommended: false,

    isNew: false,

    theme: {
      primary: "#F57C00",
      dark: "#D86600",
      light: "#FFF3E0",
      border: "#FFCC80"
    },

    /*
    與 compare.html 實際 data-mode 一致
    */

    modes: {
      easy:
        "初級｜正整數與負整數",

      medium:
        "中級｜整數與分數",

      hard:
        "高級｜整數、分數與小數"
    }
  },


  /*
  ==================================================
  3. 正負分數加減大挑戰
  二模式
  ==================================================
  */

  fraction: {
    id: "fraction",

    name: "正負分數加減大挑戰",

    shortName: "正負分數加減",

    semester: "grade7-first",

    grade: 7,

    order: 3,

    icon: "➗",

    file: "games/fraction.html",

    description:
      "先複習最小公倍數，再挑戰正負分數的同分母與異分母加減。",

    finished: true,

    difficulty: 2,

    recommended: false,

    isNew: false,

    theme: {
      primary: "#2E7D32",
      dark: "#1B5E20",
      light: "#E8F5E9",
      border: "#A5D6A7"
    },

    modes: {
      lcm:
        "基礎複習｜最小公倍數",

      fraction:
        "正式挑戰｜正負分數加減"
    }
  },


  /*
  ==================================================
  4. 指數律大挑戰
  二模式
  目前尚未正式上線
  ==================================================
  */

  exponent: {
    id: "exponent",

    name: "指數律大挑戰",

    shortName: "指數律",

    semester: "grade7-first",

    grade: 7,

    order: 4,

    icon: "🔢",

    file: "games/exponent.html",

    description:
      "先整合練習基本指數律，再進入多種指數律混合的綜合挑戰。",

    finished: false,

    difficulty: 2,

    recommended: false,

    isNew: false,

    theme: {
      primary: "#5E35B1",
      dark: "#4527A0",
      light: "#EDE7F6",
      border: "#B39DDB"
    },

    modes: {
      "1":
        "模式一｜基礎練習",

      "2":
        "模式二｜綜合挑戰"
    }
  },


  /*
  ==================================================
  5. 正負數四則運算大挑戰
  五模式
  ==================================================
  */

  "integer-operations": {
    id: "integer-operations",

    name:
      "正負數四則運算大挑戰",

    shortName:
      "正負數四則運算",

    semester: "grade7-first",

    grade: 7,

    order: 5,

    icon: "➕",

    file:
      "games/integer-operations.html",

    description:
      "練習正負數乘除、絕對值、乘方，以及整數與分數混合四則運算。",

    finished: true,

    difficulty: 3,

    recommended: true,

    isNew: true,

    theme: {
      primary: "#8E24AA",
      dark: "#6A1B9A",
      light: "#F3E5F5",
      border: "#CE93D8"
    },

    modes: {
      muldiv:
        "模式一｜正負數的乘除",

      absolute:
        "模式二｜絕對值運算",

      power:
        "模式三｜乘方計算",

      mixed:
        "模式四｜四則運算",

      advanced:
        "模式五｜四則運算進階挑戰"
    }
  },


  /*
  ==================================================
  6. 質因數分解、公因數公倍數大挑戰
  四模式
  ==================================================
  */

  factor: {
    id: "factor",

    name:
      "質因數分解、公因數公倍數大挑戰",

    shortName:
      "質因數分解與公因數公倍數",

    semester: "grade7-first",

    grade: 7,

    order: 6,

    icon: "🧩",

    file: "games/factor.html",

    description:
      "練習質因數分解，並用指數形式求最大公因數與最小公倍數。",

    finished: true,

    difficulty: 2,

    recommended: false,

    isNew: false,

    theme: {
      primary: "#00897B",
      dark: "#00695C",
      light: "#E0F2F1",
      border: "#80CBC4"
    },

    modes: {
      primeFactorization:
        "模式一｜標準分解式",

      gcd:
        "模式二｜最大公因數",

      lcm:
        "模式三｜最小公倍數",

      mixed:
        "模式四｜進階混合"
    }
  },


  /*
  ==================================================
  7. 一元一次方程式
  四模式
  ==================================================
  */

  equation: {
    id: "equation",

    name: "一元一次方程式",

    shortName: "一元一次方程式",

    semester: "grade7-first",

    grade: 7,

    order: 7,

    icon: "🧮",

    file: "games/equation.html",

    description:
      "解方程式闖關，練習移項、等量公理、括號化簡與分數方程式。",

    finished: true,

    difficulty: 3,

    recommended: false,

    isNew: false,

    theme: {
      primary: "#E53935",
      dark: "#C62828",
      light: "#FFEBEE",
      border: "#EF9A9A"
    },

    modes: {
      "1":
        "模式一｜基本一元一次方程式",

      "2":
        "模式二｜移項與合併同類項",

      "3":
        "模式三｜括號、負號與化簡",

      "4":
        "模式四｜分數係數方程式"
    }
  },


  /*
  ==================================================
  七年級下學期
  尚未完成遊戲
  ==================================================
  */


  simultaneousEquation: {
    id: "simultaneousEquation",

    name: "二元一次聯立方程式",

    shortName:
      "二元一次聯立方程式",

    semester: "grade7-second",

    grade: 7,

    order: 1,

    icon: "🔢",

    file:
      "games/simultaneous-equation.html",

    description:
      "練習代入消去法與加減消去法，解出兩個未知數。",

    finished: false,

    difficulty: 3,

    recommended: false,

    isNew: false,

    theme: {
      primary: "#3949AB",
      dark: "#283593",
      light: "#E8EAF6",
      border: "#9FA8DA"
    },

    modes: {}
  },


  coordinate: {
    id: "coordinate",

    name:
      "直角坐標與方程式圖形",

    shortName:
      "直角坐標與方程式圖形",

    semester: "grade7-second",

    grade: 7,

    order: 2,

    icon: "📍",

    file:
      "games/coordinate.html",

    description:
      "認識坐標平面，練習描點與判讀二元一次方程式圖形。",

    finished: false,

    difficulty: 2,

    recommended: false,

    isNew: false,

    theme: {
      primary: "#039BE5",
      dark: "#0277BD",
      light: "#E1F5FE",
      border: "#81D4FA"
    },

    modes: {}
  },


  ratio: {
    id: "ratio",

    name:
      "比例式、正比與反比",

    shortName:
      "比例式、正比與反比",

    semester: "grade7-second",

    grade: 7,

    order: 3,

    icon: "📏",

    file:
      "games/ratio.html",

    description:
      "練習比例式、正比、反比與實際應用題。",

    finished: false,

    difficulty: 2,

    recommended: false,

    isNew: false,

    theme: {
      primary: "#F4511E",
      dark: "#D84315",
      light: "#FBE9E7",
      border: "#FFAB91"
    },

    modes: {}
  },


  statistics: {
    id: "statistics",

    name: "統計圖表",

    shortName: "統計圖表",

    semester: "grade7-second",

    grade: 7,

    order: 4,

    icon: "📊",

    file:
      "games/statistics.html",

    description:
      "練習次數分配、統計圖表與資料判讀。",

    finished: false,

    difficulty: 2,

    recommended: false,

    isNew: false,

    theme: {
      primary: "#00838F",
      dark: "#006064",
      light: "#E0F7FA",
      border: "#80DEEA"
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
取得正式模式設定
==================================================
*/

export function getGameModes(
  gameId
) {
  const modes =
    GAME_CONFIG[gameId]?.modes;

  if (
    !modes ||
    typeof modes !== "object"
  ) {
    return {};
  }

  return modes;
}


/*
==================================================
取得正式模式數量
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
判斷是否為多模式遊戲
==================================================
*/

export function isMultiModeGame(
  gameId
) {
  return (
    getGameModeCount(
      gameId
    ) > 1
  );
}


/*
==================================================
取得模式中文名稱
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
    getGameModes(
      gameId
    )[modeKey] ||
    ""
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
      primary: "#1976D2",
      dark: "#125CA6",
      light: "#E3F2FD",
      border: "#90CAF9"
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
      (game) =>
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
      (game) =>
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
      (game) =>
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
      ?.finished ===
      true
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
