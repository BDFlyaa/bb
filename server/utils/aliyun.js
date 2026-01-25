// 阿里云垃圾分类识别 SDK
// 使用 createRequire 来正确处理 CommonJS 模块
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);

const ImageRecogSDK = require('@alicloud/imagerecog20190930');
const OpenApiSDK = require('@alicloud/openapi-client');
const UtilSDK = require('@alicloud/tea-util');

// 获取正确的类
const Client = ImageRecogSDK.default || ImageRecogSDK;
const Config = OpenApiSDK.Config;
const RuntimeOptions = UtilSDK.RuntimeOptions;
const ClassifyingRubbishAdvanceRequest = ImageRecogSDK.ClassifyingRubbishAdvanceRequest;

export default class AliyunClassifier {
  /**
   * 使用 AK&SK 初始化账号Client
   * @return Client
   * @throws Exception
   */
  static createClient() {
    // 优先从环境变量中获取 AccessKey ID 和 AccessKey Secret
    // 兼容 ALIYUN_ 前缀（.env 常用）和 ALIBABA_CLOUD_ 前缀（系统环境变量常用）
    const accessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || process.env.ALIYUN_ACCESS_KEY_ID;
    const accessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET || process.env.ALIYUN_ACCESS_KEY_SECRET;
    const regionId = process.env.ALIYUN_REGION_ID || 'cn-shanghai'; // 默认上海，视觉智能通常在上海

    if (!accessKeyId || !accessKeySecret) {
      throw new Error('Missing Alibaba Cloud AccessKey ID or Secret. Please set ALIBABA_CLOUD_ACCESS_KEY_ID and ALIBABA_CLOUD_ACCESS_KEY_SECRET environment variables.');
    }

    let config = new Config({
      accessKeyId: accessKeyId,
      accessKeySecret: accessKeySecret,
    });

    // 访问的域名
    config.endpoint = `imagerecog.${regionId}.aliyuncs.com`;
    return new Client(config);
  }

  /**
   * 垃圾分类识别 - 使用本地文件流
   * @param {string} filePath 本地图片文件路径
   * @returns {Promise<object>} 识别结果
   */
  static async classifyRubbish(filePath) {
    let client = AliyunClassifier.createClient();

    // 使用 AdvanceRequest 来上传文件流
    let imageStream = fs.createReadStream(filePath);

    let classifyRubbishRequest = new ClassifyingRubbishAdvanceRequest({
      imageURLObject: imageStream,
    });

    let runtime = new RuntimeOptions({});

    try {
      // 使用 classifyingRubbishAdvance 方法处理文件流
      let response = await client.classifyingRubbishAdvance(classifyRubbishRequest, runtime);
      return response.body;
    } catch (error) {
      // 错误处理
      console.error('Aliyun Image Recognition Error:', error);
      if (error.code === 'InvalidAccessKeyId.NotFound' || error.code === 'SignatureDoesNotMatch') {
        throw new Error('阿里云 AccessKey 配置错误，请检查环境变量。');
      }
      throw error;
    }
  }
}
