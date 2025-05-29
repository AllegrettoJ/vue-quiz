<template>
  <div class="min-h-screen bg-white text-center p-10">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">📝 第 {{ round }} 轮答题</h2>

    <div v-if="loading" class="text-gray-500">题目加载中...</div>

    <form v-else @submit.prevent="submitAnswers" class="space-y-6 max-w-xl mx-auto text-left">
      <div v-for="(q, index) in questions" :key="q.id">
        <p class="mb-2 font-medium">Q{{ index + 1 }}. {{ q.title }}</p>
        <div class="space-y-1">
          <label
            v-for="opt in q.options"
            :key="opt"
            class="block border rounded px-4 py-2 hover:bg-blue-50"
          >
            <input
              type="radio"
              :name="q.id"
              :value="opt"
              v-model="selected[q.id]"
              class="mr-2"
              required
            />
            {{ opt }}
          </label>
        </div>
      </div>

      <!-- <button type="submit" class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded">提交本轮答题</button> -->
      <button type="submit" class="font-bold">提交本轮答题</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      employeeId: localStorage.getItem("employee_id"),
      name: localStorage.getItem("employee_name"),
      round: 0,
      questions: [],
      selected: {}, // 保存用户选择
      loading: true,
    };
  },
  async created() {
    const res = await fetch("https://employee-quiz-roquette.allegrettoj.workers.dev/next-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: this.employeeId }),
    });
    const json = await res.json();

    if (json.success) {
      this.questions = json.questions.map(q => {
        const options = [];
        if (q.option_a) options.push(`A. ${q.option_a}`);
        if (q.option_b) options.push(`B. ${q.option_b}`);
        if (q.option_c) options.push(`C. ${q.option_c}`);
        if (q.option_d) options.push(`D. ${q.option_d}`);

        return {
          ...q,
          title: q.question_text,
          options: shuffleArray(options),
          answer: { [q.id]: q.correct_option.toLowerCase() }
        };
      });

      this.round = json.round;
      this.loading = false;
    } else if (json.done) {
      this.$router.push("/done");
    }
  },
  methods: {
    async submitAnswers() {
      const selectedMap = {};
      const correctMap = {};
      const questionIds = [];
      let score = 0;

      this.questions.forEach(q => {
        const userChoice = this.selected[q.id];
        const correct = q.answer[q.id];
        if (!userChoice) return;

        // 提取用户选项的字母（例如 "B. 选项B" => "b"）
        const userLetter = userChoice.trim().charAt(0).toLowerCase();

        selectedMap[q.id] = userLetter;
        correctMap[q.id] = correct;
        questionIds.push(q.id);
        if (userLetter === correct) score++;
      });

      if (questionIds.length !== this.questions.length) {
        alert("请完成所有题目再提交");
        return;
      }

      const payload = {
        employee_id: this.employeeId,
        name: this.name,
        round: this.round,
        is_correct: score,
        selected: selectedMap,
        correct: correctMap,
        question_id: questionIds.join(",")
      };

      const res = await fetch("https://employee-quiz-roquette.allegrettoj.workers.dev/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        this.$router.push("/done");
      } else {
        alert(json.error || "提交失败，请稍后再试");
      }
    }
  }
};

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
</script>
