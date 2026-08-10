/*
==================================================
數學遊戲樂園：共用成績儲存
檔案位置：js/scores.js

版本：8.0
==================================================

功能：

1. 儲存所有遊戲成績
2. 自動確認 Firebase 登入狀態
3. 避免 auth.currentUser 尚未同步完成
4. 自動整理數字格式
5. 儲存遊戲模式
6. 儲存答對、答錯、最高連擊
7. 儲存遊戲完成時間
8. Firestore 錯誤完整顯示
==================================================
*/

import {
  auth,
  db
} from "./firebase-config.js";

import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/*
==================================================
等待 Firebase 登入狀態完成
==================================================

有時候進入遊戲頁面時：

auth.currentUser

還沒來得及恢復登入狀態。

這個函式會稍微等待 Firebase
確認目前登入者。
==================================================
*/

function waitForAuthUser(
  timeout = 3000
) {

  return new Promise(
    (resolve) => {

      /*
      已經有登入者，
      直接回傳。
      */

      if (
        auth.currentUser
      ) {

        resolve(
          auth.currentUser
        );

        return;
      }


      let finished =
        false;


      const finish =
        (user) => {

          if (
            finished
          ) {
            return;
          }

          finished =
            true;

          window.clearTimeout(
            timeoutId
          );

          if (
            typeof unsubscribe ===
            "function"
          ) {

            unsubscribe();
          }

          resolve(
            user || null
          );
        };


      /*
      監聽 Firebase
      登入狀態。
      */

      const unsubscribe =
        onAuthStateChanged(
          auth,

          (user) => {

            finish(
              user
            );
          },

          (error) => {

            console.error(
              "Firebase 登入狀態確認失敗：",
              error
            );

            finish(
              null
            );
          }
        );


      /*
      最多等 3 秒。

      避免 Firebase 發生異常時
      一直卡住。
      */

      const timeoutId =
        window.setTimeout(
          () => {

            finish(
              auth.currentUser
            );
          },

          timeout
        );
    }
  );
}


/*
==================================================
安全轉換數字
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
安全轉換非負整數
==================================================
*/

function toSafeCount(
  value
) {

  return Math.max(
    0,

    Math.round(
      toSafeNumber(
        value,
        0
      )
    )
  );
}


/*
==================================================
整理遊戲代號
==================================================
*/

function normalizeGameId(
  game
) {

  if (
    typeof game !==
    "string"
  ) {

    return "";
  }

  return game.trim();
}


/*
==================================================
整理模式
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
  ).trim();
}


/*
==================================================
儲存一次遊戲成績
==================================================

使用方式：

await saveGameScore({
  game: "compare",
  mode: "easy",
  score: 120,
  correctCount: 10,
  wrongCount: 2,
  maxCombo: 6,
  playTime: 60
});
==================================================
*/

