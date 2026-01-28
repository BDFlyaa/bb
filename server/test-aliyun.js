// 测试阿里云垃圾分类 API
import 'dotenv/config';
import AliyunClassifier from './utils/aliyun.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
    console.log('=== 阿里云垃圾分类 API 测试 ===\n');

    // 检查环境变量
    console.log('环境变量检查:');
    console.log('  ALIYUN_ACCESS_KEY_ID:', process.env.ALIYUN_ACCESS_KEY_ID ? '已设置' : '未设置');
    console.log('  ALIYUN_ACCESS_KEY_SECRET:', process.env.ALIYUN_ACCESS_KEY_SECRET ? '已设置' : '未设置');
    console.log('  ALIYUN_REGION_ID:', process.env.ALIYUN_REGION_ID || 'cn-shanghai (默认)');
    console.log('');

    // 创建一个简单的测试图片（如果没有的话）
    const testImagePath = path.join(__dirname, 'test-image.jpg');

    if (!fs.existsSync(testImagePath)) {
        console.log('请在 server 目录下放置一张名为 test-image.jpg 的测试图片');
        console.log('然后重新运行此测试脚本');
        return;
    }

    console.log('测试图片路径:', testImagePath);
    console.log('开始调用阿里云 API...\n');

    try {
        const result = await AliyunClassifier.classifyRubbish(testImagePath);
        console.log('调用成功！结果:');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('调用失败！错误详情:');
        console.error('  错误名称:', error.name);
        console.error('  错误代码:', error.code);
        console.error('  错误消息:', error.message);
        if (error.data) {
            console.error('  详细数据:', JSON.stringify(error.data, null, 2));
        }
        console.error('  完整错误:', error);
    }
}

test();
