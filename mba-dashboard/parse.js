const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelFilePath = path.join(__dirname, '..', 'MBA_Database_Cleaned_No_Duplicates.xlsx');
const jsonFilePath = path.join(__dirname, 'src', 'data', 'colleges.json');

try {
  console.log(`Reading: ${excelFilePath}`);
  const workbook = xlsx.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  const rawData = xlsx.utils.sheet_to_json(sheet);
  
  // The first row contains the actual headers in values
  const headerRow = rawData[0];
  
  const cleanData = rawData.slice(1).map(row => {
    // Helper to extract numeric value from string like "₹34.29L"
    const extractNumber = (str) => {
      if (!str) return null;
      if (typeof str === 'number') return str;
      const numStr = str.replace(/[^0-9.]/g, '');
      return numStr ? parseFloat(numStr) : null;
    };

    return {
      rank: parseInt(row['Top 100 MBA Colleges in India (2026 Verified Database)']) || null,
      name: row['__EMPTY'] || '',
      city: row['__EMPTY_1'] || '',
      state: row['__EMPTY_2'] || '',
      examAccepted: row['__EMPTY_3'] || '',
      cutoffGem: row['__EMPTY_4'] || '',
      cutoffNonGem: row['__EMPTY_5'] || '',
      feesStr: row['__EMPTY_6'] || '',
      feesLakhs: extractNumber(row['__EMPTY_6']),
      averageLpaStr: row['__EMPTY_7'] || '',
      averageLpa: extractNumber(row['__EMPTY_7']),
      roi: row['__EMPTY_8'] || '',
      type: row['__EMPTY_9'] || '',
      batchSize: parseInt(row['__EMPTY_10']) || null,
      nirfRank: row['__EMPTY_11'] || '',
      notes: row['__EMPTY_12'] || '',
    };
  }).filter(college => college.name && college.rank); // filter out empty rows
  
  fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });
  fs.writeFileSync(jsonFilePath, JSON.stringify(cleanData, null, 2));
  
  console.log(`Successfully wrote ${cleanData.length} records to ${jsonFilePath}`);
} catch (error) {
  console.error('Error reading excel file:', error);
}
