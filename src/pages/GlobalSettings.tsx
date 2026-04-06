import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, LayoutTemplate, Upload, ImageIcon } from 'lucide-react';
import api from '../services/api';

interface SocialLink {
  platform: string; // e.g., 'facebook', 'twitter', 'instagram', 'linkedin', 'youtube'
  label: string;
  url: string;
}

export function GlobalSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States mapping directly to GlobalSetting model
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [footerAbout, setFooterAbout] = useState('');
  const [copyrightText, setCopyrightText] = useState('© 2026 CollegeSelect Platforms. All rights reserved.');
  const [emailTemplates, setEmailTemplates] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      if (data.data) {
        setContactEmail(data.data.contactEmail || '');
        setContactPhone(data.data.contactPhone || '');
        setOfficeHours(data.data.officeHours || '');
        setOfficeAddress(data.data.officeAddress || '');
        setLogoUrl(data.data.logoUrl || '');
        setFooterAbout(data.data.footerAbout || '');
        setCopyrightText(data.data.copyrightText || '© 2026 CollegeSelect Platforms. All rights reserved.');
        setEmailTemplates(data.data.emailTemplates || '');
        if (data.data.socialLinks) {
          setSocialLinks(JSON.parse(data.data.socialLinks));
        }
      }
    } catch (err) {
      console.error('Failed to load global settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // The backend returns a relative URL like /uploads/filename.ext
      // We prepend the base URL for preview, but save the relative one to the DB
      setLogoUrl(`${window.location.protocol}//${window.location.hostname}:5000${data.data.url}`);
    } catch (err) {
      console.error('Logo upload failed', err);
      alert('Failed to upload logo');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.put('/settings', {
        contactEmail,
        contactPhone,
        officeHours,
        officeAddress,
        logoUrl,
        footerAbout,
        copyrightText,
        emailTemplates,
        socialLinks: JSON.stringify(socialLinks),
      });
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'facebook', label: 'Facebook', url: '' }]);
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const deleteSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading settings matrix...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-blue-600" /> Site Configuration
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manage global layout elements and footer data mapping.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-xl border border-green-200 font-bold text-sm">
          {successMsg}
        </div>
      )}

      {/* Brand & Legal Module */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Brand Identity & Legal</h2>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Master Logo URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://.../logo.png"
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleLogoUpload}
                    accept="image/*"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-medium italic">Enter a direct URL or upload a new logo file.</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Copyright Signature</label>
                <input
                  type="text"
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  placeholder="© 2026 CollegeSelect..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="w-full md:w-48 space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-1 text-center">Logo Preview</label>
              <div className="h-32 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden p-4">
                {logoUrl ? (
                  <img src={logoUrl} alt="Master Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                    <span className="text-[10px] font-bold">No Logo Set</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Footer Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Footer Content & Contact Info</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Support Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Support Phone</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Office Hours</label>
            <input
              type="text"
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
              placeholder="e.g. Mon-Fri: 9AM to 6PM"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              placeholder="Full office address..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Footer About Section</label>
          <textarea
            value={footerAbout}
            onChange={(e) => setFooterAbout(e.target.value)}
            rows={3}
            placeholder="A short description of the platform for the footer column..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Email & Notification Templates</label>
          <textarea
            value={emailTemplates}
            onChange={(e) => setEmailTemplates(e.target.value)}
            rows={4}
            placeholder="JSON or Text templates for system emails..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono text-xs"
          />
        </div>
      </div>

      {/* Social Media Link Builder */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h2 className="text-lg font-black text-gray-900">Social Media Connect Grid</h2>
          <button
            onClick={addSocialLink}
            className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-blue-100"
          >
            <Plus className="w-4 h-4" /> Add Network
          </button>
        </div>

        <div className="space-y-3">
          {socialLinks.length === 0 ? (
            <div className="text-sm text-gray-400 font-medium py-4 text-center border-2 border-dashed rounded-xl">
              No social networks configured.
            </div>
          ) : (
            socialLinks.map((link, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <select
                  value={link.platform}
                  onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white font-bold text-sm w-32"
                >
                  <option value="facebook">Facebook</option>
                  <option value="twitter">X (Twitter)</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="youtube">YouTube</option>
                </select>
                <input
                  type="text"
                  placeholder="Link Label (e.g., 'Official Facebook')"
                  value={link.label}
                  onChange={(e) => updateSocialLink(idx, 'label', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                />
                <input
                  type="url"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                />
                <button
                  onClick={() => deleteSocialLink(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

