import { useEffect, useState, useCallback } from 'react';
import { 
  Users, PhoneCall, Mail, GraduationCap, Building2, 
  Search, Filter, Download, ChevronLeft, ChevronRight, MoreHorizontal,
  Calendar, Loader2, X
} from 'lucide-react';
import api from '../services/api';

interface Lead {
  phone: string;
  studentName: string;
  email: string | null;
  highSchoolPercent: number;
  interestedStream: string;
}

interface Inquiry {
  id: string;
  status: 'PENDING' | 'CALLED' | 'INTERESTED' | 'ADMITTED';
  createdAt: string;
  lead: Lead;
  college: { id: string, name: string } | null;
}

interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export const Inquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const { data } = await api.get(`/inquiries?${params.toString()}`);
      setInquiries(data.data);
      setMeta(data.meta);
    } catch (error) {
      console.error('Failed to fetch inquiries', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchInquiries]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/inquiries/${id}/status`, { status });
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: status as Inquiry['status'] } : inq))
      );
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      params.append('all', 'true');
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const { data } = await api.get(`/inquiries?${params.toString()}`);
      const exportData = data.data;

      const headers = ['Date', 'Student Name', 'Phone', 'Email', '12th %', 'Stream', 'College', 'Status'];
      const rows = exportData.map((inq: any) => [
        `"${new Date(inq.createdAt).toLocaleDateString()}"`,
        `"${inq.lead.studentName}"`,
        `"${inq.lead.phone}"`,
        `"${inq.lead.email || 'N/A'}"`,
        inq.lead.highSchoolPercent,
        `"${inq.lead.interestedStream}"`,
        `"${inq.college?.name || 'General Support (Platform)'}"`,
        `"${inq.status}"`
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `inquiries_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CALLED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'INTERESTED': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      case 'ADMITTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* ─── HEADER SECTION ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Users className="w-7 h-7 text-blue-600" /> 
            Student Discovery
          </h1>
          <p className="text-sm font-medium text-slate-500">Manage and track student inquiries across the ecosystem.</p>
        </div>
        
        <button 
          onClick={exportToCSV}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export Filtered
        </button>
      </div>

      {/* ─── FILTERS BAR ────────────────────────────── */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search student, phone, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Date Range Group */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">From</span>
            <input 
               type="date"
               className="bg-transparent border-none text-[11px] font-black outline-none w-28 cursor-pointer uppercase"
               value={startDate}
               onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">To</span>
            <input 
               type="date"
               className="bg-transparent border-none text-[11px] font-black outline-none w-28 cursor-pointer uppercase"
               value={endDate}
               onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={clearDateFilters}
              className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
              title="Clear dates"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl min-w-[160px]">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            className="bg-transparent border-none text-sm font-bold focus:ring-0 outline-none w-full cursor-pointer"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">Status: All</option>
            <option value="PENDING">Pending</option>
            <option value="CALLED">Called</option>
            <option value="INTERESTED">Interested</option>
            <option value="ADMITTED">Admitted</option>
          </select>
        </div>
      </div>

      {/* ─── TABLE VIEW ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Student Info</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Target College</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Academics</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Date Received</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Search className="w-10 h-10 text-slate-400" />
                      <p className="text-sm font-black uppercase tracking-widest">No matching inquiries found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-black text-slate-900">{inq.lead.studentName}</p>
                        <div className="flex items-center gap-3 mt-1 font-bold">
                           <a href={`tel:${inq.lead.phone}`} className="text-[11px] text-blue-600 flex items-center gap-1 hover:underline">
                             <PhoneCall className="w-3 h-3" /> {inq.lead.phone}
                           </a>
                           {inq.lead.email && (
                             <span className="text-[11px] text-slate-400 flex items-center gap-1">
                               <Mail className="w-3 h-3" /> {inq.lead.email}
                             </span>
                           )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-300" />
                        <div>
                          <p className="text-sm font-bold text-slate-700">{inq.college?.name || 'General Support (Platform)'}</p>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{inq.lead.interestedStream}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg w-fit">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-black text-slate-700">{inq.lead.highSchoolPercent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={inq.status}
                        onChange={(e) => updateStatus(inq.id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-all ${getStatusStyle(inq.status)}`}
                      >
                        <option value="PENDING text-slate-900">PENDING</option>
                        <option value="CALLED">CALLED</option>
                        <option value="INTERESTED">INTERESTED</option>
                        <option value="ADMITTED">ADMITTED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── PAGINATION ─────────────────────────────── */}
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Showing Page <span className="text-slate-900">{meta.currentPage}</span> of <span className="text-slate-900">{meta.totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                {Array.from({ length: meta.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`shrink-0 w-8 h-8 rounded-lg text-xs font-black transition-all ${page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'border border-slate-200 hover:bg-white text-slate-600'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
