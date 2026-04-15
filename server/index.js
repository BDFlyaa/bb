import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './db.js';
import { ensureUserProfileColumns } from './ensureUserProfileColumns.js';
import authRoutes from './routes/auth.js';
import communityRoutes from './routes/community.js';
import mapRoutes from './routes/map.js';
import mallRoutes from './routes/mall.js';
import statsRoutes from './routes/stats.js';
import checkinRoutes from './routes/checkin.js';
import classifyRoutes from './routes/classify.js';
import traceabilityRoutes from './routes/traceability.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/mall', mallRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/classify', classifyRoutes);
app.use('/api/trace', traceabilityRoutes);


// 根路由测试
app.get('/', (req, res) => {
  res.send('PureOcean API is running...');
});

// 数据库同步并启动服务器
async function startServer() {
  try {
    // force: false 不会删表；alter：为表补齐模型中新增列（如 nickname / avatar / bio）
    await sequelize.sync({
      force: false,
      alter: process.env.DB_SYNC_ALTER === 'true',
    });
    await ensureUserProfileColumns();
    console.log('Database synced successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
