--
-- PostgreSQL database dump
--

\restrict aRPeKhiWlyZb7Vh93KP3hVFztVfQF7JCAcNkirdhcM5JO9eROkAtP2sPkUj8ZgC

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
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.subjects VALUES (262, 'BCE24PC03', 'Database Management System', 'Computer Engineering', 'PCC – Programme Core Course', '2026-02-13 15:43:12.702835', 'SY');
INSERT INTO public.subjects VALUES (263, 'BCE24PC04', 'Database Management System Laboratory', 'Computer Engineering', 'PCC – Programme Core Course', '2026-02-13 15:43:12.705067', 'SY');
INSERT INTO public.subjects VALUES (264, 'BSH24OE07', 'Open Elective : Computational Techniques', 'Computer Engineering', 'OEC – Open Elective Course', '2026-02-13 15:43:12.706546', 'SY');
INSERT INTO public.subjects VALUES (265, 'BCE24EL01', 'Community Engagement Project (CEP) Field Project (FP)', 'Computer Engineering', 'ELC – Experiential Learning Course', '2026-02-13 15:43:12.707551', 'SY');
INSERT INTO public.subjects VALUES (266, 'BSH24EM02', 'EEM : Designing Thinking & Innovation Management', 'Computer Engineering', 'HSSM – Entrepreneurship/Economics/Management', '2026-02-13 15:43:12.709126', 'SY');
INSERT INTO public.subjects VALUES (267, 'BSH24AE05', 'Professional Development Training', 'Computer Engineering', 'AEC – Ability Enhancement Course', '2026-02-13 15:43:12.710214', 'SY');
INSERT INTO public.subjects VALUES (268, 'BSH24EM03', 'EEM : Project Management', 'Computer Engineering', 'HSSM – Entrepreneurship/Economics/Management', '2026-02-13 15:43:12.711294', 'SY');
INSERT INTO public.subjects VALUES (269, 'BSH24EM05', 'EEM : Business Finance for Engineers', 'Computer Engineering', 'HSSM – Entrepreneurship/Economics/Management', '2026-02-13 15:43:12.712712', 'SY');
INSERT INTO public.subjects VALUES (270, 'BIT24MD02', 'Augmented Reality', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.714336', 'SY');
INSERT INTO public.subjects VALUES (271, 'BME24MD22', 'Ergonomic and Aesthetic in Design', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.715369', 'SY');
INSERT INTO public.subjects VALUES (272, 'BME24MD12', 'Business Ideation and Design Thinking', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.716325', 'SY');
INSERT INTO public.subjects VALUES (273, 'BET24MD11', 'Technologies Enabling IoT', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.717368', 'SY');
INSERT INTO public.subjects VALUES (274, 'BCS24MD02', 'Generative AI Models', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.718567', 'SY');
INSERT INTO public.subjects VALUES (275, 'BCE24MD02', 'Digital Marketing Using Social Media', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.719856', 'SY');
INSERT INTO public.subjects VALUES (276, 'BCI24MD02', 'Smart Cities', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.721243', 'SY');
INSERT INTO public.subjects VALUES (277, 'BSH24MD14', 'Module 1- Japanese Fluency Primer', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.722638', 'SY');
INSERT INTO public.subjects VALUES (278, 'BSH24MD08', 'German for Technical Purposes', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.724', 'SY');
INSERT INTO public.subjects VALUES (279, 'BSH24MD02', 'Science Fiction and Technology in Literature', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.725295', 'SY');
INSERT INTO public.subjects VALUES (280, 'BSH24MD26', 'Introduction to Sanskrit Epics', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.726631', 'SY');
INSERT INTO public.subjects VALUES (281, 'BSH24MD32', 'माध्यमातील मराठी', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.727881', 'SY');
INSERT INTO public.subjects VALUES (282, 'BCE26PC01', 'Operating System', 'Computer Engineering', 'PCC – Programme Core Course', '2026-02-13 15:43:12.729452', 'TY');
INSERT INTO public.subjects VALUES (283, 'BCE26PC02', 'Design and Analysis of Algorithms', 'Computer Engineering', 'PCC – Programme Core Course', '2026-02-13 15:43:12.730621', 'TY');
INSERT INTO public.subjects VALUES (284, 'BCE26PC03', 'Software Engineering', 'Computer Engineering', 'PCC – Programme Core Course', '2026-02-13 15:43:12.732028', 'TY');
INSERT INTO public.subjects VALUES (285, 'BCE26PE01', 'Program Elective : Deep Learning', 'Computer Engineering', 'PEC – Programme Elective Course', '2026-02-13 15:43:12.733196', 'TY');
INSERT INTO public.subjects VALUES (286, 'BCE26PE02', 'Program Elective : Blockchain Technology', 'Computer Engineering', 'PEC – Programme Elective Course', '2026-02-13 15:43:12.734231', 'TY');
INSERT INTO public.subjects VALUES (287, 'BCE26PE03', 'Program Elective : UI and UX Design', 'Computer Engineering', 'PEC – Programme Elective Course', '2026-02-13 15:43:12.735432', 'TY');
INSERT INTO public.subjects VALUES (288, 'BCE26PE04', 'Program Elective : Cloud Computing', 'Computer Engineering', 'PEC – Programme Elective Course', '2026-02-13 15:43:12.736577', 'TY');
INSERT INTO public.subjects VALUES (289, 'BCE26PE05', 'Program Elective : Cyber Security and Forensics', 'Computer Engineering', 'PEC – Programme Elective Course', '2026-02-13 15:43:12.737863', 'TY');
INSERT INTO public.subjects VALUES (290, 'BCE26VS01', 'Full Stack Development', 'Computer Engineering', 'VSEC – Vocational & Skill Enhancement', '2026-02-13 15:43:12.739011', 'TY');
INSERT INTO public.subjects VALUES (291, 'BSH26MD05', 'Literary Classics', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.740159', 'TY');
INSERT INTO public.subjects VALUES (292, 'BSH26MD11', 'Exploring Germany', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.741215', 'TY');
INSERT INTO public.subjects VALUES (293, 'BSH26MD17', 'Introduction to intermediate Japanese', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.742644', 'TY');
INSERT INTO public.subjects VALUES (294, 'BSH26MD23', 'Human Economics', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.743768', 'TY');
INSERT INTO public.subjects VALUES (295, 'BCE26MD05', 'Fundamentals of E-commerce', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.74525', 'TY');
INSERT INTO public.subjects VALUES (296, 'BCS26MD05', 'Generative AI Applications', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.746197', 'TY');
INSERT INTO public.subjects VALUES (297, 'BET26MD11', 'Industrial IoT', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.747216', 'TY');
INSERT INTO public.subjects VALUES (298, 'BME26MD15', 'Startup and New Venture Management', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.748468', 'TY');
INSERT INTO public.subjects VALUES (299, 'BME26MD25', 'Design for X and sustainbility', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.749685', 'TY');
INSERT INTO public.subjects VALUES (300, 'BIT26MD05', 'X-Reality Technologies and Applications', 'Computer Engineering', 'MDM – Multidisciplinary Minor', '2026-02-13 15:43:12.750784', 'TY');
INSERT INTO public.subjects VALUES (301, 'BCE26HN01', 'Advanced Deep Learning', 'Computer Engineering', 'HN – Honors Course', '2026-02-13 15:43:12.751954', 'TY');
INSERT INTO public.subjects VALUES (302, 'BCE26HN02', 'Advanced Deep Learning Laboratory', 'Computer Engineering', 'HN – Honors Course', '2026-02-13 15:43:12.753069', 'TY');
INSERT INTO public.subjects VALUES (303, 'BCE26HN03', 'Advance Security and Digital Forensics', 'Computer Engineering', 'HN – Honors Course', '2026-02-13 15:43:12.754186', 'TY');
INSERT INTO public.subjects VALUES (304, 'BCE26HN04', 'Cyber Forensics Laboratory', 'Computer Engineering', 'HN – Honors Course', '2026-02-13 15:43:12.755706', 'TY');
INSERT INTO public.subjects VALUES (305, 'BCE6414', 'Operating Systems', 'Computer Engineering', 'PCC – Programme Core Course (Reg. 2020)', '2026-02-13 15:43:12.757104', 'TY');
INSERT INTO public.subjects VALUES (306, 'BHM6114', 'HSMC-VI: Project Management', 'Computer Engineering', 'HSMC – Humanities/Social/Management', '2026-02-13 15:43:12.758154', 'TY');
INSERT INTO public.subjects VALUES (307, 'BCE6415', 'Operating Systems Laboratory', 'Computer Engineering', 'PCC – Programme Core Course (Reg. 2020)', '2026-02-13 15:43:12.759064', 'TY');
INSERT INTO public.subjects VALUES (308, 'BCE6416', 'Skill Development Laboratory - I', 'Computer Engineering', 'LS – Life Skill / Skill Development', '2026-02-13 15:43:12.760166', 'TY');
INSERT INTO public.subjects VALUES (309, 'BCE6417', 'Technical Seminar - II', 'Computer Engineering', 'LS – Life Skill / Seminar', '2026-02-13 15:43:12.761384', 'TY');
INSERT INTO public.subjects VALUES (310, 'BCE6513', 'Professional Elective: Software Project Management', 'Computer Engineering', 'PEC – Programme Elective Course', '2026-02-13 15:43:12.762562', 'TY');
INSERT INTO public.subjects VALUES (311, 'BCE6514', 'Project Based Learning - IV', 'Computer Engineering', 'PROJ – Project Based Learning', '2026-02-13 15:43:12.763612', 'TY');
INSERT INTO public.subjects VALUES (312, 'BCI6604A', 'Open Elective : Smart Cities and Building Automations', 'Computer Engineering', 'OEC – Open Elective Course', '2026-02-13 15:43:12.764562', 'TY');
INSERT INTO public.subjects VALUES (313, 'BCE6916', 'Proficiency Course: Advanced JAVA Programming - II', 'Computer Engineering', 'PFC – Proficiency Course', '2026-02-13 15:43:12.765469', 'TY');
INSERT INTO public.subjects VALUES (314, 'BHM6918', 'Professional Development Training-II', 'Computer Engineering', 'LS – Life Skill', '2026-02-13 15:43:12.766372', 'TY');
INSERT INTO public.subjects VALUES (315, 'BHM9961', 'Audit Course: Environmental Science', 'Computer Engineering', 'AC – Audit Course', '2026-02-13 15:43:12.767617', 'TY');
INSERT INTO public.subjects VALUES (316, 'BCE6508', 'Professional Elective: Machine Learning', 'Computer Engineering', 'PEC – Programme Elective Course', '2026-02-13 15:43:12.768589', 'TY');
INSERT INTO public.subjects VALUES (317, 'BET6602', 'Open Elective: Basics of Automotive Electronics', 'Computer Engineering', 'OEC – Open Elective Course', '2026-02-13 15:43:12.769619', 'TY');
INSERT INTO public.subjects VALUES (259, 'BCE24PC01', 'Advanced Data Structures', 'Computer Engineering', 'PCC – Programme Core Course', '2026-02-13 15:43:12.679871', 'SY');
INSERT INTO public.subjects VALUES (260, 'BSH24VE02', 'Constitution of India', 'Computer Engineering', 'VEC – Value Education Course', '2026-02-13 15:43:12.698318', 'SY');
INSERT INTO public.subjects VALUES (261, 'BCE24PC02', 'Advanced Data Structures Laboratory', 'Computer Engineering', 'PCC – Programme Core Course', '2026-02-13 15:43:12.700269', 'SY');
INSERT INTO public.subjects VALUES (318, 'BCE8801', 'Internship', 'Computer Engineering', 'INTR – Internship', '2026-02-13 15:43:12.770699', 'BTech');
INSERT INTO public.subjects VALUES (319, 'BCE8701', 'Major Project', 'Computer Engineering', 'PROJ – Major Project', '2026-02-13 15:43:12.772714', 'BTech');
INSERT INTO public.subjects VALUES (320, 'HCE8982', 'Project Stage - II', 'Computer Engineering', 'PROJ – Project', '2026-02-13 15:43:12.773785', 'BTech');
INSERT INTO public.subjects VALUES (321, 'HCE8985', 'Project', 'Computer Engineering', 'PROJ – Project', '2026-02-13 15:43:12.774799', 'BTech');


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_id_seq', 321, true);


--
-- PostgreSQL database dump complete
--

\unrestrict aRPeKhiWlyZb7Vh93KP3hVFztVfQF7JCAcNkirdhcM5JO9eROkAtP2sPkUj8ZgC

