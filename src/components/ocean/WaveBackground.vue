<template>
  <div class="relative w-full h-full overflow-hidden">
    <!-- 背景渐变 -->
    <div class="absolute inset-0 bg-gradient-to-b from-ocean-deep to-ocean-light"></div>
    
    <!-- 水波纹效果 -->
    <div class="absolute inset-0 opacity-20">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
    </div>
  </div>
</template>

<style scoped>
.wave {
  position: absolute;
  left: 0;
  width: 200%;
  height: 100%;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxRTI5M0IiLz48cGF0aCBkPSJNNTAgMjBDNzAgMjAgODAgMzAgODAgNTBDODAgNzAgNzAgODAgNTAgODBDMzAgODAgMjAgNzAgMjAgNTBDMjAgMzAgMzAgMjAgNTAgMjBaTTIwIDUwQzIwIDMwIDMwIDIwIDUwIDIwQzcwIDIwIDgwIDMwIDgwIDUwQzgwIDcwIDcwIDgwIDUwIDUwQzMwIDUwIDIwIDMwIDIwIDUwWiIgZmlsbD0iIzEwQjk4MSIgZmlsbC1vcGFjaXR5PSIwLjEiLz48cGF0aCBkPSJNODAgNTBDODAgMzAgOTAgMjAgMTEwIDIwQzEzMCAyMCAxNDAgMzAgMTQwIDUwQzE0MCA3MCAxMzAgODAgMTEwIDgwQzkwIDgwIDgwIDcwIDgwIDUwWiIgZmlsbD0iIzMwODJGNiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=') repeat-x;
  background-size: 50% 100%;
}

.wave-1 {
  animation: wave-animation 20s linear infinite;
  bottom: 0;
  height: 30%;
}

.wave-2 {
  animation: wave-animation 30s linear infinite reverse;
  bottom: 10%;
  height: 25%;
}

.wave-3 {
  animation: wave-animation 25s linear infinite;
  bottom: 20%;
  height: 20%;
}

@keyframes wave-animation {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
