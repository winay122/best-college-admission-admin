import React, { useEffect, useState } from 'react';
import { GraduationCap, X, Plus, Edit2, RotateCcw } from 'lucide-react';
import api from '../services/api';

export const Degrees = () => {
  const [degrees, setDegrees] = useState<any[]>([]);
  const [newDegreeName, setNewDegreeName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      const { data } = await api.get('/degrees');
      setDegrees(data.data);
    } catch (error) {
      console.error('Failed to fetch degrees', error);
    }
  };

  const handleAddOrUpdateDegree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDegreeName) return;
    try {
      const slug = newDegreeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      if (editingId) {
        await api.put(`/degrees/${editingId}`, { name: newDegreeName, slug });
        setEditingId(null);
      } else {
        await api.post('/degrees', { name: newDegreeName, slug });
      }
      
      setNewDegreeName('');
      fetchDegrees();
    } catch(err: any) {
      alert('Failed to process degree. Check for strictly unique names.');
    }
  };

  const startEdit = (degree: any) => {
    setEditingId(degree.id);
    setNewDegreeName(degree.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewDegreeName('');
  };

  const handleDeleteDegree = async (id: string) => {
    if(!window.confirm('Eradicate Degree Master Node? Child streams will simply null out their bindings.')) return;
    try {
      await api.delete(`/degrees/${id}`);
      fetchDegrees();
    } catch(err) { console.error(err); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-purple-600" /> Academic Degree Global Master List
        </h1>
        <p className="mt-1 text-sm text-gray-500">Define top level master categories for application-wide filtering (e.g. B.Tech, M.Tech, MBA).</p>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-gray-900/5 p-6 animate-in fade-in duration-300">
        <div className="flex flex-col lg:flex-row gap-8">
           <div className="lg:w-1/3">
             <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
               <h3 className="font-semibold text-purple-900 text-sm mb-2">{editingId ? 'Modify Master Node' : 'Bind New Master Category'}</h3>
               <p className="text-xs text-purple-700 mb-4">{editingId ? 'Updating the global wrapper will propagate to all linked streams.' : 'Define top level wrappers to standardize filtering on the User Portal.'}</p>
               <form onSubmit={handleAddOrUpdateDegree} className="flex flex-col gap-3">
                 <input 
                   required type="text" value={newDegreeName} onChange={e=>setNewDegreeName(e.target.value)} 
                   placeholder="Ex: B.Tech" 
                   className="w-full rounded-md border text-sm py-2.5 px-3 border-purple-200 shadow-sm focus:border-purple-600 focus:ring-purple-600 bg-white" 
                 />
                 <div className="flex gap-2">
                   <button type="submit" className="flex-1 bg-purple-600 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-1 shadow-sm hover:bg-purple-500 transition-colors">
                     {editingId ? <><Edit2 className="w-4 h-4"/> Update Node</> : <><Plus className="w-4 h-4"/> Mount Node</>}
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
              {degrees.length === 0 ? (
                <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-8 min-h-[200px]">
                  <p className="text-gray-400 font-medium text-sm">No Master Degrees registered. Create one to begin linking Local Streams.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {degrees.map(degree => (
                    <div key={degree.id} className="flex items-center justify-between border ring-1 ring-gray-900/5 rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{degree.name}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">/{degree.slug}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(degree)} className="text-gray-400 hover:text-blue-600 transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteDegree(degree.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X className="w-4 h-4" /></button>
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
