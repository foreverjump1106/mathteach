/*
==========================================
正負數大挑戰－遊戲邏輯
==========================================
*/

import {
  randomInteger,
  formatInteger
} from "./common.js";

import {
  prepareAudio,
  playCorrectSound,
  playWrongSound,
  playCountdownSound
} from "./sound.js";

import {
  saveGameScore
} from "./scores.js";

/* ==============================
   取得畫面元素
============================== */

const questionElement =
  document.getElementById("question");

const answerDisplay =
  document.getElementById("answerDisplay");

const submitButton =
  document.getElementById("submitButton");

const feedbackElement =
  document.getElementById("feedback");

const timeElement =
  document.getElementById("time");

const timeBox =
  document.getElementById("timeBox");

const scoreElement =
  document.getElementById("score");

const comboElement =
  document.getElementById("combo");

const gameArea =
  document.getElementById("gameArea");

const resultArea =
  document.getElementById("resultArea");

const finalScoreElement =
  document.getElementById("finalScore");

const resultMessageElement =
  document.getElementById("resultMessage");

const restartButton =
  document.getElementById("restartButton");

const plusButton =
  document.getElementById("plusButton");

const minusButton =
  document.getElementById("minusButton");

const clearButton =
  document.getElementById("clearButton");

const backspaceButton =
  document.getElementById("backspaceButton");

const numberButtons =
  document.querySelectorAll("[data-value]");

/* ==============================
   儲存狀態文字
============================== */

const saveStatusElement =
  document.createElement("p");

saveStatusElement.id = "saveStatus";
saveStatusElement.setAttribute(
  "aria-live",
  "polite"
);

resultMessageElement.insertAdjacentElement(
  "afterend",
  saveStatusElement
);

/* ==============================
   遊戲設定
============================== */

const GAME_ID = "integer";
const GAME_TIME = 60;

let correctAnswer = 0;
let answerText = "";

let score = 0;
let combo = 0;
let maxCombo = 0;

let correctCount = 0;
let wrongCount = 0;

let timeLeft = GAME_TIME;
let timer = null;

let gameStarted = false;
let gameOver = false;
let acceptingAnswer = true;
let scoreSaved = false;

/* ==============================
   題目系統
============================== */

function createQuestion() {
  const number1 = randomInteger(-20, 20);
  const number2 = randomInteger(-20, 20);

  const operation =
    Math.random() < 0.5 ? "+" : "-";

  if (operation === "+") {
    correctAnswer = number1 + number2;
  } else {
    correctAnswer = number1 - number2;
  }

  questionElement.textContent =
    `${formatInteger(number1)} ` +
    `${operation} ` +
    `${formatInteger(number2)} = ?`;

  answerText = "";
  acceptingAnswer = true;

  updateAnswerDisplay();
  setKeypadDisabled(false);
}

/* ==============================
   答案輸入
============================== */

function updateAnswerDisplay() {
  answerDisplay.textContent =
    answerText === ""
      ? "請輸入答案"
      : answerText;
}

function addDigit(digit) {
  if (!acceptingAnswer || gameOver) {
    return;
  }

  if (answerText.length >= 5) {
    return;
  }

  if (
    answerText === "0" ||
    answerText === "+0" ||
    answerText === "-0"
  ) {
    if (digit === "0") {
      return;
    }

    let sign = "";

    if (answerText.startsWith("-")) {
      sign = "-";
    } else if (answerText.startsWith("+")) {
      sign = "+";
    }

    answerText = sign + digit;
  } else {
    answerText += digit;
  }

  updateAnswerDisplay();
}

function setSign(sign) {
  if (!acceptingAnswer || gameOver) {
    return;
  }

  if (
    answerText.startsWith("-") ||
    answerText.startsWith("+")
  ) {
    answerText = answerText.slice(1);
  }

  answerText = sign + answerText;

  updateAnswerDisplay();
}

function clearAnswer() {
  if (!acceptingAnswer || gameOver) {
    return;
  }

  answerText = "";
  updateAnswerDisplay();
}

function removeLastCharacter() {
  if (!acceptingAnswer || gameOver) {
    return;
  }

  answerText = answerText.slice(0, -1);
  updateAnswerDisplay();
}

function setKeypadDisabled(disabled) {
  numberButtons.forEach(function (button) {
    button.disabled = disabled;
  });

  plusButton.disabled = disabled;
  minusButton.disabled = disabled;
  clearButton.disabled = disabled;
  backspaceButton.disabled = disabled;
  submitButton.disabled = disabled;
}

/* ==============================
   計時系統
============================== */

