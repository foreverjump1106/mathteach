// Google 登入功能

import { auth } from "./firebase-config.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

export async function login() {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("登入成功：", result.user);
    return result.user;
  } catch (error) {
    console.error("登入失敗：", error);
  }
}

export async function logout() {
  await signOut(auth);
}
