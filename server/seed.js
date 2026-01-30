import sequelize from './db.js';
import bcrypt from 'bcryptjs';
import Task from './models/Task.js';
import Post from './models/Post.js';
import Ranking from './models/Ranking.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import RecycleStation from './models/RecycleStation.js';
import StationAudit from './models/StationAudit.js';
import StationReport from './models/StationReport.js';
import TaskParticipation from './models/TaskParticipation.js';
import CheckinRecord from './models/CheckinRecord.js';

const seedData = async () => {
  try {
    // 禁用外键约束检查以便正确删除表
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database synced for seeding.');

    // 排行榜用户数据（包含用户名、邮箱和回收重量）
    const rankingUsers = [
      { username: '蓝海卫士', email: 'blueocean@example.com', weight: 125.5 },
      { username: '海滩清洁工', email: 'beachcleaner@example.com', weight: 98.2 },
      { username: 'EcoLover', email: 'ecolover@example.com', weight: 87.0 },
      { username: '张小强', email: 'zhangxq@example.com', weight: 64.8 },
      { username: '王大妈', email: 'wangdm@example.com', weight: 52.1 },
    ];


    // 默认密码（实际使用时可根据需要修改）
    const defaultPassword = await bcrypt.hash('password123', 10);

    // 创建排行榜用户账号
    const createdUsers = [];
    for (const userData of rankingUsers) {
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: defaultPassword,
        role: 'volunteer',
        points: Math.floor(userData.weight * 10) // 积分 = 回收重量 * 10
      });
      createdUsers.push({ user, weight: userData.weight });
    }
    console.log('Ranking users created successfully!');

    // 为每个用户创建打卡记录以记录回收重量
    for (const { user, weight } of createdUsers) {
      await CheckinRecord.create({
        userId: user.id,
        stationId: null,
        type: '混合塑料',
        weight: weight,
        points: Math.floor(weight * 10),
        checkinType: 'scan',
        status: 'approved'
      });
    }
    console.log('Checkin records created successfully!');

    // 种子任务
    await Task.bulkCreate([
      { title: '黄金海岸净滩行动', loc: '阳光海滩 Sector A', date: '周六 09:00' },
      { title: '河流拦截网清理', loc: '大河口入海处', date: '周日 14:00' },
      { title: '红树林塑料清理', loc: '湿地保护区', date: '下周三 10:00' },
      { title: '深蓝港湾废弃渔网清理', loc: '北港码头', date: '下周五 08:30' },
    ]);

    // 种子帖子
    await Post.bulkCreate([
      { user: '蓝海卫士', content: '今天捡了5公斤塑料瓶，感觉很有成就感！#守护海洋', likes: 24 },
      { user: 'EcoLover', content: '发现一个新的微塑料聚集点，已在地图上申报。大家注意安全！', likes: 15 },
      { user: '张小强', content: '刚兑换了环保T恤，质量很棒，大家快去商城看看。', likes: 8 },
      { user: '王大妈', content: '周末的净滩活动非常给力，一共清理了超过50kg垃圾！', likes: 32 },
    ]);

    // 种子排行榜（保留旧的Ranking表数据以兼容社区排行榜）
    await Ranking.bulkCreate([
      { name: '蓝海卫士', weight: 125.5 },
      { name: '海滩清洁工', weight: 98.2 },
      { name: 'EcoLover', weight: 87.0 },
      { name: '张小强', weight: 64.8 },
      { name: '王大妈', weight: 52.1 },
    ]);

    // 种子商品
    await Product.bulkCreate([
      { name: '环保帆布袋', points: 500, icon: '👜', description: '100% 再生棉材质，经久耐用', category: 'daily', inventory: 50, status: 'active' },
      { name: '再生塑料T恤', points: 1200, icon: '👕', description: '由 8 个回收塑料瓶拉丝织造', category: 'clothing', inventory: 20, status: 'active' },
      { name: '竹制餐具套装', points: 350, icon: '🥢', description: '天然原竹，零废弃生活首选', category: 'daily', inventory: 8, status: 'active' },
      { name: '种子纸明信片', points: 100, icon: '📮', description: '看完后埋入土中，可长出小花', category: 'other', inventory: 100, status: 'active' },
      { name: '环保水杯', points: 800, icon: '🥤', description: '可降解材质，保温效果极佳', category: 'daily', inventory: 30, status: 'active' },
      { name: '海洋主题徽章', points: 150, icon: '🏅', description: '精美金属徽章，展示环保态度', category: 'other', inventory: 200, status: 'active' },
    ]);

    console.log('Seed data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
