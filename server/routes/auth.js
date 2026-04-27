import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarDir = path.join(__dirname, '../uploads/avatar');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

/** 将 base64 图片存为文件，返回 /uploads/avatar/... 路径；非 base64 则原样返回 */
function persistAvatarIfBase64(avatarValue) {
  if (!avatarValue || typeof avatarValue !== 'string') return avatarValue || '';
  if (!avatarValue.startsWith('data:image/')) return avatarValue;

  try {
    const matches = avatarValue.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return '';

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    if (buffer.length > 2 * 1024 * 1024) return null; // 与前端一致的 2MB 限制

    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const filePath = path.join(avatarDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/avatar/${filename}`;
  } catch (e) {
    console.error('保存头像失败:', e);
    return null;
  }
}

function sqlDetail(err) {
  return err?.parent?.sqlMessage || err?.message || String(err);
}

function publicUserPayload(user) {
  const u = user.get ? user.get({ plain: true }) : user;
  return {
    id: u.id,
    username: u.username,
    nickname: u.nickname || null,
    name: u.nickname || u.username,
    role: u.role,
    points: u.points,
    avatar: u.avatar || '',
    bio: u.bio || '',
  };
}

const router = express.Router();

// 注册接口
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: '该用户名已被使用' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'volunteer'
    });

    res.status(201).json({ message: '注册成功', userId: user.id });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '登录成功',
      token,
      user: publicUserPayload(user),
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取当前用户信息接口
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(publicUserPayload(user));
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '服务器内部错误', detail: sqlDetail(error) });
  }
});

// 获取指定用户的公开资料
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    // 尝试匹配用户名或昵称
    const user = await User.findOne({ 
      where: {
        [Op.or]: [
          { username: username },
          { nickname: username }
        ]
      } 
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 只返回公开字段
    res.json({
      username: user.username,
      nickname: user.nickname || null,
      name: user.nickname || user.username,
      avatar: user.avatar || '',
      bio: user.bio || '',
      points: user.points,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({ message: '服务器内部错误', detail: sqlDetail(error) });
  }
});

// 更新基本资料（昵称、简介、头像）；头像可为 URL 或 data URL（会落盘）
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const { nickname, bio, avatar } = req.body;
    const updates = {};

    if (nickname !== undefined) {
      const n = String(nickname).trim();
      if (!n) {
        return res.status(400).json({ message: '昵称不能为空' });
      }
      if (n.length > 64) {
        return res.status(400).json({ message: '昵称长度不能超过 64 个字符' });
      }
      updates.nickname = n;
    }

    if (bio !== undefined) {
      const b = String(bio).trim();
      if (b.length > 500) {
        return res.status(400).json({ message: '个人简介不能超过 500 字' });
      }
      updates.bio = b;
    }

    if (avatar !== undefined) {
      const stored = persistAvatarIfBase64(avatar);
      if (stored === null) {
        return res.status(400).json({ message: '头像图片无效或过大' });
      }
      updates.avatar = stored;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: '没有要更新的字段' });
    }

    await user.update(updates);

    res.json({ message: '资料已更新', user: publicUserPayload(user) });
  } catch (error) {
    console.error('更新资料失败:', error);
    res.status(500).json({ message: '服务器内部错误', detail: sqlDetail(error) });
  }
});

// 修改密码
router.patch('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '请填写当前密码和新密码' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: '新密码长度不能少于 6 位' });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(400).json({ message: '当前密码不正确' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    res.json({ message: '密码已修改，请重新登录' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ message: '服务器内部错误', detail: sqlDetail(error) });
  }
});

// 模拟发送邮箱验证码（实际项目中应调用邮件服务，这里仅模拟存入内存）
const emailCodes = new Map();

router.post('/email/send-code', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: '邮箱格式不正确' });
    }

    // 检查邮箱是否已被其他用户绑定
    const existing = await User.findOne({ where: { email } });
    if (existing && existing.id !== req.user.userId) {
      return res.status(400).json({ message: '该邮箱已被其他账号绑定' });
    }

    // 生成 6 位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 存储验证码（5分钟有效）
    emailCodes.set(email, {
      code,
      expire: Date.now() + 5 * 60 * 1000
    });

    console.log(`[Email Mock] 向 ${email} 发送验证码: ${code}`);
    
    // 实际生产环境应在此调用 nodemailer 等发送邮件
    // await sendRealEmail(email, code);

    res.json({ message: '验证码已发送（请查看服务器控制台）' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ message: '发送失败', detail: sqlDetail(error) });
  }
});

// 绑定/修改邮箱
router.post('/email/bind', authenticateToken, async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!email || !code) {
      return res.status(400).json({ message: '请填写邮箱和验证码' });
    }

    // 验证验证码
    const record = emailCodes.get(email);
    if (!record || record.code !== String(code) || record.expire < Date.now()) {
      return res.status(400).json({ message: '验证码错误或已过期' });
    }

    // 更新用户邮箱
    await user.update({ email });
    
    // 清除验证码
    emailCodes.delete(email);

    res.json({ 
      message: '邮箱绑定成功', 
      user: publicUserPayload(user) 
    });
  } catch (error) {
    console.error('绑定邮箱失败:', error);
    res.status(500).json({ message: '绑定失败', detail: sqlDetail(error) });
  }
});

export default router;
