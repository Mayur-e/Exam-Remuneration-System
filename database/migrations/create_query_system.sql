-- Create Query System Tables
-- This migration creates tables for the faculty support query system

-- Create queries table
CREATE TABLE IF NOT EXISTS queries (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    claim_id INTEGER REFERENCES exams(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('PAYMENT_ISSUE', 'CLAIM_REJECTION', 'TECHNICAL', 'RATE_INQUIRY', 'OTHER')),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create query_responses table
CREATE TABLE IF NOT EXISTS query_responses (
    id SERIAL PRIMARY KEY,
    query_id INTEGER NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    responder_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_queries_faculty_id ON queries(faculty_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_category ON queries(category);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_responses_query_id ON query_responses(query_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_query_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER trigger_update_query_timestamp
    BEFORE UPDATE ON queries
    FOR EACH ROW
    EXECUTE FUNCTION update_query_timestamp();

-- Add comments for documentation
COMMENT ON TABLE queries IS 'Faculty support queries for claims and payments';
COMMENT ON TABLE query_responses IS 'Responses to faculty queries from accountants/admins';
COMMENT ON COLUMN queries.claim_id IS 'Optional reference to specific claim';
COMMENT ON COLUMN query_responses.is_internal_note IS 'True if note is only visible to staff, not faculty';
