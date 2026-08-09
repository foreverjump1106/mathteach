/*
==================================================
數學遊戲樂園：我的成績
檔案位置：js/my-scores.js

版本：2.0
單模式／多模式顯示同步版
==================================================

功能：
1. 顯示目前登入玩家。
2. 顯示整體遊玩統計。
3. 顯示各遊戲統計。
4. 顯示最近 10 筆遊玩紀錄。
5. 單模式遊戲不顯示舊 mode。
6. 多模式遊戲才顯示正式模式名稱。
7. 模式設定以 game-config.js 為準。
==================================================
*/

import {
  auth,
  db
} from "./firebase-config.js";

import {
  getGameConfig,
  getGameName,
  getModeName,
  getGameOrder
} from "./game-config.js";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/*
==================================================
DOM
==================================================
*/

const userStatus =
  document.getElementById(
    "userStatus"
  );

const loadingMessage =
  document.getElementById(
    "loadingMessage"
  );

const errorMessage =
  document.getElementById(
    "errorMessage"
  );

const emptyMessage =
  document.getElementById(
    "emptyMessage"
  );

const statsSection =
  document.getElementById(
    "statsSection"
  );

const totalGamesElement =
  document.getElementById(
    "totalGames"
  );

const highestScoreElement =
  document.getElementById(
    "highestScore"
  );

const averageScoreElement =
  document.getElementById(
    "averageScore"
  );

const highestComboElement =
  document.getElementById(
    "highestCombo"
  );

const totalCorrectElement =
  document.getElementById(
    "totalCorrect"
  );

const totalWrongElement =
  document.getElementById(
    "totalWrong"
  );

const gameSummaryList =
  document.getElementById(
    "gameSummaryList"
  );

const historyList =
  document.getElementById(
    "historyList"
  );


/*
==================================================
取得遊戲正式模式數量
==================================================
*/

function getGameModeCount(
  gameId
) {
  const config =
    getGameConfig(
      gameId
    );

  if (
    !config ||
    !config.modes ||
    typeof config.modes !==
      "object"
  ) {
    return 0;
  }

  return Object.keys(
    config.modes
  ).length;
}


/*
==================================================
判斷是否為多模式遊戲
==================================================
*/

