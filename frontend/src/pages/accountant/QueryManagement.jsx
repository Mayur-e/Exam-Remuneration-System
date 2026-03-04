import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';

export default function QueryManagement() {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        fetchQueries();
    }, [statusFilter]);

    const fetchQueries = async () => {
        try {
            setLoading(true);
            const url = statusFilter ? `/queries?status=${statusFilter}` : '/queries';
            const response = await api.get(url);
            setQueries(response.data.queries);
        } catch (error) {
            console.error('Fetch queries error:', error);
            showToast('Failed to load queries', 'error');
        } finally {
            setLoading(false);
        }
    };

    const viewQueryDetails = async (queryId) => {
        try {
            const response = await api.get(`/queries/${queryId}`);
            setSelectedQuery(response.data);
            setResponseText('');
        } catch (error) {
            console.error('Fetch query details error:', error);
            showToast('Failed to load query details', 'error');
        }
    };

    const handleSendResponse = async (e) => {
        e.preventDefault();
        if (!responseText.trim()) return;

        try {
            await api.post(`/queries/${selectedQuery.query.id}/respond`, {
                message: responseText,
                is_internal_note: false
            });

            showToast('Response sent successfully', 'success');
            setResponseText('');
            viewQueryDetails(selectedQuery.query.id); // Refresh details
            fetchQueries(); // Refresh list to update response count/dates
        } catch (error) {
            console.error('Send response error:', error);
            showToast('Failed to send response', 'error');
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            await api.patch(`/queries/${selectedQuery.query.id}/status`, {
                status: newStatus
            });
            showToast(`Status updated to ${newStatus}`, 'success');
            viewQueryDetails(selectedQuery.query.id);
            fetchQueries();
        } catch (error) {
            console.error('Update status error:', error);
            showToast('Failed to update status', 'error');
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

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)]">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Query Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Review and resolve faculty and staff queries</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl bg-primary/10 p-2 rounded-xl">support_agent</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-14rem)]">

                {/* Query List */}
                <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Inbox</h2>
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
                                <p className="font-medium text-slate-500">No queries found matching the selected filter</p>
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
                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                        <span className="truncate">{query.faculty_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100/50">
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{query.category}</span>
                                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Query Detail & Chat */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
                    {selectedQuery ? (
                        <div className="flex flex-col h-full">
                            {/* Detail Header */}
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 mb-2">{selectedQuery.query.subject}</h2>
                                    <div className="flex flex-wrap gap-4 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">account_circle</span>
                                            <span className="font-medium">{selectedQuery.query.faculty_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">category</span>
                                            <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-md">{selectedQuery.query.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 relative">
                                    <select
                                        value={selectedQuery.query.status}
                                        onChange={(e) => handleUpdateStatus(e.target.value)}
                                        className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="OPEN">Mark as Unresolved</option>
                                        <option value="IN_PROGRESS">Mark In Progress</option>
                                        <option value="RESOLVED">Mark Resolved</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
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
                                {selectedQuery.responses.map((resp, idx) => {
                                    const isAdmin = resp.responder_role !== 'FACULTY';
                                    return (
                                        <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl p-4 ${resp.is_internal_note
                                                    ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tr-sm'
                                                    : isAdmin
                                                        ? 'bg-primary text-white rounded-br-sm shadow-md'
                                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                                                }`}>
                                                <div className="flex justify-between items-center mb-2 gap-4">
                                                    <span className={`text-xs font-bold ${isAdmin ? 'text-white/80' : 'text-slate-900'}`}>
                                                        {resp.responder_name}
                                                    </span>
                                                    {resp.is_internal_note && (
                                                        <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded uppercase">Internal</span>
                                                    )}
                                                </div>
                                                <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isAdmin && !resp.is_internal_note ? 'text-white/90' : 'text-slate-600'}`}>
                                                    {resp.message}
                                                </p>
                                                <div className={`text-[10px] mt-2 text-right font-medium ${isAdmin && !resp.is_internal_note ? 'text-primary-light' : 'text-slate-400'}`}>
                                                    {new Date(resp.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Response Input */}
                            <div className="p-4 border-t border-slate-100 bg-white">
                                <form onSubmit={handleSendResponse} className="flex gap-3">
                                    <textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-14 min-h-[56px] text-sm custom-scrollbar"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={!responseText.trim()}
                                        className="self-end inline-flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary-hover disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors shrink-0 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[24px]">send</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-slate-300">chat</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-1">Select a Query</h3>
                            <p className="text-sm">Choose a query from the inbox on the left to view details and respond.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
