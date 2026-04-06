import React, { useEffect, useState } from 'react';
import { BookOpen, X, Plus, Edit2, RotateCcw, Filter } from 'lucide-react';
import api from '../services/api';

export const Specializations = () => {
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [degrees, setDegrees] = useState<any[]>([]);
  const [selectedDegreeId, setSelectedDegreeId] = useState('');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDegrees();
    fetchSpecializations();
  }, []);

  const fetchDegrees = async () => {
    try {
      const { data } = await api.get('/degrees');
      setDegrees(data.data);
    } catch (error) {
      console.error('Failed to fetch degrees', error);
    }
  };

  const fetchSpecializations = async (degreeId?: string) => {
    try {
      const { data } = await api.get('/specializations', {
        params: { degreeId }
      });
      setSpecializations(data.data);
    } catch (error) {
      console.error('Failed to fetch specializations', error);
    }
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !selectedDegreeId) {
      alert('Please select a degree and enter a specialization name.');
      return;
    }
    try {
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      if (editingId) {
        await api.put(`/specializations/${editingId}`, { name: newName, degreeId: selectedDegreeId, slug });
        setEditingId(null);
      } else {
        await api.post('/specializations', { name: newName, degreeId: selectedDegreeId, slug });
      }
      
      setNewName('');
      fetchSpecializations(selectedDegreeId);
    } catch(err: any) {
      alert('Failed to process specialization. Name and Slug must be unique.');
    }
  };

  const startEdit = (spec: any) => {
    setEditingId(spec.id);
    setNewName(spec.name);
    setSelectedDegreeId(spec.degreeId);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewName('');
    setSelectedDegreeId('');
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Delete this specialization master record?')) return;
    try {
      await api.delete(`/specializations/${id}`);
      fetchSpecializations();
    } catch(err) { console.error(err); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-indigo-600" /> Master Specializations (Courses)
        </h1>
        <p className="mt-1 text-sm text-gray-500">Define global courses within each degree (e.g. Computer Science under B.Tech). These enable advanced filtering on the user portal.</p>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-gray-900/5 p-6">
        <div className="flex flex-col lg:flex-row gap-8">
           {/* Form Section */}
           <div className="lg:w-1/3">
             <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
               <h3 className="font-semibold text-indigo-900 text-sm mb-2">{editingId ? 'Modify Specialization' : 'Add New Specialization'}</h3>
               <form onSubmit={handleAddOrUpdate} className="flex flex-col gap-3">
                 <div>
                   <label className="block text-[10px] uppercase font-bold text-indigo-700 mb-1 ml-1">Parent Degree</label>
                   <select 
                     required 
                     value={selectedDegreeId} 
                     onChange={e => setSelectedDegreeId(e.target.value)}
                     className="w-full rounded-md border text-sm py-2.5 px-3 border-indigo-200 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 bg-white cursor-pointer"
                   >
                     <option value="">Select Degree...</option>
                     {degrees.map(d => (
                       <option key={d.id} value={d.id}>{d.name}</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] uppercase font-bold text-indigo-700 mb-1 ml-1">Specialization Name</label>
                   <input 
                     required type="text" value={newName} onChange={e=>setNewName(e.target.value)} 
                     placeholder="Ex: Computer Science" 
                     className="w-full rounded-md border text-sm py-2.5 px-3 border-indigo-200 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 bg-white" 
                   />
                 </div>
                 <div className="flex gap-2 pt-2">
                   <button type="submit" className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-1 shadow-sm hover:bg-indigo-500 transition-colors">
                     {editingId ? <><Edit2 className="w-4 h-4"/> Update</> : <><Plus className="w-4 h-4"/> Add Master</>}
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
           
           {/* List Section with Filtering */}
           <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <Filter className="w-3.5 h-3.5" /> Filter by Degree
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => fetchSpecializations()} 
                     className="text-[10px] font-bold px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200"
                   >All</button>
                   {degrees.slice(0, 4).map(d => (
                     <button 
                       key={d.id} 
                       onClick={() => fetchSpecializations(d.id)}
                       className="text-[10px] font-bold px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                     >{d.name}</button>
                   ))}
                </div>
              </div>

              {specializations.length === 0 ? (
                <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-8 min-h-[300px]">
                  <p className="text-gray-400 font-medium text-sm">No specializations found for this selection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {specializations.map(spec => (
                    <div key={spec.id} className="flex items-center justify-between border ring-1 ring-gray-900/5 rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100/50 p-2 rounded-lg">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 leading-tight">{spec.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                              {spec.degree?.name || 'Master'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono tracking-wider">/{spec.slug}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(spec)} className="text-gray-400 hover:text-indigo-600 transition-colors p-1.5"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(spec.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5"><X className="w-4 h-4" /></button>
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
