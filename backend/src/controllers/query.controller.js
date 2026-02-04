const pool = require('../config/db');

/**
 * Create a new query (Faculty only)
 */
const createQuery = async (req, res) => {
    const client = await pool.connect();
    try {
        const { subject, description, category, priority, claim_id } = req.body;
        const faculty_id = req.user.id;

        // Validation
        if (!subject || !description || !category) {
            return res.status(400).json({ message: 'Subject, description, and category are required' });
        }

        const validCategories = ['PAYMENT_ISSUE', 'CLAIM_REJECTION', 'TECHNICAL', 'RATE_INQUIRY', 'OTHER'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const result = await client.query(
            `INSERT INTO queries (faculty_id, subject, description, category, priority, claim_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [faculty_id, subject, description, category, priority || 'MEDIUM', claim_id || null]
        );

        res.status(201).json({
            message: 'Query created successfully',
            query: result.rows[0]
        });
    } catch (error) {
        console.error('Create query error:', error);
        res.status(500).json({ message: 'Failed to create query' });
    } finally {
        client.release();
    }
};

/**
 * Get queries (role-based filtering)
 */
const getQueries = async (req, res) => {
    const client = await pool.connect();
    try {
        const { status, category } = req.query;
        const userRole = req.user.role;
        const userId = req.user.id;

        let query = `
            SELECT q.*, 
                   u.name as faculty_name, 
                   u.email as faculty_email,
                   (SELECT COUNT(*) FROM query_responses WHERE query_id = q.id) as response_count,
                   (SELECT created_at FROM query_responses WHERE query_id = q.id ORDER BY created_at DESC LIMIT 1) as last_response_at
            FROM queries q
            JOIN users u ON q.faculty_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        // Faculty can only see their own queries
        if (userRole === 'FACULTY') {
            query += ` AND q.faculty_id = $${paramCount}`;
            params.push(userId);
            paramCount++;
        }

        // Filter by status
        if (status) {
            query += ` AND q.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        // Filter by category
        if (category) {
            query += ` AND q.category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        query += ` ORDER BY q.created_at DESC`;

        const result = await client.query(query, params);

        res.json({
            queries: result.rows
        });
    } catch (error) {
        console.error('Get queries error:', error);
        res.status(500).json({ message: 'Failed to fetch queries' });
    } finally {
        client.release();
    }
};

/**
 * Get query details with responses
 */
const getQueryDetails = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        // Get query
        const queryResult = await client.query(
            `SELECT q.*, 
                    u.name as faculty_name, 
                    u.email as faculty_email
             FROM queries q
             JOIN users u ON q.faculty_id = u.id
             WHERE q.id = $1`,
            [id]
        );

        if (queryResult.rows.length === 0) {
            return res.status(404).json({ message: 'Query not found' });
        }

        const query = queryResult.rows[0];

        // Check access: Faculty can only view their own queries
        if (userRole === 'FACULTY' && query.faculty_id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get responses (exclude internal notes for faculty)
        let responsesQuery = `
            SELECT qr.*, 
                   u.name as responder_name, 
                   u.role as responder_role
            FROM query_responses qr
            JOIN users u ON qr.responder_id = u.id
            WHERE qr.query_id = $1
        `;

        if (userRole === 'FACULTY') {
            responsesQuery += ` AND qr.is_internal_note = FALSE`;
        }

        responsesQuery += ` ORDER BY qr.created_at ASC`;

        const responsesResult = await client.query(responsesQuery, [id]);

        res.json({
            query,
            responses: responsesResult.rows
        });
    } catch (error) {
        console.error('Get query details error:', error);
        res.status(500).json({ message: 'Failed to fetch query details' });
    } finally {
        client.release();
    }
};

/**
 * Add response to query (Accountant/Admin)
 */
const respondToQuery = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { message, is_internal_note, update_status } = req.body;
        const responder_id = req.user.id;
        const userRole = req.user.role;

        // Faculty can only respond to their own queries
        if (userRole === 'FACULTY') {
            const queryCheck = await client.query(
                'SELECT faculty_id FROM queries WHERE id = $1',
                [id]
            );
            if (queryCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Query not found' });
            }
            if (queryCheck.rows[0].faculty_id !== responder_id) {
                return res.status(403).json({ message: 'You can only respond to your own queries' });
            }
        }

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        await client.query('BEGIN');

        // Add response
        const responseResult = await client.query(
            `INSERT INTO query_responses (query_id, responder_id, message, is_internal_note)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [id, responder_id, message, is_internal_note || false]
        );

        // Update query status if provided
        if (update_status) {
            const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
            if (!validStatuses.includes(update_status)) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Invalid status' });
            }

            await client.query(
                `UPDATE queries SET status = $1 WHERE id = $2`,
                [update_status, id]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Response added successfully',
            response: responseResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Respond to query error:', error);
        res.status(500).json({ message: 'Failed to add response' });
    } finally {
        client.release();
    }
};

/**
 * Update query status (Accountant/Admin)
 */
const updateQueryStatus = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userRole = req.user.role;

        // Only Accountant and Admin can update status
        if (userRole !== 'BILLING_INCHARGE' && userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Only billing incharge and admin can update query status' });
        }

        const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await client.query(
            `UPDATE queries SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Query not found' });
        }

        res.json({
            message: 'Query status updated successfully',
            query: result.rows[0]
        });
    } catch (error) {
        console.error('Update query status error:', error);
        res.status(500).json({ message: 'Failed to update query status' });
    } finally {
        client.release();
    }
};

