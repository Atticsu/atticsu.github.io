const CSV_PATH = window.PORTFOLIO_CSV || 'data/portfolio.csv';

fetch(CSV_PATH)
  .then(r => r.text())
  .then(text => {
    const rows = text.trim().split('\n').map(r => r.split(','));
    const table = document.getElementById('portfolio');
    // 表头
    const thead = document.createElement('tr');
    rows[0].forEach(h => {
      const th = document.createElement('th');
      th.textContent = h.replace('_',' ');
      thead.appendChild(th);
    });
    table.appendChild(thead);
    // 数据行
    rows.slice(1).forEach(arr=>{
      const tr = document.createElement('tr');
      arr.forEach(c=>{
        const td=document.createElement('td');
        td.textContent=c;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  });
