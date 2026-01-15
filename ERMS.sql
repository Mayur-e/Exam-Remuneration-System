--
-- PostgreSQL database dump
--

\restrict b4QdEZ9mFQnjUdIFK6SGgbPZ34c2EML7nXLoV3ceninAmKaUbhYmftFBYgqt3Pq

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

CREATE OR REPLACE FUNCTION public.calculate_exam(p_exam_id integer) RETURNS void
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
BEGIN
  SELECT * INTO v_exam FROM exams WHERE id = p_exam_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Exam not found'; END IF;

  SELECT * INTO v_rates FROM remuneration_rates WHERE exam_type = v_exam.exam_type;
  IF NOT FOUND THEN RAISE EXCEPTION 'Rates not found'; END IF;

  SELECT * INTO v_batch FROM batch_sizes WHERE program = v_exam.program;

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

  INSERT INTO remuneration_calculations
  (exam_id, examiner_amount, staff_amount, total_amount, min_applied)
  VALUES
  (p_exam_id, v_examiner, v_staff, v_examiner + v_staff, v_min)
  ON CONFLICT (exam_id) DO UPDATE
  SET examiner_amount = EXCLUDED.examiner_amount,
      staff_amount = EXCLUDED.staff_amount,
      total_amount = EXCLUDED.total_amount,
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
-- Name: external_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_documents (
    id integer NOT NULL,
    exam_id integer,
    document_type text,
    file_url text
);


ALTER TABLE public.external_documents OWNER TO postgres;

--
-- Name: external_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_documents_id_seq OWNER TO postgres;

--
-- Name: external_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_documents_id_seq OWNED BY public.external_documents.id;


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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- Name: exam_staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_staff ALTER COLUMN id SET DEFAULT nextval('public.exam_staff_id_seq'::regclass);


--
-- Name: exams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams ALTER COLUMN id SET DEFAULT nextval('public.exams_id_seq'::regclass);


--
-- Name: external_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_documents ALTER COLUMN id SET DEFAULT nextval('public.external_documents_id_seq'::regclass);


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
2	MTECH	6	6	6	\N	\N
3	BVOC	12	15	15	\N	\N
\.


--
-- Data for Name: claim_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.claim_actions (id, exam_id, action_by, action_role, action_type, remarks, action_at) FROM stdin;
\.


--
-- Data for Name: exam_staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exam_staff (id, exam_id, staff_role, count, preparation_days, cleaning_days, batches) FROM stdin;
\.


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exams (id, faculty_id, exam_type, program, level, students_count, subject_name, subject_code, semester, academic_year, exam_date, is_backlog, status, created_at, updated_at, claim_form_type) FROM stdin;
59	5	TW	BTECH	FY	45	da	3214	2	2024-2025	2025-12-13	f	submitted	2025-12-25 12:17:03.374623	2025-12-25 12:17:03.374623	\N
60	5	OR	MCA	FY	45	dsa	32144	2	2024-2025	2025-12-19	f	submitted	2025-12-25 12:18:54.854112	2025-12-25 12:18:54.854112	\N
61	5	PR	MTECH	SY	67	DERST	2314	1	2024-2025	2025-12-10	t	submitted	2025-12-25 13:22:12.188157	2025-12-25 13:22:12.188157	\N
62	5	MTech_MiniProject	MTECH	FY	67	opsa	2367	3	2024-2025	2025-12-03	f	submitted	2025-12-25 13:28:38.417784	2025-12-25 13:28:38.417784	\N
63	5	Project_Seminar_MiniProject	MTECH	FINAL	56	trawe	45241	2	2024-2025	2025-12-02	f	draft	2025-12-25 20:08:47.27297	2025-12-25 20:08:47.27297	\N
64	5	Project_Seminar_MiniProject	BTECH	FINAL	67	DBMS	54322	2	2024-2025	2025-12-03	f	submitted	2025-12-25 20:10:03.047236	2025-12-25 20:10:03.047236	\N
65	5	MTech_MiniProject	MTECH	FY	78	dsaaa	3421	1	2024-2025	2025-12-10	t	submitted	2025-12-25 20:17:08.352389	2025-12-25 20:17:08.352389	\N
66	5	PR	BTECH	SY	78	ergds	231411	2	2024-2025	2025-12-11	t	submitted	2025-12-25 20:23:02.704599	2025-12-25 20:23:02.704599	\N
67	5	OR	BTECH	FY	56	ci	78665	4	2024-2025	2025-12-03	t	draft	2025-12-26 11:48:09.483397	2025-12-26 11:48:09.483397	\N
68	5	PR	BTECH	SY	78	CII	45674	3	2024-2025	2025-12-05	t	submitted	2025-12-26 12:37:42.759521	2025-12-26 12:37:42.759521	\N
69	5	PR	BTECH	FINAL	45	wertsd	45333	3	2024-2025	2025-12-11	f	submitted	2025-12-26 12:42:05.418564	2025-12-26 12:42:05.418564	\N
75	5	PR	MTECH	FY	45	dsaer	5433321	II	2025-26	2025-12-18	f	draft	2025-12-26 17:05:20.452415	2025-12-26 17:05:20.452415	TEACHING_INTERNAL
76	5	PR	BTECH	SY	46	dsarue	234123	IV	2024-25	2025-12-09	f	submitted	2025-12-26 17:12:16.399223	2025-12-26 17:12:54.888987	TEACHING_INTERNAL
77	5	PR	BTECH	FY	53	wertvds	23190	III	2025-26	2025-12-03	f	submitted	2025-12-26 17:25:59.113119	2025-12-26 17:26:15.491596	TEACHING_INTERNAL
78	5	PR	BTECH	SY	50	sdaur	67854	II	2025-26	\N	f	submitted	2025-12-26 17:38:09.943325	2025-12-26 17:41:06.589585	TEACHING_INTERNAL
79	5	OR	BTECH	FY	45	dffgfg	334234	IV	2024-25	2025-12-04	f	submitted	2025-12-26 17:43:55.097821	2025-12-26 17:44:02.337653	TEACHING_INTERNAL
80	5	PR	BTECH	TY	3	wew	231221	II	2025-26	2025-12-11	f	submitted	2025-12-26 17:52:12.082682	2025-12-26 17:52:12.082682	TEACHING_INTERNAL
35	5	TW	MTECH	SY	57	dsa	34112	3	2024-2025	2025-12-11	f	submitted	2025-12-23 17:43:42.94956	2025-12-23 17:43:42.94956	\N
36	5	TW	MTECH	SY	89	DMS A	2134521	3	2024-2025	2025-12-11	f	submitted	2025-12-25 10:51:51.87983	2025-12-25 10:51:51.87983	\N
38	5	OR	BTECH	FY	56	DERTS	34211	4	2024-2025	2025-12-03	f	submitted	2025-12-25 11:10:22.849757	2025-12-25 11:10:22.849757	\N
\.


