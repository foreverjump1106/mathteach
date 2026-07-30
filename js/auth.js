// Google 登入功能

import {
  auth
} from "./firebase-config.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const provider = new GoogleAuthProvider();

export async function login() {
  try {
    const result = await signInWithPopup(
      auth,
      provider
    );

    console.log(
      "登入成功：",
      result.user
    );

    return result.user;
  } catch (error) {
    console.error(
      "登入失敗：",
      error
    );

    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);

    console.log("登出成功");
  } catch (error) {
    console.error(
      "登出失敗：",
      error
    );

    throw error;
  }
}