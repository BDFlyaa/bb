import { ref } from 'vue';
import {
  addPostComment,
  createPost,
  createTask,
  deleteFeedPost,
  deleteTask as deleteTaskApi,
  getFeed,
  getRankings,
  getTasks,
  joinTask as joinTaskApi,
  leaveTask as leaveTaskApi,
  likePost,
  unlikePost,
  updateTask
} from '../../api/community';
import { getUserProfile } from '../../api/auth';
import { store } from '../../stores';

// 定义接口类型
interface Task {
  id: number;
  title: string;
  loc: string;
  date: string;
  image?: string;
  isJoined?: boolean;
}

interface Comment {
  id: number;
  user: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: number;
  user: string;
  content: string;
  image?: string;
  likes: number;
  createdAt?: string;
  isLiked?: boolean;
  comments: Comment[];
  showComments?: boolean;
  newCommentContent?: string;
}

interface Rank {
  id: number;
  name: string;
  weight: number;
}

interface UserProfile {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  points: number;
  role: string;
  createdAt?: string;
}

// 状态控制
export const tasks = ref<Task[]>([]);
export const feed = ref<Post[]>([]);
export const rankings = ref<Rank[]>([]);
export const isLoading = ref(true);

// 用户资料预览
export const selectedUserProfile = ref<UserProfile | null>(null);
export const isProfileLoading = ref(false);
export const showProfileModal = ref(false);

export const openUserProfile = async (username: string) => {
  isProfileLoading.value = true;
  showProfileModal.value = true;
  try {
    const data = await getUserProfile(username);
    selectedUserProfile.value = {
      username: data.username,
      name: data.name || data.nickname || data.username,
      avatar: data.avatar || '',
      bio: data.bio || '这个人很懒，还没有写简介...',
      points: data.points || 0,
      role: data.role === 'system_admin' ? '管理员' : '志愿者',
      createdAt: (data as any).createdAt
    };
  } catch (error) {
    console.error('获取用户资料失败:', error);
    showToast('无法获取该用户资料', 'error');
    showProfileModal.value = false;
  } finally {
    isProfileLoading.value = false;
  }
};

export const closeUserProfile = () => {
  showProfileModal.value = false;
  setTimeout(() => {
    selectedUserProfile.value = null;
  }, 300);
};

// Toast 状态
export const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

/**
 * 显示一个提示消息，并在3秒后自动隐藏。
 * 
 * @param msg - 要显示的消息内容。
 * @param type - 提示类型，默认为 'success'。可选值包括 'success', 'error', 'warning' 等。
 * 
 * 该函数通过设置 `toast.value` 对象来控制提示的显示状态，
 * 并使用 `setTimeout` 在3秒后将提示隐藏。
 */
export const showToast = (msg: string, type = 'success') => {
  // 设置提示显示状态和内容
  toast.value = { show: true, message: msg, type };
  
  // 3秒后隐藏提示
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// 弹窗状态
export const modal = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: () => { }
});

export const openModal = (title: string, message: string, onConfirm: () => void) => {
  modal.value = { show: true, title, message, onConfirm };
};

export const closeModal = () => {
  modal.value.show = false;
};

export const confirmModal = () => {
  modal.value.onConfirm();
  closeModal();
};

// 发布动态相关
export const newPostContent = ref('');
export const selectedImage = ref('');
export const isPublishing = ref(false);

// 图片预览状态
export const previewImage = ref({
  show: false,
  url: ''
});

// 发布活动相关（管理员）
export const newActivity = ref({
  title: '',
  loc: '',
  date: '',
  image: '',
  tag: '组队'
});
export const isPublishingActivity = ref(false);
export const showActivityModal = ref(false);
export const editingTaskId = ref<number | null>(null);

/**
 * 打开活动模态框，并根据传入的任务信息初始化模态框数据。
 * 
 * @param task - 可选参数，表示要编辑的任务对象。如果提供，则使用该任务的信息填充模态框；
 *               如果未提供，则将模态框初始化为空状态。
 */
