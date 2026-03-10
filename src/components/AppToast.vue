<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-80">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg bg-card pointer-events-auto"
          :class="{
            'border-green-500/40 bg-green-50 dark:bg-green-500/10': t.type === 'success',
            'border-red-500/40 bg-red-50 dark:bg-red-500/10': t.type === 'error',
            'border-blue-500/40 bg-blue-50 dark:bg-blue-500/10': t.type === 'info',
          }"
        >
          <span class="text-lg shrink-0 mt-0.5">
            <span v-if="t.type === 'success'">✓</span>
            <span v-else-if="t.type === 'error'">✕</span>
            <span v-else>ℹ</span>
          </span>
          <p
            class="text-sm font-medium flex-1"
            :class="{
              'text-green-800 dark:text-green-300': t.type === 'success',
              'text-red-800 dark:text-red-300': t.type === 'error',
              'text-blue-800 dark:text-blue-300': t.type === 'info',
            }"
          >{{ t.msg }}</p>
          <button
            @click="remove(t.id)"
            class="text-foreground/30 hover:text-foreground/60 transition text-xs shrink-0"
          >✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from "@/composables/useToast";
const { toasts, remove } = useToast();
</script>

<style scoped>
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(1rem); }
.toast-leave-to  { opacity: 0; transform: translateX(1rem); }
</style>
