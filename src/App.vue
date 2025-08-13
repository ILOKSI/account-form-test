<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="router__box">
    <RouterView/>
  </div>
</template>

<style scoped>
.router__box{
  display: flex;
  margin: 0 auto;
  width: 90vw;
  flex-direction: column;
  align-items: center;
}
</style>
