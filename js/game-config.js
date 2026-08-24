/*
==================================================
數學遊戲樂園
共用遊戲設定

檔案位置：
js/game-config.js
==================================================

功能：

1. 統一管理所有數學遊戲
2. 首頁依照此檔案產生遊戲卡片
3. 管理年級、學期、排序
4. 管理遊戲名稱與網址
5. 管理遊戲是否正式上架
6. 管理排行榜模式
7. 管理遊戲主題顏色
==================================================
*/


/*
==================================================
遊戲設定
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
  正負數大挑戰
  --------------------------------------------------
  */

  integer: {

    id: "integer",

    name: "正負數大挑戰",

    shortName: "正負數",

    semester: "grade7-first",

    grade: 7,

    order: 1,

    icon: "➕➖",

    file:
      "games/integer-game.html",

    description:
      "練習正負數的加減乘除與混合運算。",

    finished: true,

    difficulty: 1,

    recommended: true,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      addition:
        "加減運算",

      multiplication:
        "乘除運算",

      mixed:
        "混合運算"

    },

    theme: {

      primary: "#1565C0",

      dark: "#0D47A1",

      light: "#E3F2FD",

      border: "#90CAF9"

    }

  },



  /*
  --------------------------------------------------
  數的大小比較王
  --------------------------------------------------
  */

  compare: {

    id: "compare",

    name: "數的大小比較王",

    shortName: "大小比較",

    semester: "grade7-first",

    grade: 7,

    order: 2,

    icon: "⚖️",

    file:
      "games/compare-game.html",

    description:
      "比較正負數、整數與分數的大小。",

    finished: true,

    difficulty: 1,

    recommended: false,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      integer:
        "整數比較",

      fraction:
        "分數比較",

      mixed:
        "綜合比較"

    },

    theme: {

      primary: "#00897B",

      dark: "#00695C",

      light: "#E0F2F1",

      border: "#80CBC4"

    }

  },



  /*
  --------------------------------------------------
  一元一次式
  --------------------------------------------------
  */

  linearExpression: {

    id: "linearExpression",

    name: "一元一次式大挑戰",

    shortName: "一元一次式",

    semester: "grade7-first",

    grade: 7,

    order: 3,

    icon: "🧮",

    file:
      "games/linear-expression.html",

    description:
      "練習一元一次式的化簡與運算。",

    finished: true,

    difficulty: 2,

    recommended: false,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      basic:
        "基礎化簡",

      addition:
        "加減運算",

      mixed:
        "綜合挑戰"

    },

    theme: {

      primary: "#5E35B1",

      dark: "#4527A0",

      light: "#EDE7F6",

      border: "#B39DDB"

    }

  },



  /*
  --------------------------------------------------
  一元一次方程式
  --------------------------------------------------
  */

  linearEquation: {

    id: "linearEquation",

    name: "一元一次方程式大挑戰",

    shortName: "一元一次方程式",

    semester: "grade7-first",

    grade: 7,

    order: 4,

    icon: "🎯",

    file:
      "games/linear-equation.html",

    description:
      "利用等量公理與移項法解一元一次方程式。",

    finished: true,

    difficulty: 2,

    recommended: true,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      basic:
        "基礎方程式",

      parentheses:
        "含括號方程式",

      fraction:
        "含分數方程式",

      mixed:
        "綜合挑戰"

    },

    theme: {

      primary: "#F4511E",

      dark: "#D84315",

      light: "#FBE9E7",

      border: "#FFAB91"

    }

  },



  /*
  --------------------------------------------------
  比例式
  --------------------------------------------------
  */

  proportion: {

    id: "proportion",

    name: "比例式大挑戰",

    shortName: "比例式",

    semester: "grade7-first",

    grade: 7,

    order: 5,

    icon: "📐",

    file:
      "games/proportion.html",

    description:
      "練習比例式、比例值與相關應用。",

    finished: true,

    difficulty: 2,

    recommended: false,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      basic:
        "基本比例式",

      solve:
        "求未知數",

      application:
        "應用問題"

    },

    theme: {

      primary: "#3949AB",

      dark: "#283593",

      light: "#E8EAF6",

      border: "#9FA8DA"

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

    id: "multiplicationFormula",

    name: "乘法公式大挑戰",

    shortName: "乘法公式",

    semester: "grade8-first",

    grade: 8,

    order: 1,

    icon: "✨",

    file:
      "games/multiplication-formula.html",

    description:
      "練習平方和、平方差與乘法公式。",

    finished: true,

    difficulty: 2,

    recommended: true,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      squareSum:
        "和的平方",

      squareDifference:
        "差的平方",

      differenceSquares:
        "平方差",

      mixed:
        "綜合挑戰"

    },

    theme: {

      primary: "#7B1FA2",

      dark: "#6A1B9A",

      light: "#F3E5F5",

      border: "#CE93D8"

    }

  },



  /*
  --------------------------------------------------
  2. 多項式加減
  --------------------------------------------------
  */

  polynomialAddition: {

    id: "polynomialAddition",

    name: "多項式加減大挑戰",

    shortName: "多項式加減",

    semester: "grade8-first",

    grade: 8,

    order: 2,

    icon: "➕",

    file:
      "games/polynomial-addition.html",

    description:
      "練習多項式的加法、減法與同類項整理。",

    finished: true,

    difficulty: 2,

    recommended: false,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      addition:
        "多項式加法",

      subtraction:
        "多項式減法",

      mixed:
        "綜合挑戰"

    },

    theme: {

      primary: "#0288D1",

      dark: "#0277BD",

      light: "#E1F5FE",

      border: "#81D4FA"

    }

  },



  /*
  --------------------------------------------------
  3. 多項式乘除
  --------------------------------------------------
  */

  polynomialMultiplicationDivision: {

    id: "polynomialMultiplicationDivision",

    name: "多項式乘除大挑戰",

    shortName: "多項式乘除",

    semester: "grade8-first",

    grade: 8,

    order: 3,

    icon: "✖️",

    file:
      "games/polynomial-multiplication-division.html",

    description:
      "練習多項式乘法與除法。",

    finished: true,

    difficulty: 2,

    recommended: false,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      multiplication:
        "多項式乘法",

      division:
        "多項式除法",

      mixed:
        "綜合挑戰"

    },

    theme: {

      primary: "#00897B",

      dark: "#00695C",

      light: "#E0F2F1",

      border: "#80CBC4"

    }

  },



  /*
  --------------------------------------------------
  4. 平方根
  --------------------------------------------------
  */

  squareRoot: {

    id: "squareRoot",

    name: "平方根大挑戰",

    shortName: "平方根",

    semester: "grade8-first",

    grade: 8,

    order: 4,

    icon: "√",

    file:
      "games/square-root.html",

    description:
      "認識平方根、正平方根與根號。",

    finished: true,

    difficulty: 2,

    recommended: false,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      basic:
        "認識平方根",

      calculation:
        "平方根計算",

      mixed:
        "綜合挑戰"

    },

    theme: {

      primary: "#3949AB",

      dark: "#283593",

      light: "#E8EAF6",

      border: "#9FA8DA"

    }

  },



  /*
  --------------------------------------------------
  5. 根式運算
  --------------------------------------------------
  */

  radical: {

    id: "radical",

    name: "根式運算大挑戰",

    shortName: "根式運算",

    semester: "grade8-first",

    grade: 8,

    order: 5,

    icon: "√x",

    file:
      "games/radical.html",

    description:
      "練習最簡根式以及根式的乘除與加減。",

    finished: true,

    difficulty: 2,

    recommended: false,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      simplify:
        "最簡根式",

      multiplication:
        "根式乘除",

      addition:
        "根式加減",

      mixed:
        "綜合挑戰"

    },

    theme: {

      primary: "#5E35B1",

      dark: "#4527A0",

      light: "#EDE7F6",

      border: "#B39DDB"

    }

  },



  /*
  --------------------------------------------------
  6. 畢氏定理
  --------------------------------------------------
  */

  pythagorean: {

    id: "pythagorean",

    name: "畢氏定理大挑戰",

    shortName: "畢氏定理",

    semester: "grade8-first",

    grade: 8,

    order: 6,

    icon: "📐",

    file:
      "games/pythagorean.html",

    description:
      "利用畢氏定理解直角三角形與相關應用問題。",

    finished: true,

    difficulty: 2,

    recommended: false,

    isNew: false,

    ranking: {
      type: "speed"
    },

    modes: {

      basic:
        "基本題",

      findSide:
        "求邊長",

      application:
        "應用問題"

    },

    theme: {

      primary: "#FB8C00",

      dark: "#EF6C00",

      light: "#FFF3E0",

      border: "#FFCC80"

    }

  },



  /*
  --------------------------------------------------
  7. 因式分解大挑戰
  --------------------------------------------------
  */

  factorizationChallenge: {

    id: "factorizationChallenge",

    name: "因式分解大挑戰",

    shortName: "因式分解",

    semester: "grade8-first",

    grade: 8,

    order: 7,

    icon: "🧩",

    file:
      "games/factorization-challenge.html",

    description:
      "練習提公因式與利用乘法公式進行因式分解。",

    finished: true,

    difficulty: 2,

    recommended: true,

    isNew: true,

    ranking: {
      type: "speed"
    },

    modes: {

      monomial:
        "提單項公因式",

      grouping:
        "提兩項或變號後提公因式",

      formula:
        "乘法公式因式分解"

    },

    theme: {

      primary: "#D81B60",

      dark: "#AD1457",

      light: "#FCE4EC",

      border: "#F48FB1"

    }

  },



  /*
  --------------------------------------------------
  8. 十字交乘因式分解大挑戰
  --------------------------------------------------
  */

  crossFactorization: {

    id: "crossFactorization",

    name: "十字交乘因式分解大挑戰",

    shortName: "十字交乘",

    semester: "grade8-first",

    grade: 8,

    order: 8,

    icon: "❌",

    file:
      "games/cross-factorization.html",

    description:
      "利用十字交乘法進行二次三項式的因式分解。",

    finished: true,

    difficulty: 3,

    recommended: true,

    isNew: true,

    ranking: {
      type: "speed"
    },

    modes: {

      leadingOne:
        "平方項係數為 1",

      leadingNotOne:
        "平方項係數不為 1",

      mixed:
        "綜合因式分解"

    },

    theme: {

      primary: "#EC407A",

      dark: "#C2185B",

      light: "#FCE4EC",

      border: "#F48FB1"

    }

  },



  /*
  --------------------------------------------------
  9. 一元二次方程式大挑戰

  正式上架
  實際檔名：
  games/quadratic-equation.html
  --------------------------------------------------
  */

  quadraticEquation: {

    id: "quadraticEquation",

    name: "一元二次方程式大挑戰",

    shortName: "一元二次方程式",

    semester: "grade8-first",

    grade: 8,

    order: 9,

    /*
    符合一元二次方程式主題的圖示
    */

    icon: "x²",

    file:
      "games/quadratic-equation.html",

    description:
      "練習因式分解法、平方根法、配方法、公式解、根的情形判斷，以及一元二次方程式應用問題。",

    /*
    正式上架
    */

    finished: true,

    difficulty: 3,

    recommended: true,

    isNew: true,

    ranking: {
      type: "speed"
    },

    /*
    一元二次方程式六種模式
    */

    modes: {

      factorization:
        "因式分解法",

      squareRoot:
        "平方根法",

      completingSquare:
        "配方法",

      formula:
        "公式解",

      rootNature:
        "根的情形",

      mixed:
        "綜合挑戰"

    },

    theme: {

      primary: "#1565C0",

      dark: "#0D47A1",

      light: "#E3F2FD",

      border: "#90CAF9"

    }

  }

};



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
取得已完成遊戲
==================================================
*/

