-- Migration: Create payments table for accountant workflow
-- This table tracks payment processing for submitted claims

CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL UNIQUE REFERENCES public.exams(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('NEFT', 'RTGS', 'CHEQUE', 'CASH')),
    reference_number VARCHAR(100) NOT NULL,
    payment_date DATE NOT NULL,
    accountant_id INTEGER NOT NULL REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_exam_id ON public.payments(exam_id);
CREATE INDEX IF NOT EXISTS idx_payments_accountant_id ON public.payments(accountant_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);

-- Add comments
COMMENT ON TABLE public.payments IS 'Records payment transactions processed by accountants';
COMMENT ON COLUMN public.payments.exam_id IS 'Foreign key to exams table (one-to-one relationship)';
COMMENT ON COLUMN public.payments.amount IS 'Final paid amount (should match net_amount from remuneration_calculations)';
COMMENT ON COLUMN public.payments.payment_method IS 'Payment method: NEFT, RTGS, CHEQUE, or CASH';
COMMENT ON COLUMN public.payments.reference_number IS 'Transaction ID, Cheque number, or reference';
COMMENT ON COLUMN public.payments.accountant_id IS 'User ID of accountant who processed the payment';

-- Update exams status enum to include 'paid' if not already present
-- Note: This assumes status is a VARCHAR. If it's an ENUM type, you may need to ALTER TYPE
-- For now, we'll rely on application-level validation
