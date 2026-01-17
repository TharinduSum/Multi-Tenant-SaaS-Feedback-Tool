import { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { TenantContext } from '../context/TenantContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PublicBoard() {
    const { tenantId, setTenantId } = useContext(TenantContext);
    const { user, token } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Tenant Selection State
    const [tenants, setTenants] = useState([]);
    const [newCompany, setNewCompany] = useState('');
    const [newSlug, setNewSlug] = useState('');

    // Post Creation State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (tenantId) {
            fetchPosts();
        } else {
            fetchTenants();
        }
    }, [tenantId]);

    const fetchTenants = async () => {
        try {
            const res = await api.get('/tenants');
            setTenants(res.data);
        } catch (err) {
            console.error("Failed to fetch tenants", err);
        }
    };

    const createTenant = async (e) => {
        e.preventDefault();
        if (!newCompany || !newSlug) return;
        try {
            const res = await api.post('/tenants', { company_name: newCompany, slug: newSlug });
            setTenants([...tenants, res.data]);
            setNewCompany('');
            setNewSlug('');
        } catch (err) {
            alert("Failed to create tenant");
            console.error(err);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createPost = async (e) => {
        e.preventDefault();
        if (!title || !description) return;
        try {
            await api.post('/posts', { title, description, status: 'planned' });
            setTitle('');
            setDescription('');
            fetchPosts();
            alert('Feedback submitted!');
        } catch (err) {
            alert('Failed to submit feedback.');
            console.error(err);
        }
    };

    const handleUpvote = async (id) => {
        try {
            await api.post(`/posts/${id}/upvote`);
            alert('Upvoted!');
            fetchPosts(); // Refresh
        } catch (err) {
            alert('Failed to upvote. Try logging in.');
        }
    };

    if (!tenantId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Select a Workspace</h2>

                    {/* Available Tenants List */}
                    {tenants.length > 0 ? (
                        <div className="mb-8">
                            <p className="text-sm text-gray-500 mb-2">Existing Workspaces</p>
                            <div className="space-y-2">
                                {tenants.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTenantId(t.id)}
                                        className="w-full text-left px-4 py-3 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors flex justify-between items-center group"
                                    >
                                        <span className="font-medium text-gray-700 group-hover:text-blue-700">{t.company_name}</span>
                                        <span className="text-xs text-gray-400">#{t.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 mb-6">No workspaces found. Create one to get started.</p>
                    )}

                    {/* Create New Tenant */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Create New Workspace</h3>
                        <form onSubmit={createTenant} className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Company Name (e.g. Acme)"
                                    value={newCompany}
                                    onChange={e => setNewCompany(e.target.value)}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Slug (e.g. acme)"
                                    value={newSlug}
                                    onChange={e => setNewSlug(e.target.value)}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                                Create Workspace
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Feedback Board</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => setTenantId(null)} className="text-sm text-blue-600 hover:underline">
                        Switch Workspace
                    </button>
                    {!token && (
                        <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600">Login</Link>
                    )}
                </div>
            </div>

            {/* Submit Feedback Section */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Submit Feedback</h2>
                {token ? (
                    <form onSubmit={createPost} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Title (e.g. Add Dark Mode)"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <textarea
                                placeholder="Description (e.g. It would be easier on the eyes...)"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                required
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
                            Submit Post
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded">
                        <p className="text-gray-600 mb-2">You must be logged in to submit feedback.</p>
                        <Link to="/login" className="inline-block bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 text-blue-600 font-medium">
                            Log in to Post
                        </Link>
                    </div>
                )}
            </div>

            {loading ? <p className="text-center text-gray-500">Loading posts...</p> : (
                <div className="space-y-4">
                    {posts.length === 0 && <p className="text-gray-500 text-center py-8">No posts yet.</p>}
                    {posts.map(post => (
                        <div key={post.id} className="border p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex justify-between items-start gap-4">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900 mb-2">{post.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{post.description}</p>
                                <div className="mt-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${post.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            post.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {post.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleUpvote(post.id)}
                                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors min-w-[80px]"
                            >
                                <span className="text-lg">▲</span>
                                <span className="text-sm">Upvote</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
