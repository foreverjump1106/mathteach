/*
==================================================
數學遊戲樂園：排行榜
檔案位置：js/leaderboard.js

版本：2.1
多模式獨立排行＋模式切換版
==================================================

排行榜規則：

1. 多模式遊戲：
   每個模式各自排行。

2. 多模式排行榜：
   使用模式按鈕切換，
   不把所有模式全部往下排列。

3. 每個模式最多前 20 名。

4. 同一玩家：
   同一遊戲＋同一模式
   只保留最佳紀錄。

5. 最佳紀錄比較順序：
   ① 分數高
   ② playTime 短
   ③ 較早達成

6. 單模式遊戲：
   直接顯示前 20 名。

7. Firestore 不先 limit(20)，
   避免不同模式被提前截斷。
==================================================
*/

import {
  auth,
  db
} from "./firebase-config.js";

import {
  getFinishedGames,
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
排行榜專用樣式

直接由 JS 加入，
因此目前 leaderboard.html
不需要額外修改。
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
    /*
    ================================================
    遊戲區塊
    ================================================
    */

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
      line-height: 1.4;
      text-align: left;
    }


    /*
    ================================================
    模式切換
    ================================================
    */

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

      transition:
        background-color .15s ease,
        color .15s ease,
        border-color .15s ease,
        transform .15s ease;

      touch-action: manipulation;

      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }

    .leaderboard-mode-tab:hover {
      border-color: #60a5fa;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .leaderboard-mode-tab:active {
      transform: scale(.98);
    }

    .leaderboard-mode-tab.active {
      border-color: #2563eb;
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 5px 12px rgba(37, 99, 235, .22);
    }


    /*
    ================================================
    模式排行榜內容
    ================================================
    */

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


    /*
    ================================================
    排行清單
    ================================================
    */

    .leaderboard-ranking-list {
      list-style: none;
      margin: 0;
      padding: 0;

      display: grid;
      gap: 10px;
    }

    .leaderboard-ranking-list
    .leaderboard-item {
      margin: 0;
    }


    /*
    ================================================
    遊戲時間
    ================================================
    */

    .leaderboard-play-duration {
      margin-top: 3px;
      color: #0f766e;
      font-size: 13px;
      font-weight: 800;
    }


    /*
    ================================================
    手機
    ================================================
    */

    @media (max-width: 560px) {

      .leaderboard-game-title {
        font-size: 18px;
        padding: 10px 12px;
      }

      .leaderboard-mode-tabs {
        gap: 6px;
      }

      .leaderboard-mode-tab {
        flex: 1 1 calc(50% - 6px);
        min-width: 120px;
        padding: 8px 8px;
        font-size: 13px;
      }

      .leaderboard-mode-heading {
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
遊戲篩選按鈕
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
    不在 Firestore 階段先 limit 20。

    因為：
    不同模式都需要各自前 20 名。
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
遊戲模式
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
        String(
          modeName
        )
    })
  );
}


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
遊戲時間
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

  /*
  舊資料沒有時間時，
  同分時排在有時間資料的人後面。
  */

  return Number.POSITIVE_INFINITY;
}


/*
==================================================
Firestore Timestamp
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
排行榜排序核心
==================================================
*/

