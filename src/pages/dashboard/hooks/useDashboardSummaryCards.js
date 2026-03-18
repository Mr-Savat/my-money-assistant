// import { useState, useEffect } from "react";
// import { useTranslation } from "../../../hooks/useTranslation";
// import { useAnimatedNumber } from "./useAnimatedNumber";
// import { auth } from "../../../firebase/config";
// import { onAuthStateChanged } from "firebase/auth";

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// export const useDashboardSummaryCards = () => {
//   const { t } = useTranslation();
//   const [stats, setStats] = useState({
//     balance: 0,
//     income: 0,
//     expense: 0
//   });
//   const [userData, setUserData] = useState({
//     spendingLimit: 0,
//     monthlySalary: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   //  ពិនិត្យស្ថានភាព Authentication 
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setIsAuthenticated(!!user);
//       if (!user) {
//         setLoading(false);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const getToken = async () => {
//     const user = auth.currentUser;
//     if (!user) return null;

//     // ព្យាយាមយក Token ថ្មី (force refresh)
//     try {
//       return await user.getIdToken(true);
//     } catch {
//       return await user.getIdToken();
//     }
//   };

//   const fetchSummary = async () => {
//     if (!isAuthenticated) return;

//     const token = await getToken();
//     if (!token) return;

//     try {
//       const response = await fetch(`${API_URL}/api/dashboard/summary`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         // Token ផុតកំណត់ → ព្យាយាមយកថ្មី
//         const newToken = await auth.currentUser?.getIdToken(true);
//         if (newToken) {
//           const retry = await fetch(`${API_URL}/api/dashboard/summary`, {
//             headers: { 'Authorization': `Bearer ${newToken}` }
//           });
//           const data = await retry.json();
//           if (data.success) {
//             setStats({
//               balance: data.summary.balance,
//               income: data.summary.income,
//               expense: data.summary.expense
//             });
//           }
//         }
//         return;
//       }

//       const data = await response.json();

//       if (data.success) {
//         setStats({
//           balance: data.summary.balance,
//           income: data.summary.income,
//           expense: data.summary.expense
//         });
//       }
//     } catch (err) {
//       console.error('Error fetching summary:', err);
//     }
//   };

//   const fetchUserData = async () => {
//     if (!isAuthenticated) return;

//     const token = await getToken();
//     if (!token) return;

//     try {
//       const response = await fetch(`${API_URL}/api/users/profile`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         // Token ផុតកំណត់ → ព្យាយាមយកថ្មី
//         const newToken = await auth.currentUser?.getIdToken(true);
//         if (newToken) {
//           const retry = await fetch(`${API_URL}/api/users/profile`, {
//             headers: { 'Authorization': `Bearer ${newToken}` }
//           });
//           const data = await retry.json();
//           if (data.success) {
//             setUserData({
//               spendingLimit: data.user.spendingLimit || 0,
//               monthlySalary: data.user.monthlySalary || 0
//             });
//           }
//         }
//         return;
//       }

//       const data = await response.json();

//       if (data.success) {
//         setUserData({
//           spendingLimit: data.user.spendingLimit || 0,
//           monthlySalary: data.user.monthlySalary || 0
//         });
//       }
//     } catch (err) {
//       console.error('Error fetching user data:', err);
//     }
//   };

//   //  ទាញយកទិន្នន័យពេលមានអ្នកប្រើ 
//   useEffect(() => {
//     if (isAuthenticated) {
//       const loadData = async () => {
//         setLoading(true);
//         await Promise.all([fetchSummary(), fetchUserData()]);
//         setLoading(false);
//       };
//       loadData();
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isAuthenticated]);

//   // Refresh every 30 seconds
//   useEffect(() => {
//     if (!isAuthenticated) return;

//     const interval = setInterval(() => {
//       fetchSummary();
//     }, 30000);

//     return () => clearInterval(interval);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isAuthenticated]);

//   const hasLimit = userData.spendingLimit && userData.spendingLimit > 0;
//   const spendingPercentage = userData.spendingLimit > 0
//     ? Math.min(100, Math.round((stats.expense / userData.spendingLimit) * 100))
//     : 0;

//   const isOverLimit = stats.expense > userData.spendingLimit;

//   const formatCurrency = (val) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//     }).format(val);
//   };

//   const animatedBalance = useAnimatedNumber(stats.balance);
//   const animatedIncome = useAnimatedNumber(stats.income);
//   const animatedExpense = useAnimatedNumber(stats.expense);

//   return {
//     t, 
//     stats, 
//     userData, 
//     hasLimit, 
//     spendingPercentage, 
//     isOverLimit, 
//     formatCurrency, 
//     animatedBalance, 
//     animatedIncome, 
//     animatedExpense,
//     loading
//   };
// };


import { useState, useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useAnimatedNumber } from "./useAnimatedNumber";
import { useCachedState } from "../../../hooks/useCachedState";
import { auth } from "../../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useDashboardSummaryCards = () => {
  const { t } = useTranslation();

  //  ប្រើ useCachedState ជំនួស useState 
  const [stats, setStats] = useCachedState('dashboard_stats', {
    balance: 0,
    income: 0,
    expense: 0
  });

  const [userData, setUserData] = useCachedState('user_profile', {
    spendingLimit: 0,
    monthlySalary: 0
  });

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  const fetchSummary = async () => {
    if (!isAuthenticated) return;

    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/dashboard/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setStats({
          balance: data.summary.balance,
          income: data.summary.income,
          expense: data.summary.expense
        });
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchUserData = async () => {
    if (!isAuthenticated) return;

    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setUserData({
          spendingLimit: data.user.spendingLimit || 0,
          monthlySalary: data.user.monthlySalary || 0
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  //  ទាញយកទិន្នន័យពេលមានអ្នកប្រើ 
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchUserData()]);
      setLoading(false);
    };

    loadData();

    // ++++++ ស្តាប់ transactions-updated event ++++++
    const handleTransactionUpdate = () => {
      fetchSummary(); // ទាញយក Summary ថ្មី
    };

    window.addEventListener('transactions-updated', handleTransactionUpdate);

    return () => {
      window.removeEventListener('transactions-updated', handleTransactionUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchSummary();
    }, 30000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const hasLimit = userData.spendingLimit && userData.spendingLimit > 0;
  const spendingPercentage = userData.spendingLimit > 0
    ? Math.min(100, Math.round((stats.expense / userData.spendingLimit) * 100))
    : 0;

  const isOverLimit = stats.expense > userData.spendingLimit;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const animatedBalance = useAnimatedNumber(stats.balance);
  const animatedIncome = useAnimatedNumber(stats.income);
  const animatedExpense = useAnimatedNumber(stats.expense);

  return {
    t,
    stats,
    userData,
    hasLimit,
    spendingPercentage,
    isOverLimit,
    formatCurrency,
    animatedBalance,
    animatedIncome,
    animatedExpense,
    loading,
    refreshSummary: fetchSummary 
  };
};