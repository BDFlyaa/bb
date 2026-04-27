import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 项目核心业务流程上下文
const PROJECT_CONTEXT = `
# PureOcean 项目核心业务流程指南

## 1. 志愿者打卡与塑料回收流程
- **打卡方式**：
  1. **扫码打卡**：在合作回收站扫描终端二维码，系统自动记录回收行为并奖励固定积分（10积分）。
  2. **AI 智能识别打卡**：志愿者拍照上传塑料垃圾，系统利用 AI 识别垃圾种类（如可回收、有害等），并预估重量。
- **审核机制**：
  - 高置信度的 AI 识别会自动通过并派发积分。
  - 低置信度或模糊图片会进入后台待审核队列，由管理员人工复核。
- **积分计算**：
  - 可回收垃圾：25积分
  - 有害垃圾：30积分
  - 厨余垃圾：15积分
  - 其他垃圾：10积分

## 2. 积分与商城体系
- **积分获取**：打卡、参与社区活动、完成环保任务。
- **积分兑换**：在“积分商城”可以兑换环保周边（如环保袋、餐具等）。
- **订单流程**：用户下单 -> 管理员审核/发货 -> 积分扣除。

## 3. 区块链溯源
- **核心逻辑**：每笔回收记录都会生成唯一的“批次号”，并计算数据哈希校验码，模拟区块链不可篡改特性，确保存证真实。
- **查询功能**：用户在“溯源查询”页面输入批次号，可以查看该次回收行为的详细记录（包括回收人、回收站点、回收重量及时间），并查看基于回收量换算的环保成就（如减少的碳排放、节省的资源等）。
- **重点**：本项目溯源侧重于“回收行为”的真实性存证，不涉及后续的工厂加工环节。

## 4. 志愿者社区
- **互动**：发布环保动态、分享回收心得。
- **荣誉**：系统设有“分类达人”、“环保大师”、“海洋之友”等荣誉勋章。

## 5. 常见问题解答 (FAQ)
- **积分没到账？** 可能进入了人工审核环节，请在打卡记录中查看状态。
- **如何获取更多积分？** 多参与实地回收，并在社区保持活跃。
- **识别不准怎么办？** 确保拍摄环境光线充足，尽量近距离拍摄单件物品。
`;

router.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required and must be an array.' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured in .env');
    return res.status(500).json({ error: 'AI 服务未配置，请联系管理员。' });
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的海洋保护志愿者助手，名叫 PureOcean AI。
            
你的核心职责是：
1. 协助志愿者了解项目流程（打卡、回收、积分、商城、溯源、社区）。
2. 提供专业的海洋生态保护建议。
3. 解答关于垃圾分类的疑问。

以下是项目的核心业务逻辑，请务必以此为准：
${PROJECT_CONTEXT}

请用亲切、专业、充满正能量的语气回答。如果用户问到项目之外且不相关的问题，请礼貌地引导回环保话题。`
          },
          ...messages
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API error:', errorData);
      return res.status(response.status).json({ error: 'AI 助手暂时无法响应，请稍后再试。' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

export default router;
