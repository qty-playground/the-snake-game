// 網格系統的全局配置
const CELL_SIZE = 25;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 20;

// 顏色設定
const COLORS = {
  SNAKE_HEAD: 0x00ff00, // 綠色蛇頭
  SNAKE_BODY: 0x008800, // 深綠色蛇身
  GRID: 0x333333,     // 網格顏色
  FOOD: 0xff0000,      // 紅色食物
  GAME_OVER: 0xff0000  // 紅色結束提示
};

// 方向設定
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

// 方向對應表 (用於檢查相反方向)
const OPPOSITE_DIRECTIONS = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT'
};

// 遊戲設定
const GAME_SETTINGS = {
  MOVE_INTERVAL: 150, // 蛇移動的時間間隔 (毫秒)
  START_SPEED: 150,   // 初始移動速度 (毫秒)
  MIN_SPEED: 70,       // 最快速度限制 (毫秒)
  POINTS_PER_FOOD: 1  // 每個食物的分數
};

// 假名資料庫
const HIRAGANA_DATA = {
  A_GYOU: [
    { hiragana: 'あ', romaji: 'a', sound: 'a.mp3' },
    { hiragana: 'い', romaji: 'i', sound: 'i.mp3' },
    { hiragana: 'う', romaji: 'u', sound: 'u.mp3' },
    { hiragana: 'え', romaji: 'e', sound: 'e.mp3' },
    { hiragana: 'お', romaji: 'o', sound: 'o.mp3' },
  ],
  // 為未來擴展準備
  K_GYOU: [
    { hiragana: 'か', romaji: 'ka', sound: 'ka.mp3' },
    // ...
  ]
};

class SnakeScene extends Phaser.Scene {
    constructor() {
      super({ key: 'SnakeScene' });
      // 網格系統設定，使用全局配置
      this.cellSize = CELL_SIZE;
      this.gridWidth = GRID_WIDTH;
      this.gridHeight = GRID_HEIGHT;
      
      // 蛇的初始化設定
      this.snake = [];
      this.direction = DIRECTIONS.RIGHT;
      this.nextDirection = DIRECTIONS.RIGHT; // 新增：下一步的方向
      this.snakeBodyGroup = null; // 用於存放蛇身體的 Group
      
      // 移動計時相關
      this.moveTime = 0;         // 下一次移動的時間計數
      this.moveInterval = GAME_SETTINGS.MOVE_INTERVAL; // 移動間隔 (毫秒)
      
      // 鍵盤控制
      this.cursors = null;
      this.directionChanged = false; // 防止一個更新週期內多次改變方向
      
      // 食物相關
      this.food = null;       // 食物的圖形物件
      this.foodPosition = {   // 食物的位置
        x: 0,
        y: 0
      };

      // 遊戲狀態
      this.gameOver = false;
      this.gameStarted = false;  // 新增：遊戲是否已經開始
      
      // 分數相關
      this.score = 0;
      this.scoreText = null;

      // 重新開始相關
      this.restartKey = null;  // 儲存重新開始按鍵

      // 遊戲物件容器
      this.gameObjects = {
        gameOverGroup: null
      };
    }
  
    preload() {
      // TODO: Add sound files
      // 載入假名發音
      // HIRAGANA_DATA.A_GYOU.forEach(hiraganaObj => {
      //   this.load.audio(hiraganaObj.romaji, `assets/sounds/${hiraganaObj.sound}`);
      // });
    }
  
    create() {
      // 繪製網格背景
      this.createGrid();
      
      // 初始化蛇的群組
      this.snakeBodyGroup = this.add.group();
      
      // 創建初始蛇身
      this.createSnake();
      
      // 設定鍵盤控制
      this.setupKeyboardControls();
      
      // 生成第一個食物
      this.generateFood();
      
      this.add.text(10, 10, '🐍 貪食蛇遊戲', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff'
      });
      
