# 🐍 貪食蛇遊戲 v2：日文學習版

---

## ✅ 開發進度 Checklist（あ行版）

- [ ] 第 1 步：設計日文字母資料結構
- [ ] 第 2 步：修改食物系統為假名顯示
- [ ] 第 3 步：實作題目生成與顯示機制
- [ ] 第 4 步：修改碰撞與得分邏輯
- [ ] 第 5 步：添加視覺反饋與音效
- [ ] 第 6 步：優化 UI 介面與使用體驗
- [ ] 第 7 步：實作學習進度追蹤
- [ ] 第 8 步：測試與調整遊戲平衡性

---

## 🧩 各階段任務說明與注意事項

### 第 1 步：設計日文字母資料結構

📌 **目標**
- 創建あ行假名資料（あ、い、う、え、お）
- 建立假名與羅馬字的對應關係
- 設計資料結構方便後續擴展其他假名行

🔧 **技術提示**
- 使用 JavaScript 物件或陣列存儲假名資料
- 為每個假名準備相應的羅馬字、音訊檔名等資訊

⚠️ **注意事項**
- 確保假名使用正確的 Unicode 編碼
- 設計資料結構時考慮未來擴展性（加入其他假名行）
- 可以加入難度分級信息，方便後續實作難度遞增

**參考程式碼結構**
```javascript
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
```

---

### 第 2 步：修改食物系統為假名顯示

📌 **目標**
- 將食物由單一圖形改為顯示日文假名
- 在遊戲場上同時顯示多個假名食物
- 確保假名顯示清晰易讀

🔧 **技術提示**
- 使用 Phaser 的 `Text` 對象替代原來的圓形食物
- 創建食物群組管理多個食物
- 可使用背景色突出假名，增強可讀性

⚠️ **注意事項**
- 字體大小要適中，不能超出格子範圍
- 確保所選字體支援日文顯示
- 不同假名食物應避免重疊或過於接近
- 保存每個食物的假名信息，用於後續判斷

**參考程式碼結構**
```javascript
generateFoodItems(count = 3) {
  // 清除現有食物
  this.foodGroup.clear(true, true);
  this.foodItems = [];
  
  // 從假名池中隨機選擇不重複的假名
  const selectedHiragana = this.getRandomUniqueHiragana(count);
  
  for (const hiraganaObj of selectedHiragana) {
    // 找一個沒有蛇的位置
    const position = this.findEmptyPosition();
    
    // 創建食物顯示
    const foodBackground = this.add.rectangle(
      position.x * this.cellSize + this.cellSize / 2,
      position.y * this.cellSize + this.cellSize / 2,
      this.cellSize - 2,
      this.cellSize - 2,
      0xFFFFFF
    );
    
    const foodText = this.add.text(
      position.x * this.cellSize + this.cellSize / 2,
      position.y * this.cellSize + this.cellSize / 2,
      hiraganaObj.hiragana,
      {
        fontFamily: '"Noto Sans JP", Arial, sans-serif',
        fontSize: '20px',
        color: '#000000'
      }
    ).setOrigin(0.5);
    
    // 保存食物資訊
    this.foodItems.push({
      gridX: position.x,
      gridY: position.y,
      hiragana: hiraganaObj.hiragana,
      romaji: hiraganaObj.romaji,
      background: foodBackground,
      text: foodText
    });
    
    // 加入到食物群組
    this.foodGroup.add(foodBackground);
    this.foodGroup.add(foodText);
  }
}
```

---

### 第 3 步：實作題目生成與顯示機制

📌 **目標**
- 生成隨機題目（要求玩家尋找特定假名）
- 在遊戲界面清晰顯示當前題目
- 當玩家完成題目後，生成新的題目

🔧 **技術提示**
- 使用 Phaser 的 `Text` 對象顯示題目
- 可添加視覺效果突出題目區域
- 可選擇添加題目音效提示

⚠️ **注意事項**
- 題目顯示位置不應干擾遊戲視野
- 生成新題目時避免與場上已有食物重複
- 考慮提供多種提示方式（羅馬字、發音等）

**參考程式碼結構**
```javascript
// 設定新的題目
setNewQuestion() {
  // 如果場上有食物，從中選一個作為題目
  if (this.foodItems.length > 0) {
    const randomIndex = Phaser.Math.Between(0, this.foodItems.length - 1);
    this.currentQuestion = this.foodItems[randomIndex];
    
    // 更新題目顯示
    this.questionText.setText(`請找出: ${this.currentQuestion.romaji}`);
    
    // 可選：播放音效
    // this.sound.play(this.currentQuestion.sound);
  } else {
    // 食物為空時的處理邏輯
    this.generateFoodItems();
    this.setNewQuestion();
  }
}
```

