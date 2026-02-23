// src/utils/transactionUtils.js
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * បង្កើត Key សម្រាប់ពិនិត្យ Duplicate
 */
export const generateTransactionKey = (transaction) => {
  return `${transaction.date}|${transaction.amount}|${transaction.description}`.toLowerCase().trim();
};

/**
 * ពិនិត្យរក Duplicate ក្នុង List
 */
export const findDuplicates = (existingTransactions, newTransactions) => {
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
    id: Date.now() + Math.random() * 1000,
    amount: parseFloat(t.amount)
  }));
};

/**
 * រក្សាទុក Transactions (ជ្រើសរើសថាបន្ថែម ឬជំនួស)
 */
export const saveTransactions = (newTransactions, options = {}) => {
  const { mode = 'append', onSuccess, onDuplicate } = options;

  // ទាញទិន្នន័យចាស់
  const existing = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');

  // បន្ថែម ID
  const withIds = addIdsToTransactions(newTransactions);

  if (mode === 'replace') {
    // ជំនួសទាំងអស់
    localStorage.setItem('user_transactions_list', JSON.stringify(withIds));
    onSuccess?.(withIds, []);
    return { saved: withIds, duplicates: [] };
  }

  // រក Duplicate
  const { duplicates, unique } = findDuplicates(existing, withIds);

  if (duplicates.length > 0 && onDuplicate) {
    // បើមាន Duplicate ហើយមាន Callback
    onDuplicate(duplicates, unique, () => {
      // Callback ពេលអ្នកប្រើចង់បន្ថែមទាំងអស់
      const allWithIds = addIdsToTransactions(newTransactions);
      const merged = [...existing, ...allWithIds];
      localStorage.setItem('user_transactions_list', JSON.stringify(merged));
      onSuccess?.(allWithIds, duplicates);
    }, () => {
      // Callback ពេលអ្នកប្រើចង់រំលង Duplicate
      const merged = [...existing, ...unique];
      localStorage.setItem('user_transactions_list', JSON.stringify(merged));
      onSuccess?.(unique, duplicates);
    });
  } else {
    // គ្មាន Duplicate រក្សាទុកភ្លាម
    const merged = [...existing, ...unique];
    localStorage.setItem('user_transactions_list', JSON.stringify(merged));
    onSuccess?.(unique, duplicates);
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
        let jsonData = [];
        if (extension === 'csv') {
          const result = Papa.parse(evt.target.result, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim() // ++++++++++ Trim column names ++++++++++
          });
          jsonData = result.data.filter(row => Object.keys(row).length > 0);
        } else {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          // ++++++++++ Trim column names for Excel ++++++++++
          jsonData = jsonData.map(row => {
            const newRow = {};
            Object.keys(row).forEach(key => {
              newRow[key.trim()] = row[key];
            });
            return newRow;
          });
        }
        resolve(jsonData);
      } catch (err) {
        console.log(err);

        reject(new Error("Problem reading data. Check file format."));
      }
    };

    reader.onerror = () => reject(new Error("Error reading file"));

    if (extension === 'csv') reader.readAsText(file);
    else reader.readAsBinaryString(file);
  });
};
/**
 * ទាញយក Template CSV
 */
export const downloadTemplate = () => {
  const template = [
    { date: '2026-02-01', description: 'Coffee', amount: -2, category: 'Food' },
    { date: '2026-02-01', description: 'Lunch', amount: -8, category: 'Food' },
    { date: '2026-02-02', description: 'Book', amount: -25, category: 'Education' },
    { date: '2026-02-03', description: 'Gas', amount: -30, category: 'Transport' },
    { date: '2026-02-04', description: 'Salary', amount: 1000, category: 'Income' },
  ];

  const csv = Papa.unparse(template);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transaction_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// បន្ថែម function សម្រាប់ទាញយក Monthly Template
export const downloadMonthlyTemplate = () => {
  const template = [
    { month: 'Jan', food: 300, transport: 100, shopping: 200, other: 50 },
    { month: 'Feb', food: 350, transport: 120, shopping: 180, other: 70 },
    { month: 'Mar', food: 380, transport: 140, shopping: 210, other: 90 },
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

// កែឈ្មោះ function ដើមឲ្យច្បាស់
export const downloadTransactionTemplate = () => {
  const template = [
    { date: '2026-02-01', description: 'Coffee', amount: -2, category: 'Food' },
    { date: '2026-02-01', description: 'Lunch', amount: -8, category: 'Food' },
    { date: '2026-02-02', description: 'Book', amount: -25, category: 'Education' },
  ];

  const csv = Papa.unparse(template);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transaction_template.csv';
  link.click();
};

/**
 * ទាញយក Template Excel
 */
export const downloadExcelTemplate = () => {
  const template = [
    { date: '2026-02-01', description: 'Coffee', amount: -2, category: 'Food' },
    { date: '2026-02-01', description: 'Lunch', amount: -8, category: 'Food' },
    { date: '2026-02-02', description: 'Book', amount: -25, category: 'Education' },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(template);
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  XLSX.writeFile(wb, 'transaction_template.xlsx');
};