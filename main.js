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
  MIN_SPEED: 70       // 最快速度限制 (毫秒)
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
    }
  
    preload() {
      // 載入資源位置（目前不使用）
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
      this.add.text(10, this.cellSize * this.gridHeight - 30, '使用方向鍵控制蛇的移動', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#cccccc'
      });
      
      // 重設移動計時器
      this.moveTime = 0;
    }
  
    update(time, delta) {
      // 如果遊戲結束，不執行後續更新邏輯
      if (this.gameOver) {
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
    
    // 新增：設定鍵盤控制
    setupKeyboardControls() {
      this.cursors = this.input.keyboard.createCursorKeys();
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
    
    // 新增：顯示遊戲結束訊息
    showGameOver() {
      // 添加半透明黑色背景
      const overlay = this.add.rectangle(
        this.gridWidth * this.cellSize / 2,
        this.gridHeight * this.cellSize / 2,
        this.gridWidth * this.cellSize,
        this.gridHeight * this.cellSize,
        0x000000,
        0.7
      );
      
      // 添加遊戲結束文字
      const gameOverText = this.add.text(
        this.gridWidth * this.cellSize / 2,
        this.gridHeight * this.cellSize / 2 - 50,
        '遊戲結束',
        {
          fontFamily: 'Arial',
          fontSize: '48px',
          color: '#ff0000',
          fontWeight: 'bold'
        }
      ).setOrigin(0.5);
      
      // 簡易指示重新開始的文字 (第 8 步會完善此功能)
      const restartText = this.add.text(
        this.gridWidth * this.cellSize / 2,
        this.gridHeight * this.cellSize / 2 + 20,
        '請重新整理頁面以再次遊戲',
        {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#ffffff'
        }
      ).setOrigin(0.5);
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
      
      // 創建食物圖形
      const foodX = x * this.cellSize + this.cellSize / 2;
      const foodY = y * this.cellSize + this.cellSize / 2;
      this.food = this.add.circle(foodX, foodY, this.cellSize / 2 - 2, COLORS.FOOD);
      
      console.log(`生成食物於: (${x}, ${y})`);
    }
    
    // 新增：檢查蛇頭是否吃到食物
    checkFoodCollision() {
      const head = this.snake[0];
      
      // 檢查蛇頭是否與食物位置重疊
      if (head.x === this.foodPosition.x && head.y === this.foodPosition.y) {
        console.log('吃到食物了!');
        
        // 生成新的食物
        this.generateFood();
        
        // 返回 true 表示吃到了食物 (蛇身會變長)
        return true;
      }
      
      // 沒吃到食物
      return false;
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
