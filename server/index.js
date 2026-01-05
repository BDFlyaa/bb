import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './db.js';
import authRoutes from './routes/auth.js';
import communityRoutes from './routes/community.js';

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

// 根路由测试
app.get('/', (req, res) => {
  res.send('PureOcean API is running...');
});

// 数据库同步并启动服务器
async function startServer() {
  try {
    // force: false 不会删除现有的表，只会创建不存在的表
    // 如果需要更新表结构，可以暂时改为 true，但会清空数据
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
