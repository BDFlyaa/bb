export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // 支持 Bilibili BV 号或嵌入链接
  poster?: string;
}

export const videos: Record<string, Video> = {
  plastic_life: {
    id: 'plastic_life',
    title: '塑料的一生：从石油到海洋',
    description: '揭秘塑料制品从原材料提取、制造、使用到最终进入海洋生态系统的完整旅程。',
    
    videoUrl: 'https://www.xinpianchang.com/a11011009?from=articleCollectDetail'
  }
};
