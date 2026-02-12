-- Migration to add Course Coordinator tables and updates

-- 1. Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    code character varying(50) NOT NULL UNIQUE,
    name character varying(200) NOT NULL,
    department character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_department ON public.courses(department);

-- Trigger for updating timestamp
CREATE OR REPLACE FUNCTION public.update_courses_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_courses_timestamp ON public.courses;
CREATE TRIGGER trigger_update_courses_timestamp BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_courses_timestamp();

-- 2. Create course_assignments table
CREATE TABLE IF NOT EXISTS public.course_assignments (
    id SERIAL PRIMARY KEY,
    course_id integer REFERENCES public.courses(id) ON DELETE CASCADE,
    faculty_id integer REFERENCES public.users(id) ON DELETE CASCADE,
    academic_year character varying(20) NOT NULL,
    semester character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_coordinator_term UNIQUE (course_id, academic_year, semester),
    CONSTRAINT unique_faculty_coordination_term UNIQUE (faculty_id, academic_year, semester)
);

CREATE INDEX IF NOT EXISTS idx_course_assignments_course ON public.course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_faculty ON public.course_assignments(faculty_id);

-- 3. Update exams table
-- Resize status column to support 'UNDER_COORDINATOR_REVIEW'
ALTER TABLE public.exams 
    ALTER COLUMN status TYPE character varying(50);

-- Add course_id FK
ALTER TABLE public.exams 
    ADD COLUMN IF NOT EXISTS course_id integer REFERENCES public.courses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_exams_course ON public.exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_course_term ON public.exams(course_id, academic_year, semester);
