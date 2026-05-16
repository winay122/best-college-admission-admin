import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Newspaper, Save } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api, { ASSET_URL } from '../services/api';

interface Degree {
  id: string;
  name: string;
}

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  degreeId: string;
  linkUrl: string;
  isPublished: boolean;
  publishedAt: string;
}

export function News() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [degreeId, setDegreeId] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [publishedAt, setPublishedAt] = useState('');

  useEffect(() => {
    fetchNews();
    fetchDegrees();
  }, []);

  const fetchNews = async () => {
    try {
      const { data } = await api.get('/news');
      if (data.success) {
        setNews(data.data);
      }
    } catch (err) {
      console.error('Failed to load news', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDegrees = async () => {
    try {
      const { data } = await api.get('/degrees');
      if (data.success) {
        setDegrees(data.data);
      }
    } catch (err) {
      console.error('Failed to load degrees', err);
    }
  };

  const resetForm = () => {
    setCurrentId('');
    setTitle('');
    setExcerpt('');
    setContent('');
    setImageUrl('');
    setDegreeId('');
    setLinkUrl('');
    setIsPublished(true);
    setPublishedAt('');
    setIsAdding(false);
  };

  const handleEdit = (article: NewsArticle) => {
    setCurrentId(article.id);
    setTitle(article.title);
    setExcerpt(article.excerpt || '');
    setContent(article.content || '');
    setImageUrl(article.imageUrl || '');
    setDegreeId(article.degreeId || '');
    setLinkUrl(article.linkUrl || '');
    setIsPublished(article.isPublished);
    setPublishedAt(article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : '');
    setIsAdding(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData);
      if (data.success) {
        setImageUrl(data.url);
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find the degree name for the category field to ensure backward compatibility
      const selectedDegree = degrees.find(d => d.id === degreeId);
      const category = selectedDegree ? selectedDegree.name : 'General';

      const payload = {
        title,
        excerpt,
        content,
        imageUrl,
        category,
        degreeId: degreeId || null,
        linkUrl,
        isPublished,
        publishedAt: publishedAt || new Date().toISOString()
      };
      
      if (currentId) {
        await api.put(`/news/${currentId}`, payload);
      } else {
        await api.post('/news', payload);
      }
      resetForm();
      fetchNews();
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save news article');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    try {
      await api.delete(`/news/${id}`);
      fetchNews();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete news article');
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading news...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-600" /> News Management
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manage dynamic news and updates for the portal homepage.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" /> Add News Article
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">{currentId ? 'Edit Article' : 'Create Article'}</h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Article Title</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Excerpt (Short Summary for Cards)</label>
                  <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl min-h-[80px]" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
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
                        placeholder="Path (/uploads/...) or URL..." 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stream / Degree Category</label>
                    <select 
                      value={degreeId} 
                      onChange={(e) => setDegreeId(e.target.value)} 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <option value="">General (No Stream)</option>
                      {degrees.map(deg => (
                        <option key={deg.id} value={deg.id}>{deg.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">Used to recommend related colleges</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Publish Date</label>
                    <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <select value={isPublished ? 'true' : 'false'} onChange={(e) => setIsPublished(e.target.value === 'true')} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                      <option value="true">Published</option>
                      <option value="false">Draft</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">External/Internal Link URL (CTA)</label>
                  <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl" placeholder="https://..." />
                </div>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="mt-4 border-t pt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Article Content</label>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent} 
                  modules={quillModules}
                  className="h-64 mb-12"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={resetForm} className="px-5 py-2 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
              <button type="submit" disabled={uploading} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                <Save className="w-4 h-4" /> Save Article
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article) => (
          <div key={article.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 flex flex-col group relative">
            <div className={`absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider shadow-sm z-10 ${article.isPublished ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
              {article.isPublished ? 'Published' : 'Draft'}
            </div>
            {article.imageUrl ? (
              <img 
                src={article.imageUrl.startsWith('http') ? article.imageUrl : `${ASSET_URL}${article.imageUrl}`} 
                alt={article.title} 
                className="h-40 w-full object-cover group-hover:scale-105 transition-transform" 
              />
            ) : (
              <div className="h-40 w-full bg-slate-100 flex items-center justify-center">
                 <Newspaper className="w-10 h-10 text-slate-300" />
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col z-20 bg-white">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{article.category}</span>
              <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight">{article.title}</h3>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{article.excerpt}</p>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold">{new Date(article.publishedAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(article)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(article.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {news.length === 0 && !loading && (
          <div className="col-span-full p-12 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-gray-500">
            No news articles found. Create your first one above!
          </div>
        )}
      </div>
    </div>
  );
}
