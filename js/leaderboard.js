/*
==================================================
數學遊戲樂園｜排行榜
檔案：js/leaderboard.js

版本：8.1
排行榜版面修正版
==================================================

功能：

1. 依學期顯示排行榜
2. 只顯示 game-config.js 中 finished:true 的遊戲
3. 多模式遊戲可切換模式
4. 同一位玩家、同一遊戲、同一模式只保留最佳紀錄
5. 固定題數遊戲：
   分數高 → 時間短 → 答對多 → 答錯少 → 連擊高
6. 固定時間遊戲：
   分數高 → 答對多 → 答錯少 → 連擊高
7. 每榜最多顯示 20 名
8. 完整配合 leaderboard.html 原本 CSS
==================================================
*/


import {

  auth,
  db

} from "./firebase-config.js";


import {

  getFinishedGamesBySemester,
  getGameConfig,
  getGameName

} from "./game-config.js";


import {

  collection,
  getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {

  onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


"use strict";


/*
==================================================
DOM
==================================================
*/


const userStatus =
  document.getElementById(
    "userStatus"
  );


const semesterSelect =
  document.getElementById(
    "semesterSelect"
  );


const filterTitle =
  document.getElementById(
    "filterTitle"
  );


const filterBox =
  document.getElementById(
    "filterBox"
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


/*
==================================================
設定
==================================================
*/


const LEADERBOARD_LIMIT =
  20;


const SEMESTER_NAMES = {

  "grade7-first":
    "七年級上學期",

  "grade7-second":
    "七年級下學期",

  "grade8-first":
    "八年級上學期"
};


let currentUser =
  null;


let selectedSemester =
  semesterSelect?.value ||
  "grade7-first";


let selectedGame =
  "all";


let allScoreRecords =
  [];


/*
==================================================
基本工具
==================================================
*/


function safeNumber(
  value,
  fallback =
    0
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
時間
==================================================
*/


function safePlayTime(
  value
) {

  const number =
    Number(
      value
    );


  if (
    !Number.isFinite(
      number
    ) ||
    number <
      0
  ) {

    return Number.MAX_SAFE_INTEGER;
  }


  return number;
}


function formatTime(
  seconds
) {

  const value =
    Math.max(
      0,
      Math.round(
        safeNumber(
          seconds,
          0
        )
      )
    );


  const minute =
    Math.floor(
      value /
      60
    );


  const second =
    value %
    60;


  return (
    `${String(minute).padStart(2,"0")}:` +
    `${String(second).padStart(2,"0")}`
  );
}


/*
==================================================
日期
==================================================
*/


function timestampToMilliseconds(
  value
) {

  if (
    !value
  ) {

    return 0;
  }


  if (
    typeof value.toMillis ===
    "function"
  ) {

    return value.toMillis();
  }


  if (
    value.seconds !==
    undefined
  ) {

    return (
      Number(
        value.seconds
      ) *
      1000
    );
  }


  const date =
    new Date(
      value
    );


  const time =
    date.getTime();


  return Number.isFinite(
    time
  )
    ? time
    : 0;
}


function formatDate(
  value
) {

  const time =
    timestampToMilliseconds(
      value
    );


  if (
    !time
  ) {

    return "";
  }


  const date =
    new Date(
      time
    );


  return date.toLocaleDateString(
    "zh-TW",
    {

      year:
        "numeric",

      month:
        "2-digit",

      day:
        "2-digit"
    }
  );
}


/*
==================================================
玩家名稱
==================================================
*/


function getPlayerName(
  record
) {

  return (

    record.nickname ||

    record.displayName ||

    record.playerName ||

    record.name ||

    record.email ||

    "玩家"
  );
}


/*
==================================================
玩家唯一識別
==================================================
*/


function getPlayerKey(
  record
) {

  return (

    record.uid ||

    record.email ||

    getPlayerName(
      record
    )
  );
}


/*
==================================================
排行榜種類
==================================================
*/


function getRankingType(
  gameId
) {

  const type =
    getGameConfig(
      gameId
    )?.ranking?.type;


  return (
    type ===
    "timed"

      ? "timed"

      : "speed"
  );
}


/*
==================================================
目前學期正式遊戲
==================================================
*/


function getCurrentSemesterGames() {

  return getFinishedGamesBySemester(
    selectedSemester
  );
}


/*
==================================================
初始化
==================================================
*/


renderSemesterGames();


/*
==================================================
登入狀態
==================================================
*/


onAuthStateChanged(

  auth,

  async (
    user
  ) => {

    currentUser =
      user;


    if (
      !user
    ) {

      if (
        userStatus
      ) {

        userStatus.textContent =
          "請先回到首頁登入 Google 帳號，才能查看排行榜。";
      }


      showLoginRequired();


      return;
    }


    if (
      userStatus
    ) {

      userStatus.textContent =
        `目前登入：${
          user.displayName ||
          user.email ||
          "玩家"
        }`;
    }


    await loadAllScores();


    renderLeaderboard();
  },

  (
    error
  ) => {

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
學期切換
==================================================
*/


semesterSelect
  ?.addEventListener(
    "change",
    () => {

      selectedSemester =
        semesterSelect.value;


      selectedGame =
        "all";


      renderSemesterGames();


      if (
        currentUser
      ) {

        renderLeaderboard();
      }
    }
  );


/*
==================================================
建立遊戲篩選列
==================================================
*/


function renderSemesterGames() {

  if (
    !filterBox
  ) {

    return;
  }


  filterBox.innerHTML =
    "";


  const semesterName =
    SEMESTER_NAMES[
      selectedSemester
    ] ||
    "數學遊戲";


  if (
    filterTitle
  ) {

    filterTitle.textContent =
      `${semesterName}排行榜`;
  }


  /*
  全部遊戲
  */


  filterBox.appendChild(

    createFilterButton({

      gameId:
        "all",

      label:
        `📚 ${semesterName}全部遊戲`,

      all:
        true
    })
  );


  /*
  正式完成的遊戲
  */


  getCurrentSemesterGames()
    .forEach(
      (
        game
      ) => {

        filterBox.appendChild(

          createFilterButton({

            gameId:
              game.id,

            label:
              `${game.icon || "🎮"} ${
                game.shortName ||
                game.name
              }`
          })
        );
      }
    );
}


/*
==================================================
篩選按鈕
==================================================
*/


function createFilterButton({

  gameId,
  label,
  all =
    false

}) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "filter-button";


  if (
    all
  ) {

    button.classList.add(
      "all-button"
    );
  }


  if (
    selectedGame ===
    gameId
  ) {

    button.classList.add(
      "active"
    );
  }


  button.textContent =
    label;


  button.addEventListener(
    "click",
    () => {

      selectedGame =
        gameId;


      filterBox
        .querySelectorAll(
          ".filter-button"
        )
        .forEach(
          (
            item
          ) => {

            item.classList.remove(
              "active"
            );
          }
        );


      button.classList.add(
        "active"
      );


      if (
        currentUser
      ) {

        renderLeaderboard();
      }
    }
  );


  return button;
}


/*
==================================================
Firestore
==================================================
*/


async function loadAllScores() {

  setLoading();


  try {

    const snapshot =
      await getDocs(

        collection(
          db,
          "scores"
        )
      );


    allScoreRecords =
      snapshot.docs.map(
        (
          documentSnapshot
        ) => ({

          id:
            documentSnapshot.id,

          ...documentSnapshot.data()
        })
      );


  } catch (
    error
  ) {

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
排行榜主畫面
==================================================
*/


function renderLeaderboard() {

  if (
    !currentUser
  ) {

    showLoginRequired();

    return;
  }


  hideMessages();


  leaderboardList.innerHTML =
    "";


  const semesterGames =
    getCurrentSemesterGames();


  const games =

    selectedGame ===
    "all"

      ? semesterGames

      : semesterGames.filter(
          (
            game
          ) =>
            game.id ===
            selectedGame
        );


  if (
    games.length ===
    0
  ) {

    showEmpty(
      "目前沒有已正式開放的排行榜項目。"
    );


    return;
  }


  games.forEach(
    (
      game
    ) => {

      const gameRecords =
        allScoreRecords.filter(
          (
            record
          ) =>

            String(
              record.game ||
              ""
            ) ===
            String(
              game.id
            )
        );


      leaderboardList.appendChild(

        createGameSection(
          game,
          gameRecords
        )
      );
    }
  );
}


/*
==================================================
單一遊戲區塊
==================================================
*/


function createGameSection(
  game,
  records
) {

  const section =
    document.createElement(
      "li"
    );


  section.className =
    "leaderboard-game-section";


  /*
  遊戲標題
  */


  const title =
    document.createElement(
      "h2"
    );


  title.className =
    "leaderboard-game-title";


  title.innerHTML = `

    <span class="leaderboard-game-icon">

      ${game.icon || "🎮"}

    </span>

    <span>

      ${
        game.name ||
        getGameName(
          game.id
        )
      }

    </span>
  `;


  section.appendChild(
    title
  );


  /*
  讀取模式設定
  */


  const modes =
    getGameModes(
      game.id
    );


  if (
    modes.length >
    0
  ) {

    createModeLeaderboard(

      section,
      game,
      records,
      modes
    );

  } else {

    createSingleLeaderboard(

      section,
      game,
      records
    );
  }


  return section;
}


/*
==================================================
遊戲模式
==================================================
*/


function getGameModes(
  gameId
) {

  const modes =
    getGameConfig(
      gameId
    )?.modes;


  if (
    !modes ||
    typeof modes !==
      "object"
  ) {

    return [];
  }


  /*
  ==============================================
  一元一次方程式模式名稱修正

  重點：
  只修改「排行榜顯示名稱」，不修改 mode id。

  因此 Firestore 原本儲存的：
  basic / parentheses / fraction / mixed
  仍可直接讀取，不會讓舊成績失效。
  ==============================================
  */

  const linearEquationModeNames = {

    basic:
      "基礎方程式",

    parentheses:
      "含括號方程式",

    fraction:
      "含分數方程式",

    mixed:
      "綜合挑戰",

    /*
    舊版若曾使用數字 / mode1～mode4，
    也提供顯示名稱相容。
    */

    "1":
      "基礎方程式",

    "2":
      "含括號方程式",

    "3":
      "含分數方程式",

    "4":
      "綜合挑戰",

    mode1:
      "基礎方程式",

    mode2:
      "含括號方程式",

    mode3:
      "含分數方程式",

    mode4:
      "綜合挑戰"
  };


  return Object.entries(
    modes
  )
    .map(
      (
        [
          id,
          name
        ]
      ) => {

        const modeId =
          String(
            id
          );


        return {

          id:
            modeId,

          name:
            String(
              gameId ===
                "linearEquation"

                ? (
                    linearEquationModeNames[
                      modeId
                    ] ||
                    name
                  )

                : name
            )
        };
      }
    );
}


/*
==================================================
單模式排行榜
==================================================
*/


function createSingleLeaderboard(
  section,
  game,
  records
) {

  const heading =
    document.createElement(
      "h3"
    );


  heading.className =
    "leaderboard-single-title";


  heading.textContent =
    getRankingType(
      game.id
    ) ===
    "speed"

      ? "🏁 成績排行榜"

      : "🏆 分數排行榜";


  section.appendChild(
    heading
  );


  const ranking =
    prepareRanking(
      records,
      game.id
    );


  if (
    ranking.length ===
    0
  ) {

    section.appendChild(
      createEmptyBox(
        "目前尚無成績紀錄。"
      )
    );


    return;
  }


  section.appendChild(
    createRankingList(
      ranking,
      game.id
    )
  );
}


/*
==================================================
多模式排行榜
==================================================
*/


function createModeLeaderboard(
  section,
  game,
  records,
  modes
) {

  const tabs =
    document.createElement(
      "div"
    );


  tabs.className =
    "leaderboard-mode-tabs";


  const contentContainer =
    document.createElement(
      "div"
    );


  modes.forEach(
    (
      modeData,
      modeIndex
    ) => {

      /*
      Tab
      */


      const tab =
        document.createElement(
          "button"
        );


      tab.type =
        "button";


      tab.className =
        "leaderboard-mode-tab";


      tab.textContent =
        modeData.name;


      if (
        modeIndex ===
        0
      ) {

        tab.classList.add(
          "active"
        );
      }


      /*
      內容
      */


      const content =
        document.createElement(
          "div"
        );


      content.className =
        "leaderboard-mode-content";


      content.hidden =
        modeIndex !==
        0;


      const heading =
        document.createElement(
          "h3"
        );


      heading.className =
        "leaderboard-mode-heading";


      heading.textContent =
        `${modeData.name}排行榜`;


      content.appendChild(
        heading
      );


      /*
      該模式資料
      */


      const modeRecords =
        records.filter(
          (
            record
          ) =>

            String(
              record.mode ??
              ""
            ) ===
            modeData.id
        );


      const ranking =
        prepareRanking(
          modeRecords,
          game.id
        );


      if (
        ranking.length ===
        0
      ) {

        content.appendChild(

          createEmptyBox(
            `${modeData.name}目前尚無成績紀錄。`
          )
        );

      } else {

        content.appendChild(

          createRankingList(
            ranking,
            game.id
          )
        );
      }


      /*
      切換模式
      */


      tab.addEventListener(
        "click",
        () => {

          tabs
            .querySelectorAll(
              ".leaderboard-mode-tab"
            )
            .forEach(
              (
                item
              ) => {

                item.classList.remove(
                  "active"
                );
              }
            );


          tab.classList.add(
            "active"
          );


          contentContainer
            .querySelectorAll(
              ".leaderboard-mode-content"
            )
            .forEach(
              (
                item
              ) => {

                item.hidden =
                  true;
              }
            );


          content.hidden =
            false;
        }
      );


      tabs.appendChild(
        tab
      );


      contentContainer.appendChild(
        content
      );
    }
  );


  section.append(
    tabs,
    contentContainer
  );
}


/*
==================================================
空排行榜
==================================================
*/


function createEmptyBox(
  text
) {

  const box =
    document.createElement(
      "div"
    );


  box.className =
    "leaderboard-mode-empty";


  box.textContent =
    text;


  return box;
}


/*
==================================================
排行榜排序
==================================================
*/


function prepareRanking(
  records,
  gameId
) {

  const comparator =

    getRankingType(
      gameId
    ) ===
    "timed"

      ? compareTimed

      : compareSpeed;


  /*
  先排序全部紀錄
  */


  const sorted =
    [
      ...records
    ]
      .sort(
        comparator
      );


  /*
  同一玩家只留下最好的一次
  */


  const players =
    new Map();


  sorted.forEach(
    (
      record
    ) => {

      const key =
        getPlayerKey(
          record
        );


      if (
        !players.has(
          key
        )
      ) {

        players.set(
          key,
          record
        );
      }
    }
  );


  return Array.from(
    players.values()
  )
    .sort(
      comparator
    )
    .slice(
      0,
      LEADERBOARD_LIMIT
    );
}


/*
==================================================
固定題數排序
==================================================
*/


function compareSpeed(
  a,
  b
) {

  /*
  1. 分數高
  */


  let difference =

    safeNumber(
      b.score
    ) -
    safeNumber(
      a.score
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  /*
  2. 時間短
  */


  difference =

    safePlayTime(
      a.playTime
    ) -
    safePlayTime(
      b.playTime
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  /*
  3. 答對多
  */


  difference =

    safeNumber(
      b.correctCount
    ) -
    safeNumber(
      a.correctCount
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  /*
  4. 答錯少
  */


  difference =

    safeNumber(
      a.wrongCount
    ) -
    safeNumber(
      b.wrongCount
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  /*
  5. 連擊高
  */


  difference =

    safeNumber(
      b.maxCombo
    ) -
    safeNumber(
      a.maxCombo
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  /*
  6. 較早完成
  */


  return (

    timestampToMilliseconds(
      a.createdAt
    ) -

    timestampToMilliseconds(
      b.createdAt
    )
  );
}


/*
==================================================
固定時間排序
==================================================
*/


function compareTimed(
  a,
  b
) {

  /*
  1. 分數高
  */


  let difference =

    safeNumber(
      b.score
    ) -
    safeNumber(
      a.score
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  /*
  2. 答對多
  */


  difference =

    safeNumber(
      b.correctCount
    ) -
    safeNumber(
      a.correctCount
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  /*
  3. 答錯少
  */


  difference =

    safeNumber(
      a.wrongCount
    ) -
    safeNumber(
      b.wrongCount
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  /*
  4. 連擊高
  */


  difference =

    safeNumber(
      b.maxCombo
    ) -
    safeNumber(
      a.maxCombo
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  return (

    timestampToMilliseconds(
      a.createdAt
    ) -

    timestampToMilliseconds(
      b.createdAt
    )
  );
}


/*
==================================================
★ 建立排行榜
這裡重新配合 leaderboard.html 原本 CSS
==================================================
*/


function createRankingList(
  ranking,
  gameId
) {

  const list =
    document.createElement(
      "ol"
    );


  list.className =
    "leaderboard-ranking-list";


  ranking.forEach(
    (
      record,
      rankingIndex
    ) => {

      list.appendChild(

        createRankingItem(
          record,
          rankingIndex +
          1,
          gameId
        )
      );
    }
  );


  return list;
}


/*
==================================================
★ 建立單筆排名卡
==================================================
*/


function createRankingItem(
  record,
  rank,
  gameId
) {

  const item =
    document.createElement(
      "li"
    );


  item.className =
    "leaderboard-item";


  /*
  自己的紀錄
  */


  if (

    currentUser &&

    record.uid &&

    String(
      record.uid
    ) ===
    String(
      currentUser.uid
    )
  ) {

    item.classList.add(
      "current-user"
    );
  }


  /*
  --------------------------------------------------
  名次
  --------------------------------------------------
  */


  const rankBox =
    document.createElement(
      "div"
    );


  rankBox.className =
    "rank";


  if (
    rank ===
    1
  ) {

    rankBox.textContent =
      "🥇";

  } else if (
    rank ===
    2
  ) {

    rankBox.textContent =
      "🥈";

  } else if (
    rank ===
    3
  ) {

    rankBox.textContent =
      "🥉";

  } else {

    rankBox.textContent =
      rank;
  }


  /*
  --------------------------------------------------
  玩家資料
  --------------------------------------------------
  */


  const playerBox =
    document.createElement(
      "div"
    );


  playerBox.className =
    "player-info";


  /*
  玩家名稱
  */


  const playerName =
    document.createElement(
      "div"
    );


  playerName.className =
    "player-name";


  playerName.textContent =
    getPlayerName(
      record
    );


  /*
  詳細資訊
  */


  const details =
    document.createElement(
      "div"
    );


  details.className =
    "record-detail";


  const rankingType =
    getRankingType(
      gameId
    );


  if (
    rankingType ===
    "speed"
  ) {

    details.innerHTML = `

      答對
      <strong>
        ${safeNumber(
          record.correctCount
        )}
      </strong>

      題

      ・

      答錯
      <strong>
        ${safeNumber(
          record.wrongCount
        )}
      </strong>

      題

      ・

      最高連擊
      <strong>
        ${safeNumber(
          record.maxCombo
        )}
      </strong>

      <br>

      ⏱️ 完成時間：

      <span class="leaderboard-play-duration">

        ${formatTime(
          record.playTime
        )}

      </span>
    `;

  } else {

    details.innerHTML = `

      答對
      <strong>
        ${safeNumber(
          record.correctCount
        )}
      </strong>

      題

      ・

      答錯
      <strong>
        ${safeNumber(
          record.wrongCount
        )}
      </strong>

      題

      ・

      最高連擊
      <strong>
        ${safeNumber(
          record.maxCombo
        )}
      </strong>
    `;
  }


  /*
  日期
  */


  const date =
    document.createElement(
      "div"
    );


  date.className =
    "record-date";


  const dateText =
    formatDate(
      record.createdAt
    );


  date.textContent =

    dateText

      ? `完成日期：${dateText}`

      : "";


  playerBox.append(

    playerName,
    details,
    date
  );


  /*
  --------------------------------------------------
  分數
  --------------------------------------------------
  */


  const scoreBox =
    document.createElement(
      "div"
    );


  scoreBox.className =
    "score";


  const score =
    Math.round(
      safeNumber(
        record.score
      )
    );


  scoreBox.innerHTML = `

    ${score}

    <div class="score-label">
      分
    </div>
  `;


  item.append(

    rankBox,
    playerBox,
    scoreBox
  );


  return item;
}


/*
==================================================
讀取狀態
==================================================
*/


function setLoading() {

  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      false;


    loadingMessage.textContent =
      "排行榜載入中……";
  }


  if (
    errorMessage
  ) {

    errorMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ) {

    emptyMessage.hidden =
      true;
  }


  if (
    leaderboardList
  ) {

    leaderboardList.innerHTML =
      "";
  }
}


/*
==================================================
隱藏提示
==================================================
*/


function hideMessages() {

  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      true;
  }


  if (
    errorMessage
  ) {

    errorMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ) {

    emptyMessage.hidden =
      true;
  }
}


/*
==================================================
沒有資料
==================================================
*/


function showEmpty(
  message
) {

  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ) {

    emptyMessage.hidden =
      false;


    emptyMessage.textContent =
      message;
  }
}


/*
==================================================
未登入
==================================================
*/


function showLoginRequired() {

  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      true;
  }


  if (
    errorMessage
  ) {

    errorMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ) {

    emptyMessage.hidden =
      false;


    emptyMessage.textContent =
      "請先登入 Google 帳號，再查看排行榜。";
  }


  if (
    leaderboardList
  ) {

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

  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ) {

    emptyMessage.hidden =
      true;
  }


  if (
    errorMessage
  ) {

    errorMessage.hidden =
      false;


    errorMessage.textContent =
      `排行榜載入失敗：${
        error?.message ||
        "未知錯誤"
      }`;
  }


  if (
    leaderboardList
  ) {

    leaderboardList.innerHTML =
      "";
  }
}