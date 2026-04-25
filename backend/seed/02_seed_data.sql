--
-- PostgreSQL database dump
--

\restrict OM6Iteq9oMn45w1CGZoiaRFbf5Xv9fNcaGaexPLz1XbNVbw6W4Q6SQ4mtdXKU3n

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

COPY public.batch_sizes (id, program, practical_size, oral_size, termwork_size, project_oral_size, dissertation_size, academic_year) FROM stdin;
1	BTECH	12	20	20	\N	\N	2024-25
3	BVOC	12	15	15	\N	\N	2024-25
2	MTECH	6	6	6	6	1	2024-25
7	BTECH	12	20	20	\N	\N	2025-26
8	BVOC	12	15	15	\N	\N	2025-26
9	MTECH	6	6	6	6	1	2025-26
10	BTECH	12	20	20	\N	\N	2026-27
11	BVOC	12	15	15	\N	\N	2026-27
12	MTECH	6	6	6	6	1	2026-27
\.


--
-- Data for Name: remuneration_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.remuneration_rates (id, exam_type, fy_sy_rate, ty_final_rate, mtech_mca_rate, min_per_day, academic_year) FROM stdin;
56	Audit_Course	5.00	6.00	5.00	250.00	2025-26
57	BTech_Project_Stage1	\N	100.00	\N	500.00	2025-26
58	BTech_Project_Stage2	\N	200.00	\N	500.00	2025-26
59	MCA_MajorProject	\N	\N	250.00	500.00	2025-26
60	MCA_MiniProject	\N	\N	58.00	500.00	2025-26
61	MTech_Dissertation	\N	\N	490.00	500.00	2025-26
62	MTech_MiniProject	\N	\N	125.00	500.00	2025-26
63	MTech_Project_Stage1	\N	\N	260.00	500.00	2025-26
64	MTech_Seminar	\N	\N	125.00	500.00	2025-26
65	OR	18.00	25.00	30.00	500.00	2025-26
66	PR	30.00	35.00	58.00	500.00	2025-26
67	Project_Seminar_MiniProject	\N	58.00	\N	500.00	2025-26
69	Audit_Course	5.00	6.00	5.00	250.00	2026-27
70	BTech_Project_Stage1	\N	97.00	\N	500.00	2026-27
71	BTech_Project_Stage2	\N	200.00	\N	500.00	2026-27
72	MCA_MajorProject	\N	\N	250.00	500.00	2026-27
73	MCA_MiniProject	\N	\N	58.00	500.00	2026-27
74	MTech_Dissertation	\N	\N	490.00	500.00	2026-27
75	MTech_MiniProject	\N	\N	125.00	500.00	2026-27
76	MTech_Project_Stage1	\N	\N	260.00	500.00	2026-27
77	MTech_Seminar	\N	\N	125.00	500.00	2026-27
78	OR	18.00	25.00	30.00	500.00	2026-27
79	PR	30.00	35.00	58.00	500.00	2026-27
80	Project_Seminar_MiniProject	\N	58.00	\N	500.00	2026-27
81	TW	18.00	25.00	30.00	500.00	2026-27
16	Audit_Course	5.00	5.00	5.00	250.00	2024-25
8	BTech_Project_Stage1	\N	100.00	\N	500.00	2024-25
9	BTech_Project_Stage2	\N	200.00	\N	500.00	2024-25
15	MCA_MajorProject	\N	\N	250.00	500.00	2024-25
14	MCA_MiniProject	\N	\N	58.00	500.00	2024-25
13	MTech_Dissertation	\N	\N	490.00	500.00	2024-25
10	MTech_MiniProject	\N	\N	125.00	500.00	2024-25
12	MTech_Project_Stage1	\N	\N	260.00	500.00	2024-25
11	MTech_Seminar	\N	\N	125.00	500.00	2024-25
2	OR	18.00	25.00	30.00	500.00	2024-25
1	PR	30.00	35.00	58.00	500.00	2024-25
4	Project_Seminar_MiniProject	\N	58.00	\N	500.00	2024-25
3	TW	18.00	25.00	30.00	500.00	2024-25
68	TW	18.00	25.00	30.00	500.00	2025-26
\.


