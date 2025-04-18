class SnakeScene extends Phaser.Scene {
    constructor() {
      super({ key: 'SnakeScene' });
    }
  
    preload() {
      // 載入資源位置（目前不使用）
    }
  
    create() {
      this.add.text(10, 10, '🐍 貪食蛇遊戲骨架已載入', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff'
      });
    }
  
    update(time, delta) {
      // 遊戲主迴圈邏輯會放這邊（目前留空）
    }
  }
  
  const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 400,
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
  