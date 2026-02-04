import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';

export default function Queries() {
    const [queries, setQueries] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [editingQueryId, setEditingQueryId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const preSelectedClaimId = searchParams.get('claim_id');

    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: 'OTHER',
        claim_id: ''
    });

    useEffect(() => {
        fetchQueries();
        fetchClaims();
    }, []);

    useEffect(() => {
        if (preSelectedClaimId && claims.length > 0) {
            const claim = claims.find(c => c.id === parseInt(preSelectedClaimId));
            if (claim) {
                setFormData(prev => ({
                    ...prev,
                    claim_id: claim.id,
                    subject: `Query regarding ${claim.subject_name || 'Claim'} (${claim.subject_code || 'No Code'})`
                }));
                setShowCreateModal(true);
            }
        }
    }, [preSelectedClaimId, claims]);

    const fetchQueries = async () => {
        try {
            setLoading(true);
            const response = await api.get('/queries');
            setQueries(response.data.queries);
        } catch (error) {
            console.error('Fetch queries error:', error);
            showToast('Failed to load queries', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchClaims = async () => {
        try {
            const response = await api.get('/faculty/exams');
            setClaims(response.data);
        } catch (error) {
            console.error('Fetch claims error:', error);
        }
    };

    const handleCreateQuery = async (e) => {
        e.preventDefault();
        try {
            await api.post('/queries', formData);
            showToast('Query submitted successfully!', 'success');
            setShowCreateModal(false);
            setFormData({
                subject: '',
                description: '',
                category: 'OTHER',
                claim_id: ''
            });
            // Clear URL params
            if (preSelectedClaimId) {
                navigate('/faculty/queries');
            }
            fetchQueries();
        } catch (error) {
            console.error('Create query error:', error);
            showToast(error.response?.data?.message || 'Failed to create query', 'error');
        }
    };

    const viewQueryDetails = async (queryId) => {
        try {
            const response = await api.get(`/queries/${queryId}`);
            setSelectedQuery(response.data);
            setReplyText('');
        } catch (error) {
            console.error('Fetch query details error:', error);
            showToast('Failed to load query details', 'error');
        }
    };

    const handleEditQuery = (query) => {
        setEditingQueryId(query.id);
        setFormData({
            subject: query.subject,
            description: query.description,
            category: query.category,
            claim_id: query.claim_id || ''
        });
        setShowCreateModal(true);
    };

    const handleUpdateQuery = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/queries/${editingQueryId}`, formData);
            showToast('Query updated successfully!', 'success');
            setShowCreateModal(false);
            setEditingQueryId(null);
            setFormData({
                subject: '',
                description: '',
                category: 'OTHER',
                claim_id: ''
            });
            fetchQueries();
            if (selectedQuery && selectedQuery.query.id === editingQueryId) {
                viewQueryDetails(editingQueryId);
            }
        } catch (error) {
            console.error('Update query error:', error);
            showToast(error.response?.data?.message || 'Failed to update query', 'error');
        }
    };

    const handleDeleteQuery = async (queryId) => {
        if (!window.confirm('Are you sure you want to delete this query? This action cannot be undone.')) {
            return;
        }
        try {
            await api.delete(`/queries/${queryId}`);
            showToast('Query deleted successfully', 'success');
            if (selectedQuery && selectedQuery.query.id === queryId) {
                setSelectedQuery(null);
            }
            fetchQueries();
        } catch (error) {
            console.error('Delete query error:', error);
            showToast(error.response?.data?.message || 'Failed to delete query', 'error');
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            await api.post(`/queries/${selectedQuery.query.id}/respond`, {
                message: replyText,
                is_internal_note: false
            });
            showToast('Reply sent successfully', 'success');
            setReplyText('');
            viewQueryDetails(selectedQuery.query.id);
            fetchQueries();
        } catch (error) {
            console.error('Send reply error:', error);
            showToast(error.response?.data?.message || 'Failed to send reply', 'error');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        };
        return colors[status] || colors.OPEN;
    };

    const getStatusLabel = (status) => {
        const labels = {
            OPEN: 'Unresolved',
            IN_PROGRESS: 'In Progress',
            RESOLVED: 'Resolved',
            CLOSED: 'Closed'
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-card-foreground">Support & Queries</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Get help with your claims and payments
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                >
                    + Raise New Query
                </Button>
            </div>

            {/* Queries List */}
            <div className="grid gap-4">
                {queries.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="text-muted-foreground">
                            <p className="text-lg font-medium">No queries yet</p>
                            <p className="text-sm mt-2">Click "Raise New Query" to get started</p>
                        </div>
                    </Card>
                ) : (
                    queries.map((query) => (
                        <Card
                            key={query.id}
                            className="p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 cursor-pointer" onClick={() => viewQueryDetails(query.id)}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-card-foreground">
                                            {query.subject}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                                            {getStatusLabel(query.status)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {query.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>Category: {query.category.replace('_', ' ')}</span>
                                        <span>{query.response_count || 0} responses</span>
                                        <span>{new Date(query.created_at).toLocaleDateString()}</span>
                                        {query.claim_id && (
                                            <span className="bg-muted px-2 py-0.5 rounded">
                                                Claim #{query.claim_id}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditQuery(query);
                                        }}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteQuery(query.id);
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Create/Edit Query Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-card-foreground mb-6">
                                {editingQueryId ? 'Edit Query' : 'Raise New Query'}
                            </h2>
                            <form onSubmit={editingQueryId ? handleUpdateQuery : handleCreateQuery} className="space-y-4">

                                {/* Claim Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Related Claim (Optional)
                                    </label>
                                    <select
                                        value={formData.claim_id}
                                        onChange={(e) => setFormData({ ...formData, claim_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Select a Claim --</option>
                                        {claims.map(claim => (
                                            <option key={claim.id} value={claim.id}>
                                                {new Date(claim.created_at || Date.now()).toLocaleDateString()} - {claim.subject_name} ({claim.subject_code}) - {claim.status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Subject *
                                    </label>
                                    <Input
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Brief description of your issue"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Provide detailed information about your query"
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="PAYMENT_ISSUE">Payment Issue</option>
                                        <option value="CLAIM_REJECTION">Claim Rejection</option>
                                        <option value="TECHNICAL">Technical Issue</option>
                                        <option value="RATE_INQUIRY">Rate Inquiry</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                                    >
                                        {editingQueryId ? 'Update Query' : 'Submit Query'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setEditingQueryId(null);
                                            setFormData({
                                                subject: '',
                                                description: '',
                                                category: 'OTHER',
                                                claim_id: ''
                                            });
                                            if (preSelectedClaimId) navigate('/faculty/queries');
                                        }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}

            {/* Query Details Modal */}
            {selectedQuery && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-card-foreground mb-2">
                                        {selectedQuery.query.subject}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedQuery.query.status)}`}>
                                            {getStatusLabel(selectedQuery.query.status)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(selectedQuery.query.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    {selectedQuery.query.claim_id && (
                                        <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                            Linked to Claim #{selectedQuery.query.claim_id}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedQuery(null)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-card-foreground mb-2">Description</h3>
                                    <p className="text-muted-foreground">{selectedQuery.query.description}</p>
                                </div>

                                <div className="border-t border-border pt-6">
                                    <h3 className="font-semibold text-card-foreground mb-4">
                                        Responses ({selectedQuery.responses.length})
                                    </h3>
                                    {selectedQuery.responses.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No responses yet. Our team will respond soon.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedQuery.responses.map((response) => (
                                                <div
                                                    key={response.id}
                                                    className="bg-accent/50 rounded-lg p-4"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-card-foreground">
                                                            {response.responder_name} ({response.responder_role})
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(response.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{response.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Reply Section */}
                                <div className="border-t border-border pt-6 mt-6">
                                    <h3 className="font-semibold text-card-foreground mb-3">Add Reply</h3>
                                    <form onSubmit={handleSendReply} className="space-y-3">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Send Reply
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
