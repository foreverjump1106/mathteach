/*
==================================================
數學遊戲樂園｜排行榜
檔案：js/leaderboard.js
版本：7.0

主要功能：

1. 排行榜依學期分類
2. 直接讀 game-config.js
3. 不受 finished 限制
4. 預先顯示尚未完成的遊戲
5. 尚無成績也保留排行榜卡片
6. 多模式遊戲分開排名
7. 同一玩家同一排行榜只留最佳紀錄
8. speed：
   分數高 → 時間短
9. timed：
   分數高 → 答對多 → 答錯少
10. 每榜前 20 名

==================================================
*/


import {
  auth,
  db
} from "./firebase-config.js?v=6.3";


import {
  getGamesBySemester,
  getGameConfig,
  getGameName
} from "./game-config.js?v=6.4";


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
基本設定
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
初始化
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
依學期取得所有遊戲
==================================================

注意：

這裡故意使用 getGamesBySemester()
而不是 getFinishedGames()。

因此 finished:false 的遊戲
也會預先出現在排行榜。

==================================================
*/

function getCurrentSemesterGames() {

  return getGamesBySemester(
    selectedSemester
  );
}


/*
==================================================
建立遊戲卡片
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
  本學期全部
  --------------------------------------------------
  */

  const allButton =
    createGameFilterButton(
      {
        gameId:
          "all",

        label:
          `📚 ${semesterName}全部遊戲`,

        active:
          selectedGame ===
          "all",

        all:
          true
      }
    );


  filterBox.appendChild(
    allButton
  );


  /*
  --------------------------------------------------
  本學期遊戲
  --------------------------------------------------
  */

  const games =
    getCurrentSemesterGames();


  games.forEach(
    (
      game
    ) => {

      const button =
        createGameFilterButton(
          {
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
          }
        );


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
主排行榜顯示
==================================================
*/

function renderLeaderboard() {

  if (
    !currentUser
  ) {

    showLoginRequiredMessage();

    return;
  }


  loadingMessage.hidden =
    true;


  errorMessage.hidden =
    true;


  emptyMessage.hidden =
    true;


  leaderboardList.innerHTML =
    "";


  const semesterGames =
    getCurrentSemesterGames();


  /*
  --------------------------------------------------
  指定單一遊戲
  --------------------------------------------------
  */

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

    emptyMessage.hidden =
      false;


    emptyMessage.textContent =
      "這個學期目前沒有排行榜項目。";


    return;
  }


  /*
  --------------------------------------------------
  即使完全沒有成績，
  每一張遊戲排行榜仍然建立。
  --------------------------------------------------
  */

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
              record.game
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
建立單一遊戲排行榜
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
  --------------------------------------------------
  標題
  --------------------------------------------------
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
  --------------------------------------------------
  模式
  --------------------------------------------------
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
取得設定中的模式
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
單模式
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
多模式
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
      mode,
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
        mode.name;


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


      /*
      --------------------------------------------------
      模式標題
      --------------------------------------------------
      */

      const heading =
        document.createElement(
          "h3"
        );


      heading.className =
        "leaderboard-mode-heading";


      heading.textContent =
        `${mode.name}排行榜`;


      content.appendChild(
        heading
      );


      /*
      --------------------------------------------------
      只留下該 mode
      --------------------------------------------------
      */

      const modeRecords =
        records.filter(
          (
            record
          ) =>
            String(
              record.mode ?? ""
            ) ===
            mode.id
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
            mode.name
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
      --------------------------------------------------
      Tab
      --------------------------------------------------
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


  const status =
    game.finished ===
      true
      ? ""
      : "此遊戲已預先建立排行榜；";


  empty.textContent =
    modeName
      ? `${status}${modeName}目前尚無成績紀錄。`
      : `${status}目前尚無成績紀錄。`;


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


  return type ===
    "timed"
      ? "timed"
      : "speed";
}


/*
==================================================
整理排行榜
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
  --------------------------------------------------
  先排序全部紀錄
  --------------------------------------------------
  */

  const sorted =
    [
      ...records
    ].sort(
      comparator
    );


  /*
  --------------------------------------------------
  同一玩家在同一排行榜只留最佳紀錄
  --------------------------------------------------
  */

  const usedPlayers =
    new Set();


  const uniqueRecords =
    [];


  for (
    const record of
    sorted
  ) {

    const playerKey =
      getPlayerKey(
        record
      );


    if (
      usedPlayers.has(
        playerKey
      )
    ) {

      continue;
    }


    usedPlayers.add(
      playerKey
    );


    uniqueRecords.push(
      record
    );


    if (
      uniqueRecords.length >=
      LEADERBOARD_LIMIT
    ) {

      break;
    }
  }


  return uniqueRecords;
}


/*
==================================================
speed 排序
==================================================

固定題數：

1. 分數高
2. 完成時間短
3. 答對多
4. 答錯少
5. 最高連擊高
6. 較早達成

==================================================
*/

function compareSpeedRecords(
  recordA,
  recordB
) {

  /*
  1. 分數
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
  2. 時間短
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
  3. 答對多
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
  4. 答錯少
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
  5. 連擊
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
  6. 較早達成
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

固定時間：

1. 分數高
2. 答對多
3. 答錯少
4. 最高連擊高
5. 較早達成

==================================================
*/

function compareTimedRecords(
  recordA,
  recordB
) {

  /*
  1. 分數
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
  4. 最高連擊
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
建立排名列表
==================================================
*/

function createRankingList(
  records,
  gameId
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
        createRankingItem(
          record,
          index +
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
建立一筆排名
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


  if (
    currentUser &&
    record.uid ===
    currentUser.uid
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
  --------------------------------------------------
  玩家資料
  --------------------------------------------------
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
    getPlayerName(
      record
    );


  const detail =
    document.createElement(
      "div"
    );


  detail.className =
    "record-detail";


  if (
    getRankingType(
      gameId
    ) ===
    "speed"
  ) {

    const duration =
      document.createElement(
        "span"
      );


    duration.className =
      "leaderboard-play-duration";


    duration.textContent =
      `⏱️ ${formatPlayTime(
        record
      )}`;


    detail.appendChild(
      duration
    );


    detail.appendChild(
      document.createTextNode(
        `　答對 ${toSafeNumber(
          record.correctCount
        )} 題`
      )
    );

  } else {

    detail.textContent =
      `答對 ${toSafeNumber(
        record.correctCount
      )} 題・答錯 ${toSafeNumber(
        record.wrongCount
      )} 題・最高連擊 ${toSafeNumber(
        record.maxCombo
      )}`;
  }


  const recordDate =
    document.createElement(
      "div"
    );


  recordDate.className =
    "record-date";


  recordDate.textContent =
    formatDate(
      record.createdAt
    );


  playerInfo.append(
    playerName,
    detail,
    recordDate
  );


  /*
  --------------------------------------------------
  分數
  --------------------------------------------------
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


  scoreElement.append(
    scoreNumber,
    scoreLabel
  );


  item.append(
    rankElement,
    playerInfo,
    scoreElement
  );


  return item;
}


/*
==================================================
玩家唯一 Key
==================================================
*/

function getPlayerKey(
  record
) {

  if (
    record.uid
  ) {

    return (
      `uid:${record.uid}`
    );
  }


  if (
    record.email
  ) {

    return (
      `email:${record.email}`
    );
  }


  if (
    record.playerName
  ) {

    return (
      `name:${record.playerName}`
    );
  }


  return (
    `record:${record.id}`
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
    record.playerName ||
    record.displayName ||
    record.name ||
    record.email ||
    "未命名玩家"
  );
}


/*
==================================================
安全數字
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


/*
==================================================
遊戲完成時間
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
    value >=
    0
  ) {

    return value;
  }


  /*
  舊紀錄沒有 playTime 時，
  同分情況放在有時間紀錄者之後。
  */

  return Number.POSITIVE_INFINITY;
}


/*
==================================================
格式化測驗時間
==================================================
*/

function formatPlayTime(
  record
) {

  const seconds =
    getPlayTime(
      record
    );


  if (
    !Number.isFinite(
      seconds
    )
  ) {

    return "時間未記錄";
  }


  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        seconds
      )
    );


  const minutes =
    Math.floor(
      totalSeconds /
      60
    );


  const remain =
    totalSeconds %
    60;


  return (
    `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:` +
    `${String(
      remain
    ).padStart(
      2,
      "0"
    )}`
  );
}


/*
==================================================
時間戳
==================================================
*/

function getTimestampMilliseconds(
  timestamp
) {

  if (
    !timestamp
  ) {

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


    const milliseconds =
      date.getTime();


    return Number.isFinite(
      milliseconds
    )
      ? milliseconds
      : Number.POSITIVE_INFINITY;

  } catch (
    error
  ) {

    return Number.POSITIVE_INFINITY;
  }
}


/*
==================================================
顯示日期
==================================================
*/

function formatDate(
  timestamp
) {

  const milliseconds =
    getTimestampMilliseconds(
      timestamp
    );


  if (
    !Number.isFinite(
      milliseconds
    )
  ) {

    return "時間未記錄";
  }


  try {

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
    )
      .format(
        new Date(
          milliseconds
        )
      );

  } catch (
    error
  ) {

    return "時間格式錯誤";
  }
}


/*
==================================================
排名圖示
==================================================
*/

function getRankDisplay(
  rank
) {

  if (
    rank ===
    1
  ) {

    return "🥇";
  }


  if (
    rank ===
    2
  ) {

    return "🥈";
  }


  if (
    rank ===
    3
  ) {

    return "🥉";
  }


  return String(
    rank
  );
}


/*
==================================================
Loading
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
    "目前尚未登入，請回到首頁登入 Google 帳號後再查看排行榜。";
}


/*
==================================================
錯誤
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
      "排行榜讀取權限不足，請確認 Firestore Rules 是否允許登入玩家讀取 scores。";


    return;
  }


  errorMessage.textContent =
    `排行榜讀取失敗：${
      error?.message ||
      "未知錯誤"
    }`;
}
