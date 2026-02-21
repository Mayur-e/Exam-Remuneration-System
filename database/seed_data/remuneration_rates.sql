--
-- PostgreSQL database dump
--

\restrict OQYTovIx1QqQI2CPzpixhdYkdEGiepCM0wy254h6O60DaE7ibvZMCwfWeeRhgOr

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
-- Data for Name: remuneration_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.remuneration_rates VALUES (56, 'Audit_Course', 5.00, 6.00, 5.00, 250.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (57, 'BTech_Project_Stage1', NULL, 100.00, NULL, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (58, 'BTech_Project_Stage2', NULL, 200.00, NULL, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (59, 'MCA_MajorProject', NULL, NULL, 250.00, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (60, 'MCA_MiniProject', NULL, NULL, 58.00, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (61, 'MTech_Dissertation', NULL, NULL, 490.00, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (62, 'MTech_MiniProject', NULL, NULL, 125.00, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (63, 'MTech_Project_Stage1', NULL, NULL, 260.00, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (64, 'MTech_Seminar', NULL, NULL, 125.00, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (65, 'OR', 18.00, 25.00, 30.00, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (66, 'PR', 30.00, 35.00, 58.00, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (67, 'Project_Seminar_MiniProject', NULL, 58.00, NULL, 500.00, '2025-26');
INSERT INTO public.remuneration_rates VALUES (69, 'Audit_Course', 5.00, 6.00, 5.00, 250.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (70, 'BTech_Project_Stage1', NULL, 97.00, NULL, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (71, 'BTech_Project_Stage2', NULL, 200.00, NULL, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (72, 'MCA_MajorProject', NULL, NULL, 250.00, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (73, 'MCA_MiniProject', NULL, NULL, 58.00, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (74, 'MTech_Dissertation', NULL, NULL, 490.00, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (75, 'MTech_MiniProject', NULL, NULL, 125.00, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (76, 'MTech_Project_Stage1', NULL, NULL, 260.00, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (77, 'MTech_Seminar', NULL, NULL, 125.00, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (78, 'OR', 18.00, 25.00, 30.00, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (79, 'PR', 30.00, 35.00, 58.00, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (80, 'Project_Seminar_MiniProject', NULL, 58.00, NULL, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (81, 'TW', 18.00, 25.00, 30.00, 500.00, '2026-27');
INSERT INTO public.remuneration_rates VALUES (16, 'Audit_Course', 5.00, 5.00, 5.00, 250.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (8, 'BTech_Project_Stage1', NULL, 100.00, NULL, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (9, 'BTech_Project_Stage2', NULL, 200.00, NULL, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (15, 'MCA_MajorProject', NULL, NULL, 250.00, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (14, 'MCA_MiniProject', NULL, NULL, 58.00, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (13, 'MTech_Dissertation', NULL, NULL, 490.00, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (10, 'MTech_MiniProject', NULL, NULL, 125.00, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (12, 'MTech_Project_Stage1', NULL, NULL, 260.00, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (11, 'MTech_Seminar', NULL, NULL, 125.00, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (2, 'OR', 18.00, 25.00, 30.00, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (1, 'PR', 30.00, 35.00, 58.00, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (4, 'Project_Seminar_MiniProject', NULL, 58.00, NULL, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (3, 'TW', 18.00, 25.00, 30.00, 500.00, '2024-25');
INSERT INTO public.remuneration_rates VALUES (68, 'TW', 18.00, 25.00, 30.00, 500.00, '2025-26');


--
-- Name: remuneration_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.remuneration_rates_id_seq', 81, true);


--
-- PostgreSQL database dump complete
--

\unrestrict OQYTovIx1QqQI2CPzpixhdYkdEGiepCM0wy254h6O60DaE7ibvZMCwfWeeRhgOr

