--
-- PostgreSQL database dump
--

\restrict DgJV5u7SRPKSWgxaL8z2YEFCTwzpft2LvoypmMHYif9F15HJhA0ywvZ2MUXlgPR

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
      v_staff_row RECORD;
      v_role RECORD;
      v_gross NUMERIC := 0;
      v_tds NUMERIC := 0;
      v_net NUMERIC := 0;
      v_chairman_allowance NUMERIC := 0;
      v_conveyance_amount NUMERIC := 0;
    BEGIN
      SELECT * INTO v_exam FROM exams WHERE id = p_exam_id;
      IF NOT FOUND THEN RAISE EXCEPTION 'Exam not found'; END IF;

      SELECT * INTO v_rates FROM remuneration_rates WHERE exam_type = v_exam.exam_type;
      IF NOT FOUND THEN RAISE EXCEPTION 'Rates not found'; END IF;

      SELECT * INTO v_batch FROM batch_sizes WHERE program = v_exam.program;

      -- 1. Calculate Examiner Amount
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

      -- 2. Fetch Allowances (Preserved from manual input in remuneration_calculations)
      SELECT chairman_allowance, conveyance_amount INTO v_chairman_allowance, v_conveyance_amount
      FROM remuneration_calculations WHERE exam_id = p_exam_id;

      v_chairman_allowance := COALESCE(v_chairman_allowance, 0);
      v_conveyance_amount := COALESCE(v_conveyance_amount, 0);

      -- 3. Calculate Staff Amount
      FOR v_staff_row IN SELECT * FROM exam_staff WHERE exam_id = p_exam_id LOOP
        SELECT * INTO v_role FROM staff_role_rates WHERE staff_role = v_staff_row.staff_role;
        IF FOUND THEN
          v_staff := v_staff +
            v_staff_row.count *
            (
              v_role.preparation_rate * v_staff_row.preparation_days +
              v_role.per_batch_rate * v_batches +
              v_role.cleaning_rate * v_staff_row.cleaning_days
            );
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

      UPDATE exam_staff SET batches = v_batches WHERE exam_id = p_exam_id;
    END;
    $$;


ALTER FUNCTION public.calculate_exam(p_exam_id integer) OWNER TO postgres;

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
    dissertation_size integer
);


ALTER TABLE public.batch_sizes OWNER TO postgres;

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
    action_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    CONSTRAINT exams_claim_form_type_check CHECK (((claim_form_type)::text = ANY ((ARRAY['TEACHING_INTERNAL'::character varying, 'TEACHING_EXTERNAL'::character varying, 'NON_TEACHING'::character varying])::text[]))),
    CONSTRAINT exams_students_count_check CHECK ((students_count >= 0))
);


ALTER TABLE public.exams OWNER TO postgres;

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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.external_examiners OWNER TO postgres;

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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    CONSTRAINT remuneration_rates_min_per_day_check CHECK ((min_per_day >= (0)::numeric))
);


