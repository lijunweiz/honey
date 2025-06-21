<template>
  <div>
    <!-- 时钟容器 -->
    <div class="clock-container">
      <div class="date-display">{{ dateDisplay }}</div>
      <div class="time-display">
        {{ hoursDisplay }}:{{ minutesDisplay }}:{{ secondsDisplay }}
      </div>
      <div class="divider" />
      <div class="day-display">{{ dayDisplay }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Clock',
  data() {
    return {
      dateDisplay: '2025-01-01',
      dayDisplay: '星期日',
      hoursDisplay: '12',
      minutesDisplay: '10',
      secondsDisplay: '10'
    }
  },
  created() {
    this.updateDateTime()
    setInterval(this.updateDateTime, 1000)
  },
  methods: {
    // 更新日期和时间
    updateDateTime() {
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      const now = new Date()
      // 更新日期
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      this.dateDisplay = year + '年' + month + '月' + day + '日'
      // 更新时间
      this.hoursDisplay = now.getHours().toString().padStart(2, '0')
      this.minutesDisplay = now.getMinutes().toString().padStart(2, '0')
      this.secondsDisplay = now.getSeconds().toString().padStart(2, '0')
      // 更新星期
      this.dayDisplay = days[now.getDay()]
    }
  }
}
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  color: #fff;
}

/* 背景装饰元素 */
.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  z-index: -1;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #e94560, #ff7b54);
  top: 10%;
  left: 10%;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(45deg, #533483, #1f4068);
  bottom: 5%;
  right: 15%;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #00b4d8, #90e0ef);
  top: 50%;
  left: 5%;
}

/* 时钟容器 */
.clock-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 20px;
  text-align: center;
  width: 90%;
  max-width: 500px;
  transition: transform 0.3s ease;
}

.clock-container:hover {
  transform: translateY(-5px);
}

/* 日期显示 */
.date-display {
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 时间显示 */
.time-display {
  font-size: 5.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(to right, #ffffff, #d6e4ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 2px;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

/* 秒数动画 */
.seconds {
  display: inline-block;
  min-width: 70px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.seconds.animate {
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 星期显示 */
.day-display {
  font-size: 1.5rem;
  font-weight: 400;
  margin-top: 15px;
  color: #90e0ef;
  text-transform: uppercase;
  letter-spacing: 3px;
}

/* 装饰分隔线 */
.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent);
  margin: 25px auto;
  width: 80%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .clock-container {
    padding: 30px 20px;
  }

  .date-display {
    font-size: 1.5rem;
  }

  .time-display {
    font-size: 4rem;
  }

  .day-display {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .time-display {
    font-size: 3rem;
  }

  .date-display {
    font-size: 1.2rem;
  }
}
</style>
