/*
==================================================
數學遊戲樂園｜排行榜
檔案：js/leaderboard.js

版本：8.0
正式遊戲排行榜版
==================================================

功能：

1. 排行榜依學期分類

2. 直接讀取 game-config.js

3. 只顯示 finished:true
   已正式開放的遊戲

4. 尚無成績仍保留排行榜卡片

5. 多模式遊戲：
   每個模式分開排行榜

6. 同一玩家：
   同一遊戲＋同一模式
   只保留最佳紀錄

7. speed：
   分數高
   → 時間短
   → 答對多
   → 答錯少
   → 最高連擊高

8. timed：
   分數高
   → 答對多
   → 答錯少
   → 最高連擊高

9. 每榜前 20 名

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


function toSafeNumber(
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


function toSafeTime(
  value
) {

  const number =
    toSafeNumber(
      value,
      Number.MAX_SAFE_INTEGER
    );


  if (
    number <
    0
  ) {

    return Number.MAX_SAFE_INTEGER;
  }


  return number;
}


function getTimestampMilliseconds(
  timestamp
) {

  if (
    !timestamp
  ) {

    return 0;
  }


  if (
    typeof timestamp.toMillis ===
    "function"
  ) {

    return timestamp.toMillis();
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


  const milliseconds =
    date.getTime();


  return Number.isFinite(
    milliseconds
  )
    ? milliseconds
    : 0;
}


function formatTime(
  seconds
) {

  const safeSeconds =
    Math.max(
      0,
      Math.round(
        toSafeNumber(
          seconds,
          0
        )
      )
    );


  const minutes =
    Math.floor(
      safeSeconds /
      60
    );


  const remainSeconds =
    safeSeconds %
    60;


  return (
    `${String(minutes).padStart(2,"0")}:` +
    `${String(remainSeconds).padStart(2,"0")}`
  );
}


/*
==================================================
取得玩家名稱
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
取得玩家唯一識別
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
初始化學期遊戲卡
==================================================
*/


renderSemesterGames();


/*
==================================================
登入
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


      showLoginRequiredMessage();


      return;
    }


    const playerName =
      user.displayName ||
      user.email ||
      "玩家";


    if (
      userStatus
    ) {

      userStatus.textContent =
        `目前登入：${playerName}`;
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
取得目前學期正式遊戲
==================================================
*/


function getCurrentSemesterGames() {

  return getFinishedGamesBySemester(
    selectedSemester
  );
}


/*
==================================================
建立遊戲篩選卡片
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
  --------------------------------------------------
  全部遊戲
  --------------------------------------------------
  */


  const allButton =
    createGameFilterButton({

      gameId:
        "all",

      label:
        `📚 ${semesterName}全部遊戲`,

      active:
        selectedGame ===
        "all",

      all:
        true
    });


  filterBox.appendChild(
    allButton
  );


  /*
  --------------------------------------------------
  已正式開放遊戲
  --------------------------------------------------
  */


  const games =
    getCurrentSemesterGames();


  games.forEach(
    (
      game
    ) => {

      const button =
        createGameFilterButton({

          gameId:
            game.id,

          label:
            `${game.icon || "🎮"} ${
              game.shortName ||
              game.name
            }`,

          active:
            selectedGame ===
            game.id
        });


      filterBox.appendChild(
        button
      );
    }
  );
}


/*
==================================================
建立篩選按鈕
==================================================
*/


