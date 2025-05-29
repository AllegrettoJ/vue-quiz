<!-- src/views/Login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <form @submit.prevent="handleLogin" class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-blue-900">员工登录</h2>
      <label class="block mb-4">
        <span class="text-gray-900">姓名:</span>
        <input v-model="name" type="text" class="mt-1 block w-full rounded border-gray-300 shadow-sm" required />
      </label>
      <label class="block mb-4">
        <span class="text-gray-900">工号:</span>
        <input v-model="employeeId" type="text" class="mt-1 block w-full rounded border-gray-300 shadow-sm" required />
      </label>
      <!-- <button type="submit" class="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">登录</button> -->
      <button type="submit" class="w-full mt-4">登录</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      employeeId: ""
    };
  },
  methods: {
    async handleLogin() {
      const res = await fetch("https://employee-quiz-roquette.allegrettoj.workers.dev/employee-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: this.name, employee_id: this.employeeId })
      });
      const result = await res.json();
      if (result.success) {
        localStorage.setItem("employee_name", this.name);
        localStorage.setItem("employee_id", this.employeeId);
        localStorage.setItem("login_time", Date.now());
        this.$router.push("/personal");
      } else {
        alert("登录失败：" + result.error);
      }
    }
  }
};
</script>
