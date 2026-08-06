// import express, { request, response } from "express";
// import bodyParser from "body-parser";
// import mysql from "mysql2/promise";
// import env from "dotenv";
// import bcrypt from "bcrypt";
// import passport from "passport";
// import { Strategy } from "passport-local";
// import session from "express-session";
// import { Server } from "socket.io";
// import { createServer } from "http";
// import fs from "fs/promises";

// const app = express();
// const saltRounds = 10;
// env.config();
// const port = process.env.PORT
// const server = createServer(app)
// const io = new Server(server)

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.use(express.json())
// app.set('view engine', 'ejs');

// const sessionMiddleware = session({
//   secret: 'your_secret_key',
//   resave: false,
//   saveUninitialized: false
// });

// app.use(sessionMiddleware)
// io.engine.use(sessionMiddleware)
// app.use(passport.initialize());
// app.use(passport.session());
// const databaseUrl = (process.env.DATABASE_URL || 'mysql+pymysql://root:elmarvel@localhost:3306/chatbox').replace('mysql+pymysql://', 'mysql://')
// const pool = mysql.createPool(databaseUrl)
// console.log('[startup] DATABASE_URL configured for MySQL connection')

// const normalizeSql = (sql) => sql
//   .replace(/\bpublic\./g, '')
//   .replace(/\$\d+/g, '?')
//   .replace(/LOWER\s*\(\s*first_name\s*\|\|\s*last_name\s*\)/gi, 'LOWER(CONCAT(first_name, last_name))')
//   .replace(/LOWER\s*\(\s*first_name\s*\|\|\s*last_name\s*\)\s*=\s*\?/gi, 'LOWER(CONCAT(first_name, last_name)) = ?')
//   .replace(/LIKE\s*'%'\s*\|\|\s*\?\s*\|\|\s*'%'/gi, "LIKE CONCAT('%', ?, '%')")

// const query = async (sql, params = []) => {
//   const normalizedSql = normalizeSql(sql)
//   const [rows] = await pool.execute(normalizedSql, params)
//   return { rows: Array.isArray(rows) ? rows : [] }
// }

// const initializeDatabase = async () => {
//   const schemaFile = new URL('./schema.sql', import.meta.url)
//   const schema = await fs.readFile(schemaFile, 'utf8')
//   const statements = schema
//     .split(/;/g)
//     .map((statement) => statement.replace(/^--.*$/gm, '').trim())
//     .filter(Boolean)

//   for (const statement of statements) {
//     if (/^USE\s+/i.test(statement)) {
//       continue
//     }
//     await pool.execute(statement)
//   }
// }

// const GodAbeg = async (thing, user) => {
//   const friend = `${thing.first_name} ${thing.last_name}`.split(' ').join('').trim().toLowerCase()
//   const userQuery = await query('SELECT * FROM users WHERE LOWER(CONCAT(first_name, last_name)) = ?', [friend])

//   const id = userQuery.rows[0].id
//   const query_second = await query('SELECT * from chatrooms WHERE sender_id = ? AND reciever_id = ?', [user.id, id])
//   const chat_id = query_second.rows[0].chat_id

//   const third_query = await query("SELECT * FROM chatrooms WHERE chat_id = ?", [chat_id])
//   const sender_chatrooms = third_query.rows[0]
//   const sender_chat_id = sender_chatrooms.chat_id

//   const fourth_query = await query("SELECT * FROM chatrooms WHERE sender_id = ? AND reciever_id = ?", [sender_chatrooms.reciever_id, sender_chatrooms.sender_id])
//   const reciever_chatrooms = fourth_query.rows[0]
//   const reciever_chat_Id = reciever_chatrooms.chat_id;

//   const fifth_query = await query("SELECT * FROM messages JOIN chatrooms ON messages.chat_id = chatrooms.chat_id WHERE messages.chat_id = ? OR messages.chat_id = ? ORDER BY message_id ASC ", [reciever_chat_Id, sender_chat_id])
//   const messages = fifth_query.rows
//   const getMessage = {
//     reciever: `${thing.first_name} ${thing.last_name}`,
//     message: messages.length,
//     lastElement: messages[messages.length - 1] ? messages[messages.length - 1].message : null,
//     lastElementID: messages[messages.length - 1] ? messages[messages.length -1].message_id : null
//   }
//   return (getMessage)
// }

// // Room naming helper: every authenticated socket joins a room named after
// // their user id, so the server can target "all of this user's tabs/devices"
// // without having to track raw socket ids itself.
// const userRoom = (userId) => `user_${userId}`

// // A second room, scoped to one specific conversation between two users.
// // Sorting the ids means both participants compute the exact same room
// // name regardless of who is "sender" vs "receiver" in a given message.
// const conversationRoom = (idA, idB) => {
//   const [a, b] = [idA, idB].sort((x, y) => x - y)
//   return `chat_${a}_${b}`
// }

// io.on('connection', async (socket) => {
//   const session = socket.request.session;
//   const passport = session?.passport
//   if (session && passport) {
//     const user = passport.user
//     console.log('[socket] authenticated client connected', {
//       socketId: socket.id,
//       userId: user.id,
//       email: user.email,
//     });

//     // Join a personal room so other handlers can push events straight to
//     // this user, on any tab/device they have open, without a refresh.
//     socket.join(userRoom(user.id))

