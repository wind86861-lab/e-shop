import { useEffect, useState } from 'react'
import { blogsAPI, uploadAPI } from '../../services/api'
import { Plus, Pencil, Trash2, X, Eye, Upload } from 'lucide-react'

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: { uz: '', ru: '', en: '' },
    excerpt: { uz: '', ru: '', en: '' },
    content: { uz: '', ru: '', en: '' },
    image: '',
    author: 'Admin',
    category: '',
    isPublished: false,
    featured: false,
  })

  useEffect(() => { fetchBlogs() }, [page])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const res = await blogsAPI.getAll({ page, limit: 10 })
      setBlogs(res.data.blogs || [])
      setTotal(res.data.total || 0)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ title: { uz: '', ru: '', en: '' }, excerpt: { uz: '', ru: '', en: '' }, content: { uz: '', ru: '', en: '' }, image: '', author: 'Admin', category: '', isPublished: false, featured: false })
    setShowModal(true)
  }

  const openEdit = (blog) => {
    setEditing(blog._id)
    setForm({
      title: blog.title || { uz: '', ru: '', en: '' },
      excerpt: blog.excerpt || { uz: '', ru: '', en: '' },
      content: blog.content || { uz: '', ru: '', en: '' },
      image: blog.image || '',
      author: blog.author || 'Admin',
      category: blog.category || '',
      isPublished: blog.isPublished || false,
      featured: blog.featured || false,
    })
    setShowModal(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await uploadAPI.single(fd)
      setForm(f => ({ ...f, image: res.data.url }))
    } catch (err) { alert('Upload failed') }
    finally { setUploading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) await blogsAPI.update(editing, form)
      else await blogsAPI.create(form)
      setShowModal(false)
      fetchBlogs()
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog post?')) return
    try { await blogsAPI.delete(id); fetchBlogs() }
    catch (err) { alert('Error') }
  }

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 text-sm">{total} posts</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus size={18} /> Add Post
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Image</th>
              <th className="text-left p-4 font-medium text-gray-600">Title (UZ)</th>
              <th className="text-left p-4 font-medium text-gray-600">Author</th>
              <th className="text-left p-4 font-medium text-gray-600">Views</th>
              <th className="text-left p-4 font-medium text-gray-600">Taniqli</th>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Date</th>
              <th className="text-right p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">Loading...</td></tr>
            ) : blogs.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">No blog posts</td></tr>
            ) : blogs.map(blog => (
              <tr key={blog._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="w-16 h-10 bg-gray-100 rounded-lg overflow-hidden">
                    {blog.image ? <img src={blog.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />}
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-900 max-w-[200px] truncate">{blog.title?.uz || '—'}</td>
                <td className="p-4 text-gray-700">{blog.author}</td>
                <td className="p-4 text-gray-500 flex items-center gap-1"><Eye size={14} /> {blog.views}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${blog.featured ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                    {blog.featured ? '⭐ Taniqli' : '—'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-xs">{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(blog)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(blog._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Post' : 'Add Post'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input placeholder="Title (UZ)" value={form.title.uz} onChange={e => setForm(f => ({ ...f, title: { ...f.title, uz: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2" required />
                <input placeholder="Title (RU)" value={form.title.ru} onChange={e => setForm(f => ({ ...f, title: { ...f.title, ru: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2" required />
                <input placeholder="Title (EN)" value={form.title.en} onChange={e => setForm(f => ({ ...f, title: { ...f.title, en: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea placeholder="Excerpt (UZ)" value={form.excerpt.uz} onChange={e => setForm(f => ({ ...f, excerpt: { ...f.excerpt, uz: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2" rows={2} />
                <textarea placeholder="Excerpt (RU)" value={form.excerpt.ru} onChange={e => setForm(f => ({ ...f, excerpt: { ...f.excerpt, ru: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2" rows={2} />
                <textarea placeholder="Excerpt (EN)" value={form.excerpt.en} onChange={e => setForm(f => ({ ...f, excerpt: { ...f.excerpt, en: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Content</label>
                <textarea placeholder="Content (UZ)" value={form.content.uz} onChange={e => setForm(f => ({ ...f, content: { ...f.content, uz: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2" rows={4} />
                <textarea placeholder="Content (RU)" value={form.content.ru} onChange={e => setForm(f => ({ ...f, content: { ...f.content, ru: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2" rows={4} />
                <textarea placeholder="Content (EN)" value={form.content.en} onChange={e => setForm(f => ({ ...f, content: { ...f.content, en: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={4} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <div className="flex items-center gap-4">
                  {form.image && <img src={form.image} alt="" className="w-24 h-16 object-cover rounded-lg border" />}
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                    {uploading ? <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" /> : <Upload size={16} />}
                    <span>Upload image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input placeholder="e.g. News, Articles" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" />
                  <span className="text-sm text-gray-700">⭐ Taniqli (Bosh sahifada ko'rsatish)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