function compareScoreRecords(
  recordA,
  recordB
) {
  /*
  第一順位：
  分數較高
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
  花費時間較短
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
  較早達成
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
  最後以文件 ID
  保持排序穩定。
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
判斷新紀錄是否較佳
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
同一玩家只留最佳成績
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
取得前 20 名
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
  先依 game-config 建立模式，
  保證按鈕順序一致。
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
  再加入 Firestore 實際紀錄。
  */

  records.forEach(
    (record) => {
      const modeId =
        normalizeMode(
          record.mode
        );

      if (
        !groups.has(
          modeId
        )
      ) {
        groups.set(
          modeId,
          []
        );
      }

      groups
        .get(
          modeId
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
排行榜需要顯示的遊戲
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

  const recordGameIds =
    new Set(
      records.map(
        (record) =>
          record.game
      )
    );

  return getFinishedGames()
    .filter(
      (game) =>
        recordGameIds.has(
          game.id
        )
    );
}


/*
==================================================
主顯示
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

  if (!leaderboardList) {
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
單一遊戲排行榜
==================================================
*/

function renderGameLeaderboard(
  game,
  records
) {
  const gameSection =
    document.createElement(
      "li"
    );

  gameSection.className =
    "leaderboard-game-section";


  /*
  全部遊戲模式時，
  顯示遊戲標題。
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
    renderMultiModeLeaderboard(
      gameSection,
      game,
      records
    );
  }

  /*
  ================================================
  單模式遊戲
  ================================================
  */

  else {
    const topRecords =
      buildTopRecords(
        records
      );

    if (
      topRecords.length ===
      0
    ) {
      appendEmptyMessage(
        gameSection
      );
    } else {
      renderRankingList(
        gameSection,
        topRecords
      );
    }
  }

  leaderboardList.appendChild(
    gameSection
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
  const configuredModes =
    getConfiguredModes(
      game.id
    );

  const groups =
    groupRecordsByMode(
      game.id,
      records
    );


  /*
  ================================================
  正式模式＋舊資料模式
  ================================================
  */

  const modes =
    [...configuredModes];

  groups.forEach(
    (
      modeRecords,
      modeId
    ) => {
      const exists =
        modes.some(
          (mode) =>
            mode.id ===
            modeId
        );

      if (
        !exists &&
        modeRecords.length >
          0
      ) {
        modes.push({
          id:
            modeId,

          name:
            getModeName(
              game.id,
              modeId
            ) ||
            modeId ||
            "其他模式"
        });
      }
    }
  );


  if (
    modes.length === 0
  ) {
    const topRecords =
      buildTopRecords(
        records
      );

    renderRankingList(
      parent,
      topRecords
    );

    return;
  }


  /*
  ================================================
  模式按鈕
  ================================================
  */

  const tabs =
    document.createElement(
      "div"
    );

  tabs.className =
    "leaderboard-mode-tabs";

  tabs.setAttribute(
    "role",
    "tablist"
  );


  /*
  ================================================
  模式內容區
  ================================================
  */

  const contents =
    document.createElement(
      "div"
    );

  contents.className =
    "leaderboard-mode-contents";


  let firstAvailableIndex =
    modes.findIndex(
      (mode) => {
        const modeRecords =
          groups.get(
            mode.id
          ) || [];

        return (
          modeRecords.length >
          0
        );
      }
    );

  if (
    firstAvailableIndex <
    0
  ) {
    firstAvailableIndex =
      0;
  }


  modes.forEach(
    (
      mode,
      index
    ) => {
      /*
      ==============================================
      Tab button
      ==============================================
      */

      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "leaderboard-mode-tab";

      button.dataset.mode =
        mode.id;

      button.textContent =
        mode.name;

      button.setAttribute(
        "role",
        "tab"
      );


      /*
      ==============================================
      模式排行榜
      ==============================================
      */

      const content =
        document.createElement(
          "div"
        );

      content.className =
        "leaderboard-mode-content";

      content.dataset.mode =
        mode.id;

      content.setAttribute(
        "role",
        "tabpanel"
      );


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
        groups.get(
          mode.id
        ) || [];

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


      /*
      ==============================================
      初始模式
      ==============================================
      */

      const initial =
        index ===
        firstAvailableIndex;

      button.classList.toggle(
        "active",
        initial
      );

      button.setAttribute(
        "aria-selected",
        String(
          initial
        )
      );

      content.hidden =
        !initial;


      /*
      ==============================================
      點擊切換
      ==============================================
      */

      button.addEventListener(
        "click",
        () => {
          tabs
            .querySelectorAll(
              ".leaderboard-mode-tab"
            )
            .forEach(
              (tab) => {
                const active =
                  tab === button;

                tab.classList.toggle(
                  "active",
                  active
                );

                tab.setAttribute(
                  "aria-selected",
                  String(active)
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
建立排行榜清單
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
單一排行榜項目
==================================================
*/

function createLeaderboardItem(
  record,
  rank
) {
  const listItem =
    document.createElement(
      "li"
    );

  listItem.className =
    "leaderboard-item";


  /*
  ================================================
  自己的紀錄
  ================================================
  */

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
  ================================================
  名次
  ================================================
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
  ================================================
  玩家資料
  ================================================
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


  /*
  遊戲名稱
  */

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


  /*
  完成時間
  */

  const playDuration =
    document.createElement(
      "div"
    );

  playDuration.className =
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
    playDuration.textContent =
      `⏱ 完成時間：${formatPlayTime(
        playTime
      )}`;
  } else {
    playDuration.textContent =
      "⏱ 完成時間：未記錄";
  }


  /*
  達成日期
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
    playerName
  );

  playerInfo.appendChild(
    gameName
  );

  playerInfo.appendChild(
    playDuration
  );

  playerInfo.appendChild(
    createdTime
  );


  /*
  ================================================
  分數
  ================================================
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
  ================================================
  組合
  ================================================
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
空資料
==================================================
*/

function appendEmptyMessage(
  parent,
  message =
    "目前尚無成績"
) {
  const empty =
    document.createElement(
      "div"
    );

  empty.className =
    "leaderboard-mode-empty";

  empty.textContent =
    message;

  parent.appendChild(
    empty
  );
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
遊戲時間
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
    return (
      `${safeSeconds} 秒`
    );
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
    return (
      `${minutes} 分`
    );
  }

  return (
    `${minutes} 分 ` +
    `${remainingSeconds} 秒`
  );
}


/*
==================================================
日期
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

  if (leaderboardList) {
    leaderboardList.innerHTML =
      "";
  }

  if (errorMessage) {
    errorMessage.hidden =
      false;

    errorMessage.textContent =
      "目前尚未登入，請回到首頁登入後再查看排行榜。";
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
