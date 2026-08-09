/*
==================================================
數學遊戲樂園：排行榜
檔案位置：js/leaderboard.js

版本：3.0
單模式／多模式自動判斷正式版
==================================================

排行榜規則：

【單模式遊戲】
1. 不顯示模式切換。
2. 所有該遊戲成績合併排名。
3. 同一玩家只保留最佳成績。
4. 分數高者優先。
5. 同分時 playTime 較短者優先。
6. 每榜前 20 名。

【多模式遊戲】
1. 完全依 game-config.js 的 modes 建立模式。
2. 每個模式獨立排行榜。
3. 每個模式各自前 20 名。
4. 同一玩家同一模式只保留最佳紀錄。
5. 分數高者優先。
6. 同分時 playTime 較短者優先。
7. Firestore 舊模式不建立「其他模式」。

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
  getGameModes,
  isMultiModeGame
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
排行榜補充樣式
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

      border:
        2px solid
        #cbd5e1;

      border-radius: 12px;

      background: #fff;
      color: #475569;

      font: inherit;

      font-size: 14px;
      font-weight: 900;

      cursor: pointer;

      touch-action:
        manipulation;

      user-select:
        none;

      -webkit-user-select:
        none;

      -webkit-touch-callout:
        none;

      -webkit-tap-highlight-color:
        transparent;

      transition:
        background-color .15s ease,
        border-color .15s ease,
        color .15s ease,
        transform .15s ease;
    }

    .leaderboard-mode-tab:hover {
      border-color: #60a5fa;

      background: #eff6ff;
      color: #1d4ed8;
    }

    .leaderboard-mode-tab:active {
      transform:
        scale(.98);
    }

    .leaderboard-mode-tab.active {
      border-color: #2563eb;

      background: #2563eb;
      color: #fff;

      box-shadow:
        0 5px 12px
        rgba(
          37,
          99,
          235,
          .22
        );
    }

    .leaderboard-mode-content {
      display: block;
    }

    .leaderboard-mode-content[hidden] {
      display:
        none !important;
    }

    .leaderboard-mode-heading {
      margin:
        0 0 10px;

      color: #334155;

      font-size: 17px;
      font-weight: 900;

      text-align: left;
    }

    .leaderboard-mode-empty {
      margin:
        10px 0 18px;

      padding:
        24px 16px;

      border:
        2px dashed
        #cbd5e1;

      border-radius:
        14px;

      background:
        #f8fafc;

      color:
        #64748b;

      font-size:
        15px;

      font-weight:
        800;

      text-align:
        center;
    }

    .leaderboard-ranking-list {
      display:
        grid;

      gap:
        10px;

      margin:
        0;

      padding:
        0;

      list-style:
        none;
    }

    .leaderboard-ranking-list
    .leaderboard-item {
      margin:
        0;
    }

    .leaderboard-play-duration {
      margin-top:
        3px;

      color:
        #0f766e;

      font-size:
        13px;

      font-weight:
        800;
    }

    @media (
      max-width:
        560px
    ) {

      .leaderboard-game-title {
        padding:
          10px 12px;

        font-size:
          18px;
      }

      .leaderboard-mode-tabs {
        gap:
          6px;
      }

      .leaderboard-mode-tab {
        flex:
          1 1
          calc(
            50% - 6px
          );

        min-width:
          120px;

        padding:
          8px;

        font-size:
          13px;
      }

      .leaderboard-mode-heading,
      .leaderboard-single-title {
        font-size:
          16px;
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
登入
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
讀取 Firestore
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
    不在 Firestore 階段 limit(20)。

    原因：
    多模式遊戲需要
    每個模式各自前 20 名。
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
安全數字
==================================================
*/

function toSafeNumber(
  value,
  fallback = 0
) {
  const number =
    Number(value);

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

  /*
  舊資料沒有 playTime：

  同分時排在
  有時間資料的人後面。
  */

  return Number.POSITIVE_INFINITY;
}


/*
==================================================
達成時間
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
排行榜核心排序

1. 分數高
2. 時間短
3. 較早達成
==================================================
*/

function compareScoreRecords(
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


  /*
  分數高者優先
  */

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
  同分：
  完成時間短者優先
  */

  const playTimeA =
    getPlayTime(
      recordA
    );

  const playTimeB =
    getPlayTime(
      recordB
    );

  if (
    playTimeA !==
    playTimeB
  ) {
    return (
      playTimeA -
      playTimeB
    );
  }


  /*
  分數、時間皆相同：
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
  完全相同時，
  用文件 ID 保持固定排序。
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
同一玩家只留最佳一次
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
      正常新資料用 uid。

      舊資料如果沒有 uid，
      用文件 ID 避免誤把不同玩家合併。
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
正式模式清單
==================================================
*/

function getConfiguredModes(
  gameId
) {
  return Object.entries(
    getGameModes(
      gameId
    )
  ).map(
    (
      [
        id,
        name
      ]
    ) => ({
      id:
        String(id),

      name:
        String(name)
    })
  );
}


/*
==================================================
排行榜遊戲清單
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
主畫面
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
單一遊戲
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
  全部遊戲畫面：
  顯示遊戲名稱。
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


  /*
  ================================================
  多模式
  ================================================
  */

  if (
    isMultiModeGame(
      game.id
    )
  ) {
    renderMultiModeLeaderboard(
      gameSection,
      game,
      records
    );
  }

  /*
  ================================================
  單模式
  ================================================

  重要：

  單模式遊戲完全忽略
  Firestore 裡過去留下來的 mode。

  因此正負整數即使舊資料有：
  1 / 2 / 3 / 4
  仍全部併回同一張排行榜。
  */

  else {
    renderSingleModeLeaderboard(
      gameSection,
      game,
      records
    );
  }


  leaderboardList.appendChild(
    gameSection
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


  /*
  所有 mode 全部合併。

  同一玩家最後只留下：
  分數最高 →
  同分最快
  */

  const topRecords =
    buildTopRecords(
      records
    );


  if (
    topRecords.length ===
    0
  ) {
    appendEmptyMessage(
      parent,
      "目前尚無成績"
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


  /*
  多模式一定以
  game-config.js 為唯一依據。

  不再掃描 Firestore 建立未知模式。
  */

  if (
    modes.length <= 1
  ) {
    renderSingleModeLeaderboard(
      parent,
      game,
      records
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
  內容容器
  ================================================
  */

  const contents =
    document.createElement(
      "div"
    );

  contents.className =
    "leaderboard-mode-contents";


  /*
  第一個有成績的正式模式
  預設開啟。

  若都沒有成績，
  則開第一個模式。
  */

  let firstAvailableIndex =
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
      按鈕
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
      模式內容
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


      /*
      只收這個正式模式。

      其他未知 mode：
      完全不建立排行榜。
      */

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


      /*
      ==============================================
      初始顯示
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
        String(initial)
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
                  tab ===
                  button;

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
單筆排行榜
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
  自己
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
  答題時間
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
  日期
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
空排行榜
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
答題時間
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
載入中
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
