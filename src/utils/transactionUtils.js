import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * បង្កើត Key សម្រាប់ពិនិត្យ Duplicate
 */
export const generateTransactionKey = (transaction) => {
  const dateStr = transaction.date ? String(transaction.date).split('T')[0] : '';
  const amt = parseFloat(transaction.amount);
  const descStr = transaction.description ? String(transaction.description).toLowerCase().trim() : '';
  return `${dateStr}|${amt}|${descStr}`;
};

/**
 * ពិនិត្យរក Duplicate ក្នុង List
 */
export const findDuplicates = (existingTransactions = [], newTransactions = []) => {
  // បង្កើត Set នៃ Keys របស់ទិន្នន័យចាស់
  const existingKeys = new Set(
    existingTransactions.map(t => generateTransactionKey(t))
  );

  // ចែកជា 2 ក្រុម
  const duplicates = [];
  const unique = [];

  newTransactions.forEach(newTxn => {
    const key = generateTransactionKey(newTxn);
    if (existingKeys.has(key)) {
      duplicates.push(newTxn);
    } else {
      unique.push(newTxn);
      existingKeys.add(key); // ការពារ Duplicate ក្នុង File តែមួយ
    }
  });

  return { duplicates, unique };
};

/**
 * បន្ថែម ID ឲ្យ Transactions
 */
export const addIdsToTransactions = (transactions) => {
  return transactions.map(t => ({
    ...t,
    id: t.id || Date.now() + Math.random() * 1000,
    amount: parseFloat(t.amount)
  }));
};

/**
 * រក្សាទុក Transactions (ជ្រើសរើសថាបន្ថែម ឬជំនួស)
 */
export const saveTransactions = (newTransactions, options = {}) => {
  const { mode = 'append', onSuccess, onDuplicate, existingTransactions } = options;

  // 1. Always prioritize live transactions passed from backend/state over localStorage
  const existing = Array.isArray(existingTransactions)
    ? existingTransactions
    : JSON.parse(localStorage.getItem('user_transactions_list') || '[]');

  // 2. Prepare the new transactions with IDs
  const withIds = addIdsToTransactions(newTransactions);

  if (mode === 'replace') {
    localStorage.removeItem('user_transactions_list');
    onSuccess?.(withIds, []);
    return { saved: withIds, duplicates: [] };
  }

  // 3. Check for duplicates against the EXISTING list
  const { duplicates, unique } = findDuplicates(existing, withIds);

  if (duplicates.length > 0 && onDuplicate) {
    onDuplicate(duplicates, unique, () => {
      // Callback: User wants to add EVERYTHING (including duplicates)
      const merged = [...existing, ...withIds]; 
      localStorage.removeItem('user_transactions_list');
      onSuccess?.(withIds, duplicates, merged);
    }, () => {
      // Callback: User wants to skip duplicates (Add only unique)
      const merged = [...existing, ...unique];
      localStorage.removeItem('user_transactions_list');
      onSuccess?.(unique, duplicates, merged);
    });
  } else {
    // No duplicates found, append unique items immediately
    const merged = [...existing, ...unique];
    localStorage.removeItem('user_transactions_list');
    onSuccess?.(unique, duplicates, merged);
  }

  return { duplicates, unique };
};
/**
 * អានឯកសារ CSV ឬ Excel
 */
