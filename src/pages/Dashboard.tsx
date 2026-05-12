import { useState, useEffect } from 'react';
import { Users, Building2, TrendingUp, PhoneCall, Loader2 } from 'lucide-react';
import api from '../services/api';

interface Stat {
  name: string;
  value: string;
  icon: any;
  change: string;
  changeType: 'positive' | 'negative';
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        if (data.success) {
          const { totalInquiries, activeColleges, pendingCalls, conversionRate } = data.data;
          
          setStats([
            { name: 'Total Inquiries', value: totalInquiries.value, icon: Users, change: totalInquiries.change, changeType: totalInquiries.changeType },
            { name: 'Active Colleges', value: activeColleges.value, icon: Building2, change: activeColleges.change, changeType: activeColleges.changeType },
            { name: 'Calls Pending', value: pendingCalls.value, icon: PhoneCall, change: pendingCalls.change, changeType: pendingCalls.changeType },
            { name: 'Conversion Rate', value: conversionRate.value, icon: TrendingUp, change: conversionRate.change, changeType: conversionRate.changeType },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor your lead generation metrics and college performance seamlessly.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-gray-900/5 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
              <dt>
                <div className="absolute rounded-xl bg-blue-50 p-3">
                  <stat.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </p>
              </dd>
            </div>
          ))}
        </div>
      )}

      {/* Placeholder Chart Area */}
      <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5 min-h-[400px] flex items-center justify-center border border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">Real-Time Analytics Chart Module (Coming Soon)</p>
      </div>
    </div>
  );
};
