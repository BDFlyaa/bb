import { reactive, ref } from 'vue';
import { store } from '../../stores';

export const isSaving = ref(false);
export const isChangingPassword = ref(false);

export const form = reactive({
  name: '',
  avatar: '',
  bio: ''
});

export const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});

export const fileInput = ref<HTMLInputElement | null>(null);

export const initProfile = () => {
  if (store.user) {
    form.name = store.user.name || '';
    form.avatar = store.user.avatar || '';
    form.bio = store.user.bio || '';
  }
};

export const triggerFileInput = () => {
  fileInput.value?.click();
};

export const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    if (file.size > 2 * 1024 * 1024) { // 限制 2MB
      alert('图片大小不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        form.avatar = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }
};

export const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  // 图片加载失败时，清空 avatar 导致显示默认图标，或者替换为默认图
  // 这里简单处理：如果加载失败，不强制清空 form.avatar 以免用户输入一半被清空，
  // 而是让 img 标签隐藏（通过样式）或显示占位符。
  // 但在 Vue 中，直接操作 DOM 不推荐。
  // 我们可以设置一个本地状态来控制显示，或者干脆不做处理让它破图（不推荐）。
  // 简单策略：设为默认占位图的透明像素，显示背景
  target.style.display = 'none';
  if (target.parentElement) {
     const placeholder = document.createElement('div');
     placeholder.className = 'avatar-placeholder';
     placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
     target.parentElement.appendChild(placeholder);
  }
};

export const saveProfile = async () => {
  if (!form.name.trim()) {
    alert('昵称不能为空');
    return;
  }

  isSaving.value = true;
  
  try {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    store.updateProfile({
      name: form.name,
      avatar: form.avatar,
      bio: form.bio
    });
    
    alert('个人资料已更新');
  } catch (error) {
    console.error('保存失败', error);
    alert('保存失败，请重试');
  } finally {
    isSaving.value = false;
  }
};

export const changePassword = async () => {
  if (!passwordForm.currentPassword) {
    alert('请输入当前密码');
    return;
  }
  if (!passwordForm.newPassword) {
    alert('请输入新密码');
    return;
  }
  if (passwordForm.newPassword.length < 6) {
    alert('新密码长度不能少于 6 位');
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    alert('两次输入的新密码不一致');
    return;
  }

  isChangingPassword.value = true;

  try {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 这里因为是纯前端模拟，无法真正验证旧密码是否正确
    // 假设旧密码正确，直接返回成功
    
    alert('密码修改成功，请重新登录');
    store.logout();
    window.location.href = '/login';
  } catch (error) {
    console.error('修改密码失败', error);
    alert('修改密码失败，请重试');
  } finally {
    isChangingPassword.value = false;
    // 清空表单
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmNewPassword = '';
  }
};
