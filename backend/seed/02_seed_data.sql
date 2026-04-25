--
-- PostgreSQL database dump
--

\restrict bXVOtLV16mbumEUZSygFcnq8afSoEydnE42ash7HiHWzk1zauWj6mPWAQoLaj4d

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
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (id, code, name, department, type, created_at, year) FROM stdin;
262	BCE24PC03	Database Management System	Computer Engineering	PCC – Programme Core Course	2026-02-13 15:43:12.702835	SY
263	BCE24PC04	Database Management System Laboratory	Computer Engineering	PCC – Programme Core Course	2026-02-13 15:43:12.705067	SY
264	BSH24OE07	Open Elective : Computational Techniques	Computer Engineering	OEC – Open Elective Course	2026-02-13 15:43:12.706546	SY
265	BCE24EL01	Community Engagement Project (CEP) Field Project (FP)	Computer Engineering	ELC – Experiential Learning Course	2026-02-13 15:43:12.707551	SY
266	BSH24EM02	EEM : Designing Thinking & Innovation Management	Computer Engineering	HSSM – Entrepreneurship/Economics/Management	2026-02-13 15:43:12.709126	SY
267	BSH24AE05	Professional Development Training	Computer Engineering	AEC – Ability Enhancement Course	2026-02-13 15:43:12.710214	SY
268	BSH24EM03	EEM : Project Management	Computer Engineering	HSSM – Entrepreneurship/Economics/Management	2026-02-13 15:43:12.711294	SY
269	BSH24EM05	EEM : Business Finance for Engineers	Computer Engineering	HSSM – Entrepreneurship/Economics/Management	2026-02-13 15:43:12.712712	SY
270	BIT24MD02	Augmented Reality	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.714336	SY
271	BME24MD22	Ergonomic and Aesthetic in Design	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.715369	SY
272	BME24MD12	Business Ideation and Design Thinking	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.716325	SY
273	BET24MD11	Technologies Enabling IoT	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.717368	SY
274	BCS24MD02	Generative AI Models	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.718567	SY
275	BCE24MD02	Digital Marketing Using Social Media	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.719856	SY
276	BCI24MD02	Smart Cities	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.721243	SY
277	BSH24MD14	Module 1- Japanese Fluency Primer	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.722638	SY
278	BSH24MD08	German for Technical Purposes	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.724	SY
279	BSH24MD02	Science Fiction and Technology in Literature	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.725295	SY
280	BSH24MD26	Introduction to Sanskrit Epics	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.726631	SY
281	BSH24MD32	माध्यमातील मराठी	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.727881	SY
282	BCE26PC01	Operating System	Computer Engineering	PCC – Programme Core Course	2026-02-13 15:43:12.729452	TY
283	BCE26PC02	Design and Analysis of Algorithms	Computer Engineering	PCC – Programme Core Course	2026-02-13 15:43:12.730621	TY
284	BCE26PC03	Software Engineering	Computer Engineering	PCC – Programme Core Course	2026-02-13 15:43:12.732028	TY
285	BCE26PE01	Program Elective : Deep Learning	Computer Engineering	PEC – Programme Elective Course	2026-02-13 15:43:12.733196	TY
286	BCE26PE02	Program Elective : Blockchain Technology	Computer Engineering	PEC – Programme Elective Course	2026-02-13 15:43:12.734231	TY
287	BCE26PE03	Program Elective : UI and UX Design	Computer Engineering	PEC – Programme Elective Course	2026-02-13 15:43:12.735432	TY
288	BCE26PE04	Program Elective : Cloud Computing	Computer Engineering	PEC – Programme Elective Course	2026-02-13 15:43:12.736577	TY
289	BCE26PE05	Program Elective : Cyber Security and Forensics	Computer Engineering	PEC – Programme Elective Course	2026-02-13 15:43:12.737863	TY
290	BCE26VS01	Full Stack Development	Computer Engineering	VSEC – Vocational & Skill Enhancement	2026-02-13 15:43:12.739011	TY
291	BSH26MD05	Literary Classics	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.740159	TY
292	BSH26MD11	Exploring Germany	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.741215	TY
293	BSH26MD17	Introduction to intermediate Japanese	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.742644	TY
294	BSH26MD23	Human Economics	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.743768	TY
295	BCE26MD05	Fundamentals of E-commerce	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.74525	TY
296	BCS26MD05	Generative AI Applications	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.746197	TY
297	BET26MD11	Industrial IoT	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.747216	TY
298	BME26MD15	Startup and New Venture Management	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.748468	TY
299	BME26MD25	Design for X and sustainbility	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.749685	TY
300	BIT26MD05	X-Reality Technologies and Applications	Computer Engineering	MDM – Multidisciplinary Minor	2026-02-13 15:43:12.750784	TY
301	BCE26HN01	Advanced Deep Learning	Computer Engineering	HN – Honors Course	2026-02-13 15:43:12.751954	TY
302	BCE26HN02	Advanced Deep Learning Laboratory	Computer Engineering	HN – Honors Course	2026-02-13 15:43:12.753069	TY
303	BCE26HN03	Advance Security and Digital Forensics	Computer Engineering	HN – Honors Course	2026-02-13 15:43:12.754186	TY
304	BCE26HN04	Cyber Forensics Laboratory	Computer Engineering	HN – Honors Course	2026-02-13 15:43:12.755706	TY
305	BCE6414	Operating Systems	Computer Engineering	PCC – Programme Core Course (Reg. 2020)	2026-02-13 15:43:12.757104	TY
306	BHM6114	HSMC-VI: Project Management	Computer Engineering	HSMC – Humanities/Social/Management	2026-02-13 15:43:12.758154	TY
307	BCE6415	Operating Systems Laboratory	Computer Engineering	PCC – Programme Core Course (Reg. 2020)	2026-02-13 15:43:12.759064	TY
308	BCE6416	Skill Development Laboratory - I	Computer Engineering	LS – Life Skill / Skill Development	2026-02-13 15:43:12.760166	TY
309	BCE6417	Technical Seminar - II	Computer Engineering	LS – Life Skill / Seminar	2026-02-13 15:43:12.761384	TY
310	BCE6513	Professional Elective: Software Project Management	Computer Engineering	PEC – Programme Elective Course	2026-02-13 15:43:12.762562	TY
311	BCE6514	Project Based Learning - IV	Computer Engineering	PROJ – Project Based Learning	2026-02-13 15:43:12.763612	TY
312	BCI6604A	Open Elective : Smart Cities and Building Automations	Computer Engineering	OEC – Open Elective Course	2026-02-13 15:43:12.764562	TY
313	BCE6916	Proficiency Course: Advanced JAVA Programming - II	Computer Engineering	PFC – Proficiency Course	2026-02-13 15:43:12.765469	TY
314	BHM6918	Professional Development Training-II	Computer Engineering	LS – Life Skill	2026-02-13 15:43:12.766372	TY
315	BHM9961	Audit Course: Environmental Science	Computer Engineering	AC – Audit Course	2026-02-13 15:43:12.767617	TY
316	BCE6508	Professional Elective: Machine Learning	Computer Engineering	PEC – Programme Elective Course	2026-02-13 15:43:12.768589	TY
317	BET6602	Open Elective: Basics of Automotive Electronics	Computer Engineering	OEC – Open Elective Course	2026-02-13 15:43:12.769619	TY
259	BCE24PC01	Advanced Data Structures	Computer Engineering	PCC – Programme Core Course	2026-02-13 15:43:12.679871	SY
260	BSH24VE02	Constitution of India	Computer Engineering	VEC – Value Education Course	2026-02-13 15:43:12.698318	SY
261	BCE24PC02	Advanced Data Structures Laboratory	Computer Engineering	PCC – Programme Core Course	2026-02-13 15:43:12.700269	SY
318	BCE8801	Internship	Computer Engineering	INTR – Internship	2026-02-13 15:43:12.770699	BTech
319	BCE8701	Major Project	Computer Engineering	PROJ – Major Project	2026-02-13 15:43:12.772714	BTech
320	HCE8982	Project Stage - II	Computer Engineering	PROJ – Project	2026-02-13 15:43:12.773785	BTech
321	HCE8985	Project	Computer Engineering	PROJ – Project	2026-02-13 15:43:12.774799	BTech
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
-- Data for Name: course_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_assignments (id, faculty_id, academic_year, semester, is_active, created_at, updated_at, course_id) FROM stdin;
11	5	2024-25	I	f	2026-02-22 10:37:17.282424	2026-02-22 10:49:32.73531	259
12	5	2025-26	I	f	2026-02-22 10:37:32.606553	2026-03-28 09:18:35.158795	259
16	5	2025-26	I	t	2026-03-28 09:32:15.056308	2026-03-28 09:32:15.056308	259
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, code, name, department, created_at, updated_at) FROM stdin;
1	BIT23PC01	Data Structures	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
2	BIT23PC02	Data Structures Laboratory	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
3	BIT23PC03	Computer Organization and Architecture	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
4	BIT23PC05	Object-Oriented Programming	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
5	BIT23VS01	Data Science Laboratory	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
6	BIT24PC01	Computer Networks Technology	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
7	BIT24PC02	Computer Networks Technology Laboratory	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
8	BIT24PC03	Database Management System	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
9	BIT24PC04	Database Management System Laboratory	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
10	BIT24EL01	Community Engagement Project	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
11	BCI23OE01	E-Waste Management	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
12	BCI23OE02	Total Quality Management	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
13	BCI23OE03	Building Services and Maintenance	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
14	BET23OE01	Electrical Machines	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
15	BET23OE02	Introduction to Signals and Systems	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
16	BET23OE03	Biology for Engineers	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
17	BME23OE01	Material Science	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
18	BME23OE02	Drawing for Engineers	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
19	BME23OE03	Fundamentals of Mechanical Components and Systems	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
20	BME23OE04	Industry 4.0	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
21	BME23OE05	Energy Storage Management	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
22	BSH23EM01	Business Studies for Engineers	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
23	BSH23VE01	Universal Human Values	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
28	BSH24EM04	Fostering Entrepreneurship and Startups	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
30	BSH24OE01	Applied Mathematics (Mechanical)	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
31	BSH24OE02	Computational Techniques (E&TC)	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
32	BSH24OE03	Applied Mathematics (Civil)	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
34	BSH24OE08	Mathematical Optimization (CSE-AIML)	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
35	BSH23OE04	Statistical Data Analysis using R	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
36	BSH23OE05	Advanced Materials & Characterizations	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
37	BSH23OE06	Neural Network and Fuzzy Logic Control	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
38	BCE23OE03	Android App Development with Kotlin	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
39	BCS23OE01	AI for Financial Modelling	Computer Science & Engineering (AIML)	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
40	BIT25PC01	Artificial Intelligence and Machine Learning	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
41	BIT25PC02	Artificial Intelligence and Machine Learning Laboratory	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
42	BIT25PC03	Design and Analysis of Algorithms	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
43	BIT25PC04	Design and Analysis of Algorithms Laboratory	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
44	BIT25PC05	Software Engineering and Modeling Laboratory	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
45	BIT25PE01	Fundamentals of Digital Image Processing (PEC-1)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
46	BIT25PE04	Fundamentals of Digital Image Processing Laboratory (PEC-1)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
47	BIT25PE02	Software Project Management (PEC-1)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
48	BIT25PE05	Software Project Management Laboratory (PEC-1)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
49	BIT25PE03	Engineering a Cloud (PEC-1)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
50	BIT25PE06	Engineering a Cloud Laboratory (PEC-1)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
51	BIT26PC01	Operating Systems	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
52	BIT26PC02	Operating Systems Laboratory	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
53	BIT26PC03	Automata Theory	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
54	BIT26PC04	Seminar	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
55	BIT26VS01	DevOps Laboratory	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
56	BIT26PE01	Deep Learning (PEC-2)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
57	BIT26PE04	Deep Learning Laboratory (PEC-2)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
58	BIT26PE02	Full Stack Development (PEC-2)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
59	BIT26PE05	Full Stack Development Laboratory (PEC-2)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
60	BIT26PE03	Internet of Things (PEC-2)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
61	BIT26PE06	Internet of Things Laboratory (PEC-2)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
62	BIT26PE07	Natural Language Processing (PEC-3)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
63	BIT26PE10	Natural Language Processing Laboratory (PEC-3)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
64	BIT26PE08	Software Testing and Quality Assurance (PEC-3)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
65	BIT26PE11	Software Testing and Quality Assurance Laboratory (PEC-3)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
66	BIT26PE09	Application of Routing Algorithms (PEC-3)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
67	BIT26PE12	Application of Routing Algorithms Laboratory (PEC-3)	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
68	BIT7401	Cryptography & Networks Security	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
69	BIT8401	Cryptography & Networks Security	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
70	BIT7402	Object Oriented Modeling and Design	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
71	BIT8402	Object Oriented Modeling and Design	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
72	BIT7403	Cryptography & Networks Security Lab	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
73	BIT8403	Cryptography & Networks Security Lab	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
74	BIT7404	Object Oriented Modeling and Design Lab	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
75	BIT8404	Object Oriented Modeling and Design Lab	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
76	BIT7501	Virtualization	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
77	BIT8501	Virtualization	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
78	BIT7502	Natural Language Processing	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
79	BIT8502	Natural Language Processing	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
80	BIT7503	Augmented and Virtual Reality	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
81	BIT8503	Augmented and Virtual Reality	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
82	BIT7504	Block chain Platform	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
83	BIT8504	Block chain Platform	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
84	BIT7505	Business Intelligence	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
85	BIT8505	Business Intelligence	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
86	BIT7506	DevOps	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
87	BIT8506	DevOps	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
88	BIT7701	Project	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
89	BIT8701	Project	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
90	BIT7702	Project Stage-I	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
91	BIT8702	Project Stage-II	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
92	BIT7603	MOOC	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
93	BIT8603	MOOC	Information Technology	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
94	BCE23PC01	Data Structures	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
95	BCE23PC02	Data Structures Laboratory	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
96	BCE23PC03	Computer Organization and Architecture	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
97	BCE23PC05	Object-Oriented Programming	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
98	BCE23VS01	Data Science Laboratory	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
99	BCE24PC01	Computer Networks Technology	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
100	BCE24PC02	Computer Networks Technology Laboratory	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
101	BCE24PC03	Database Management System	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
102	BCE24PC04	Database Management System Laboratory	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
103	BCE24EL01	Community Engagement Project	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
104	BET25OE02	Engineering Psychology	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
105	BME25OE01	Unmanned Aerial Vehicle	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
106	BME25OE02	Industrial Engineering	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
107	BME25OE03	Lean Six Sigma	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
108	BME25OE04	Safety, Health and Environment	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
109	BME25OE05	Battery Technologies for Electric Vehicles	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
110	BCE25OE01	Digital Marketing	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
111	BCE25OE02	Data Security Resiliency and Governance	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
112	BCI7605A	E-waste management	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
113	BCI8605A	E-waste management	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
114	BCI7605B	Advanced Instrumentation in Infrastructural Engineering	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
115	BCI8605B	Advanced Instrumentation in Infrastructural Engineering	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
116	BCI7606A	3-D printing technique for construction	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
117	BCI8606A	3-D printing technique for construction	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
118	BCI7606B	Structural Health Monitoring and Audit	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
119	BCI8606B	Structural Health Monitoring and Audit	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
120	BET7601	Bio-Inspired Systems and Computing	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
121	BET8601	Bio-Inspired Systems and Computing	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
122	BET7602	Sensor and Automation with IoT	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
123	BET8602	Sensor and Automation with IoT	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
124	BET7604	Drone Technology	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
125	BET8604	Drone Technology	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
126	BET7605	Advanced Driver Assistance Systems	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
127	BET8605	Advanced Driver Assistance Systems	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
128	BME7605A	Project Management & Governance	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
129	BME8605A	Project Management & Governance	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
130	BME7605B	Industrial Engineering	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
131	BME8605B	Industrial Engineering	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
132	BME7606A	Lean Six Sigma	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
133	BME8606A	Lean Six Sigma	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
134	BME7606B	Professional Ethics	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
135	BME8606B	Professional Ethics	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
136	BCE7612	Android App Development with Kotlin	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
137	BCE8612	Android App Development with Kotlin	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
138	BCE7613	Agile Project Management	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
139	BCE8613	Agile Project Management	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
140	BCE25PC01	Theory of Computation	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
141	BCE25PC04	Technical Seminar	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
142	BCE25PC02	Machine Learning (Theory cum Practical)	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
143	BCE25PC03	Computer Networks and Security (Theory cum Practical)	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
144	BCE25PE01-03	Program Elective Course I	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
145	BCE25PE01	Computer Graphics and Gaming	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
146	BCE25PE02	Internet of Things	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
147	BCE25PE03	Data Mining and Warehousing	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
148	BCE26PC01	Operating System (Theory cum Practical)	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
149	BCE26PC02	Design and Analysis of Algorithms (Theory cum Practical)	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
150	BCE26PC03	Software Engineering	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
151	BCE26VS01	Full Stack Development	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
152	BCE26PE01-03	Program Elective Course II	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
153	BCE26PE04-06	Program Elective Course III	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
154	BCE26PE01	Deep Learning	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
155	BCE26PE02	Blockchain Technology	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
156	BCE26PE03	UI and UX Design	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
157	BCE26PE04	Cloud Computing	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
158	BCE26PE05	Cyber Security and Forensics	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
159	BCE26PE06	Image and Video Processing	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
160	BCI25OE04	Remote Sensing and GIS	Civil Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
161	BET25OE01	Introduction to Advanced Driver Assistance Systems	Electronics & Telecomm	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
162	BME25OE06	Professional Ethics and Sustainability in the Age of AI	Mechanical Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
163	BCE7418	Cloud Computing	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
164	BCE7419	Cloud Computing Laboratory	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
165	BCE7420	Software Testing & Quality Assurance	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
166	BCE7421	Software Testing & Quality Assurance Laboratory	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
167	BCE7515-17	Professional Elective Course - 5	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
168	BCE7518-20	Professional Elective Course - 6	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
169	BCE7521	Project Based Learning - 5	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
170	BCE7515	Business Intelligence	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
171	BCE7516	Advanced Database Systems	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
172	BCE7517	Virtual Reality / Augmented Reality	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
173	BCE7518	Computer Vision	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
174	BCE7519	Network and Application Security	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
175	BCE7520	Natural Language Processing	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
176	BCE8701	Major Project	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
177	BCE7801	Internship	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
178	BCE7701	Major Project (Stage 1)	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
179	BCE7702	Major Project (Stage 1)	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
180	BCE8418	Cloud Computing	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
181	BCE8419	Cloud Computing Laboratory	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
182	BCE8420	Software Testing & Quality Assurance	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
183	BCE8421	Software Testing & Quality Assurance Laboratory	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
184	BCE8515-17	Professional Elective Course - 5	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
185	BCE8518-20	Professional Elective Course - 6	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
186	BCE8521	Project Based Learning - 5	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
187	BCE8801	Internship	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
188	BCE8703	Major Project (Stage 2)	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
189	BCE7609	MOOC	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
190	BCE8609	MOOC	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
24	BSH24AE05	Professional Development Training	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
25	BSH24VE02	Constitution of India	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
26	BSH24EM02	Designing Thinking & Innovation Management	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
27	BSH24EM03	Project Management	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
29	BSH24EM05	Business Finance for Engineers	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
33	BSH24OE07	Computational Techniques (Computer/IT)	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
195	BSH26MD23	Human Economics	Computer Engineering	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
191	BSH23MD19	Human Psychology: Realising Human Potential	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
192	BSH24MD20	Human Values in Madhyasth Darshan	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
194	BSH25MD22	Vision for Humane Society - LAB	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
196	BSH27MD24	Holistic Vision of Life	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
197	BSH28MD25	English Literature	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
198	BSH29MD26	German	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
200	BSH31MD28	Smart and Sustainable Cities	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
201	BSH32MD29	Digital Marketing	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
203	BSH34MD31	Computer Programming	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
204	BSH35MD32	Generative AI	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
205	BSH36MD33	Internet of Things (IOT)	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
206	BSH37MD34	Embedded System Design	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
208	BSH39MD36	Entrepreneurship Development	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
209	BSH40MD37	3D Printing	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
210	BSH41MD38	Product Design and Development	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
211	BSH42MD39	Designing with Augmented and Virtual Reality	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
193	BSH25MD21	Vision for Humane Society	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
199	BSH30MD27	Japanese	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
202	BSH33MD30	Web Development	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
207	BSH38MD35	Introduction to Coexistence in Living	Applied Sciences & Humanities	2026-02-11 10:40:45.715016	2026-02-11 10:40:45.715016
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
-- Data for Name: staff_directory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_directory (id, name, email, mobile, designation, department, emp_code, pan_card, created_at) FROM stdin;
1	KIRTI RAMKISHAN NAGARGOJE	kirti.nagargoge@pccoepune.org	7709424198	Visiting	Computer Engineering	23TVCOMP2238	ARGPN5135N	2026-04-23 21:16:26.035504
2	SHRADDHA VIJAY OVALE	shraddha.ovale@pccoepune.org	8378980300	Assistant Professor	Computer Engineering	20TCOMP1944	BOVPK0185C	2026-04-23 21:16:26.099205
3	SHAILESH BALASAHEB GALANDE	shailesh.galande@pccoepune.org	9860503703	Assistant Professor	Computer Engineering	22TCOMP2024	ARRPG8402E	2026-04-23 21:16:26.100698
4	GEETANJALI  SHARMA	geetanjali.sharma@pccoepune.org	8550966332	Assistant Professor	Computer Engineering	22TCOMP2074	BCYPS1550A	2026-04-23 21:16:26.102294
5	SARIKA TANAJI DEOKATE	sarika.deokate@pccoepune.org	7972824629	Assistant Professor	Computer Engineering	22TCOMP2082	AKHPD3469M	2026-04-23 21:16:26.104083
6	AMOL VIJAY PATIL	amol.patil@pccoepune.org	9588408374	Assistant Professor	Computer Engineering	22TCOMP2090	BFXPP2302F	2026-04-23 21:16:26.105244
7	OMKARESH SAKHARAM KULKARNI	omkaresh.kulkarni@pccoepune.org	7798883600	Assistant Professor	Computer Engineering	22TCOMP2092	ANJPK9998F	2026-04-23 21:16:26.106439
8	DHANASHREE VITTHALRAV PATIL	dhanashree.patil@pccoepune.org	8605796168	Assistant Professor	Computer Engineering	22TCOMP2093	BNAPP3757K	2026-04-23 21:16:26.107836
9	SHIVANI  PANDEY	shivani.pandey@pccoepune.org	8979441825	Assistant Professor	Computer Engineering	22TCOMP2109	CWFPP0089K	2026-04-23 21:16:26.109885
10	MEHZABIN FEROZ PATHAN	mehzabin.pathan@pccoepune.org	9763722197	Assistant Professor	Computer Engineering	22TCOMP2128	ASPPP3356B	2026-04-23 21:16:26.111401
11	TANYA  SHRUTI	tanya.shruti@pccoepune.org	8386954387	Assistant Professor	Computer Engineering	23TCOMP2183	EJXPS5335A	2026-04-23 21:16:26.112632
12	AMRUTA ABHISHEK MAHAJAN	amruta.mahajan@pccoepune.org	8983002525	Assistant Professor	Computer Engineering	23TCOMP2201	BPVPA7678R	2026-04-23 21:16:26.113871
13	ASHWINI SANJEEV MATANGE	ashwini.matange@pccoepune.org	9892529663	Assistant Professor	Computer Engineering	23TCOMP2202	AGVPM1705H	2026-04-23 21:16:26.115015
14	HARSHA VINAYAK TALELE	harsh.talele@pccoepune.org	9099983816	Assistant Professor	Computer Engineering	23TCOMP2212	AKZPT8628A	2026-04-23 21:16:26.116159
15	DEEPALI RAVINDRA JAWALE	deepali.jawale@pccoepune.org	9561381703	Assistant Professor	Computer Engineering	25TCOMP2265	AMDPJ0092L	2026-04-23 21:16:26.117361
16	MANISHA DNYANESHWAR PAWAR	manisha.pawar@pccoepune.org	7972364918	Assistant Professor	Computer Engineering	25TCOMP2268	BCMPP1901J	2026-04-23 21:16:26.118457
17	ROHINI SHIVAJI TAMBE	rohini.tambe@pccoepune.org	7972541768	Assistant Professor	Computer Engineering	25TCOMP2271	BZGPT3930G	2026-04-23 21:16:26.119731
18	SHRIYA GANESH MUNDHE	shriya.mundhe@pccoepune.org	7385906819	Assistant Professor	Computer Engineering	25TCOMP2274	AOOPJ4890F	2026-04-23 21:16:26.120874
19	SONIKA  GILL	sonika.gill@pccoepune.org	9172263722	Assistant Professor	Computer Engineering	25TCOMP2279	AROPG9195K	2026-04-23 21:16:26.122495
20	DIPALI MANISH PATIL	dipali.patil@pccoepune.org	8669663655	Assistant Professor	Computer Engineering	25TCOMP2280	BSKPP7683P	2026-04-23 21:16:26.123586
21	TRUPTI TUSHAR DESHMUKH	trupti.deshmukh@pccoepune.org	7218456574	Assistant Professor	Computer Engineering	25TCOMP2282	CJMPP4527Q	2026-04-23 21:16:26.124783
22	SUVARNA GANESH PATIL	suvarna.patil@pccoepune.org	7588735942	Assistant Professor	Computer Engineering	25TCOMP2288	BNDPP2068L	2026-04-23 21:16:26.126199
23	DR.AMBALA  SRINIVAS	ambala.srinivas@pccoepune.org	9494512400	Associate Professor	Computer Engineering	22TCOMP2038	BPPPS9738Q	2026-04-23 21:16:26.127271
24	MUBIN SHOUKATBHAI TAMBOLI	mubin.tamboli@pccoepune.org	9766175530	Associate Professor	Computer Engineering	22TCOMP2071	AHAPT1802A	2026-04-23 21:16:26.128433
25	PRAVIN SHANTARAM GAME	pravin.game@pccoepune.org	9765608815	Associate Professor	Computer Engineering	22TCOMP2089	AIFPG3164L	2026-04-23 21:16:26.129445
26	DR .APARNA SHASHIKANT JOSHI	aparna.joshi@pccoepune.org	9763853569	Associate Professor	Computer Engineering	23TCOMP2214	ANUPJ2108H	2026-04-23 21:16:26.131269
27	RAJENDRA MAHADU CHAUDHARI	rajendra.chaudhari@pccoepune.org	9766122737	Lab Assistant	Computer Engineering	12CNT172	ATJPC4815H	2026-04-23 21:16:26.132226
28	SWAPNALI YOGESH WAGH	swapnali.wagh@pccoepune.org	7028520757	Lab Assistant	Computer Engineering	12CNT203	ABXPW2466Q	2026-04-23 21:16:26.162745
29	MANISHA ANIL KOKANE	manisha.kokane@pccoepune.org	9075102273	Lab Assistant	Computer Engineering	12CNT204	ASGPK9967Q	2026-04-23 21:16:26.16614
30	MANGAL RAMDAS NAWALE	mangal.nawale@pccoepune.org	9623164160	Technical Assistant	Computer Engineering	12COMPT503	AECPN6918A	2026-04-23 21:16:26.169962
31	SNEHAL SUBODH POHOKAR	snehal.pohokar@pccoepune.org	9096116465	Lab Assistant	Computer Engineering	14CONT155	AJDPV8892M	2026-04-23 21:16:26.172977
32	GUNWANT DIWAKAR BENDALE	gunwant.bendale@pccoepune.org	9922504560	Lab Assistant	Computer Engineering	14MECHNT454	AQEPB8917F	2026-04-23 21:16:26.178242
33	SACHIN BALAJI GADADE	sachin.gadade@pccoepune.org	9511809879	Lab Attendant	Computer Engineering	23NTIT2224	BVVPG3306E	2026-04-23 21:16:26.18177
34	GANESH VITTHAL KADAM	ganesh.kadam@pccoepune.org	9970539060	Assistant Professor	Computer Engineering	22TCOMP2067	AVLPK9716D	2026-04-23 21:16:26.18391
35	MADHURI AMOL SURYAVANSHI	madhuri.suryavanshi@pccoepune.org	9822720120	Assistant Professor	Computer Engineering	22TCOMP2068	BUJPD3076P	2026-04-23 21:16:26.185005
36	DEVENDRA DHARMARAJ KURWAR	devendra.kurwar@pccoepune.org	9359056002	Attendant	Computer Engineering	12CNT223	BTRPK4922L	2026-04-23 21:16:26.185948
37	SAGAR HARESHWAR TAMORE	sagar.tamore@pccoepune.org	9860575060	Attendant	Computer Engineering	12CNT225	ASDPT7370B	2026-04-23 21:16:26.187962
38	SWATI SHAILESH CHANDURKAR	swati.chandurkar@pccoepune.org	9970955897	Assistant Professor	Computer Engineering	12COT276	AUKPB9849G	2026-04-23 21:16:26.190513
39	ATUL GULABRAO PAWAR	atul.pawar@pccoepune.org	9975618971	Assistant Professor	Computer Engineering	12CT188	BGWPP1261P	2026-04-23 21:16:26.193168
40	SUSHMA RAHUL VISPUTE	sushma.vispute@pccoepune.org	9420112271	Assistant Professor	Computer Engineering	12CT209	AKLPA9402H	2026-04-23 21:16:26.194345
41	PRIYA AMIT SURANA	priya.surana@pccoepune.org	9028848620	Assistant Professor	Computer Engineering	12CT214	AVHPS7021B	2026-04-23 21:16:26.195437
42	MAHALAKSHMI  BODIREDDY	mahalakshmi.bodireddy@pccoepune.org	8087038785	Assistant Professor	Computer Engineering	12CT217	ALHPB4718L	2026-04-23 21:16:26.196591
43	ARCHANA SHITAL KADAM	archana.kadam@pccoepune.org	9890805528	Assistant Professor	Computer Engineering	12CT218	BDNPS6491J	2026-04-23 21:16:26.197556
44	HARSHADA RANGNATH MHASKE	harshada.mhaske@pccoepune.org	7057076132	Assistant Professor	Computer Engineering	12CT227	AQFPM8942E	2026-04-23 21:16:26.19851
45	ANAGHA NEELKANTH CHAUDHARI	anagha.chaudhari@pccoepune.org	9881957427	Assistant Professor	Computer Engineering	12ITT001	AJWPC3367M	2026-04-23 21:16:26.199584
46	SMITA CHETANKUMAR KHAIRNAR	smita.khairnar@pccoepune.org	9503998794	Assistant Professor	Computer Engineering	14COT123	DSEPK4926A	2026-04-23 21:16:26.200505
47	RAHUL RAVINDRA PITALE	rahul.pitale@pccoepune.org	9420240035	Assistant Professor	Computer Engineering	15COMPT301	BLPPP6877H	2026-04-23 21:16:26.201652
48	KAPIL DINKARRAO TAJANE	kapil.tajane@pccoepune.org	9823400036	Assistant Professor	Computer Engineering	15COMPT303	AMBPT0942R	2026-04-23 21:16:26.202791
49	ASMITA - MANNA	asmita.manna@pccoepune.org	8600218534	Assistant Professor	Computer Engineering	20TCOMP1953	AFJPN9933M	2026-04-23 21:16:26.203812
50	GOPAL DADARAO UPADHYE	gopal.upadhye@pccoepune.org	8149373828	Assistant Professor	Computer Engineering	21TCOMP2010	ABNPU5922D	2026-04-23 21:16:26.208649
51	POOJA VISHAL BIDWAI	pooja.bidwai@pccoepune.org	9420667464	Assistant Professor	Computer Engineering	25TCOMP2262	ARTPB6747M	2026-04-23 21:16:26.209856
52	ABHISHEK SOMNATH RAUT	abhishek.raut@pccoepune.org	9423773196	Assistant Professor	Computer Engineering	25TCOMP2264	CFNPR9804R	2026-04-23 21:16:26.211014
53	SUPRIYA VIKRAM MAHADEVKAR	supriya.mahadevkar@pccoepune.org	9730968224	Assistant Professor	Computer Engineering	25TCOMP2292	DNGPS4872E	2026-04-23 21:16:26.212123
54	GOVINDA BAPURAO SAMBARE	santosh.sambare@pccoepune.org	9689907628	Associate Professor	Computer Engineering	12CT202	ADWPS6521R	2026-04-23 21:16:26.213163
55	REENA SHANKAR KHARAT	reena.kharat@pccoepune.org	9689252599	Associate Professor	Computer Engineering	12CT212	AQYPK3896J	2026-04-23 21:16:26.214437
56	DR. MEGHANA PRITAM LOKHANDE	meghana.lokhande@pccoepune.org	9823334381	Associate Professor	Computer Engineering	1774TCO	ABEPI7806B	2026-04-23 21:16:26.215398
57	RAJESWARI  KANNAN	kannan.rajeswari@pccoepune.org	7066892206	Professor, Dean Academics	Computer Engineering	12COMPT501	AGBPR0676G	2026-04-23 21:16:26.216367
58	DR.SWATI VIJAY SHINDE	swati.shinde@pccoepune.org	7350318050	Professor	Computer Engineering	12ITT701	AHIPD5830G	2026-04-23 21:16:26.217256
59	DR.SONALI DHANANJAY PATIL	sonali.patil@pccoepune.org	9423527197	Professor & HOD	Computer Engineering	12CT211	APYPP3856Q	2026-04-23 21:16:26.218469
60	AJIT DNYANESHWAR LANDGE	ajit.landge@pccoepune.org	7447475010	Attendant	Computer Engineering	16COMPNT2003	BCAPL7125C	2026-04-23 21:16:26.219715
61	SAMPAT MOHAN JADHAV	sampat.jadhav@pccoepune.org	9890719331	Senior Clerk	Computer Engineering	12CNT228	AQRPJ7915J	2026-04-23 21:16:26.221934
62	KAVITA JANARDAN KOLPE	kavita.kolpe@pccoepune.org	8805282900	Assistant Professor	Computer Engineering	22TCOMP2065	DWPPK4629M	2026-04-23 21:16:26.224308
63	SAGAR TANAJI JOSHI	sagar.joshi@pccoepune.org	9762317107	Lab Assistant	Computer Engineering	22NTCOMP2048	BOEPJ9789J	2026-04-23 21:16:26.225868
64	PRATHAMESH ASHOK WAIKAR	prathamesh.waikar@pccoepune.org	7249443584	Lab Assistant	Computer Engineering	22NTCOMP2122	AHPPW6389J	2026-04-23 21:16:26.228608
65	MINESH SHIVAJI SURYAWANSHI	minesh.suryawanshi@pccoepune.org	7276666083	Lab Assistant	Computer Engineering	22NTCOMP2123	KAFPS2153P	2026-04-23 21:16:26.23092
66	RAJKAMAL PRAMOD THETE	rajkamal.thete@pccoepune.org	8329449197	Lab Assistant	Computer Engineering	23NTCIVIL2229	BYJPT4814M	2026-04-23 21:16:26.233142
67	POOJA SUJIT KUTE	pooja.kute@pccoepune.org	9503290939	Lab Assistant	Computer Engineering	23NTCOMP2220	HFAPK7304P	2026-04-23 21:16:26.235936
68	PRATIKSHA ABHISHEK HINGE	pratiksha.khengare@pccoepune.org	9359063019	Lab Assistant	Computer Engineering	23NTMCA2234	GNRPK1998B	2026-04-23 21:16:26.238349
69	APURVA GAJANAN DIVEKAR	apurva.divekar@pccoepune.org	8390779146	Lab Assistant	Computer Engineering	25NTCOMP2290	JBHPD3913E	2026-04-23 21:16:26.241872
70	SHIVDATTA SAMBHAJI KALBHOR	shivdatta.kalbhor@pccoepune.org	7744825222	Peon	Computer Engineering	22NTCOMP2120	HFZPK5070P	2026-04-23 21:16:26.244517
71	PRATIK VILAS JAGDALE	pratik.jagdale@pccoepune.org	9322388176	Teaching Assistant	Computer Engineering	25TACOMP2285	CDVPJ0175R	2026-04-23 21:16:26.246542
72	SAURABH VITTHAL MAGDUM	saurabh.magdum@pccoepune.org	7558239277	Teaching Assistant	Computer Engineering	25TACOMP2286	EBPPM6344K	2026-04-23 21:16:26.248599
73	APOORVA B MACHALE	apoorva.machale@pccoepune.org	8380864876	Teaching Assistant	Computer Engineering	25TACOMP2291	DWQPM4649E	2026-04-23 21:16:26.250575
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
-- Data for Name: subject_semester_counts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_semester_counts (id, subject_code, academic_year, semester, registered_count, created_at, updated_at, year) FROM stdin;
9	BCE24PC01	2025-26	II	333	2026-02-13 15:43:12.696225	2026-02-13 15:43:12.696225	SY
10	BSH24VE02	2025-26	II	333	2026-02-13 15:43:12.699341	2026-02-13 15:43:12.699341	SY
11	BCE24PC02	2025-26	II	333	2026-02-13 15:43:12.701214	2026-02-13 15:43:12.701214	SY
12	BCE24PC03	2025-26	II	333	2026-02-13 15:43:12.704504	2026-02-13 15:43:12.704504	SY
13	BCE24PC04	2025-26	II	333	2026-02-13 15:43:12.705801	2026-02-13 15:43:12.705801	SY
14	BSH24OE07	2025-26	II	333	2026-02-13 15:43:12.707065	2026-02-13 15:43:12.707065	SY
16	BSH24EM02	2025-26	II	171	2026-02-13 15:43:12.709711	2026-02-13 15:43:12.709711	SY
17	BSH24AE05	2025-26	II	333	2026-02-13 15:43:12.710736	2026-02-13 15:43:12.710736	SY
18	BSH24EM03	2025-26	II	31	2026-02-13 15:43:12.711934	2026-02-13 15:43:12.711934	SY
19	BSH24EM05	2025-26	II	131	2026-02-13 15:43:12.713756	2026-02-13 15:43:12.713756	SY
20	BIT24MD02	2025-26	II	8	2026-02-13 15:43:12.714914	2026-02-13 15:43:12.714914	SY
21	BME24MD22	2025-26	II	2	2026-02-13 15:43:12.715829	2026-02-13 15:43:12.715829	SY
22	BME24MD12	2025-26	II	38	2026-02-13 15:43:12.716843	2026-02-13 15:43:12.716843	SY
23	BET24MD11	2025-26	II	14	2026-02-13 15:43:12.717932	2026-02-13 15:43:12.717932	SY
24	BCS24MD02	2025-26	II	181	2026-02-13 15:43:12.71924	2026-02-13 15:43:12.71924	SY
25	BCE24MD02	2025-26	II	60	2026-02-13 15:43:12.720486	2026-02-13 15:43:12.720486	SY
26	BCI24MD02	2025-26	II	1	2026-02-13 15:43:12.722022	2026-02-13 15:43:12.722022	SY
27	BSH24MD14	2025-26	II	10	2026-02-13 15:43:12.723306	2026-02-13 15:43:12.723306	SY
28	BSH24MD08	2025-26	II	9	2026-02-13 15:43:12.724569	2026-02-13 15:43:12.724569	SY
29	BSH24MD02	2025-26	II	8	2026-02-13 15:43:12.72603	2026-02-13 15:43:12.72603	SY
30	BSH24MD26	2025-26	II	1	2026-02-13 15:43:12.727261	2026-02-13 15:43:12.727261	SY
31	BSH24MD32	2025-26	II	1	2026-02-13 15:43:12.728861	2026-02-13 15:43:12.728861	SY
32	BCE26PC01	2025-26	II	314	2026-02-13 15:43:12.730037	2026-02-13 15:43:12.730037	TY
33	BCE26PC02	2025-26	II	314	2026-02-13 15:43:12.731404	2026-02-13 15:43:12.731404	TY
34	BCE26PC03	2025-26	II	314	2026-02-13 15:43:12.732707	2026-02-13 15:43:12.732707	TY
35	BCE26PE01	2025-26	II	51	2026-02-13 15:43:12.733718	2026-02-13 15:43:12.733718	TY
36	BCE26PE02	2025-26	II	66	2026-02-13 15:43:12.734794	2026-02-13 15:43:12.734794	TY
37	BCE26PE03	2025-26	II	197	2026-02-13 15:43:12.736066	2026-02-13 15:43:12.736066	TY
38	BCE26PE04	2025-26	II	282	2026-02-13 15:43:12.737167	2026-02-13 15:43:12.737167	TY
39	BCE26PE05	2025-26	II	32	2026-02-13 15:43:12.738484	2026-02-13 15:43:12.738484	TY
40	BCE26VS01	2025-26	II	314	2026-02-13 15:43:12.739551	2026-02-13 15:43:12.739551	TY
41	BSH26MD05	2025-26	II	5	2026-02-13 15:43:12.740646	2026-02-13 15:43:12.740646	TY
42	BSH26MD11	2025-26	II	6	2026-02-13 15:43:12.741949	2026-02-13 15:43:12.741949	TY
43	BSH26MD17	2025-26	II	1	2026-02-13 15:43:12.743237	2026-02-13 15:43:12.743237	TY
44	BSH26MD23	2025-26	II	2	2026-02-13 15:43:12.744645	2026-02-13 15:43:12.744645	TY
45	BCE26MD05	2025-26	II	24	2026-02-13 15:43:12.745755	2026-02-13 15:43:12.745755	TY
46	BCS26MD05	2025-26	II	229	2026-02-13 15:43:12.746732	2026-02-13 15:43:12.746732	TY
47	BET26MD11	2025-26	II	16	2026-02-13 15:43:12.747716	2026-02-13 15:43:12.747716	TY
48	BME26MD15	2025-26	II	18	2026-02-13 15:43:12.749028	2026-02-13 15:43:12.749028	TY
49	BME26MD25	2025-26	II	3	2026-02-13 15:43:12.750223	2026-02-13 15:43:12.750223	TY
50	BIT26MD05	2025-26	II	10	2026-02-13 15:43:12.751451	2026-02-13 15:43:12.751451	TY
51	BCE26HN01	2025-26	II	4	2026-02-13 15:43:12.75253	2026-02-13 15:43:12.75253	TY
52	BCE26HN02	2025-26	II	4	2026-02-13 15:43:12.753662	2026-02-13 15:43:12.753662	TY
53	BCE26HN03	2025-26	II	1	2026-02-13 15:43:12.754759	2026-02-13 15:43:12.754759	TY
54	BCE26HN04	2025-26	II	1	2026-02-13 15:43:12.75654	2026-02-13 15:43:12.75654	TY
55	BCE6414	2025-26	II	7	2026-02-13 15:43:12.757668	2026-02-13 15:43:12.757668	TY
56	BHM6114	2025-26	II	7	2026-02-13 15:43:12.75862	2026-02-13 15:43:12.75862	TY
57	BCE6415	2025-26	II	7	2026-02-13 15:43:12.759561	2026-02-13 15:43:12.759561	TY
58	BCE6416	2025-26	II	7	2026-02-13 15:43:12.760746	2026-02-13 15:43:12.760746	TY
59	BCE6417	2025-26	II	7	2026-02-13 15:43:12.761987	2026-02-13 15:43:12.761987	TY
60	BCE6513	2025-26	II	7	2026-02-13 15:43:12.763114	2026-02-13 15:43:12.763114	TY
61	BCE6514	2025-26	II	7	2026-02-13 15:43:12.764122	2026-02-13 15:43:12.764122	TY
62	BCI6604A	2025-26	II	7	2026-02-13 15:43:12.765044	2026-02-13 15:43:12.765044	TY
63	BCE6916	2025-26	II	7	2026-02-13 15:43:12.765913	2026-02-13 15:43:12.765913	TY
64	BHM6918	2025-26	II	7	2026-02-13 15:43:12.76697	2026-02-13 15:43:12.76697	TY
65	BHM9961	2025-26	II	7	2026-02-13 15:43:12.768131	2026-02-13 15:43:12.768131	TY
66	BCE6508	2025-26	II	7	2026-02-13 15:43:12.769069	2026-02-13 15:43:12.769069	TY
67	BET6602	2025-26	II	7	2026-02-13 15:43:12.77012	2026-02-13 15:43:12.77012	TY
68	BCE8801	2025-26	II	316	2026-02-13 15:43:12.771932	2026-02-13 15:43:12.771932	BTech
69	BCE8701	2025-26	II	316	2026-02-13 15:43:12.773301	2026-02-13 15:43:12.773301	BTech
70	HCE8982	2025-26	II	17	2026-02-13 15:43:12.774344	2026-02-13 15:43:12.774344	BTech
71	HCE8985	2025-26	II	2	2026-02-13 15:43:12.775586	2026-02-13 15:43:12.775586	BTech
72	BCE24EL01	2024-25	I	60	2026-02-24 19:11:57.522233	2026-02-24 19:11:57.522233	\N
15	BCE24EL01	2025-26	II	333	2026-02-13 15:43:12.708523	2026-02-24 19:13:20.638799	SY
\.


--
-- Name: batch_sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batch_sizes_id_seq', 12, true);


--
-- Name: course_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_assignments_id_seq', 16, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 211, true);


--
-- Name: remuneration_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.remuneration_rates_id_seq', 81, true);


--
-- Name: staff_directory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_directory_id_seq', 73, true);


--
-- Name: subject_semester_counts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subject_semester_counts_id_seq', 74, true);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_id_seq', 321, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 89, true);


--
-- PostgreSQL database dump complete
--

\unrestrict bXVOtLV16mbumEUZSygFcnq8afSoEydnE42ash7HiHWzk1zauWj6mPWAQoLaj4d

