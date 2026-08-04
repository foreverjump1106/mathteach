import { auth, db } from "./firebase-config.js";

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

const GAME_NAMES = {
  integer: "正負整數大挑戰",
  compare: "數的大小比較王",
  equation: "一元一次方程式",
  fraction: "正負分數加減大挑戰",
  ratio: "比例式"
};

const GAME_ORDER = [
  "integer",
  "compare",
  "fraction",
  "equation",
  "ratio"
];

const MODE_NAMES = {
  "1": "模式一",
  "2": "模式二",
  "3": "模式三",
  "4": "模式四",
  lcm: "最小公倍數複習",
  fraction: "正負分數加減"
};

onAuthStateChanged(
  auth,
  async (user) => {
    if (!user) {
      showLoginRequiredMessage();
      return;
    }

    renderUser(user);

    await loadMyScores(user.uid);
  }
);

function renderUser(user) {
  userStatus.innerHTML = "";

  if (user.photoURL) {
    const userPhoto =
      document.createElement("img");

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
    document.createElement("span");

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
        (documentSnapshot) => ({
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

function renderMyScores(records) {
  loadingMessage.hidden =
    true;

  errorMessage.hidden =
    true;

  if (records.length === 0) {
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
      ].push(record);
    }
  );

  const knownGames =
    GAME_ORDER.filter(
      (gameKey) => {
        return Boolean(
          groupedGames[
            gameKey
          ]
        );
      }
    );

  const unknownGames =
    Object.keys(
      groupedGames
    ).filter(
      (gameKey) => {
        return !GAME_ORDER.includes(
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
        GAME_NAMES[
          gameKey
        ] ||
        gameKey ||
        "數學遊戲";

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
        GAME_NAMES[
          record.game
        ] ||
        record.game ||
        "數學遊戲";

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
        getModeDisplayName(
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

function getModeDisplayName(mode) {
  if (
    mode === undefined ||
    mode === null ||
    mode === ""
  ) {
    return "";
  }

  const key =
    String(mode);

  return (
    MODE_NAMES[
      key
    ] ||
    key
  );
}

function toSafeNumber(value) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

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

function formatDate(timestamp) {
  if (!timestamp) {
    return "時間未記錄";
  }

  try {
    const date =
      typeof timestamp.toDate ===
      "function"
        ? timestamp.toDate()
        : new Date(
            timestamp
          );

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
          "2-digit"
      }
    ).format(date);
  } catch (error) {
    console.warn(
      "日期格式轉換失敗：",
      error
    );

    return "時間格式錯誤";
  }
}

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