function isMultiModeGame(
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
取得歷史紀錄使用的模式文字
==================================================

重要：

單模式遊戲：
不論 Firestore 舊資料有沒有 mode，
都不顯示 mode。

多模式遊戲：
才依 game-config.js 顯示正式模式名稱。
==================================================
*/

function getHistoryModeText(
  gameId,
  mode
) {
  if (
    !isMultiModeGame(
      gameId
    )
  ) {
    return "";
  }

  return (
    getModeName(
      gameId,
      mode
    ) || ""
  );
}


/*
==================================================
監聽登入狀態
==================================================
*/

onAuthStateChanged(
  auth,

  async (user) => {
    if (!user) {
      showLoginRequiredMessage();

      return;
    }

    renderUser(
      user
    );

    await loadMyScores(
      user.uid
    );
  },

  (error) => {
    console.error(
      "確認登入狀態失敗：",
      error
    );

    showError(
      error
    );
  }
);


/*
==================================================
顯示目前登入玩家
==================================================
*/

function renderUser(
  user
) {
  if (!userStatus) {
    return;
  }

  userStatus.innerHTML =
    "";

  if (
    user.photoURL
  ) {
    const userPhoto =
      document.createElement(
        "img"
      );

    userPhoto.className =
      "user-photo";

    userPhoto.src =
      user.photoURL;

    userPhoto.alt =
      "玩家頭像";

    userStatus.appendChild(
      userPhoto
    );
  }

  const userName =
    document.createElement(
      "span"
    );

  userName.textContent =
    `目前登入：${
      user.displayName ||
      user.email ||
      "玩家"
    }`;

  userStatus.appendChild(
    userName
  );
}


/*
==================================================
讀取個人成績
==================================================
*/

async function loadMyScores(
  uid
) {
  setLoadingState();

  try {
    const scoresReference =
      collection(
        db,
        "scores"
      );

    const myScoresQuery =
      query(
        scoresReference,

        where(
          "uid",
          "==",
          uid
        )
      );

    const snapshot =
      await getDocs(
        myScoresQuery
      );

    const records =
      snapshot.docs.map(
        (
          documentSnapshot
        ) => ({
          id:
            documentSnapshot.id,

          ...documentSnapshot.data()
        })
      );


    /*
    最新紀錄排在最前面
    */

    records.sort(
      (
        recordA,
        recordB
      ) => {
        return (
          getTimestampMilliseconds(
            recordB.createdAt
          ) -
          getTimestampMilliseconds(
            recordA.createdAt
          )
        );
      }
    );


    renderMyScores(
      records
    );

  } catch (error) {
    console.error(
      "讀取個人成績失敗：",
      error
    );

    showError(
      error
    );
  }
}


/*
==================================================
顯示個人成績
==================================================
*/

function renderMyScores(
  records
) {
  if (loadingMessage) {
    loadingMessage.hidden =
      true;
  }

  if (errorMessage) {
    errorMessage.hidden =
      true;
  }


  if (
    records.length ===
    0
  ) {
    if (emptyMessage) {
      emptyMessage.hidden =
        false;
    }

    if (statsSection) {
      statsSection.style.display =
        "none";
    }

    return;
  }


  if (emptyMessage) {
    emptyMessage.hidden =
      true;
  }

  if (statsSection) {
    statsSection.style.display =
      "block";
  }


  const statistics =
    calculateStatistics(
      records
    );


  if (totalGamesElement) {
    totalGamesElement.textContent =
      statistics.totalGames;
  }

  if (highestScoreElement) {
    highestScoreElement.textContent =
      statistics.highestScore;
  }

  if (averageScoreElement) {
    averageScoreElement.textContent =
      statistics.averageScore;
  }

  if (highestComboElement) {
    highestComboElement.textContent =
      statistics.highestCombo;
  }

  if (totalCorrectElement) {
    totalCorrectElement.textContent =
      statistics.totalCorrect;
  }

  if (totalWrongElement) {
    totalWrongElement.textContent =
      statistics.totalWrong;
  }


  renderGameSummary(
    records
  );

  renderHistory(
    records
  );
}


/*
==================================================
計算整體統計資料
==================================================
*/

function calculateStatistics(
  records
) {
  const totalGames =
    records.length;


  const totalScore =
    records.reduce(
      (
        total,
        record
      ) => {
        return (
          total +
          toSafeNumber(
            record.score
          )
        );
      },
      0
    );


  const highestScore =
    records.reduce(
      (
        highest,
        record
      ) => {
        return Math.max(
          highest,

          toSafeNumber(
            record.score
          )
        );
      },
      0
    );


  const highestCombo =
    records.reduce(
      (
        highest,
        record
      ) => {
        return Math.max(
          highest,

          toSafeNumber(
            record.maxCombo
          )
        );
      },
      0
    );


  const totalCorrect =
    records.reduce(
      (
        total,
        record
      ) => {
        return (
          total +
          toSafeNumber(
            record.correctCount
          )
        );
      },
      0
    );


  const totalWrong =
    records.reduce(
      (
        total,
        record
      ) => {
        return (
          total +
          toSafeNumber(
            record.wrongCount
          )
        );
      },
      0
    );


  const averageScore =
    totalGames > 0
      ? Math.round(
          totalScore /
          totalGames
        )
      : 0;


  return {
    totalGames,
    highestScore,
    averageScore,
    highestCombo,
    totalCorrect,
    totalWrong
  };
}


/*
==================================================
顯示各遊戲統計
==================================================
*/

function renderGameSummary(
  records
) {
  if (!gameSummaryList) {
    return;
  }

  gameSummaryList.innerHTML =
    "";


  const groupedGames =
    {};


  records.forEach(
    (record) => {
      const gameKey =
        record.game ||
        "unknown";


      if (
        !groupedGames[
          gameKey
        ]
      ) {
        groupedGames[
          gameKey
        ] = [];
      }


      groupedGames[
        gameKey
      ].push(
        record
      );
    }
  );


  /*
  從 game-config.js
  取得正式遊戲順序。
  */

  const gameOrder =
    getGameOrder();


  const knownGames =
    gameOrder.filter(
      (gameKey) => {
        return Boolean(
          groupedGames[
            gameKey
          ]
        );
      }
    );


  /*
  保留舊遊戲資料，
  避免歷史紀錄消失。
  */

  const unknownGames =
    Object.keys(
      groupedGames
    ).filter(
      (gameKey) => {
        return (
          !gameOrder.includes(
            gameKey
          )
        );
      }
    );


  const orderedGames = [
    ...knownGames,
    ...unknownGames
  ];


  orderedGames.forEach(
    (gameKey) => {
      const gameRecords =
        groupedGames[
          gameKey
        ];


      const totalGames =
        gameRecords.length;


      const highestScore =
        gameRecords.reduce(
          (
            highest,
            record
          ) => {
            return Math.max(
              highest,

              toSafeNumber(
                record.score
              )
            );
          },
          0
        );


      const totalScore =
        gameRecords.reduce(
          (
            total,
            record
          ) => {
            return (
              total +
              toSafeNumber(
                record.score
              )
            );
          },
          0
        );


      const averageScore =
        totalGames > 0
          ? Math.round(
              totalScore /
              totalGames
            )
          : 0;


      const gameCard =
        document.createElement(
          "article"
        );

      gameCard.className =
        "game-card";


      const gameTitle =
        document.createElement(
          "div"
        );

      gameTitle.className =
        "game-title";

      gameTitle.textContent =
        getGameName(
          gameKey
        );


      const playCount =
        createGameStatistic(
          totalGames,
          "遊玩次數"
        );


      const bestScore =
        createGameStatistic(
          highestScore,
          "最高分"
        );


      const average =
        createGameStatistic(
          averageScore,
          "平均分"
        );


      gameCard.appendChild(
        gameTitle
      );

      gameCard.appendChild(
        playCount
      );

      gameCard.appendChild(
        bestScore
      );

      gameCard.appendChild(
        average
      );


      gameSummaryList.appendChild(
        gameCard
      );
    }
  );
}


/*
==================================================
建立單一遊戲統計欄位
==================================================
*/

function createGameStatistic(
  value,
  label
) {
  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.className =
    "game-stat";


  const valueElement =
    document.createElement(
      "div"
    );

  valueElement.className =
    "game-stat-value";

  valueElement.textContent =
    value;


  const labelElement =
    document.createElement(
      "div"
    );

  labelElement.className =
    "game-stat-label";

  labelElement.textContent =
    label;


  wrapper.appendChild(
    valueElement
  );

  wrapper.appendChild(
    labelElement
  );


  return wrapper;
}


/*
==================================================
顯示最近遊玩紀錄
==================================================
*/

function renderHistory(
  records
) {
  if (!historyList) {
    return;
  }

  historyList.innerHTML =
    "";


  /*
  最近 10 筆
  */

  const recentRecords =
    records.slice(
      0,
      10
    );


  recentRecords.forEach(
    (record) => {
      const listItem =
        document.createElement(
          "li"
        );

      listItem.className =
        "history-item";


      const information =
        document.createElement(
          "div"
        );


      /*
      遊戲名稱
      */

      const gameName =
        document.createElement(
          "div"
        );

      gameName.className =
        "history-game";

      gameName.textContent =
        getGameName(
          record.game
        );


      /*
      詳細資料
      */

      const details =
        document.createElement(
          "div"
        );

      details.className =
        "history-detail";


      const correctCount =
        toSafeNumber(
          record.correctCount
        );


      const wrongCount =
        toSafeNumber(
          record.wrongCount
        );


      const maxCombo =
        toSafeNumber(
          record.maxCombo
        );


      /*
      非常重要：

      單模式：
      不顯示舊 mode。

      多模式：
      才顯示正式模式名稱。
      */

      const modeText =
        getHistoryModeText(
          record.game,
          record.mode
        );


      details.textContent =
        `${formatDate(
          record.createdAt
        )}` +

        `${
          modeText
            ? `｜${modeText}`
            : ""
        }` +

        `｜答對 ${correctCount} 題` +

        `｜答錯 ${wrongCount} 題` +

        `｜最高連擊 ${maxCombo}`;


      information.appendChild(
        gameName
      );

      information.appendChild(
        details
      );


      /*
      分數
      */

      const scoreElement =
        document.createElement(
          "div"
        );

      scoreElement.className =
        "history-score";


      const scoreNumber =
        document.createElement(
          "div"
        );

      scoreNumber.textContent =
        toSafeNumber(
          record.score
        );


      const scoreLabel =
        document.createElement(
          "div"
        );

      scoreLabel.className =
        "history-score-label";

      scoreLabel.textContent =
        "分";


      scoreElement.appendChild(
        scoreNumber
      );

      scoreElement.appendChild(
        scoreLabel
      );


      listItem.appendChild(
        information
      );

      listItem.appendChild(
        scoreElement
      );


      historyList.appendChild(
        listItem
      );
    }
  );
}


/*
==================================================
安全轉換數字
==================================================
*/

function toSafeNumber(
  value
) {
  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}


/*
==================================================
取得時間毫秒數
供最近紀錄排序
==================================================
*/

function getTimestampMilliseconds(
  timestamp
) {
  if (!timestamp) {
    return 0;
  }

  try {

    if (
      typeof timestamp.toMillis ===
      "function"
    ) {
      return timestamp.toMillis();
    }


    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      return timestamp
        .toDate()
        .getTime();
    }


    if (
      timestamp.seconds !==
      undefined
    ) {
      return (
        Number(
          timestamp.seconds
        ) *
        1000
      );
    }


    return (
      new Date(
        timestamp
      ).getTime() ||
      0
    );

  } catch (error) {
    console.warn(
      "時間轉換失敗：",
      error
    );

    return 0;
  }
}