// ក្នុង parseUploadedFile
export const parseUploadedFile = (file) => {
  return new Promise((resolve, reject) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        let rawData = [];
        if (extension === 'csv') {
          const result = Papa.parse(evt.target.result, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().toLowerCase()
          });
          rawData = result.data.filter(row => Object.keys(row).length > 0);
        } else {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          rawData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          rawData = rawData.map(row => {
            const newRow = {};
            Object.keys(row).forEach(key => {
              newRow[key.trim().toLowerCase()] = row[key];
            });
            return newRow;
          });
        }

        // Normalize each row for reliable data types and naming
        const jsonData = rawData.map(row => {
          const item = { ...row };
          
          // Date normalization
          let d = item.date;
          if (typeof d === 'number') {
            // Excel serial date to YYYY-MM-DD
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            const dateObj = new Date(excelEpoch.getTime() + d * 86400000);
            d = dateObj.toISOString().split('T')[0];
          } else if (d) {
            const parsed = new Date(d);
            if (!isNaN(parsed.getTime())) {
              d = parsed.toISOString().split('T')[0];
            }
          }
          item.date = d || new Date().toISOString().split('T')[0];

          // Amount normalization
          if (item.amount !== undefined && item.amount !== null) {
            const cleanStr = String(item.amount).replace(/[^0-9.-]/g, '');
            item.amount = parseFloat(cleanStr) || 0;
          } else {
            item.amount = 0;
          }

          item.description = item.description ? String(item.description).trim() : 'Transaction';
          item.category = item.category ? String(item.category).trim() : 'Other';

          return item;
        });

        resolve(jsonData);
      } catch (err) {
        console.error(err);
        reject(new Error("Problem reading data. Check file format."));
      }
    };

    reader.onerror = () => reject(new Error("Error reading file"));

    if (extension === 'csv') reader.readAsText(file);
    else reader.readAsBinaryString(file);
  });
};

/**
 * ជំនួយទាញយកទិន្នន័យ Template ពីខែ 8 ដល់បច្ចុប្បន្ន (August to Current)
 */
export const getAugustToCurrentTemplateData = () => {
  const now = new Date();
  const year = now.getFullYear(); // 2026

  return [
    // Month 8 (August 2026)
    { date: `${year}-08-01`, description: 'Monthly Salary', amount: 3000, category: 'Income' },
    { date: `${year}-08-03`, description: 'Supermarket Groceries', amount: -65.50, category: 'Food' },
    { date: `${year}-08-07`, description: 'Gasoline Refuel', amount: -40.00, category: 'Transport' },
    { date: `${year}-08-12`, description: 'Electricity & Utilities', amount: -85.00, category: 'Bills' },
    { date: `${year}-08-16`, description: 'Dinner Restaurant', amount: -38.00, category: 'Food' },
    { date: `${year}-08-20`, description: 'Education & Books', amount: -29.99, category: 'Education' },
    { date: `${year}-08-25`, description: 'Shopping Clothes', amount: -75.00, category: 'Shopping' },
    { date: `${year}-08-29`, description: 'Coffee & Snacks', amount: -12.50, category: 'Food' },

    // Month 9 (Current - September 2026)
    { date: `${year}-09-01`, description: 'Monthly Salary', amount: 3000, category: 'Income' },
    { date: `${year}-09-02`, description: 'Supermarket Food', amount: -54.00, category: 'Food' },
    { date: `${year}-09-03`, description: 'Transport & Fuel', amount: -35.00, category: 'Transport' },
    { date: `${year}-09-04`, description: 'Pharmacy Care', amount: -22.00, category: 'Health' },
    { date: `${year}-09-05`, description: 'Coffee Break', amount: -5.50, category: 'Food' },
    { date: `${year}-09-06`, description: 'Lunch Special', amount: -11.50, category: 'Food' },
  ];
};

/**
 * ទាញយក Template CSV (Monthly Summary)
 */
