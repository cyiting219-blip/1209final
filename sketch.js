let chunli;
let stopFrames = [];
let walkFrames = [];
let kickFrames = [];
let shoeSpriteSheet;
let shoe = null; // 鞋子物件

let character2SpriteSheet;
let character2Frames = [];
let character2;
const totalCharacter2Frames = 9;
const character2SpriteWidth = 787;
const character2SpriteHeight = 152;
const character2FrameWidth = character2SpriteWidth / totalCharacter2Frames;

// 說話動作參數
let talkSpriteSheet;
let talkFrames = [];
const totalTalkFrames = 4;
const talkSpriteWidth = 203;
const talkSpriteHeight = 151;
const talkFrameWidth = talkSpriteWidth / totalTalkFrames;

// 跌倒動作參數
let fallSpriteSheet;
let fallFrames = [];
const totalFallFrames = 11;
const fallSpriteWidth = 1799;
const fallSpriteHeight = 127;
const fallFrameWidth = fallSpriteWidth / totalFallFrames;

// 角色3動作參數
let character3Frames = [];
let character3;
const totalCharacter3Frames = 8; // 使用 0.png ~ 7.png 的 8 張連續影格

// 角色4 (使用精靈圖 4 all.png)
let character4SpriteSheet;
let character4Frames = [];
let character4;
const totalCharacter4Frames = 4;
const character4SpriteWidth = 151;
const character4SpriteHeight = 32;
const character4FrameWidth = Math.floor(character4SpriteWidth / totalCharacter4Frames);

// 題庫資料
let questionsTable;
let currentQuestionIndex = 0;
let questionsTable3; // 角色3的題庫
let currentQuestionIndex3 = 0; // 角色3目前的題目索引
let questionsTable4; // 角色4的題庫
let currentQuestionIndex4 = 0; // 角色4目前的題目索引
let questionsTableHint; // 提示視窗的題庫
let showHint = false; // 是否顯示提示視窗
let currentHintMessage = ""; // 目前顯示的提示訊息
let backgroundImg;

// 參數設定
const totalStopFrames = 18;
const totalWalkFrames = 8;
const totalKickFrames = 13;
const moveSpeed = 3; // 角色移動速度

// shoe 精靈圖參數
const shoeSpriteWidth = 380;
const shoeSpriteHeight = 46;
const totalShoeFrames = 5;
const shoeFrameWidth = shoeSpriteWidth / 5;