//     socket.on('getVerif', async()=>{
//     try {
//       console.log('[socket:getVerif] loading chat list for user', user.id)
//       const getContacts = await query("SELECT * FROM friends WHERE user_id = ? ", [user.id])
//       const contacts = getContacts.rows
//       const messageArray = contacts.map((person) => GodAbeg(person, user))
//       const result = await Promise.all(messageArray)
//       console.log('[socket:getVerif] sending contacts', { userId: user.id, count: result.length })
//       socket.emit('messageVerif', JSON.stringify(result))
//     } catch (error) {
//       console.error('[socket:getVerif] failed', error)
//     }
//     })
//     socket.on('get_posts', async()=>{
//     try {
//       console.log('[socket:get_posts] loading posts for user', user.id)
//       const get_posts = await query('SELECT * FROM friends JOIN stories ON friends.user_id = stories.user_id WHERE friends.user_id = ?',[user.id]) 
//       const posts = get_posts.rows
//       console.log('[socket:get_posts] sending posts', { userId: user.id, count: posts.length })
//       socket.emit('posts',JSON.stringify(posts))
//     } catch (error) {
//       console.error('[socket:get_posts] failed', error)
//     }
//     })
//     socket.on('getliked',async(data)=>{
//       try {
//         const post = JSON.parse(data)
//         const get_user_like = await query('SELECT * FROM likes WHERE story_id = ? AND liker_id = ?',[post.id,user.id])
//         socket.emit('getliked_processed',JSON.stringify(get_user_like.rows))
//       } catch (error) {
//         console.error('[socket:getliked] failed', error)
//       }
//     })
//     socket.on('isliked',async(data)=>{
//       try {
//         const post = JSON.parse(data)
//         const get_user_like = await query('SELECT * FROM likes WHERE story_id = ? AND liker_id = ?',[post.id,user.id])
//         socket.emit('isliked_processed', JSON.stringify(get_user_like.rows))
//       } catch (error) {
//         console.error('[socket:isliked] failed', error)
//       }
//     })
//     socket.on('get_like_count',async (data)=>{
//       try {
//         const post = JSON.parse(data)
//         const get_likes = await query('SELECT * FROM likes WHERE story_id = ?',[post.id])
//         socket.emit('like_count',JSON.stringify(get_likes.rows))
//       } catch (error) {
//         console.error('[socket:get_like_count] failed', error)
//       }
//     })
//     socket.on('add_like_request',async(data)=>{
//     try {
//       const post = JSON.parse(data)
//       await query('INSERT INTO likes (story_id,liker_id) VALUES (?,?)',[post.id,user.id])
//       console.log('[socket:add_like_request] added like', { userId: user.id, storyId: post.id })
//     } catch (error) {
//       console.error('[socket:add_like_request] failed', error)
//     }
//   })
//   socket.on('delete_like_request',async(data)=>{
//     try {
//       const post = JSON.parse(data)
//       await query('DELETE FROM likes WHERE story_id = ? AND liker_id = ?',[post.id,user.id])
//       console.log('[socket:delete_like_request] removed like', { userId: user.id, storyId: post.id })
//     } catch (error) {
//       console.error('[socket:delete_like_request] failed', error)
//     }
//   })
//   socket.on('getcomment_count',async (data)=>{
//    try {
//      const post = JSON.parse(data)
//      const get_user_comment = await query('SELECT * FROM comments JOIN users ON commenter_id = users.id WHERE post_id = ?',[post.id])
//      socket.emit('getcomment_count_processed',JSON.stringify(get_user_comment.rows))
//    } catch (error) {
//      console.error('[socket:getcomment_count] failed', error)
//    }
//   })

//   socket.on('getcomment',async (data)=>{
//     try {
//       const post = JSON.parse(data)
//       const get_comment = await query('SELECT * FROM comments JOIN users ON commenter_id = users.id WHERE post_id = ?',[post.id])
//       socket.emit('getcomment_processed',JSON.stringify(get_comment.rows))
//     } catch (error) {
//       console.error('[socket:getcomment] failed', error)
//     }
//   })
//   socket.on('add_comment',async (message,data)=>{
//     try {
//       const post = JSON.parse(data)
//       await query('INSERT INTO comments (post_id,commenter_id,comment) VALUES (?,?,?)',[post.id,user.id,message])
//       const insertedComment = await query('SELECT * FROM comments WHERE post_id = ? ORDER BY comment_id DESC LIMIT 1', [post.id])
//       console.log('[socket:add_comment] added comment', { userId: user.id, postId: post.id })
//       socket.emit('add_comment_processed',insertedComment.rows[0].comment,`${user.first_name} ${user.last_name}`)
//     } catch (error) {
//       console.error('[socket:add_comment] failed', error)
//     }
//   })
//     socket.on('searches', async (data) => {
//       try {
//         const searchInput = JSON.parse(data).search
//         const result = await query("SELECT * FROM users WHERE LOWER(first_name) LIKE CONCAT('%', ?, '%') AND NOT id = ?", [searchInput.toLowerCase().trim(),user.id])
//         const searches = result.rows
//         console.log('[socket:searches] search results', { userId: user.id, term: searchInput, count: searches.length })
//         socket.emit('getSearch', JSON.stringify(searches))
//       } catch (error) {
//         console.error('[socket:searches] failed', error)
//       }
//     })

//     socket.on('friend_verification',async(data)=>{
//       try {
//         const name = data.split(' ').join('').trim().toLowerCase()
//         const check_for_friend = await query('SELECT * from friends WHERE LOWER(CONCAT(first_name, last_name)) = ? AND user_id = ?',[name,user.id])
//         const friend = check_for_friend.rows
//         console.log('name is ' + name,user)
//         console.log(friend)
//         socket.emit('isFriend',JSON.stringify(friend))
//       } catch (error) {
//         console.error('[socket:friend_verification] failed', error)
//       }
//     })

//     socket.on('follow_request',async (name)=>{
//       try {
//         const friendName = name.split(' ').join('').trim().toLowerCase()
//         const result = await query('SELECT * FROM users WHERE LOWER(CONCAT(first_name, last_name)) = ?', [friendName])
//         const NewFriend = result.rows[0]
//         await query("INSERT INTO friends (first_name, last_name, user_id) VALUES (?,?,?)",
//           [NewFriend.first_name, NewFriend.last_name, user.id])
//         console.log('[socket:follow_request] friend linked', { userId: user.id, friendId: NewFriend.id })
//         socket.emit('follow_request_processed')
//       } catch (error) {
//         console.error('[socket:follow_request] failed', error)
//       }
//     })
//     socket.on('message_request',async(name)=>{
//       try {
//         const friendName = name.split(' ').join('').trim().toLowerCase()
//         const result = await query('SELECT * FROM users WHERE LOWER(CONCAT(first_name, last_name)) = ?', [friendName])
//         const NewFriend = result.rows[0]
//         await query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES (?,?)",
//           [user.id, NewFriend.id]
//         )
//         await query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES (?,?)",
//           [NewFriend.id, user.id]
//         )
//         console.log('[socket:message_request] chatrooms created', { senderId: user.id, receiverId: NewFriend.id })
//         socket.emit('message_request_processed')
//       } catch (error) {
//         console.error('[socket:message_request] failed', error)
//       }
//     })

