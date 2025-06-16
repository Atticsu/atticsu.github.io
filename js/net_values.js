/* net_values.js — 使用 Plotly 绘制可交互净值曲线 */
fetch('data/net_values.csv')
  .then(r => r.text())
  .then(text => {
    const rows = text.trim().split('\n').slice(1);          // 跳过表头
    const dates = [], values = [];
    rows.forEach(l => {
      const [d, v] = l.split(',');
      dates.push(d.trim());
      values.push(+v);
    });

    const trace = {
      x: dates,
      y: values,
      mode: 'lines',
      line: { color: '#FFA500', width: 2 },
      hovertemplate: '%{x}<br>net value: %{y:.4f}<extra></extra>'
    };

    const layout = {
      margin: { l: 40, r: 20, t: 10, b: 40 },
      paper_bgcolor: 'black',
      plot_bgcolor: 'black',
      font: { color: '#ddd', family: '"Palatino Linotype", serif' },
      xaxis: {
        rangeslider: { visible: true, thickness: 0.1 },
        gridcolor: '#555'
      },
      yaxis: { fixedrange: false, gridcolor: '#555' },
      hovermode: 'x unified'      // 十字线+统一提示
    };

    Plotly.newPlot('nvChart', [trace], layout, {responsive: true});
  });
