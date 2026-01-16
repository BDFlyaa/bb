import express from 'express';
import RecycleStation from '../models/RecycleStation.js';
import StationAudit from '../models/StationAudit.js';
import StationReport from '../models/StationReport.js';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有回收站
router.get('/stations', authenticateToken, async (req, res) => {
  try {
    const stations = await RecycleStation.findAll();
    res.json(stations);
  } catch (error) {
    console.error('获取回收站失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 管理员添加回收站
router.post('/stations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, address, lng, lat, status } = req.body;
    const station = await RecycleStation.create({
      name,
      address,
      lng,
      lat,
      status: status || 'normal',
      statusText: status === 'full' ? '已满' : '正常运行'
    });
    res.status(201).json(station);
  } catch (error) {
    console.error('添加回收站失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 更新回收站 (状态/编辑)
router.put('/stations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, address, status } = req.body;
    const station = await RecycleStation.findByPk(req.params.id);
    if (!station) {
      return res.status(404).json({ message: '回收站不存在' });
    }

    if (name) station.name = name;
    if (address) station.address = address;
    if (status) {
      station.status = status;
      station.statusText = status === 'full' ? '已满' : (status === 'maintenance' ? '维护中' : '正常运行');
    }

    await station.save();
    res.json(station);
  } catch (error) {
    console.error('更新回收站失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 删除回收站
router.delete('/stations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const station = await RecycleStation.findByPk(req.params.id);
    if (!station) {
      return res.status(404).json({ message: '回收站不存在' });
    }
    await station.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除回收站失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 提交新站点申请 (志愿者)
router.post('/audit', authenticateToken, async (req, res) => {
  try {
    const { name, address, lng, lat } = req.body;
    const audit = await StationAudit.create({
      userId: req.user.userId,
      name,
      address,
      lng,
      lat,
      status: 'pending'
    });
    res.status(201).json(audit);
  } catch (error) {
    console.error('提交申请失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取待审核列表 (管理员)
router.get('/audit', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const audits = await StationAudit.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'applicant', attributes: ['username'] }]
    });
    
    // 格式化返回数据以匹配前端
    const formattedAudits = audits.map(a => ({
      id: a.id,
      user: a.applicant.username,
      name: a.name,
      address: a.address,
      time: a.createdAt,
      lng: a.lng,
      lat: a.lat
    }));
    
    res.json(formattedAudits);
  } catch (error) {
    console.error('获取审核列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 审核通过
router.post('/audit/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const audit = await StationAudit.findByPk(req.params.id);
    if (!audit) {
      return res.status(404).json({ message: '申请不存在' });
    }

    // 创建正式站点
    const station = await RecycleStation.create({
      name: audit.name,
      address: audit.address,
      lng: audit.lng,
      lat: audit.lat,
      status: 'normal',
      statusText: '正常运行'
    });

    // 更新审核状态
    audit.status = 'approved';
    await audit.save();

    res.json({ message: '审核通过', station });
  } catch (error) {
    console.error('审核失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 审核拒绝
router.post('/audit/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const audit = await StationAudit.findByPk(req.params.id);
    if (!audit) {
      return res.status(404).json({ message: '申请不存在' });
    }

    audit.status = 'rejected';
    await audit.save();

    res.json({ message: '已拒绝申请' });
  } catch (error) {
    console.error('拒绝失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 提交报错/反馈
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { stationId, type, desc } = req.body;
    const report = await StationReport.create({
      userId: req.user.userId,
      stationId,
      type,
      desc
    });
    
    // 如果是报错满溢，自动更新站点状态为 full (可选逻辑，这里暂时不自动更新，等待管理员处理)
    // 或者可以设置一个阈值，多少人报错就变状态

    res.status(201).json(report);
  } catch (error) {
    console.error('提交反馈失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取报错列表 (管理员)
router.get('/report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const reports = await StationReport.findAll({
      where: { status: 'pending' },
      include: [
        { model: User, as: 'reporter', attributes: ['username'] },
        { model: RecycleStation, as: 'station', attributes: ['name'] }
      ]
    });
    
    // 格式化
    const formattedReports = reports.map(r => ({
      id: r.id,
      user: r.reporter.username,
      stationName: r.station.name,
      type: r.type,
      desc: r.desc,
      time: r.createdAt
    }));

    res.json(formattedReports);
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 处理报错
router.post('/report/:id/resolve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const report = await StationReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: '反馈不存在' });
    }

    report.status = 'processed';
    await report.save();

    res.json({ message: '处理成功' });
  } catch (error) {
    console.error('处理反馈失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
