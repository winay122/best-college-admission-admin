import React, { useEffect, useState } from 'react';
import { School, X, Plus, Edit2, RotateCcw } from 'lucide-react';
import api from '../services/api';

export const Universities = () => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const { data } = await api.get('/universities');
      setUniversities(data.data);
    } catch (error) {
      console.error('Failed to fetch universities', error);
    }
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      if (editingId) {
        await api.put(`/universities/${editingId}`, { name, shortName, slug });
        setEditingId(null);
      } else {
        await api.post('/universities', { name, shortName, slug });
      }
      
      setName('');
      setShortName('');
      fetchUniversities();
    } catch(err: any) {
      alert('Failed to process. Ensure the University name is unique.');
    }
  };

  const startEdit = (uni: any) => {
    setEditingId(uni.id);
    setName(uni.name);
    setShortName(uni.shortName || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setShortName('');
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Delete University Master Node? Linked colleges will remain but their parent reference will be cleared.')) return;
    try {
      await api.delete(`/universities/${id}`);
      fetchUniversities();
    } catch(err) { console.error(err); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <School className="w-6 h-6 text-emerald-600" /> Parent University Master List
        </h1>
        <p className="mt-1 text-sm text-gray-500">Manage affiliated bodies (e.g. Rajasthan Technical University - RTU) for college mapping.</p>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-gray-900/5 p-6 animate-in fade-in duration-300">
        <div className="flex flex-col lg:flex-row gap-8">
           <div className="lg:w-1/3">
             <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
               <h3 className="font-semibold text-emerald-900 text-sm mb-2">{editingId ? 'Modify University' : 'Add New University'}</h3>
               <form onSubmit={handleAddOrUpdate} className="flex flex-col gap-3">
                 <div>
                   <label className="text-[10px] uppercase font-bold text-emerald-700 ml-1">Full University Name</label>
                   <input 
                     required type="text" value={name} onChange={e=>setName(e.target.value)} 
                     placeholder="Ex: Rajasthan Technical University" 
                     className="w-full rounded-md border text-sm py-2 px-3 border-emerald-200 mt-1 shadow-sm focus:border-emerald-600 focus:ring-emerald-600 bg-white" 
                   />
                 </div>
                 <div>
                   <label className="text-[10px] uppercase font-bold text-emerald-700 ml-1">Short Name / Abbreviation</label>
                   <input 
                     type="text" value={shortName} onChange={e=>setShortName(e.target.value)} 
                     placeholder="Ex: RTU" 
                     className="w-full rounded-md border text-sm py-2 px-3 border-emerald-200 mt-1 shadow-sm focus:border-emerald-600 focus:ring-emerald-600 bg-white" 
                   />
                 </div>
                 
                 <div className="flex gap-2 mt-2">
                   <button type="submit" className="flex-1 bg-emerald-600 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-1 shadow-sm hover:bg-emerald-500 transition-colors">
                     {editingId ? <><Edit2 className="w-4 h-4"/> Update</> : <><Plus className="w-4 h-4"/> Register</>}
                   </button>
                   {editingId && (
                     <button type="button" onClick={cancelEdit} className="bg-gray-200 text-gray-600 font-semibold px-3 py-2.5 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-gray-300 transition-colors">
                       <RotateCcw className="w-4 h-4"/>
                     </button>
                   )}
                 </div>
               </form>
             </div>
           </div>
           
           <div className="lg:w-2/3">
              {universities.length === 0 ? (
                <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-8 min-h-[200px]">
                  <p className="text-gray-400 font-medium text-sm">No Universities registered yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {universities.map(uni => (
                    <div key={uni.id} className="flex items-center justify-between border ring-1 ring-gray-900/5 rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                      <div>
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          {uni.name}
                          {uni.shortName && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">{uni.shortName}</span>}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">/{uni.slug}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(uni)} className="text-gray-400 hover:text-blue-600 transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(uni.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