//     socket.on('joinConversation', async (friendName) => {
//       try {
//         const name = friendName.split(' ').join('').trim().toLowerCase()
//         const friendQuery = await query('SELECT * FROM users WHERE LOWER(CONCAT(first_name, last_name)) = ?', [name])
//         const friend = friendQuery.rows[0]
//         if (!friend) {
//           console.log('[socket:joinConversation] friend not found', { userId: user.id, friendName })
//           return
//         }
//         const room = conversationRoom(user.id, friend.id)
//         // Leave whichever conversation room this socket was previously in,
//         // so it doesn't keep receiving live messages for a chat it's no
//         // longer looking at.
//         if (socket.data.conversationRoom && socket.data.conversationRoom !== room) {
//           socket.leave(socket.data.conversationRoom)
//         }
//         socket.join(room)
//         socket.data.conversationRoom = room
//         console.log('[socket:joinConversation] joined room', { userId: user.id, friendId: friend.id, room })
//       } catch (error) {
//         console.error('[socket:joinConversation] failed', error)
//       }
//     })

//     socket.on('getFriend', async (data) => {
//       try {
//         const name = data.split(' ').join('').trim().toLowerCase()
//         const friendQuery = await query('SELECT * FROM users WHERE LOWER(CONCAT(first_name, last_name)) = ?', [name])
//         const id = friendQuery.rows[0].id
//         const query_second = await query('SELECT * from chatrooms WHERE sender_id = ? AND reciever_id = ?', [user.id, id])
//         const chat_id = query_second.rows[0].chat_id

//         const first_query = await query("SELECT * FROM chatrooms JOIN users ON reciever_id = users.id WHERE chat_id = ?", [chat_id])
//         const reciever = first_query.rows[0]

//         const third_query = await query("SELECT * FROM chatrooms WHERE chat_id = ?", [chat_id])
//         const sender_chatrooms = third_query.rows[0]
//         const sender_chat_id = sender_chatrooms.chat_id

//         const fourth_query = await query("SELECT * FROM chatrooms WHERE sender_id = ? AND reciever_id = ?", [sender_chatrooms.reciever_id, sender_chatrooms.sender_id])
//         const reciever_chatrooms = fourth_query.rows[0]
//         const reciever_chat_Id = reciever_chatrooms.chat_id;

//         const fifth_query = await query("SELECT * FROM messages JOIN chatrooms ON messages.chat_id = chatrooms.chat_id WHERE messages.chat_id = ? OR messages.chat_id = ? ORDER BY message_id ASC ", [reciever_chat_Id, sender_chat_id])
//         const messages = fifth_query.rows
//         console.log('[socket:getFriend] loaded conversation', { userId: user.id, friend: name, messageCount: messages.length })
//         socket.emit('getMessages', JSON.stringify(messages), JSON.stringify(user.id))
//       } catch (error) {
//         console.error('[socket:getFriend] failed', error)
//       }
//     })


//     socket.on('newChat', async (message, name) => {
//       try {
//         const friendName = name.split(' ').join('').trim().toLowerCase()
//         const friendQuery = await query('SELECT * FROM users WHERE LOWER(CONCAT(first_name, last_name)) = ?', [friendName])
//         const id = friendQuery.rows[0].id
//         const query_second = await query('SELECT * from chatrooms WHERE sender_id = ? AND reciever_id = ?', [user.id, id])
//         const chat_id = query_second.rows[0].chat_id
//         await query("INSERT INTO messages (chat_id,message) VALUES (?,?)",
//           [chat_id, message]
//         )
//         const new_chat = await query("SELECT * FROM messages ORDER BY message_id DESC LIMIT 1")
//         console.log('[socket:newChat] message stored', { userId: user.id, friendId: id, chatId: chat_id })

//         // Single emit, reaching everyone in the conversation room —
//         // including the sender, since they joined this room too via
//         // 'joinConversation'. The sender id rides along so each client
//         // can tell "was this mine?" and pick sender_chats vs reciever_chats.
//         io.to(conversationRoom(user.id, id)).emit(
//           'newMessage',
//           JSON.stringify(new_chat.rows[0]),
//           user.id,
//           `${user.first_name} ${user.last_name}`
//         )

//         // Sidebar nudge: reaches every tab/device the receiver has open,
//         // even ones not currently viewing this conversation, so their
//         // chat-list preview updates too.
//         io.to(userRoom(id)).emit('chatListUpdate')
//       } catch (error) {
//         console.error('[socket:newChat] failed', error)
//       }
//     })
//     socket.on('disconnect', () => {
//       console.log('[socket] client disconnected', socket.id);
//     });
//   } else {
//     console.log('[socket] user not authenticated');
//   }

// });





// app.get('/', (req, res) => {
//   console.log('[route] GET / -> redirect /chatbox')
//   res.redirect('/chatbox')
// })

// app.get('/chatbox', (req, res) => {
//   console.log('[route] GET /chatbox', { authenticated: req.isAuthenticated(), sessionId: req.sessionID })
//   if (req.isAuthenticated()) {
//     const user = req.user
//     console.log('[route] rendering home', { userId: user.id, email: user.email })
//     res.render('home.ejs', {
//       UserName: user.first_name + user.last_name,
//       session: req.sessionID,
//       UserId: user.id
//     })
//   }
//   else {
//     res.redirect('/chatbox/login')
//   }
// })



// app.get('/chatbox/login', (req, res) => {
//   console.log('[route] GET /chatbox/login')
//   res.render('login.ejs')
// });

// app.get('/chatbox/register', (req, res) => {
//   console.log('[route] GET /chatbox/register')
//   res.render('register.ejs')
// })



// // POST ROUTES

