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
import sharedsession from "express-socket.io-session"

const app = express();
const saltRounds = 10;
const { Client } = pg;
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
io.use(sharedsession(sessionMiddleware, {
  autoSave: true
}))
app.use(passport.initialize());
app.use(passport.session());
const db = new Client({
  user: 'postgres',
  password: 'elmarvel',
  host: 'localhost',
  port: 5432,
  database: 'ChatboxDB',
});
db.connect();
const GodAbeg = async (thing, user) => {
  const friend = `${thing.first_name} ${thing.last_name}`.split(' ').join('').trim().toLowerCase()
  const query = await db.query('SELECT * FROM users WHERE LOWER (first_name || last_name) = $1', [friend])

  const id = query.rows[0].id
  const query_second = await db.query('SELECT * from chatrooms WHERE sender_id = $1  AND reciever_id = $2', [user.id, id])
  const chat_id = query_second.rows[0].chat_id

  const third_query = await db.query("SELECT * FROM chatrooms WHERE chat_id = $1", [chat_id])
  const sender_chatrooms = third_query.rows[0]
  const sender_chat_id = sender_chatrooms.chat_id

  const fourth_query = await db.query("SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id =$2", [sender_chatrooms.reciever_id, sender_chatrooms.sender_id])
  const reciever_chatrooms = fourth_query.rows[0]
  const reciever_chat_Id = reciever_chatrooms.chat_id;

  const fifth_query = await db.query("SELECT * FROM messages JOIN chatrooms ON messages.chat_id = chatrooms.chat_id WHERE messages.chat_id = $1 OR messages.chat_id = $2 ORDER BY message_id ASC ", [reciever_chat_Id, sender_chat_id])
  const messages = fifth_query.rows
  const getMessage = {
    reciever: `${thing.first_name} ${thing.last_name}`,
    message: messages.length,
    lastElement: messages[messages.length - 1] ? messages[messages.length - 1].message : null,
    lastElementID: messages[messages.length - 1] ? messages[messages.length -1].message_id : null
  }
  return (getMessage)
}

