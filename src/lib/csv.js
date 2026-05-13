export const splitCsvLines = (text) => text.trim().split(/\r?\n/).filter(Boolean);

export const headerMatches = (header, variants) =>
  variants.some(
    (candidate) =>
      header === candidate || header.toLowerCase() === candidate.toLowerCase()
  );

export const parsePortfolioCsv = (text) => {
  const lines = splitCsvLines(text);
  if (!lines.length) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const idx = {
    ticker: headers.findIndex((h) => headerMatches(h, ['ticker', '代码'])),
    name: headers.findIndex((h) => headerMatches(h, ['stock_name', '股票名称'])),
    weight: headers.findIndex((h) => headerMatches(h, ['weight', '权重'])),
    reason: headers.findIndex((h) => headerMatches(h, ['reason', '投资理由'])),
  };

  return lines
    .slice(1)
    .map((line) => {
      const cells = line.split(',').map((cell) => cell.trim());
      return {
        ticker: idx.ticker >= 0 ? cells[idx.ticker] : '',
        name: idx.name >= 0 ? cells[idx.name] : '',
        weight: idx.weight >= 0 ? Number(cells[idx.weight]) : 0,
        reason: idx.reason >= 0 ? cells[idx.reason] : '',
      };
    })
    .filter((row) => row.ticker);
};

export const parseNetValuesCsv = (text) => {
  const lines = splitCsvLines(text);
  if (lines.length <= 1) return [];

  return lines
    .slice(1)
    .map((line) => {
      const [date, value, pctChange] = line.split(',').map((entry) => entry.trim());
      return {
        date,
        value: Number(value),
        pctChange: Number(pctChange),
      };
    })
    .filter((row) => row.date && !Number.isNaN(row.value));
};

export const filterNetValuesByRange = (data, range) => {
  if (!data.length) return [];

  const latestDate = new Date(data[data.length - 1].date);
  const monthsBack = {
    '3M': 3,
    '6M': 6,
    '1Y': 12,
  }[range] || 12;

  const threshold = new Date(latestDate);
  threshold.setMonth(threshold.getMonth() - monthsBack);

  return data.filter((entry) => new Date(entry.date) >= threshold);
};