// app.post('/chatbox/register', async (req, res) => {
//   console.log('[route] POST /chatbox/register', { email: req.body.email, firstName: req.body.first_name, lastName: req.body.last_name })
//   const email = req.body.email;
//   const password = req.body.password;
//   const firstName = req.body.first_name;
//   const lastName = req.body.last_name;
//   const result = await query('SELECT * FROM users WHERE email = ? ', [email]);
//   const checkResult = result.rows
//   if (checkResult.length > 0) {
//     console.log('[route] register skipped, email already exists', email)
//     res.redirect('/chatbox/login')
//   }
//   else {
//     bcrypt.hash(password, saltRounds, async (err, hash) => {
//       if (err) {
//         console.error("Error hashing password:", err);
//       } else {
//         await query(
//           "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
//           [firstName, lastName, email, hash]
//         );
//         const insertedUser = await query('SELECT * FROM users WHERE email = ?', [email]);
//         const user = insertedUser.rows[0];
//         console.log('[route] register complete, logging in new user', { userId: user.id, email: user.email })
//         req.login(user, (err) => {
//           if (err) {
//             console.log(err);
//           }
//           res.redirect("/chatbox");
//         });
//       }
//     })
//   }
// });

// app.post('/chatbox/login', passport.authenticate('local',
//   {
//     successRedirect: '/chatbox',
//     failureRedirect: "/chatbox/login"
//   }
// )
// )

// app.post("/chatbox/follow/:friendName", async (req, res) => {
//   console.log('[route] POST /chatbox/follow/:friendName', { friendName: req.params.friendName, authenticated: req.isAuthenticated() })
//   if (req.isAuthenticated()) {
//     const name = req.params.friendName
//     const user = req.user
//     const friendName = req.params.friendName.split(' ').join('').trim().toLowerCase()
//     const result = await query('SELECT * FROM users WHERE LOWER(CONCAT(first_name, last_name)) = ?', [friendName])
//     const NewFriend = result.rows
//     if (NewFriend.length !== 0) {
//       await query("INSERT INTO friends (first_name, last_name, user_id) VALUES (?,?,?)",
//         [NewFriend[0].first_name, NewFriend[0].last_name, user.id])
//       await query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES (?,?)",
//         [user.id, NewFriend[0].id]
//       )
//       await query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES (?,?)",
//         [NewFriend[0].id, user.id]
//       )
//       res.redirect(`/chatbox/search/${name}`)
//     }
//     else {
//       res.redirect(`/chatbox/search/${name}`)
//     }
//   }
//   else {
//     res.redirect('/chatbox/login')
//   }
// })

// app.get('/chatbox/search/:fullname', async (req, res) => {
//   console.log('[route] GET /chatbox/search/:fullname', { fullname: req.params.fullname, authenticated: req.isAuthenticated() })
//   if (req.isAuthenticated()) {
//     try {
//       const user = req.user;
//       const user_fullname = user.first_name + user.last_name
//       const current_user = user_fullname.split(' ').join('').trim().toLowerCase()
//       const searchedUser = req.params.fullname
//       const searched = searchedUser.split(' ').join('').trim().toLowerCase()

//       const first_query = await query('SELECT * FROM friends WHERE LOWER(CONCAT(first_name, last_name)) = ? AND user_id = ?', [searched, user.id])
//       const first_result = first_query.rows[0]

//       const second_query = await query('SELECT * FROM users WHERE LOWER(CONCAT(first_name, last_name)) = ?', [searched])
//       const second_result = second_query.rows[0]
//       const id_for_followed = second_result?.id

//       const third_query = await query('SELECT * FROM friends WHERE user_id = ?', [id_for_followed])
//       const followCount = third_query.rows.length

//       const fourth_query = await query('SELECT * FROM friends WHERE LOWER(CONCAT(first_name, last_name)) = ?', [searched])
//       const is_followed_count = fourth_query.rows.length

//       const fifth_query = await query('SELECT * FROM chatrooms WHERE sender_id = ? AND reciever_id = ?', [user.id, second_result.id])
//       const fifth_result = fifth_query.rows[0]
//       const chatID = fifth_result ? fifth_result.chat_id : null

//       console.log('[route] rendering profile', {
//         userId: user.id,
//         searchedUser,
//         follow: Boolean(first_result),
//         followingCount: followCount,
//         followerCount: is_followed_count,
//         chatID,
//       })

//       res.render('profile.ejs',
//         {
//           current_user: current_user,
//           searched: searched,
//           User: searchedUser,
//           follow: first_result,
//           followingCount: followCount,
//           followerCount: is_followed_count,
//           UserName: user.first_name + user.last_name,
//           chatID: chatID,
//           UserId: user.id
//         })
//     } catch (error) {
//       console.error('[route] GET /chatbox/search/:fullname failed', error)
//       res.status(500).send('Unable to load profile')
//     }
//   }
//   else {
//     res.redirect('/chatbox/login')
//   }
// })

// app.get('/chatbox/inbox/:chatID', async (req, res) => {
//   if (req.isAuthenticated()) {
//     try {
//       const chatID = req.params.chatID
//       const user = req.user

//       const first_query = await query("SELECT * FROM chatrooms JOIN users ON reciever_id = users.id WHERE chat_id = ?", [chatID])
//       const reciever = first_query.rows[0]
//       if (!reciever) {
//         console.log('[route] inbox missing receiver row', { chatID, userId: user.id })
//         return res.status(404).send('Chat not found')
//       }
//       const reciever_fullname = reciever.first_name + " " + reciever.last_name

//       const third_query = await query("SELECT * FROM chatrooms WHERE chat_id = ?", [chatID])
//       const sender_chatrooms = third_query.rows[0]
//       if (!sender_chatrooms) {
//         console.log('[route] inbox missing sender chatroom row', { chatID, userId: user.id })
//         return res.status(404).send('Chat not found')
//       }
//       const sender_chat_id = sender_chatrooms.chat_id

//       const fourth_query = await query("SELECT * FROM chatrooms WHERE sender_id = ? AND reciever_id = ?", [sender_chatrooms.reciever_id, sender_chatrooms.sender_id])
//       const reciever_chatrooms = fourth_query.rows[0]
//       if (!reciever_chatrooms) {
//         console.log('[route] inbox missing reverse chatroom row', { chatID, userId: user.id })
//         return res.status(404).send('Chat not found')
//       }
//       const reciever_chat_Id = reciever_chatrooms.chat_id;

//       const fifth_query = await query("SELECT * FROM messages JOIN chatrooms ON messages.chat_id = chatrooms.chat_id WHERE messages.chat_id = ? OR messages.chat_id = ?", [reciever_chat_Id, sender_chat_id])
//       const messages = fifth_query.rows

//       console.log('[route] rendering inbox', {
//         userId: user.id,
//         reciever: reciever_fullname,
//         messageCount: messages.length,
//       })