export function getFinishedGames() {

  return getAllGames()
    .filter(
      game =>
        game.finished === true
    )
    .sort(
      (a, b) => {

        if (
          a.grade !== b.grade
        ) {

          return (
            a.grade -
            b.grade
          );

        }

        return (
          a.order -
          b.order
        );

      }
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

  return getAllGames()
    .filter(
      game =>
        game.semester ===
          semester &&
        game.finished === true
    )
    .sort(
      (a, b) =>
        a.order -
        b.order
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

  return getAllGames()
    .filter(
      game =>
        game.grade ===
          Number(grade) &&
        game.finished === true
    )
    .sort(
      (a, b) =>
        a.order -
        b.order
    );

}



/*
==================================================
依遊戲 ID 取得設定
==================================================
*/

export function getGameConfig(
  gameId
) {

  if (
    !gameId
  ) {

    return null;

  }


  /*
  先直接使用物件 key 尋找
  */

  if (
    GAME_CONFIG[gameId]
  ) {

    return GAME_CONFIG[
      gameId
    ];

  }


  /*
  再使用遊戲本身的 id 尋找
  */

  return (
    getAllGames()
      .find(
        game =>
          game.id === gameId
      ) ||
    null
  );

}



/*
==================================================
取得遊戲名稱
==================================================
*/

export function getGameName(
  gameId
) {

  const game =
    getGameConfig(
      gameId
    );

  return game
    ? game.name
    : gameId;

}



/*
==================================================
取得遊戲短名稱
==================================================
*/

export function getGameShortName(
  gameId
) {

  const game =
    getGameConfig(
      gameId
    );

  return game
    ? game.shortName
    : gameId;

}



/*
==================================================
取得遊戲模式名稱
==================================================
*/

export function getModeName(
  gameId,
  modeId
) {

  const game =
    getGameConfig(
      gameId
    );


  if (
    !game
  ) {

    return modeId || "";

  }


  if (
    !modeId
  ) {

    return "";

  }


  return (
    game.modes?.[
      modeId
    ] ||
    modeId
  );

}



/*
==================================================
取得遊戲網址
==================================================
*/

export function getGameFile(
  gameId
) {

  const game =
    getGameConfig(
      gameId
    );

  return game
    ? game.file
    : "";

}



/*
==================================================
判斷遊戲是否已上架
==================================================
*/

export function isGameFinished(
  gameId
) {

  const game =
    getGameConfig(
      gameId
    );

  return Boolean(
    game?.finished
  );

}



/*
==================================================
取得推薦遊戲
==================================================
*/

export function getRecommendedGames() {

  return getFinishedGames()
    .filter(
      game =>
        game.recommended ===
        true
    );

}



/*
==================================================
取得新遊戲
==================================================
*/

export function getNewGames() {

  return getFinishedGames()
    .filter(
      game =>
        game.isNew === true
    );

}



/*
==================================================
依照遊戲排序
==================================================
*/

export function sortGames(
  games = []
) {

  return [
    ...games
  ].sort(
    (a, b) => {

      if (
        a.grade !==
        b.grade
      ) {

        return (
          a.grade -
          b.grade
        );

      }

      return (
        a.order -
        b.order
      );

    }
  );

}



/*
==================================================
確認設定檔載入
==================================================
*/

console.log(
  "game-config.js 已成功載入"
);

console.log(
  "目前正式上架遊戲數量：",
  getFinishedGames().length
);

console.log(
  "八年級上學期正式上架遊戲：",
  getGamesBySemester(
    "grade8-first"
  ).map(
    game =>
      game.name
  )
);