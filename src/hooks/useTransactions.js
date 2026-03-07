// // src/hooks/useTransactions.js
// import { useState, useEffect } from 'react';
// import { saveTransactions, parseUploadedFile } from '../utils/transactionUtils';

// export const useTransactions = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Load transactions from localStorage
//   const loadTransactions = () => {
//     const saved = localStorage.getItem('user_transactions_list');
//     setTransactions(saved ? JSON.parse(saved) : []);
//   };

//   useEffect(() => {
//     loadTransactions();
    
//     // Listen for changes
//     window.addEventListener('storage', loadTransactions);
//     const interval = setInterval(loadTransactions, 3000);

//     return () => {
//       window.removeEventListener('storage', loadTransactions);
//       clearInterval(interval);
//     };
//   }, []);

//   // Upload file and save
//   const uploadFile = async (file, options = {}) => {
//     setLoading(true);
//     try {
//       const data = await parseUploadedFile(file);
      
//       return new Promise((resolve) => {
//         saveTransactions(data, {
//           ...options,
//           onSuccess: (saved, duplicates) => {
//             loadTransactions();
//             setLoading(false);
//             resolve({ saved, duplicates, success: true });
//           },
//           onDuplicate: (duplicates, unique, onAddAll, onSkip) => {
//             setLoading(false);
//             options.onDuplicate?.(duplicates, unique, onAddAll, onSkip);
//           }
//         });
//       });
//     } catch (error) {
//       setLoading(false);
//       throw error;
//     }
//   };

//   // Add single transaction
//   const addTransaction = (transaction, checkDuplicate = true) => {
//     if (checkDuplicate) {
//       const existing = transactions;
//       const { duplicates } = findDuplicates(existing, [transaction]);
      
//       if (duplicates.length > 0) {
//         return { duplicate: true, transaction: duplicates[0] };
//       }
//     }
    
//     const withId = { ...transaction, id: Date.now() };
//     const updated = [withId, ...transactions];
//     localStorage.setItem('user_transactions_list', JSON.stringify(updated));
//     setTransactions(updated);
    
//     return { success: true, transaction: withId };
//   };

//   // Delete transaction
//   const deleteTransaction = (id) => {
//     const updated = transactions.filter(t => t.id !== id);
//     localStorage.setItem('user_transactions_list', JSON.stringify(updated));
//     setTransactions(updated);
//   };

//   return {
//     transactions,
//     loading,
//     uploadFile,
//     addTransaction,
//     deleteTransaction,
//     refresh: loadTransactions
//   };
// };