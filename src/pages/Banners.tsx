import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Image as ImageIcon, Save } from 'lucide-react';
import api, { ASSET_URL } from '../services/api';

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subTitle: string;
  linkUrl: string;
  isActive: boolean;
  orderIndex: number;
}

export function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await api.get('/banners');
      if (data.success) {
        setBanners(data.data);
      }
    } catch (err) {
      console.error('Failed to load banners', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentId('');
    setImageUrl('');
    setTitle('');
    setSubTitle('');
    setLinkUrl('');
    setIsActive(true);
    setOrderIndex(0);
    setIsAdding(false);
  };

  const handleEdit = (banner: Banner) => {
    setCurrentId(banner.id);
    setImageUrl(banner.imageUrl);
    setTitle(banner.title || '');
    setSubTitle(banner.subTitle || '');
    setLinkUrl(banner.linkUrl || '');
    setIsActive(banner.isActive);
    setOrderIndex(banner.orderIndex);
    setIsAdding(true);
  };

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cleanup previous temporary upload if it exists and is a local file
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      try {
        await api.delete('/upload', { data: { url: imageUrl } });
      } catch (err) {
        console.error('Failed to cleanup previous upload', err);
      }
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setImageUrl(data.data.url);
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please select or upload a banner image first.');
      return;
    }
    try {
      const payload = { imageUrl, title, subTitle, linkUrl, isActive, orderIndex };
      if (currentId) {
        await api.put(`/banners/${currentId}`, payload);
      } else {
        await api.post('/banners', payload);
      }
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete banner');
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading banners...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-600" /> Banners Management
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manage homepage slider visuals and call-to-actions.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" /> Add New Banner
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">{currentId ? 'Edit Banner' : 'Create Banner'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image</label>
                  <div className="flex flex-col gap-3">
                    {imageUrl && (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                        <img 
                          src={imageUrl.startsWith('http') ? imageUrl : `${ASSET_URL}${imageUrl}`} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <div className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Plus className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold text-gray-600">{uploading ? 'Uploading...' : 'Upload File'}</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                      <input 
                        type="text" 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)} 
                        className="flex-[2] px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium" 
                        placeholder="Path (/uploads/...) or External URL..." 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Hero Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle</label>
                    <input type="text" value={subTitle} onChange={(e) => setSubTitle(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <select value={isActive ? 'true' : 'false'} onChange={(e) => setIsActive(e.target.value === 'true')} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                      <option value="true">Active (Visible)</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Order Priority</label>
                    <input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">CTA Redirect Link</label>
                  <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" placeholder="/colleges" />
                </div>
                
                <div className="flex justify-end gap-3 pt-6">
                  <button type="button" onClick={resetForm} className="px-5 py-2 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={uploading} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                    <Save className="w-4 h-4" /> Save Banner
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Banner List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 flex flex-col group relative">
            <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm z-10 ${banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
              {banner.isActive ? 'Active' : 'Draft'}
            </div>
            <img 
              src={banner.imageUrl.startsWith('http') ? banner.imageUrl : `${ASSET_URL}${banner.imageUrl}`} 
              alt={banner.title || 'Slider'} 
              className="h-40 w-full object-cover group-hover:scale-105 transition-transform" 
            />
            <div className="p-4 flex-1 flex flex-col z-20 bg-white">
              <h3 className="font-bold text-gray-900">{banner.title || 'No Title'}</h3>
              <p className="text-xs font-semibold text-gray-500 border-b border-gray-100 pb-3 mb-3">{banner.linkUrl || 'No CTA Link'}</p>
              <div className="mt-auto flex justify-between items-center">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Order: {banner.orderIndex}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(banner)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(banner.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
