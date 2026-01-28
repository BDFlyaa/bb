import sequelize from './db.js';
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

const seedData = async () => {
  try {
    // 禁用外键约束检查以便正确删除表
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database synced for seeding.');

    // 种子任务
    await Task.bulkCreate([
      { title: '黄金海岸净滩行动', loc: '阳光海滩 Sector A', date: '周六 09:00' },
      { title: '河流拦截网清理', loc: '大河口入海处', date: '周日 14:00' },
      { title: '红树林塑料清理', loc: '湿地保护区', date: '下周三 10:00' },
      { title: '深蓝港湾废弃渔网清理', loc: '北港码头', date: '下周五 08:30' },
    ]);

    // 种子帖子
    await Post.bulkCreate([
      { user: '李明', content: '今天捡了5公斤塑料瓶，感觉很有成就感！#守护海洋', likes: 24 },
      { user: 'OceanLover', content: '发现一个新的微塑料聚集点，已在地图上申报。大家注意安全！', likes: 15 },
      { user: 'Volunteer_007', content: '刚兑换了环保T恤，质量很棒，大家快去商城看看。', likes: 8 },
      { user: '环保达人', content: '周末的净滩活动非常给力，一共清理了超过50kg垃圾！', likes: 32 },
    ]);

    // 种子排行榜
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