---

### 第 4 步：修改碰撞與得分邏輯

📌 **目標**
- 修改碰撞檢測以支援多個食物
- 根據玩家吃到的假名是否正確來決定得分
- 吃到正確假名後更新題目，繼續遊戲

🔧 **技術提示**
- 擴展現有的 `checkFoodCollision` 方法
- 添加判斷機制確認答案正確性
- 正確/錯誤答案給予不同反饋

⚠️ **注意事項**
- 正確回答：加分、蛇身變長
- 錯誤回答：考慮是否懲罰（如不增加長度或減速）
- 食物吃完後的處理邏輯
- 避免在一次更新中處理多個碰撞

**參考程式碼結構**
```javascript
checkFoodCollisions() {
  const head = this.snake[0];
  
  for (let i = 0; i < this.foodItems.length; i++) {
    const food = this.foodItems[i];
    
    if (head.x === food.gridX && head.y === food.gridY) {
      // 判斷是否吃到正確假名
      const isCorrect = food.hiragana === this.currentQuestion.hiragana;
      
      if (isCorrect) {
        // 回答正確
        this.score += GAME_SETTINGS.POINTS_PER_CORRECT;
        this.showFeedback(true);
        // 更新分數顯示
        this.scoreText.setText(`分數: ${this.score}`);
      } else {
        // 回答錯誤
        this.showFeedback(false);
        // 可選擇添加懲罰
      }
      
      // 移除吃掉的食物
      food.background.destroy();
      food.text.destroy();
      this.foodItems.splice(i, 1);
      
      // 如果食物吃完了，生成新的食物
      if (this.foodItems.length === 0) {
        this.generateFoodItems();
      }
      
      // 設定新的題目
      this.setNewQuestion();
      
      // 如果答對了才增加蛇的長度
      return isCorrect;
    }
  }
  
  return false;
}
```

---

### 第 5 步：添加視覺反饋與音效

📌 **目標**
- 添加視覺效果顯示答案正確/錯誤
- 加入音效增強學習體驗
- 讓遊戲反饋更加生動有趣

🔧 **技術提示**
- 使用 Phaser 的動畫效果（如 Tween）
- 載入並播放對應的音效
- 考慮添加假名的發音

⚠️ **注意事項**
- 視覺效果不應過度干擾遊戲進行
- 音效大小要適中
- 考慮提供音效開關選項

**參考程式碼結構**
```javascript
// 顯示正確或錯誤的反饋
showFeedback(isCorrect) {
  const feedbackText = this.add.text(
    this.gridWidth * this.cellSize / 2,
    this.gridHeight * this.cellSize / 2,
    isCorrect ? '正確!' : '錯誤!',
    {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: isCorrect ? '#00ff00' : '#ff0000',
      fontWeight: 'bold'
    }
  ).setOrigin(0.5).setAlpha(0);
  
  // 播放音效
  this.sound.play(isCorrect ? 'correct' : 'wrong');
  
  // 顯示動畫
  this.tweens.add({
    targets: feedbackText,
    alpha: 1,
    y: this.gridHeight * this.cellSize / 2 - 50,
    duration: 500,
    ease: 'Power1',
    yoyo: true,
    onComplete: () => {
      feedbackText.destroy();
    }
  });
}

// 預加載音效
preload() {
  // 載入音效
  this.load.audio('correct', 'assets/sounds/correct.mp3');
  this.load.audio('wrong', 'assets/sounds/wrong.mp3');
  
  // 載入假名發音
  for (const hiraganaObj of HIRAGANA_DATA.A_GYOU) {
    this.load.audio(hiraganaObj.romaji, `assets/sounds/${hiraganaObj.sound}`);
  }
}
```

---

### 第 6 步：優化 UI 介面與使用體驗

📌 **目標**
- 改進遊戲 UI，使其更符合學習主題
- 添加假名參考表格
- 優化遊戲開始和結束畫面

🔧 **技術提示**
- 設計清晰的教學元素
- 添加遊戲暫停功能
- 考慮添加難度選項

⚠️ **注意事項**
- UI 應簡潔易懂
- 確保學習元素不影響遊戲流暢性
- 提供足夠的遊戲引導

