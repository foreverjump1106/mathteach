// Firebase 核心
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Firebase 驗證
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firestore 資料庫
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyACTi6me2ijI5lI689rkYmxyJM3Xstl5gY",
  authDomain: "math-games-529b6.firebaseapp.com",
  projectId: "math-games-529b6",
  storageBucket: "math-games-529b6.firebasestorage.app",
  messagingSenderId: "994552743692",
  appId: "1:994552743692:web:47f1f188903b406d8c6b29"
};

// 啟動 Firebase
const app = initializeApp(firebaseConfig);

// 建立共用的驗證與資料庫物件
const auth = getAuth(app);
const db = getFirestore(app);

// 提供給其他網頁程式使用
export {
  app,
  auth,
  db
};