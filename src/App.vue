<!-- <template>
  <router-view />
</template> -->

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-900">
    <!-- 顶部 Logo 区 -->
    <header class="flex items-center px-6 py-4 shadow bg-white">
      <img src="./assets/roquetee-logo.jpg" alt="Logo" class="h-15 w-auto" />
    </header>

    <!-- 页面主内容 -->
    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>


<script>
  export default {};
</script>