export async function saveGameScore({
  game,
  mode = "",
  score,
  correctCount = 0,
  wrongCount = 0,
  maxCombo = 0,
  playTime = 0
} = {}) {

  /*
  ==============================================
  1. 檢查遊戲代號
  ==============================================
  */

  const safeGame =
    normalizeGameId(
      game
    );

  if (
    !safeGame
  ) {

    console.error(
      "儲存成績失敗：缺少遊戲代號。",
      {
        game,
        mode,
        score
      }
    );

    return {
      success: false,
      reason: "invalid-game"
    };
  }


  /*
  ==============================================
  2. 檢查分數
  ==============================================
  */

  const safeScore =
    Number(
      score
    );

  if (
    !Number.isFinite(
      safeScore
    )
  ) {

    console.error(
      "儲存成績失敗：分數不是有效數字。",
      {
        score
      }
    );

    return {
      success: false,
      reason: "invalid-score"
    };
  }


  /*
  ==============================================
  3. 確認登入者
  ==============================================
  */

  let user =
    auth.currentUser;


  /*
  auth.currentUser 尚未恢復時，
  等待 Firebase 一下。
  */

  if (
    !user
  ) {

    user =
      await waitForAuthUser();
  }


  if (
    !user
  ) {

    console.warn(
      "玩家尚未登入，因此這次成績不會儲存。"
    );

    return {
      success: false,
      reason: "not-logged-in"
    };
  }


  /*
  ==============================================
  4. 整理成績資料
  ==============================================
  */

  const safeMode =
    normalizeMode(
      mode
    );

  const safeCorrectCount =
    toSafeCount(
      correctCount
    );

  const safeWrongCount =
    toSafeCount(
      wrongCount
    );

  const safeMaxCombo =
    toSafeCount(
      maxCombo
    );

  const safePlayTime =
    Math.max(
      0,

      toSafeNumber(
        playTime,
        0
      )
    );


  /*
  ==============================================
  5. 建立 Firestore 紀錄
  ==============================================
  */

  const scoreRecord = {

    /*
    玩家
    */

    uid:
      user.uid,

    playerName:
      user.displayName ||
      user.email ||
      "未命名玩家",

    displayName:
      user.displayName ||
      "",

    playerEmail:
      user.email ||
      "",


    /*
    遊戲
    */

    game:
      safeGame,

    mode:
      safeMode,


    /*
    成績
    */

    score:
      safeScore,

    correctCount:
      safeCorrectCount,

    wrongCount:
      safeWrongCount,

    maxCombo:
      safeMaxCombo,

    playTime:
      safePlayTime,


    /*
    建立時間
    */

    createdAt:
      serverTimestamp()
  };


  /*
  ==============================================
  6. 寫入 Firestore
  ==============================================
  */

  try {

    console.log(
      "準備儲存遊戲成績：",
      scoreRecord
    );


    const scoresCollection =
      collection(
        db,
        "scores"
      );


    const documentReference =
      await addDoc(
        scoresCollection,
        scoreRecord
      );


    console.log(
      "✅ 成績已成功儲存"
    );

    console.log(
      "Firestore 文件 ID：",
      documentReference.id
    );

    console.log(
      "遊戲：",
      safeGame
    );

    console.log(
      "模式：",
      safeMode ||
      "單模式"
    );

    console.log(
      "分數：",
      safeScore
    );


    return {
      success: true,

      documentId:
        documentReference.id,

      record:
        scoreRecord
    };


  } catch (
    error
  ) {

    /*
    ==============================================
    7. 完整錯誤資訊
    ==============================================
    */

    console.error(
      "========================================"
    );

    console.error(
      "❌ Firestore 成績儲存失敗"
    );

    console.error(
      "錯誤物件：",
      error
    );

    console.error(
      "錯誤代碼：",
      error?.code
    );

    console.error(
      "錯誤訊息：",
      error?.message
    );

    console.error(
      "玩家 UID：",
      user.uid
    );

    console.error(
      "玩家 Email：",
      user.email
    );

    console.error(
      "遊戲代號：",
      safeGame
    );

    console.error(
      "遊戲模式：",
      safeMode
    );

    console.error(
      "分數：",
      safeScore
    );

    console.error(
      "答對：",
      safeCorrectCount
    );

    console.error(
      "答錯：",
      safeWrongCount
    );

    console.error(
      "最高連擊：",
      safeMaxCombo
    );

    console.error(
      "遊戲時間：",
      safePlayTime
    );

    console.error(
      "準備寫入的完整資料：",
      scoreRecord
    );

    console.error(
      "========================================"
    );


    /*
    permission-denied
    通常代表 Firestore Rules。
    */

    if (
      error?.code ===
      "permission-denied"
    ) {

      return {
        success: false,

        reason:
          "permission-denied",

        error
      };
    }


    /*
    unavailable
    通常代表網路或 Firebase
    暫時無法連線。
    */

    if (
      error?.code ===
      "unavailable"
    ) {

      return {
        success: false,

        reason:
          "network-unavailable",

        error
      };
    }


    return {
      success: false,

      reason:
        "firestore-error",

      error
    };
  }
}


/*
==================================================
確認成績系統已載入
==================================================
*/

console.log(
  "scores.js v8.0 已成功載入"
);