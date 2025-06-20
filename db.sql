--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chatrooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chatrooms (
    chat_id integer NOT NULL,
    sender_id integer,
    reciever_id integer
);


ALTER TABLE public.chatrooms OWNER TO postgres;

--
-- Name: chatrooms_chat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chatrooms_chat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chatrooms_chat_id_seq OWNER TO postgres;

--
-- Name: chatrooms_chat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chatrooms_chat_id_seq OWNED BY public.chatrooms.chat_id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    post_id integer,
    commenter_id integer,
    comment character varying(300)
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: friends; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friends (
    id integer NOT NULL,
    user_id integer,
    first_name character varying(300),
    last_name character varying(300),
    user_friend_id integer
);


ALTER TABLE public.friends OWNER TO postgres;

--
-- Name: friends_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.friends_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.friends_id_seq OWNER TO postgres;

--
-- Name: friends_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.friends_id_seq OWNED BY public.friends.id;


--
-- Name: group_chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_chats (
    group_id integer,
    message character varying(255),
    sender_id integer,
    time_of_chats timestamp with time zone
);


ALTER TABLE public.group_chats OWNER TO postgres;

--
-- Name: group_friends; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_friends (
    group_id integer,
    member_id integer
);


ALTER TABLE public.group_friends OWNER TO postgres;

--
-- Name: group_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_rooms (
    group_id integer NOT NULL,
    group_name character varying(255)
);


ALTER TABLE public.group_rooms OWNER TO postgres;

--
-- Name: group_rooms_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.group_rooms_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_rooms_group_id_seq OWNER TO postgres;

--
-- Name: group_rooms_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.group_rooms_group_id_seq OWNED BY public.group_rooms.group_id;


--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    story_id integer,
    liker_id integer
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    message_id integer NOT NULL,
    chat_id integer,
    message character varying(300),
    time_of_chats timestamp with time zone
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_message_id_seq OWNER TO postgres;

--
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_message_id_seq OWNED BY public.messages.message_id;


--
-- Name: stories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stories (
    id integer NOT NULL,
    user_id integer,
    header character varying(300),
    body character varying(300)
);


ALTER TABLE public.stories OWNER TO postgres;

--
-- Name: stories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stories_id_seq OWNER TO postgres;

--
-- Name: stories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stories_id_seq OWNED BY public.stories.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(300),
    last_name character varying(300),
    email character varying(300),
    password character varying(250)
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
-- Name: chatrooms chat_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatrooms ALTER COLUMN chat_id SET DEFAULT nextval('public.chatrooms_chat_id_seq'::regclass);


--
-- Name: friends id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends ALTER COLUMN id SET DEFAULT nextval('public.friends_id_seq'::regclass);


--
-- Name: group_rooms group_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_rooms ALTER COLUMN group_id SET DEFAULT nextval('public.group_rooms_group_id_seq'::regclass);


--
-- Name: messages message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN message_id SET DEFAULT nextval('public.messages_message_id_seq'::regclass);