ALTER TABLE public.remuneration_rates OWNER TO postgres;

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
    cleaning_rate numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.staff_role_rates OWNER TO postgres;

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
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['FACULTY'::character varying, 'ACCOUNTANT'::character varying, 'ADMIN'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

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
-- Name: remuneration_calculations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_calculations ALTER COLUMN id SET DEFAULT nextval('public.remuneration_calculations_id_seq'::regclass);


--
-- Name: remuneration_rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_rates ALTER COLUMN id SET DEFAULT nextval('public.remuneration_rates_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: batch_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batch_sizes (id, program, practical_size, oral_size, termwork_size, project_oral_size, dissertation_size) FROM stdin;
1	BTECH	12	20	20	\N	\N
3	BVOC	12	15	15	\N	\N
2	MTECH	6	6	6	6	1
\.


--
-- Data for Name: claim_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.claim_actions (id, exam_id, action_by, action_role, action_type, remarks, action_at) FROM stdin;
1	103	3	ACCOUNTANT	REJECTED	\N	2026-01-06 08:32:37.403509
2	103	3	ACCOUNTANT	REJECTED	\N	2026-01-06 08:32:40.29393
3	103	3	ACCOUNTANT	REJECTED	\N	2026-01-06 08:32:43.367197
4	102	3	ACCOUNTANT	REJECTED	\N	2026-01-06 08:32:49.662267
5	101	3	ACCOUNTANT	APPROVED	\N	2026-01-06 08:33:08.222027
6	65	3	ACCOUNTANT	APPROVED	\N	2026-01-06 08:33:18.911092
\.


--
-- Data for Name: exam_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exam_documents (id, exam_id, doc_type, file_url, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: exam_staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exam_staff (id, exam_id, staff_role, count, preparation_days, cleaning_days, batches) FROM stdin;
2	68	Expert Assistant	3	4	5	7
3	103	Laboratory/Technical Assistant	1	3	1	0
4	113	Expert Assistant	4	1	1	0
\.


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exams (id, faculty_id, exam_type, program, level, students_count, subject_name, subject_code, semester, academic_year, exam_date, is_backlog, status, created_at, updated_at, claim_form_type, external_examiner_id, conveyance_amount) FROM stdin;
59	5	TW	BTECH	FY	45	da	3214	2	2024-2025	2025-12-13	f	submitted	2025-12-25 12:17:03.374623	2025-12-25 12:17:03.374623	\N	\N	0.00
60	5	OR	MCA	FY	45	dsa	32144	2	2024-2025	2025-12-19	f	submitted	2025-12-25 12:18:54.854112	2025-12-25 12:18:54.854112	\N	\N	0.00
61	5	PR	MTECH	SY	67	DERST	2314	1	2024-2025	2025-12-10	t	submitted	2025-12-25 13:22:12.188157	2025-12-25 13:22:12.188157	\N	\N	0.00
62	5	MTech_MiniProject	MTECH	FY	67	opsa	2367	3	2024-2025	2025-12-03	f	submitted	2025-12-25 13:28:38.417784	2025-12-25 13:28:38.417784	\N	\N	0.00
64	5	Project_Seminar_MiniProject	BTECH	FINAL	67	DBMS	54322	2	2024-2025	2025-12-03	f	submitted	2025-12-25 20:10:03.047236	2025-12-25 20:10:03.047236	\N	\N	0.00
76	5	PR	BTECH	SY	46	dsarue	234123	IV	2024-25	2025-12-09	f	submitted	2025-12-26 17:12:16.399223	2025-12-26 17:12:54.888987	TEACHING_INTERNAL	\N	0.00
77	5	PR	BTECH	FY	53	wertvds	23190	III	2025-26	2025-12-03	f	submitted	2025-12-26 17:25:59.113119	2025-12-26 17:26:15.491596	TEACHING_INTERNAL	\N	0.00
90	5	OR	BTECH	FY	45	fgtd	123412	II	2025-26	2025-12-11	f	submitted	2025-12-28 16:44:10.940691	2025-12-28 16:44:37.297975	TEACHING_EXTERNAL	1	0.00
78	5	PR	BTECH	SY	50	sdaur	67854	II	2025-26	\N	f	submitted	2025-12-26 17:38:09.943325	2025-12-26 17:41:06.589585	TEACHING_INTERNAL	\N	0.00
79	5	OR	BTECH	FY	45	dffgfg	334234	IV	2024-25	2025-12-04	f	submitted	2025-12-26 17:43:55.097821	2025-12-26 17:44:02.337653	TEACHING_INTERNAL	\N	0.00
80	5	PR	BTECH	TY	3	wew	231221	II	2025-26	2025-12-11	f	submitted	2025-12-26 17:52:12.082682	2025-12-26 17:52:12.082682	TEACHING_INTERNAL	\N	0.00
36	5	TW	MTECH	SY	89	DMS A	2134521	3	2024-2025	2025-12-11	f	submitted	2025-12-25 10:51:51.87983	2025-12-25 10:51:51.87983	\N	\N	0.00
66	5	PR	BTECH	SY	78	ergds	231411	2	2024-2025	2025-12-11	t	submitted	2025-12-25 20:23:02.704599	2025-12-25 20:23:02.704599	TEACHING_INTERNAL	\N	0.00
111	5	OR	MTECH	SY	55	kilop	67665	III	2025-26	2026-01-14	f	submitted	2026-01-13 23:29:54.741969	2026-01-13 23:32:19.831476	TEACHING_EXTERNAL	5	0.00
38	5	OR	BTECH	FY	56	DERTS	34211	4	2024-2025	2025-12-03	f	submitted	2025-12-25 11:10:22.849757	2025-12-25 11:10:22.849757	\N	\N	0.00
69	5	PR	BTECH	FINAL	45	wertsd	45333	3	2024-2025	2025-12-11	f	submitted	2025-12-26 12:42:05.418564	2025-12-26 12:42:05.418564	TEACHING_INTERNAL	\N	0.00
81	5	PR	MTECH	SY	45	rtyui	23432	II	2025-26	2025-12-17	f	submitted	2025-12-26 19:50:14.333142	2025-12-26 19:52:44.184902	TEACHING_INTERNAL	\N	0.00
96	5	PR	BTECH	SY	44	ddfsdf	343434	I	2025-26	2025-11-29	f	submitted	2025-12-28 17:01:28.337134	2025-12-28 17:01:40.554929	TEACHING_EXTERNAL	2	0.00
83	5	TW	MTECH	SY	78	fgtre	23342	II	2025-26	2025-12-04	f	submitted	2025-12-26 20:10:58.595875	2025-12-26 20:10:58.595875	TEACHING_INTERNAL	\N	0.00
85	5	OR	MTECH	FY	34	fgdfgdf	34545	II	2025-26	2025-12-13	f	submitted	2025-12-26 20:16:13.644225	2025-12-26 20:16:13.644225	TEACHING_INTERNAL	\N	0.00
35	5	TW	MTECH	SY	57	dsa	34112	3	2024-2025	2025-12-11	f	draft	2025-12-23 17:43:42.94956	2025-12-23 17:43:42.94956	\N	\N	0.00
84	5	PR	BTECH	FY	65	QWERTY	56784	I	2025-26	2025-12-04	f	submitted	2025-12-26 20:14:34.876473	2025-12-28 11:33:26.703688	TEACHING_INTERNAL	\N	0.00
97	5	Project_Seminar_MiniProject	BTECH	TY	63	sfsfasf	546564	III	2024-25	2025-12-11	f	draft	2025-12-28 17:15:51.930767	2025-12-28 17:16:40.991088	TEACHING_EXTERNAL	\N	0.00
98	5	OR	BTECH	SY	67	aweer	676756	II	2025-26	2025-12-04	f	submitted	2025-12-28 17:20:26.381295	2025-12-28 17:20:32.984441	TEACHING_EXTERNAL	3	0.00
99	5	PR	MTECH	SY	90	qewe	4546	II	2025-26	2025-12-04	f	submitted	2025-12-28 19:01:09.13679	2025-12-28 19:04:53.172966	TEACHING_EXTERNAL	4	0.00
100	5	OR	BTECH	SY	45	sadada	5656	II	2025-26	2025-12-19	f	draft	2025-12-28 19:11:13.348182	2025-12-28 19:11:13.348182	TEACHING_EXTERNAL	\N	0.00
112	5	Project_Seminar_MiniProject	MTECH	SY	54	PRJ	76867	III	2026-27	2026-01-30	f	submitted	2026-01-13 23:45:01.254191	2026-01-13 23:47:21.416193	TEACHING_EXTERNAL	6	0.00
103	5	PR	BTECH	FY	87	sdfsdf	2343	II	2025-26	2025-12-16	f	rejected	2025-12-28 19:57:30.137067	2025-12-28 19:57:40.874017	TEACHING_INTERNAL	\N	0.00
102	5	OR	BTECH	FY	57	mayu	2312	III	2024-25	2025-12-23	f	rejected	2025-12-28 19:45:56.044661	2025-12-28 19:45:56.044661	TEACHING_INTERNAL	\N	0.00
101	5	OR	MTECH	FY	45	fdsfsarer	56567	II	2025-26	2025-12-24	f	approved	2025-12-28 19:39:43.97266	2025-12-28 19:39:43.97266	TEACHING_INTERNAL	\N	0.00
65	5	MTech_MiniProject	MTECH	FY	78	dsaaa	3421	1	2024-2025	2025-12-10	t	approved	2025-12-25 20:17:08.352389	2025-12-25 20:17:08.352389	\N	\N	0.00
113	5	PR	BTECH	FY	45	Physics	354326	II	2025-26	2026-01-14	f	draft	2026-01-15 10:49:30.997929	2026-01-15 10:49:30.997929	NON_TEACHING	\N	0.00
68	5	PR	BTECH	SY	77	CII	45674	3	2024-2025	2025-12-04	t	submitted	2025-12-26 12:37:42.759521	2026-01-13 22:18:18.450566	TEACHING_INTERNAL	\N	0.00
107	5	PR	BTECH	FY	45	DSSA	345453	I	2026-27	2026-01-29	f	submitted	2026-01-13 22:40:27.794334	2026-01-13 22:40:27.794334	TEACHING_INTERNAL	\N	0.00
110	5	OR	BVOC	SY	36	SERT	45353	IV	2025-26	2026-01-15	f	submitted	2026-01-13 23:28:27.187976	2026-01-13 23:28:27.187976	TEACHING_INTERNAL	\N	0.00
\.


--
-- Data for Name: external_exam_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_exam_links (id, exam_id, token, expires_at, used, created_at) FROM stdin;
6	90	01c630cfa9ed09549559968f82b2ec26ff81c804a7a69d0bca244cdfa2b82cc0	2026-01-04 16:44:14.271239	t	2025-12-28 16:44:14.271239
7	96	1a2af05c23db837e07e6a1562a63304d755cc92d2c6840a53eb8ce9d6e9ec430	2026-01-04 17:01:30.938627	t	2025-12-28 17:01:30.938627
8	97	6fc1556a5336f2c9eda62bdbc0aa3803d4e0e85825e4507fa224b4f10b351ab4	2026-01-04 17:15:53.961265	t	2025-12-28 17:15:53.961265
9	97	24776615bbbb98ccb9c3f4f0d9b061c58a8c79310073e646d7fce1449cf271d9	2026-01-04 17:15:55.236491	t	2025-12-28 17:15:55.236491
10	97	1dfe5782dbcb7381f527ad575e13bde86c191c718d63aa4a5dd1cbd11f66ec3c	2026-01-04 17:16:11.35186	f	2025-12-28 17:16:11.35186
11	98	89f2b1d08c3e844ccf6e57cf435065e6b3c04ba0d4f5ff65f9c1a15dfcd7060d	2026-01-04 17:20:27.498326	t	2025-12-28 17:20:27.498326
12	99	20bb5381688a4efc77e1ec5ad42e42e6d11346decf660feb4663612739f8d145	2026-01-04 19:01:10.121568	t	2025-12-28 19:01:10.121568
13	100	295e512598883e92bc192701ad5d3ffb43ce6e393e4bc5f1854e2f4bfa7e08df	2026-01-04 19:11:14.279833	f	2025-12-28 19:11:14.279833
16	111	4e5d37405b99e3ac07abbe931b89cc844215dadbc3da16e92c5bf9f7ca7ce0b3	2026-01-20 23:30:05.362017	t	2026-01-13 23:30:05.362017
17	112	b1cc8446b84c2a2fa7f3836697e2a6377ecba082f64586757ede736e711223d4	2026-01-20 23:46:13.747182	t	2026-01-13 23:46:13.747182
\.


--
-- Data for Name: external_examiners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_examiners (id, full_name, email, mobile, parent_institute, pan_number, bank_name, branch_name, account_number, ifsc_code, pan_document_url, cancelled_cheque_url, created_at) FROM stdin;
1												2025-12-28 16:44:37.297975
2												2025-12-28 17:01:40.554929
3												2025-12-28 17:20:32.984441
4	sddfsdf	sdsadasd	6767878	dfsdfs	sdfsdf	sdfsdf	dfsdfsdf	dfsdf	sfse4d	/uploads/1766928892999-242096683.pdf	/uploads/1766928893008-610358617.pdf	2025-12-28 19:04:53.172966
5	external	external@gmail.com	6767878789	pccoeR	ABCED1234F	KOTAK	NIGDI	2454654532	KKBK0000123	/uploads/1768327339760-379541677.pdf	/uploads/1768327339768-373303330.pdf	2026-01-13 23:32:19.831476
6	external	external@gmail.com	6767878789	pccoeR	ABCED1234F	KOTAK	dfsdfsdf	2454654532	KKBK0000123	/uploads/1768328241346-233921905.pdf	/uploads/1768328241355-63030393.pdf	2026-01-13 23:47:21.416193
\.


--
-- Data for Name: faculty_bank_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculty_bank_accounts (id, faculty_id, account_holder_name, bank_name, branch_name, account_number, ifsc_code, pan_number, pan_document_url, cancelled_cheque_url, is_verified, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: remuneration_calculations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.remuneration_calculations (id, exam_id, examiner_amount, staff_amount, chairman_allowance, conveyance_amount, total_amount, min_applied, created_at, updated_at, tds_amount, net_amount) FROM stdin;
3	35	1710.00	0.00	0.00	0.00	1710.00	f	2025-12-23 17:43:45.895036	2025-12-23 17:43:45.895036	0.00	0.00
4	36	2670.00	0.00	0.00	0.00	2670.00	f	2025-12-25 10:51:55.414232	2025-12-25 10:51:55.414232	0.00	0.00
5	38	1008.00	0.00	0.00	0.00	1008.00	f	2025-12-25 11:10:24.357216	2025-12-25 11:10:24.357216	0.00	0.00
6	59	810.00	0.00	0.00	0.00	810.00	f	2025-12-25 12:17:27.666086	2025-12-25 12:17:27.666086	0.00	0.00
7	60	1350.00	0.00	0.00	0.00	1350.00	f	2025-12-25 12:18:57.572054	2025-12-25 12:18:57.572054	0.00	0.00
8	61	3886.00	0.00	0.00	0.00	3886.00	f	2025-12-25 13:22:24.511372	2025-12-25 13:22:24.511372	0.00	0.00
9	62	8375.00	0.00	0.00	0.00	8375.00	f	2025-12-25 13:28:49.637299	2025-12-25 13:28:49.637299	0.00	0.00
10	64	3886.00	0.00	0.00	0.00	3886.00	f	2025-12-25 20:10:15.869315	2025-12-25 20:10:15.869315	0.00	0.00
11	65	9750.00	0.00	0.00	0.00	9750.00	f	2025-12-25 20:17:18.084037	2025-12-25 20:17:18.084037	0.00	0.00
12	66	2340.00	0.00	0.00	0.00	2340.00	f	2025-12-25 20:23:07.025656	2025-12-25 20:23:07.025656	0.00	0.00
14	69	1575.00	0.00	0.00	0.00	1575.00	f	2025-12-26 12:42:21.448065	2025-12-26 12:42:21.448065	0.00	0.00
15	76	1380.00	0.00	0.00	0.00	1380.00	f	2025-12-26 17:13:40.082009	2025-12-26 17:13:40.082009	0.00	0.00
16	77	1590.00	0.00	0.00	0.00	1590.00	f	2025-12-26 17:26:33.760226	2025-12-26 17:26:33.760226	0.00	0.00
17	78	1500.00	0.00	0.00	0.00	1500.00	f	2025-12-26 17:41:12.987392	2025-12-26 17:41:12.987392	0.00	0.00
18	79	810.00	0.00	0.00	0.00	810.00	f	2025-12-26 17:44:06.015522	2025-12-26 17:44:06.015522	0.00	0.00
19	80	500.00	0.00	0.00	0.00	500.00	t	2025-12-26 17:52:19.512441	2025-12-26 17:52:19.512441	0.00	0.00
20	81	2610.00	0.00	0.00	0.00	2610.00	f	2025-12-26 19:52:47.09032	2025-12-26 19:58:46.769056	0.00	0.00
23	83	2340.00	0.00	0.00	0.00	2340.00	f	2025-12-26 20:11:32.729722	2025-12-26 20:11:32.729722	0.00	0.00
25	85	1020.00	0.00	0.00	0.00	1020.00	f	2025-12-26 20:16:16.053838	2025-12-26 20:16:16.053838	0.00	0.00
26	90	810.00	0.00	0.00	0.00	810.00	f	2025-12-28 16:44:37.297975	2025-12-28 16:44:37.297975	0.00	0.00
27	96	1320.00	0.00	0.00	0.00	1320.00	f	2025-12-28 17:01:40.554929	2025-12-28 17:01:40.554929	0.00	0.00
24	84	1950.00	0.00	0.00	0.00	1950.00	f	2025-12-26 20:15:35.217335	2025-12-28 17:08:32.703454	0.00	0.00
29	98	1206.00	0.00	0.00	0.00	1206.00	f	2025-12-28 17:20:32.984441	2025-12-28 17:20:32.984441	0.00	0.00
30	99	5220.00	0.00	0.00	0.00	5220.00	f	2025-12-28 19:04:53.172966	2025-12-28 19:04:53.172966	0.00	0.00
31	101	1350.00	0.00	0.00	0.00	1350.00	f	2025-12-28 19:44:39.688255	2025-12-28 19:44:39.688255	0.00	0.00
33	103	2610.00	0.00	0.00	0.00	2610.00	f	2025-12-28 19:57:46.632298	2025-12-28 19:57:46.632298	0.00	0.00
32	102	1026.00	0.00	0.00	0.00	1026.00	f	2025-12-28 19:46:10.755782	2025-12-28 22:51:34.813097	0.00	0.00
13	68	2310.00	2625.00	0.00	0.00	4935.00	f	2025-12-26 12:37:46.768827	2026-01-13 22:18:51.452485	0.00	0.00
37	107	1350.00	0.00	0.00	0.00	1350.00	f	2026-01-13 22:40:32.237639	2026-01-13 22:40:32.237639	0.00	0.00
42	110	648.00	0.00	300.00	0.00	948.00	f	2026-01-13 23:28:41.515715	2026-01-13 23:28:41.51915	94.80	853.20
44	111	1650.00	0.00	0.00	0.00	1650.00	f	2026-01-13 23:32:19.831476	2026-01-13 23:32:19.831476	165.00	1485.00
45	112	500.00	0.00	0.00	23.00	523.00	t	2026-01-13 23:47:21.416193	2026-01-13 23:47:21.416193	52.30	470.70
\.


--
-- Data for Name: remuneration_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.remuneration_rates (id, exam_type, fy_sy_rate, ty_final_rate, mtech_mca_rate, min_per_day) FROM stdin;
1	PR	30.00	35.00	58.00	500.00
2	OR	18.00	25.00	30.00	500.00
3	TW	18.00	25.00	30.00	500.00
8	BTech_Project_Stage1	\N	100.00	\N	500.00
9	BTech_Project_Stage2	\N	200.00	\N	500.00
10	MTech_MiniProject	\N	\N	125.00	500.00
11	MTech_Seminar	\N	\N	125.00	500.00
12	MTech_Project_Stage1	\N	\N	260.00	500.00
13	MTech_Dissertation	\N	\N	490.00	500.00
14	MCA_MiniProject	\N	\N	58.00	500.00
15	MCA_MajorProject	\N	\N	250.00	500.00
16	Audit_Course	5.00	5.00	5.00	250.00
4	Project_Seminar_MiniProject	\N	58.00	\N	500.00
\.


--
-- Data for Name: staff_role_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_role_rates (staff_role, preparation_rate, per_batch_rate, cleaning_rate) FROM stdin;
Expert Assistant	0.00	125.00	0.00
Laboratory/Technical Assistant	70.00	70.00	70.00
Foreman	70.00	70.00	70.00
Peon	60.00	60.00	60.00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, department, is_active, created_at) FROM stdin;
2	System Admin	admin@pccoepune.org	$2b$10$waot4QlrzaekRUtr/Q7d4ullk48ED1sVmPoWm9dWSft6nYlZ0xuDe	ADMIN	\N	t	2025-12-18 17:24:19.936147
3	Accounts Officer	accounts@pccoepune.org	$2b$10$waot4QlrzaekRUtr/Q7d4ullk48ED1sVmPoWm9dWSft6nYlZ0xuDe	ACCOUNTANT	\N	t	2025-12-18 17:24:19.936147
6	Faculty	faculty@pccoepune.org	$2b$10$co8N9QM6PDPCmGh2j5Vg5eEth2yW9CbwCqJq/GcqR0ZpvDdAietuq	FACULTY	Mechanical	t	2025-12-21 12:20:10.695061
5	mayureshM	mayuresh@pccoepune.org	$2b$10$ARVThUcKnSEdfmmwJryrh.03TxXbrbTppofjhX4SruEt35FaTvBYG	FACULTY	Computer	t	2025-12-21 11:47:14.68075
\.


--
-- Name: batch_sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batch_sizes_id_seq', 6, true);


--
-- Name: claim_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.claim_actions_id_seq', 6, true);


--
-- Name: exam_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exam_documents_id_seq', 1, false);


--
-- Name: exam_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exam_staff_id_seq', 4, true);


--
-- Name: exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exams_id_seq', 113, true);


--
-- Name: external_exam_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.external_exam_links_id_seq', 17, true);


--
-- Name: external_examiners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.external_examiners_id_seq', 6, true);


--
-- Name: faculty_bank_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faculty_bank_accounts_id_seq', 1, false);


--
-- Name: remuneration_calculations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.remuneration_calculations_id_seq', 46, true);


--
-- Name: remuneration_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.remuneration_rates_id_seq', 16, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: batch_sizes batch_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_sizes
    ADD CONSTRAINT batch_sizes_pkey PRIMARY KEY (id);


--
-- Name: batch_sizes batch_sizes_program_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_sizes
    ADD CONSTRAINT batch_sizes_program_key UNIQUE (program);


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
-- Name: remuneration_rates remuneration_rates_exam_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_rates
    ADD CONSTRAINT remuneration_rates_exam_type_key UNIQUE (exam_type);


--
-- Name: remuneration_rates remuneration_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_rates
    ADD CONSTRAINT remuneration_rates_pkey PRIMARY KEY (id);


--
-- Name: staff_role_rates staff_role_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_role_rates
    ADD CONSTRAINT staff_role_rates_pkey PRIMARY KEY (staff_role);


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
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


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
-- Name: exam_staff exam_staff_staff_role_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff
    ADD CONSTRAINT exam_staff_staff_role_fkey FOREIGN KEY (staff_role) REFERENCES public.staff_role_rates(staff_role);


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
-- Name: remuneration_calculations remuneration_calculations_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remuneration_calculations
    ADD CONSTRAINT remuneration_calculations_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict DgJV5u7SRPKSWgxaL8z2YEFCTwzpft2LvoypmMHYif9F15HJhA0ywvZ2MUXlgPR

