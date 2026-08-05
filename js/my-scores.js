import { auth, db } from "./firebase-config.js";

import {
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

const userStatus =
  document.getElementById("userStatus");

const loadingMessage =
  document.getElementById("loadingMessage");

const errorMessage =
  document.getElementById("errorMessage");

const emptyMessage =
  document.getElementById("emptyMessage");

const statsSection =
  document.getElementById("statsSection");

const totalGamesElement =
  document.getElementById("totalGames");

const highestScoreElement =
  document.getElementById("highestScore");

const averageScoreElement =
  document.getElementById("averageScore");

const highestComboElement =
  document.getElementById("highestCombo");

const totalCorrectElement =
  document.getElementById("totalCorrect");

const totalWrongElement =
  document.getElementById("totalWrong");

const gameSummaryList =
  document.getElementById("gameSummaryList");

const historyList =
  document.getElementById("historyList");

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

    renderUser(user);

    await loadMyScores(
      user.uid
    );
  }
);

/*
==================================================
顯示目前登入玩家
==================================================
*/

function renderUser(user) {
  userStatus.innerHTML =
    "";

  if (user.photoURL) {
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

async function loadMyScores(uid) {
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

    showError(error);
  }
}

/*
==================================================
顯示個人成績
==================================================
*/

function renderMyScores(records) {
  loadingMessage.hidden =
    true;

  errorMessage.hidden =
    true;

  if (
    records.length === 0
  ) {
    emptyMessage.hidden =
      false;

    statsSection.style.display =
      "none";

    return;
  }

  emptyMessage.hidden =
    true;

  statsSection.style.display =
    "block";

  const statistics =
    calculateStatistics(
      records
    );

  totalGamesElement.textContent =
    statistics.totalGames;

  highestScoreElement.textContent =
    statistics.highestScore;

  averageScoreElement.textContent =
    statistics.averageScore;

  highestComboElement.textContent =
    statistics.highestCombo;

  totalCorrectElement.textContent =
    statistics.totalCorrect;

  totalWrongElement.textContent =
    statistics.totalWrong;

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

function calculateStatistics(records) {
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

function renderGameSummary(records) {
  gameSummaryList.innerHTML =
    "";

  const groupedGames = {};

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
  從 game-config.js 取得目前已完成遊戲的排列順序。
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
  保留舊資料或尚未加入 game-config.js 的遊戲紀錄，
  避免資料消失。
  */

  const unknownGames =
    Object.keys(
      groupedGames
    ).filter(
      (gameKey) => {
        return !gameOrder.includes(
          gameKey
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

function renderHistory(records) {
  historyList.innerHTML =
    "";

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

      const modeText =
        getModeName(
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

function toSafeNumber(value) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

/*
==================================================
取得時間毫秒數，供排序使用
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
        ) * 1000
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

function formatDate(timestamp) {
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
          ) * 1000
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
  loadingMessage.hidden =
    false;

  errorMessage.hidden =
    true;

  emptyMessage.hidden =
    true;

  statsSection.style.display =
    "none";
}

/*
==================================================
尚未登入
==================================================
*/

function showLoginRequiredMessage() {
  userStatus.textContent =
    "目前尚未登入，請先回到首頁登入 Google 帳號。";

  loadingMessage.hidden =
    true;

  emptyMessage.hidden =
    true;

  statsSection.style.display =
    "none";

  errorMessage.hidden =
    false;

  errorMessage.textContent =
    "請先登入 Google 帳號，才能查看自己的成績。";
}

/*
==================================================
顯示錯誤
==================================================
*/

function showError(error) {
  loadingMessage.hidden =
    true;

  emptyMessage.hidden =
    true;

  statsSection.style.display =
    "none";

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