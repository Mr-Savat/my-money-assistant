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
 * ទាញយក Template CSV (Monthly Summary)
 */
export const downloadMonthlyTemplate = () => {
  // ទិន្នន័យសម្រាប់ខែមីនា 2026
  const template = [
    { month: 'Jan', food: 300, transport: 100, shopping: 200, other: 50 },
    { month: 'Feb', food: 350, transport: 120, shopping: 180, other: 70 },
    { month: 'Mar', food: 380, transport: 140, shopping: 210, other: 90 },
    { month: 'Apr', food: 0, transport: 0, shopping: 0, other: 0 }, // ខែបច្ចុប្បន្ន (មេសា)
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
  // ទិន្នន័យសម្រាប់ខែមីនា 2026
  const template = [
    { date: '2026-03-01', description: 'Coffee', amount: -2, category: 'Food' },
    { date: '2026-03-01', description: 'Lunch', amount: -8, category: 'Food' },
    { date: '2026-03-02', description: 'Book', amount: -25, category: 'Education' },
    { date: '2026-03-03', description: 'Gas', amount: -30, category: 'Transport' },
    { date: '2026-03-05', description: 'Salary', amount: 1000, category: 'Income' },
  ];

  const csv = Papa.unparse(template);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transaction_template.csv';
  link.click();
};

/**
 * ទាញយក Template Excel (Transaction Data)
 */
export const downloadExcelTemplate = () => {
  // ទិន្នន័យសម្រាប់ខែមីនា 2026
  const template = [
    { date: '2026-03-01', description: 'Coffee', amount: -2, category: 'Food' },
    { date: '2026-03-01', description: 'Lunch', amount: -8, category: 'Food' },
    { date: '2026-03-02', description: 'Book', amount: -25, category: 'Education' },
    { date: '2026-03-03', description: 'Gas', amount: -30, category: 'Transport' },
    { date: '2026-03-05', description: 'Salary', amount: 1000, category: 'Income' },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(template);
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  
  // បន្ថែមសន្លឹក Instructions
  const instructions = [
    { A: 'INSTRUCTIONS:', B: '' },
    { A: '1. Date format: YYYY-MM-DD', B: '' },
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
  // ទិន្នន័យសម្រាប់ខែមីនា 2026
  const template = [
    { month: 'Jan', food: 300, transport: 100, shopping: 200, other: 50 },
    { month: 'Feb', food: 350, transport: 120, shopping: 180, other: 70 },
    { month: 'Mar', food: 380, transport: 140, shopping: 210, other: 90 },
    { month: 'Apr', food: 0, transport: 0, shopping: 0, other: 0 }, // ខែបច្ចុប្បន្ន (មេសា)
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(template);
  XLSX.utils.book_append_sheet(wb, ws, 'Monthly Summary');
  
  // បន្ថែមសន្លឹក Instructions
  const instructions = [
    { A: 'INSTRUCTIONS:', B: '' },
    { A: '1. Month: Jan, Feb, Mar, Apr, ...', B: '' },
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