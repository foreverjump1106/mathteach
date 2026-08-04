/*
==================================================
數學遊戲樂園：共用遊戲導覽列
檔案位置：js/common-header.js
==================================================

功能：
1. 自動建立共用導覽列
2. 回到數學遊戲樂園首頁
3. 前往排行榜
4. 前往我的成績
5. 自動判斷根目錄路徑
6. 固定於畫面上方，不影響原本遊戲排版
==================================================
*/

(function () {
  "use strict";

  const HEADER_ID =
    "mathGameCommonHeader";

  const STYLE_ID =
    "mathGameCommonHeaderStyle";

  const BODY_CLASS =
    "math-game-has-common-header";

  /*
  ==================================================
  判斷頁面路徑
  ==================================================

  games 資料夾內的頁面：
  ../index.html

  根目錄頁面：
  ./index.html
  */

  function getBasePath() {
    const script =
      document.currentScript;

    /*
    可以在引用時自行指定：

    <script
      src="../js/common-header.js"
      data-base-path="../"
    ></script>
    */

    if (
      script &&
      script.dataset &&
      script.dataset.basePath
    ) {
      return script.dataset.basePath;
    }

    const currentPath =
      window.location.pathname;

    if (
      currentPath.includes("/games/")
    ) {
      return "../";
    }

    return "./";
  }

  /*
  ==================================================
  建立共用樣式
  ==================================================
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
      document.createElement("style");

    style.id =
      STYLE_ID;

    style.textContent = `
      /*
      預留固定導覽列的上方空間。
      使用 margin-top，不改變原本 body 的 flex 方向。
      */

      body.${BODY_CLASS} {
        padding-top: 86px !important;
      }

      /*
      共用導覽列固定於畫面上方，
      不會成為 body flex 排版中的左右區塊。
      */

      .math-game-common-header {
        position: fixed;
        top: 10px;
        left: 50%;
        z-index: 1000;

        width: min(
          1100px,
          calc(100% - 24px)
        );

        margin: 0;
        padding: 10px 12px;

        border: 1px solid #dbeafe;
        border-radius: 16px;

        background:
          rgba(255, 255, 255, 0.97);

        box-shadow:
          0 6px 18px
          rgba(30, 64, 175, 0.12);

        transform:
          translateX(-50%);

        backdrop-filter:
          blur(8px);

        -webkit-backdrop-filter:
          blur(8px);
      }

      .math-game-common-header,
      .math-game-common-header * {
        box-sizing: border-box;
      }

      .math-game-common-header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        width: 100%;
      }

      /*
      左側品牌名稱
      */

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
        flex: 0 0 auto;

        font-size: 24px;
        line-height: 1;
      }

      .math-game-common-brand-text {
        overflow: hidden;

        font-size: 17px;
        line-height: 1.3;

        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /*
      右側導覽按鈕
      */

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

        font-family:
          "Microsoft JhengHei",
          "Noto Sans TC",
          sans-serif;

        font-size: 14px;
        font-weight: 800;
        line-height: 1.2;
        text-align: center;
        text-decoration: none;
        white-space: nowrap;

        cursor: pointer;

        transition:
          transform 0.18s ease,
          background 0.18s ease,
          color 0.18s ease,
          border-color 0.18s ease,
          box-shadow 0.18s ease;
      }

      .math-game-common-link:hover {
        background: #2563eb;
        color: #ffffff;

        box-shadow:
          0 5px 12px
          rgba(37, 99, 235, 0.20);

        transform:
          translateY(-1px);
      }

      .math-game-common-link:active {
        transform:
          translateY(1px);
      }

      .math-game-common-link:focus-visible {
        outline: 3px solid
          rgba(37, 99, 235, 0.28);

        outline-offset: 2px;
      }

      /*
      排行榜按鈕
      */

      .math-game-common-link.ranking {
        border-color: #f59e0b;
        color: #b45309;
      }

      .math-game-common-link.ranking:hover {
        background: #f59e0b;
        border-color: #f59e0b;
        color: #ffffff;
      }

      /*
      我的成績按鈕
      */

      .math-game-common-link.secondary {
        border-color: #64748b;
        color: #475569;
      }

      .math-game-common-link.secondary:hover {
        background: #64748b;
        border-color: #64748b;
        color: #ffffff;
      }

      /*
      平板與手機
      */

      @media (max-width: 720px) {
        body.${BODY_CLASS} {
          padding-top: 142px !important;
        }

        .math-game-common-header {
          top: 6px;

          width:
            calc(100% - 12px);

          padding: 9px;
          border-radius: 14px;
        }

        .math-game-common-header-inner {
          align-items: stretch;
          flex-direction: column;
          gap: 8px;
        }

        .math-game-common-brand {
          justify-content: center;
        }

        .math-game-common-links {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          width: 100%;
          gap: 6px;
        }

        .math-game-common-link {
          min-width: 0;
          min-height: 38px;

          padding: 7px 5px;

          font-size: 13px;
          white-space: normal;
        }
      }

      @media (max-width: 430px) {
        body.${BODY_CLASS} {
          padding-top: 137px !important;
        }

        .math-game-common-brand-icon {
          font-size: 21px;
        }

        .math-game-common-brand-text {
          font-size: 15px;
        }

        .math-game-common-link {
          gap: 3px;
          padding: 7px 3px;
          font-size: 12px;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  /*
  ==================================================
  建立單一導覽連結
  ==================================================
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
      [
        "math-game-common-link",
        className
      ]
        .filter(Boolean)
        .join(" ");

    link.href =
      href;

    const iconElement =
      document.createElement("span");

    iconElement.setAttribute(
      "aria-hidden",
      "true"
    );

    iconElement.textContent =
      icon;

    const labelElement =
      document.createElement("span");

    labelElement.className =
      "math-game-common-link-label";

    labelElement.textContent =
      label;

    link.appendChild(
      iconElement
    );

    link.appendChild(
      labelElement
    );

    return link;
  }

  /*
  ==================================================
  建立共用導覽列
  ==================================================
  */

  function createHeader(
    options = {}
  ) {
    /*
    防止同一頁重複建立。
    */

    const existingHeader =
      document.getElementById(
        HEADER_ID
      );

    if (existingHeader) {
      return existingHeader;
    }

    if (
      !document.body ||
      !document.head
    ) {
      return null;
    }

    createStyle();

    document.body.classList.add(
      BODY_CLASS
    );

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
      "數學遊戲樂園共用導覽列"
    );

    const inner =
      document.createElement("div");

    inner.className =
      "math-game-common-header-inner";

    /*
    左側品牌區
    */

    const brand =
      document.createElement("div");

    brand.className =
      "math-game-common-brand";

    const brandIcon =
      document.createElement("span");

    brandIcon.className =
      "math-game-common-brand-icon";

    brandIcon.setAttribute(
      "aria-hidden",
      "true"
    );

    brandIcon.textContent =
      "🎮";

    const brandText =
      document.createElement("span");

    brandText.className =
      "math-game-common-brand-text";

    brandText.textContent =
      options.brandText ||
      "數學遊戲樂園";

    brand.appendChild(
      brandIcon
    );

    brand.appendChild(
      brandText
    );

    /*
    右側連結區
    */

    const navigation =
      document.createElement("nav");

    navigation.className =
      "math-game-common-links";

    navigation.setAttribute(
      "aria-label",
      "數學遊戲網站主要導覽"
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

    navigation.appendChild(
      homeLink
    );

    navigation.appendChild(
      rankingLink
    );

    navigation.appendChild(
      scoresLink
    );

    inner.appendChild(
      brand
    );

    inner.appendChild(
      navigation
    );

    header.appendChild(
      inner
    );

    /*
    fixed 元素不參與 body 的 flex 排版，
    所以直接放入 body 不會把遊戲推向右側。

    若頁面有指定掛載點，也可放入掛載點。
    */

    const mount =
      document.getElementById(
        options.mountId ||
        "commonHeaderMount"
      );

    if (mount) {
      mount.appendChild(
        header
      );
    } else {
      document.body.appendChild(
        header
      );
    }

    return header;
  }

  /*
  ==================================================
  移除導覽列
  ==================================================
  */

  function destroyHeader() {
    const header =
      document.getElementById(
        HEADER_ID
      );

    if (header) {
      header.remove();
    }

    if (document.body) {
      document.body.classList.remove(
        BODY_CLASS
      );
    }
  }

  /*
  ==================================================
  對外功能
  ==================================================
  */

  window.MathGameCommonHeader = {
    init:
      createHeader,

    destroy:
      destroyHeader,

    getBasePath
  };

  /*
  ==================================================
  自動初始化
  ==================================================
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