import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import postService from '../services/postService';
import api from '../services/api';
import toast from 'react-hot-toast';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    isPublished: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const result = await postService.getPostById(id);
        const post = result.post || result;
        setFormData({
          title: post.title || '',
          content: post.content || '',
          category: post.categories?.join(', ') || '',
          tags: post.tags?.join(', ') || '',
          isPublished: post.isPublished !== false
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch post data.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  // Custom Image Handler for Quill
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      try {
        toast.loading('Uploading image...', { id: 'upload' });
        const response = await api.post('/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const url = response.data.url;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', url);
        toast.success('Image uploaded', { id: 'upload' });
      } catch (err) {
        console.error('Image upload failed:', err);
        toast.error('Image upload failed', { id: 'upload' });
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link', 'image'],
        ['undo', 'redo'],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
        undo: function() {
          this.quill.history.undo();
        },
        redo: function() {
          this.quill.history.redo();
        }
      }
    },
    history: {
      delay: 1000,
      maxStack: 500,
      userOnly: true
    }
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'link', 'image'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuillChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
    if (errors.content && value !== '<p><br></p>' && value.trim()) {
        setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        categories: formData.category ? formData.category.split(',').map(c => c.trim()).filter(c => c) : [],
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        isPublished: formData.isPublished
      };

      await postService.updatePost(id, payload);
      toast.success('Post updated!');
      navigate(`/post/${id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update post.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-brand-accent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">Retrieving Signal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen py-16 sm:py-24 px-4 sm:px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-3">Refine Story.</h1>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Polishing your ideas for the global network.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <label htmlFor="title" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              Signal Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              autoComplete="off"
              className={`w-full bg-transparent border-b ${errors.title ? 'border-red-500 text-red-100 placeholder-red-300' : 'border-white/5 text-white placeholder-zinc-800 focus:border-brand-accent'} pb-4 text-3xl sm:text-5xl font-black outline-none transition-all`}
              placeholder="Title of your story..."
            />
            {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
          </div>

          <div className="space-y-6">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              Content Stream
            </label>
            <div className={`quill-obsidian-wrapper bg-white/2 border ${errors.content ? 'border-red-500' : 'border-white/5 focus-within:border-brand-accent/30'} rounded-[2rem] overflow-hidden transition-all shadow-2xl`}>
              <ReactQuill 
                ref={quillRef}
                theme="snow"
                value={formData.content}
                onChange={handleQuillChange}
                modules={modules}
                formats={formats}
              />
            </div>
            {errors.content && <p className="text-xs text-red-500 font-medium">{errors.content}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label htmlFor="category" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                Classification (comma list)
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-zinc-800 focus:border-brand-accent outline-none transition-all text-sm shadow-xl"
              />
            </div>

            <div className="space-y-4">
              <label htmlFor="tags" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                Metadata Tags (comma list)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-zinc-800 focus:border-brand-accent outline-none transition-all text-sm shadow-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-12 border-y border-white/5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                className={`w-14 h-7 rounded-full transition-all relative ${formData.isPublished ? 'bg-brand-accent' : 'bg-white/5'}`}
              >
                <div className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-full transition-transform duration-300 ${formData.isPublished ? 'translate-x-7 bg-zinc-950' : 'bg-zinc-600'}`} />
              </button>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                {formData.isPublished ? 'Live Signal' : 'Private Draft'}
              </span>
            </div>

            <div className="flex items-center gap-8">
              <button
                type="button"
                onClick={() => navigate(`/post/${id}`)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-all underline underline-offset-8"
                disabled={saving}
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-12 py-4 bg-white text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 disabled:opacity-50"
              >
                {saving ? 'Transmitting...' : 'Update Story'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
