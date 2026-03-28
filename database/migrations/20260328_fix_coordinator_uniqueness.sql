-- Migration to fix duplicate key errors in coordinator assignments
-- This migration converts standard unique constraints to partial unique indexes 
-- that only apply to active assignments. This allows for historic (inactive) 
-- assignments to remain in the table without blocking new assignments.

-- 1. Handle Faculty Uniqueness (One active assignment per faculty/term)
ALTER TABLE public.course_assignments DROP CONSTRAINT IF EXISTS unique_faculty_coordination_term;
DROP INDEX IF EXISTS idx_unique_active_faculty_term;
CREATE UNIQUE INDEX idx_unique_active_faculty_term 
    ON public.course_assignments (faculty_id, academic_year, semester) 
    WHERE (is_active = true);

-- 2. Handle Course Uniqueness (One active coordinator per course/term)
ALTER TABLE public.course_assignments DROP CONSTRAINT IF EXISTS unique_course_coordinator_term;
DROP INDEX IF EXISTS idx_unique_active_course_term;
CREATE UNIQUE INDEX idx_unique_active_course_term 
    ON public.course_assignments (course_id, academic_year, semester) 
    WHERE (is_active = true);
