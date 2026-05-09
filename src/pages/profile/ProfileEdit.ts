import { reactive, ref } from 'vue';
import axios from 'axios';
import { 
  changePassword as authChangePassword, 
  getMe, 
  updateProfile as authUpdateProfile
} from '../../api/auth';
import { store } from '../../stores';

function axiosErrText(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response?.data) return '';
  const d = error.response.data as { message?: string; detail?: string };
  const base = d.message ? String(d.message) : '';
  const detail = d.detail ? ` — ${d.detail}` : '';
  return (base || '请求失败') + detail;
}

export const isSaving = ref(false);
export const isChangingPassword = ref(false);

export const activeTab = ref('profile'); // 'profile', 'security', 'preferences'

export const form = reactive({
  name: '',
  avatar: '',
  bio: '',
  // 扩展字段
  username: '',
  role: '',
  points: 0,
  gender: 'secret', // 'male', 'female', 'secret'
  location: ''
});

export const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});

export const fileInput = ref<HTMLInputElement | null>(null);

function applyUserToForm() {
  if (store.user) {
    form.name = store.user.name || '';
    form.avatar = store.user.avatar || '';
    form.bio = store.user.bio || '';
    form.username = store.user.username || '';
    form.role = store.user.role || '';
    form.points = store.user.points || 0;
  }
}

export const initProfile = async () => {
  if (store.isLoggedIn && store.token) {
    try {
      const data = await getMe();
      store.user = {
        ...store.user,
        id: data.id,
        username: data.username,
        name: data.name || data.nickname || data.username,
        role: data.role,
        points: data.points ?? 0,
        avatar: data.avatar || '',
        bio: data.bio || ''
      };
      localStorage.setItem('user', JSON.stringify(store.user));
    } catch (e) {
      console.error('加载个人资料失败', axiosErrText(e) || e);
    }
  }
  applyUserToForm();
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

  if (!store.token) {
    alert('请先登录');
    return;
  }

  isSaving.value = true;

  try {
    const data = await authUpdateProfile({
      nickname: form.name.trim(),
      bio: (form.bio || '').trim(),
      avatar: form.avatar
    });

    const u = data.user;
    store.user = {
      ...store.user,
      id: u.id,
      username: u.username,
      name: u.name || u.nickname || u.username,
      role: u.role,
      points: u.points ?? store.user.points ?? 0,
      avatar: u.avatar || '',
      bio: u.bio || ''
    };
    localStorage.setItem('user', JSON.stringify(store.user));
    applyUserToForm();
    alert(data.message || '个人资料已更新');
  } catch (error: unknown) {
    console.error('保存失败', error);
    alert(axiosErrText(error) || '保存失败，请重试');
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

  if (!store.token) {
    alert('请先登录');
    return;
  }

  isChangingPassword.value = true;

  try {
    await authChangePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    alert('密码修改成功，请重新登录');
    store.logout();
    window.location.href = '/login';
  } catch (error: unknown) {
    console.error('修改密码失败', error);
    alert(axiosErrText(error) || '修改密码失败，请重试');
  } finally {
    isChangingPassword.value = false;
    // 清空表单
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmNewPassword = '';
  }
};

// ===== 邮箱绑定 =====

export const emailForm = reactive({
  email: '',
  code: '',
});

export const isSendingCode = ref(false);
export const isBindingEmail = ref(false);
export const codeCountdown = ref(0);

let countdownTimer: ReturnType<typeof setInterval> | null = null;

function startCountdown() {
  codeCountdown.value = 60;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    codeCountdown.value--;
    if (codeCountdown.value <= 0) {
      if (countdownTimer) clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}

export const sendEmailCode = async () => {
  if (!emailForm.email.trim() || codeCountdown.value > 0) return;

  if (!store.token) {
    alert('请先登录');
    return;
  }

  isSendingCode.value = true;
  try {
    await axios.post('/api/auth/email/send-code', { email: emailForm.email.trim() }, {
      headers: { Authorization: `Bearer ${store.token}` },
    });
    startCountdown();
    alert('验证码已发送，请查收邮件');
  } catch (error: unknown) {
    alert(axiosErrText(error) || '发送验证码失败，请稍后重试');
  } finally {
    isSendingCode.value = false;
  }
};

export const bindEmail = async () => {
  if (!emailForm.email.trim() || !emailForm.code.trim()) {
    alert('请填写邮箱和验证码');
    return;
  }

  if (!store.token) {
    alert('请先登录');
    return;
  }

  isBindingEmail.value = true;
  try {
    const { data } = await axios.post('/api/auth/email/bind', {
      email: emailForm.email.trim(),
      code: emailForm.code.trim(),
    }, {
      headers: { Authorization: `Bearer ${store.token}` },
    });
    alert(data.message || '邮箱绑定成功');
    emailForm.code = '';
    // 刷新用户信息
    await initProfile();
  } catch (error: unknown) {
    alert(axiosErrText(error) || '绑定失败，请检查验证码是否正确');
  } finally {
    isBindingEmail.value = false;
  }
};
