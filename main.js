// 網格系統的全局配置
const CELL_SIZE = 25;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 20;

// 顏色設定
const COLORS = {
  SNAKE_HEAD: 0x00ff00, // 綠色蛇頭
  SNAKE_BODY: 0x00cc00, // 深綠色蛇身
  GRID: 0x333333      // 網格顏色
};

// 方向設定
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
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
      this.snakeBodyGroup = null; // 用於存放蛇身體的 Group
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
      
      this.add.text(10, 10, '🐍 貪食蛇遊戲', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff'
      });
    }
  
    update(time, delta) {
      // 遊戲主迴圈邏輯會放這邊（目前留空）
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
