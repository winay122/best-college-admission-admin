import React, { useEffect, useState } from 'react';
import { Building2, Edit2, PlusCircle, Trash2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const Colleges = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Create Modal Shell State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollegeData, setNewCollegeData] = useState({ name: '', city: '', state: '', logoUrl: '' });

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
      setNewCollegeData({...newCollegeData, logoUrl: `http://localhost:5000${data.data.url}`});
    } catch (err) {
      alert('Local image upload failed');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading Aggregator Nodes...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> College Master Directory
          </h1>
          <p className="mt-1 text-sm text-gray-500">Add College Shells and inject decoupled CRM details.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-500">
          <PlusCircle className="w-4 h-4" /> Add College Node
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">Institution Context</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Geography</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data Integrity</th>
              <th className="relative py-3.5 pl-3 pr-6 text-right cursor-pointer">Modify Dashboard</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {colleges.map((college) => (
              <tr key={college.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 pl-6 pr-3 flex items-center gap-4">
                  <img src={college.logoUrl || 'https://via.placeholder.com/40'} alt="Icon" className="w-10 h-10 object-contain rounded ring-1 ring-gray-200 bg-white p-1" />
                  <div className="font-semibold text-gray-900 text-sm">{college.name}</div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-600 font-medium">
                  <Navigation className="w-3 h-3 inline mr-1 text-gray-400"/> {college.city}, {college.state}
                </td>
                <td className="px-3 py-4 text-sm">
                  <span className="inline-flex rounded-md bg-purple-50 px-2 py-1 font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                    {college.courses?.length || 0} Streams Found
                  </span>
                </td>
                <td className="py-4 pl-3 pr-6 text-right text-sm font-medium">
                   <div className="flex items-center justify-end gap-4 transition-opacity">
                     <button onClick={() => navigate(`/colleges/${college.id}`)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1 font-semibold bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                       <Edit2 className="w-4 h-4" /> Open CRM
                     </button>
                     <button onClick={() => handleDelete(college.id)} className="text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors">
                       <Trash2 className="w-4 h-4"/>
                     </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Logo Context</label>
                <div className="flex gap-3 mt-2 items-center">
                  {newCollegeData.logoUrl && (
                    <img src={newCollegeData.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-md bg-white border p-1" onError={(e) => e.currentTarget.style.display = 'none'} onLoad={(e) => e.currentTarget.style.display = 'block'} />
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
