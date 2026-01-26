import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { financeData } from '../constants';

const StatCard = ({ label, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <p className="text-gray-500 text-sm mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const DashboardView = () => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">ផ្ទាំងគ្រប់គ្រងហិរញ្ញវត្ថុ</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard label="ចំណូលសរុប" value="$5,600" color="text-green-600" />
      <StatCard label="ចំណាយសរុប" value="$4,050" color="text-red-600" />
      <StatCard label="សមតុល្យ" value="$1,550" color="text-blue-600" />
    </div>
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="mb-4 font-semibold">ស្ថិតិចំណូល និងចំណាយប្រចាំខែ</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={financeData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default DashboardView;