export const openActivityModal = (task?: any) => {
  // 如果传入了任务对象，则设置当前编辑的任务ID，并用任务信息初始化新活动数据
  if (task) {
    editingTaskId.value = task.id;
    newActivity.value = {
      title: task.title,
      loc: task.loc,
      date: task.date,
      image: task.image || '',
      tag: task.tag || '组队'
    };
  } else {
    // 如果没有传入任务对象，则清空当前编辑的任务ID，并将新活动数据重置为空状态
    editingTaskId.value = null;
    newActivity.value = { title: '', loc: '', date: '', image: '', tag: '组队' };
  }

  // 显示活动模态框
  showActivityModal.value = true;
};

export const closeActivityModal = () => {
  showActivityModal.value = false;
  editingTaskId.value = null;
  // 重置表单
  newActivity.value = { title: '', loc: '', date: '', image: '', tag: '组队' };
};

export const openImagePreview = (url: string) => {
  previewImage.value = { show: true, url };
  document.body.style.overflow = 'hidden';
};

export const closeImagePreview = () => {
  previewImage.value.show = false;
  document.body.style.overflow = '';
};

// 处理图片选择
export const handleImageSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // 检查文件大小 (限制 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片太大啦，请选择 5MB 以下的图片', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// 格式化时间
export const formatTime = (timeStr?: string) => {
  if (!timeStr) return '刚刚发布';
  const date = new Date(timeStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return date.toLocaleDateString();
};

// 获取数据
export const fetchData = async () => {
  isLoading.value = true;
  try {
    const username = store.user.name || '';
    // 改为分别获取，避免一个接口失败导致全部不显示
    const fetchTasks = getTasks({ username }).then(data => {
      tasks.value = data.map((t) => ({ ...t, isJoined: t.isJoined || false }));
    }).catch(e => console.error('任务加载失败:', e));
    const fetchFeed = getFeed().then(data => {
      feed.value = data.map((p) => ({
        ...p,
        isLiked: false,
        comments: p.comments || [],
        showComments: false,
        newCommentContent: ''
      }));
    }).catch(e => console.error('动态加载失败:', e));
    const fetchRankings = getRankings().then(data => { rankings.value = data; }).catch(e => console.error('排行加载失败:', e));

    await Promise.all([fetchTasks, fetchFeed, fetchRankings]);

    if (tasks.value.length === 0 && feed.value.length === 0 && rankings.value.length === 0) {
      showToast('暂无海域数据，请稍后再试', 'info');
    }
  } catch (error) {
    console.error('获取社区数据失败:', error);
    showToast('部分数据同步异常', 'error');
  } finally {
    isLoading.value = false;
  }
};

// 交互逻辑
export const joinTask = async (task: Task) => {
  try {
    const username = store.user.name || '志愿者';
    await joinTaskApi(task.id, { username });
    task.isJoined = true;
    showToast(`成功加入任务：“${task.title}”！`);
  } catch (error: any) {
    console.error('报名失败:', error);
    showToast(error.response?.data?.message || '报名失败，请稍后再试', 'error');
  }
};

export const leaveTask = (task: Task) => {
  openModal(
    '退出确认',
    `确定要退出任务：“${task.title}”吗？`,
    async () => {
      try {
        const username = store.user.name || '志愿者';
        await leaveTaskApi(task.id, { username });
        task.isJoined = false;
        showToast('已退出任务', 'info');
      } catch (error: any) {
        console.error('退出失败:', error);
        showToast(error.response?.data?.message || '退出失败，请稍后再试', 'error');
      }
    }
  );
};

export const publishPost = async () => {
  if (!newPostContent.value.trim() && !selectedImage.value) return;

  isPublishing.value = true;
  try {
    const created = await createPost({
      content: newPostContent.value,
      image: selectedImage.value,
      user: store.user.name || '志愿者'
    });
    feed.value.unshift({
      ...created,
      isLiked: false,
      comments: created.comments || [],
      showComments: false,
      newCommentContent: ''
    });
    newPostContent.value = '';
    selectedImage.value = '';
    showToast('动态发布成功！');
  } catch (error) {
    console.error('发布动态失败:', error);
    showToast('发布失败，请稍后再试', 'error');
  } finally {
    isPublishing.value = false;
  }
};

export const publishActivity = async () => {
  const { title, loc, date } = newActivity.value;
  if (!title || !loc || !date) {
    showToast('请填写完整活动信息', 'error');
    return;
  }

  isPublishingActivity.value = true;
  try {
    if (editingTaskId.value) {
      const res = await updateTask(editingTaskId.value, newActivity.value);
      const index = tasks.value.findIndex(t => t.id === editingTaskId.value);
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...res };
      }
      showToast('活动修改成功！');
    } else {
      const res = await createTask(newActivity.value);
      tasks.value.unshift({ ...res, isJoined: false });
      showToast('活动发布成功！');
    }
    closeActivityModal();
  } catch (error: any) {
    console.error('保存活动失败:', error);
    showToast(error.response?.data?.message || '操作失败，请稍后再试', 'error');
  } finally {
    isPublishingActivity.value = false;
  }
};

