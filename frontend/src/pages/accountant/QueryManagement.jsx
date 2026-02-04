import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-4">
            {/* Query List */}
            <div className="w-1/3 flex flex-col bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/20">
                    <h2 className="font-semibold text-card-foreground mb-3">Query List</h2>
                    <select
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Unresolved</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading ? (
                        <p className="text-center py-4 text-muted-foreground">Loading...</p>
                    ) : queries.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">No queries found</p>
                    ) : (
                        queries.map(query => (
                            <div
                                key={query.id}
                                onClick={() => viewQueryDetails(query.id)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedQuery?.query?.id === query.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-border hover:bg-accent/50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(query.status)}`}>
                                        {getStatusLabel(query.status)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(query.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-medium text-card-foreground truncate">{query.subject}</h3>
                                <p className="text-xs text-muted-foreground truncate">{query.faculty_name}</p>
                                <div className="flex justify-between items-center mt-2 text-xs">
                                    <span className="text-muted-foreground">{query.category}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Query Detail & Chat */}
            <div className="flex-1 flex flex-col bg-card rounded-lg border border-border overflow-hidden">
                {selectedQuery ? (
                    <>
                        {/* Detail Header */}
                        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-card-foreground">{selectedQuery.query.subject}</h2>
                                <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                                    <span>From: <span className="text-foreground">{selectedQuery.query.faculty_name}</span></span>
                                    <span>Category: <span className="text-foreground">{selectedQuery.query.category}</span></span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={selectedQuery.query.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    className="px-3 py-1 bg-background border border-border rounded-md text-sm"
                                >
                                    <option value="OPEN">Unresolved</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Original Query */}
                            <div className="bg-accent/30 p-4 rounded-lg border border-border">
                                <p className="text-sm font-semibold text-card-foreground mb-1">Description:</p>
                                <p className="text-card-foreground whitespace-pre-wrap">{selectedQuery.query.description}</p>
                            </div>

                            {/* Responses */}
                            {selectedQuery.responses.map((resp, idx) => (
                                <div
                                    key={idx}
                                    className={`flex flex-col ${resp.responder_role === 'FACULTY' ? 'items-start' : 'items-end'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg ${resp.is_internal_note
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                            : resp.responder_role === 'FACULTY'
                                                ? 'bg-accent/50'
                                                : 'bg-blue-50 dark:bg-blue-900/20'
                                            }`}
                                    >
                                        {resp.is_internal_note && (
                                            <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mb-1">INTERNAL NOTE</p>
                                        )}
                                        <p className="text-sm text-card-foreground whitespace-pre-wrap">{resp.message}</p>
                                        <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                                            <span>{resp.responder_name}</span>
                                            <span>{new Date(resp.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Response Input */}
                        <div className="p-4 border-t border-border bg-muted/20">
                            <form onSubmit={handleSendResponse}>
                                <div className="flex gap-3">
                                    <textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        placeholder="Type your response..."
                                        className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-20"
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        className="self-end bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Send
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Select a query to view details
                    </div>
                )}
            </div>
        </div>
    );
}
