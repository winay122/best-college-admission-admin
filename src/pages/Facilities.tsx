import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Library, Code } from 'lucide-react';
import api from '../services/api';

export const Facilities = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    icon: '',
    isActive: true
  });

  const fetchFacilities = async () => {
    try {
      const { data } = await api.get('/facilities');
      setFacilities(data);
    } catch (error) {
      console.error('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/facilities/${editingId}`, form);
      } else {
        await api.post('/facilities', form);
      }
      setIsModalOpen(false);
      fetchFacilities();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save facility');
    }
  };

  const handleEdit = (fac: any) => {
    setEditingId(fac.id);
    setForm({
      name: fac.name,
      icon: fac.icon || '',
      isActive: fac.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this facility? This will remove it from future selections, but existing colleges using this string will retain it.')) {
      try {
        await api.delete(`/facilities/${id}`);
        fetchFacilities();
      } catch (error) {
        alert('Failed to delete facility');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading master facilities...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Master Facilities</h1>
          <p className="text-sm text-gray-500 mt-1">Manage global campus amenities, their icons, and visibility status.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({ name: '', icon: '', isActive: true });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Facility
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide">
        <table className="w-full text-left text-sm text-gray-600 min-w-[600px]">
          <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 rounded-tl-2xl">Facility Name</th>
              <th className="px-6 py-4">Icon Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {facilities.map((fac) => (
              <tr key={fac.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{fac.name}</td>
                <td className="px-6 py-4 font-mono text-xs text-blue-600">{fac.icon || 'Default'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    fac.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {fac.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {fac.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(fac)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(fac.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {facilities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                  No master facilities created yet.<br/>Click "Add Facility" to begin building your database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900">{editingId ? 'Edit Facility' : 'New Facility'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Facility Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Smart Library"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  Lucide Icon Name
                  <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                    <Code className="w-3.5 h-3.5" /> Browse Icons
                  </a>
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.g. BookOpen, Wifi"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Enter the exact PascalCase name from lucide.dev. Blank acts as default Check icon.</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-bold text-gray-700">Active</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                {editingId ? 'Save Changes' : 'Create Facility'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