export const deleteActivity = (task: any) => {
  openModal(
    '删除确认',
    `确定要彻底删除活动 “${task.title}” 吗？此操作不可恢复。`,
    async () => {
      try {
        await deleteTaskApi(task.id);
        tasks.value = tasks.value.filter(t => t.id !== task.id);
        showToast('活动已删除');
      } catch (error: any) {
        console.error('删除活动失败:', error);
        showToast('删除失败', 'error');
      }
    }
  );
};

export const cancelActivity = (task: any) => {
  openModal(
    '取消确认',
    `确定要取消活动 “${task.title}” 吗？\n这将把活动标记为已取消，但保留记录。`,
    async () => {
      try {
        // 通过修改标题来实现"取消"状态
        const newTitle = task.title.includes('(已取消)') ? task.title : `(已取消) ${task.title}`;
        await updateTask(task.id, { title: newTitle });

        const idx = tasks.value.findIndex(t => t.id === task.id);
        if (idx !== -1 && tasks.value[idx]) {
          tasks.value[idx].title = newTitle;
        }
        showToast('活动已取消');
      } catch (error: any) {
        console.error('取消活动失败:', error);
        showToast('操作失败', 'error');
      }
    }
  );
};

export const toggleLike = async (post: Post) => {
  try {
    const username = store.user.name || '志愿者';
    const res = post.isLiked ? await unlikePost(post.id) : await likePost(post.id, username);
    post.likes = res.likes;
    post.isLiked = !post.isLiked;

    if (post.isLiked) {
      showToast('点赞成功！');
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
  }
};

export const toggleComments = (post: Post) => {
  post.showComments = !post.showComments;
};

export const addComment = async (post: Post) => {
  if (!post.newCommentContent?.trim()) return;

  try {
    const comment = await addPostComment(post.id, {
      content: post.newCommentContent!,
      user: store.user.name || '志愿者'
    });

    post.comments.push(comment);
    post.newCommentContent = '';
    showToast('评论发表成功！');
  } catch (error) {
    console.error('发表评论失败:', error);
    showToast('发表失败，请稍后再试', 'error');
  }
};

export const deletePost = async (postId: number) => {
  openModal(
    '删除确认',
    '确定要永久删除这条动态吗？此操作不可撤销。',
    async () => {
      try {
        await deleteFeedPost(postId, { user: store.user.name });
        // 从列表中移除
        feed.value = feed.value.filter(p => p.id !== postId);
        showToast('动态已删除');
      } catch (error) {
        console.error('删除动态失败:', error);
        showToast('删除失败，请稍后再试', 'error');
      }
    }
  );
};

// 需要在 .vue 中调用，所以不放在这里执行 onMounted
// 或者如果想在这里执行，可以使用 export default 或者由 .vue 显式调用
export const initCommunity = async () => {
  await fetchData();
};
