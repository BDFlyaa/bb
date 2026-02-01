import express from 'express';
import Task from '../models/Task.js';
import Post from '../models/Post.js';
import Ranking from '../models/Ranking.js';
import TaskParticipation from '../models/TaskParticipation.js';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ==================== 任务相关 API ====================

// 获取所有任务
router.get('/tasks', async (req, res) => {
  try {
    const { username } = req.query;
    const tasks = await Task.findAll({ order: [['createdAt', 'DESC']] });

    // 如果提供了用户名，标记用户已参加的任务
    if (username) {
      const participations = await TaskParticipation.findAll({
        where: { username, status: 'joined' }
      });
      const joinedTaskIds = new Set(participations.map(p => p.taskId));

      const tasksWithStatus = tasks.map(task => ({
        ...task.toJSON(),
        isJoined: joinedTaskIds.has(task.id)
      }));
      return res.json(tasksWithStatus);
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新任务（管理员）
router.post('/tasks', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, loc, date, tag } = req.body;
    if (!title || !loc || !date) {
      return res.status(400).json({ message: '标题、地点、日期不能为空' });
    }
    const newTask = await Task.create({ title, loc, date, tag: tag || '组队' });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新任务（管理员）
router.put('/tasks/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, loc, date, tag } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    if (title) task.title = title;
    if (loc) task.loc = loc;
    if (date) task.date = date;
    if (tag) task.tag = tag;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 删除/取消任务（管理员）
router.delete('/tasks/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    // 同时删除相关的参与记录
    await TaskParticipation.destroy({ where: { taskId: id } });
    await task.destroy();

    res.json({ success: true, message: '任务已取消' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 报名参加任务
router.post('/tasks/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: '用户名不能为空' });
    }

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    // 检查是否已经参加
    const existing = await TaskParticipation.findOne({
      where: { taskId: id, username }
    });

    if (existing) {
      if (existing.status === 'joined') {
        return res.status(400).json({ message: '您已经报名了这个任务' });
      }
      // 如果之前退出了，重新加入
      existing.status = 'joined';
      await existing.save();
    } else {
      await TaskParticipation.create({ taskId: id, username, status: 'joined' });
    }

    res.json({ success: true, message: '报名成功', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 退出任务
router.post('/tasks/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: '用户名不能为空' });
    }

    const participation = await TaskParticipation.findOne({
      where: { taskId: id, username, status: 'joined' }
    });

    if (!participation) {
      return res.status(404).json({ message: '您还没有报名这个任务' });
    }

    participation.status = 'left';
    await participation.save();

    res.json({ success: true, message: '已退出任务' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取用户参与的任务
router.get('/tasks/my-tasks', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: '用户名不能为空' });
    }

    const participations = await TaskParticipation.findAll({
      where: { username, status: 'joined' },
      order: [['createdAt', 'DESC']]
    });

    const taskIds = participations.map(p => p.taskId);
    const tasks = await Task.findAll({
      where: { id: taskIds }
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== 动态相关 API ====================

// 获取所有动态
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    console.error('获取动态失败详情:', error);
    res.status(500).json({ message: error.message });
  }
});

// 发布动态
router.post('/feed', async (req, res) => {
  try {
    const { user, content, image } = req.body;

    // 检查用户是否被禁言
    const userRecord = await User.findOne({ where: { username: user } });
    if (userRecord && userRecord.mutedUntil && new Date(userRecord.mutedUntil) > new Date()) {
      return res.status(403).json({
        message: `您已被禁言，解禁时间：${new Date(userRecord.mutedUntil).toLocaleString()}`
      });
    }

    // 如果没有文字内容但有图片，也允许发布
    if (!content && !image) {
      return res.status(400).json({ message: '发布内容不能为空' });
    }
    const newPost = await Post.create({
      user: user || '神秘志愿者',
      content: content || '', // 确保 content 不为 null
      image,
      likes: 0
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('发布动态后端错误:', error);
    res.status(500).json({ message: error.message });
  }
});

// 点赞动态
router.post('/feed/:id/like', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (post) {
      post.likes += 1;
      await post.save();
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 取消点赞
router.post('/feed/:id/unlike', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (post) {
      post.likes = Math.max(0, post.likes - 1);
      await post.save();
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 删除动态
router.delete('/feed/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user, isAdmin } = req.query;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: '动态不存在' });
    }

    // 管理员可以删除任何动态，普通用户只能删除自己的
    if (!isAdmin && user && post.user !== user) {
      return res.status(403).json({ message: '无权删除他人动态' });
    }

    await post.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 发表评论
router.post('/feed/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { user, content } = req.body;

    // 检查用户是否被禁言
    const userRecord = await User.findOne({ where: { username: user } });
    if (userRecord && userRecord.mutedUntil && new Date(userRecord.mutedUntil) > new Date()) {
      return res.status(403).json({
        message: `您已被禁言，解禁时间：${new Date(userRecord.mutedUntil).toLocaleString()}`
      });
    }

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: '动态不存在' });
    }

    const newComment = {
      id: Date.now(),
      user: user || '匿名志愿者',
      content,
      createdAt: new Date().toISOString()
    };

    const currentComments = post.comments || [];
    post.comments = [...currentComments, newComment];
    await post.save();

    res.status(201).json(newComment);
  } catch (error) {
    console.error('发表评论后端错误:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== 排行榜 API ====================

// 获取排行
router.get('/rankings', async (req, res) => {
  try {
    const rankings = await Ranking.findAll({
      where: { period: 'monthly' },
      order: [['weight', 'DESC']],
      limit: 5
    });
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== 管理员 API ====================

// 禁言用户
router.post('/admin/mute-user', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, duration } = req.body;

    if (!username) {
      return res.status(400).json({ message: '用户名不能为空' });
    }

    // 解析禁言时长
    let hours = 24; // 默认 24 小时
    if (duration) {
      const match = duration.match(/^(\d+)(h|d)$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        hours = unit === 'd' ? value * 24 : value;
      }
    }

    const mutedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);

    // 查找或创建用户记录
    let user = await User.findOne({ where: { username } });
    if (user) {
      user.mutedUntil = mutedUntil;
      await user.save();
    } else {
      // 如果用户不存在于数据库，返回警告但仍记录禁言状态
      // 实际应用中可能需要不同的处理方式
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      success: true,
      message: `用户 ${username} 已被禁言`,
      mutedUntil: mutedUntil.toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 解除禁言
router.post('/admin/unmute-user', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: '用户名不能为空' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    user.mutedUntil = null;
    await user.save();

    res.json({ success: true, message: `用户 ${username} 已解除禁言` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取任务参与统计
router.get('/admin/task-stats/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    const participations = await TaskParticipation.findAll({
      where: { taskId: id, status: 'joined' }
    });

    res.json({
      task,
      participantCount: participations.length,
      participants: participations.map(p => p.username)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

