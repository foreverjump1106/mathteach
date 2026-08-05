import { auth, db } from "./firebase-config.js";

import {
  getFinishedGames,
  getGameDisplayName
} from "./game-config.js";

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

const filterBox =
  document.getElementById("filterBox");

let currentUser = null;
let selectedGame = "all";

/*
==================================================
依 game-config.js 自動建立排行榜篩選按鈕
==================================================
*/

function createFilterButton({
  gameId,
  label,
  active = false
}) {
  const button =
    document.createElement("button");

  button.className =
    "filter-button";

  button.type =
    "button";

  button.dataset.game =
    gameId;

  button.textContent =
    label;

  if (active) {
    button.classList.add(
      "active"
    );
  }

  button.addEventListener(
    "click",
    async () => {
      if (!currentUser) {
        return;
      }

      filterBox
        .querySelectorAll(
          ".filter-button"
        )
        .forEach((item) => {
          item.classList.remove(
            "active"
          );
        });

      button.classList.add(
        "active"
      );

      selectedGame =
        gameId;

      await loadLeaderboard();
    }
  );

  return button;
}

function renderFilterButtons() {
  if (!filterBox) {
    console.error(
      "找不到排行榜篩選區域 filterBox。"
    );

    return;
  }

  filterBox.innerHTML =
    "";

  filterBox.appendChild(
    createFilterButton({
      gameId:
        "all",

      label:
        "全部遊戲",

      active:
        true
    })
  );

  const finishedGames =
    getFinishedGames();

  finishedGames.forEach(
    (game) => {
      filterBox.appendChild(
        createFilterButton({
          gameId:
            game.id,

          label:
            game.shortName ||
            game.name
        })
      );
    }
  );
}

renderFilterButtons();

/*
==================================================
登入狀態
==================================================
*/

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

/*
==================================================
讀取排行榜
==================================================
*/

async function loadLeaderboard() {
  setLoadingState();

  try {
    const scoresReference =
      collection(
        db,
        "scores"
      );

    let leaderboardQuery;

    if (
      selectedGame ===
      "all"
    ) {
      leaderboardQuery =
        query(
          scoresReference,

          orderBy(
            "score",
            "desc"
          ),

          limit(20)
        );
    } else {
      leaderboardQuery =
        query(
          scoresReference,

          where(
            "game",
            "==",
            selectedGame
          ),

          orderBy(
            "score",
            "desc"
          ),

          limit(20)
        );
    }

    const snapshot =
      await getDocs(
        leaderboardQuery
      );

    const scoreRecords =
      snapshot.docs.map(
        (
          documentSnapshot
        ) => ({
          id:
            documentSnapshot.id,

          ...documentSnapshot.data()
        })
      );

    renderLeaderboard(
      scoreRecords
    );
  } catch (error) {
    console.error(
      "排行榜讀取失敗：",
      error
    );

    showError(error);
  }
}

/*
==================================================
顯示排行榜
==================================================
*/

function renderLeaderboard(
  records
) {
  loadingMessage.hidden =
    true;

  errorMessage.hidden =
    true;

  leaderboardList.innerHTML =
    "";

  if (
    records.length === 0
  ) {
    emptyMessage.hidden =
      false;

    return;
  }

  emptyMessage.hidden =
    true;

  records.forEach(
    (
      record,
      index
    ) => {
      const listItem =
        document.createElement(
          "li"
        );

      listItem.className =
        "leaderboard-item";

      if (
        currentUser &&
        record.uid ===
          currentUser.uid
      ) {
        listItem.classList.add(
          "current-user"
        );
      }

      const rankElement =
        document.createElement(
          "div"
        );

      rankElement.className =
        "rank";

      rankElement.textContent =
        getRankDisplay(
          index + 1
        );

      const playerInfo =
        document.createElement(
          "div"
        );

      playerInfo.className =
        "player-info";

      const playerName =
        document.createElement(
          "div"
        );

      playerName.className =
        "player-name";

      playerName.textContent =
        record.playerName ||
        record.displayName ||
        "未命名玩家";

      const gameName =
        document.createElement(
          "div"
        );

      gameName.className =
        "game-name";

      gameName.textContent =
        getGameDisplayName(
          record.game,
          record.mode
        );

      const playTime =
        document.createElement(
          "div"
        );

      playTime.className =
        "play-time";

      playTime.textContent =
        formatDate(
          record.createdAt
        );

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
        document.createElement(
          "div"
        );

      scoreElement.className =
        "score";

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
    }
  );
}

/*
==================================================
名次顯示
==================================================
*/

function getRankDisplay(
  rank
) {
  if (rank === 1) {
    return "🥇";
  }

  if (rank === 2) {
    return "🥈";
  }

  if (rank === 3) {
    return "🥉";
  }

  return String(rank);
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
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

/*
==================================================
時間格式
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
          timestamp.seconds *
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
    ).format(date);
  } catch (error) {
    console.warn(
      "時間格式轉換失敗：",
      error
    );

    return "時間格式錯誤";
  }
}

/*
==================================================
載入狀態
==================================================
*/

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

/*
==================================================
尚未登入
==================================================
*/

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

/*
==================================================
錯誤訊息
==================================================
*/

function showError(
  error
) {
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