io.on('connection', async (socket) => {
  const session = socket.handshake.session;
  const passport = socket.handshake.session.passport
  if (session && passport) {
    const user = passport.user
    console.log('User authenticated');
    console.log('A client connected');

    socket.on('getVerif', async()=>{
    const getContacts = await db.query("SELECT * FROM friends WHERE user_id = $1 ", [user.id])
    const contacts = getContacts.rows
    const messageArray = []
    contacts.forEach(async (person) => {
      messageArray.push(GodAbeg(person, user))
    })
      Promise.all(messageArray)
      .then((result) => {
        socket.emit('messageVerif', JSON.stringify(result))
      })
    })
    socket.on('get_posts', async()=>{
    const get_posts = await db.query('SELECT * FROM public.friends JOIN stories ON user_friend_id = stories.user_id WHERE friends.user_id = $1',[user.id]) 
    const posts = get_posts.rows
    socket.emit('posts',JSON.stringify(posts))
    })
    socket.on('getliked',async(data)=>{
      const post = JSON.parse(data)
      const get_user_like = await db.query('SELECT FROM likes WHERE story_id = $1 AND liker_id =$2',[post.id,user.id])
      socket.emit('getliked_processed',JSON.stringify(get_user_like.rows))
    })
    socket.on('isliked',async(data)=>{
      const post = JSON.parse(data)
      const get_user_like = await db.query('SELECT FROM likes WHERE story_id = $1 AND liker_id =$2',[post.id,user.id])
      socket.emit('isliked_processed', JSON.stringify(get_user_like.rows))
    })
    socket.on('get_like_count',async (data)=>{
      const post = JSON.parse(data)
      const get_likes = await db.query('SELECT * FROM likes WHERE story_id = $1',[post.id])
      socket.emit('like_count',JSON.stringify(get_likes.rows))
    })
    socket.on('add_like_request',async(data)=>{
    const post = JSON.parse(data)
    await db.query('INSERT INTO likes (story_id,liker_id) VALUES ($1,$2)',[post.id,user.id])
  })
  socket.on('delete_like_request',async(data)=>{
    const post = JSON.parse(data)
    await db.query('DELETE FROM likes WHERE story_id = $1 AND liker_id = $2',[post.id,user.id])
  })
  socket.on('getcomment_count',async (data)=>{
   const post = JSON.parse(data)
   const get_user_comment = await db.query('SELECT * FROM public.comments JOIN users ON commenter_id = users.id WHERE post_id = $1',[post.id])
   console.log(get_user_comment.rows)
   socket.emit('getcomment_count_processed',JSON.stringify(get_user_comment.rows))
  })

  socket.on('getcomment',async (data)=>{
    const post = JSON.parse(data)
    const get_comment = await db.query('SELECT * FROM public.comments JOIN users ON commenter_id = users.id WHERE post_id = $1',[post.id])
    socket.emit('getcomment_processed',JSON.stringify(get_comment.rows))
  })
  socket.on('add_comment',async (message,data)=>{
    const post = JSON.parse(data)
   const new_comment = await db.query('INSERT INTO comments (post_id,commenter_id,comment) VALUES($1,$2,$3) RETURNING *',[post.id,user.id,message])
   socket.emit('add_comment_processed',new_comment.rows[0].comment,`${user.first_name} ${user.last_name}`)
  })
    socket.on('searches', async (data) => {
      const searchInput = JSON.parse(data).search
      const result = await db.query("SELECT * FROM users WHERE LOWER(first_name) LIKE '%' || $1 || '%' AND NOT id = $2", [searchInput.toLowerCase().trim(),user.id])
      const searches = result.rows
      socket.emit('getSearch', JSON.stringify(searches))
    })

    socket.on('friend_verification',async(data)=>{
      const name = data.split(' ').join('').trim().toLowerCase()
      const check_for_friend = await db.query('SELECT * from friends WHERE LOWER (first_name || last_name) = $1',[name])
      const friend = check_for_friend.rows
      socket.emit('isFriend',JSON.stringify(friend))
    })

    socket.on('follow_request',async (name)=>{
      const friendName = name.split(' ').join('').trim().toLowerCase()
      const result = await db.query('SELECT * FROM users WHERE LOWER(first_name || last_name )= $1', [friendName])
      const NewFriend = result.rows[0]
      await db.query("INSERT INTO friends (first_name, last_name, user_id) VALUES ($1,$2,$3)",
        [NewFriend.first_name, NewFriend.last_name, user.id])
        socket.emit('follow_request_processed')
    })
    socket.on('message_request',async(name)=>{
      const friendName = name.split(' ').join('').trim().toLowerCase()
      const result = await db.query('SELECT * FROM users WHERE LOWER(first_name || last_name )= $1', [friendName])
      const NewFriend = result.rows[0]
      await db.query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES ($1,$2)",
        [user.id, NewFriend.id]
      )
      await db.query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES ($1,$2)",
        [NewFriend.id, user.id]
      )
      socket.emit('message_request_processed')
    })

    socket.on('getFriend', async (data) => {
      const name = data.split(' ').join('').trim().toLowerCase()
      const query = await db.query('SELECT * FROM users WHERE LOWER (first_name || last_name) = $1', [name])
      const id = query.rows[0].id
      const query_second = await db.query('SELECT * from chatrooms WHERE sender_id = $1  AND reciever_id = $2', [user.id, id])
      const chat_id = query_second.rows[0].chat_id

      const first_query = await db.query("SELECT * FROM  chatrooms JOIN users ON reciever_id = users.id WHERE chat_id = $1", [chat_id])
      const reciever = first_query.rows[0]

      const third_query = await db.query("SELECT * FROM chatrooms WHERE chat_id = $1", [chat_id])
      const sender_chatrooms = third_query.rows[0]
      const sender_chat_id = sender_chatrooms.chat_id

      const fourth_query = await db.query("SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id =$2", [sender_chatrooms.reciever_id, sender_chatrooms.sender_id])
      const reciever_chatrooms = fourth_query.rows[0]
      const reciever_chat_Id = reciever_chatrooms.chat_id;

      const fifth_query = await db.query("SELECT * FROM messages JOIN chatrooms ON messages.chat_id = chatrooms.chat_id WHERE messages.chat_id = $1 OR messages.chat_id = $2 ORDER BY message_id ASC ", [reciever_chat_Id, sender_chat_id])
      const messages = fifth_query.rows
      socket.emit('getMessages', JSON.stringify(messages), JSON.stringify(user.id))
    })


    socket.on('newChat', async (message, name) => {
      const friendName = name.split(' ').join('').trim().toLowerCase()
      const query = await db.query('SELECT * FROM users WHERE LOWER (first_name || last_name) = $1', [friendName])
      const id = query.rows[0].id
      const query_second = await db.query('SELECT * from chatrooms WHERE sender_id = $1  AND reciever_id = $2', [user.id, id])
      const chat_id = query_second.rows[0].chat_id
      const new_chat = await db.query("INSERT INTO messages (chat_id,message) VALUES ($1,$2) RETURNING *",
        [chat_id, message]
      )
      socket.emit('addChat', JSON.stringify(new_chat.rows[0]))
    })
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  } else {
    console.log('User not authenticated');
  }

});





app.get('/', (req, res) => {
  res.redirect('/chatbox')
})

app.get('/chatbox', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user
    res.render('home.ejs', {
      UserName: user.first_name + user.last_name,
      session: req.sessionID
    })
  }
  else {
    res.redirect('/chatbox/login')
  }
})