function createGameFilterButton({

  gameId,
  label,
  active =
    false,
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


  button.dataset.game =
    gameId;


  button.textContent =
    label;


  if (
    active
  ) {

    button.classList.add(
      "active"
    );
  }


  button.addEventListener(
    "click",
    () => {

      selectedGame =
        gameId;


      filterBox
        ?.querySelectorAll(
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

  setLoadingState();


  try {

    const scoresReference =
      collection(
        db,
        "scores"
      );


    const snapshot =
      await getDocs(
        scoresReference
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


    throw error;
  }
}


/*
==================================================
主排行榜
==================================================
*/


function renderLeaderboard() {

  if (
    !currentUser
  ) {

    showLoginRequiredMessage();

    return;
  }


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


  if (
    !leaderboardList
  ) {

    return;
  }


  leaderboardList.innerHTML =
    "";


  const semesterGames =
    getCurrentSemesterGames();


  const gamesToRender =

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
    gamesToRender.length ===
    0
  ) {

    if (
      emptyMessage
    ) {

      emptyMessage.hidden =
        false;


      emptyMessage.textContent =
        "這個學期目前沒有已正式開放的排行榜項目。";
    }


    return;
  }


  gamesToRender.forEach(
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


      const section =
        createGameSection(
          game,
          gameRecords
        );


      leaderboardList.appendChild(
        section
      );
    }
  );
}


/*
==================================================
建立單一遊戲區
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
  標題
  */


  const title =
    document.createElement(
      "h2"
    );


  title.className =
    "leaderboard-game-title";


  const icon =
    document.createElement(
      "span"
    );


  icon.className =
    "leaderboard-game-icon";


  icon.textContent =
    game.icon ||
    "🎮";


  const titleText =
    document.createElement(
      "span"
    );


  titleText.textContent =
    game.name ||
    getGameName(
      game.id
    );


  title.append(
    icon,
    titleText
  );


  section.appendChild(
    title
  );


  /*
  模式
  */


  const modes =
    getConfiguredModes(
      game.id
    );


  if (
    modes.length >
    1
  ) {

    renderMultiModeGame(
      section,
      game,
      records,
      modes
    );

  } else {

    renderSingleModeGame(
      section,
      game,
      records
    );
  }


  return section;
}


/*
==================================================
正式模式
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
  )
    .map(
      (
        [
          id,
          name
        ]
      ) => ({

        id:
          String(
            id
          ),

        name:
          String(
            name
          )
      })
    );
}


/*
==================================================
單模式遊戲
==================================================
*/


function renderSingleModeGame(
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
    getRankingTitle(
      game.id
    );


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
      createEmptyRanking(
        game
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
多模式遊戲
==================================================
*/


function renderMultiModeGame(
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


  const contents =
    document.createElement(
      "div"
    );


  section.append(
    tabs,
    contents
  );


  modes.forEach(
    (
      modeData,
      modeIndex
    ) => {

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
      僅留下該模式紀錄
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
          createEmptyRanking(
            game,
            modeData.name
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
      Tab 切換
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


          contents
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


      contents.appendChild(
        content
      );
    }
  );
}


/*
==================================================
空排行榜
==================================================
*/


function createEmptyRanking(
  game,
  modeName =
    ""
) {

  const empty =
    document.createElement(
      "div"
    );


  empty.className =
    "leaderboard-mode-empty";


  empty.textContent =
    modeName

      ? `${modeName}目前尚無成績紀錄。`

      : "目前尚無成績紀錄。";


  return empty;
}


/*
==================================================
排行榜標題
==================================================
*/


function getRankingTitle(
  gameId
) {

  return getRankingType(
    gameId
  ) ===
  "speed"

    ? "🏁 速度排行榜"

    : "🏆 分數排行榜";
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


  return (
    type ===
    "timed"

      ? "timed"

      : "speed"
  );
}


/*
==================================================
建立排行資料
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

      ? compareTimedRecords

      : compareSpeedRecords;


  /*
  先將所有紀錄排序
  */


  const sorted =
    [
      ...records
    ]
      .sort(
        comparator
      );


  /*
  同一玩家只保留最佳紀錄
  */


  const playerBestMap =
    new Map();


  sorted.forEach(
    (
      record
    ) => {

      const playerKey =
        getPlayerKey(
          record
        );


      if (
        !playerBestMap.has(
          playerKey
        )
      ) {

        playerBestMap.set(
          playerKey,
          record
        );
      }
    }
  );


  return Array.from(
    playerBestMap.values()
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
speed 排序
==================================================
*/


function compareSpeedRecords(
  recordA,
  recordB
) {

  /*
  1. 分數高
  */


  const scoreDifference =
    toSafeNumber(
      recordB.score
    ) -
    toSafeNumber(
      recordA.score
    );


  if (
    scoreDifference !==
    0
  ) {

    return scoreDifference;
  }


  /*
  2. 完成時間短
  */


  const timeDifference =
    toSafeTime(
      recordA.playTime
    ) -
    toSafeTime(
      recordB.playTime
    );


  if (
    timeDifference !==
    0
  ) {

    return timeDifference;
  }


  /*
  3. 答對多
  */


  const correctDifference =
    toSafeNumber(
      recordB.correctCount
    ) -
    toSafeNumber(
      recordA.correctCount
    );


  if (
    correctDifference !==
    0
  ) {

    return correctDifference;
  }


  /*
  4. 答錯少
  */


  const wrongDifference =
    toSafeNumber(
      recordA.wrongCount
    ) -
    toSafeNumber(
      recordB.wrongCount
    );


  if (
    wrongDifference !==
    0
  ) {

    return wrongDifference;
  }


  /*
  5. 最高連擊高
  */


  const comboDifference =
    toSafeNumber(
      recordB.maxCombo
    ) -
    toSafeNumber(
      recordA.maxCombo
    );


  if (
    comboDifference !==
    0
  ) {

    return comboDifference;
  }


  /*
  6. 較早完成
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


  const scoreDifference =
    toSafeNumber(
      recordB.score
    ) -
    toSafeNumber(
      recordA.score
    );


  if (
    scoreDifference !==
    0
  ) {

    return scoreDifference;
  }


  /*
  2. 答對多
  */


  const correctDifference =
    toSafeNumber(
      recordB.correctCount
    ) -
    toSafeNumber(
      recordA.correctCount
    );


  if (
    correctDifference !==
    0
  ) {

    return correctDifference;
  }


  /*
  3. 答錯少
  */


  const wrongDifference =
    toSafeNumber(
      recordA.wrongCount
    ) -
    toSafeNumber(
      recordB.wrongCount
    );


  if (
    wrongDifference !==
    0
  ) {

    return wrongDifference;
  }


  /*
  4. 最高連擊
  */


  const comboDifference =
    toSafeNumber(
      recordB.maxCombo
    ) -
    toSafeNumber(
      recordA.maxCombo
    );


  if (
    comboDifference !==
    0
  ) {

    return comboDifference;
  }


  /*
  5. 較早完成
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
建立排行榜清單
==================================================
*/


function createRankingList(
  ranking,
  gameId
) {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "ranking-table-wrapper";


  const table =
    document.createElement(
      "div"
    );


  table.className =
    "ranking-table";


  /*
  表頭
  */


  const header =
    document.createElement(
      "div"
    );


  header.className =
    "ranking-row ranking-header";


  const rankingType =
    getRankingType(
      gameId
    );


  header.innerHTML =

    rankingType ===
    "speed"

      ? `

          <div>名次</div>

          <div>玩家</div>

          <div>分數</div>

          <div>時間</div>

          <div>答對</div>

          <div>連擊</div>
        `

      : `

          <div>名次</div>

          <div>玩家</div>

          <div>分數</div>

          <div>答對</div>

          <div>答錯</div>

          <div>連擊</div>
        `;


  table.appendChild(
    header
  );


  /*
  排名
  */


  ranking.forEach(
    (
      record,
      rankingIndex
    ) => {

      const row =
        createRankingRow(
          record,
          rankingIndex +
          1,
          gameId
        );


      table.appendChild(
        row
      );
    }
  );


  wrapper.appendChild(
    table
  );


  return wrapper;
}


/*
==================================================
建立單筆排行榜
==================================================
*/


function createRankingRow(
  record,
  rank,
  gameId
) {

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "ranking-row";


  /*
  自己的紀錄
  */


  if (
    currentUser &&
    String(
      record.uid ||
      ""
    ) ===
    String(
      currentUser.uid
    )
  ) {

    row.classList.add(
      "current-user-row"
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
    "ranking-rank";


  if (
    rank ===
    1
  ) {

    rankElement.textContent =
      "🥇";

  } else if (
    rank ===
    2
  ) {

    rankElement.textContent =
      "🥈";

  } else if (
    rank ===
    3
  ) {

    rankElement.textContent =
      "🥉";

  } else {

    rankElement.textContent =
      rank;
  }


  /*
  玩家
  */


  const playerElement =
    document.createElement(
      "div"
    );


  playerElement.className =
    "ranking-player";


  playerElement.textContent =
    getPlayerName(
      record
    );


  /*
  分數
  */


  const scoreElement =
    document.createElement(
      "div"
    );


  scoreElement.className =
    "ranking-score";


  scoreElement.textContent =
    Math.round(
      toSafeNumber(
        record.score
      )
    );


  const rankingType =
    getRankingType(
      gameId
    );


  if (
    rankingType ===
    "speed"
  ) {

    /*
    時間
    */


    const timeElement =
      document.createElement(
        "div"
      );


    timeElement.className =
      "ranking-time";


    timeElement.textContent =
      formatTime(
        record.playTime
      );


    /*
    答對
    */


    const correctElement =
      document.createElement(
        "div"
      );


    correctElement.textContent =
      toSafeNumber(
        record.correctCount
      );


    /*
    連擊
    */


    const comboElement =
      document.createElement(
        "div"
      );


    comboElement.textContent =
      toSafeNumber(
        record.maxCombo
      );


    row.append(

      rankElement,
      playerElement,
      scoreElement,
      timeElement,
      correctElement,
      comboElement
    );

  } else {

    /*
    答對
    */


    const correctElement =
      document.createElement(
        "div"
      );


    correctElement.textContent =
      toSafeNumber(
        record.correctCount
      );


    /*
    答錯
    */


    const wrongElement =
      document.createElement(
        "div"
      );


    wrongElement.textContent =
      toSafeNumber(
        record.wrongCount
      );


    /*
    連擊
    */


    const comboElement =
      document.createElement(
        "div"
      );


    comboElement.textContent =
      toSafeNumber(
        record.maxCombo
      );


    row.append(

      rankElement,
      playerElement,
      scoreElement,
      correctElement,
      wrongElement,
      comboElement
    );
  }


  return row;
}


/*
==================================================
讀取中
==================================================
*/


function setLoadingState() {

  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      false;


    loadingMessage.textContent =
      "正在讀取排行榜……";
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
未登入
==================================================
*/


function showLoginRequiredMessage() {

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
