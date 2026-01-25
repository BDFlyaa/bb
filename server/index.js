import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './db.js';
import authRoutes from './routes/auth.js';
import communityRoutes from './routes/community.js';
import mapRoutes from './routes/map.js';
import mallRoutes from './routes/mall.js';
import statsRoutes from './routes/stats.js';
import checkinRoutes from './routes/checkin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/mall', mallRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/checkin', checkinRoutes);

// 根路由测试
app.get('/', (req, res) => {
  res.send('PureOcean API is running...');
});

// 数据库同步并启动服务器
async function startServer() {
  try {
    // force: false 不会删除现有的表，只会创建不存在的表
    // 如果需要更新表结构，可以暂时改为 true，但会清空数据
    // 注意：alter: true 在某些情况下会导致 "Too many keys specified" 错误，建议生产环境使用 migration
    await sequelize.sync({ alter: false });
    console.log('Database synced successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