function preload() {
  // 載入靜止動作 (0.png ~ 17.png)
  for (let i = 0; i < totalStopFrames; i++) {
    stopFrames.push(loadImage(`1/stop/${i}.png`));
  }
  // 載入走路動作 (0.png ~ 7.png)
  for (let i = 0; i < totalWalkFrames; i++) {
    walkFrames.push(loadImage(`1/walk/${i}.png`));
  }
  // 載入踢腿動作 (0.png ~ 12.png)
  for (let i = 0; i < totalKickFrames; i++) {
    kickFrames.push(loadImage(`1/kick/${i}.png`));
  }
  // 載入鞋子精靈圖
  shoeSpriteSheet = loadImage('1/shoe/shoe.png');

  // 載入第二個角色的精靈圖
  character2SpriteSheet = loadImage('2/stop/2stop all.png');
  
  // 載入說話動作精靈圖
  talkSpriteSheet = loadImage('2/talk/2talk all.png');
  
  // 載入跌倒動作精靈圖
  fallSpriteSheet = loadImage('2/fall/2fall all.png');

  // 載入角色3精靈圖 (個別影格已載入)
  for (let i = 0; i < totalCharacter3Frames; i++) {
    character3Frames.push(loadImage(`3/${i}.png`));
  }
  // 載入角色4精靈圖 (精靈圖檔案: 4/4 all.png)
  character4SpriteSheet = loadImage('4/4 all.png');

  // 載入題庫 CSV
  questionsTable = loadTable('questions.csv', 'csv', 'header');
  // 載入角色3題庫 CSV
  questionsTable3 = loadTable('questions_3.csv', 'csv', 'header');
  // 載入角色4題庫 CSV
  questionsTable4 = loadTable('questions_4.csv', 'csv', 'header');
  // 載入提示題庫 CSV
  questionsTableHint = loadTable('questions_hint.csv', 'csv', 'header');

  // 載入背景圖片
  backgroundImg = loadImage('picture.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  
  // 建立角色物件，固定在畫面中心
  chunli = new Character(width / 2, height / 2, stopFrames, walkFrames);

  // 從精靈圖中擷取畫格給第二個角色
  for (let i = 0; i < totalCharacter2Frames; i++) {
    let x = i * character2FrameWidth;
    let img = character2SpriteSheet.get(x, 0, character2FrameWidth, character2SpriteHeight);
    character2Frames.push(img);
  }
  
  // 從精靈圖中擷取說話畫格
  for (let i = 0; i < totalTalkFrames; i++) {
    let x = i * talkFrameWidth;
    let img = talkSpriteSheet.get(x, 0, talkFrameWidth, talkSpriteHeight);
    talkFrames.push(img);
  }
  
  // 從精靈圖中擷取跌倒畫格
  for (let i = 0; i < totalFallFrames; i++) {
    let x = i * fallFrameWidth;
    let img = fallSpriteSheet.get(x, 0, fallFrameWidth, fallSpriteHeight);
    fallFrames.push(img);
  }
  
  // 角色3影格已於 preload 以個別檔案載入

  // 建立第二個角色物件
  character2 = new SimpleAnim(width * 0.2, height * 0.65, character2Frames);
  
  // 若有題目，預設顯示第一題
  if (questionsTable && questionsTable.getRowCount() > 0) {
    character2.message = questionsTable.getString(currentQuestionIndex, 0);
  }
  
  // 建立第三個角色物件 (放在自然島嶼 - 右上方)
  // 使用個別影格並稍微加快播放速度以達成連貫動畫
  character3 = new SimpleAnim(width / 2, height / 2, character3Frames, 3, 0.2); // 放大 3 倍，播放速度 0.2
  
  // 初始化角色3的題目 (隨機挑選)
  if (questionsTable3 && questionsTable3.getRowCount() > 0) {
    currentQuestionIndex3 = floor(random(questionsTable3.getRowCount()));
    character3.message = questionsTable3.getString(currentQuestionIndex3, 'question');
  }

  // 從角色4的精靈圖中擷取畫格 (移至 setup 以確保圖片已載入)
  for (let i = 0; i < totalCharacter4Frames; i++) {
    let x = i * character4FrameWidth;
    let img = character4SpriteSheet.get(x, 0, character4FrameWidth, character4SpriteHeight);
    character4Frames.push(img);
  }

  // 建立第四個角色物件（使用精靈圖切割出的畫格）
  character4 = new SimpleAnim(width * 0.85, height * 0.25, character4Frames, 2, 0.18); // 放大 2 倍，播放速度 0.18

  // 初始化角色4的題目 (隨機挑選)
  if (questionsTable4 && questionsTable4.getRowCount() > 0) {
    currentQuestionIndex4 = floor(random(questionsTable4.getRowCount()));
    character4.message = questionsTable4.getString(currentQuestionIndex4, 'question');
  }

  // 建立輸入框
  inputElement = createInput('');
  inputElement.style('background-color', 'rgba(255, 255, 255, 0.7)');
  inputElement.hide();
}

function draw() {
  image(backgroundImg, width / 2, height / 2, width, height);
  
  // 更新動畫狀態 & 繪製
  chunli.update();
  chunli.display();

  // 互動邏輯：檢測角色1與其他角色的距離
  let isInteracting = false; // 標記是否正在互動，避免輸入框衝突

  // --- 角色2 互動 ---
  if (dist(chunli.x, chunli.y, character2.x, character2.y) < 150) {
    character2.playTalk(talkFrames);
    inputElement.show();
    inputElement.position(chunli.x - 60, chunli.y - 120); // 設定輸入框位置在角色1上方
    isInteracting = true;
  } else {
    // 離開後重置為題目 (若有載入題庫)
    if (questionsTable && questionsTable.getRowCount() > 0) {
      character2.message = questionsTable.getString(currentQuestionIndex, 0);
    } else {
      character2.message = "請問你叫什麼名字"; // 離開後重置訊息
    }
  }

  // --- 角色3 互動 (若未與角色2互動) ---
  if (!isInteracting && dist(chunli.x, chunli.y, character3.x, character3.y) < 150) {
    character3.playTalk(character3Frames); // 角色3沒有專屬說話圖，重複使用走路圖
    inputElement.show();
    inputElement.position(chunli.x - 60, chunli.y - 120);
    isInteracting = true;
  } else {
    // 離開後重置為題目 (角色3)
    if (questionsTable3 && questionsTable3.getRowCount() > 0) {
      character3.message = questionsTable3.getString(currentQuestionIndex3, 'question');
    } else {
      character3.message = "你好";
    }
  }

  // --- 角色4 互動 (若未與前兩個角色互動) ---
  if (!isInteracting && character4 && dist(chunli.x, chunli.y, character4.x, character4.y) < 150) {
    character4.playTalk(character4Frames); // 重複使用動作圖
    inputElement.show();
    inputElement.position(chunli.x - 60, chunli.y - 120);
    isInteracting = true;
  } else if (character4) {
    // 離開後重置為題目 (角色4)
    if (questionsTable4 && questionsTable4.getRowCount() > 0) {
      character4.message = questionsTable4.getString(currentQuestionIndex4, 'question');
    } else {
      character4.message = "你好";
    }
  }

  // 若完全沒有互動，隱藏輸入框
  if (!isInteracting) {
    inputElement.hide();
  }

  // 更新並繪製第二個角色
  character2.update();
  character2.display();
  
  // 更新並繪製第三個角色
  character3.update();
  character3.display();

  // 更新並繪製第四個角色
  if (character4) {
    character4.update();
    character4.display();
  }

  // 更新鞋子物件
  if (shoe !== null) {
    shoe.update();
    shoe.display();
    
    // 檢測鞋子是否擊中角色2 (距離小於 100)
    if (dist(shoe.x, shoe.y, character2.x, character2.y) < 100) {
      character2.playFall(fallFrames);
      shoe = null; // 鞋子消失
    }
    // 如果鞋子動畫播放完畢，刪除它
    else if (shoe.isFinished()) {
      shoe = null;
    }
  }

  // 繪製提示視窗 (最上層)
  if (showHint) {
    push();
    translate(width / 2, height / 2);
    // 視窗背景
    fill(255, 255, 255, 230); // 半透明白色
    stroke(0);
    strokeWeight(1); // 線條變細
    rectMode(CENTER);
    rect(0, 0, 600, 500, 20); // 圓角矩形 (加大視窗以容納所有文字)
    // 提示文字
    fill(0);
    noStroke(); // 文字不描邊，保持清晰
    textAlign(CENTER, CENTER);
    textSize(22); // 文字放大
    text(currentHintMessage, 0, 0);
    pop();
  }
}

function keyPressed() {
  if (keyCode === 32) { // 空白鍵
    chunli.setKicking(true);
  } else if (keyCode === ENTER) {
    // --- 檢查角色2答案 ---
    if (dist(chunli.x, chunli.y, character2.x, character2.y) < 150) {
      // 檢查答案
      if (questionsTable && questionsTable.getRowCount() > 0) {
        let answer = questionsTable.getString(currentQuestionIndex, 'answer');
        if (inputElement.value() === answer) {
          character2.message = questionsTable.getString(currentQuestionIndex, 'correct_feedback');
          currentQuestionIndex = (currentQuestionIndex + 1) % questionsTable.getRowCount(); // 答對跳下一題，並循環
        } else {
          character2.message = questionsTable.getString(currentQuestionIndex, 'incorrect_feedback');
        }
      } else {
        character2.message = "歡迎你";
      }
      inputElement.value(''); // 清空輸入框
    } 
    // --- 檢查角色3答案 ---
    else if (dist(chunli.x, chunli.y, character3.x, character3.y) < 150) {
      if (questionsTable3 && questionsTable3.getRowCount() > 0) {
        let answer = questionsTable3.getString(currentQuestionIndex3, 'answer');
        if (inputElement.value() === answer) {
          character3.message = questionsTable3.getString(currentQuestionIndex3, 'correct_feedback');
          // 答對後隨機換下一題
          currentQuestionIndex3 = floor(random(questionsTable3.getRowCount()));
        } else {
          character3.message = questionsTable3.getString(currentQuestionIndex3, 'incorrect_feedback');
        }
      }
      inputElement.value(''); // 清空輸入框
    }
    // --- 檢查角色4答案 ---
    else if (character4 && dist(chunli.x, chunli.y, character4.x, character4.y) < 150) {
      if (questionsTable4 && questionsTable4.getRowCount() > 0) {
        let answer = questionsTable4.getString(currentQuestionIndex4, 'answer');
        if (inputElement.value() === answer) {
          character4.message = questionsTable4.getString(currentQuestionIndex4, 'correct_feedback');
          // 答對後隨機換下一題
          currentQuestionIndex4 = floor(random(questionsTable4.getRowCount()));
        } else {
          character4.message = questionsTable4.getString(currentQuestionIndex4, 'incorrect_feedback');
        }
      }
      inputElement.value(''); // 清空輸入框
    }
  }
}

function keyReleased() {
  // 移除放開方向鍵的處理，改由 Character.update() 中的 keyIsDown 自動判斷
}

function mousePressed() {
  // 如果提示框顯示中，點擊任何地方都關閉提示框
  if (showHint) {
    showHint = false;
    return;
  }

  // 檢測是否點擊左上角地球圖示範圍 (假設範圍約為 100x100)
  if (mouseX >= 0 && mouseX <= 100 && mouseY >= 0 && mouseY <= 100) {
    window.open('https://share.google/LaD6sR6zkwtzNvPGl', '_blank');
  }

  // 檢測是否點擊右下角問號圖示範圍
  // 假設問號圖示位於右下角倒數第二個位置 (約 width-300 到 width-200)
  if (mouseX > width - 300 && mouseX < width - 200 && mouseY > height - 100) {
    showHint = !showHint; // 切換顯示/隱藏
    // 如果開啟視窗，顯示全部提示內容
    if (showHint && questionsTableHint && questionsTableHint.getRowCount() > 0) {
      currentHintMessage = "";
      for (let i = 0; i < questionsTableHint.getRowCount(); i++) {
        currentHintMessage += questionsTableHint.getString(i, 'question') + "\n";
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 視窗變動時，確保角色保持在中心
  if (chunli) {
    chunli.x = width / 2; // Keep original character centered
    chunli.y = height / 2;
  }
  if (character2) {
    character2.x = width * 0.2; // Reposition second character
    character2.y = height * 0.65;
  }
  if (character3) {
    character3.x = width / 2;
    character3.y = height / 2;
  }
  if (character4) {
    character4.x = width * 0.85;
    character4.y = height * 0.25;
  }
}

// ==========================================
//  簡易動畫類別 (Simple Animation Class)
// ==========================================
class SimpleAnim {
  constructor(x, y, frames, scale = 1, speed = 0.15) {
    this.x = x;
    this.y = y;
    this.frames = frames;
    this.scale = scale;
    this.originalFrames = frames; // 記住原本的 frames，以便恢復
    this.currentFrame = 0;
    this.animTimer = 0;
    this.animSpeed = speed; // 動畫速度
    this.isTalking = false;
    this.isFalling = false;
    this.message = "請問你叫什麼名字";
  }

  update() {
    this.animTimer += this.animSpeed;
    if (this.animTimer >= 1) {
      this.animTimer = 0;
      
      if (this.isFalling) {
        // 如果正在跌倒，檢查是否播到最後一張
        if (this.currentFrame >= this.frames.length - 1) {
          this.frames = this.originalFrames; // 顯示完成後，恢復原本圖檔
          this.isFalling = false;
          this.currentFrame = 0;
        } else {
          this.currentFrame++;
        }
      } else if (this.isTalking) {
        // 如果正在說話，檢查是否播到最後一張
        if (this.currentFrame >= this.frames.length - 1) {
          this.frames = this.originalFrames; // 顯示完成後，恢復原本圖檔
          this.isTalking = false;
          this.currentFrame = 0;
        } else {
          this.currentFrame++;
        }
      } else {
        // 一般循環播放
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      }
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.scale);
    image(this.frames[this.currentFrame], 0, 0);
    pop();
    
    // 當正在說話時，顯示對話框與文字
    if (this.isTalking) {
      push();
      fill(255, 255, 255, 180); // 半透明白色背景
      stroke(0); // 黑色邊框
      rectMode(CENTER);
      rect(this.x, this.y - 100, 200, 40); // 繪製方框，位置在角色上方
      fill(0); // 黑色文字
      textAlign(CENTER, CENTER);
      textSize(20);
      text(this.message, this.x, this.y - 100); // 顯示文字變數
      pop();
    }
  }
  
  // 觸發說話動畫的方法
  playTalk(talkFrames) {
    if (!this.isTalking && !this.isFalling) {
      this.frames = talkFrames;
      this.isTalking = true;
      this.currentFrame = 0;
      this.animTimer = 0;
    }
  }
  
  // 觸發跌倒動畫的方法
  playFall(fallFrames) {
    if (!this.isFalling) {
      this.frames = fallFrames;
      this.isFalling = true;
      this.isTalking = false; // 跌倒時停止說話
      this.currentFrame = 0;
      this.animTimer = 0;
    }
  }
}


// ==========================================
//  角色類別 (Character Class)
// ==========================================
class Character {
  constructor(x, y, stopImgs, walkImgs) {
    this.x = x;
    this.y = y;
    
    this.stopImages = stopImgs;
    this.walkImages = walkImgs;
    this.kickImages = kickFrames;
    
    this.isWalking = false;
    this.isKicking = false;
    this.direction = 1; // 1 = 向右, -1 = 向左
    
    // === 動畫核心變數 ===
    this.currentFrame = 0;   // 目前播到第幾張
    this.animTimer = 0;      // 計時器 (累加數值)
    
    // 這裡控制「連貫度」：數字越大，動作越快；數字越小，動作越慢
    this.stopSpeed = 0.15;   // 靜止呼吸的速度
    this.walkSpeed = 0.25;   // 走路動作的速度
    this.kickSpeed = 0.25;   // 踢腿動作的速度
  }

  update() {
    // === 0. 處理移動輸入 (使用 keyIsDown 支援斜向移動與上下移動) ===
    let isMoving = false;
    
    // 只有在非踢腿狀態下才能移動
    if (!this.isKicking) {
      if (keyIsDown(LEFT_ARROW)) {
        this.x -= moveSpeed;
        this.direction = -1;
        isMoving = true;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        this.x += moveSpeed;
        this.direction = 1;
        isMoving = true;
      }
      if (keyIsDown(UP_ARROW)) {
        this.y -= moveSpeed;
        isMoving = true;
      }
      if (keyIsDown(DOWN_ARROW)) {
        this.y += moveSpeed;
        isMoving = true;
      }
    }
    
    // 更新走路狀態 (若狀態改變則重置動畫)
    if (this.isWalking !== isMoving && !this.isKicking) {
      this.isWalking = isMoving;
      this.currentFrame = 0;
      this.animTimer = 0;
    }

    // 1. 根據狀態決定播放速度
    let speed;
    if (this.isKicking) {
      speed = this.kickSpeed;
    } else if (this.isWalking) {
      speed = this.walkSpeed;
    } else {
      speed = this.stopSpeed;
    }
    
    // 2. 累加計時器
    this.animTimer += speed;
    
    // 3. 判斷總張數
    let totalFrames;
    if (this.isKicking) {
      totalFrames = totalKickFrames;
    } else if (this.isWalking) {
      totalFrames = totalWalkFrames;
    } else {
      totalFrames = totalStopFrames;
    }
    
    // 4. 當計時器超過 1，就換下一張圖
    if (this.animTimer >= 1) {
      this.animTimer = 0;
      this.currentFrame++;
      
      // 踢腿動畫完成後，創建鞋子物件並回到靜止
      if (this.isKicking && this.currentFrame >= totalKickFrames) {
        shoe = new Shoe(this.x, this.y, this.direction);
        this.isKicking = false;
        this.currentFrame = 0;
      }
      
      // 循環播放
      if (this.currentFrame >= totalFrames) {
        this.currentFrame = 0;
      }
    }
    
    // 5. 限制角色不超出畫布邊界
    if (this.x < 0) this.x = 0;
    if (this.x > width) this.x = width;
    if (this.y < 0) this.y = 0;
    if (this.y > height) this.y = height;
  }

  display() {
    // 根據方向進行翻轉
    push();
    translate(this.x, this.y);
    
    // 如果向左，進行水平翻轉
    if (this.direction === -1) {
      scale(-1, 1);
    }
    
    if (this.isKicking) {
      // === 繪製踢腿 (圖片陣列) ===
      let idx = this.currentFrame % totalKickFrames;
      image(this.kickImages[idx], 0, 0);
    } else if (this.isWalking) {
      // === 繪製走路 (圖片陣列) ===
      let idx = this.currentFrame % totalWalkFrames; 
      image(this.walkImages[idx], 0, 0);
      
    } else {
      // === 繪製靜止 (圖片陣列) ===
      let idx = this.currentFrame % totalStopFrames;
      image(this.stopImages[idx], 0, 0);
    }
    
    pop();
  }

  // 設定狀態的函式
  setWalking(walking, direction = 0) {
    // 更新方向
    if (direction !== 0) {
      this.direction = direction;
    }
    
    // 只有狀態真的改變時，才重置動畫
    if (this.isWalking !== walking && !this.isKicking) {
      this.isWalking = walking;
      this.currentFrame = 0;
      this.animTimer = 0;
    }
  }
  
  // 設定踢腿狀態
  setKicking(kicking) {
    if (kicking && !this.isKicking) {
      this.isKicking = true;
      this.isWalking = false;
      this.currentFrame = 0;
      this.animTimer = 0;
    }
  }
}

// ==========================================
//  鞋子類別 (Shoe Class)
// ==========================================
class Shoe {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    
    this.currentFrame = 0;
    this.animTimer = 0;
    this.shoeSpeed = 0.3; // 鞋子動畫速度
  }
  
  update() {
    // 累加計時器
    this.animTimer += this.shoeSpeed;
    
    // 當計時器超過 1，就換下一張圖
    if (this.animTimer >= 1) {
      this.animTimer = 0;
      this.currentFrame++;
    }
    
    // 鞋子移動
    this.x += moveSpeed * this.direction;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    // 如果向左，進行水平翻轉
    if (this.direction === -1) {
      scale(-1, 1);
    }
    
    // === 繪製鞋子 (精靈圖) ===
    let idx = this.currentFrame % totalShoeFrames;
    let sx = idx * shoeFrameWidth;
    
    image(
      shoeSpriteSheet,
      0, 0,
      shoeFrameWidth,
      shoeSpriteHeight,
      sx, 0, shoeFrameWidth, shoeSpriteHeight
    );
    
    pop();
  }
  
  isFinished() {
    return this.currentFrame >= totalShoeFrames;
  }
}
