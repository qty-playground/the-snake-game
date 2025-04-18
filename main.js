// 網格系統的全局配置
const CELL_SIZE = 25;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 20;

class SnakeScene extends Phaser.Scene {
    constructor() {
      super({ key: 'SnakeScene' });
      // 網格系統設定，使用全局配置
      this.cellSize = CELL_SIZE;
      this.gridWidth = GRID_WIDTH;
      this.gridHeight = GRID_HEIGHT;
    }
  
    preload() {
      // 載入資源位置（目前不使用）
    }
  
    create() {
      // 繪製網格背景
      this.createGrid();
      
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
      this.graphics.lineStyle(1, 0x333333, 0.8);
      
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