app.get('/chatbox/login', (req, res) => {
  res.render('login.ejs')
});

app.get('/chatbox/register', (req, res) => {
  res.render('register.ejs')
})



// POST ROUTES

app.post('/chatbox/register', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const result = await db.query('SELECT * FROM users WHERE email = $1 ', [email]);
  const checkResult = result.rows
  if (checkResult.length > 0) {
    res.redirect('/chatbox/login')
  }
  else {
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
      } else {
        const result = await db.query(
          "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
          [firstName, lastName, email, hash]
        );
        const user = result.rows[0];
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
  if (req.isAuthenticated()) {
    const name = req.params.friendName
    const user = req.user
    const friendName = req.params.friendName.split(' ').join('').trim().toLowerCase()
    const result = await db.query('SELECT * FROM users WHERE LOWER(first_name || last_name )= $1', [friendName])
    const NewFriend = result.rows
    if (NewFriend.length !== 0) {
      await db.query("INSERT INTO friends (first_name, last_name, user_id) VALUES ($1,$2,$3)",
        [NewFriend[0].first_name, NewFriend[0].last_name, user.id])
      await db.query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES ($1,$2)",
        [user.id, NewFriend[0].id]
      )
      await db.query("INSERT INTO chatrooms (sender_id, reciever_id) VALUES ($1,$2)",
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

passport.use('local',
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
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
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
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


server.listen(port, (req, res) => {
  console.log(`server is running at port ${port}`)
})



// app.get('/chatbox/search/:fullname', async (req, res) => {
//   if (req.isAuthenticated()) {
//     const user = req.user;
//     const user_fullname = user.first_name + user.last_name
//     const current_user = user_fullname.split(' ').join('').trim().toLowerCase()
//     const searchedUser = req.params.fullname
//     const searched = searchedUser.split(' ').join('').trim().toLowerCase()



//     const first_query = await db.query('SELECT * FROM friends WHERE LOWER (first_name || last_name) = $1 AND user_id = $2',
//       [searched, user.id]
//     )
//     const first_result = first_query.rows[0]



//     const second_query = await db.query('SELECT * FROM users WHERE LOWER (first_name || last_name) = $1',
//       [searched]
//     )
//     const second_result = second_query.rows[0]
//     const id_for_followed = second_result.id



//     const third_query = await db.query('SELECT * FROM friends WHERE user_id =$1',
//       [id_for_followed]
//     )
//     const followCount = third_query.rows.length



//     const fourth_query = await db.query('SELECT * FROM friends WHERE LOWER (first_name || last_name) = $1',
//       [searched]
//     )
//     const is_followed_count = fourth_query.rows.length



//     const fifth_query = await db.query('SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id = $2',
//       [user.id, second_result.id]
//     )
//     const fifth_result = fifth_query.rows[0]
//     const chatID = fifth_result ? fifth_result.chat_id : null




//     res.render('profile.ejs',
//       {
//         current_user: current_user,
//         searched: searched,
//         User: searchedUser,
//         follow: first_result,
//         followingCount: followCount,
//         followerCount: is_followed_count,
//         UserName: user.first_name + user.last_name,
//         chatID: chatID
//       })
//   }
//   else {
//     res.redirect('/chatbox/login')
//   }
// })

// app.get('/chatbox/inbox/:chatID', async (req, res) => {
//   if (req.isAuthenticated()) {
//     const chatID = req.params.chatID
//     const user = req.user


//     const first_query = await db.query("SELECT * FROM  chatrooms JOIN users ON reciever_id = users.id WHERE chat_id = $1",
//       [chatID]
//     )
//     const reciever = first_query.rows[0]
//     const reciever_fullname = reciever.first_name + " " + reciever.last_name

//     const third_query = await db.query("SELECT * FROM chatrooms WHERE chat_id = $1",
//       [chatID]
//     )
//     const sender_chatrooms = third_query.rows[0]
//     const sender_chat_id = sender_chatrooms.chat_id

//     const fourth_query = await db.query("SELECT * FROM chatrooms WHERE sender_id = $1 AND reciever_id =$2",
//       [sender_chatrooms.reciever_id, sender_chatrooms.sender_id]
//     )
//     const reciever_chatrooms = fourth_query.rows[0]
//     const reciever_chat_Id = reciever_chatrooms.chat_id;

//     const fifth_query = await db.query("SELECT * FROM messages JOIN chatrooms ON messages.chat_id = chatrooms.chat_id WHERE messages.chat_id = $1 OR messages.chat_id = $2",
//       [reciever_chat_Id, sender_chat_id]
//     )
//     const messages = fifth_query.rows




//     res.render('inbox.ejs', {
//       UserName: user.first_name + " " + user.last_name,
//       reciever: reciever_fullname,
//     })
//   }
//   else {
//     res.redirect('/chatbox/login')
//   }
// })
