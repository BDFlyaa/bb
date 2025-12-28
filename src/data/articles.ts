export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  views: number;
  content: string;
}

export const articles: Record<string, Article> = {
  microplastics: {
    id: 'microplastics',
    title: '看不见的入侵者：什么是微塑料？',
    category: '深度阅读',
    date: '2025-12-28',
    views: 1562,
    content: `
      <p>在深海的鱼腹中，在南极的积雪里，甚至在你刚喝下的那口水中，都可能潜伏着一种肉眼难以察觉的物质——<strong>微塑料（Microplastics）</strong>。</p>
      <p>它们被称为“海洋中的PM2.5”，虽然细小如尘埃，却正在悄无声息地改变着地球的生态系统，甚至侵入人类的身体。</p>
      
      <h3>1. 什么是微塑料？</h3>
      <p>简单来说，微塑料是指直径小于5毫米的塑料颗粒。</p>
      <p>为了让你对它的大小有个概念：它可能比一粒芝麻还小，小到需要显微镜才能看清。它们不是一种特定的塑料，而是聚乙烯、聚丙烯、聚苯乙烯等各种化学成分的统称。</p>
      <p>科学家通常将它们分为两类：</p>
      <ul>
        <li><strong>初生微塑料（Primary Microplastics）：</strong> 生来就是这么小。例如洗面奶、牙膏中为了增加摩擦力而添加的“柔珠”（Microbeads），或者工业上用于制造塑料产品的原生塑料颗粒。</li>
        <li><strong>次生微塑料（Secondary Microplastics）：</strong> 由大块塑料变身而来。废弃的塑料瓶、外卖盒、渔网在阳光（紫外线）、海浪和风化的作用下，逐渐变脆、破碎，最终分解成无数微小的碎片。</li>
      </ul>

      <img src="https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=800&q=80" alt="Microplastics" style="width:100%; border-radius:12px; margin: 20px 0;" />

      <h3>2. 它们从哪里来？</h3>
      <p>微塑料的来源比你想象的要贴近生活得多：</p>
      <ul>
        <li><strong>你的衣柜：</strong> 这可能是最大的来源之一。聚酯纤维、尼龙等合成面料的衣服，在洗衣机里翻滚时，会脱落成千上万条微纤维。由于它们太细小，污水处理厂无法完全拦截，最终流入江河湖海。</li>
        <li><strong>汽车轮胎：</strong> 车辆行驶时，轮胎与地面的摩擦会产生大量的橡胶粉尘，这些含塑微粒随雨水冲刷进入环境。</li>
        <li><strong>个人护理品：</strong> 许多磨砂膏、沐浴露中含有的去角质颗粒，其实就是塑料微珠。</li>
        <li><strong>一次性塑料的分解：</strong> 那个随手扔掉的塑料袋，几十年后不会消失，只会变成亿万个微塑料分子，继续存在于地球上。</li>
      </ul>

      <h3>3. 它们去了哪里？</h3>
      <p>答案是：无处不在。</p>
      <ul>
        <li><strong>海洋：</strong> 它是微塑料的最终汇聚地。浮游生物会误食微塑料，小鱼吃浮游生物，大鱼吃小鱼，最终微塑料沿着食物链层层富集。</li>
        <li><strong>空气：</strong> 科学家已在城市空气甚至偏远的阿尔卑斯山脉空气中检测到了微塑料纤维，这意味着我们可能正在“呼吸”塑料。</li>
        <li><strong>食物与水：</strong> 食盐、啤酒、瓶装水、贝类海鲜中，都已多次检测出微塑料残留。</li>
      </ul>

      <h3>4. 对我们有什么危害？</h3>
      <p>目前，微塑料对人体健康的长期影响仍在科学研究阶段，但几个潜在的风险已经引起了警惕：</p>
      <ul>
        <li><strong>物理损伤：</strong> 微小的颗粒进入消化系统或呼吸系统，可能引起局部的炎症反应。</li>
        <li><strong>化学毒性：</strong> 塑料本身可能含有增塑剂（如双酚A），同时，微塑料像一块“海绵”，容易吸附环境中的重金属和持久性有机污染物（如农药）。当这些“毒胶囊”进入生物体内，可能会释放毒素。</li>
        <li><strong>载体作用：</strong> 细菌和病毒可能附着在微塑料表面，进行长距离传播。</li>
      </ul>

      <h3>5. 我们能做什么？</h3>
      <p>微塑料问题看似宏大，但解决它的关键在于源头控制。作为普通人，我们并非无能为力：</p>
      <ul>
        <li><strong>减少一次性塑料：</strong> 少用塑料袋、吸管，出门自带水杯。</li>
        <li><strong>理性洗衣：</strong> 尽量装满洗衣机再洗（减少摩擦脱落），或者使用洗衣过滤袋。</li>
        <li><strong>看懂成分表：</strong> 购买洗护用品时，避免含有 "Polyethylene"（聚乙烯）等字样的磨砂产品。</li>
        <li><strong>做好分类：</strong> 确保塑料垃圾进入回收系统，而不是被随意丢弃在自然环境中。</li>
      </ul>

      <div style="background: rgba(0, 180, 219, 0.1); padding: 20px; border-radius: 12px; margin-top: 30px; border-left: 4px solid #00b4db;">
        <p style="margin: 0; font-style: italic;"><strong>结语：</strong> 塑料发明不过百余年，却已渗透进地球几亿年的生态循环中。微塑料不是远在天边的危机，它就在我们的餐桌上，在我们的呼吸里。减少一个塑料袋的使用，或许就是为未来的净土投下的一张选票。</p>
      </div>
    `
  },
  save_turtles: {
    id: 'save_turtles',
    title: '拯救海龟：别让便利成为它们的终结者',
    category: '生态保护',
    date: '2025-12-28',
    views: 892,
    content: `
      <p>在广袤的海洋中，海龟已经存在了超过一亿年。然而，这些古老的航海家正面临着前所未有的威胁——<strong>塑料垃圾</strong>。</p>
      
      <h3>1. 致命的误食</h3>
      <p>对于海龟来说，漂浮在水中的透明塑料袋看起来就像它们最爱的美味——水母。一旦误食，塑料袋会阻塞它们的消化道，导致海龟无法进食，最终在痛苦中慢慢饿死。</p>
      
      <h3>2. “隐形”的吸管</h3>
      <p>你可能还记得那段令全世界心碎的视频：研究人员从一只海龟的鼻孔中拔出一根长长的塑料吸管。吸管、搅拌棒等细小塑料极易刺伤海龟的感官器官，造成永久性伤害。</p>

      <img src="https://images.unsplash.com/photo-1541004995602-b3e89b709903?auto=format&fit=crop&w=800&q=80" alt="Sea Turtle" style="width:100%; border-radius:12px; margin: 20px 0;" />

      <h3>3. 缠绕的噩梦</h3>
      <p>被遗弃的尼龙渔网和塑料绳索被称为“幽灵渔网”。海龟一旦被缠住，便无法浮出水面呼吸，最终溺水而亡。即使侥幸逃脱，缠绕造成的伤口也极易引发严重感染。</p>

      <h3>4. 我们可以如何帮助它们？</h3>
      <ul>
        <li><strong>拒绝塑料吸管：</strong> 尝试使用不锈钢吸管、纸吸管，或者直接饮用。</li>
        <li><strong>海滩清理：</strong> 下次去海边旅行时，顺手捡起沙滩上的塑料瓶和垃圾。</li>
        <li><strong>支持环保组织：</strong> 关注并支持那些致力于海洋生物保护的公益机构。</li>
      </ul>

      <div style="background: rgba(0, 180, 219, 0.1); padding: 20px; border-radius: 12px; margin-top: 30px; border-left: 4px solid #00b4db;">
        <p style="margin: 0; font-style: italic;"><strong>守护：</strong> 每一只成年海龟的存活都是大自然的奇迹。它们跨越千里回到出生地产卵，不应在归途中倒在人类的一念之差。保护海龟，就是保护海洋的生命力。</p>
      </div>
    `
  }
};
