import { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { TenantContext } from '../context/TenantContext';

export default function AdminDashboard() {
    const { tenantId } = useContext(TenantContext);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (tenantId) fetchPosts();
    }, [tenantId]);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/posts/${id}/status?status=${status}`);
            fetchPosts();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (!tenantId) return <div className="p-8">Please select a tenant on the home page first.</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <table className="min-w-full bg-white rounded shadow text-left">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-4">Title</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map(post => (
                        <tr key={post.id} className="border-t">
                            <td className="p-4">{post.title}</td>
                            <td className="p-4">{post.status}</td>
                            <td className="p-4">
                                <select
                                    value={post.status}
                                    onChange={(e) => updateStatus(post.id, e.target.value)}
                                    className="border rounded p-1"
                                >
                                    <option value="planned">Planned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
