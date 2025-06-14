fetch('data/net_values.csv')
  .then(r => r.text())
  .then(text => {
    const pts = text.trim().split('\n').slice(1).map(l=>{
      const [d,v] = l.split(',');
      return { d, v: parseFloat(v) };
    });

    const c   = document.getElementById('nvChart');
    const ctx = c.getContext('2d');
    const w   = c.width,  h = c.height, pad = 40;
    const max = Math.max(...pts.map(p=>p.v));
    const min = Math.min(...pts.map(p=>p.v));
    const xstep = (w - 2*pad) / (pts.length - 1);

    /* ---- 坐标轴 / 网格线（浅灰） ---- */
    ctx.strokeStyle = '#8a8a8a';
    ctx.lineWidth   = 1;

    // y 轴
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h-pad);
    ctx.stroke();

    // x 轴
    ctx.beginPath();
    ctx.moveTo(pad, h-pad);
    ctx.lineTo(w-pad, h-pad);
    ctx.stroke();

    /* ---- 折线（橘黄） ---- */
    ctx.strokeStyle = '#FFA500';   // 橘黄色
    ctx.lineWidth   = 2;

    ctx.beginPath();
    pts.forEach((p,i)=>{
      const x = pad + i * xstep;
      const y = h - pad - (p.v - min) / (max - min) * (h - 2*pad);
      i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.stroke();
    /* ---- 坐标轴 / 网格线（浅灰） ---- */
  ctx.strokeStyle = '#8a8a8a';
  ctx.lineWidth   = 1;

  // 左 & 下轴
  ctx.beginPath();
  ctx.moveTo(pad, pad);          // y 轴
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);  // x 轴
  ctx.stroke();

  // 右 & 上边框：把框补全
  ctx.beginPath();
  ctx.moveTo(w - pad, h - pad);
  ctx.lineTo(w - pad, pad);      // 右轴
  ctx.lineTo(pad, pad);          // 上轴
  ctx.stroke();

  /* ---- 刻度 & 文本 ---- */
  // y 轴刻度与标签（取 4 个均分）
  const yTicks = 4;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#8a8a8a';
  for (let i = 0; i <= yTicks; i++) {
    const yVal = min + (max - min) * (i / yTicks);
    const yPos = h - pad - (yVal - min) / (max - min) * (h - 2 * pad);
    // 小刻度线
    ctx.beginPath();
    ctx.moveTo(pad - 4, yPos);
    ctx.lineTo(pad,     yPos);
    ctx.stroke();
    // 数值
    ctx.fillText(yVal.toFixed(3), pad - 6, yPos);
  }

  // x 轴刻度：首尾两端日期
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(pts[0].d,  pad,           h - pad + 6);
  ctx.fillText(pts.at(-1).d, w - pad,    h - pad + 6);

  /* ---- 折线（橘黄） ---- */
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  // ...保持原折线绘制逻辑不变

  });

