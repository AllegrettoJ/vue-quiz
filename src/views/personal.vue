<template>
  <div class="min-h-screen bg-gray-50 px-4 py-6">
    <div class="max-w-screen-md mx-auto">
      <h1 class="text-2xl sm:text-3xl font-bold text-blue-900 mb-2 text-center">🎉 欢迎，{{ name }}！</h1>
      <p class="text-gray-600 mb-6 text-center">你的工号是 {{ employeeId }}</p>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center">
        <button @click="fetchRounds">每轮成绩</button>
        <button @click="fetchSummary">总成绩</button>
        <button @click="startQuiz">下一轮</button>
        <button @click="logout">退出</button>
      </div>

      <!-- 每轮成绩 -->
      <div v-if="showRounds" class="bg-white p-6 rounded shadow-md">
        <h2 class="text-xl font-bold mb-4">每轮成绩</h2>
        <div v-for="(r, i) in rounds" :key="i" class="mb-6">
          <h3 class="text-lg font-semibold mb-2">第 {{ i + 1 }} 轮</h3>
          <div class="grid grid-cols-5 sm:grid-cols-11 gap-2">
            <div
              v-for="(isCorrect, idx) in r.result"
              :key="idx"
              :class="isCorrect ? 'text-green-600 border-green-300 bg-green-50' : 'text-red-600 border-red-300 bg-red-50'"
              class="w-10 h-10 flex items-center justify-center rounded-md font-bold border text-sm"
            >
              {{ isCorrect ? '✔️' : '✘' }}
            </div>
            <div class="w-10 h-10 flex items-center justify-center rounded-md font-bold bg-blue-100 text-blue-800 border border-blue-300">
              {{ r.score }}
            </div>
          </div>
        </div>
      </div>

      <!-- 汇总成绩 -->
      <div v-if="showSummary" class="mt-8 bg-white p-6 rounded shadow-md">
        <h2 class="text-xl font-bold mb-4">汇总成绩</h2>
        <div class="space-y-6">
          <canvas id="barChart" class="w-full max-w-xl mx-auto"></canvas>
          <canvas id="pieChart" class="w-full max-w-xs mx-auto"></canvas>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-bold text-gray-700 mt-6">
          <div v-for="(s, idx) in summary.scores" :key="idx" class="p-4 bg-white rounded shadow">
            第{{ idx + 1 }}轮<br />
            <span class="text-xl text-blue-600">{{ s }} 分</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  data() {
    return {
      name: localStorage.getItem("employee_name") || "",
      employeeId: localStorage.getItem("employee_id") || "",
      rounds: [],
      summary: { labels: [], scores: [] },
      showRounds: false,
      showSummary: false,
      barChart: null,
      pieChart: null
    };
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push("/login");
    },
    async startQuiz() {
      const res = await fetch("https://employee-quiz-roquette.allegrettoj.workers.dev/next-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: this.employeeId })
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem("current_round", json.round);
        localStorage.setItem("questions", JSON.stringify(json.questions));
        this.$router.push("/quiz");
      } else {
        alert(json.message || "无法开始下一轮");
      }
    },
    async fetchRounds() {
      this.showRounds = false;
      this.rounds = [];
      const res = await fetch("https://employee-quiz-roquette.allegrettoj.workers.dev/fetch-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: this.employeeId })
      });
      const json = await res.json();
      if (json.success) {
        this.rounds = json.data.map((round) => {
          const selected = JSON.parse(round.selected);
          const correct = JSON.parse(round.correct);
          const ids = round.question_id.split(",");
          let score = 0;
          const result = ids.map((qid) => {
            const isCorrect = selected[qid] === correct[qid];
            if (isCorrect) score++;
            return isCorrect;
          });
          return { score, result };
        });
        this.showRounds = true;
        this.showSummary = false;
      }
    },
    async fetchSummary() {
      this.showSummary = false;
      const res = await fetch("https://employee-quiz-roquette.allegrettoj.workers.dev/summary-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: this.employeeId })
      });
      const json = await res.json();
      if (json.success) {
        this.summary = json.data;
        this.showRounds = false;
        this.showSummary = true;
        await this.$nextTick();         // 等待 DOM 完成渲染
        this.drawCharts();              // 然后再绘制图表
      }
    },
    drawCharts() {
      const ctx1 = document.getElementById("barChart");
      const ctx2 = document.getElementById("pieChart");

      if (!ctx1 || !ctx2) return; // 防止 DOM 尚未渲染

      if (this.barChart) this.barChart.destroy();
      if (this.pieChart) this.pieChart.destroy();

      this.barChart = new Chart(ctx1, {
        type: "bar",
        data: {
          labels: this.summary.labels,
          datasets: [{
            label: "正确情况",
            data: this.summary.scores,
            backgroundColor: "#60a5fa"
          }]
        },
        options: { responsive: true }
      });

      const total = this.summary.scores.reduce((a, b) => a + b, 0);
      const wrong = this.summary.scores.length * 10 - total;

      this.pieChart = new Chart(ctx2, {
        type: "pie",
        data: {
          labels: ["正确", "错误"],
          datasets: [{
            data: [total, wrong],
            backgroundColor: ["#34d399", "#f87171"]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    }
  }
};
</script>

<style>
canvas {
  max-width: 640px;
  margin: 0 auto;
}
</style>

