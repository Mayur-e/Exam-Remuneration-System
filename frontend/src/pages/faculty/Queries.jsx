import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export default function Queries() {
    const [queries, setQueries] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [editingQueryId, setEditingQueryId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

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
    }, [statusFilter]);

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
            const url = statusFilter ? `/queries?status=${statusFilter}` : '/queries';
            const response = await api.get(url);
            setQueries(response.data.queries);
        } catch (error) {
            console.error('Fetch queries error:', error);
            // Custom toast animation
            setToastMessage('Failed to load queries');
            setToastType('error');
            setTimeout(() => setToastMessage(""), 3000);
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
            // Custom toast animation
            setToastMessage('Query submitted successfully!');
            setToastType('success');
            setTimeout(() => setToastMessage(""), 3000);

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
            setToastMessage(error.response?.data?.message || 'Failed to create query');
            setToastType('error');
            setTimeout(() => setToastMessage(""), 3000);
        }
    };

    const viewQueryDetails = async (queryId) => {
        try {
            const response = await api.get(`/queries/${queryId}`);
            setSelectedQuery(response.data);
            setReplyText('');
        } catch (error) {
            console.error('Fetch query details error:', error);
            setToastMessage('Failed to load query details');
            setToastType('error');
            setTimeout(() => setToastMessage(""), 3000);
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
            // Custom toast animation
            setToastMessage('Query updated successfully!');
            setToastType('success');
            setTimeout(() => setToastMessage(""), 3000);

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
            setToastMessage(error.response?.data?.message || 'Failed to update query');
            setToastType('error');
            setTimeout(() => setToastMessage(""), 3000);
        }
    };

    const handleDeleteQuery = async (queryId) => {
        if (!window.confirm('Are you sure you want to delete this query? This action cannot be undone.')) {
            return;
        }
        try {
            await api.delete(`/queries/${queryId}`);
            // Custom toast animation
            setToastMessage('Query deleted successfully');
            setToastType('success');
            setTimeout(() => setToastMessage(""), 3000);

            if (selectedQuery && selectedQuery.query.id === queryId) {
                setSelectedQuery(null);
            }
            fetchQueries();
        } catch (error) {
            console.error('Delete query error:', error);
            setToastMessage(error.response?.data?.message || 'Failed to delete query');
            setToastType('error');
            setTimeout(() => setToastMessage(""), 3000);
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
            // Custom toast animation
            setToastMessage('Reply sent successfully');
            setToastType('success');
            setTimeout(() => setToastMessage(""), 3000);

            setReplyText('');
            viewQueryDetails(selectedQuery.query.id);
            fetchQueries();
        } catch (error) {
            console.error('Send reply error:', error);
            setToastMessage(error.response?.data?.message || 'Failed to send reply');
            setToastType('error');
            setTimeout(() => setToastMessage(""), 3000);
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

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 25
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            transition: {
                duration: 0.2
            }
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.2
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
                ></motion.div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto font-display bg-background-light min-h-[calc(100vh-4rem)]">
            {/* Custom Toast Animation */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3 }}
                        className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-xl z-50 font-medium ${toastType === "success"
                                ? "bg-green-600 text-white"
                                : toastType === "error"
                                    ? "bg-red-600 text-white"
                                    : "bg-blue-600 text-white"
                            }`}
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">Support & Queries</h3>
                    <p className="text-slate-500">Get help with your claims and payments</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-2 border border-slate-200 rounded-xl font-medium bg-primary text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span> Raise New Query
                </button>
            </div>

            {/* Main Layout - Sidebar + Detail */}
            <div className="flex h-[calc(100vh-14rem)] gap-4">
                {/* Query List Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-1/3 flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
                >
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-semibold text-slate-800 mb-3">My Queries</h2>
                        <select
                            className="w-full px-4 py-2 rounded-xl border-none bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="OPEN">Unresolved</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex-1 overflow-y-auto p-3 space-y-2"
                    >
                        {loading ? (
                            <p className="text-center py-4 text-muted-foreground">Loading...</p>
                        ) : queries.length === 0 ? (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8 text-muted-foreground"
                            >
                                No queries found
                            </motion.p>
                        ) : (
                            queries.map((query, index) => (
                                <motion.div
                                    key={query.id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.01, borderColor: "rgb(59 130 246)" }}
                                    onClick={() => viewQueryDetails(query.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${selectedQuery?.query?.id === query.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-border hover:bg-accent/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <motion.span
                                            whileHover={{ scale: 1.1 }}
                                            className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(query.status)}`}
                                        >
                                            {getStatusLabel(query.status)}
                                        </motion.span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(query.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                                        {query.subject}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                        {query.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{query.category.replace('_', ' ')}</span>
                                        <span>•</span>
                                        <span>{query.response_count || 0} responses</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </motion.div>

                {/* Query Detail View */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex-1 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
                >
                    {!selectedQuery ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <p className="text-lg font-medium">Select a query to view details</p>
                                <p className="text-sm mt-2">Click on a query from the list to see the conversation</p>
                            </motion.div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            {/* Query Header */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-foreground mb-2">
                                            {selectedQuery.query.subject}
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <motion.span
                                                whileHover={{ scale: 1.1 }}
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedQuery.query.status)}`}
                                            >
                                                {getStatusLabel(selectedQuery.query.status)}
                                            </motion.span>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(selectedQuery.query.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        {selectedQuery.query.claim_id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 text-sm text-blue-600 dark:text-blue-400"
                                            >
                                                Linked to Claim #{selectedQuery.query.claim_id}
                                            </motion.div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditQuery(selectedQuery.query)}
                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            >
                                                Edit
                                            </Button>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteQuery(selectedQuery.query.id)}
                                                className="text-red-600 hover:text-red-700 dark:text-red-400"
                                            >
                                                Delete
                                            </Button>
                                        </motion.div>
                                        <motion.button
                                            whileHover={{ rotate: 90 }}
                                            onClick={() => setSelectedQuery(null)}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            ✕
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Query Content & Responses */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Description */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h3 className="font-semibold text-foreground mb-2">Description</h3>
                                    <p className="text-muted-foreground">{selectedQuery.query.description}</p>
                                </motion.div>

                                {/* Responses */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="border-t border-border pt-6"
                                >
                                    <h3 className="font-semibold text-foreground mb-4">
                                        Responses ({selectedQuery.responses.length})
                                    </h3>
                                    {selectedQuery.responses.length === 0 ? (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-muted-foreground text-center py-8"
                                        >
                                            No responses yet. Our team will respond soon.
                                        </motion.p>
                                    ) : (
                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="space-y-4"
                                        >
                                            {selectedQuery.responses.map((response, index) => (
                                                <motion.div
                                                    key={response.id}
                                                    variants={itemVariants}
                                                    whileHover={{ scale: 1.01, backgroundColor: "rgba(148, 163, 184, 0.1)" }}
                                                    className="bg-accent/50 rounded-lg p-4 transition-all duration-200"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-foreground">
                                                            {response.responder_name} ({response.responder_role})
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(response.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{response.message}</p>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Reply Section */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="border-t border-border pt-6"
                                >
                                    <h3 className="font-semibold text-foreground mb-3">Add Reply</h3>
                                    <form onSubmit={handleSendReply} className="space-y-3">
                                        <motion.textarea
                                            whileFocus={{ scale: 1.01 }}
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                            required
                                        />
                                        <div className="flex justify-end">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    type="submit"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    Send Reply
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Create/Edit Query Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-6">
                                        {editingQueryId ? 'Edit Query' : 'Raise New Query'}
                                    </h2>
                                    <form onSubmit={editingQueryId ? handleUpdateQuery : handleCreateQuery} className="space-y-4">

                                        {/* Claim Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Related Claim (Optional)
                                            </label>
                                            <select
                                                value={formData.claim_id}
                                                onChange={(e) => setFormData({ ...formData, claim_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Subject *
                                            </label>
                                            <motion.div whileHover={{ scale: 1.01 }}>
                                                <Input
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    placeholder="Brief description of your issue"
                                                    required
                                                    className="focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                                />
                                            </motion.div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Description *
                                            </label>
                                            <motion.textarea
                                                whileFocus={{ scale: 1.01 }}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Provide detailed information about your query"
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Category *
                                            </label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex-1"
                                            >
                                                <Button
                                                    type="submit"
                                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                                                >
                                                    {editingQueryId ? 'Update Query' : 'Submit Query'}
                                                </Button>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex-1"
                                            >
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
                                                    className="w-full"
                                                >
                                                    Cancel
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </form>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}