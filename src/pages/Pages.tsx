import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, FileText, Save, ExternalLink } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../services/api';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export function Pages() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data } = await api.get('/pages');
      if (data.success) {
        setPages(data.data);
      }
    } catch (err) {
      console.error('Failed to load pages', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentId('');
    setTitle('');
    setContent('');
    setIsPublished(true);
    setIsAdding(false);
  };

  const handleEdit = (page: StaticPage) => {
    setCurrentId(page.id);
    setTitle(page.title);
    setContent(page.content || '');
    setIsPublished(page.isPublished);
    setIsAdding(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        content,
        isPublished
      };
      
      if (currentId) {
        await api.put(`/pages/${currentId}`, payload);
      } else {
        await api.post('/pages', payload);
      }
      resetForm();
      fetchPages();
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save page');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      await api.delete(`/pages/${id}`);
      fetchPages();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete page');
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  if (loading) return <div className="p-8 text-gray-500 font-medium text-center">Loading Pages...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> Legal & Dynamic Pages
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manage Privacy Policy, Terms, and other static content for the User Portal.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" /> Create New Page
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">{currentId ? 'Edit Page' : 'New Page'}</h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Page Title</label>
                  <input 
                    required 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" 
                    placeholder="e.g. Privacy Policy"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 italic">Slug will be auto-generated from title (e.g. privacy-policy)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select 
                    value={isPublished ? 'true' : 'false'} 
                    onChange={(e) => setIsPublished(e.target.value === 'true')} 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="true">Published (Live on Portal)</option>
                    <option value="false">Draft (Internal Only)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="mt-4 border-t pt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Rich Text Page Content</label>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent} 
                  modules={quillModules}
                  className="h-96 mb-12"
                  placeholder="Enter detailed content here..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={resetForm} className="px-5 py-2 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
              <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                <Save className="w-4 h-4" /> Save Page Content
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div key={page.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-indigo-200 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${page.isPublished ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {page.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(page)} 
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(page.id)} 
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-1 leading-tight">{page.title}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium mb-4">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">/{page.slug}</span>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Updated {new Date(page.updatedAt).toLocaleDateString()}
              </span>
              <a 
                href={`http://localhost:3000/pages/${page.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
              >
                View Live <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
        
        {pages.length === 0 && !loading && (
          <div className="col-span-full p-16 text-center bg-gray-50 border border-dashed border-gray-300 rounded-[2rem] text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No Legal Pages Found</h3>
            <p className="text-sm font-medium mt-1">Start by creating Privacy Policy or Terms of Use.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add First Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
