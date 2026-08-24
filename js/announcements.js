/*
==================================================
生活有解．心中有數
首頁公告與最新消息

檔案位置：
js/announcements.js

使用方式：
1. 新增公告時，只要在 ANNOUNCEMENTS 最前面新增一筆
2. important: true 代表可成為首頁上方重要公告
3. 首頁會自動依日期排序
==================================================
*/


export const ANNOUNCEMENTS = [

  {
    id:
      "20260824-site-brand",

    date:
      "2026-08-24",

    type:
      "notice",

    typeName:
      "網站公告",

    icon:
      "📌",

    title:
      "「生活有解．心中有數」正式啟用",

    content:
      "網站正式使用全新名稱，持續提供數學遊戲、挑戰練習、排行榜與個人成績紀錄。",

    important:
      true
  },


  {
    id:
      "20260824-quadratic",

    date:
      "2026-08-24",

    type:
      "new-game",

    typeName:
      "新遊戲",

    icon:
      "🆕",

    title:
      "一元二次方程式大挑戰正式上線",

    content:
      "八年級上學期新增一元二次方程式六種模式，包含基礎概念、因式分解法、平方根與配方法、公式解、應用問題與全章綜合挑戰。",

    important:
      true
  },


  {
    id:
      "20260823-factorization",

    date:
      "2026-08-23",

    type:
      "game-update",

    typeName:
      "遊戲更新",

    icon:
      "🎮",

    title:
      "因式分解與十字交乘遊戲持續優化",

    content:
      "詳解增加更完整的因式分解步驟，幫助作答者從錯誤中找到需要修正的地方。",

    important:
      false
  },


  {
    id:
      "20260823-score-system",

    date:
      "2026-08-23",

    type:
      "system",

    typeName:
      "系統更新",

    icon:
      "🔧",

    title:
      "排行榜與我的成績功能更新",

    content:
      "登入 Google 帳號後，完成遊戲即可記錄成績，並可查看排行榜與個人歷次表現。",

    important:
      false
  }

];


/*
==================================================
日期排序
最新日期排前面
==================================================
*/

function sortByDateDescending(
  items
) {

  return [
    ...items
  ].sort(
    (
      a,
      b
    ) =>
      String(
        b.date || ""
      )
        .localeCompare(
          String(
            a.date || ""
          )
        )
  );
}


/*
==================================================
取得所有公告
==================================================
*/

export function getAllAnnouncements() {

  return sortByDateDescending(
    ANNOUNCEMENTS
  );
}


/*
==================================================
取得首頁重要公告

若同一天有多則 important，
會取陣列中排在較前面的那一則。
==================================================
*/

export function getImportantAnnouncement() {

  return (
    getAllAnnouncements()
      .find(
        item =>
          item.important ===
          true
      ) ||
    null
  );
}


/*
==================================================
取得最近消息
==================================================
*/

export function getLatestAnnouncements(
  limit = 4
) {

  const safeLimit =
    Math.max(
      1,
      Number(
        limit
      ) ||
      4
    );


  return getAllAnnouncements()
    .slice(
      0,
      safeLimit
    );
}


console.log(
  "announcements.js 已成功載入"
);