/*
==================================================
顯示日期時間
==================================================
*/

function formatDate(
  timestamp
) {
  if (!timestamp) {
    return "時間未記錄";
  }

  try {
    let date;


    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      date =
        timestamp.toDate();

    } else if (
      timestamp.seconds !==
      undefined
    ) {
      date =
        new Date(
          Number(
            timestamp.seconds
          ) *
          1000
        );

    } else {
      date =
        new Date(
          timestamp
        );
    }


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "時間格式錯誤";
    }


    return new Intl.DateTimeFormat(
      "zh-TW",
      {
        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",

        hour:
          "2-digit",

        minute:
          "2-digit",

        hour12:
          false
      }
    ).format(
      date
    );

  } catch (error) {
    console.warn(
      "日期格式轉換失敗：",
      error
    );

    return "時間格式錯誤";
  }
}


/*
==================================================
設定載入畫面
==================================================
*/

function setLoadingState() {
  if (loadingMessage) {
    loadingMessage.hidden =
      false;
  }

  if (errorMessage) {
    errorMessage.hidden =
      true;
  }

  if (emptyMessage) {
    emptyMessage.hidden =
      true;
  }

  if (statsSection) {
    statsSection.style.display =
      "none";
  }
}


/*
==================================================
尚未登入
==================================================
*/