/**
 * Get query statistics (Accountant/Admin)
 */
const getQueryStats = async (req, res) => {
    const client = await pool.connect();
    try {
        const userRole = req.user.role;

        if (userRole !== 'BILLING_INCHARGE' && userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const stats = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'OPEN') as open,
                COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
                COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved,
                COUNT(*) FILTER (WHERE status = 'CLOSED') as closed,
                COUNT(*) FILTER (WHERE priority = 'HIGH') as high_priority
            FROM queries
        `);

        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Get query stats error:', error);
        res.status(500).json({ message: 'Failed to fetch statistics' });
    } finally {
        client.release();
    }
};

/**
 * Update query (Faculty only - their own queries)
 */
const updateQuery = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { subject, description, category, claim_id } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Only faculty can update, and only their own queries
        if (userRole !== 'FACULTY') {
            return res.status(403).json({ message: 'Only faculty can update queries' });
        }

        // Check ownership
        const queryCheck = await client.query(
            'SELECT faculty_id FROM queries WHERE id = $1',
            [id]
        );

        if (queryCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Query not found' });
        }

        if (queryCheck.rows[0].faculty_id !== userId) {
            return res.status(403).json({ message: 'You can only update your own queries' });
        }

        // Validation
        if (!subject || !description || !category) {
            return res.status(400).json({ message: 'Subject, description, and category are required' });
        }

        const validCategories = ['PAYMENT_ISSUE', 'CLAIM_REJECTION', 'TECHNICAL', 'RATE_INQUIRY', 'OTHER'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const result = await client.query(
            `UPDATE queries 
             SET subject = $1, description = $2, category = $3, claim_id = $4, updated_at = NOW()
             WHERE id = $5
             RETURNING *`,
            [subject, description, category, claim_id || null, id]
        );

        res.json({
            message: 'Query updated successfully',
            query: result.rows[0]
        });
    } catch (error) {
        console.error('Update query error:', error);
        res.status(500).json({ message: 'Failed to update query' });
    } finally {
        client.release();
    }
};

/**
 * Delete query (Faculty only - their own queries)
 */
const deleteQuery = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Only faculty can delete, and only their own queries
        if (userRole !== 'FACULTY') {
            return res.status(403).json({ message: 'Only faculty can delete queries' });
        }

        // Check ownership
        const queryCheck = await client.query(
            'SELECT faculty_id FROM queries WHERE id = $1',
            [id]
        );

        if (queryCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Query not found' });
        }

        if (queryCheck.rows[0].faculty_id !== userId) {
            return res.status(403).json({ message: 'You can only delete your own queries' });
        }

        await client.query('BEGIN');

        // Delete responses first (foreign key constraint)
        await client.query('DELETE FROM query_responses WHERE query_id = $1', [id]);

        // Delete query
        await client.query('DELETE FROM queries WHERE id = $1', [id]);

        await client.query('COMMIT');

        res.json({ message: 'Query deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Delete query error:', error);
        res.status(500).json({ message: 'Failed to delete query' });
    } finally {
        client.release();
    }
};

module.exports = {
    createQuery,
    getQueries,
    getQueryDetails,
    respondToQuery,
    updateQueryStatus,
    getQueryStats,
    updateQuery,
    deleteQuery
};
