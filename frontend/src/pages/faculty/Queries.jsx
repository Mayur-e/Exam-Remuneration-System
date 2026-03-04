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
            OPEN: 'bg-blue-50 text-blue-700 border border-blue-200',
            IN_PROGRESS: 'bg-amber-50 text-amber-700 border border-amber-200',
            RESOLVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            CLOSED: 'bg-slate-50 text-slate-700 border border-slate-200'
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
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)]">
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support & Queries</h1>
                    <p className="text-slate-500 text-sm mt-1">Get help with your claims and payments</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span> Raise New Query
                </button>
            </div>

            {/* Main Layout - Sidebar + Detail */}
            <div className="flex h-[calc(100vh-14rem)] gap-6 flex-col lg:flex-row">
                {/* Query List Sidebar */}
                <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-full">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">My Queries</h2>
                            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">{queries.length}</span>
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">filter_list</span>
                            <select
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="OPEN">Unresolved</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="w-8 h-8 border-3 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        ) : queries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center px-4">
                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">inbox</span>
                                <p className="font-medium text-slate-500">No queries found</p>
                            </div>
                        ) : (
                            queries.map((query) => (
                                <div
                                    key={query.id}
                                    onClick={() => viewQueryDetails(query.id)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedQuery?.query?.id === query.id
                                        ? 'border-primary/50 bg-primary/5 shadow-sm'
                                        : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${getStatusColor(query.status)}`}>
                                            {getStatusLabel(query.status)}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2">
                                            {new Date(query.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{query.subject}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="material-symbols-outlined text-[14px]">comment</span>
                                        <span className="truncate">{query.response_count || 0} responses</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100/50">
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{query.category.replace('_', ' ')}</span>
                                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Query Detail View */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-full">
                    {!selectedQuery ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-slate-300">chat</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-1">Select a Query</h3>
                            <p className="text-sm">Choose a query from the inbox on the left to view details and respond.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            {/* Detail Header */}
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 mb-2">{selectedQuery.query.subject}</h2>
                                    <div className="flex flex-wrap gap-4 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getStatusColor(selectedQuery.query.status)}`}>
                                                {getStatusLabel(selectedQuery.query.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">category</span>
                                            <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-md">{selectedQuery.query.category.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">event</span>
                                            <span className="font-medium">{new Date(selectedQuery.query.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {selectedQuery.query.claim_id && (
                                        <div className="mt-3 text-sm text-primary font-medium flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">link</span>
                                            Linked to Claim #{selectedQuery.query.claim_id}
                                        </div>
                                    )}
                                </div>
                                <div className="shrink-0 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditQuery(selectedQuery.query)}
                                        className="border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                                    >
                                        <span className="material-symbols-outlined text-[16px] mr-1">edit</span> Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteQuery(selectedQuery.query.id)}
                                        className="border-red-200 text-red-600 font-bold hover:bg-red-50 hover:text-red-700"
                                    >
                                        <span className="material-symbols-outlined text-[16px] mr-1">delete</span> Delete
                                    </Button>
                                    <button
                                        onClick={() => setSelectedQuery(null)}
                                        className="p-2 ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/30">
                                {/* Original Query */}
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Original Description</p>
                                    </div>
                                    <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{selectedQuery.query.description}</p>
                                </div>

                                {/* Responses */}
                                {selectedQuery.responses.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                                        <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">forum</span>
                                        <p className="text-sm font-medium text-slate-600 mb-1">No responses yet</p>
                                        <p className="text-xs text-slate-400">Our team will respond to your query soon.</p>
                                    </div>
                                ) : (
                                    selectedQuery.responses.map((resp, idx) => {
                                        const isMyReply = resp.responder_role === 'FACULTY';
                                        return (
                                            <div key={idx} className={`flex ${isMyReply ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] rounded-2xl p-4 ${resp.is_internal_note
                                                    ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tr-sm'
                                                    : isMyReply
                                                        ? 'bg-primary text-white rounded-br-sm shadow-md'
                                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                                                    }`}>
                                                    <div className="flex justify-between items-center mb-2 gap-4">
                                                        <span className={`text-xs font-bold ${isMyReply ? 'text-white/80' : 'text-slate-900'}`}>
                                                            {resp.responder_name} {isMyReply ? '(You)' : `(${resp.responder_role})`}
                                                        </span>
                                                        {resp.is_internal_note && (
                                                            <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded uppercase">Internal</span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isMyReply && !resp.is_internal_note ? 'text-white/90' : 'text-slate-600'}`}>
                                                        {resp.message}
                                                    </p>
                                                    <div className={`text-[10px] mt-2 text-right font-medium ${isMyReply && !resp.is_internal_note ? 'text-primary-light' : 'text-slate-400'}`}>
                                                        {new Date(resp.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Response Input */}
                            <div className="p-4 border-t border-slate-100 bg-white">
                                <form onSubmit={handleSendReply} className="flex gap-3">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-14 min-h-[56px] text-sm custom-scrollbar"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={!replyText.trim()}
                                        className="self-end inline-flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary-hover disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors shrink-0 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[24px]">send</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
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