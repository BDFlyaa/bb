import { ref, nextTick, watch } from 'vue';
import request from '../../utils/request';

export const isOpen = ref(false);
export const userInput = ref('');
export const isLoading = ref(false);
export const messageListRef = ref<HTMLElement | null>(null);

export interface Message {
  role: 'user' | 'ai';
  content: string;
}

export const messages = ref<Message[]>([
  { role: 'ai', content: '你好！我是 PureOcean AI 助手。有什么我可以帮你的吗？' }
]);

export const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

export const scrollToBottom = async () => {
  await nextTick();
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
};

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

export const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const content = userInput.value.trim();
  messages.value.push({ role: 'user', content });
  userInput.value = '';
  isLoading.value = true;

  try {
    const data: any = await request.post('/ai/chat', {
      messages: messages.value.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }))
    });

    const aiContent = data.choices[0].message.content;
    messages.value.push({ role: 'ai', content: aiContent });
  } catch (error: any) {
    console.error('Chat error:', error);
    const errorMsg = error.response?.data?.error || '抱歉，我现在遇到了一点问题，请稍后再试。';
    messages.value.push({ role: 'ai', content: errorMsg });
  } finally {
    isLoading.value = false;
  }
};