//       res.render('inbox.ejs', {
//         UserName: user.first_name + " " + user.last_name,
//         reciever: reciever_fullname,
//         messages: messages,
//         UserId: user.id,
//       })
//     }
//     catch (error) {
//       console.error('[route] GET /chatbox/inbox/:chatID failed', error)
//       res.status(500).send('Unable to load inbox')
//     }
//   }
//   else {
//     res.redirect('/chatbox/login')
//   }
// })

// passport.use('local',
//   new Strategy(async function verify(username, password, cb) {
//     try {
//       console.log('[auth] login attempt', { username })
//       const result = await query("SELECT * FROM users WHERE email = ? ", [
//         username,
//       ]);
//       if (result.rows.length > 0) {
//         const user = result.rows[0];
//         const storedHashedPassword = user.password;
//         bcrypt.compare(password, storedHashedPassword, (err, valid) => {
//           if (err) {
//             console.error("Error comparing passwords:", err);
//             return cb(err);
//           } else {
//             if (valid) {
//               console.log('[auth] login success', { userId: user.id, email: user.email })
//               return cb(null, user);
//             } else {
//               console.log('[auth] login failed - bad password', { username })
//               return cb(null, false);
//             }
//           }
//         });
//       } else {
//         console.log('[auth] login failed - user not found', { username })
//         return cb("User not found");
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   })
// )

// passport.serializeUser((user, cb) => {
//   cb(null, user);
// });

// passport.deserializeUser((user, cb) => {
//   cb(null, user);
// });


// const startServer = async () => {
//   try {
//     await initializeDatabase()
//     server.listen(port, () => {
//       console.log(`server is running at port ${port}`)
//     })
//   } catch (error) {
//     console.error('Failed to start the server. Check that MySQL is running and DATABASE_URL is correct.');
//     console.error(error);
//     process.exit(1);
//   }
// }

// startServer();

import express, { request, response } from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import { Server } from "socket.io";
import { createServer } from "http";
import fs from "fs/promises";

const { Pool } = pg;
const app = express();
const saltRounds = 10; 
env.config();
const port = process.env.PORT
const server = createServer(app)
const io = new Server(server)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json())
app.set('view engine', 'ejs');

const sessionMiddleware = session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
});

app.use(sessionMiddleware)
io.engine.use(sessionMiddleware)
app.use(passport.initialize());
app.use(passport.session());
// Adjust the default below (username/password) to match your local Postgres
// setup, or set DATABASE_URL in your .env — e.g.
// postgres://youruser:yourpassword@localhost:5432/chatbox
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:elmarvel@localhost:5432/chatbox'
const pool = new Pool({ connectionString: databaseUrl })
console.log('[startup] DATABASE_URL configured for PostgreSQL connection')

// pg already returns { rows, rowCount, ... } from pool.query(), and already
// takes native Postgres placeholders ($1, $2, ...) — so this wrapper no
// longer needs to rewrite SQL at all. Kept only so every call site below
// (which does `const result = await query(...); result.rows`) didn't need
// to change.
const query = async (sql, params = []) => {
  const result = await pool.query(sql, params)
  return { rows: Array.isArray(result.rows) ? result.rows : [] }
}

const initializeDatabase = async () => {
  const schemaFile = new URL('./schema2.sql', import.meta.url)
  const schema = await fs.readFile(schemaFile, 'utf8')
  const statements = schema
    .split(/;/g)
    .map((statement) => statement.replace(/^--.*$/gm, '').trim())
    .filter(Boolean)

  for (const statement of statements) {
    await pool.query(statement)
  }
}

const GodAbeg = async (thing, user) => {
  const friend = `${thing.first_name} ${thing.last_name}`.split(' ').join('').trim().toLowerCase()
  const userQuery = await query('SELECT * FROM users WHERE LOWER(first_name || last_name) = $1', [friend])

  const id = userQuery.rows[0].id
  const query_second = await query('SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id = $2', [user.id, id])
  const chat_id = query_second.rows[0].chat_id

  const third_query = await query("SELECT * FROM chatrooms WHERE chat_id = $1", [chat_id])
  const sender_chatrooms = third_query.rows[0]
  const sender_chat_id = sender_chatrooms.chat_id

  const fourth_query = await query("SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id = $2", [sender_chatrooms.reciever_id, sender_chatrooms.sender_id])
  const reciever_chatrooms = fourth_query.rows[0]
  const reciever_chat_Id = reciever_chatrooms.chat_id;

  const fifth_query = await query("SELECT * FROM messages JOIN chatrooms ON messages.chat_id = chatrooms.chat_id WHERE messages.chat_id = $1 OR messages.chat_id = $2 ORDER BY message_id ASC ", [reciever_chat_Id, sender_chat_id])
  const messages = fifth_query.rows
  const getMessage = {
    reciever: `${thing.first_name} ${thing.last_name}`,
    message: messages.length,
    lastElement: messages[messages.length - 1] ? messages[messages.length - 1].message : null,
    lastElementID: messages[messages.length - 1] ? messages[messages.length -1].message_id : null
  }
  return (getMessage)
}

// Room naming helper: every authenticated socket joins a room named after
// their user id, so the server can target "all of this user's tabs/devices"
// without having to track raw socket ids itself.
const userRoom = (userId) => `user_${userId}`

// A second room, scoped to one specific conversation between two users.
// Sorting the ids means both participants compute the exact same room
// name regardless of who is "sender" vs "receiver" in a given message.
const conversationRoom = (idA, idB) => {
  const [a, b] = [idA, idB].sort((x, y) => x - y)
  return `chat_${a}_${b}`
}

