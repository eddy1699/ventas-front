<template>
  <div class="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
    <div class="w-full max-w-sm bg-card rounded-2xl border border-border shadow-xl p-6 space-y-5">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 text-lg font-bold shrink-0">✓</div>
        <div>
          <h2 class="font-semibold text-base">Boleta generada</h2>
          <p class="text-xs text-foreground/50">{{ total ? `Total: S/ ${Number(total).toFixed(2)}` : '' }}</p>
        </div>
      </div>

      <!-- Enviar al cliente -->
      <div class="space-y-3">
        <p class="text-xs text-foreground/60 font-medium uppercase tracking-wide">Enviar al cliente</p>

        <!-- WhatsApp -->
        <div class="flex gap-2">
          <input
            v-model="phone"
            type="tel"
            placeholder="Número de teléfono"
            class="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <a
            :href="whatsappUrl"
            target="_blank"
            :class="phone ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-border text-foreground/30 pointer-events-none'"
            class="px-3 py-2 rounded-lg text-sm font-medium transition shrink-0 flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WA
          </a>
        </div>

        <!-- Email -->
        <div class="flex gap-2">
          <input
            v-model="email"
            type="email"
            placeholder="Correo electrónico"
            class="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            @click="sendEmail"
            :disabled="!email || sendingEmail"
            :class="email && !sendingEmail ? 'bg-primary hover:opacity-90 text-white' : 'bg-border text-foreground/30'"
            class="px-3 py-2 rounded-lg text-sm font-medium transition shrink-0 flex items-center gap-1.5 disabled:cursor-not-allowed"
          >
            <svg v-if="sendingEmail" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,12 2,6"/>
            </svg>
            {{ sendingEmail ? '' : 'Enviar' }}
          </button>
        </div>

        <p v-if="emailSent" class="text-xs text-green-600 dark:text-green-400">Correo enviado correctamente</p>
        <p v-if="emailError" class="text-xs text-red-500">{{ emailError }}</p>
      </div>

      <!-- Ver PDF -->
      <a
        v-if="pdfUrl"
        :href="pdfUrl"
        target="_blank"
        class="flex items-center justify-center gap-2 w-full py-2 border border-border rounded-lg text-sm hover:bg-background/60 transition"
      >
        <svg class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17.5v-1h7v1h-7zm0-3v-1h7v1h-7zm0-3v-1H11v1H8.5z"/>
        </svg>
        Ver PDF
      </a>

      <!-- Cerrar -->
      <button
        @click="$emit('close')"
        class="w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition"
      >
        Listo
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import api from "@/api/axios";

const props = defineProps({
  pdfUrl: String,
  total: [Number, String],
  receiptId: [Number, String],
});
defineEmits(["close"]);

const phone = ref("");
const email = ref("");
const sendingEmail = ref(false);
const emailSent = ref(false);
const emailError = ref("");

const whatsappUrl = computed(() => {
  if (!phone.value || !props.pdfUrl) return "#";
  const num = phone.value.replace(/\D/g, "");
  const msg = `Hola, aquí está tu boleta: ${props.pdfUrl}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
});

async function sendEmail() {
  if (!email.value || !props.receiptId) return;
  sendingEmail.value = true;
  emailSent.value = false;
  emailError.value = "";
  try {
    await api.post(`/receipts/${props.receiptId}/send-email`, { to: email.value });
    emailSent.value = true;
    email.value = "";
  } catch (e) {
    emailError.value = e.response?.data?.error || "No se pudo enviar el correo";
  } finally {
    sendingEmail.value = false;
  }
}
</script>
