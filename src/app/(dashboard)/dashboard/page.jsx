"use client";
import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [filter, setFilter] = useState('Today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?filter=${filter}`);
      const result = await res.json();
      if (result.success) {
        setData(result.stats);
      }
    } catch (err) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filter]);

  const statsConfig = [
    { label: 'Total Sales', value: data?.totalSales || '৳ 0', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Products Sold', value: data?.productsSold || '0', icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Tickets Booked', value: data?.ticketsBooked || '0', icon: Users, color: 'bg-orange-500' },
    { label: 'Tickets Completed', value: data?.ticketsCompleted || '0', icon: CheckCircle, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Business Overview</h1>
          <p className="text-slate-500 font-medium tracking-tight">Real-time insights for {filter}</p>
        </div>

        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
        >
          {['Today', 'Yesterday', 'Last Week', 'Last Month', 'Last Year', 'All Time'].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <stat.icon size={28} />
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.1em]">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 h-96 flex flex-col items-center justify-center text-slate-300">
        <TrendingUp size={48} className="mb-4 opacity-20" />
        <p className="font-bold italic">Sales & Booking Analytics Chart Coming Soon...</p>
      </div>
    </div>
  );
}