io.on('connection', async (socket) => {
  const session = socket.request.session;
  const passport = session?.passport
  if (session && passport) {
    const user = passport.user
    console.log('[socket] authenticated client connected', {
      socketId: socket.id,
      userId: user.id,
      email: user.email,
    });

    // Join a personal room so other handlers can push events straight to
    // this user, on any tab/device they have open, without a refresh.
    socket.join(userRoom(user.id))

    socket.on('getVerif', async()=>{
    try {
      console.log('[socket:getVerif] loading chat list for user', user.id)
      const getContacts = await query("SELECT * FROM friends WHERE user_id = $1", [user.id])
      const contacts = getContacts.rows
      const messageArray = contacts.map((person) => GodAbeg(person, user))
      const result = await Promise.all(messageArray)
      console.log('[socket:getVerif] sending contacts', { userId: user.id, count: result.length })
      socket.emit('messageVerif', JSON.stringify(result))
    } catch (error) {
      console.error('[socket:getVerif] failed', error)
    }
    })
    socket.on('get_posts', async()=>{
    try {
      console.log('[socket:get_posts] loading posts for user', user.id)
      const get_posts = await query('SELECT * FROM friends JOIN stories ON friends.user_id = stories.user_id WHERE friends.user_id = $1',[user.id])
      const posts = get_posts.rows
      console.log('[socket:get_posts] sending posts', { userId: user.id, count: posts.length })
      socket.emit('posts',JSON.stringify(posts))
    } catch (error) {
      console.error('[socket:get_posts] failed', error)
    }
    })
    socket.on('getliked',async(data)=>{
      try {
        const post = JSON.parse(data)
        const get_user_like = await query('SELECT * FROM likes WHERE story_id = $1 AND liker_id = $2',[post.id,user.id])
        socket.emit('getliked_processed',JSON.stringify(get_user_like.rows))
      } catch (error) {
        console.error('[socket:getliked] failed', error)
      }
    })
    socket.on('isliked',async(data)=>{
      try {
        const post = JSON.parse(data)
        const get_user_like = await query('SELECT * FROM likes WHERE story_id = $1 AND liker_id = $2',[post.id,user.id])
        socket.emit('isliked_processed', JSON.stringify(get_user_like.rows))
      } catch (error) {
        console.error('[socket:isliked] failed', error)
      }
    })
    socket.on('get_like_count',async (data)=>{
      try {
        const post = JSON.parse(data)
        const get_likes = await query('SELECT * FROM likes WHERE story_id = $1',[post.id])
        socket.emit('like_count',JSON.stringify(get_likes.rows))
      } catch (error) {
        console.error('[socket:get_like_count] failed', error)
      }
    })
    socket.on('add_like_request',async(data)=>{
    try {
      const post = JSON.parse(data)
      await query('INSERT INTO likes (story_id,liker_id) VALUES ($1,$2)',[post.id,user.id])
      console.log('[socket:add_like_request] added like', { userId: user.id, storyId: post.id })
    } catch (error) {
      console.error('[socket:add_like_request] failed', error)
    }
  })
  socket.on('delete_like_request',async(data)=>{
    try {
      const post = JSON.parse(data)
      await query('DELETE FROM likes WHERE story_id = $1 AND liker_id = $2',[post.id,user.id])
      console.log('[socket:delete_like_request] removed like', { userId: user.id, storyId: post.id })
    } catch (error) {
      console.error('[socket:delete_like_request] failed', error)
    }
  })
  socket.on('getcomment_count',async (data)=>{
   try {
     const post = JSON.parse(data)
     const get_user_comment = await query('SELECT * FROM comments JOIN users ON commenter_id = users.id WHERE post_id = $1',[post.id])
     socket.emit('getcomment_count_processed',JSON.stringify(get_user_comment.rows))
   } catch (error) {
     console.error('[socket:getcomment_count] failed', error)
   }
  })

  socket.on('getcomment',async (data)=>{
    try {
      const post = JSON.parse(data)
      const get_comment = await query('SELECT * FROM comments JOIN users ON commenter_id = users.id WHERE post_id = $1',[post.id])
      socket.emit('getcomment_processed',JSON.stringify(get_comment.rows))
    } catch (error) {
      console.error('[socket:getcomment] failed', error)
    }
  })
  socket.on('add_comment',async (message,data)=>{
    try {
      const post = JSON.parse(data)
      await query('INSERT INTO comments (post_id,commenter_id,comment) VALUES ($1,$2,$3)',[post.id,user.id,message])
      const insertedComment = await query('SELECT * FROM comments WHERE post_id = $1 ORDER BY comment_id DESC LIMIT 1', [post.id])
      console.log('[socket:add_comment] added comment', { userId: user.id, postId: post.id })
      socket.emit('add_comment_processed',insertedComment.rows[0].comment,`${user.first_name} ${user.last_name}`)
    } catch (error) {
      console.error('[socket:add_comment] failed', error)
    }
  })
    socket.on('searches', async (data) => {
      try {
        const searchInput = JSON.parse(data).search
        const result = await query("SELECT * FROM users WHERE LOWER(first_name) LIKE '%' || $1 || '%' AND NOT id = $2", [searchInput.toLowerCase().trim(),user.id])
        const searches = result.rows
        console.log('[socket:searches] search results', { userId: user.id, term: searchInput, count: searches.length })
        socket.emit('getSearch', JSON.stringify(searches))
      } catch (error) {
        console.error('[socket:searches] failed', error)
      }
    })

    socket.on('friend_verification',async(data)=>{
      try {
        const name = data.split(' ').join('').trim().toLowerCase()
        const check_for_friend = await query('SELECT * FROM friends WHERE LOWER(first_name || last_name) = $1 AND user_id = $2',[name,user.id])
        const friend = check_for_friend.rows
        console.log('name is ' + name,user)
        console.log(friend)
        socket.emit('isFriend',JSON.stringify(friend))
      } catch (error) {
        console.error('[socket:friend_verification] failed', error)
      }
    })

    socket.on('follow_request',async (name)=>{
      try {
        const friendName = name.split(' ').join('').trim().toLowerCase()
        const result = await query('SELECT * FROM users WHERE LOWER(first_name || last_name) = $1', [friendName])
        const NewFriend = result.rows[0]
        await query("INSERT INTO friends (first_name, last_name, user_id) VALUES ($1,$2,$3)",
          [NewFriend.first_name, NewFriend.last_name, user.id])
        console.log('[socket:follow_request] friend linked', { userId: user.id, friendId: NewFriend.id })
        socket.emit('follow_request_processed')
      } catch (error) {
        console.error('[socket:follow_request] failed', error)
      }
    })
    socket.on('message_request',async(name)=>{
      try {
        const friendName = name.split(' ').join('').trim().toLowerCase()
        const result = await query('SELECT * FROM users WHERE LOWER(first_name || last_name) = $1', [friendName])
        const NewFriend = result.rows[0]
        await query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES ($1,$2)",
          [user.id, NewFriend.id]
        )
        await query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES ($1,$2)",
          [NewFriend.id, user.id]
        )
        console.log('[socket:message_request] chatrooms created', { senderId: user.id, receiverId: NewFriend.id })
        socket.emit('message_request_processed')
      } catch (error) {
        console.error('[socket:message_request] failed', error)
      }
    })

    socket.on('joinConversation', async (friendName) => {
      try {
        const name = friendName.split(' ').join('').trim().toLowerCase()
        const friendQuery = await query('SELECT * FROM users WHERE LOWER(first_name || last_name) = $1', [name])
        const friend = friendQuery.rows[0]
        if (!friend) {
          console.log('[socket:joinConversation] friend not found', { userId: user.id, friendName })
          return
        }
        const room = conversationRoom(user.id, friend.id)
        // Leave whichever conversation room this socket was previously in,
        // so it doesn't keep receiving live messages for a chat it's no
        // longer looking at.
        if (socket.data.conversationRoom && socket.data.conversationRoom !== room) {
          socket.leave(socket.data.conversationRoom)
        }
        socket.join(room)
        socket.data.conversationRoom = room
        console.log('[socket:joinConversation] joined room', { userId: user.id, friendId: friend.id, room })
      } catch (error) {
        console.error('[socket:joinConversation] failed', error)
      }
    })

    socket.on('getFriend', async (data) => {
      try {
        const name = data.split(' ').join('').trim().toLowerCase()
        const friendQuery = await query('SELECT * FROM users WHERE LOWER(first_name || last_name) = $1', [name])
        const id = friendQuery.rows[0].id
        const query_second = await query('SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id = $2', [user.id, id])
        const chat_id = query_second.rows[0].chat_id

        const first_query = await query("SELECT * FROM chatrooms JOIN users ON reciever_id = users.id WHERE chat_id = $1", [chat_id])
        const reciever = first_query.rows[0]

        const third_query = await query("SELECT * FROM chatrooms WHERE chat_id = $1", [chat_id])
        const sender_chatrooms = third_query.rows[0]
        const sender_chat_id = sender_chatrooms.chat_id

        const fourth_query = await query("SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id = $2", [sender_chatrooms.reciever_id, sender_chatrooms.sender_id])
        const reciever_chatrooms = fourth_query.rows[0]
        const reciever_chat_Id = reciever_chatrooms.chat_id;

        const fifth_query = await query("SELECT * FROM messages JOIN chatrooms ON messages.chat_id = chatrooms.chat_id WHERE messages.chat_id = $1 OR messages.chat_id = $2 ORDER BY message_id ASC ", [reciever_chat_Id, sender_chat_id])
        const messages = fifth_query.rows
        console.log('[socket:getFriend] loaded conversation', { userId: user.id, friend: name, messageCount: messages.length })
        socket.emit('getMessages', JSON.stringify(messages), JSON.stringify(user.id))
      } catch (error) {
        console.error('[socket:getFriend] failed', error)
      }
    })


    socket.on('newChat', async (message, name) => {
      try {
        const friendName = name.split(' ').join('').trim().toLowerCase()
        const friendQuery = await query('SELECT * FROM users WHERE LOWER(first_name || last_name) = $1', [friendName])
        const id = friendQuery.rows[0].id
        const query_second = await query('SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id = $2', [user.id, id])
        const chat_id = query_second.rows[0].chat_id
        await query("INSERT INTO messages (chat_id,message) VALUES ($1,$2)",
          [chat_id, message]
        )
        const new_chat = await query("SELECT * FROM messages ORDER BY message_id DESC LIMIT 1")
        console.log('[socket:newChat] message stored', { userId: user.id, friendId: id, chatId: chat_id })

        // Single emit, reaching everyone in the conversation room —
        // including the sender, since they joined this room too via
        // 'joinConversation'. The sender id rides along so each client
        // can tell "was this mine?" and pick sender_chats vs reciever_chats.
        io.to(conversationRoom(user.id, id)).emit(
          'newMessage',
          JSON.stringify(new_chat.rows[0]),
          user.id,
          `${user.first_name} ${user.last_name}`
        )

        // Sidebar nudge: reaches every tab/device the receiver has open,
        // even ones not currently viewing this conversation, so their
        // chat-list preview updates too.
        io.to(userRoom(id)).emit('chatListUpdate')
      } catch (error) {
        console.error('[socket:newChat] failed', error)
      }
    })
    socket.on('disconnect', () => {
      console.log('[socket] client disconnected', socket.id);
    });
  } else {
    console.log('[socket] user not authenticated');
  }

});





