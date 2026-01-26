import { ShieldCheck } from 'lucide-react';

const BlockchainView = () => {
  const transactions = [
    { id: '#TXN-9921', hash: '0x71C45...a3f2', status: 'Verified', date: '2024-05-20' },
    { id: '#TXN-9922', hash: '0x82D56...b4e1', status: 'Verified', date: '2024-05-21' },
    { id: '#TXN-9923', hash: '0x93E67...c5d0', status: 'Pending', date: '2024-05-22' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
        <h2 className="text-xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
          <ShieldCheck /> Blockchain Data Integrity
        </h2>
        <p className="text-indigo-800">
          រាល់ប្រតិបត្តិការហិរញ្ញវត្ថុរបស់អ្នកត្រូវបាន Hash និងរក្សាទុកក្នុង Demo Ledger ដើម្បីធានាថាមិនមានការកែបន្លំ។
        </p>
      </div>

      <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 uppercase text-gray-600 font-semibold">
            <tr>
              <th className="p-4">Transaction ID</th>
              <th className="p-4">Data Hash</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium">{txn.id}</td>
                <td className="p-4 font-mono text-xs text-blue-600">{txn.hash}</td>
                <td className="p-4 text-gray-500">{txn.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    txn.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlockchainView;