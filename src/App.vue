<template>
  <div class="app">
    <h1>弹幕上墙</h1>
    <p class="subtitle">发送弹幕，登上大屏幕</p>

    <!-- Nickname -->
    <div class="nick-area">
      <span v-if="!editingNick" class="nick-label">{{ nickname }}</span>
      <input
        v-else
        ref="nickInput"
        v-model="nickname"
        class="nick-input"
        maxlength="8"
        @blur="saveNick"
        @keyup.enter="saveNick"
      />
      <button class="nick-edit" @click="editNick">{{ editingNick ? '✓' : '✎' }}</button>
    </div>

    <div class="type-tabs">
      <button
        v-for="t in types"
        :key="t.value"
        :class="['type-btn', { active: msgType === t.value }]"
        @click="msgType = t.value"
      >
        {{ t.label }}
      </button>
    </div>

    <input
      v-model="text"
      @keyup.enter="send"
      :placeholder="placeholder"
      maxlength="40"
    />
    <button :disabled="cooldown > 0" @click="send">
      {{ cooldown > 0 ? `请稍等 ${cooldown}s` : '发 送' }}
    </button>
    <p class="toast">{{ toast }}</p>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { send as bridgeSend } from "./bridge";

const BANNED = ["广告", "微信", "QQ", "加群", "http", "www"];
const COOLDOWN_MS = 2000;
const MAX_LENGTH = 40;

const types = [
  { label: "普通", value: "normal" },
  { label: "👑 VIP", value: "vip" },
];
const msgType = ref("normal");
const text = ref("");
const toast = ref("");
const cooldown = ref(0);
let lastSend = 0;

// Nickname
const STORAGE_KEY = "danmu_nickname";
const nickInput = ref(null);

function randomNick() {
  return "观众" + Math.floor(1000 + Math.random() * 9000);
}

const nickname = ref(localStorage.getItem(STORAGE_KEY) || randomNick());
const editingNick = ref(false);

function editNick() {
  editingNick.value = !editingNick.value;
  if (editingNick.value) {
    nextTick(() => nickInput.value?.focus());
  }
}

function saveNick() {
  const trimmed = nickname.value.trim();
  if (!trimmed) {
    nickname.value = randomNick();
  } else {
    nickname.value = trimmed;
  }
  localStorage.setItem(STORAGE_KEY, nickname.value);
  editingNick.value = false;
}

const placeholder = computed(() => {
  return msgType.value === "vip" ? "VIP弹幕，金色特效..." : "说点什么...";
});

const send = async () => {
  const msg = text.value.trim();
  if (!msg) return;

  if (msg.length > MAX_LENGTH) {
    toast.value = `最多 ${MAX_LENGTH} 个字`;
    return;
  }

  const now = Date.now();
  if (now - lastSend < COOLDOWN_MS) {
    toast.value = "发太快了，稍等一下";
    return;
  }

  const lower = msg.toLowerCase();
  if (BANNED.some((w) => lower.includes(w.toLowerCase()))) {
    toast.value = "内容包含敏感词";
    return;
  }

  try {
    await bridgeSend(msg, msgType.value, nickname.value);
    toast.value = "发送成功！";
    text.value = "";

    lastSend = now;
    cooldown.value = 2;
    const timer = setInterval(() => {
      cooldown.value--;
      if (cooldown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch {
    toast.value = "发送失败，请重试";
  }
};
</script>