**參考程式碼結構**
```javascript
// 創建學習參考表
createHiraganaReference() {
  // 創建背景
  const refBackground = this.add.rectangle(
    this.gridWidth * this.cellSize + 20,
    10,
    150,
    HIRAGANA_DATA.A_GYOU.length * 30 + 40,
    0x333333,
    0.8
  ).setOrigin(0, 0);
  
  // 添加標題
  this.add.text(
    this.gridWidth * this.cellSize + 95,
    25,
    'あ行參考',
    {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }
  ).setOrigin(0.5, 0);
  
  // 繪製各假名及其羅馬字
  for (let i = 0; i < HIRAGANA_DATA.A_GYOU.length; i++) {
    const hiraganaObj = HIRAGANA_DATA.A_GYOU[i];
    
    this.add.text(
      this.gridWidth * this.cellSize + 50,
      50 + i * 30,
      hiraganaObj.hiragana,
      {
        fontFamily: '"Noto Sans JP", Arial, sans-serif',
        fontSize: '20px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    this.add.text(
      this.gridWidth * this.cellSize + 120,
      50 + i * 30,
      hiraganaObj.romaji,
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
  }
}
```

---

### 第 7 步：實作學習進度追蹤

📌 **目標**
- 記錄玩家學習每個假名的正確率
- 提供學習進度統計
- 根據學習進度調整出題頻率

🔧 **技術提示**
- 使用 localStorage 存儲學習數據
- 設計簡單的進度顯示界面
- 實作智能出題算法

⚠️ **注意事項**
- 不要過度強調學習數據，保持遊戲的樂趣
- 提供重置學習數據的選項
- 考慮不同難度級別的進度分開記錄

**參考程式碼結構**
```javascript
// 更新學習進度
updateLearningProgress(hiragana, isCorrect) {
  // 從 localStorage 獲取現有進度
  let progress = localStorage.getItem('hiraganaProgress');
  if (!progress) {
    progress = {};
  } else {
    progress = JSON.parse(progress);
  }
  
  // 初始化該假名的數據（如果不存在）
  if (!progress[hiragana]) {
    progress[hiragana] = {
      correct: 0,
      attempts: 0
    };
  }
  
  // 更新統計
  progress[hiragana].attempts++;
  if (isCorrect) {
    progress[hiragana].correct++;
  }
  
  // 保存回 localStorage
  localStorage.setItem('hiraganaProgress', JSON.stringify(progress));
}

// 基於學習進度智能出題
smartQuestionSelection() {
  let progress = localStorage.getItem('hiraganaProgress');
  if (!progress) {
    // 沒有學習記錄，隨機出題
    return this.getRandomHiragana();
  }
  
  progress = JSON.parse(progress);
  
  // 計算每個假名的正確率
  const hiraganaWithWeights = HIRAGANA_DATA.A_GYOU.map(h => {
    const data = progress[h.hiragana] || { correct: 0, attempts: 0 };
    const correctRate = data.attempts ? data.correct / data.attempts : 0;
    
    // 正確率低的假名有更高權重被選中
    return {
      ...h,
      weight: 1 - correctRate
    };
  });
  
  // 基於權重選擇假名
  // ...權重選擇算法實現
}
```

---

### 第 8 步：測試與調整遊戲平衡性

📌 **目標**
- 測試遊戲流暢性與學習效果
- 調整遊戲難度和節奏
- 優化整體用戶體驗

🔧 **技術提示**
- 收集使用者反饋
- 微調遊戲參數（如蛇速度、食物數量等）
- 考慮添加更多獎勵機制

⚠️ **注意事項**
- 平衡遊戲難度與學習曲線
- 確保初學者也能輕鬆上手
- 提供足夠的挑戰性以保持興趣

**最終檢查清單**
- [ ] 遊戲基本機制是否流暢
- [ ] 假名顯示是否清晰可讀
- [ ] 學習機制是否有效
- [ ] 遊戲速度是否適中
- [ ] 視覺和音效是否合適
- [ ] UI 是否直觀易用
- [ ] 進度保存是否正常工作
- [ ] 不同裝置上的兼容性

---

## 🛠 技術備註

| 項目 | 說明 |
|------|------|
| **字體選擇** | 推薦使用支援日文的字體，如 "Noto Sans JP"、"MS Gothic" 或 "Hiragino Kaku Gothic Pro" |
| **音效資源** | 考慮使用開源的日文發音資源或錄製專業發音 |
| **存儲方式** | 使用 localStorage 保存學習進度，確保資料持久化 |
| **效能優化** | 對於多個文字物件的渲染，注意可能的效能影響 |

---

## 🔄 未來擴展方向

1. **添加更多假名行**
   - か行 (ka, ki, ku, ke, ko)
   - さ行 (sa, shi, su, se, so)
   - ...

2. **加入片假名學習**
   - 實作平假名與片假名對應學習

3. **詞彙學習模式**
   - 從單字母擴展到簡單單詞

4. **進階遊戲模式**
   - 限時挑戰
   - 記憶模式（顯示假名後隱藏）

---

🎮 **享受開發！** 🎮