app.get('/', (req, res) => {
  console.log('[route] GET / -> redirect /chatbox')
  res.redirect('/chatbox')
})

app.get('/chatbox', (req, res) => {
  console.log('[route] GET /chatbox', { authenticated: req.isAuthenticated(), sessionId: req.sessionID })
  if (req.isAuthenticated()) {
    const user = req.user
    console.log('[route] rendering home', { userId: user.id, email: user.email })
    res.render('home.ejs', {
      UserName: user.first_name + user.last_name,
      session: req.sessionID,
      UserId: user.id
    })
  }
  else {
    res.redirect('/chatbox/login')
  }
})



app.get('/chatbox/login', (req, res) => {
  console.log('[route] GET /chatbox/login')
  res.render('login.ejs')
});

app.get('/chatbox/register', (req, res) => {
  console.log('[route] GET /chatbox/register')
  res.render('register.ejs')
})



// POST ROUTES

app.post('/chatbox/register', async (req, res) => {
  console.log('[route] POST /chatbox/register', { email: req.body.email, firstName: req.body.first_name, lastName: req.body.last_name })
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const checkResult = result.rows
  if (checkResult.length > 0) {
    console.log('[route] register skipped, email already exists', email)
    res.redirect('/chatbox/login')
  }
  else {
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
      } else {
        await query(
          "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
          [firstName, lastName, email, hash]
        );
        const insertedUser = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = insertedUser.rows[0];
        console.log('[route] register complete, logging in new user', { userId: user.id, email: user.email })
        req.login(user, (err) => {
          if (err) {
            console.log(err);
          }
          res.redirect("/chatbox");
        });
      }
    })
  }
});

