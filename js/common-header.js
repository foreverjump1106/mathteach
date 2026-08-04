/*
==================================================
數學遊戲樂園：共用遊戲導覽列
檔案位置：js/common-header.js
==================================================

功能：
1. 自動建立「回首頁、排行榜、我的成績」按鈕
2. 自動判斷目前頁面位於根目錄或 games 資料夾
3. 所有遊戲共用同一套外觀
4. 之後只需修改這個檔案，所有遊戲同步更新
==================================================
*/

(function () {
  "use strict";

  const HEADER_ID =
    "mathGameCommonHeader";

  const STYLE_ID =
    "mathGameCommonHeaderStyle";

  /*
  判斷目前頁面是否位於 games 資料夾。

  games/equation.html
  games/fraction.html
  games/integer-operations.html

  這些頁面返回根目錄時需要使用 ../
  */

  function getBasePath() {
    const script =
      document.currentScript;

    /*
    可在 script 標籤手動指定：

    data-base-path="../"
    */

    if (
      script &&
      script.dataset.basePath
    ) {
      return script.dataset.basePath;
    }

    const path =
      window.location.pathname;

    if (
      path.includes("/games/")
    ) {
      return "../";
    }

    return "./";
  }

  /*
  建立共用 CSS。
  */

  function createStyle() {
    if (
      document.getElementById(
        STYLE_ID
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      STYLE_ID;

    style.textContent = `
      .math-game-common-header {
        position: relative;
        z-index: 40;
        width: min(1100px, calc(100% - 24px));
        margin: 12px auto 14px;
        padding: 10px 12px;
        border: 1px solid #dbeafe;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.96);
        box-shadow:
          0 6px 18px
          rgba(30, 64, 175, 0.10);
      }

      .math-game-common-header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .math-game-common-brand {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
        color: #174a7e;
        font-weight: 900;
        white-space: nowrap;
      }

      .math-game-common-brand-icon {
        font-size: 24px;
        line-height: 1;
      }

      .math-game-common-brand-text {
        overflow: hidden;
        font-size: 17px;
        text-overflow: ellipsis;
      }

      .math-game-common-links {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex-wrap: wrap;
      }

      .math-game-common-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 40px;
        padding: 8px 14px;
        border: 2px solid #2563eb;
        border-radius: 11px;
        background: #ffffff;
        color: #1d4ed8;
        font-size: 14px;
        font-weight: 800;
        line-height: 1.2;
        text-decoration: none;
        cursor: pointer;
        transition:
          transform 0.18s ease,
          background 0.18s ease,
          color 0.18s ease,
          box-shadow 0.18s ease;
      }

      .math-game-common-link:hover {
        background: #2563eb;
        color: #ffffff;
        box-shadow:
          0 5px 12px
          rgba(37, 99, 235, 0.20);
        transform: translateY(-1px);
      }

      .math-game-common-link:active {
        transform: translateY(1px);
      }

      .math-game-common-link.secondary {
        border-color: #64748b;
        color: #475569;
      }

      .math-game-common-link.secondary:hover {
        background: #64748b;
        color: #ffffff;
      }

      .math-game-common-link.ranking {
        border-color: #f59e0b;
        color: #b45309;
      }

      .math-game-common-link.ranking:hover {
        background: #f59e0b;
        color: #ffffff;
      }

      @media (max-width: 720px) {
        .math-game-common-header {
          width: calc(100% - 16px);
          margin-top: 8px;
          margin-bottom: 10px;
          padding: 9px;
        }

        .math-game-common-header-inner {
          align-items: stretch;
          flex-direction: column;
          gap: 9px;
        }

        .math-game-common-brand {
          justify-content: center;
        }

        .math-game-common-links {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          width: 100%;
          gap: 6px;
        }

        .math-game-common-link {
          min-width: 0;
          padding: 8px 5px;
          font-size: 13px;
          text-align: center;
        }
      }

      @media (max-width: 430px) {
        .math-game-common-brand-text {
          font-size: 16px;
        }

        .math-game-common-link {
          gap: 3px;
          font-size: 12px;
        }

        .math-game-common-link-label {
          display: inline;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  /*
  建立單一導覽按鈕。
  */

  function createLink({
    href,
    icon,
    label,
    className = ""
  }) {
    const link =
      document.createElement("a");

    link.className =
      `math-game-common-link ${className}`
        .trim();

    link.href =
      href;

    link.innerHTML = `
      <span aria-hidden="true">
        ${icon}
      </span>

      <span class="math-game-common-link-label">
        ${label}
      </span>
    `;

    return link;
  }

  /*
  建立完整導覽列。
  */

  function createHeader(options = {}) {
    if (
      document.getElementById(
        HEADER_ID
      )
    ) {
      return;
    }

    createStyle();

    const basePath =
      options.basePath ||
      getBasePath();

    const header =
      document.createElement(
        "header"
      );

    header.id =
      HEADER_ID;

    header.className =
      "math-game-common-header";

    header.setAttribute(
      "aria-label",
      "數學遊戲導覽列"
    );

    const inner =
      document.createElement(
        "div"
      );

    inner.className =
      "math-game-common-header-inner";

    /*
    左側品牌名稱。
    */

    const brand =
      document.createElement(
        "div"
      );

    brand.className =
      "math-game-common-brand";

    brand.innerHTML = `
      <span
        class="math-game-common-brand-icon"
        aria-hidden="true"
      >
        🎮
      </span>

      <span
        class="math-game-common-brand-text"
      >
        數學遊戲樂園
      </span>
    `;

    /*
    右側導覽按鈕。
    */

    const links =
      document.createElement(
        "nav"
      );

    links.className =
      "math-game-common-links";

    links.setAttribute(
      "aria-label",
      "網站主要導覽"
    );

    const homeLink =
      createLink({
        href:
          `${basePath}index.html`,

        icon:
          "🏠",

        label:
          "回到首頁"
      });

    const rankingLink =
      createLink({
        href:
          `${basePath}leaderboard.html`,

        icon:
          "🏆",

        label:
          "排行榜",

        className:
          "ranking"
      });

    const scoresLink =
      createLink({
        href:
          `${basePath}my-scores.html`,

        icon:
          "📊",

        label:
          "我的成績",

        className:
          "secondary"
      });

    links.appendChild(
      homeLink
    );

    links.appendChild(
      rankingLink
    );

    links.appendChild(
      scoresLink
    );

    inner.appendChild(
      brand
    );

    inner.appendChild(
      links
    );

    header.appendChild(
      inner
    );

    /*
    預設放在 body 最前面。

    若頁面中有：
    <div id="commonHeaderMount"></div>

    就會放到指定位置。
    */

    const mount =
      document.getElementById(
        "commonHeaderMount"
      );

    if (mount) {
      mount.appendChild(
        header
      );
    } else {
      document.body.prepend(
        header
      );
    }
  }

  /*
  對外提供手動初始化功能。
  */

  window.MathGameCommonHeader = {
    init:
      createHeader
  };

  /*
  頁面載入後自動建立。
  */

  function autoInitialize() {
    createHeader();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      autoInitialize,
      {
        once: true
      }
    );
  } else {
    autoInitialize();
  }
})();