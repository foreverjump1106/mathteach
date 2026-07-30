import { auth, db } from "./firebase-config.js";

import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * 儲存一次遊戲成績。
 *
 * @param {Object} scoreData
 * @param {string} scoreData.game 遊戲代號，例如 integer
 * @param {number} scoreData.score 本次得分
 * @param {number} scoreData.correctCount 答對題數
 * @param {number} scoreData.wrongCount 答錯題數
 * @param {number} scoreData.maxCombo 最高連續答對
 * @param {number} scoreData.playTime 遊戲時間，單位為秒
 * @returns {Promise<Object>}
 */
export async function saveGameScore({
  game,
  score,
  correctCount = 0,
  wrongCount = 0,
  maxCombo = 0,
  playTime = 60
}) {
  const user = auth.currentUser;

  if (!user) {
    console.warn("玩家尚未登入，這次成績不會儲存。");

    return {
      success: false,
      reason: "not-logged-in"
    };
  }

  if (!game || typeof game !== "string") {
    throw new Error("儲存成績失敗：缺少正確的遊戲代號。");
  }

  if (!Number.isFinite(score)) {
    throw new Error("儲存成績失敗：分數格式不正確。");
  }

  const scoreRecord = {
    uid: user.uid,
    playerName:
      user.displayName ||
      user.email ||
      "未命名玩家",

    playerEmail: user.email || "",
    game,
    score,
    correctCount,
    wrongCount,
    maxCombo,
    playTime,
    createdAt: serverTimestamp()
  };

  try {
    const documentReference = await addDoc(
      collection(db, "scores"),
      scoreRecord
    );

    console.log(
      "成績已成功儲存，文件 ID：",
      documentReference.id
    );

    return {
      success: true,
      documentId: documentReference.id
    };
  } catch (error) {
    console.error("========== 儲存成績錯誤 ==========");
    console.error(error);
    console.error("錯誤代碼：", error?.code);
    console.error("錯誤訊息：", error?.message);
    console.error("玩家 UID：", user.uid);
    console.error("遊戲代號：", game);
    console.error("本次分數：", score);
    console.error("==================================");

    return {
      success: false,
      reason: "firestore-error",
      error
    };
  }
}
