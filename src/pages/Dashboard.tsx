import { Users, Building2, TrendingUp, PhoneCall } from 'lucide-react';

export const Dashboard = () => {
  const stats = [
    { name: 'Total Inquiries', value: '1,240', icon: Users, change: '+12%', changeType: 'positive' },
    { name: 'Active Colleges', value: '45', icon: Building2, change: '+2', changeType: 'positive' },
    { name: 'Calls Pending', value: '14', icon: PhoneCall, change: '-5', changeType: 'negative' },
    { name: 'Conversion Rate', value: '24.5%', icon: TrendingUp, change: '+4.1%', changeType: 'positive' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor your lead generation metrics and college performance seamlessly.</p>
      </div>

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

      {/* Placeholder Chart Area */}
      <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5 min-h-[400px] flex items-center justify-center border border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">Real-Time Analytics Chart Module (Coming Soon)</p>
      </div>
    </div>
  );
};
