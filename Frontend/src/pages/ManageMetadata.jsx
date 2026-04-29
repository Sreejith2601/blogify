import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import toast from 'react-hot-toast';

const ManageMetadata = () => {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState({ categories: [], tags: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  const [editingItem, setEditingItem] = useState(null);
  const [newName, setNewName] = useState('');

  const fetchMetadata = async () => {
    try {
      const data = await postService.getUserMetadata();
      setMetadata(data);
    } catch (err) {
      toast.error('Failed to load your tags and categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleRename = async (e) => {
    e.preventDefault();
    if (!newName.trim() || newName === editingItem) return setEditingItem(null);
    try {
      if (activeTab === 'categories') {
        await postService.renameCategory(editingItem, newName);
      } else {
        await postService.renameTag(editingItem, newName);
      }
      toast.success(`${activeTab === 'categories' ? 'Category' : 'Tag'} renamed!`);
      setEditingItem(null);
      fetchMetadata();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item}" from ALL your posts?`)) return;
    try {
      if (activeTab === 'categories') {
        await postService.deleteCategory(item);
      } else {
        await postService.deleteTag(item);
      }
      toast.success('Removed successfully.');
      fetchMetadata();
    } catch (err) {
      toast.error(err.message || 'Deletion failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-brand-accent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">Indexing Tags...</span>
        </div>
      </div>
    );
  }

  const currentList = activeTab === 'categories' ? metadata.categories : metadata.tags;

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Page Header */}
      <div className="bg-brand-surface border-b border-brand-border">
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-10 sm:py-12">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 text-[10px] font-black text-brand-muted hover:text-brand-primary uppercase tracking-widest transition-colors mb-6"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-brand-primary tracking-tighter mb-2">Signal Management</h1>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest opacity-60">Global metadata control across all digital contributions.</p>
            </div>
            {/* Counts */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-center px-6 py-3 bg-white border border-brand-border rounded-2xl shadow-sm">
                <p className="text-2xl font-black text-brand-primary leading-none mb-1">{metadata.categories.length}</p>
                <p className="text-[9px] text-brand-muted font-black uppercase tracking-widest opacity-60">Categories</p>
              </div>
              <div className="text-center px-6 py-3 bg-white border border-brand-border rounded-2xl shadow-sm">
                <p className="text-2xl font-black text-brand-primary leading-none mb-1">{metadata.tags.length}</p>
                <p className="text-[9px] text-brand-muted font-black uppercase tracking-widest opacity-60">Tags</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-10 border-b border-brand-border">
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-4 px-1 mr-8 text-[11px] font-black uppercase tracking-[0.2em] transition-colors relative ${
                activeTab === 'categories'
                  ? 'text-brand-primary'
                  : 'text-brand-muted/40 hover:text-brand-primary'
              }`}
            >
              Categories
              {activeTab === 'categories' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`pb-4 px-1 text-[11px] font-black uppercase tracking-[0.2em] transition-colors relative ${
                activeTab === 'tags'
                  ? 'text-brand-primary'
                  : 'text-brand-muted/40 hover:text-brand-primary'
              }`}
            >
              Tags
              {activeTab === 'tags' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-8 sm:py-10">
        <div className="max-w-3xl">

          {currentList.length === 0 ? (
            <div className="py-20 sm:py-28 text-center border border-dashed border-gray-200 rounded-2xl bg-white">
              <div className="text-4xl mb-3">{activeTab === 'categories' ? '🗂️' : '🏷️'}</div>
              <p className="text-gray-500 font-medium mb-1">
                No {activeTab} yet
              </p>
              <p className="text-gray-400 text-sm">
                {activeTab === 'categories'
                  ? 'Add categories when writing your posts.'
                  : 'Add tags when writing your posts.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentList.map((item) => (
                <div
                  key={item}
                  className="group bg-brand-surface border border-brand-border rounded-2xl px-6 py-5 flex items-center justify-between hover:bg-white transition-all duration-300 shadow-sm"
                >
                  {editingItem === item ? (
                    // Edit mode
                    <form onSubmit={handleRename} className="flex-1 flex flex-col sm:flex-row gap-4">
                      <input
                        autoFocus
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-primary focus:border-brand-accent outline-none transition-colors"
                        placeholder="New terminal label..."
                      />
                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-brand-accent text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-accent-hover transition-colors shadow-lg shadow-brand-accent/20"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          type="button"
                          className="px-6 py-2.5 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors"
                        >
                          Abort
                        </button>
                      </div>
                    </form>
                  ) : (
                    // View mode
                    <>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${
                          activeTab === 'categories'
                            ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20'
                            : 'bg-brand-bg text-brand-muted border border-brand-border'
                        }`}>
                          {activeTab === 'categories' ? '📁' : '#'} {item}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => { setEditingItem(item); setNewName(item); }}
                          className="px-4 py-2 text-[10px] font-black uppercase text-brand-muted hover:text-brand-primary hover:bg-brand-bg rounded-xl transition-colors"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="px-4 py-2 text-[10px] font-black uppercase text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info Note */}
          <div className="mt-12 p-6 bg-amber-500/5 border border-brand-accent/10 rounded-2xl flex gap-4">
            <svg className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-1">Global Broadcast Propagation</p>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Renaming or deleting a {activeTab === 'categories' ? 'category' : 'tag'} will trigger a cascade update across <strong>all your posts</strong> using this label.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageMetadata;
