/**
 * Triggers a browser download for the given CSV data.
 * @param csvData The string content of the CSV file.
 * @param filename The desired name for the downloaded file.
 */
export const downloadCsv = (csvData: string, filename: string): void => {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};