--
-- Name: stories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories ALTER COLUMN id SET DEFAULT nextval('public.stories_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: chatrooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chatrooms (chat_id, sender_id, reciever_id) FROM stdin;
7	3	4
8	4	3
9	3	5
10	5	3
11	3	6
12	6	3
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (post_id, commenter_id, comment) FROM stdin;
4	3	the first comment
4	5	the second comment
5	3	first comment
4	3	100 niggabyte of memory
4	3	priestly is a bolo
4	3	robert is hard
4	3	my mum is my cheerleader
4	3	i love my mother
9	3	hahahahahahaha 
9	3	im replying myself
9	3	this socket shit is wild
\.


--
-- Data for Name: friends; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friends (id, user_id, first_name, last_name, user_friend_id) FROM stdin;
1	3	Awesome	Chukwurah	5
2	3	robert	onouha	6
5	3	charles	odu	4
22	6	eloka	ifezue	3
\.


--
-- Data for Name: group_chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_chats (group_id, message, sender_id, time_of_chats) FROM stdin;
13	CCOL	3	2025-06-14 12:53:50.366+01
13	nice one	6	2025-06-17 08:49:53.085+01
13	testing	3	2025-06-17 08:55:01.833+01
13	nice one	3	2025-06-17 08:55:11.626+01
13	hello world	6	2025-06-17 08:57:21.524+01
13	how are oyu	3	2025-06-17 09:01:13.854+01
13	nice	3	2025-06-17 09:06:14.303+01
13	hi	3	2025-06-17 09:17:31.759+01
13	how are you	6	2025-06-17 09:17:41.548+01
13	cool	3	2025-06-17 09:24:52.702+01
13	nice one oo	6	2025-06-17 09:25:11.732+01
13	great	6	2025-06-17 09:25:25.372+01
13	nice	3	2025-06-17 09:25:38+01
13	i know	6	2025-06-17 09:25:49.974+01
13	hey	3	2025-06-17 09:26:00.399+01
13	geat	6	2025-06-17 09:26:16.945+01
13	lets go	3	2025-06-17 09:27:17.48+01
13	how are you	3	2025-06-17 09:27:23.414+01
13	im good	6	2025-06-17 09:27:31.967+01
13	are you	3	2025-06-17 09:27:36.863+01
13	really	3	2025-06-17 09:27:45.73+01
13	i am	6	2025-06-17 09:27:48.967+01
13	hello world	6	2025-06-17 09:40:50.511+01
13	whagwan G	3	2025-06-17 09:41:00.81+01
13	your good abi	6	2025-06-17 09:41:15.375+01
13	yh	3	2025-06-17 09:41:29.223+01
13	hhh	3	2025-06-17 09:46:17.78+01
13	nice one	3	2025-06-17 09:49:57.766+01
13	yoo	6	2025-06-18 10:46:09.298+01
13	cool	6	2025-06-18 10:57:13.77+01
13	great	6	2025-06-18 10:58:20.689+01
13	asdf	3	2025-06-18 10:58:52.341+01
13	df	3	2025-06-18 11:01:16.62+01
13	lets go	6	2025-06-18 11:03:46.648+01
13	what happened	3	2025-06-18 11:05:31.727+01
13	i dont know	6	2025-06-18 11:05:40.895+01
13	hwfa	3	2025-06-18 11:06:15.726+01
13	asd	3	2025-06-18 11:06:22.951+01
13	adf	6	2025-06-18 11:06:27.711+01
13	cool	3	2025-06-18 11:09:48.809+01
13	jj	3	2025-06-18 11:10:13.938+01
13	kk	3	2025-06-18 11:10:21.496+01
13	asdf	6	2025-06-18 11:11:49.066+01
13	zasgs	6	2025-06-18 11:12:05.574+01
13	fgsdfg	6	2025-06-18 11:13:34.29+01
13	adsf	6	2025-06-18 11:14:40.622+01
13	asdfasdfs	6	2025-06-18 11:14:43.61+01
13	asdfsdfsdfsg	3	2025-06-18 11:14:49.133+01
13	asdfasd	3	2025-06-18 11:18:20.669+01
13	asdffsdaf	3	2025-06-18 11:18:27.116+01
13	lets see	3	2025-06-18 11:24:36.112+01
13	why not	3	2025-06-18 11:25:00.052+01
13	damn	6	2025-06-18 11:25:09.473+01
13	nice	3	2025-06-18 11:26:17.235+01
13	why	6	2025-06-18 11:28:14.306+01
\.


--
-- Data for Name: group_friends; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_friends (group_id, member_id) FROM stdin;
13	3
13	6
13	4
\.


--
-- Data for Name: group_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_rooms (group_id, group_name) FROM stdin;
13	CHOSEN
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (story_id, liker_id) FROM stdin;
5	3
4	3
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (message_id, chat_id, message, time_of_chats) FROM stdin;
119	11	whagwan	2025-06-05 17:32:12.994+01
120	12	you good	2025-06-05 17:32:56.26+01
121	12	how is the fam robert	2025-06-05 17:33:36.853+01
122	11	they are good hows yours	2025-06-05 17:38:41.805+01
123	12	they are alright	2025-06-05 17:39:21.177+01
124	11	good to hear	2025-06-05 17:51:40.664+01
125	11	nice 	2025-06-07 13:39:32.653+01
126	11	how are you doing?	2025-06-07 13:39:38.925+01
127	12	this is actually so cool	2025-06-09 09:43:32.317+01
128	12	i love programming	2025-06-09 09:43:44.756+01
132	12	how are you	2025-06-15 20:27:19.184+01
133	11	hello	2025-06-16 11:19:41.47+01
134	11	how are you	2025-06-16 11:19:51.122+01
135	12	im good	2025-06-16 11:38:34.203+01
136	11	hii	2025-06-16 11:41:02.586+01
137	11	hello	2025-06-16 11:41:24.45+01
138	12	hwfa	2025-06-16 11:41:39.143+01
139	11	yo	2025-06-16 11:50:10.587+01
140	11	hwfa	2025-06-16 11:51:54.945+01
141	12	hi	2025-06-16 11:52:43.4+01
142	12	wait oo	2025-06-16 11:52:59.529+01
143	12	ddoo	2025-06-16 11:54:40.673+01
144	11	you good	2025-06-16 11:57:27.333+01
145	11	kjasd	2025-06-16 12:01:13.514+01
146	12	asfasf	2025-06-16 12:01:29.254+01
147	11	asdsdfg	2025-06-16 12:01:31.85+01
148	12	asdf	2025-06-16 12:03:15.993+01
149	9	asdf	2025-06-16 12:03:28.741+01
150	11	hey bro	2025-06-16 12:03:36.355+01
151	11	how are you	2025-06-16 12:12:55.677+01
152	12	im good bro	2025-06-16 12:20:00.893+01
153	12	yh g	2025-06-16 12:20:45.246+01
154	11	asdf	2025-06-16 12:21:40.333+01
155	11	asdfdsf	2025-06-16 12:22:25.808+01
156	11	sdfd	2025-06-16 12:24:01.258+01
157	12	hi	2025-06-16 12:29:55.501+01
158	11	whats good	2025-06-16 12:30:09.691+01
159	12	asdf	2025-06-16 12:32:43.112+01
160	11	im good	2025-06-16 12:33:42.414+01
161	11	hhh	2025-06-16 12:45:55.76+01
162	12	hry	2025-06-16 12:46:29.075+01
163	12	cool	2025-06-16 12:46:42.666+01
164	11	nice	2025-06-16 12:46:49.04+01
165	11	cool	2025-06-16 13:16:35.007+01
166	12	nice	2025-06-16 13:17:22.594+01
167	11	nice	2025-06-16 13:19:49.919+01
168	12	hey	2025-06-16 13:58:27.939+01
169	12	hi	2025-06-16 14:03:35.763+01
170	11	cc	2025-06-16 14:05:52.665+01
171	11	pls	2025-06-16 14:06:55.785+01
172	11	work	2025-06-16 14:06:57.537+01
173	12	i	2025-06-16 14:07:09.048+01
174	12	worked	2025-06-16 14:07:12.065+01
175	12	ahhahha	2025-06-16 14:07:15.399+01
176	12	hahha	2025-06-16 14:07:16.418+01
177	11	good morning bro	2025-06-17 08:23:41.771+01
178	11	how are you doing this morning	2025-06-17 08:23:58.136+01
179	12	im good 	2025-06-17 08:24:21.376+01
180	12	how about you	2025-06-17 08:24:25.384+01
181	11	nice one o	2025-06-18 10:50:17.634+01
182	12	great	2025-06-18 11:14:59.421+01
183	12	asdf	2025-06-18 11:15:18.466+01
184	12	asdfsd	2025-06-18 11:18:13.895+01
185	11	cool	2025-06-18 11:19:18.928+01
186	12	nice work	2025-06-18 11:27:53.384+01
187	12	ahhh	2025-06-18 11:28:22.994+01
188	11	sadasdf	2025-06-18 11:31:05.612+01
189	12	adsfasdf	2025-06-18 11:31:20.771+01
190	12	lll	2025-06-18 11:31:43.232+01
191	12	good work	2025-06-18 11:36:47.169+01
192	12	asdf	2025-06-18 11:37:30.695+01
193	12	asdf	2025-06-18 11:37:36.209+01
194	11	asdfasdf	2025-06-18 11:43:47.644+01
195	12	nice	2025-06-18 11:43:51.579+01
\.
 

--
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stories (id, user_id, header, body) FROM stdin;
4	5	first	its a first
5	6	second	the second
9	3	this is the third	im still down bad
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, email, password) FROM stdin;
3	eloka	ifezue	elokaifezue@gmail.com	$2b$10$hBoj601u2/uEK1nSNRcgHuxQBb4JvEZkpxwptxgfidDK/P1TN9dyG
4	charles	odu	charlesodu@gmail.com	$2b$10$XNGy.lhqqgjd2926U/eKM.AHeCRIzyjXYExtPyGH2Sf5AX/8ReolO
5	Awesome	Chukwurah	awesomentyt5@gmail.com	$2b$10$5yE5Zwmsfe7bYbFajWx9GeqYDpv2FUgyGXlbvHXy/tN5aZM./vRBW
6	robert	onouha	ronouha@gmail.com	$2b$10$aN0AK1GH2Z4qzrLsJC1IbOxuflYhJY7G0T9f/E7IqH.W6TM5JTtEe
\.