      // 顯示控制提示
      this.controlsText = this.add.text(10, this.cellSize * this.gridHeight - 30, '使用方向鍵開始遊戲', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#cccccc'
      });
      
      // 初始化分數顯示
      this.initScoreDisplay();
      
      // 顯示開始遊戲提示
      this.showStartPrompt();
      
      // 重設移動計時器
      this.moveTime = 0;

      // 初始化遊戲物件群組
      this.gameObjects.gameOverGroup = this.add.group();
    }
  
    update(time, delta) {
      // 如果遊戲結束，等待重新開始指令
      if (this.gameOver) {
        // 檢查是否按下重新開始按鍵
        if (this.restartKey && this.restartKey.isDown) {
          this.restartGame();
        }
        return;
      }

      // 如果遊戲還未開始，檢查是否有按下方向鍵
      if (!this.gameStarted) {
        if (this.cursors.up.isDown || this.cursors.down.isDown || 
            this.cursors.left.isDown || this.cursors.right.isDown) {
          this.gameStarted = true;
          this.hideStartPrompt();
          this.controlsText.setText('使用方向鍵控制蛇的移動');
        }
        return;
      }
      
      // 重置方向變更標記 (為下一幀做準備)
      this.directionChanged = false;
      
      // 檢查鍵盤輸入
      this.handleKeyboardInput();
      
      // 移動蛇 (基於時間間隔)
      if (time >= this.moveTime) {
        this.moveSnake();
        // 設定下一次移動的時間
        this.moveTime = time + this.moveInterval;
      }
    }
    
    // 繪製網格背景的方法
    createGrid() {
      // 創建一個圖形物件來繪製網格線
      this.graphics = this.add.graphics();
      this.graphics.lineStyle(1, COLORS.GRID, 0.8);
      
      // 繪製垂直線
      for (let x = 0; x <= this.gridWidth; x++) {
        this.graphics.moveTo(x * this.cellSize, 0);
        this.graphics.lineTo(x * this.cellSize, this.gridHeight * this.cellSize);
      }
      
      // 繪製水平線
      for (let y = 0; y <= this.gridHeight; y++) {
        this.graphics.moveTo(0, y * this.cellSize);
        this.graphics.lineTo(this.gridWidth * this.cellSize, y * this.cellSize);
      }
      
      // 實際繪製線條
      this.graphics.strokePath();
    }
    
    // 創建初始蛇身
    createSnake() {
      // 清空現有蛇身
      this.snake = [];
      this.snakeBodyGroup.clear(true, true);
      
      // 設定起始位置 (中間偏左)
      const startX = Math.floor(this.gridWidth / 4);
      const startY = Math.floor(this.gridHeight / 2);
      
      // 創建長度為 3 的蛇
      this.snake.push({ x: startX, y: startY });       // 蛇頭
      this.snake.push({ x: startX - 1, y: startY });   // 第二節
      this.snake.push({ x: startX - 2, y: startY });   // 第三節
      
      // 繪製蛇身
      this.drawSnake();
      
      // 設定初始方向 (向右)
      this.direction = DIRECTIONS.RIGHT;
    }
    
    // 繪製蛇身到畫面上
    drawSnake() {
      // 先清除之前的繪製
      this.snakeBodyGroup.clear(true, true);
      
      // 繪製蛇的每個節段
      this.snake.forEach((segment, index) => {
        const pixelX = segment.x * this.cellSize;
        const pixelY = segment.y * this.cellSize;
        
        // 蛇頭和蛇身使用不同顏色
        const color = index === 0 ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
        
        // 創建一個稍小於格子的矩形 (增加視覺間隔)
        const padding = 2;
        const rectangle = this.add.rectangle(
          pixelX + this.cellSize / 2, 
          pixelY + this.cellSize / 2, 
          this.cellSize - padding, 
          this.cellSize - padding, 
          color
        );
        
        // 將矩形加入群組方便管理
        this.snakeBodyGroup.add(rectangle);
      });
    }
    
    // 修改：設定鍵盤控制，加入重新開始按鍵
    setupKeyboardControls() {
      this.cursors = this.input.keyboard.createCursorKeys();
      
      // 設定空白鍵作為重新開始按鍵
      this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    // 新增：處理鍵盤輸入並更新方向
    handleKeyboardInput() {
      // 如果在這一幀中已經改變了方向，就不再處理輸入
      if (this.directionChanged) {
        return;
      }
      
      // 當前方向的名稱 (用於檢查相反方向)
      let currentDirectionName = '';
      Object.keys(DIRECTIONS).forEach(key => {
        if (DIRECTIONS[key].x === this.direction.x && 
            DIRECTIONS[key].y === this.direction.y) {
          currentDirectionName = key;
        }
      });
      
      // 檢查方向鍵並更新方向
      if (this.cursors.up.isDown && currentDirectionName !== 'DOWN') {
        this.nextDirection = DIRECTIONS.UP;
        this.directionChanged = true;
        this.showDirectionChange('UP');
      }
      else if (this.cursors.down.isDown && currentDirectionName !== 'UP') {
        this.nextDirection = DIRECTIONS.DOWN;
        this.directionChanged = true;
        this.showDirectionChange('DOWN');
      }
      else if (this.cursors.left.isDown && currentDirectionName !== 'RIGHT') {
        this.nextDirection = DIRECTIONS.LEFT;
        this.directionChanged = true;
        this.showDirectionChange('LEFT');
      }
      else if (this.cursors.right.isDown && currentDirectionName !== 'LEFT') {
        this.nextDirection = DIRECTIONS.RIGHT;
        this.directionChanged = true;
        this.showDirectionChange('RIGHT');
      }
    }
    
    // 新增：顯示方向變更的視覺反饋 (可選)
    showDirectionChange(direction) {
      console.log(`方向改變: ${direction}`);
      // 可以在這裡添加額外的視覺反饋，比如箭頭指示或蛇頭旋轉等
    }
    
    // 修改：移動蛇的方法，加入碰撞檢測
    moveSnake() {
      // 更新當前方向為下一步方向
      this.direction = this.nextDirection;
      
      // 計算蛇頭的新位置
      const head = { ...this.snake[0] };
      head.x += this.direction.x;
      head.y += this.direction.y;
      
      // 將新的頭部添加到蛇的前面
      this.snake.unshift(head);
      
      // 檢查是否吃到食物
      const ate = this.checkFoodCollision();
      
      // 如果沒有吃到食物，移除尾巴 (保持長度不變)
      if (!ate) {
        this.snake.pop();
      }
      
      // 檢查是否發生碰撞 (邊界或自身)
      if (this.checkCollision()) {
        this.gameOver = true;
        this.showGameOver();
        return;
      }
      
      // 重新繪製蛇
      this.drawSnake();
    }
    
    // 新增：檢查碰撞 (邊界和自身)
    checkCollision() {
      const head = this.snake[0];
      
      // 檢查是否撞到邊界
      if (head.x < 0 || head.x >= this.gridWidth || 
          head.y < 0 || head.y >= this.gridHeight) {
        console.log('撞到邊界！遊戲結束');
        return true;
      }
      
      // 檢查是否撞到自己的身體 (從第二節開始檢查)
      // 注意：蛇身長度至少要 5 節才有可能撞到自己
      for (let i = 1; i < this.snake.length; i++) {
        if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
          console.log('撞到自己！遊戲結束');
          return true;
        }
      }
      
      // 沒有發生碰撞
      return false;
    }
    
    // 修改：顯示遊戲結束訊息
    showGameOver() {
      // 清空舊的遊戲結束畫面（以防有殘留）
      this.gameObjects.gameOverGroup.clear(true, true);
      
      // 添加半透明黑色背景
      const overlay = this.add.rectangle(
        this.gridWidth * this.cellSize / 2,
        this.gridHeight * this.cellSize / 2,
        this.gridWidth * this.cellSize,
        this.gridHeight * this.cellSize,
        0x000000,
        0.7
      );
      this.gameObjects.gameOverGroup.add(overlay);
      
      // 添加遊戲結束文字
      const gameOverText = this.add.text(
        this.gridWidth * this.cellSize / 2,
        this.gridHeight * this.cellSize / 2 - 80,
        '遊戲結束',
        {
          fontFamily: 'Arial',
          fontSize: '48px',
          color: '#ff0000',
          fontWeight: 'bold'
        }
      ).setOrigin(0.5);
      this.gameObjects.gameOverGroup.add(gameOverText);
      
      // 顯示最終分數
      const finalScoreText = this.add.text(
        this.gridWidth * this.cellSize / 2,
        this.gridHeight * this.cellSize / 2 - 20,
        `最終分數: ${this.score}`,
        {
          fontFamily: 'Arial',
          fontSize: '32px',
          color: '#ffffff'
        }
      ).setOrigin(0.5);
      this.gameObjects.gameOverGroup.add(finalScoreText);
      
      // 提示重新開始的文字
      const restartText = this.add.text(
        this.gridWidth * this.cellSize / 2,
        this.gridHeight * this.cellSize / 2 + 50,
        '按空白鍵重新開始遊戲',
        {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#ffffff'
        }
      ).setOrigin(0.5);
      this.gameObjects.gameOverGroup.add(restartText);
      
      // 讓重新開始的文字閃爍，增加視覺提示
      this.tweens.add({
        targets: restartText,
        alpha: 0.5,
        duration: 500,
        ease: 'Power1',
        yoyo: true,
        repeat: -1
      });
    }
    
    // 完全重寫：重新開始遊戲方法，徹底解決畫面殘留問題
    restartGame() {
      console.log('重新開始遊戲');
      
      // 清除遊戲結束相關的物件
      if (this.gameObjects.gameOverGroup) {
        this.gameObjects.gameOverGroup.clear(true, true);
      }
      
      // 重置遊戲狀態
      this.gameOver = false;
      this.gameStarted = true;
      this.score = 0;
      
      // 重置方向
      this.direction = DIRECTIONS.RIGHT;
      this.nextDirection = DIRECTIONS.RIGHT;
      this.directionChanged = false;
      
      // 重設分數顯示
      if (this.scoreText) {
        this.scoreText.setText(`分數: ${this.score}`);
      }
      
      // 重置控制提示
      if (this.controlsText) {
        this.controlsText.setText('使用方向鍵控制蛇的移動');
      }
      
      // 清除舊的蛇和食物
      if (this.snakeBodyGroup) {
        this.snakeBodyGroup.clear(true, true);
      }
      if (this.food) {
        this.food.destroy();
      }
      
      // 重新創建蛇和食物
      this.createSnake();
      this.generateFood();
      
      // 重設移動計時器
      this.moveTime = 0;
    }
    
    // 新增：生成食物的方法
    generateFood() {
      // 如果之前有食物，先移除
      if (this.food) {
        this.food.destroy();
      }
      
      // 找一個沒有蛇的位置放食物
      let validPosition = false;
      let x, y;
      
      while (!validPosition) {
        // 隨機生成座標
        x = Phaser.Math.Between(0, this.gridWidth - 1);
        y = Phaser.Math.Between(0, this.gridHeight - 1);
        
        // 確保這個位置沒有蛇的身體
        validPosition = true;
        for (const segment of this.snake) {
          if (segment.x === x && segment.y === y) {
            validPosition = false;
            break;
          }
        }
      }
      
      // 保存食物位置
      this.foodPosition = { x, y };

      // 隨機選擇一個假名
      const randomIndex = Phaser.Math.Between(0, HIRAGANA_DATA.A_GYOU.length - 1);
      const hiragana = HIRAGANA_DATA.A_GYOU[randomIndex].hiragana;
      
      // 創建食物文字
      const foodX = x * this.cellSize + this.cellSize / 2;
      const foodY = y * this.cellSize + this.cellSize / 2;
      this.food = this.add.text(foodX, foodY, hiragana, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ff0000'
      }).setOrigin(0.5);
      
      console.log(`生成食物於: (${x}, ${y}), 假名: ${hiragana}`);
    }
    
    // 新增：檢查蛇頭是否吃到食物
    checkFoodCollision() {
      const head = this.snake[0];
      
      // 檢查蛇頭是否與食物位置重疊
      if (head.x === this.foodPosition.x && head.y === this.foodPosition.y) {
        console.log('吃到食物了!');
        
        // 更新分數
        this.updateScore(GAME_SETTINGS.POINTS_PER_FOOD);
        
        // 生成新的食物
        this.generateFood();
        
        // 返回 true 表示吃到了食物 (蛇身會變長)
        return true;
      }
      
      // 沒吃到食物
      return false;
    }
    
    // 新增：初始化分數顯示
    initScoreDisplay() {
      // 遊戲標題的位置在左上角，我們把分數放在右上角
      this.scoreText = this.add.text(
        this.gridWidth * this.cellSize - 10, 
        10, 
        `分數: ${this.score}`, 
        {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: '#ffffff',
          align: 'right'
        }
      ).setOrigin(1, 0); // 右對齊
    }
    
    // 新增：更新分數顯示
    updateScore(points) {
      this.score += points;
      this.scoreText.setText(`分數: ${this.score}`);
      
      // 在蛇頭位置顯示得分動畫 (可選)
      this.showPointsAnimation(points);
    }
    
    // 新增：顯示得分動畫 (可選的視覺效果)
    showPointsAnimation(points) {
      if (points <= 0) return;
      
      // 獲取蛇頭位置
      const head = this.snake[0];
      const x = head.x * this.cellSize + this.cellSize / 2;
      const y = head.y * this.cellSize;
      
      // 創建一個浮動的分數文字
      const pointsText = this.add.text(x, y, `+${points}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffff00',
        fontWeight: 'bold'
      }).setOrigin(0.5, 0.5);
      
      // 添加一個簡單的動畫效果
      this.tweens.add({
        targets: pointsText,
        y: y - 30,        // 向上飄動
        alpha: 0,         // 漸漸消失
        duration: 1000,   // 動畫持續時間
        ease: 'Power1',
        onComplete: () => {
          pointsText.destroy(); // 動畫結束後移除文字
        }
      });
    }
    
    // 新增：顯示開始遊戲提示
    showStartPrompt() {
      this.startPrompt = this.add.text(
        this.gridWidth * this.cellSize / 2,
        this.gridHeight * this.cellSize / 2,
        '按任意方向鍵開始遊戲',
        {
          fontFamily: 'Arial',
          fontSize: '28px',
          color: '#ffffff'
        }
      ).setOrigin(0.5);
      
      // 讓提示文字閃爍
      this.tweens.add({
        targets: this.startPrompt,
        alpha: 0.5,
        duration: 700,
        ease: 'Power1',
        yoyo: true,
        repeat: -1
      });
    }
    
    // 新增：隱藏開始遊戲提示
    hideStartPrompt() {
      if (this.startPrompt) {
        this.startPrompt.destroy();
        this.startPrompt = null;
      }
    }
  }
  
  const config = {
    type: Phaser.AUTO,
    width: CELL_SIZE * GRID_WIDTH,
    height: CELL_SIZE * GRID_HEIGHT,
    backgroundColor: '#000000',
    scene: [SnakeScene],
    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
    }
  };
  
  const game = new Phaser.Game(config);
