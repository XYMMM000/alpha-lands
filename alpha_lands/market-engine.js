/* Historical education helpers. No requests, credentials, or trading execution. */
window.AlphaMarket = (() => {
  function sample(source) {
    if (!source || !Array.isArray(source.rows) || source.rows.length < 80) return null;
    const rows = source.rows;
    if (rows.some((r, i) => !Number.isFinite(r.close) || r.close <= 0 ||
      (i && r.date <= rows[i - 1].date))) return null;
    // Fixed split chosen by index, not by the subsequent return.
    return {history: rows.slice(0, 60), future: rows.slice(60, 80), cutoff: rows[59].date};
  }
  function stats(rows) {
    let peak = rows[0].close, drawdown = 0;
    for (const row of rows) {
      peak = Math.max(peak, row.close);
      drawdown = Math.max(drawdown, (peak - row.close) / peak);
    }
    return {change: (rows.at(-1).close / rows[0].close - 1) * 100, drawdown: drawdown * 100};
  }
  function chart(history, future = []) {
    const rows = [...history, ...future], prices = rows.map(r => r.close);
    const low = Math.min(...prices), high = Math.max(...prices), range = high - low || 1;
    const x = i => 45 + i / Math.max(1, rows.length - 1) * 480;
    const y = value => 155 - (value - low) / range * 115;
    const points = (start, end) => rows.slice(start, end).map((r, j) => `${x(start + j).toFixed(1)},${y(r.close).toFixed(1)}`).join(' ');
    const split = history.length - 1;
    return `<svg class="history-chart" viewBox="0 0 550 195" role="img" aria-label="${future.length ? '历史与揭晓区间' : '截至决策日的历史'}收盘价折线图"><path d="M45 35V160H530" fill="none" stroke="#b9c4a4"/><path d="M45 95H530" stroke="#e1e5d2"/><text x="2" y="44">${high.toFixed(2)}</text><text x="2" y="158">${low.toFixed(2)}</text><polyline points="${points(0, history.length)}" fill="none" stroke="#527e61" stroke-width="2.5"/>${future.length ? `<path d="M${x(split)} 30V165" stroke="#b08b4a" stroke-dasharray="4 4"/><polyline points="${points(split, rows.length)}" fill="none" stroke="#ba8c40" stroke-width="2.5"/>` : ''}<text x="45" y="184">${rows[0].date}</text><text x="455" y="184">${rows.at(-1).date}</text></svg>`;
  }
  return {sample, stats, chart};
})();
