/*
==================================================
數學遊戲樂園：排行榜
檔案位置：js/leaderboard.js

版本：6.0
==================================================

功能：

1. 單模式遊戲：
   直接顯示排行榜

2. 多模式遊戲：
   依 game-config.js 顯示模式分頁

3. timed 固定時間型：
   分數 → 答對 → 答錯 → 連擊 → 達成時間

4. speed 完成型：
   分數 → 完成時間 → 達成時間

5. 同一玩家每一榜只保留最佳成績

6. 每榜最多 20 名
==================================================
*/

import {
  auth,
  db
} from "./firebase-config.js?v=6";

import {
  getFinishedGames,
  getGameConfig,
  getGameName
} from "./game-config.js?v=6";

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
基本設定
==================================================
*/

const LEADERBOARD_LIMIT =
  20;

let currentUser =
  null;

let selectedGame =
  "all";


/*
==================================================
動態樣式
==================================================
*/

function injectLeaderboardStyles() {

  if (
    document.getElementById(
      "leaderboardDynamicStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "leaderboardDynamicStyles";

  style.textContent = `

    .leaderboard-game-section {
      list-style: none;
      margin: 0 0 28px;
      padding: 0;
    }

    .leaderboard-game-title {
      margin: 0 0 14px;
      padding: 12px 16px;
      border-radius: 14px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 21px;
      font-weight: 900;
      text-align: left;
    }

    .leaderboard-single-title {
      margin: 0 0 12px;
      color: #334155;
      font-size: 18px;
      font-weight: 900;
      text-align: left;
    }

    .leaderboard-mode-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0 0 14px;
      padding: 4px 0;
    }

    .leaderboard-mode-tab {
      min-height: 42px;
      padding: 9px 15px;
      border: 2px solid #cbd5e1;
      border-radius: 12px;
      background: #ffffff;
      color: #475569;
      font: inherit;
      font-size: 14px;
      font-weight: 900;
      cursor: pointer;
    }

    .leaderboard-mode-tab:hover {
      border-color: #60a5fa;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .leaderboard-mode-tab.active {
      border-color: #2563eb;
      background: #2563eb;
      color: #ffffff;
      box-shadow:
        0 5px 12px
        rgba(37, 99, 235, .22);
    }

    .leaderboard-mode-content {
      display: block;
    }

    .leaderboard-mode-content[hidden] {
      display: none !important;
    }

    .leaderboard-mode-heading {
      margin: 0 0 10px;
      color: #334155;
      font-size: 17px;
      font-weight: 900;
      text-align: left;
    }

    .leaderboard-mode-empty {
      margin: 10px 0 18px;
      padding: 24px 16px;
      border: 2px dashed #cbd5e1;
      border-radius: 14px;
      background: #f8fafc;
      color: #64748b;
      font-size: 15px;
      font-weight: 800;
      text-align: center;
    }

    .leaderboard-ranking-list {
      display: grid;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .leaderboard-play-duration {
      margin-top: 3px;
      color: #0f766e;
      font-size: 13px;
      font-weight: 800;
    }

    .leaderboard-timed-detail {
      margin-top: 3px;
      color: #7c3aed;
      font-size: 13px;
      font-weight: 800;
    }

    @media (max-width: 560px) {

      .leaderboard-game-title {
        padding: 10px 12px;
        font-size: 18px;
      }

      .leaderboard-mode-tab {
        flex: 1 1 calc(50% - 6px);
        min-width: 120px;
        padding: 8px;
        font-size: 13px;
      }

      .leaderboard-mode-heading,
      .leaderboard-single-title {
        font-size: 16px;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}

injectLeaderboardStyles();


/*
==================================================
取得模式
==================================================
*/

function getConfiguredModes(
  gameId
) {

  const config =
    getGameConfig(
      gameId
    );

  if (
    !config?.modes ||
    typeof config.modes !==
      "object"
  ) {
    return [];
  }

  return Object.entries(
    config.modes
  ).map(
    ([id, name]) => ({
      id: String(id),
      name: String(name)
    })
  );
}


/*
==================================================
是否多模式
==================================================
*/

function isMultiModeGame(
  gameId
) {

  return (
    getConfiguredModes(
      gameId
    ).length >
    1
  );
}


/*
==================================================
排行榜類型
==================================================
*/

function getRankingType(
  gameId
) {

  const type =
    getGameConfig(
      gameId
    )?.ranking?.type;

  if (
    type === "timed"
  ) {
    return "timed";
  }

  return "speed";
}


/*
==================================================
篩選按鈕
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


function renderFilterButtons() {

  if (!filterBox) {
    return;
  }

  filterBox.innerHTML =
    "";

  filterBox.appendChild(
    createFilterButton({
      gameId: "all",
      label: "全部遊戲",
      active: true
    })
  );

  getFinishedGames()
    .forEach(
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
登入
==================================================
*/

onAuthStateChanged(

  auth,

  async (user) => {

    currentUser =
      user;

    if (!user) {

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
  },

  (error) => {

    console.error(
      "登入狀態確認失敗：",
      error
    );

    showError(
      error
    );
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

    const records =
      snapshot.docs.map(
        (documentSnapshot) => ({

          id:
            documentSnapshot.id,

          ...documentSnapshot.data()
        })
      );

    renderLeaderboard(
      records
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
完成時間
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
時間戳記
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
        ) *
        1000
      );
    }

    const date =
      new Date(
        timestamp
      );

    return Number.isFinite(
      date.getTime()
    )
      ? date.getTime()
      : Number.POSITIVE_INFINITY;

  } catch (_) {

    return Number.POSITIVE_INFINITY;
  }
}


/*
==================================================
speed 排序
==================================================
*/

function compareSpeedRecords(
  recordA,
  recordB
) {

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

  return (
    getTimestampMilliseconds(
      recordA.createdAt
    ) -
    getTimestampMilliseconds(
      recordB.createdAt
    )
  );
}


/*
==================================================
timed 排序
==================================================
*/

function compareTimedRecords(
  recordA,
  recordB
) {

  /*
  1. 分數高
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
  2. 答對多
  */

  const correctA =
    toSafeNumber(
      recordA.correctCount
    );

  const correctB =
    toSafeNumber(
      recordB.correctCount
    );

  if (
    correctA !==
    correctB
  ) {

    return (
      correctB -
      correctA
    );
  }


  /*
  3. 答錯少
  */

  const wrongA =
    toSafeNumber(
      recordA.wrongCount
    );

  const wrongB =
    toSafeNumber(
      recordB.wrongCount
    );

  if (
    wrongA !==
    wrongB
  ) {

    return (
      wrongA -
      wrongB
    );
  }


  /*
  4. 連擊高
  */

  const comboA =
    toSafeNumber(
      recordA.maxCombo
    );

  const comboB =
    toSafeNumber(
      recordB.maxCombo
    );

  if (
    comboA !==
    comboB
  ) {

    return (
      comboB -
      comboA
    );
  }


  /*
  5. 較早達成
  */

  return (
    getTimestampMilliseconds(
      recordA.createdAt
    ) -
    getTimestampMilliseconds(
      recordB.createdAt
    )
  );
}


/*
==================================================
統一排序
==================================================
*/

function compareScoreRecords(
  recordA,
  recordB
) {

  const gameId =
    recordA.game ||
    recordB.game ||
    "";

  if (
    getRankingType(
      gameId
    ) ===
    "timed"
  ) {

    return compareTimedRecords(
      recordA,
      recordB
    );
  }

  return compareSpeedRecords(
    recordA,
    recordB
  );
}


/*
==================================================
每位玩家最佳紀錄
==================================================
*/

function keepBestRecordPerPlayer(
  records
) {

  const playerMap =
    new Map();

  records.forEach(
    (record) => {

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
        compareScoreRecords(
          record,
          existing
        ) < 0
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
前 20 名
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
取得顯示遊戲
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

    return game
      ? [game]
      : [];
  }

  const ids =
    new Set(
      records.map(
        (record) =>
          record.game
      )
    );

  return getFinishedGames()
    .filter(
      (game) =>
        ids.has(
          game.id
        )
    );
}


/*
==================================================
顯示排行榜
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
    records.length ===
    0
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
單一遊戲
==================================================
*/

function renderGameLeaderboard(
  game,
  records
) {

  const section =
    document.createElement(
      "li"
    );

  section.className =
    "leaderboard-game-section";


  if (
    selectedGame ===
    "all"
  ) {

    const title =
      document.createElement(
        "div"
      );

    title.className =
      "leaderboard-game-title";

    title.textContent =
      game.name;

    section.appendChild(
      title
    );
  }


  if (
    isMultiModeGame(
      game.id
    )
  ) {

    renderMultiModeLeaderboard(
      section,
      game,
      records
    );

  } else {

    renderSingleModeLeaderboard(
      section,
      game,
      records
    );
  }

  leaderboardList.appendChild(
    section
  );
}


/*
==================================================
單模式排行榜
==================================================
*/

function renderSingleModeLeaderboard(
  parent,
  game,
  records
) {

  const title =
    document.createElement(
      "div"
    );

  title.className =
    "leaderboard-single-title";

  title.textContent =
    `前 ${LEADERBOARD_LIMIT} 名`;

  parent.appendChild(
    title
  );

  const topRecords =
    buildTopRecords(
      records
    );

  if (
    topRecords.length ===
    0
  ) {

    appendEmptyMessage(
      parent
    );

    return;
  }

  renderRankingList(
    parent,
    topRecords
  );
}


/*
==================================================
多模式排行榜
==================================================
*/

function renderMultiModeLeaderboard(
  parent,
  game,
  records
) {

  const modes =
    getConfiguredModes(
      game.id
    );

  const tabs =
    document.createElement(
      "div"
    );

  tabs.className =
    "leaderboard-mode-tabs";

  const contents =
    document.createElement(
      "div"
    );


  let firstIndex =
    modes.findIndex(
      (mode) =>
        records.some(
          (record) =>
            String(
              record.mode ??
              ""
            ) ===
            mode.id
        )
    );

  if (
    firstIndex <
    0
  ) {
    firstIndex =
      0;
  }


  modes.forEach(
    (
      mode,
      index
    ) => {

      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "leaderboard-mode-tab";

      button.textContent =
        mode.name;

      button.dataset.mode =
        mode.id;


      const content =
        document.createElement(
          "div"
        );

      content.className =
        "leaderboard-mode-content";

      content.dataset.mode =
        mode.id;


      const heading =
        document.createElement(
          "div"
        );

      heading.className =
        "leaderboard-mode-heading";

      heading.textContent =
        `${mode.name}｜前 ${LEADERBOARD_LIMIT} 名`;

      content.appendChild(
        heading
      );


      const modeRecords =
        records.filter(
          (record) =>
            String(
              record.mode ??
              ""
            ) ===
            mode.id
        );


      const topRecords =
        buildTopRecords(
          modeRecords
        );


      if (
        topRecords.length ===
        0
      ) {

        appendEmptyMessage(
          content,
          "目前這個模式尚無成績"
        );

      } else {

        renderRankingList(
          content,
          topRecords
        );
      }


      const active =
        index ===
        firstIndex;

      button.classList.toggle(
        "active",
        active
      );

      content.hidden =
        !active;


      button.addEventListener(
        "click",

        () => {

          tabs
            .querySelectorAll(
              ".leaderboard-mode-tab"
            )
            .forEach(
              (tab) => {

                tab.classList.toggle(
                  "active",
                  tab === button
                );
              }
            );


          contents
            .querySelectorAll(
              ".leaderboard-mode-content"
            )
            .forEach(
              (panel) => {

                panel.hidden =
                  panel.dataset.mode !==
                  mode.id;
              }
            );
        }
      );


      tabs.appendChild(
        button
      );

      contents.appendChild(
        content
      );
    }
  );


  parent.appendChild(
    tabs
  );

  parent.appendChild(
    contents
  );
}


/*
==================================================
排行榜清單
==================================================
*/

function renderRankingList(
  parent,
  records
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

      list.appendChild(
        createLeaderboardItem(
          record,
          index + 1
        )
      );
    }
  );


  parent.appendChild(
    list
  );
}


/*
==================================================
建立排行榜單筆
==================================================
*/

function createLeaderboardItem(
  record,
  rank
) {

  const item =
    document.createElement(
      "li"
    );

  item.className =
    "leaderboard-item";


  if (
    currentUser &&
    record.uid ===
      currentUser.uid
  ) {

    item.classList.add(
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
      rank
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
    getGameName(
      record.game
    );


  playerInfo.appendChild(
    playerName
  );

  playerInfo.appendChild(
    gameName
  );


  /*
  ==================================================
  timed
  ==================================================
  */

  if (
    getRankingType(
      record.game
    ) ===
    "timed"
  ) {

    const detail =
      document.createElement(
        "div"
      );

    detail.className =
      "leaderboard-timed-detail";

    detail.textContent =
      `✅ 答對 ${toSafeNumber(
        record.correctCount
      )} 題` +
      `｜❌ 答錯 ${toSafeNumber(
        record.wrongCount
      )} 題` +
      `｜🔥 最高連擊 ${toSafeNumber(
        record.maxCombo
      )}`;

    playerInfo.appendChild(
      detail
    );

  } else {

    /*
    ==================================================
    speed
    ==================================================
    */

    const duration =
      document.createElement(
        "div"
      );

    duration.className =
      "leaderboard-play-duration";

    const playTime =
      getPlayTime(
        record
      );

    duration.textContent =
      Number.isFinite(
        playTime
      )
        ? `⏱ 完成時間：${formatPlayTime(
            playTime
          )}`
        : "⏱ 完成時間：未記錄";

    playerInfo.appendChild(
      duration
    );
  }


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


  item.appendChild(
    rankElement
  );

  item.appendChild(
    playerInfo
  );

  item.appendChild(
    scoreElement
  );


  return item;
}


/*
==================================================
名次
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

  return String(
    rank
  );
}


/*
==================================================
遊戲時間格式
==================================================
*/

function formatPlayTime(
  seconds
) {

  const safe =
    Math.max(
      0,
      Math.round(
        toSafeNumber(
          seconds
        )
      )
    );

  if (
    safe <
    60
  ) {

    return `${safe} 秒`;
  }

  const minutes =
    Math.floor(
      safe /
      60
    );

  const remaining =
    safe %
    60;

  if (
    remaining ===
    0
  ) {

    return `${minutes} 分`;
  }

  return (
    `${minutes} 分 ` +
    `${remaining} 秒`
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
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }
    ).format(
      date
    );

  } catch (_) {

    return "時間格式錯誤";
  }
}


/*
==================================================
空資料
==================================================
*/

function appendEmptyMessage(
  parent,
  message = "目前尚無成績"
) {

  const element =
    document.createElement(
      "div"
    );

  element.className =
    "leaderboard-mode-empty";

  element.textContent =
    message;

  parent.appendChild(
    element
  );
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

  if (userStatus) {

    userStatus.textContent =
      "目前尚未登入，請先回到首頁登入。";
  }

  if (loadingMessage) {
    loadingMessage.hidden =
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

  if (errorMessage) {

    errorMessage.hidden =
      false;

    errorMessage.textContent =
      "請先登入 Google 帳號，才能查看排行榜。";
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

  if (leaderboardList) {

    leaderboardList.innerHTML =
      "";
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
      "排行榜讀取權限不足，請確認 Firestore Rules。";

    return;
  }

  errorMessage.textContent =
    `排行榜載入失敗：${
      error?.message ||
      "未知錯誤"
    }`;
}
