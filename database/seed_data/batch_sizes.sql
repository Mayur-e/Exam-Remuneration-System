--
-- PostgreSQL database dump
--

\restrict Cvv9fWSO9yRmCSW1yyf9fyFINn3PnL8OdxSjSoUpI7pEyyki22OikM0vX1FD2aw

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
-- Data for Name: batch_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.batch_sizes VALUES (1, 'BTECH', 12, 20, 20, NULL, NULL, '2024-25');
INSERT INTO public.batch_sizes VALUES (3, 'BVOC', 12, 15, 15, NULL, NULL, '2024-25');
INSERT INTO public.batch_sizes VALUES (2, 'MTECH', 6, 6, 6, 6, 1, '2024-25');
INSERT INTO public.batch_sizes VALUES (7, 'BTECH', 12, 20, 20, NULL, NULL, '2025-26');
INSERT INTO public.batch_sizes VALUES (8, 'BVOC', 12, 15, 15, NULL, NULL, '2025-26');
INSERT INTO public.batch_sizes VALUES (9, 'MTECH', 6, 6, 6, 6, 1, '2025-26');
INSERT INTO public.batch_sizes VALUES (10, 'BTECH', 12, 20, 20, NULL, NULL, '2026-27');
INSERT INTO public.batch_sizes VALUES (11, 'BVOC', 12, 15, 15, NULL, NULL, '2026-27');
INSERT INTO public.batch_sizes VALUES (12, 'MTECH', 6, 6, 6, 6, 1, '2026-27');


--
-- Name: batch_sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batch_sizes_id_seq', 12, true);


--
-- PostgreSQL database dump complete
--

\unrestrict Cvv9fWSO9yRmCSW1yyf9fyFINn3PnL8OdxSjSoUpI7pEyyki22OikM0vX1FD2aw

