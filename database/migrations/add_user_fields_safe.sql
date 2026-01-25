-- Quick fix: Run these commands to add the columns if they don't exist
-- This is safe to run multiple times

DO $$ 
BEGIN
    -- Add mobile column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'mobile'
    ) THEN
        ALTER TABLE users ADD COLUMN mobile VARCHAR(15);
        COMMENT ON COLUMN users.mobile IS 'Mobile number of the user';
    END IF;

    -- Add pan_card column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'pan_card'
    ) THEN
        ALTER TABLE users ADD COLUMN pan_card VARCHAR(20);
        COMMENT ON COLUMN users.pan_card IS 'PAN card number of the user';
    END IF;

    -- Add second_examiner column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' AND column_name = 'second_examiner'
    ) THEN
        ALTER TABLE exams ADD COLUMN second_examiner VARCHAR(200);
        COMMENT ON COLUMN exams.second_examiner IS 'Name of the second examiner (if any)';
    END IF;
END $$;
