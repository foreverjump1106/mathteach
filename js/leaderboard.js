import { auth, db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  limit,
  orderBy,
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

const leaderboardList =
  document.getElementById("leaderboardList");

const filterButtons =
  document.querySelectorAll(".filter-button");

let currentUser = null;
let selectedGame = "all";

const GAME_NAMES = {
  integer: "正負整數大挑戰",
  compare: "數的大小比較王",
  equation: "一元一次方程式",
  fraction: "正負分數加減大挑戰",
  "integer-operations": "正負數四則運算大挑戰",
  ratio: "比例式"
};

const MODE_NAMES = {
  "1": "模式一",
  "2": "模式二",
  "3": "模式三",
  "4": "模式四",

  lcm: "最小公倍數複習",
  fraction: "正負分數加減",

  muldiv: "正負數的乘除",
  absolute: "絕對值運算",
  power: "乘方計算",
  mixed: "四則運算",
  advanced: "四則運算進階挑戰"
};

onAuthStateChanged(
  auth,
  async (user) => {
    currentUser = user;

    if (!user) {
      userStatus.textContent =
        "請先回到首頁登入 Google 帳號，才能查看排行榜。";

      showLoginRequiredMessage();
      return;
    }

    const playerName =
      user.displayName ||
      user.email ||
      "玩家";

    userStatus.textContent =
      `目前登入：${playerName}`;

    await loadLeaderboard();
  }
);

filterButtons.forEach((button) => {
  button.addEventListener(
    "click",
    async () => {
      if (!currentUser) {
        return;
      }

      filterButtons.forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      selectedGame =
        button.dataset.game || "all";

      await loadLeaderboard();
    }
  );
});

async function loadLeaderboard() {
  setLoadingState();

  try {
    const scoresReference =
      collection(db, "scores");

    let leaderboardQuery;

    if (selectedGame === "all") {
      leaderboardQuery = query(
        scoresReference,
        orderBy("score", "desc"),
        limit(20)
      );
    } else {
      leaderboardQuery = query(
        scoresReference,
        where("game", "==", selectedGame),
        orderBy("score", "desc"),
        limit(20)
      );
    }

    const snapshot =
      await getDocs(leaderboardQuery);

    const scoreRecords =
      snapshot.docs.map(
        (documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data()
        })
      );

    renderLeaderboard(scoreRecords);
  } catch (error) {
    console.error(
      "排行榜讀取失敗：",
      error
    );

    showError(error);
  }
}
function renderLeaderboard(records) {
  loadingMessage.hidden = true;
  errorMessage.hidden = true;
  leaderboardList.innerHTML = "";

  if (records.length === 0) {
    emptyMessage.hidden = false;
    return;
  }

  emptyMessage.hidden = true;

  records.forEach((record, index) => {
    const listItem =
      document.createElement("li");

    listItem.className =
      "leaderboard-item";

    if (
      currentUser &&
      record.uid === currentUser.uid
    ) {
      listItem.classList.add(
        "current-user"
      );
    }

    const rankElement =
      document.createElement("div");

    rankElement.className =
      "rank";

    rankElement.textContent =
      getRankDisplay(index + 1);

    const playerInfo =
      document.createElement("div");

    playerInfo.className =
      "player-info";

    const playerName =
      document.createElement("div");

    playerName.className =
      "player-name";

    playerName.textContent =
      record.playerName ||
      "未命名玩家";

    const gameName =
      document.createElement("div");

    gameName.className =
      "game-name";

    gameName.textContent =
      getGameDisplayName(record);

    const playTime =
      document.createElement("div");

    playTime.className =
      "play-time";

    playTime.textContent =
      formatDate(record.createdAt);

    playerInfo.appendChild(
      playerName
    );

    playerInfo.appendChild(
      gameName
    );

    playerInfo.appendChild(
      playTime
    );

    const scoreElement =
      document.createElement("div");

    scoreElement.className =
      "score";

    const scoreNumber =
      document.createElement("div");

    scoreNumber.textContent =
      toSafeNumber(record.score);

    const scoreLabel =
      document.createElement("div");

    scoreLabel.className =
      "score-label";

    scoreLabel.textContent =
      "分";

    scoreElement.appendChild(
      scoreNumber
    );

    scoreElement.appendChild(
      scoreLabel
    );

    listItem.appendChild(
      rankElement
    );

    listItem.appendChild(
      playerInfo
    );

    listItem.appendChild(
      scoreElement
    );

    leaderboardList.appendChild(
      listItem
    );
  });
}

function getGameDisplayName(record) {
  const gameName =
    GAME_NAMES[record.game] ||
    record.game ||
    "數學遊戲";

  const modeName =
    getModeDisplayName(record.mode);

  if (!modeName) {
    return gameName;
  }

  return `${gameName}｜${modeName}`;
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
    MODE_NAMES[key] ||
    key
  );
}

function getRankDisplay(rank) {
  if (rank === 1) {
    return "🥇";
  }

  if (rank === 2) {
    return "🥈";
  }

  if (rank === 3) {
    return "🥉";
  }

  return rank;
}

function toSafeNumber(value) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatDate(timestamp) {
  if (!timestamp) {
    return "時間未記錄";
  }

  try {
    const date =
      typeof timestamp.toDate === "function"
        ? timestamp.toDate()
        : new Date(timestamp);

    return new Intl.DateTimeFormat(
      "zh-TW",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(date);
  } catch (error) {
    console.warn(
      "時間格式轉換失敗：",
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

  leaderboardList.innerHTML =
    "";
}

function showLoginRequiredMessage() {
  loadingMessage.hidden =
    true;

  emptyMessage.hidden =
    true;

  errorMessage.hidden =
    false;

  leaderboardList.innerHTML =
    "";

  errorMessage.textContent =
    "目前尚未登入，請回到首頁登入後再查看排行榜。";
}

function showError(error) {
  loadingMessage.hidden =
    true;

  emptyMessage.hidden =
    true;

  errorMessage.hidden =
    false;

  leaderboardList.innerHTML =
    "";

  if (
    error?.code ===
    "permission-denied"
  ) {
    errorMessage.textContent =
      "排行榜讀取權限不足，請確認 Firestore Rules 是否已允許登入玩家讀取 scores。";

    return;
  }

  if (
    error?.code ===
    "failed-precondition"
  ) {
    errorMessage.innerHTML =
      "這個排行榜查詢需要建立 Firestore 索引。<br>" +
      "請開啟瀏覽器 Console，點選 Firebase 提供的建立索引網址。";

    return;
  }

  errorMessage.textContent =
    `排行榜讀取失敗：${
      error?.message ||
      "未知錯誤"
    }`;
}