function showLoginRequiredMessage() {
  if (userStatus) {
    userStatus.textContent =
      "目前尚未登入，請先回到首頁登入 Google 帳號。";
  }

  if (loadingMessage) {
    loadingMessage.hidden =
      true;
  }

  if (emptyMessage) {
    emptyMessage.hidden =
      true;
  }

  if (statsSection) {
    statsSection.style.display =
      "none";
  }

  if (errorMessage) {
    errorMessage.hidden =
      false;

    errorMessage.textContent =
      "請先登入 Google 帳號，才能查看自己的成績。";
  }
}


/*
==================================================
顯示錯誤
==================================================
*/

function showError(
  error
) {
  if (loadingMessage) {
    loadingMessage.hidden =
      true;
  }

  if (emptyMessage) {
    emptyMessage.hidden =
      true;
  }

  if (statsSection) {
    statsSection.style.display =
      "none";
  }

  if (!errorMessage) {
    return;
  }

  errorMessage.hidden =
    false;


  if (
    error?.code ===
    "permission-denied"
  ) {
    errorMessage.textContent =
      "目前沒有讀取個人成績的權限，請確認 Firestore Rules。";

    return;
  }


  errorMessage.textContent =
    `個人成績載入失敗：${
      error?.message ||
      "未知錯誤"
    }`;
}