--
-- Data for Name: external_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_documents (id, exam_id, document_type, file_url) FROM stdin;
\.


--
-- Data for Name: faculty_bank_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculty_bank_accounts (id, faculty_id, account_holder_name, bank_name, branch_name, account_number, ifsc_code, pan_number, pan_document_url, cancelled_cheque_url, is_verified, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: remuneration_calculations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.remuneration_calculations (id, exam_id, examiner_amount, staff_amount, chairman_allowance, conveyance_amount, total_amount, min_applied, created_at, updated_at) FROM stdin;
3	35	1710.00	0.00	0.00	0.00	1710.00	f	2025-12-23 17:43:45.895036	2025-12-23 17:43:45.895036
4	36	2670.00	0.00	0.00	0.00	2670.00	f	2025-12-25 10:51:55.414232	2025-12-25 10:51:55.414232
5	38	1008.00	0.00	0.00	0.00	1008.00	f	2025-12-25 11:10:24.357216	2025-12-25 11:10:24.357216
6	59	810.00	0.00	0.00	0.00	810.00	f	2025-12-25 12:17:27.666086	2025-12-25 12:17:27.666086
7	60	1350.00	0.00	0.00	0.00	1350.00	f	2025-12-25 12:18:57.572054	2025-12-25 12:18:57.572054
8	61	3886.00	0.00	0.00	0.00	3886.00	f	2025-12-25 13:22:24.511372	2025-12-25 13:22:24.511372
9	62	8375.00	0.00	0.00	0.00	8375.00	f	2025-12-25 13:28:49.637299	2025-12-25 13:28:49.637299
10	64	3886.00	0.00	0.00	0.00	3886.00	f	2025-12-25 20:10:15.869315	2025-12-25 20:10:15.869315
11	65	9750.00	0.00	0.00	0.00	9750.00	f	2025-12-25 20:17:18.084037	2025-12-25 20:17:18.084037
12	66	2340.00	0.00	0.00	0.00	2340.00	f	2025-12-25 20:23:07.025656	2025-12-25 20:23:07.025656
13	68	2340.00	0.00	0.00	0.00	2340.00	f	2025-12-26 12:37:46.768827	2025-12-26 12:37:46.768827
14	69	1575.00	0.00	0.00	0.00	1575.00	f	2025-12-26 12:42:21.448065	2025-12-26 12:42:21.448065
15	76	1380.00	0.00	0.00	0.00	1380.00	f	2025-12-26 17:13:40.082009	2025-12-26 17:13:40.082009
16	77	1590.00	0.00	0.00	0.00	1590.00	f	2025-12-26 17:26:33.760226	2025-12-26 17:26:33.760226
17	78	1500.00	0.00	0.00	0.00	1500.00	f	2025-12-26 17:41:12.987392	2025-12-26 17:41:12.987392
18	79	810.00	0.00	0.00	0.00	810.00	f	2025-12-26 17:44:06.015522	2025-12-26 17:44:06.015522
19	80	500.00	0.00	0.00	0.00	500.00	t	2025-12-26 17:52:19.512441	2025-12-26 17:52:19.512441
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

SELECT pg_catalog.setval('public.claim_actions_id_seq', 1, false);


--
-- Name: exam_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exam_staff_id_seq', 1, false);


--
-- Name: exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exams_id_seq', 80, true);


--
-- Name: external_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.external_documents_id_seq', 1, false);


--
-- Name: faculty_bank_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faculty_bank_accounts_id_seq', 1, false);


--
-- Name: remuneration_calculations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.remuneration_calculations_id_seq', 19, true);


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
-- Name: external_documents external_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_documents
    ADD CONSTRAINT external_documents_pkey PRIMARY KEY (id);


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
-- Name: exams exams_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id);


--
-- Name: external_documents external_documents_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_documents
    ADD CONSTRAINT external_documents_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


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

\unrestrict b4QdEZ9mFQnjUdIFK6SGgbPZ34c2EML7nXLoV3ceninAmKaUbhYmftFBYgqt3Pq

