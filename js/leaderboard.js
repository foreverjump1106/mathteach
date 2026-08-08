/*
==================================================
數學遊戲樂園：排行榜
檔案位置：js/leaderboard.js
版本：2.0 - 多模式獨立排行榜
==================================================

排行榜規則：

1. 有多種模式的遊戲：
   每個模式各自建立排行榜。

2. 每個模式最多顯示前 20 名。

3. 同一玩家在：
   同一遊戲 + 同一模式
   只保留最佳成績。

4. 最佳成績判斷：
   第一順位：分數較高
   第二順位：遊戲時間較短
   第三順位：較早達成

5. 單模式遊戲：
   直接顯示該遊戲排行榜。

6. 同分時：
   playTime 較短者排名較前。

7. 排行榜模式名稱：
   自動讀取 game-config.js。

8. 不在 Firestore 查詢階段 limit(20)，
   避免多模式遊戲資料被提前截斷。
==================================================
*/

import {
  auth,
  db
} from "./firebase-config.js";

import {
  getFinishedGames,
  getGameDisplayName,
  getGameConfig,
  getGameName,
  getModeName
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

const leaderboardList =
  document.getElementById(
    "leaderboardList"
  );

const filterBox =
  document.getElementById(
    "filterBox"
  );


/*
==================================================
狀態
==================================================
*/

let currentUser = null;

let selectedGame =
  "all";

const LEADERBOARD_LIMIT =
  20;


/*
==================================================
建立遊戲篩選按鈕
==================================================
*/

function createFilterButton({
  gameId,
  label,
  active = false
}) {
  const button =
    document.createElement(
      "button"
    );

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
        ?.querySelectorAll(
          ".filter-button"
        )
        .forEach(
          (item) => {
            item.classList.remove(
              "active"
            );
          }
        );

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


/*
==================================================
建立遊戲篩選區
==================================================
*/

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
    currentUser =
      user;

    if (!user) {
      if (userStatus) {
        userStatus.textContent =
          "請先回到首頁登入 Google 帳號，才能查看排行榜。";
      }

      showLoginRequiredMessage();

      return;
    }

    const playerName =
      user.displayName ||
      user.email ||
      "玩家";

    if (userStatus) {
      userStatus.textContent =
        `目前登入：${playerName}`;
    }

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

    /*
    ================================================
    重要：
    這裡不再使用 limit(20)。

    因為如果先限制 20 筆，
    多模式遊戲就可能只抓到某一個模式，
    其他模式沒有足夠資料。
    ================================================
    */

    if (
      selectedGame ===
      "all"
    ) {
      leaderboardQuery =
        query(
          scoresReference
        );
    } else {
      leaderboardQuery =
        query(
          scoresReference,

          where(
            "game",
            "==",
            selectedGame
          )
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

    showError(
      error
    );
  }
}


/*
==================================================
取得遊戲模式設定
==================================================
*/

function getConfiguredModes(
  gameId
) {
  const game =
    getGameConfig(
      gameId
    );

  if (
    !game ||
    !game.modes
  ) {
    return [];
  }

  return Object.entries(
    game.modes
  ).map(
    (
      [
        modeId,
        modeName
      ]
    ) => ({
      id:
        String(
          modeId
        ),

      name:
        modeName
    })
  );
}


/*
==================================================
判斷遊戲是否為多模式
==================================================
*/

function isMultiModeGame(
  gameId
) {
  return (
    getConfiguredModes(
      gameId
    ).length > 1
  );
}


/*
==================================================
模式標準化
==================================================
*/

function normalizeMode(
  mode
) {
  if (
    mode === undefined ||
    mode === null
  ) {
    return "";
  }

  return String(
    mode
  );
}


/*
==================================================
安全數字
==================================================
*/

function toSafeNumber(
  value,
  fallback = 0
) {
  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
}


/*
==================================================
取得遊戲時間

舊資料如果沒有 playTime，
視為非常慢，避免排到同分玩家前面。
==================================================
*/

function getPlayTime(
  record
) {
  const value =
    Number(
      record?.playTime
    );

  if (
    Number.isFinite(
      value
    ) &&
    value >= 0
  ) {
    return value;
  }

  return Number.POSITIVE_INFINITY;
}


/*
==================================================
Timestamp 轉毫秒
==================================================
*/

function getTimestampMilliseconds(
  timestamp
) {
  if (!timestamp) {
    return Number.POSITIVE_INFINITY;
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

    const date =
      new Date(
        timestamp
      );

    const time =
      date.getTime();

    if (
      Number.isFinite(
        time
      )
    ) {
      return time;
    }
  } catch (_) {}

  return Number.POSITIVE_INFINITY;
}


/*
==================================================
比較兩筆成績

回傳：
負數 = A 排前面
正數 = B 排前面
0 = 完全相同
==================================================
*/

function compareScoreRecords(
  recordA,
  recordB
) {
  /*
  第一順位：
  分數高者優先
  */

  const scoreA =
    toSafeNumber(
      recordA.score
    );

  const scoreB =
    toSafeNumber(
      recordB.score
    );

  if (
    scoreA !==
    scoreB
  ) {
    return (
      scoreB -
      scoreA
    );
  }

  /*
  第二順位：
  完成時間短者優先
  */

  const timeA =
    getPlayTime(
      recordA
    );

  const timeB =
    getPlayTime(
      recordB
    );

  if (
    timeA !==
    timeB
  ) {
    return (
      timeA -
      timeB
    );
  }

  /*
  第三順位：
  較早達成者優先
  */

  const createdA =
    getTimestampMilliseconds(
      recordA.createdAt
    );

  const createdB =
    getTimestampMilliseconds(
      recordB.createdAt
    );

  if (
    createdA !==
    createdB
  ) {
    return (
      createdA -
      createdB
    );
  }

  /*
  最後用文件 ID，
  保證排序結果穩定。
  */

  return String(
    recordA.id ||
    ""
  ).localeCompare(
    String(
      recordB.id ||
      ""
    )
  );
}


/*
==================================================
判斷新紀錄是否比舊紀錄好
==================================================
*/

function isBetterRecord(
  newRecord,
  oldRecord
) {
  if (!oldRecord) {
    return true;
  }

  return (
    compareScoreRecords(
      newRecord,
      oldRecord
    ) < 0
  );
}


/*
==================================================
同一玩家只保留最佳成績
==================================================
*/

function keepBestRecordPerPlayer(
  records
) {
  const playerMap =
    new Map();

  records.forEach(
    (record) => {
      /*
      正常登入玩家使用 uid。

      若舊資料沒有 uid，
      則使用文件 ID，
      避免不同玩家被誤認為同一人。
      */

      const playerKey =
        record.uid
          ? `uid:${record.uid}`
          : `doc:${record.id}`;

      const existing =
        playerMap.get(
          playerKey
        );

      if (
        !existing ||
        isBetterRecord(
          record,
          existing
        )
      ) {
        playerMap.set(
          playerKey,
          record
        );
      }
    }
  );

  return Array.from(
    playerMap.values()
  );
}


/*
==================================================
建立前 20 名
==================================================
*/

function buildTopRecords(
  records
) {
  const bestRecords =
    keepBestRecordPerPlayer(
      records
    );

  bestRecords.sort(
    compareScoreRecords
  );

  return bestRecords.slice(
    0,
    LEADERBOARD_LIMIT
  );
}


/*
==================================================
依模式分組
==================================================
*/

function groupRecordsByMode(
  gameId,
  records
) {
  const groups =
    new Map();

  const configuredModes =
    getConfiguredModes(
      gameId
    );

  /*
  先按照 game-config 建立模式，
  即使某模式目前沒有人玩，
  也能保留模式順序。
  */

  configuredModes.forEach(
    (mode) => {
      groups.set(
        mode.id,
        []
      );
    }
  );

  /*
  再放入實際成績。
  */

  records.forEach(
    (record) => {
      const mode =
        normalizeMode(
          record.mode
        );

      if (
        !groups.has(
          mode
        )
      ) {
        groups.set(
          mode,
          []
        );
      }

      groups
        .get(
          mode
        )
        .push(
          record
        );
    }
  );

  return groups;
}


/*
==================================================
取得排行榜顯示用的遊戲清單
==================================================
*/

function getGamesForLeaderboard(
  records
) {
  if (
    selectedGame !==
    "all"
  ) {
    const game =
      getGameConfig(
        selectedGame
      );

    if (game) {
      return [
        game
      ];
    }

    return [];
  }

  /*
  全部遊戲：
  依 game-config 的正式順序。
  */

  const finishedGames =
    getFinishedGames();

  const recordGameIds =
    new Set(
      records.map(
        (record) =>
          record.game
      )
    );

  return finishedGames.filter(
    (game) =>
      recordGameIds.has(
        game.id
      )
  );
}


/*
==================================================
主排行榜顯示
==================================================
*/

function renderLeaderboard(
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

  if (leaderboardList) {
    leaderboardList.innerHTML =
      "";
  }

  if (
    !leaderboardList
  ) {
    console.error(
      "找不到 leaderboardList。"
    );

    return;
  }

  if (
    records.length === 0
  ) {
    if (emptyMessage) {
      emptyMessage.hidden =
        false;
    }

    return;
  }

  if (emptyMessage) {
    emptyMessage.hidden =
      true;
  }

  const games =
    getGamesForLeaderboard(
      records
    );

  if (
    games.length === 0
  ) {
    if (emptyMessage) {
      emptyMessage.hidden =
        false;
    }

    return;
  }

  games.forEach(
    (game) => {
      const gameRecords =
        records.filter(
          (record) =>
            record.game ===
            game.id
        );

      renderGameLeaderboard(
        game,
        gameRecords
      );
    }
  );
}


/*
==================================================
顯示單一遊戲排行榜
==================================================
*/

function renderGameLeaderboard(
  game,
  records
) {
  if (
    !game ||
    !leaderboardList
  ) {
    return;
  }

  const gameSection =
    document.createElement(
      "li"
    );

  gameSection.className =
    "leaderboard-game-section";

  /*
  遊戲標題
  */

  if (
    selectedGame ===
    "all"
  ) {
    const gameTitle =
      document.createElement(
        "div"
      );

    gameTitle.className =
      "leaderboard-game-title";

    gameTitle.textContent =
      game.name;

    gameSection.appendChild(
      gameTitle
    );
  }

  const configuredModes =
    getConfiguredModes(
      game.id
    );

  /*
  ================================================
  多模式遊戲
  ================================================
  */

  if (
    configuredModes.length >
    1
  ) {
    const groups =
      groupRecordsByMode(
        game.id,
        records
      );

    configuredModes.forEach(
      (mode) => {
        const modeRecords =
          groups.get(
            mode.id
          ) || [];

        renderModeLeaderboard(
          gameSection,
          game,
          mode.id,
          mode.name,
          modeRecords,
          true
        );
      }
    );

    /*
    如果資料庫存在舊模式，
    但 game-config 已經沒有，
    不讓資料直接消失。

    會放在正式模式後方。
    */

    groups.forEach(
      (
        modeRecords,
        modeId
      ) => {
        const alreadyConfigured =
          configuredModes.some(
            (mode) =>
              mode.id ===
              modeId
          );

        if (
          alreadyConfigured
        ) {
          return;
        }

        if (
          modeRecords.length ===
          0
        ) {
          return;
        }

        renderModeLeaderboard(
          gameSection,
          game,
          modeId,
          getModeName(
            game.id,
            modeId
          ) ||
            "其他模式",
          modeRecords,
          true
        );
      }
    );
  }

  /*
  ================================================
  單模式遊戲
  ================================================
  */

  else {
    /*
    即使 game-config 有一個模式，
    也視為單排行榜。

    不另外做不必要的模式分區。
    */

    const topRecords =
      buildTopRecords(
        records
      );

    renderRankingList(
      gameSection,
      topRecords,
      {
        showMode:
          false
      }
    );
  }

  leaderboardList.appendChild(
    gameSection
  );
}


/*
==================================================
顯示單一模式排行榜
==================================================
*/

function renderModeLeaderboard(
  parent,
  game,
  modeId,
  modeName,
  records,
  showModeTitle
) {
  const modeSection =
    document.createElement(
      "div"
    );

  modeSection.className =
    "leaderboard-mode-section";

  if (
    showModeTitle
  ) {
    const modeTitle =
      document.createElement(
        "div"
      );

    modeTitle.className =
      "leaderboard-mode-title";

    modeTitle.textContent =
      modeName ||
      getModeName(
        game.id,
        modeId
      ) ||
      "模式";

    modeSection.appendChild(
      modeTitle
    );
  }

  const topRecords =
    buildTopRecords(
      records
    );

  if (
    topRecords.length ===
    0
  ) {
    const noScore =
      document.createElement(
        "div"
      );

    noScore.className =
      "leaderboard-mode-empty";

    noScore.textContent =
      "目前尚無成績";

    modeSection.appendChild(
      noScore
    );
  } else {
    renderRankingList(
      modeSection,
      topRecords,
      {
        showMode:
          false
      }
    );
  }

  parent.appendChild(
    modeSection
  );
}


/*
==================================================
建立排行榜清單
==================================================
*/

function renderRankingList(
  parent,
  records,
  {
    showMode = false
  } = {}
) {
  const list =
    document.createElement(
      "ol"
    );

  list.className =
    "leaderboard-ranking-list";

  records.forEach(
    (
      record,
      index
    ) => {
      const listItem =
        createLeaderboardItem(
          record,
          index + 1,
          showMode
        );

      list.appendChild(
        listItem
      );
    }
  );

  parent.appendChild(
    list
  );
}


/*
==================================================
建立單筆排行榜
==================================================
*/

function createLeaderboardItem(
  record,
  rank,
  showMode = false
) {
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

  /*
  名次
  */

  const rankElement =
    document.createElement(
      "div"
    );

  rankElement.className =
    "rank";

  rankElement.textContent =
    getRankDisplay(
      rank
    );

  /*
  玩家資訊
  */

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

  playerInfo.appendChild(
    playerName
  );

  /*
  遊戲／模式名稱
  */

  const gameName =
    document.createElement(
      "div"
    );

  gameName.className =
    "game-name";

  if (showMode) {
    gameName.textContent =
      getGameDisplayName(
        record.game,
        record.mode
      );
  } else {
    gameName.textContent =
      getGameName(
        record.game
      );
  }

  playerInfo.appendChild(
    gameName
  );

  /*
  完成時間
  */

  const playTimeElement =
    document.createElement(
      "div"
    );

  playTimeElement.className =
    "leaderboard-play-duration";

  const playTime =
    getPlayTime(
      record
    );

  if (
    Number.isFinite(
      playTime
    )
  ) {
    playTimeElement.textContent =
      `⏱ ${formatPlayTime(
        playTime
      )}`;
  } else {
    playTimeElement.textContent =
      "⏱ 時間未記錄";
  }

  playerInfo.appendChild(
    playTimeElement
  );

  /*
  成績建立日期
  */

  const createdTime =
    document.createElement(
      "div"
    );

  createdTime.className =
    "play-time";

  createdTime.textContent =
    formatDate(
      record.createdAt
    );

  playerInfo.appendChild(
    createdTime
  );

  /*
  分數
  */

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

  /*
  組合
  */

  listItem.appendChild(
    rankElement
  );

  listItem.appendChild(
    playerInfo
  );

  listItem.appendChild(
    scoreElement
  );

  return listItem;
}


/*
==================================================
名次
==================================================
*/

function getRankDisplay(
  rank
) {
  if (
    rank === 1
  ) {
    return "🥇";
  }

  if (
    rank === 2
  ) {
    return "🥈";
  }

  if (
    rank === 3
  ) {
    return "🥉";
  }

  return String(
    rank
  );
}


/*
==================================================
遊戲時間格式

例如：
45 -> 45秒
75 -> 1分15秒
==================================================
*/

function formatPlayTime(
  seconds
) {
  const safeSeconds =
    Math.max(
      0,
      Math.round(
        toSafeNumber(
          seconds
        )
      )
    );

  if (
    safeSeconds <
    60
  ) {
    return `${safeSeconds}秒`;
  }

  const minutes =
    Math.floor(
      safeSeconds /
      60
    );

  const remainingSeconds =
    safeSeconds %
    60;

  if (
    remainingSeconds ===
    0
  ) {
    return `${minutes}分`;
  }

  return (
    `${minutes}分` +
    `${remainingSeconds}秒`
  );
}


/*
==================================================
日期格式
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
    ).format(
      date
    );
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

  if (leaderboardList) {
    leaderboardList.innerHTML =
      "";
  }
}


/*
==================================================
未登入
==================================================
*/

function showLoginRequiredMessage() {
  if (loadingMessage) {
    loadingMessage.hidden =
      true;
  }

  if (emptyMessage) {
    emptyMessage.hidden =
      true;
  }

  if (errorMessage) {
    errorMessage.hidden =
      false;

    errorMessage.textContent =
      "目前尚未登入，請回到首頁登入後再查看排行榜。";
  }

  if (leaderboardList) {
    leaderboardList.innerHTML =
      "";
  }
}


/*
==================================================
錯誤
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

  if (errorMessage) {
    errorMessage.hidden =
      false;
  }

  if (leaderboardList) {
    leaderboardList.innerHTML =
      "";
  }

  if (!errorMessage) {
    return;
  }

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
    errorMessage.textContent =
      "排行榜查詢需要 Firestore 索引，請檢查 Firebase Console。";

    return;
  }

  errorMessage.textContent =
    `排行榜讀取失敗：${
      error?.message ||
      "未知錯誤"
    }`;
}
