<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center p-6">
    <h1 class="text-3xl font-bold text-green-700 mb-4">🎉 已完成本轮测试</h1>
    <p class="text-gray-700 mb-6">感谢您的参与！您可以回到个人界面继续查看成绩或开始下一轮。</p>
    <router-link to="/personal">
      <button class="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded transition">
        返回个人主页
      </button>
    </router-link>
  </div>
</template>

<script>
export default {
  mounted() {
    // 防止用户刷新后重复进入上一轮
    localStorage.removeItem("questions");
    localStorage.removeItem("current_round");
  }
};
</script>
