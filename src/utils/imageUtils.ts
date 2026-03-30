/**
 * PNG 变色逻辑 (Canvas)
 */
export async function tintPNG(file: File, color: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // 1. 绘制原始图片
      ctx.drawImage(img, 0, 0);

      // 2. 使用 source-in 模式填充目标颜色
      // 这会将所有非透明像素替换为目标颜色，并保留原始透明度
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * SVG 变色逻辑 (DOM Parser)
 */
export async function tintSVG(file: File, color: string): Promise<string> {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) {
    throw new Error('无效的 SVG 文件');
  }

  // 递归修改颜色属性
  const modifyElements = (elements: HTMLCollection | NodeList) => {
    Array.from(elements).forEach((el) => {
      if (el instanceof SVGElement) {

        const fill = el.getAttribute('fill');
        const stroke = el.getAttribute('stroke');

        if (fill && fill !== 'none') {
          el.setAttribute('fill', color);
        }
        if (stroke && stroke !== 'none') {
          el.setAttribute('stroke', color);
        }
        
        // 如果既没有 fill 也没有 stroke，默认给个 fill (针对某些简写 SVG)
        if (!fill && !stroke && ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline'].includes(el.tagName.toLowerCase())) {
           el.setAttribute('fill', color);
        }

        if (el.children.length > 0) {
          modifyElements(el.children);
        }
      }
    });
  };

  // 如果根节点有 fill 属性且不是 none，也修改它
  if (svg.getAttribute('fill') && svg.getAttribute('fill') !== 'none') {
    svg.setAttribute('fill', color);
  }

  modifyElements(svg.childNodes);

  const serializer = new XMLSerializer();
  const tintedSvgString = serializer.serializeToString(doc);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(tintedSvgString)))}`;
}

/**
 * 检测图片是否为单色 (合规性检测)
 */
export async function checkIsSingleColor(file: File): Promise<boolean> {
  if (file.type === 'image/svg+xml') {
    const text = await file.text();
    const colors = new Set<string>();
    const matches = text.match(/(fill|stroke)="(?!none)[^"]+"/g) || [];
    matches.forEach(m => {
      const color = m.split('"')[1];
      colors.add(color.toLowerCase());
    });
    return colors.size <= 1;
  } else {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(true);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = new Set<string>();
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 10) { // 只看非透明像素
            const rgb = `${data[i]},${data[i+1]},${data[i+2]}`;
            colors.add(rgb);
            if (colors.size > 1) {
              resolve(false);
              return;
            }
          }
        }
        resolve(true);
      };
      img.onerror = () => resolve(true);
      img.src = URL.createObjectURL(file);
    });
  }
}

/**
 * 通用变色入口
 */
export async function tintIcon(file: File, color: string): Promise<{ url: string, isSingleColor: boolean }> {
  let url = '';
  const isSingleColor = await checkIsSingleColor(file);

  if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
    url = await tintSVG(file, color);
  } else if (file.type === 'image/png' || file.name.endsWith('.png')) {
    url = await tintPNG(file, color);
  } else {
    throw new Error('不支持的文件格式，请上传 PNG 或 SVG');
  }

  return { url, isSingleColor };
}

