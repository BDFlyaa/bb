<template>
  <div class="ai-chat-wrapper">
    <!-- 聊天窗口 -->
    <div v-if="isOpen" class="chat-window glass-panel">
      <div class="chat-header">
        <div class="header-info">
          <div class="status-dot"></div>
          <h3>PureOcean AI 助手</h3>
        </div>
        <button class="close-chat" @click="toggleChat">&times;</button>
      </div>

      <div class="message-list" ref="messageListRef">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          :class="['message', msg.role]"
        >
          {{ msg.content }}
        </div>
        
        <div v-if="isLoading" class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="chat-input-area">
        <input 
          v-model="userInput" 
          type="text" 
          placeholder="问问我关于环保或项目的问题..." 
          @keyup.enter="sendMessage"
          :disabled="isLoading"
        />
        <button class="send-btn" @click="sendMessage" :disabled="isLoading || !userInput.trim()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>

    <!-- 悬浮按钮 -->
    <button :class="['ai-fab', { 'active': isOpen }]" @click="toggleChat">
      <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { 
  isOpen, 
  userInput, 
  isLoading, 
  messageListRef, 
  messages, 
  toggleChat, 
  sendMessage 
} from './AIChat';
</script>

<style scoped src="./AIChat.css"></style>