function startGame() {
  if (gameStarted || gameOver) {
    return;
  }

  prepareAudio();
  gameStarted = true;

  timer = setInterval(function () {
    timeLeft -= 1;
    timeElement.textContent = timeLeft;

    if (timeLeft <= 10 && timeLeft > 0) {
      timeBox.classList.add("danger-time");
      playCountdownSound(timeLeft);
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

/* ==============================
   計分與作答
============================== */

function calculateGainedScore() {
  if (combo >= 5) {
    return 20;
  }

  if (combo >= 3) {
    return 15;
  }

  return 10;
}

function checkAnswer() {
  if (gameOver || !acceptingAnswer) {
    return;
  }

  prepareAudio();

  if (
    answerText === "" ||
    answerText === "+" ||
    answerText === "-"
  ) {
    feedbackElement.textContent =
      "請先輸入完整答案。";

    feedbackElement.className =
      "feedback wrong";

    return;
  }

  startGame();

  acceptingAnswer = false;
  setKeypadDisabled(true);

  const studentAnswer = Number(answerText);

  if (studentAnswer === correctAnswer) {
    correctCount += 1;
    combo += 1;

    if (combo > maxCombo) {
      maxCombo = combo;
    }

    const gainedScore =
      calculateGainedScore();

    score += gainedScore;

    feedbackElement.textContent =
      `答對了！獲得 ${gainedScore} 分`;

    feedbackElement.className =
      "feedback correct";

    playCorrectSound();
  } else {
    wrongCount += 1;
    combo = 0;

    feedbackElement.textContent =
      `答錯了，正確答案是 ${correctAnswer}`;

    feedbackElement.className =
      "feedback wrong";

    playWrongSound();
  }

  scoreElement.textContent = score;
  comboElement.textContent = combo;

  setTimeout(function () {
    if (!gameOver) {
      feedbackElement.textContent = "";
      createQuestion();
    }
  }, 950);
}

/* ==============================
   遊戲結果
============================== */

function getResultMessage() {
  if (score >= 200) {
    return "太厲害了！你是正負數高手！";
  }

  if (score >= 100) {
    return "表現很棒，再挑戰一次一定會更高分！";
  }

  return "繼續練習，你會越來越熟練！";
}

async function saveCurrentScore() {
  if (scoreSaved) {
    return;
  }

  scoreSaved = true;

  saveStatusElement.textContent =
    "☁️ 正在儲存本次成績……";

  const result = await saveGameScore({
    game: GAME_ID,
    score,
    correctCount,
    wrongCount,
    maxCombo,
    playTime: GAME_TIME
  });

  if (result.success) {
    saveStatusElement.textContent =
      "✅ 本次成績已儲存。";

    saveStatusElement.style.color =
      "#2e7d32";

    return;
  }

  if (result.reason === "not-logged-in") {
    saveStatusElement.textContent =
      "ℹ️ 尚未登入，因此本次成績沒有儲存。";

    saveStatusElement.style.color =
      "#b45309";

    return;
  }

  saveStatusElement.textContent =
    "⚠️ 成績暫時無法儲存，請稍後再試。";

  saveStatusElement.style.color =
    "#c62828";
}

async function endGame() {
  if (gameOver) {
    return;
  }

  gameOver = true;
  acceptingAnswer = false;

  clearInterval(timer);
  timer = null;

  setKeypadDisabled(true);

  timeElement.textContent = "0";
  timeBox.classList.remove("danger-time");

  gameArea.style.display = "none";
  resultArea.style.display = "block";

  finalScoreElement.textContent = score;

  resultMessageElement.textContent =
    `${getResultMessage()} ` +
    `答對 ${correctCount} 題，` +
    `答錯 ${wrongCount} 題，` +
    `最高連續答對 ${maxCombo} 題。`;

  await saveCurrentScore();
}

/* ==============================
   重新開始
============================== */

function restartGame() {
  clearInterval(timer);
  timer = null;

  score = 0;
  combo = 0;
  maxCombo = 0;

  correctCount = 0;
  wrongCount = 0;

  timeLeft = GAME_TIME;

  gameStarted = false;
  gameOver = false;
  acceptingAnswer = true;
  scoreSaved = false;

  scoreElement.textContent = "0";
  comboElement.textContent = "0";
  timeElement.textContent = GAME_TIME;

  feedbackElement.textContent = "";

  saveStatusElement.textContent = "";
  saveStatusElement.style.color = "";

  timeBox.classList.remove("danger-time");

  gameArea.style.display = "block";
  resultArea.style.display = "none";

  createQuestion();
}

/* ==============================
   按鈕事件
============================== */

numberButtons.forEach(function (button) {
  button.addEventListener(
    "click",
    function () {
      prepareAudio();
      addDigit(button.dataset.value);
    }
  );
});

plusButton.addEventListener(
  "click",
  function () {
    prepareAudio();
    setSign("+");
  }
);

minusButton.addEventListener(
  "click",
  function () {
    prepareAudio();
    setSign("-");
  }
);

clearButton.addEventListener(
  "click",
  function () {
    prepareAudio();
    clearAnswer();
  }
);

backspaceButton.addEventListener(
  "click",
  function () {
    prepareAudio();
    removeLastCharacter();
  }
);

submitButton.addEventListener(
  "click",
  checkAnswer
);

restartButton.addEventListener(
  "click",
  restartGame
);

/* ==============================
   電腦實體鍵盤
============================== */

document.addEventListener(
  "keydown",
  function (event) {
    if (gameOver) {
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      addDigit(event.key);
      return;
    }

    if (event.key === "-") {
      setSign("-");
      return;
    }

    if (event.key === "+") {
      setSign("+");
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      removeLastCharacter();
      return;
    }

    if (event.key === "Escape") {
      clearAnswer();
      return;
    }

    if (event.key === "Enter") {
      checkAnswer();
    }
  }
);

/* ==============================
   初始化
============================== */

createQuestion();
