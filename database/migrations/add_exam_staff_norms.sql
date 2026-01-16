-- Migration: Add exam_staff_norms table for dynamic validation rules
-- This table defines max allowed staff based on exam type, category, and student count

CREATE TABLE IF NOT EXISTS public.exam_staff_norms (
  id SERIAL PRIMARY KEY,

  exam_type VARCHAR(50) NOT NULL,
  exam_category VARCHAR(20) NOT NULL
    CHECK (exam_category IN ('REGULAR', 'BACKLOG')),

  min_students INT DEFAULT 0,
  max_students INT, -- NULL means "above"

  max_expert_assistants INT NOT NULL DEFAULT 0,
  max_lab_assistants INT NOT NULL DEFAULT 0,
  max_foreman INT NOT NULL DEFAULT 0,
  max_peon INT NOT NULL DEFAULT 0,

  max_preparation_days INT NOT NULL DEFAULT 0,
  max_cleaning_days INT NOT NULL DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert norms for REGULAR exams
INSERT INTO exam_staff_norms
(exam_type, exam_category, min_students, max_students,
 max_expert_assistants, max_lab_assistants, max_foreman, max_peon,
 max_preparation_days, max_cleaning_days)
VALUES
-- PR REGULAR
('PR','REGULAR',0,100,2,1,1,1,2,1),
('PR','REGULAR',101,200,3,2,2,2,2,1),
('PR','REGULAR',201,NULL,4,2,2,2,2,1),

-- PROJECT REGULAR
('PROJECT','REGULAR',0,100,0,1,1,1,1,1),
('PROJECT','REGULAR',101,200,0,2,2,2,1,1),
('PROJECT','REGULAR',201,NULL,0,2,2,2,1,3),

-- OR / TW REGULAR
('OR','REGULAR',0,NULL,0,1,1,1,1,0),
('TW','REGULAR',0,NULL,0,1,1,1,1,0);

-- Insert norms for BACKLOG exams
INSERT INTO exam_staff_norms
(exam_type, exam_category, min_students, max_students,
 max_expert_assistants, max_lab_assistants, max_foreman, max_peon,
 max_preparation_days, max_cleaning_days)
VALUES
-- PR BACKLOG
('PR','BACKLOG',0,100,2,1,1,1,1,0),
('PR','BACKLOG',101,NULL,3,2,2,2,1,0),

-- PROJECT BACKLOG
('PROJECT','BACKLOG',0,100,0,1,1,1,1,0),
('PROJECT','BACKLOG',101,NULL,0,2,2,2,1,0),

-- OR / TW BACKLOG
('OR','BACKLOG',0,NULL,0,1,1,1,1,0),
('TW','BACKLOG',0,NULL,0,1,1,1,1,0);

-- Create index for performance
CREATE INDEX idx_exam_staff_norms_lookup ON public.exam_staff_norms(exam_type, exam_category);

COMMENT ON TABLE public.exam_staff_norms IS 'Defines maximum allowed staff and days based on exam type, category (Regular/Backlog), and student count ranges';
COMMENT ON COLUMN public.exam_staff_norms.max_students IS 'NULL means this rule applies for all students above min_students';
