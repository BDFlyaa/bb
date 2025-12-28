# PureOcean - 海洋塑料回收公益系统

PureOcean 是一款基于 Vue 3、Node.js 和区块链理念开发的海洋塑料回收管理系统。项目旨在通过数字化手段透明化海洋塑料回收流程，并通过科普内容提高公众环保意识。

## 🌟 项目亮点

- **海洋百科**：深度科普微塑料危害、海龟保护等海洋生态知识。
- **视频科普**：集成短视频弹窗，直观展示“塑料的一生”。
- **双端联动**：完善的前后端登录注册体系，支持 JWT 认证。
- **玻璃拟态设计**：全站采用现代感十足的深海主题玻璃拟态 UI 设计。

## 🛠️ 技术栈

### 前端
- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **状态管理**：Pinia / Custom Store
- **路由**：Vue Router
- **样式**：原生 CSS (模块化管理) + 响应式布局

### 后端
- **运行环境**：Node.js
- **Web 框架**：Express
- **数据库**：MySQL (通过 Sequelize ORM 连接)
- **认证**：JSON Web Token (JWT) + bcryptjs 密码加密

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd bs
```

### 2. 后端配置
1. 进入 `server` 目录：`cd server`
2. 安装依赖：`npm install`
3. 在 `server` 目录下创建 `.env` 文件，并配置你的数据库信息：
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=123456
   DB_NAME=bysj
   JWT_SECRET=your_secret_key
   PORT=3000
   ```
4. 启动后端：`npm run dev`

### 3. 前端配置
1. 回到根目录：`cd ..`
2. 安装依赖：`npm install`
3. 启动项目：`npm run dev`

## 📁 目录结构

- `src/` - 前端源代码
  - `assets/` - 静态资源与样式
  - `components/` - 通用组件
  - `data/` - 科普文章与视频数据
  - `pages/` - 页面组件
  - `stores/` - 状态管理
- `server/` - 后端源代码
  - `models/` - 数据库模型
  - `routes/` - API 路由
  - `db.js` - 数据库连接配置
  - `index.js` - 后端入口文件

## 🤝 参与贡献
1. Fork 本仓库
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request

---
© 2025 PureOcean 海洋塑料回收公益项目
