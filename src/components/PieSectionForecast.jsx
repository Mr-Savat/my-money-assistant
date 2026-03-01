import { PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';

//  Improved Tooltip UI 
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name, value, originalItems, fill } = payload[0].payload;
        const isOther = name.includes("Other");

        return (
            <div className="bg-white/95 backdrop-blur-sm p-4 shadow-2xl rounded-2xl border border-gray-100 min-w-45 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fill }} />
                    <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">{name}</p>
                </div>

                <div className="text-xl font-black text-gray-800">
                    ${value.toLocaleString()}
                </div>

                {isOther && originalItems && (
                    <div className="mt-3 pt-2 border-t border-dashed border-gray-200 flex flex-col gap-1.5">
                        {originalItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] text-gray-500">
                                <span className="opacity-80">{item.name}</span>
                                <span className="font-semibold text-gray-700">${item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

// Component to make the hovered slice expand
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6} // Makes it pop out
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                cornerRadius={6} // Smooth edges
            />
        </g>
    );
};

const PieSection = ({ transactions, COLORS, formatCurrency }) => {
    // Logic remains exactly as you wrote it
    const calculateCategoryTotals = () => {
        if (!transactions || transactions.length === 0) return [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const currentMonthExpenses = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getFullYear() === currentYear &&
                transDate.getMonth() === currentMonth &&
                parseFloat(t.amount) < 0;
        });

        const categoryMap = currentMonthExpenses.reduce((acc, curr) => {
            const category = curr.category || 'Other';
            const amount = Math.abs(parseFloat(curr.amount));
            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {});

        const sorted = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const MAX_CATEGORIES = 5;
        if (sorted.length <= MAX_CATEGORIES) {
            return sorted;
        } else {
            const top4 = sorted.slice(0, 4);
            const otherItems = sorted.slice(4);
            const otherTotal = otherItems.reduce((sum, item) => sum + item.value, 0);
            return [
                ...top4,
                {
                    name: `Other (${otherItems.length})`,
                    value: otherTotal,
                    originalItems: otherItems
                }
            ];
        }
    };

    const data = calculateCategoryTotals();
    const hasData = data.length > 0;

    return (

            <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-4xl border border-gray-100 flex flex-col relative transition-all duration-300 hover:shadow-sm h-full">
            <h3 className="font-bold text-gray-700 mb-4 sm:mb-6 lg:mb-8 flex flex-wrap justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <PieIcon size={14} className="sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-indigo-500" /> 
                <span>Category Breakdown Expense</span>
                {hasData && <span className="text-[8px] sm:text-[10px] text-gray-500 font-normal ml-1 tracking-tight">(This Month)</span>}
            </h3>

            <div className="h-48 sm:h-56 lg:h-64 flex-1 relative">
                {!hasData && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 text-gray-400 font-medium text-xs sm:text-sm italic px-4 text-center">
                        No expense data this month
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                            data={hasData ? data : [{ name: 'Empty', value: 1 }]}
                            innerRadius={50} // Smaller for mobile
                            outerRadius={70} // Smaller for mobile
                            paddingAngle={hasData ? 5 : 0}
                            dataKey="value"
                            stroke="none"
                            activeShape={hasData ? renderActiveShape : null}
                            animationBegin={0}
                            animationDuration={1200}
                        >
                            {hasData ? (
                                data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS.pie[index % COLORS.pie.length]}
                                        className="outline-none"
                                    />
                                ))
                            ) : (
                                <Cell fill="#e2e8f0" />
                            )}
                        </Pie>

                        {hasData && (
                            <Tooltip 
                                content={<CustomTooltip />} 
                                cursor={false} 
                                wrapperStyle={{ outline: 'none' }}
                            />
                        )}

                        {hasData && (
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                iconSize={6}
                                wrapperStyle={{ paddingTop: '15px' }}
                                formatter={(value) => {
                                    const item = data.find(d => d.name === value);
                                    return (
                                        <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-600 ml-1">
                                            {value} <span className="text-gray-400 font-normal ml-1">(${item?.value.toLocaleString()})</span>
                                        </span>
                                    );
                                }}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {hasData && (
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-bold">Monthly Spend</span>
                        <span className="text-xs sm:text-sm font-black text-gray-800">
                            ${data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PieSection;