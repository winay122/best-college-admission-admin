import React, { useEffect, useState, useRef } from 'react';
import { Settings as SettingsIcon, Image as ImageIcon, Check, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface GlobalSetting {
  id: string;
  banners: string[];
  contactEmail: string | null;
  contactPhone: string | null;
  emailTemplates: string | null;
}

export const Settings = () => {
  const [settings, setSettings] = useState<Partial<GlobalSetting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerInputMode, setBannerInputMode] = useState<'url' | 'upload'>('url');
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data.data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      alert('CMS Settings Synchronized Correctly!');
    } catch (error) {
      console.error('Failed to save settings', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // The backend returns { url: '/uploads/xxx.jpg' }
      // Because we use Axios baseURL 'http://localhost:5000/api', the static uploads are at 'http://localhost:5000/uploads'
      const AbsoluteUrl = `http://localhost:5000${data.data.url}`;
      setSettings({ ...settings, banners: [...(settings.banners || []), AbsoluteUrl] });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Upload failed due to size/format constraints.');
    }
  };

  const handleManualUrlAdd = () => {
    if (!newBannerUrl) return;
    setSettings({ ...settings, banners: [...(settings.banners || []), newBannerUrl] });
    setNewBannerUrl('');
  };

  const removeBanner = (index: number) => {
    const newBanners = [...(settings.banners || [])];
    newBanners.splice(index, 1);
    setSettings({ ...settings, banners: newBanners });
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading Global Configuration...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" /> Administrative CMS Console
        </h1>
        <p className="mt-1 text-sm text-gray-500">Manage site-wide variables and platform analytics components.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
        
        {/* Banners Section */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-gray-900/5 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gray-500" /> Landing Page Banners
          </h2>
          
          <div className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setBannerInputMode('url')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${bannerInputMode === 'url' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <LinkIcon className="w-4 h-4"/> Paste Web URL
              </button>
              <button 
                onClick={() => setBannerInputMode('upload')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${bannerInputMode === 'upload' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <Upload className="w-4 h-4"/> Upload Raw File
              </button>
            </div>

            {bannerInputMode === 'url' ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newBannerUrl}
                  onChange={(e) => setNewBannerUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
                <button 
                  onClick={handleManualUrlAdd}
                  className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Add
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <input 
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            )}

            <div className="mt-6 space-y-3">
              {settings.banners?.map((url, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100 relative group overflow-hidden transition-all hover:bg-gray-100">
                  <div className="w-20 h-10 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-gray-900/5">
                    <img src={url} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-gray-500 truncate flex-1 font-mono">{url}</p>
                  <button onClick={() => removeBanner(i)} className="text-red-500 text-xs font-semibold px-2 hover:underline">Remove</button>
                </div>
              ))}
              {settings.banners?.length === 0 && (
                 <div className="p-4 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-center">
                    <p className="text-sm text-gray-400">No banners active. Dashboard defaults will render until populated.</p>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Configuration */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6 flex flex-col justify-between">
          <div>
             <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
               Global System Parameters
             </h2>
             
             <div className="space-y-5">
               <div>
                 <label className="block text-sm font-medium leading-6 text-gray-900">Support Email (Footer Routing)</label>
                 <div className="mt-1">
                   <input
                     type="email"
                     value={settings.contactEmail || ''}
                     onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                     className="block w-full rounded-md border-0 py-2 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium leading-6 text-gray-900">Support Phone (Active Call Lines)</label>
                 <div className="mt-1">
                   <input
                     type="text"
                     value={settings.contactPhone || ''}
                     onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                     className="block w-full rounded-md border-0 py-2 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                   />
                 </div>
               </div>
               
               <div className="bg-blue-50/50 p-4 rounded-xl flex gap-3 mt-6 items-start border border-blue-100">
                 <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                 <p className="text-sm text-blue-800 leading-snug font-medium">
                   These settings are instantaneously propagated across the complete Next.js User Portal architecture via the Prisma GlobalSetting singleton model.
                 </p>
               </div>
             </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-8 flex w-full justify-center gap-2 items-center rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Synchronizing Data...' : <><Check className="w-4 h-4"/> Save CMS Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
};