--
-- Name: chatrooms_chat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chatrooms_chat_id_seq', 38, true);


--
-- Name: friends_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.friends_id_seq', 22, true);


--
-- Name: group_rooms_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.group_rooms_group_id_seq', 13, true);


--
-- Name: messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_message_id_seq', 195, true);


--
-- Name: stories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stories_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: chatrooms chatrooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatrooms
    ADD CONSTRAINT chatrooms_pkey PRIMARY KEY (chat_id);


--
-- Name: friends friends_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY (id);


--
-- Name: group_rooms group_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_rooms
    ADD CONSTRAINT group_rooms_pkey PRIMARY KEY (group_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: chatrooms chatrooms_reciever_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatrooms
    ADD CONSTRAINT chatrooms_reciever_id_fkey FOREIGN KEY (reciever_id) REFERENCES public.users(id);


--
-- Name: chatrooms chatrooms_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chatrooms
    ADD CONSTRAINT chatrooms_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: comments comments_commenter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_commenter_id_fkey FOREIGN KEY (commenter_id) REFERENCES public.users(id);


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.stories(id);


--
-- Name: friends friends_user_friend_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_user_friend_id_fkey FOREIGN KEY (user_friend_id) REFERENCES public.users(id);


--
-- Name: friends friends_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: likes likes_liker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_liker_id_fkey FOREIGN KEY (liker_id) REFERENCES public.users(id);


--
-- Name: likes likes_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id);


--
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chatrooms(chat_id);


--
-- Name: stories stories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

