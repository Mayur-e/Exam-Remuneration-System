--
-- PostgreSQL database dump
--

\restrict zTFbQpqvpnsGuAfW9ERpYcFoo3vsOyn6F0XglVAzLThEYIuwuIHEEQtLP3QMvNz

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: calculate_exam(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_exam(p_exam_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_exam RECORD;
  v_rates RECORD;
  v_batch RECORD;
  v_students INT;
  v_batch_size INT := 1;
  v_batches INT := 1;
  v_examiner NUMERIC := 0;
  v_staff NUMERIC := 0;
  v_min BOOLEAN := FALSE;
  v_staff_member RECORD;
  v_role RECORD;
  v_gross NUMERIC := 0;
  v_tds NUMERIC := 0;
  v_net NUMERIC := 0;
  v_chairman_allowance NUMERIC := 0;
  v_conveyance_amount NUMERIC := 0;
  v_prep_days INT;
  v_clean_days INT;
BEGIN
  SELECT * INTO v_exam FROM exams WHERE id = p_exam_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Exam not found'; END IF;

  -- UPDATED: Fetch rates based on exam's academic year
  SELECT * INTO v_rates 
  FROM remuneration_rates 
  WHERE exam_type = v_exam.exam_type 
    AND academic_year = COALESCE(v_exam.academic_year, '2024-25');
  IF NOT FOUND THEN RAISE EXCEPTION 'Rates not found for exam type % and year %', v_exam.exam_type, v_exam.academic_year; END IF;

  -- UPDATED: Fetch batch sizes based on exam's academic year
  SELECT * INTO v_batch 
  FROM batch_sizes 
  WHERE program = v_exam.program 
    AND academic_year = COALESCE(v_exam.academic_year, '2024-25');

  -- 1. Calculate Examiner Amount (for TEACHING claims ONLY)
  IF v_exam.claim_form_type IN ('TEACHING_INTERNAL', 'TEACHING_EXTERNAL') THEN
    IF v_exam.exam_type = 'PR' THEN
      v_batch_size := COALESCE(v_batch.practical_size,1);
    ELSIF v_exam.exam_type = 'OR' THEN
      v_batch_size := COALESCE(v_batch.oral_size,1);
    ELSIF v_exam.exam_type = 'TW' THEN
      v_batch_size := COALESCE(v_batch.termwork_size,1);
    ELSE
      v_batch_size := COALESCE(v_batch.project_oral_size,1);
    END IF;

    v_students := v_exam.students_count;
    IF v_students > 0 THEN
      v_batches := CEIL(v_students::numeric / v_batch_size::numeric);
    END IF;

    IF v_exam.program IN ('BTECH','BVOC') THEN
      IF v_exam.level IN ('FY','SY') THEN
        v_examiner := v_students * COALESCE(v_rates.fy_sy_rate,0);
      ELSE
        v_examiner := v_students * COALESCE(v_rates.ty_final_rate,0);
      END IF;
    ELSE
      v_examiner := v_students * COALESCE(v_rates.mtech_mca_rate,0);
    END IF;

    IF v_examiner < v_rates.min_per_day THEN
      v_examiner := v_rates.min_per_day;
      v_min := TRUE;
    END IF;
  ELSE
    -- For NON_TEACHING claims, examiner_amount = 0, but still calculate batches for staff
    IF v_exam.exam_type = 'PR' THEN
      v_batch_size := COALESCE(v_batch.practical_size,1);
    ELSIF v_exam.exam_type = 'OR' THEN
      v_batch_size := COALESCE(v_batch.oral_size,1);
    ELSIF v_exam.exam_type = 'TW' THEN
      v_batch_size := COALESCE(v_batch.termwork_size,1);
    ELSE
      v_batch_size := COALESCE(v_batch.project_oral_size,1);
    END IF;

    v_students := v_exam.students_count;
    IF v_students > 0 THEN
      v_batches := CEIL(v_students::numeric / v_batch_size::numeric);
    END IF;
  END IF;

  -- 2. Fetch Allowances (managed by Billing Incharge)
  SELECT chairman_allowance, conveyance_amount INTO v_chairman_allowance, v_conveyance_amount
  FROM remuneration_calculations WHERE exam_id = p_exam_id;

  v_chairman_allowance := COALESCE(v_chairman_allowance, 0);
  v_conveyance_amount := COALESCE(v_conveyance_amount, 0);

  -- 3. Calculate Staff Amount from exam_staff_members
  -- UPDATED: Fetch staff role rates based on exam's academic year
  FOR v_staff_member IN SELECT * FROM exam_staff_members WHERE exam_id = p_exam_id LOOP
    SELECT * INTO v_role 
    FROM staff_role_rates 
    WHERE staff_role = v_staff_member.staff_role 
      AND academic_year = COALESCE(v_exam.academic_year, '2024-25');
    IF FOUND THEN
      -- RULE: Expert Assistants cannot claim preparation or cleaning days
      IF v_staff_member.staff_role = 'Expert Assistant' THEN
        v_prep_days := 0;
        v_clean_days := 0;
        -- Expert Assistant: Rate ?? Batches (no exam days multiplier)
        v_staff := v_staff + (v_role.per_batch_rate * v_batches);
      ELSE
        v_prep_days := v_staff_member.preparation_days;
        v_clean_days := v_staff_member.cleaning_days;
        -- Others: (Prep Rate ?? Prep Days) + (Batch Rate ?? Batches ?? Exam Days) + (Clean Rate ?? Clean Days)
        v_staff := v_staff + (
          v_role.preparation_rate * v_prep_days +
          v_role.per_batch_rate * v_batches * v_staff_member.examination_days +
          v_role.cleaning_rate * v_clean_days
        );
      END IF;
    END IF;
  END LOOP;

  -- 4. Final Totals
  v_gross := v_examiner + v_staff + v_chairman_allowance + v_conveyance_amount;
  v_tds := v_gross * 0.10; -- 10% TDS
  v_net := v_gross - v_tds;

  -- 5. Update/Insert
  INSERT INTO remuneration_calculations
  (exam_id, examiner_amount, staff_amount, chairman_allowance, conveyance_amount, total_amount, tds_amount, net_amount, min_applied)
  VALUES
  (p_exam_id, v_examiner, v_staff, v_chairman_allowance, v_conveyance_amount, v_gross, v_tds, v_net, v_min)
  ON CONFLICT (exam_id) DO UPDATE
  SET examiner_amount = EXCLUDED.examiner_amount,
      staff_amount = EXCLUDED.staff_amount,
      chairman_allowance = EXCLUDED.chairman_allowance,
      conveyance_amount = EXCLUDED.conveyance_amount,
      total_amount = EXCLUDED.total_amount,
      tds_amount = EXCLUDED.tds_amount,
      net_amount = EXCLUDED.net_amount,
      min_applied = EXCLUDED.min_applied,
      updated_at = CURRENT_TIMESTAMP;

  UPDATE exam_staff_members SET batches = v_batches WHERE exam_id = p_exam_id;
END;
$$;


ALTER FUNCTION public.calculate_exam(p_exam_id integer) OWNER TO postgres;

--
-- Name: update_query_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_query_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_query_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: batch_sizes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_sizes (
    id integer NOT NULL,
    program character varying(20) NOT NULL,
    practical_size integer,
    oral_size integer,
    termwork_size integer,
    project_oral_size integer,
    dissertation_size integer,
    academic_year character varying(20) DEFAULT '2024-25'::character varying NOT NULL
);


ALTER TABLE public.batch_sizes OWNER TO postgres;

--
-- Name: COLUMN batch_sizes.academic_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.batch_sizes.academic_year IS 'Academic year for these batch sizes (e.g., 2024-25)';


--
-- Name: batch_sizes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batch_sizes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.batch_sizes_id_seq OWNER TO postgres;

--
-- Name: batch_sizes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.batch_sizes_id_seq OWNED BY public.batch_sizes.id;


--
-- Name: claim_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claim_actions (
    id integer NOT NULL,
    exam_id integer,
    action_by integer,
    action_role character varying(20),
    action_type character varying(20),
    remarks text,
    action_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    comment text
);


ALTER TABLE public.claim_actions OWNER TO postgres;

--
-- Name: claim_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.claim_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.claim_actions_id_seq OWNER TO postgres;

--
-- Name: claim_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.claim_actions_id_seq OWNED BY public.claim_actions.id;


--
-- Name: exam_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_documents (
    id integer NOT NULL,
    exam_id integer,
    doc_type character varying(50),
    file_url text NOT NULL,
    uploaded_by character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.exam_documents OWNER TO postgres;

--
-- Name: exam_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_documents_id_seq OWNER TO postgres;

--
-- Name: exam_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_documents_id_seq OWNED BY public.exam_documents.id;


--
-- Name: exam_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_staff (
    id integer NOT NULL,
    exam_id integer,
    staff_role character varying(100),
    count integer NOT NULL,
    preparation_days integer DEFAULT 0,
    cleaning_days integer DEFAULT 0,
    batches integer DEFAULT 0,
    CONSTRAINT exam_staff_count_check CHECK ((count >= 0))
);


ALTER TABLE public.exam_staff OWNER TO postgres;

--
-- Name: exam_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_staff_id_seq OWNER TO postgres;

--
-- Name: exam_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_staff_id_seq OWNED BY public.exam_staff.id;


--
-- Name: exam_staff_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_staff_members (
    id integer NOT NULL,
    exam_id integer NOT NULL,
    staff_name character varying(100) NOT NULL,
    staff_role character varying(100) NOT NULL,
    preparation_days integer DEFAULT 0,
    examination_days integer DEFAULT 0,
    cleaning_days integer DEFAULT 0,
    batches integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rate numeric(10,2) DEFAULT 0,
    CONSTRAINT exam_staff_members_cleaning_days_check CHECK ((cleaning_days >= 0)),
    CONSTRAINT exam_staff_members_examination_days_check CHECK ((examination_days >= 0)),
    CONSTRAINT exam_staff_members_preparation_days_check CHECK ((preparation_days >= 0))
);


ALTER TABLE public.exam_staff_members OWNER TO postgres;

--
-- Name: TABLE exam_staff_members; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.exam_staff_members IS 'Individual staff members assigned to exams for non-teaching claims';


--
-- Name: COLUMN exam_staff_members.rate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_staff_members.rate IS 'Rate per day for the staff member';


--
-- Name: exam_staff_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_staff_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_staff_members_id_seq OWNER TO postgres;

--
-- Name: exam_staff_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_staff_members_id_seq OWNED BY public.exam_staff_members.id;


--
-- Name: exam_staff_norms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_staff_norms (
    id integer NOT NULL,
    exam_type character varying(50) NOT NULL,
    exam_category character varying(20) NOT NULL,
    min_students integer DEFAULT 0,
    max_students integer,
    max_expert_assistants integer DEFAULT 0 NOT NULL,
    max_lab_assistants integer DEFAULT 0 NOT NULL,
    max_foreman integer DEFAULT 0 NOT NULL,
    max_peon integer DEFAULT 0 NOT NULL,
    max_preparation_days integer DEFAULT 0 NOT NULL,
    max_cleaning_days integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT exam_staff_norms_exam_category_check CHECK (((exam_category)::text = ANY ((ARRAY['REGULAR'::character varying, 'BACKLOG'::character varying])::text[])))
);


ALTER TABLE public.exam_staff_norms OWNER TO postgres;

--
-- Name: TABLE exam_staff_norms; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.exam_staff_norms IS 'Defines maximum allowed staff and days based on exam type, category (Regular/Backlog), and student count ranges';


--
-- Name: COLUMN exam_staff_norms.max_students; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exam_staff_norms.max_students IS 'NULL means this rule applies for all students above min_students';


--
-- Name: exam_staff_norms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_staff_norms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_staff_norms_id_seq OWNER TO postgres;

--
-- Name: exam_staff_norms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_staff_norms_id_seq OWNED BY public.exam_staff_norms.id;


--
-- Name: exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exams (
    id integer NOT NULL,
    faculty_id integer NOT NULL,
    exam_type character varying(50) NOT NULL,
    program character varying(20) NOT NULL,
    level character varying(20),
    students_count integer NOT NULL,
    subject_name text,
    subject_code text,
    semester text,
    academic_year text,
    exam_date date,
    is_backlog boolean DEFAULT false,
    status character varying(20) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    claim_form_type character varying(30),
    external_examiner_id integer,
    conveyance_amount numeric(10,2) DEFAULT 0,
    second_examiner character varying(200),
    prep_dates text,
    exam_dates text,
    cleaning_dates text,
    students_per_batch integer,
    CONSTRAINT exams_claim_form_type_check CHECK (((claim_form_type)::text = ANY ((ARRAY['TEACHING_INTERNAL'::character varying, 'TEACHING_EXTERNAL'::character varying, 'NON_TEACHING'::character varying])::text[]))),
    CONSTRAINT exams_students_count_check CHECK ((students_count >= 0))
);


ALTER TABLE public.exams OWNER TO postgres;

--
-- Name: COLUMN exams.second_examiner; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exams.second_examiner IS 'Name of the second examiner (if any)';


--
-- Name: COLUMN exams.prep_dates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exams.prep_dates IS 'Comma-separated preparation dates for non-teaching claims';


--
-- Name: COLUMN exams.exam_dates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exams.exam_dates IS 'Comma-separated examination dates for non-teaching claims';


--
-- Name: COLUMN exams.cleaning_dates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.exams.cleaning_dates IS 'Comma-separated cleaning dates for non-teaching claims';


--
-- Name: exams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exams_id_seq OWNER TO postgres;

--
-- Name: exams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exams_id_seq OWNED BY public.exams.id;


--
-- Name: external_exam_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_exam_links (
    id integer NOT NULL,
    exam_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.external_exam_links OWNER TO postgres;

--
-- Name: external_exam_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_exam_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_exam_links_id_seq OWNER TO postgres;

--
-- Name: external_exam_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_exam_links_id_seq OWNED BY public.external_exam_links.id;


--
-- Name: external_examiners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_examiners (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100),
    mobile character varying(20),
    parent_institute character varying(150),
    pan_number character varying(20),
    bank_name character varying(100),
    branch_name character varying(100),
    account_number character varying(30),
    ifsc_code character varying(15),
    pan_document_url text,
    cancelled_cheque_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_local boolean DEFAULT true,
    journey_days integer DEFAULT 1,
    travel_allowance numeric(10,2) DEFAULT 0,
    travel_proof_url text
);


ALTER TABLE public.external_examiners OWNER TO postgres;

--
-- Name: COLUMN external_examiners.is_local; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.external_examiners.is_local IS 'True if examiner is within 25km of PCCOE, False if beyond 25km';


--
-- Name: COLUMN external_examiners.journey_days; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.external_examiners.journey_days IS 'Number of days/visits for LCA calculation (< 25km only)';


--
-- Name: COLUMN external_examiners.travel_allowance; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.external_examiners.travel_allowance IS 'Calculated LCA (500 Ã— days) or user-entered total travel expense (> 25km)';


--
-- Name: COLUMN external_examiners.travel_proof_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.external_examiners.travel_proof_url IS 'URL to uploaded travel proof document (tickets, bills) for outstation examiners';


--
-- Name: external_examiners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_examiners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_examiners_id_seq OWNER TO postgres;

--
-- Name: external_examiners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_examiners_id_seq OWNED BY public.external_examiners.id;


--
-- Name: faculty_bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculty_bank_accounts (
    id integer NOT NULL,
    faculty_id integer NOT NULL,
    account_holder_name character varying(100) NOT NULL,
    bank_name character varying(100) NOT NULL,
    branch_name character varying(100),
    account_number character varying(30) NOT NULL,
    ifsc_code character varying(15) NOT NULL,
    pan_number character varying(20),
    pan_document_url text,
    cancelled_cheque_url text,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    account_type character varying(20) DEFAULT 'Savings'::character varying
);


ALTER TABLE public.faculty_bank_accounts OWNER TO postgres;

--
-- Name: faculty_bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faculty_bank_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faculty_bank_accounts_id_seq OWNER TO postgres;

--
-- Name: faculty_bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faculty_bank_accounts_id_seq OWNED BY public.faculty_bank_accounts.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    exam_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(20) NOT NULL,
    reference_number character varying(100) NOT NULL,
    payment_date date NOT NULL,
    accountant_id integer NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['NEFT'::character varying, 'RTGS'::character varying, 'CHEQUE'::character varying, 'CASH'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: TABLE payments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.payments IS 'Records payment transactions processed by accountants';


--
-- Name: COLUMN payments.exam_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payments.exam_id IS 'Foreign key to exams table (one-to-one relationship)';


--
-- Name: COLUMN payments.amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payments.amount IS 'Final paid amount (should match net_amount from remuneration_calculations)';


--
-- Name: COLUMN payments.payment_method; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payments.payment_method IS 'Payment method: NEFT, RTGS, CHEQUE, or CASH';


--
-- Name: COLUMN payments.reference_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payments.reference_number IS 'Transaction ID, Cheque number, or reference';


--
-- Name: COLUMN payments.accountant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payments.accountant_id IS 'User ID of accountant who processed the payment';


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: queries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queries (
    id integer NOT NULL,
    faculty_id integer NOT NULL,
    claim_id integer,
    subject character varying(255) NOT NULL,
    description text NOT NULL,
    category character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'OPEN'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT queries_category_check CHECK (((category)::text = ANY ((ARRAY['PAYMENT_ISSUE'::character varying, 'CLAIM_REJECTION'::character varying, 'TECHNICAL'::character varying, 'RATE_INQUIRY'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT queries_priority_check CHECK (((priority)::text = ANY ((ARRAY['LOW'::character varying, 'MEDIUM'::character varying, 'HIGH'::character varying])::text[]))),
    CONSTRAINT queries_status_check CHECK (((status)::text = ANY ((ARRAY['OPEN'::character varying, 'IN_PROGRESS'::character varying, 'RESOLVED'::character varying, 'CLOSED'::character varying])::text[])))
);


ALTER TABLE public.queries OWNER TO postgres;

--
-- Name: TABLE queries; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.queries IS 'Faculty support queries for claims and payments';


--
-- Name: COLUMN queries.claim_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.queries.claim_id IS 'Optional reference to specific claim';


--
-- Name: queries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queries_id_seq OWNER TO postgres;

--
-- Name: queries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.queries_id_seq OWNED BY public.queries.id;


--
-- Name: query_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.query_responses (
    id integer NOT NULL,
    query_id integer NOT NULL,
    responder_id integer NOT NULL,
    message text NOT NULL,
    is_internal_note boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.query_responses OWNER TO postgres;

--
-- Name: TABLE query_responses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.query_responses IS 'Responses to faculty queries from accountants/admins';


--
-- Name: COLUMN query_responses.is_internal_note; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.query_responses.is_internal_note IS 'True if note is only visible to staff, not faculty';


--
-- Name: query_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.query_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.query_responses_id_seq OWNER TO postgres;

--
-- Name: query_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.query_responses_id_seq OWNED BY public.query_responses.id;


--
-- Name: remuneration_calculations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.remuneration_calculations (
    id integer NOT NULL,
    exam_id integer,
    examiner_amount numeric(10,2) DEFAULT 0,
    staff_amount numeric(10,2) DEFAULT 0,
    chairman_allowance numeric(10,2) DEFAULT 0,
    conveyance_amount numeric(10,2) DEFAULT 0,
    total_amount numeric(10,2) DEFAULT 0,
    min_applied boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tds_amount numeric(10,2) DEFAULT 0,
    net_amount numeric(10,2) DEFAULT 0
);


ALTER TABLE public.remuneration_calculations OWNER TO postgres;

--
-- Name: remuneration_calculations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.remuneration_calculations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.remuneration_calculations_id_seq OWNER TO postgres;

--
-- Name: remuneration_calculations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.remuneration_calculations_id_seq OWNED BY public.remuneration_calculations.id;


--
-- Name: remuneration_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.remuneration_rates (
    id integer NOT NULL,
    exam_type character varying(50) NOT NULL,
    fy_sy_rate numeric(10,2),
    ty_final_rate numeric(10,2),
    mtech_mca_rate numeric(10,2),
    min_per_day numeric(10,2) NOT NULL,
    academic_year character varying(20) DEFAULT '2024-25'::character varying NOT NULL,
    CONSTRAINT remuneration_rates_min_per_day_check CHECK ((min_per_day >= (0)::numeric))
);


ALTER TABLE public.remuneration_rates OWNER TO postgres;

--
-- Name: COLUMN remuneration_rates.academic_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.remuneration_rates.academic_year IS 'Academic year for these rates (e.g., 2024-25)';


--
-- Name: remuneration_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.remuneration_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.remuneration_rates_id_seq OWNER TO postgres;

--
-- Name: remuneration_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.remuneration_rates_id_seq OWNED BY public.remuneration_rates.id;


--
-- Name: staff_role_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_role_rates (
    staff_role character varying(100) NOT NULL,
    preparation_rate numeric(10,2) DEFAULT 0 NOT NULL,
    per_batch_rate numeric(10,2) DEFAULT 0 NOT NULL,
    cleaning_rate numeric(10,2) DEFAULT 0 NOT NULL,
    academic_year character varying(20) DEFAULT '2024-25'::character varying NOT NULL
);


ALTER TABLE public.staff_role_rates OWNER TO postgres;

--
-- Name: COLUMN staff_role_rates.academic_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.staff_role_rates.academic_year IS 'Academic year for these rates (e.g., 2024-25)';


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    department character varying(100),
    type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_id_seq OWNER TO postgres;

--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    role character varying(20),
    department character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    prn character varying(50),
    google_id character varying(255) DEFAULT NULL::character varying,
    has_set_password boolean DEFAULT false,
    mobile character varying(15),
    pan_card character varying(20),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['FACULTY'::character varying, 'ADMIN'::character varying, 'BILLING_INCHARGE'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.prn; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.prn IS 'Permanent Registration Number - required for faculty members';


--
-- Name: COLUMN users.google_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.google_id IS 'Google user ID for users who signed up with Google OAuth';


--
-- Name: COLUMN users.has_set_password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.has_set_password IS 'Indicates if user has set their own password (true for regular users, becomes true for Google users after they set password)';


--
-- Name: COLUMN users.mobile; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.mobile IS 'Mobile number of the user';


--
-- Name: COLUMN users.pan_card; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.pan_card IS 'PAN card number of the user';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: batch_sizes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_sizes ALTER COLUMN id SET DEFAULT nextval('public.batch_sizes_id_seq'::regclass);


--
-- Name: claim_actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_actions ALTER COLUMN id SET DEFAULT nextval('public.claim_actions_id_seq'::regclass);


--
-- Name: exam_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_documents ALTER COLUMN id SET DEFAULT nextval('public.exam_documents_id_seq'::regclass);


--
-- Name: exam_staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff ALTER COLUMN id SET DEFAULT nextval('public.exam_staff_id_seq'::regclass);


--
-- Name: exam_staff_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff_members ALTER COLUMN id SET DEFAULT nextval('public.exam_staff_members_id_seq'::regclass);


--
-- Name: exam_staff_norms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff_norms ALTER COLUMN id SET DEFAULT nextval('public.exam_staff_norms_id_seq'::regclass);


--
-- Name: exams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams ALTER COLUMN id SET DEFAULT nextval('public.exams_id_seq'::regclass);


--
-- Name: external_exam_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_exam_links ALTER COLUMN id SET DEFAULT nextval('public.external_exam_links_id_seq'::regclass);


--
-- Name: external_examiners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_examiners ALTER COLUMN id SET DEFAULT nextval('public.external_examiners_id_seq'::regclass);


--
-- Name: faculty_bank_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty_bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.faculty_bank_accounts_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: queries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queries ALTER COLUMN id SET DEFAULT nextval('public.queries_id_seq'::regclass);


--
-- Name: query_responses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_responses ALTER COLUMN id SET DEFAULT nextval('public.query_responses_id_seq'::regclass);


--
-- Name: remuneration_calculations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_calculations ALTER COLUMN id SET DEFAULT nextval('public.remuneration_calculations_id_seq'::regclass);


--
-- Name: remuneration_rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_rates ALTER COLUMN id SET DEFAULT nextval('public.remuneration_rates_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: batch_sizes batch_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_sizes
    ADD CONSTRAINT batch_sizes_pkey PRIMARY KEY (program, academic_year);


--
-- Name: batch_sizes batch_sizes_program_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_sizes
    ADD CONSTRAINT batch_sizes_program_year_key UNIQUE (program, academic_year);


--
-- Name: claim_actions claim_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_actions
    ADD CONSTRAINT claim_actions_pkey PRIMARY KEY (id);


--
-- Name: exam_documents exam_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_documents
    ADD CONSTRAINT exam_documents_pkey PRIMARY KEY (id);


--
-- Name: exam_staff exam_staff_exam_id_staff_role_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff
    ADD CONSTRAINT exam_staff_exam_id_staff_role_key UNIQUE (exam_id, staff_role);


--
-- Name: exam_staff_members exam_staff_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff_members
    ADD CONSTRAINT exam_staff_members_pkey PRIMARY KEY (id);


--
-- Name: exam_staff_norms exam_staff_norms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff_norms
    ADD CONSTRAINT exam_staff_norms_pkey PRIMARY KEY (id);


--
-- Name: exam_staff exam_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff
    ADD CONSTRAINT exam_staff_pkey PRIMARY KEY (id);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: external_exam_links external_exam_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_exam_links
    ADD CONSTRAINT external_exam_links_pkey PRIMARY KEY (id);


--
-- Name: external_exam_links external_exam_links_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_exam_links
    ADD CONSTRAINT external_exam_links_token_key UNIQUE (token);


--
-- Name: external_examiners external_examiners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_examiners
    ADD CONSTRAINT external_examiners_pkey PRIMARY KEY (id);


--
-- Name: faculty_bank_accounts faculty_bank_accounts_faculty_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty_bank_accounts
    ADD CONSTRAINT faculty_bank_accounts_faculty_id_key UNIQUE (faculty_id);


--
-- Name: faculty_bank_accounts faculty_bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty_bank_accounts
    ADD CONSTRAINT faculty_bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: payments payments_exam_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_exam_id_key UNIQUE (exam_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: queries queries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_pkey PRIMARY KEY (id);


--
-- Name: query_responses query_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_responses
    ADD CONSTRAINT query_responses_pkey PRIMARY KEY (id);


--
-- Name: remuneration_calculations remuneration_calculations_exam_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_calculations
    ADD CONSTRAINT remuneration_calculations_exam_id_key UNIQUE (exam_id);


--
-- Name: remuneration_calculations remuneration_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_calculations
    ADD CONSTRAINT remuneration_calculations_pkey PRIMARY KEY (id);


--
-- Name: remuneration_rates remuneration_rates_exam_type_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_rates
    ADD CONSTRAINT remuneration_rates_exam_type_year_key UNIQUE (exam_type, academic_year);


--
-- Name: remuneration_rates remuneration_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_rates
    ADD CONSTRAINT remuneration_rates_pkey PRIMARY KEY (exam_type, academic_year);


--
-- Name: staff_role_rates staff_role_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_role_rates
    ADD CONSTRAINT staff_role_rates_pkey PRIMARY KEY (staff_role, academic_year);


--
-- Name: staff_role_rates staff_role_rates_role_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_role_rates
    ADD CONSTRAINT staff_role_rates_role_year_key UNIQUE (staff_role, academic_year);


--
-- Name: subjects subjects_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_code_key UNIQUE (code);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: exam_staff uq_exam_staff; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff
    ADD CONSTRAINT uq_exam_staff UNIQUE (exam_id, staff_role);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_batch_sizes_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_batch_sizes_year ON public.batch_sizes USING btree (academic_year);


--
-- Name: idx_exam_staff_members_exam_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exam_staff_members_exam_id ON public.exam_staff_members USING btree (exam_id);


--
-- Name: idx_exam_staff_norms_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exam_staff_norms_lookup ON public.exam_staff_norms USING btree (exam_type, exam_category);


--
-- Name: idx_exams_faculty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exams_faculty ON public.exams USING btree (faculty_id);


--
-- Name: idx_exams_faculty_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exams_faculty_status ON public.exams USING btree (faculty_id, status);


--
-- Name: idx_exams_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exams_status ON public.exams USING btree (status);


--
-- Name: idx_faculty_bank_faculty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_faculty_bank_faculty ON public.faculty_bank_accounts USING btree (faculty_id);


--
-- Name: idx_payments_accountant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_accountant_id ON public.payments USING btree (accountant_id);


--
-- Name: idx_payments_exam_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_exam_id ON public.payments USING btree (exam_id);


--
-- Name: idx_payments_payment_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_payment_date ON public.payments USING btree (payment_date);


--
-- Name: idx_queries_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queries_category ON public.queries USING btree (category);


--
-- Name: idx_queries_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queries_created_at ON public.queries USING btree (created_at DESC);


--
-- Name: idx_queries_faculty_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queries_faculty_id ON public.queries USING btree (faculty_id);


--
-- Name: idx_queries_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queries_status ON public.queries USING btree (status);


--
-- Name: idx_query_responses_query_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_query_responses_query_id ON public.query_responses USING btree (query_id);


--
-- Name: idx_remuneration_rates_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_remuneration_rates_year ON public.remuneration_rates USING btree (academic_year);


--
-- Name: idx_staff_role_rates_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_role_rates_year ON public.staff_role_rates USING btree (academic_year);


--
-- Name: idx_subjects_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subjects_code ON public.subjects USING btree (code);


--
-- Name: idx_subjects_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subjects_name ON public.subjects USING btree (name);


--
-- Name: idx_users_google_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_google_id ON public.users USING btree (google_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: users_prn_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_prn_unique ON public.users USING btree (prn) WHERE (prn IS NOT NULL);


--
-- Name: queries trigger_update_query_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_query_timestamp BEFORE UPDATE ON public.queries FOR EACH ROW EXECUTE FUNCTION public.update_query_timestamp();


--
-- Name: claim_actions claim_actions_action_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_actions
    ADD CONSTRAINT claim_actions_action_by_fkey FOREIGN KEY (action_by) REFERENCES public.users(id);


--
-- Name: claim_actions claim_actions_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_actions
    ADD CONSTRAINT claim_actions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: exam_documents exam_documents_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_documents
    ADD CONSTRAINT exam_documents_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: exam_staff exam_staff_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff
    ADD CONSTRAINT exam_staff_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: exam_staff_members exam_staff_members_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff_members
    ADD CONSTRAINT exam_staff_members_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: exams exams_external_examiner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_external_examiner_id_fkey FOREIGN KEY (external_examiner_id) REFERENCES public.external_examiners(id);


--
-- Name: exams exams_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id);


--
-- Name: external_exam_links external_exam_links_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_exam_links
    ADD CONSTRAINT external_exam_links_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: faculty_bank_accounts faculty_bank_accounts_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty_bank_accounts
    ADD CONSTRAINT faculty_bank_accounts_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_accountant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_accountant_id_fkey FOREIGN KEY (accountant_id) REFERENCES public.users(id);


--
-- Name: payments payments_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: queries queries_claim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES public.exams(id) ON DELETE SET NULL;


--
-- Name: queries queries_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: query_responses query_responses_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_responses
    ADD CONSTRAINT query_responses_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON DELETE CASCADE;


--
-- Name: query_responses query_responses_responder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_responses
    ADD CONSTRAINT query_responses_responder_id_fkey FOREIGN KEY (responder_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: remuneration_calculations remuneration_calculations_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_calculations
    ADD CONSTRAINT remuneration_calculations_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict zTFbQpqvpnsGuAfW9ERpYcFoo3vsOyn6F0XglVAzLThEYIuwuIHEEQtLP3QMvNz

