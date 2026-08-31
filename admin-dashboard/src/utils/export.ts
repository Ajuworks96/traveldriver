export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  data: T[],
  headers: { key: string; label: string; transform?: (val: any, row: T) => string }[]
) {
  if (!data || data.length === 0) return;

  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(',');
  const rows = data.map((row) =>
    headers
      .map((h) => {
        let val = h.key.includes('.')
          ? h.key.split('.').reduce((obj, k) => obj?.[k], row)
          : row[h.key];

        if (h.transform) {
          val = h.transform(val, row);
        }

        if (val === null || val === undefined) val = '';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',')
  );

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headerRow, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
