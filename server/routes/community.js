import express from 'express';
import Task from '../models/Task.js';
import Post from '../models/Post.js';
import Ranking from '../models/Ranking.js';

const router = express.Router();

// 获取所有任务
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.findAll({ order: [['createdAt', 'DESC']] });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
    const { user } = req.query; // 简单的校验：需要传入用户名

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: '动态不存在' });
    }

    // 如果提供了用户名，检查是否是作者
    if (user && post.user !== user) {
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

export default router;