export const downloadMonthlyTemplate = () => {
  const template = [
    { month: 'Jun', food: 320, transport: 110, shopping: 190, other: 60 },
    { month: 'Jul', food: 340, transport: 120, shopping: 200, other: 70 },
    { month: 'Aug', food: 360, transport: 130, shopping: 220, other: 80 },
    { month: 'Sep', food: 180, transport: 65, shopping: 110, other: 40 }, // ខែ 9 បច្ចុប្បន្ន
  ];

  const csv = Papa.unparse(template);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'monthly_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * ទាញយក Template CSV (Transaction Data)
 */
export const downloadTransactionTemplate = () => {
  const template = getAugustToCurrentTemplateData();

  const csv = Papa.unparse(template);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transaction_template.csv';
  document.body.appendChild(link);
  link.click();
};

/**
 * ទាញយក Template Excel (Transaction Data)
 */
export const downloadExcelTemplate = () => {
  const template = getAugustToCurrentTemplateData();

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(template);
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  
  // បន្ថែមសន្លឹក Instructions
  const instructions = [
    { A: 'INSTRUCTIONS:', B: '' },
    { A: '1. Date format: YYYY-MM-DD (From Month 8 to Current)', B: '' },
    { A: '2. Amount: negative for expense, positive for income', B: '' },
    { A: '3. Category: use any category name', B: '' },
  ];
  const wsInstructions = XLSX.utils.json_to_sheet(instructions, { skipHeader: true });
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  XLSX.writeFile(wb, 'transaction_template.xlsx');
};

/**
 * ++++++++++ បន្ថែមថ្មី: ទាញយក Template Excel (Monthly Summary) ++++++++++
 */
export const downloadExcelMonthlyTemplate = () => {
  const template = [
    { month: 'Jun', food: 320, transport: 110, shopping: 190, other: 60 },
    { month: 'Jul', food: 340, transport: 120, shopping: 200, other: 70 },
    { month: 'Aug', food: 360, transport: 130, shopping: 220, other: 80 },
    { month: 'Sep', food: 180, transport: 65, shopping: 110, other: 40 },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(template);
  XLSX.utils.book_append_sheet(wb, ws, 'Monthly Summary');
  
  // បន្ថែមសន្លឹក Instructions
  const instructions = [
    { A: 'INSTRUCTIONS:', B: '' },
    { A: '1. Month: Jun, Jul, Aug, Sep (Leading to current month)', B: '' },
    { A: '2. Food: total food expenses for the month', B: '' },
    { A: '3. Transport: total transport expenses', B: '' },
    { A: '4. Shopping: total shopping expenses', B: '' },
    { A: '5. Other: other expenses', B: '' },
    { A: '6. Fill in your actual numbers', B: '' },
  ];
  const wsInstructions = XLSX.utils.json_to_sheet(instructions, { skipHeader: true });
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  XLSX.writeFile(wb, 'monthly_template.xlsx');
};

/**
 * ++++++++++ បន្ថែម: ទាញយក Template ទាំងអស់តាមប្រភេទ ++++++++++
 */
export const downloadTemplate = (type, format) => {
  if (type === 'transaction') {
    if (format === 'csv') {
      downloadTransactionTemplate();
    } else {
      downloadExcelTemplate();
    }
  } else {
    if (format === 'csv') {
      downloadMonthlyTemplate();
    } else {
      downloadExcelMonthlyTemplate();
    }
  }
};

/**
 * បំប្លែង និងទាញយកទិន្នន័យប្រភេទចំណាយពីទិន្នន័យសង្ខេបប្រចាំខែ (Month Data)
 */
export const extractCategoryBreakdown = (monthRow) => {
  if (!monthRow) return [];
  const ignoredKeys = new Set([
    'month', 'year', 'total', 'actualvalue', 'actualdisplay',
    'predicteddisplay', 'isforecast', 'date', 'amount', 'description', 'category'
  ]);

  const categories = Object.entries(monthRow)
    .filter(([key, val]) => !ignoredKeys.has(key.toLowerCase()) && typeof val === 'number' && val > 0)
    .map(([key, val]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: val
    }))
    .sort((a, b) => b.value - a.value);

  const MAX_CATEGORIES = 5;
  if (categories.length <= MAX_CATEGORIES) {
    return categories;
  }
  const top4 = categories.slice(0, 4);
  const otherItems = categories.slice(4);
  const otherTotal = otherItems.reduce((sum, item) => sum + item.value, 0);
  return [
    ...top4,
    {
      name: `Other (${otherItems.length})`,
      value: otherTotal,
      originalItems: otherItems
    }
  ];
};