import React, { useEffect, useState } from 'react';
import { Building2, Edit2, PlusCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { ASSET_URL } from '../services/api';

export const Colleges = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Create Modal Shell State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollegeData, setNewCollegeData] = useState({ name: '', city: '', state: '', logoUrl: '', priorityScore: 0 });

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const { data } = await api.get('/colleges');
      setColleges(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Eradicate this College and ALL deep decoupled relations?')) return;
    try {
      await api.delete(`/colleges/${id}`);
      fetchColleges();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateShell = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/colleges', newCollegeData);
      setIsModalOpen(false);
      navigate(`/colleges/${data.data.id}`); // Transition flawlessly straight into detail dashboard
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to shell out college node.');
    }
  };

  const uploadLocalLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNewCollegeData({...newCollegeData, logoUrl: data.data.url});
    } catch (err) {
      alert('Local image upload failed');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading Aggregator Nodes...</div>;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> College Directory
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage all college records.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-500 text-sm shrink-0">
          <PlusCircle className="w-4 h-4" /> Add College
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">College</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Streams</th>
                <th className="py-3 pl-3 pr-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {colleges.map((college) => (
                <tr key={college.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-3">
                      <img src={college.logoUrl ? (college.logoUrl.startsWith('http') ? college.logoUrl : `${ASSET_URL}${college.logoUrl}`) : 'https://via.placeholder.com/40'} alt="Logo" className="w-9 h-9 object-contain rounded ring-1 ring-gray-200 bg-white p-1 shrink-0" />
                      <div className="font-semibold text-gray-900 text-sm">{college.name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600">{college.city}, {college.state}</td>
                  <td className="px-3 py-3 text-sm">
                    <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-700/10">
                      {college.courses?.length || 0} Streams
                    </span>
                  </td>
                  <td className="py-3 pl-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate(`/colleges/${college.id}`)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-xs font-semibold bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(college.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {colleges.map((college) => (
          <div key={college.id} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4 flex items-center gap-3">
            <img src={college.logoUrl ? (college.logoUrl.startsWith('http') ? college.logoUrl : `${ASSET_URL}${college.logoUrl}`) : 'https://via.placeholder.com/40'} alt="Logo" className="w-12 h-12 object-contain rounded-lg ring-1 ring-gray-200 bg-white p-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">{college.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{college.city}, {college.state}</div>
              <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 ring-1 ring-inset ring-purple-700/10 mt-1">
                {college.courses?.length || 0} Streams
              </span>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={() => navigate(`/colleges/${college.id}`)} className="text-blue-600 bg-blue-50 p-2 rounded-lg">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(college.id)} className="text-red-500 bg-red-50 p-2 rounded-lg">
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Define Baseline Root</h2>
            </div>
            <form onSubmit={handleCreateShell} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Institution Name</label><input required autoFocus type="text" value={newCollegeData.name} onChange={e => setNewCollegeData({...newCollegeData, name: e.target.value})} className="mt-1 w-full rounded-md border text-sm py-2 px-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="block text-sm font-medium text-gray-700">City</label><input required type="text" value={newCollegeData.city} onChange={e => setNewCollegeData({...newCollegeData, city: e.target.value})} className="mt-1 w-full rounded-md border text-sm py-2 px-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
                <div className="flex-1"><label className="block text-sm font-medium text-gray-700">State</label><input required type="text" value={newCollegeData.state} onChange={e => setNewCollegeData({...newCollegeData, state: e.target.value})} className="mt-1 w-full rounded-md border text-sm py-2 px-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700">System Priority (Higher = Rank higher)</label><input type="number" value={newCollegeData.priorityScore} onChange={e => setNewCollegeData({...newCollegeData, priorityScore: parseInt(e.target.value) || 0})} className="mt-1 w-full rounded-md border text-sm py-2 px-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="0-100" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Logo Context</label>
                <div className="flex gap-3 mt-2 items-center">
                  {newCollegeData.logoUrl && (
                    <img src={newCollegeData.logoUrl.startsWith('http') ? newCollegeData.logoUrl : `${ASSET_URL}${newCollegeData.logoUrl}`} alt="Logo" className="w-10 h-10 object-contain rounded-md bg-white border p-1" onError={(e) => e.currentTarget.style.display = 'none'} onLoad={(e) => e.currentTarget.style.display = 'block'} />
                  )}
                  <div className="flex gap-2 flex-1">
                    <input required type="text" placeholder="https://..." value={newCollegeData.logoUrl} onChange={e => setNewCollegeData({...newCollegeData, logoUrl: e.target.value})} className="flex-1 rounded-md border text-sm py-2 px-3 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 ring-1 ring-gray-300 px-3 rounded-md flex items-center justify-center font-bold text-xs text-gray-700 transition">
                      Upload Local
                      <input type="file" accept="image/*" className="hidden" onChange={uploadLocalLogo} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 font-medium">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="bg-blue-600 px-4 py-2 text-white rounded-lg shadow-sm hover:bg-blue-500">Inject Shell</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