--
-- Data for Name: staff_role_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_role_rates (staff_role, preparation_rate, per_batch_rate, cleaning_rate, academic_year) FROM stdin;
Expert Assistant	0.00	125.00	0.00	2024-25
Foreman	70.00	70.00	70.00	2024-25
Laboratory/Technical Assistant	70.00	70.00	70.00	2024-25
Peon	60.00	60.00	60.00	2024-25
Expert Assistant	0.00	125.00	0.00	2025-26
Foreman	70.00	70.00	70.00	2025-26
Laboratory/Technical Assistant	70.00	70.00	70.00	2025-26
Peon	60.00	60.00	60.00	2025-26
Expert Assistant	0.00	125.00	0.00	2026-27
Foreman	70.00	70.00	70.00	2026-27
Laboratory/Technical Assistant	70.00	70.00	70.00	2026-27
Peon	60.00	60.00	60.00	2026-27
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, department, is_active, created_at, prn, google_id, has_set_password, mobile, pan_card, emp_code) FROM stdin;
10	184_Mayuresh	mayuresh.mandalik24@pccoepune.org	$2b$10$Abzo6cuRDMVpiZRa9YHW.u1wTWf/BbWUVjcPuNxMCNGD/kTvVfy.m	FACULTY	Information Technology	t	2026-01-22 00:26:40.323688	124B1B184	105414747212182661365	t	\N	\N	\N
15	mayure	mayure123@pccoepune.org	$2b$10$wtirOjpxiqnQSCk5iFZUmukyXpFdZIe2ongZwnohGrndSw7CSx/SO	FACULTY	Computer Engineering	t	2026-03-04 01:57:00.079047	123456	\N	t	\N	\N	\N
14	mayur	mayur123@pccoepune.org	$2b$10$kTd3xzelSrJCVTEDsnLm5euap/ODNj5J2tnZgx3JQjLWc5dhF4klq	FACULTY	Information Technology Engineering	t	2026-03-04 01:51:10.296159	\N	\N	t	\N	\N	\N
30	HARSHA VINAYAK TALELE	harsh.talele@pccoepune.org	$2b$10$rUdQUGSdxoTiYp/htjmb5uIrfMJqtUEITHDD9QIMlFRomyRA5fRZq	FACULTY	Computer Engineering	t	2026-04-23 15:43:04.751629	\N	\N	t	9099983816	AKZPT8628A	\N
31	DEEPALI RAVINDRA JAWALE	deepali.jawale@pccoepune.org	$2b$10$LkahW0zPXIQfJiPna/QWA.PyMDFffua.jFXQaNZMLC0w08R5GsCoG	FACULTY	Computer Engineering	t	2026-04-23 15:43:04.859377	\N	\N	t	9561381703	AMDPJ0092L	\N
32	MANISHA DNYANESHWAR PAWAR	manisha.pawar@pccoepune.org	$2b$10$d.6YrR0qXkalsN.GMV.dROm2MQkhdU8wA3042m45Ixai1Q2Yul7T2	FACULTY	Computer Engineering	t	2026-04-23 15:43:04.962189	\N	\N	t	7972364918	BCMPP1901J	\N
33	ROHINI SHIVAJI TAMBE	rohini.tambe@pccoepune.org	$2b$10$IdrkIIgIbdByHef8JystBeq4dp3qE9.pWnnTdxb7IG5Kzk4C8F4Q6	FACULTY	Computer Engineering	t	2026-04-23 15:43:05.066228	\N	\N	t	7972541768	BZGPT3930G	\N
5	mayuresh	mayuresh@pccoepune.org	$2b$10$0Sn6PWGZNyY0JyLPyIu/H.3fLdlOIBoz6dpN0E7Fdy9nLeFEepRES	FACULTY	Computer Engineering	t	2025-12-21 11:47:14.68075	184	\N	t	8799797880	ABCD1234F	\N
34	SHRIYA GANESH MUNDHE	shriya.mundhe@pccoepune.org	$2b$10$P7O0jGIyTX9Nt6T5nMF48.nd/RJ8OCfg8fMLbQHCR3kDRVaKFbPn.	FACULTY	Computer Engineering	t	2026-04-23 15:43:05.170503	\N	\N	t	7385906819	AOOPJ4890F	\N
35	SONIKA  GILL	sonika.gill@pccoepune.org	$2b$10$bwx5WOVBE3dGPGpTvYtxbOgTqFV5jLlocBN1w7VXnVROx4tVZlcKW	FACULTY	Computer Engineering	t	2026-04-23 15:43:05.274527	\N	\N	t	9172263722	AROPG9195K	\N
36	DIPALI MANISH PATIL	dipali.patil@pccoepune.org	$2b$10$i5MBagmreA2.TJE92i9McOExHOkGcCBnqshDl4VmHlHwUKucE/rJW	FACULTY	Computer Engineering	t	2026-04-23 15:43:05.383212	\N	\N	t	8669663655	BSKPP7683P	\N
37	TRUPTI TUSHAR DESHMUKH	trupti.deshmukh@pccoepune.org	$2b$10$Qz/tHdhxktffVFIQHEic2uG8qw49WqV5RMwR0ZxOyX4m1Qga8Kc6y	FACULTY	Computer Engineering	t	2026-04-23 15:43:05.487756	\N	\N	t	7218456574	CJMPP4527Q	\N
38	SUVARNA GANESH PATIL	suvarna.patil@pccoepune.org	$2b$10$Y6Eza5uIWgQESTmqduQ8d.0Ihx2EsnMwCVKzdBsx6eKvMp71/nTgm	FACULTY	Computer Engineering	t	2026-04-23 15:43:05.590469	\N	\N	t	7588735942	BNDPP2068L	\N
16	rajesh	rajesh123@pccoepune.org	$2b$10$Q1x7YOFt.7YRbIHxpsh7de4A32qK4XVkC8fMAy51/73Vo.WFtwfty	FACULTY	Computer Engineering	t	2026-03-04 01:58:00.370874	1234567	\N	t	\N	\N	\N
2	System Admin	admin@pccoepune.org	$2b$10$waot4QlrzaekRUtr/Q7d4ullk48ED1sVmPoWm9dWSft6nYlZ0xuDe	ADMIN	\N	t	2025-12-18 17:24:19.936147	\N	\N	t	\N	\N	\N
17	KIRTI RAMKISHAN NAGARGOJE	kirti.nagargoge@pccoepune.org	$2b$10$osHut07OOiddWDe2LtqeIe8b/h27XjtvbucA5aEPK4NJoxOeZWWAu	FACULTY	Computer Engineering	t	2026-04-23 15:43:03.399737	\N	\N	t	7709424198	ARGPN5135N	\N
6	Faculty	faculty@pccoepune.org	$2b$10$co8N9QM6PDPCmGh2j5Vg5eEth2yW9CbwCqJq/GcqR0ZpvDdAietuq	FACULTY	Mechanical	t	2025-12-21 12:20:10.695061	\N	\N	t	\N	\N	\N
18	SHRADDHA VIJAY OVALE	shraddha.ovale@pccoepune.org	$2b$10$2nNl2QIDJ8g0Fcs8AvFhX.P7DERZe55Y3FLLcXyF3LL1P1KFGEEwC	FACULTY	Computer Engineering	t	2026-04-23 15:43:03.512901	\N	\N	t	8378980300	BOVPK0185C	\N
19	SHAILESH BALASAHEB GALANDE	shailesh.galande@pccoepune.org	$2b$10$V1eNkr3TtpKoslNQPVfboOfsbd097gHPO6qTmip3EWU3g8nuOLb0W	FACULTY	Computer Engineering	t	2026-04-23 15:43:03.620147	\N	\N	t	9860503703	ARRPG8402E	\N
3	Billing Incharge	accounts@pccoepune.org	$2b$10$waot4QlrzaekRUtr/Q7d4ullk48ED1sVmPoWm9dWSft6nYlZ0xuDe	BILLING_INCHARGE	Computer Engineering	t	2025-12-18 17:24:19.936147	\N	\N	t	\N	\N	\N
20	GEETANJALI  SHARMA	geetanjali.sharma@pccoepune.org	$2b$10$XWJdVhtWbc7DFp/TDcMjlOKvNR9SAoSuovcSpfMYxMW.9XWcwTbd6	FACULTY	Computer Engineering	t	2026-04-23 15:43:03.724535	\N	\N	t	8550966332	BCYPS1550A	\N
11	dsaone	dsa1@pccoepune.org	$2b$10$dv9fgix9IzCIbJ4fFt9SWexXW5ZCUwVsnw1JBgtjyjBe8nslC16p.	FACULTY	Computer Engineering	t	2026-02-10 09:02:45.748706	\N	\N	t	\N	\N	\N
13	billing IT	billingit@pccoepune.org	$2b$10$O8csaKq.gpYrdCObemOKoOwRXB83Q/5e9kSGm/nwujp8xOk.dpzYy	BILLING_INCHARGE	Information Technology	t	2026-02-18 09:33:46.103246	\N	\N	t	\N	\N	\N
12	dsatwo	dsa2@pccoepune.org	$2b$10$pkGfs1hbczW1Za/FtGYo4OWDuKxBPnGvOIdatZszUZ9f6P1hSQ6xm	FACULTY	Computer Engineering	t	2026-02-18 09:33:09.773234	\N	\N	t	\N	\N	\N
21	SARIKA TANAJI DEOKATE	sarika.deokate@pccoepune.org	$2b$10$JOHvHPHIZxUpJj4G87spwegtDqLt4XtOnKNTRr24aRkXCtGYbXgim	FACULTY	Computer Engineering	t	2026-04-23 15:43:03.83079	\N	\N	t	7972824629	AKHPD3469M	\N
22	AMOL VIJAY PATIL	amol.patil@pccoepune.org	$2b$10$3y.8SjkLGMPqU3gntKpEIeB4Pgmnb7F44gUPgoLl9iRkFB4sL5Q/S	FACULTY	Computer Engineering	t	2026-04-23 15:43:03.927618	\N	\N	t	9588408374	BFXPP2302F	\N
23	OMKARESH SAKHARAM KULKARNI	omkaresh.kulkarni@pccoepune.org	$2b$10$/uPNNWzjsdqTByL3CQRKpeeEbqcs6QDLUuhyDKnTx3HDo50BVTG8m	FACULTY	Computer Engineering	t	2026-04-23 15:43:04.032452	\N	\N	t	7798883600	ANJPK9998F	\N
24	DHANASHREE VITTHALRAV PATIL	dhanashree.patil@pccoepune.org	$2b$10$Au8xUR6Pl/ww7QC9j6dPXOaIFtX1irMXeGXNv7q0ovWZ0GT9tNsPq	FACULTY	Computer Engineering	t	2026-04-23 15:43:04.136531	\N	\N	t	8605796168	BNAPP3757K	\N
39	DR.AMBALA  SRINIVAS	ambala.srinivas@pccoepune.org	$2b$10$IM6Oo5lw0yq6239VuGChiOe5/WsZX0NVCm7WdmVSA.OL0Tec5Nt5.	FACULTY	Computer Engineering	t	2026-04-23 15:43:05.694257	\N	\N	t	9494512400	BPPPS9738Q	\N
25	SHIVANI  PANDEY	shivani.pandey@pccoepune.org	$2b$10$O8OqXmhKomEbbEtwxDSb3OqY20JJ9tDz.LEzsPtQaE/VUbUEvy44a	FACULTY	Computer Engineering	t	2026-04-23 15:43:04.244984	\N	\N	t	8979441825	CWFPP0089K	\N
26	MEHZABIN FEROZ PATHAN	mehzabin.pathan@pccoepune.org	$2b$10$bm5auYo.v1CcHZSZRCUATuweejNuoSe54C64OiZw4UdcKGDcucbXG	FACULTY	Computer Engineering	t	2026-04-23 15:43:04.348352	\N	\N	t	9763722197	ASPPP3356B	\N
27	TANYA  SHRUTI	tanya.shruti@pccoepune.org	$2b$10$l/K2KCWrBgqryaq1rsVbiuUvA0nrcrMbmYl.Irvjx/lXiYTPzoVjK	FACULTY	Computer Engineering	t	2026-04-23 15:43:04.452267	\N	\N	t	8386954387	EJXPS5335A	\N
28	AMRUTA ABHISHEK MAHAJAN	amruta.mahajan@pccoepune.org	$2b$10$JUdOIrvivdpnz1.XMoQ7.uzPmlOpHYF4TxmucUKtPfq.MGiw/Uhya	FACULTY	Computer Engineering	t	2026-04-23 15:43:04.555783	\N	\N	t	8983002525	BPVPA7678R	\N
29	ASHWINI SANJEEV MATANGE	ashwini.matange@pccoepune.org	$2b$10$uTaGOcPEnwJddrLUtj2zZeIviSusuoaDPkTFL85ee5VvpucMiI8si	FACULTY	Computer Engineering	t	2026-04-23 15:43:04.654251	\N	\N	t	9892529663	AGVPM1705H	\N
40	MUBIN SHOUKATBHAI TAMBOLI	mubin.tamboli@pccoepune.org	$2b$10$9w7noDpl/znJFscF4v4lWuY1N5XIbKpcbxJDju.r8IzLmyVeIGtmy	FACULTY	Computer Engineering	t	2026-04-23 15:43:05.798382	\N	\N	t	9766175530	AHAPT1802A	\N
41	PRAVIN SHANTARAM GAME	pravin.game@pccoepune.org	$2b$10$gt.ppV0xn1TUi/Nn2NG8yuKCB77.YdYw7crfrjRx4vMewTjec0tqy	FACULTY	Computer Engineering	t	2026-04-23 15:43:05.903552	\N	\N	t	9765608815	AIFPG3164L	\N
42	DR .APARNA SHASHIKANT JOSHI	aparna.joshi@pccoepune.org	$2b$10$horwFcytBbi4qAnV98OK3uKQIQBKeLIElOAWd2iTKR0RSBtamcLRC	FACULTY	Computer Engineering	t	2026-04-23 15:43:06.009152	\N	\N	t	9763853569	ANUPJ2108H	\N
50	GANESH VITTHAL KADAM	ganesh.kadam@pccoepune.org	$2b$10$PvCCREsoZBm72DTMEVXTs.Qm0amPc.qG4dpw5fF8w1r2I5XckG422	FACULTY	Computer Engineering	t	2026-04-23 15:43:06.859838	\N	\N	t	9970539060	AVLPK9716D	\N
51	MADHURI AMOL SURYAVANSHI	madhuri.suryavanshi@pccoepune.org	$2b$10$L9qE9.I3UIv7Ynx39KAPS.PjiUU76Mc2m0BI012Mr.9Cmq32qs81u	FACULTY	Computer Engineering	t	2026-04-23 15:43:06.968499	\N	\N	t	9822720120	BUJPD3076P	\N
54	SWATI SHAILESH CHANDURKAR	swati.chandurkar@pccoepune.org	$2b$10$RPoBTYVhJr5LXxKMmKsMlu62x99cHCqDFVFtYLFEB3EUjRpQClqJa	FACULTY	Computer Engineering	t	2026-04-23 15:43:07.283102	\N	\N	t	9970955897	AUKPB9849G	\N
55	ATUL GULABRAO PAWAR	atul.pawar@pccoepune.org	$2b$10$ptAoTwSVo04ALE6RVd07Ue4Qxj6zVsxN/kxd5rpAmuLF5muQ0rP/u	FACULTY	Computer Engineering	t	2026-04-23 15:43:07.387492	\N	\N	t	9975618971	BGWPP1261P	\N
56	SUSHMA RAHUL VISPUTE	sushma.vispute@pccoepune.org	$2b$10$GvmQhrFcuy6Zu3e.Um8DdOE/wYNfL2bm57gAgASbEHwUJvgzgdy02	FACULTY	Computer Engineering	t	2026-04-23 15:43:07.493224	\N	\N	t	9420112271	AKLPA9402H	\N
57	PRIYA AMIT SURANA	priya.surana@pccoepune.org	$2b$10$/gbPkNeHnNqbh8pJ0Et/t.0peToIJv7jzEMFfwNSgVm5BEAPQpdBa	FACULTY	Computer Engineering	t	2026-04-23 15:43:07.591308	\N	\N	t	9028848620	AVHPS7021B	\N
58	MAHALAKSHMI  BODIREDDY	mahalakshmi.bodireddy@pccoepune.org	$2b$10$sRBZe10SVscP6SbfGucvCOAvMGKtBmmL6B6E3qa.4IQ2B2rrpYTRW	FACULTY	Computer Engineering	t	2026-04-23 15:43:07.702652	\N	\N	t	8087038785	ALHPB4718L	\N
59	ARCHANA SHITAL KADAM	archana.kadam@pccoepune.org	$2b$10$ZGWUa7ca/.MVbkyy920XXes59QD1myMZQXPDdam59EVcS4Q3BxlNK	FACULTY	Computer Engineering	t	2026-04-23 15:43:07.812236	\N	\N	t	9890805528	BDNPS6491J	\N
60	HARSHADA RANGNATH MHASKE	harshada.mhaske@pccoepune.org	$2b$10$3gDIoiAxlmkdM.5nguDJQONYniwxcMv4QjrmFzUt.Xe8IXlu8RWiG	FACULTY	Computer Engineering	t	2026-04-23 15:43:07.919281	\N	\N	t	7057076132	AQFPM8942E	\N
61	ANAGHA NEELKANTH CHAUDHARI	anagha.chaudhari@pccoepune.org	$2b$10$9osvcAeriI167Jqg3wpPauUlZwqeMMX59mr2ap7s3PaEkOZnsXCU6	FACULTY	Computer Engineering	t	2026-04-23 15:43:08.032169	\N	\N	t	9881957427	AJWPC3367M	\N
62	SMITA CHETANKUMAR KHAIRNAR	smita.khairnar@pccoepune.org	$2b$10$EUGJEOhdfnNeHVgjm7xizOnfD5LqIoBK5HRSclMsrNS8qTo7uTAZq	FACULTY	Computer Engineering	t	2026-04-23 15:43:08.134356	\N	\N	t	9503998794	DSEPK4926A	\N
63	RAHUL RAVINDRA PITALE	rahul.pitale@pccoepune.org	$2b$10$3qAdQ3B0dzUopy.yTCwI0u7WL99D3ael3te5/S/vk74mS/jF7X8oS	FACULTY	Computer Engineering	t	2026-04-23 15:43:08.237034	\N	\N	t	9420240035	BLPPP6877H	\N
64	KAPIL DINKARRAO TAJANE	kapil.tajane@pccoepune.org	$2b$10$jenkGBJKWh8QCuQ/vsr37.F43QNVCFVWm8iMY9l4Qic2nJVHeVGKu	FACULTY	Computer Engineering	t	2026-04-23 15:43:08.340833	\N	\N	t	9823400036	AMBPT0942R	\N
65	ASMITA - MANNA	asmita.manna@pccoepune.org	$2b$10$Oq.dC8Eti7cJaZwXQ3OGyeq5Hz4PLOxKGwJohQR4jjg4HYWhTN1DO	FACULTY	Computer Engineering	t	2026-04-23 15:43:08.448295	\N	\N	t	8600218534	AFJPN9933M	\N
66	GOPAL DADARAO UPADHYE	gopal.upadhye@pccoepune.org	$2b$10$zGyEcGQP8vGCJnmO1z7awuTqwyJ0AQ8iwOsxTex2OGhP.s3/h0Zfm	FACULTY	Computer Engineering	t	2026-04-23 15:43:08.550415	\N	\N	t	8149373828	ABNPU5922D	\N
67	POOJA VISHAL BIDWAI	pooja.bidwai@pccoepune.org	$2b$10$FfNGPkvRHeH/kd6lEtSPvODx0QwShklRocu1BDjFx/u.5vIypD7Z6	FACULTY	Computer Engineering	t	2026-04-23 15:43:08.656103	\N	\N	t	9420667464	ARTPB6747M	\N
68	ABHISHEK SOMNATH RAUT	abhishek.raut@pccoepune.org	$2b$10$6CdeP8hyDIXxMwr9lMKaAugstt9yUk/yVTw9CzgSFD2zchAc2jD/6	FACULTY	Computer Engineering	t	2026-04-23 15:43:08.758706	\N	\N	t	9423773196	CFNPR9804R	\N
69	SUPRIYA VIKRAM MAHADEVKAR	supriya.mahadevkar@pccoepune.org	$2b$10$Q/YOkGm19oZ3Encmm1dRF.GikKX02Xf6JlJchV9adM4jxXWVY9/XC	FACULTY	Computer Engineering	t	2026-04-23 15:43:08.862454	\N	\N	t	9730968224	DNGPS4872E	\N
70	GOVINDA BAPURAO SAMBARE	santosh.sambare@pccoepune.org	$2b$10$MYvWJJpRpnzow2tWGKOpzukpn0ynCECZQQyzvQcWvvOecKhQ7G7FS	FACULTY	Computer Engineering	t	2026-04-23 15:43:08.970576	\N	\N	t	9689907628	ADWPS6521R	\N
71	REENA SHANKAR KHARAT	reena.kharat@pccoepune.org	$2b$10$bl0kk/bPuIjp31w2fH3OX.g4rLgikyXbRKw9AuZ4INUwkizP0hUQ2	FACULTY	Computer Engineering	t	2026-04-23 15:43:09.08033	\N	\N	t	9689252599	AQYPK3896J	\N
72	DR. MEGHANA PRITAM LOKHANDE	meghana.lokhande@pccoepune.org	$2b$10$PvvV40n5wP1ZIQjUNtEtseVFT1YdCO5WgFymFcpMwHnVUib0gFcMe	FACULTY	Computer Engineering	t	2026-04-23 15:43:09.252755	\N	\N	t	9823334381	ABEPI7806B	\N
73	RAJESWARI  KANNAN	kannan.rajeswari@pccoepune.org	$2b$10$uN1QEs.FdfkoMijKx8.NXu2AwU8g9U8wEU8td1JqLvmjEnBhI6U6a	FACULTY	Computer Engineering	t	2026-04-23 15:43:09.350647	\N	\N	t	7066892206	AGBPR0676G	\N
74	DR.SWATI VIJAY SHINDE	swati.shinde@pccoepune.org	$2b$10$.r994VBIT1PnW.DvEmZaBe0eLcmVNoTTGkuNwCvFJMYg92qWnbT32	FACULTY	Computer Engineering	t	2026-04-23 15:43:09.454116	\N	\N	t	7350318050	AHIPD5830G	\N
75	DR.SONALI DHANANJAY PATIL	sonali.patil@pccoepune.org	$2b$10$zB5yDKbiWYzvcQsGLwzqjeKti64vIEuE/7nagmvuXAl.cWaGTpTlC	FACULTY	Computer Engineering	t	2026-04-23 15:43:09.559434	\N	\N	t	9423527197	APYPP3856Q	\N
78	KAVITA JANARDAN KOLPE	kavita.kolpe@pccoepune.org	$2b$10$RPF0Lj01vZpNHqr938mREOqQPujEPYaDCxYLR/CMY8B3Kh5iWdrxO	FACULTY	Computer Engineering	t	2026-04-23 15:43:09.869573	\N	\N	t	8805282900	DWPPK4629M	\N
\.


--
-- Name: batch_sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batch_sizes_id_seq', 12, true);


--
-- Name: remuneration_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.remuneration_rates_id_seq', 81, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 89, true);


--
-- PostgreSQL database dump complete
--

\unrestrict OM6Iteq9oMn45w1CGZoiaRFbf5Xv9fNcaGaexPLz1XbNVbw6W4Q6SQ4mtdXKU3n