app.post('/chatbox/login', passport.authenticate('local',
  {
    successRedirect: '/chatbox',
    failureRedirect: "/chatbox/login"
  }
)
)

app.post("/chatbox/follow/:friendName", async (req, res) => {
  console.log('[route] POST /chatbox/follow/:friendName', { friendName: req.params.friendName, authenticated: req.isAuthenticated() })
  if (req.isAuthenticated()) {
    const name = req.params.friendName
    const user = req.user
    const friendName = req.params.friendName.split(' ').join('').trim().toLowerCase()
    const result = await query('SELECT * FROM users WHERE LOWER(first_name || last_name) = $1', [friendName])
    const NewFriend = result.rows
    if (NewFriend.length !== 0) {
      await query("INSERT INTO friends (first_name, last_name, user_id) VALUES ($1,$2,$3)",
        [NewFriend[0].first_name, NewFriend[0].last_name, user.id])
      await query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES ($1,$2)",
        [user.id, NewFriend[0].id]
      )
      await query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES ($1,$2)",
        [NewFriend[0].id, user.id]
      )
      res.redirect(`/chatbox/search/${name}`)
    }
    else {
      res.redirect(`/chatbox/search/${name}`)
    }
  }
  else {
    res.redirect('/chatbox/login')
  }
})

app.get('/chatbox/search/:fullname', async (req, res) => {
  console.log('[route] GET /chatbox/search/:fullname', { fullname: req.params.fullname, authenticated: req.isAuthenticated() })
  if (req.isAuthenticated()) {
    try {
      const user = req.user;
      const user_fullname = user.first_name + user.last_name
      const current_user = user_fullname.split(' ').join('').trim().toLowerCase()
      const searchedUser = req.params.fullname
      const searched = searchedUser.split(' ').join('').trim().toLowerCase()

      const first_query = await query('SELECT * FROM friends WHERE LOWER(first_name || last_name) = $1 AND user_id = $2', [searched, user.id])
      const first_result = first_query.rows[0]

      const second_query = await query('SELECT * FROM users WHERE LOWER(first_name || last_name) = $1', [searched])
      const second_result = second_query.rows[0]
      const id_for_followed = second_result?.id

      const third_query = await query('SELECT * FROM friends WHERE user_id = $1', [id_for_followed])
      const followCount = third_query.rows.length

      const fourth_query = await query('SELECT * FROM friends WHERE LOWER(first_name || last_name) = $1', [searched])
      const is_followed_count = fourth_query.rows.length

      const fifth_query = await query('SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id = $2', [user.id, second_result.id])
      const fifth_result = fifth_query.rows[0]
      const chatID = fifth_result ? fifth_result.chat_id : null

      console.log('[route] rendering profile', {
        userId: user.id,
        searchedUser,
        follow: Boolean(first_result),
        followingCount: followCount,
        followerCount: is_followed_count,
        chatID,
      })

      res.render('profile.ejs',
        {
          current_user: current_user,
          searched: searched,
          User: searchedUser,
          follow: first_result,
          followingCount: followCount,
          followerCount: is_followed_count,
          UserName: user.first_name + user.last_name,
          chatID: chatID,
          UserId: user.id
        })
    } catch (error) {
      console.error('[route] GET /chatbox/search/:fullname failed', error)
      res.status(500).send('Unable to load profile')
    }
  }
  else {
    res.redirect('/chatbox/login')
  }
})

app.get('/chatbox/inbox/:chatID', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const chatID = req.params.chatID
      const user = req.user

      const first_query = await query("SELECT * FROM chatrooms JOIN users ON reciever_id = users.id WHERE chat_id = $1", [chatID])
      const reciever = first_query.rows[0]
      if (!reciever) {
        console.log('[route] inbox missing receiver row', { chatID, userId: user.id })
        return res.status(404).send('Chat not found')
      }
      const reciever_fullname = reciever.first_name + " " + reciever.last_name

      const third_query = await query("SELECT * FROM chatrooms WHERE chat_id = $1", [chatID])
      const sender_chatrooms = third_query.rows[0]
      if (!sender_chatrooms) {
        console.log('[route] inbox missing sender chatroom row', { chatID, userId: user.id })
        return res.status(404).send('Chat not found')
      }
      const sender_chat_id = sender_chatrooms.chat_id

      const fourth_query = await query("SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id = $2", [sender_chatrooms.reciever_id, sender_chatrooms.sender_id])
      const reciever_chatrooms = fourth_query.rows[0]
      if (!reciever_chatrooms) {
        console.log('[route] inbox missing reverse chatroom row', { chatID, userId: user.id })
        return res.status(404).send('Chat not found')
      }
      const reciever_chat_Id = reciever_chatrooms.chat_id;

      const fifth_query = await query("SELECT * FROM messages JOIN chatrooms ON messages.chat_id = chatrooms.chat_id WHERE messages.chat_id = $1 OR messages.chat_id = $2", [reciever_chat_Id, sender_chat_id])
      const messages = fifth_query.rows

      console.log('[route] rendering inbox', {
        userId: user.id,
        reciever: reciever_fullname,
        messageCount: messages.length,
      })

      res.render('inbox.ejs', {
        UserName: user.first_name + " " + user.last_name,
        reciever: reciever_fullname,
        messages: messages,
        UserId: user.id,
      })
    }
    catch (error) {
      console.error('[route] GET /chatbox/inbox/:chatID failed', error)
      res.status(500).send('Unable to load inbox')
    }
  }
  else {
    res.redirect('/chatbox/login')
  }
})

passport.use('local',
  new Strategy(async function verify(username, password, cb) {
    try {
      console.log('[auth] login attempt', { username })
      const result = await query("SELECT * FROM users WHERE email = $1", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              console.log('[auth] login success', { userId: user.id, email: user.email })
              return cb(null, user);
            } else {
              console.log('[auth] login failed - bad password', { username })
              return cb(null, false);
            }
          }
        });
      } else {
        console.log('[auth] login failed - user not found', { username })
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
)

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});


const startServer = async () => {
  try {
    await initializeDatabase()
    server.listen(port, () => {
      console.log(`server is running at port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start the server. Check that PostgreSQL is running and DATABASE_URL is correct.');
    console.error(error);
    process.exit(1);
  }
}

startServer();