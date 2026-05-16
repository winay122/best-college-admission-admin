import React, { useEffect, useState, useCallback } from 'react';
import { GraduationCap, X, Plus, Edit2, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../services/api';

export const Degrees = () => {
  const [degrees, setDegrees] = useState<any[]>([]);
  const [newDegreeName, setNewDegreeName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDegrees(); }, []);

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
    } catch {
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
    if (!window.confirm('Delete this degree? Linked courses will lose their degree binding.')) return;
    try {
      await api.delete(`/degrees/${id}`);
      fetchDegrees();
    } catch { console.error('Delete failed'); }
  };

  // Move a degree up or down in the list and save the new order
  const move = useCallback(async (index: number, direction: 'up' | 'down') => {
    const newList = [...degrees];
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= newList.length) return;

    // Swap in local state
    [newList[index], newList[swapWith]] = [newList[swapWith], newList[index]];
    setDegrees(newList);

    // Persist the new order
    setSaving(true);
    try {
      const orders = newList.map((d, i) => ({ id: d.id, sortOrder: i }));
      await api.put('/degrees/reorder', { orders });
    } catch {
      alert('Failed to save order');
      fetchDegrees(); // revert
    } finally {
      setSaving(false);
    }
  }, [degrees]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-purple-600" /> Academic Degree Master List
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Define degree categories (e.g. B.Tech, MBA). Drag order controls the display sequence on the student portal carousel.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Add / Edit Form */}
          <div className="lg:w-1/3">
            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
              <h3 className="font-semibold text-purple-900 text-sm mb-1">
                {editingId ? 'Edit Degree' : 'Add New Degree'}
              </h3>
              <p className="text-xs text-purple-600 mb-4">
                {editingId
                  ? 'Updating propagates to all linked courses.'
                  : 'New degree appears last in the portal carousel by default.'}
              </p>
              <form onSubmit={handleAddOrUpdateDegree} className="flex flex-col gap-3">
                <input
                  required
                  type="text"
                  value={newDegreeName}
                  onChange={(e) => setNewDegreeName(e.target.value)}
                  placeholder="e.g. Engineering (B.Tech)"
                  className="w-full rounded-md border text-sm py-2.5 px-3 border-purple-200 shadow-sm focus:border-purple-600 focus:ring-purple-600 bg-white"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-purple-500 transition-colors"
                  >
                    {editingId ? <><Edit2 className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add Degree</>}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-200 text-gray-600 px-3 py-2.5 rounded-lg text-sm flex items-center hover:bg-gray-300 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-1">📋 Portal Display Order</p>
              <p className="text-xs text-blue-600">
                Use the ↑ ↓ arrows on each row to control the order in which streams appear on the student-facing homepage carousel.
              </p>
              {saving && <p className="text-[11px] text-blue-500 mt-2 animate-pulse">Saving order...</p>}
            </div>
          </div>

          {/* Degree List with order controls */}
          <div className="lg:w-2/3">
            {degrees.length === 0 ? (
              <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-8 min-h-[200px]">
                <p className="text-gray-400 font-medium text-sm">No degrees yet. Add one to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {degrees.map((degree, idx) => (
                  <div
                    key={degree.id}
                    className="flex items-center gap-3 border ring-1 ring-gray-900/5 rounded-xl px-4 py-3 bg-white hover:bg-gray-50 transition-colors shadow-sm group"
                  >
                    {/* Order position badge */}
                    <span className="w-6 h-6 bg-gray-100 text-gray-500 text-xs font-black rounded-full flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    {/* Degree info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900">{degree.name}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">/{degree.slug}</div>
                    </div>

                    {/* Order controls */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => move(idx, 'up')}
                        disabled={idx === 0 || saving}
                        className={`p-1.5 rounded-lg transition-colors ${idx === 0 || saving ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => move(idx, 'down')}
                        disabled={idx === degrees.length - 1 || saving}
                        className={`p-1.5 rounded-lg transition-colors ${idx === degrees.length - 1 || saving ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit / Delete */}
                    <div className="flex items-center gap-0.5 border-l pl-2 ml-1">
                      <button
                        onClick={() => startEdit(degree)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
                        title="Edit name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDegree(degree.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
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
