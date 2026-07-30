import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  db
} from "./firebase-config.js";

/**
 * 登入後建立或更新玩家資料
 * @param {import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js").User} user
 */
async function createOrUpdatePlayer(user) {
  if (!user) {
    throw new Error("沒有登入中的使用者");
  }

  const playerRef = doc(db, "users", user.uid);
  const playerSnapshot = await getDoc(playerRef);

  if (!playerSnapshot.exists()) {
    // 第一次登入：建立新的玩家資料
    await setDoc(playerRef, {
      uid: user.uid,
      nickname: user.displayName || "新玩家",
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      level: 1,
      exp: 0,
      totalGames: 0,
      totalCorrect: 0,
      totalWrong: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });

    console.log("玩家資料建立成功");
  } else {
    // 已經登入過：只更新基本資料與最後登入時間
    await setDoc(
      playerRef,
      {
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        lastLoginAt: serverTimestamp()
      },
      {
        merge: true
      }
    );

    console.log("玩家資料更新成功");
  }
}

export {
  createOrUpdatePlayer
};