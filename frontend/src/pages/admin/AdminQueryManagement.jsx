import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    const listItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    const messageVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20
            }
        }
    };

    return (
        <motion.div
            className="flex h-[calc(100vh-6rem)] gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Query List */}
            <motion.div
                className="w-1/3 flex flex-col bg-card rounded-lg border border-border overflow-hidden"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="p-4 border-b border-border bg-muted/20">
                    <h2 className="font-semibold text-card-foreground mb-3">Query List</h2>
                    <motion.select
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        whileHover={{ scale: 1.01 }}
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Unresolved</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </motion.select>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.p
                                className="text-center py-4 text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Loading...
                            </motion.p>
                        ) : queries.length === 0 ? (
                            <motion.p
                                className="text-center py-4 text-muted-foreground"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                No queries found
                            </motion.p>
                        ) : (
                            queries.map((query, index) => (
                                <motion.div
                                    key={query.id}
                                    onClick={() => viewQueryDetails(query.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedQuery?.query?.id === query.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-border hover:bg-accent/50'
                                        }`}
                                    variants={listItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ x: 5, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <motion.span
                                            className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(query.status)}`}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {getStatusLabel(query.status)}
                                        </motion.span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(query.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-card-foreground truncate">{query.subject}</h3>
                                    <p className="text-xs text-muted-foreground truncate">{query.faculty_name}</p>
                                    <div className="flex justify-between items-center mt-2 text-xs">
                                        <span className="text-muted-foreground">{query.category}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Query Detail & Chat */}
            <motion.div
                className="flex-1 flex flex-col bg-card rounded-lg border border-border overflow-hidden"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <AnimatePresence mode="wait">
                    {selectedQuery ? (
                        <motion.div
                            key={selectedQuery.query.id}
                            className="flex flex-col h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Detail Header */}
                            <motion.div
                                className="p-4 border-b border-border bg-muted/20 flex justify-between items-start"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-card-foreground">{selectedQuery.query.subject}</h2>
                                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                                        <span>From: <span className="text-foreground">{selectedQuery.query.faculty_name}</span></span>
                                        <span>Category: <span className="text-foreground">{selectedQuery.query.category}</span></span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <motion.select
                                        value={selectedQuery.query.status}
                                        onChange={(e) => handleUpdateStatus(e.target.value)}
                                        className="px-3 py-1 bg-background border border-border rounded-md text-sm"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <option value="OPEN">Unresolved</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                    </motion.select>
                                </div>
                            </motion.div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Original Query */}
                                <motion.div
                                    className="bg-accent/30 p-4 rounded-lg border border-border"
                                    variants={messageVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <p className="text-sm font-semibold text-card-foreground mb-1">Description:</p>
                                    <p className="text-card-foreground whitespace-pre-wrap">{selectedQuery.query.description}</p>
                                </motion.div>

                                {/* Responses */}
                                {selectedQuery.responses.map((resp, idx) => (
                                    <motion.div
                                        key={idx}
                                        className={`flex flex-col ${resp.responder_role === 'FACULTY' ? 'items-start' : 'items-end'}`}
                                        variants={messageVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: (idx + 1) * 0.1 }}
                                    >
                                        <motion.div
                                            className={`max-w-[80%] p-3 rounded-lg ${resp.is_internal_note
                                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                                : resp.responder_role === 'FACULTY'
                                                    ? 'bg-accent/50'
                                                    : 'bg-blue-50 dark:bg-blue-900/20'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            {resp.is_internal_note && (
                                                <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mb-1">INTERNAL NOTE</p>
                                            )}
                                            <p className="text-sm text-card-foreground whitespace-pre-wrap">{resp.message}</p>
                                            <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                                                <span>{resp.responder_name}</span>
                                                <span>{new Date(resp.created_at).toLocaleString()}</span>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Response Input */}
                            <motion.div
                                className="p-4 border-t border-border bg-muted/20"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <form onSubmit={handleSendResponse}>
                                    <div className="flex gap-3">
                                        <motion.textarea
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            placeholder="Type your response..."
                                            className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-20"
                                            required
                                            whileFocus={{ scale: 1.01 }}
                                        />
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                type="submit"
                                                className="self-end bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Send
                                            </Button>
                                        </motion.div>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="h-full flex items-center justify-center text-muted-foreground"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            Select a query to view details
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
