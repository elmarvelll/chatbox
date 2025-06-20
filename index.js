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
  const chat_id = query_second.rows[0] ? query_second.rows[0].chat_id : null

  if(chat_id != null){

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
  else{
    return {}
  }
}
const get_likes = async(data,user) =>{
  const get_user_like = await db.query('SELECT * FROM likes WHERE story_id = $1 AND liker_id = $2',[data.id,user.id])
  const get_likes = await db.query('SELECT * FROM likes WHERE story_id = $1',[data.id])
  const result = {
    user_like : get_user_like.rows.length,
    total_likes : get_likes.rows.length
  }
  return result
}
const get_comment = async(data,user)=>{
const get_comments_query = await db.query('SELECT * FROM public.comments JOIN users ON commenter_id = users.id WHERE post_id = $1',[data.id])
const comments = get_comments_query.rows
const all_comment_array = []
comments.forEach((comment)=>{
  const all_comments = {
    name : comment.first_name + " " + comment.last_name,
    comment : comment.comment
  }
  all_comment_array.push(all_comments)
})
const result = {
  post_id : data.id,
  comments : all_comment_array
}

return result
}

io.on('connection', async (socket) => {
  const session = socket.handshake.session;
  const passport = socket.handshake.session.passport
  if (session && passport) {
    const user = passport.user
    console.log('User authenticated');
    console.log('A client connected');
    socket.join(`room ${user.id}`)

    socket.on('getid',()=>{
      socket.emit('gottenId',user.id)
    })


    socket.on('getVerif', async()=>{
    const getContacts = await db.query("SELECT * FROM friends WHERE user_id = $1 ", [user.id])
    const get_rooms = await db.query('SELECT * FROM chatrooms WHERE sender_id = $1',[user.id])
    const get_groups = await db.query('SELECT * FROM group_friends WHERE member_id = $1',[user.id])
    get_rooms.rows.forEach((room)=>{
      socket.join(`room ${room.sender_id}:${room.reciever_id}`)
    })
    get_groups.rows.forEach((group)=>{
      socket.join(`group ${group.group_id}`)
    })
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
    const like_array = []
    const comment_array = []
    const test_array = []
    // const get_posts = await db.query('SELECT * FROM friends JOIN stories ON user_friend_id = stories.user_id WHERE friends.user_id = $1',[user.id]) 
    const get_posts = await db.query('SELECT friends.user_id, first_name,last_name,stories.id,header,body FROM friends JOIN stories ON user_friend_id = stories.user_id WHERE friends.user_id = $1 UNION SELECT users.id, first_name,last_name,stories.id,header,body FROM users JOIN stories ON users.id = stories.user_id WHERE users.id = $1 ORDER by id ASC',[user.id])
    const posts = get_posts.rows
    console.log(user)
    socket.emit('posts',JSON.stringify(posts),JSON.stringify(user))
    posts.forEach((post)=>{
    like_array.push(get_likes(post,user))
    test_array.push(get_likes(post,user))
    comment_array.push(get_comment(post))
    })
    Promise.all(comment_array)
    .then((result)=>{
      socket.emit('all_comments',JSON.stringify(result))
    })

    Promise.all(like_array)
    .then((result)=>{
      socket.emit('getliked_processed',JSON.stringify(result),JSON.stringify(posts))
    })
    })
    const check_for_notification= async(data)=>{
     const check_for_friend = await db.query('SELECT FROM friends WHERE user_id = $1 AND user_friend_id = $2', [user.id,data.user_id])
     const friend = await db.query('SELECT * FROM users WHERE id = $1',[data.user_id])
     if(check_for_friend.rows.length != 0){
      return 
     }
     else{
      return friend.rows[0]
     }
    }

    socket.on('notifications',async()=>{
      const friend_query = await db.query('SELECT * FROM friends WHERE user_friend_id = $1',[user.id])
      const added_me = friend_query.rows
      const Notification_array =  []
      if(added_me.length != 0){
        added_me.forEach((person)=>{
          const friend_request_details = check_for_notification(person)
        Notification_array.push(friend_request_details)
        })
        Promise.all(Notification_array)
        .then((result)=>{
          const requests = result.filter((item)=>item != undefined)
          socket.emit('notification_check_complete',JSON.stringify(requests))
        })
      } 
      else{ 
        console.log('you dont have any friends yet')
      }
    })

    socket.on('isliked',async(data)=>{
      const post = JSON.parse(data)
      const get_user_like = await db.query('SELECT * FROM likes WHERE story_id = $1 AND liker_id =$2',[post.id,user.id])
      if(get_user_like.rows.length == 0){ 
        await db.query('INSERT INTO likes (story_id,liker_id) VALUES ($1,$2)',[post.id,user.id])
      }
      else{
        await db.query('DELETE FROM likes WHERE story_id = $1 AND liker_id = $2',[post.id,user.id])
      }

      const get_likes = await db.query('SELECT * FROM likes WHERE story_id = $1',[post.id])
      socket.emit('isliked_processed', JSON.stringify(get_user_like.rows),JSON.stringify(get_likes.rows))
    })


    socket.on('comment_button_clicked', async (data)=>{
      const post_id = JSON.parse(data).post_id
      const comment_query = await db.query('SELECT * FROM public.comments JOIN users ON commenter_id = users.id WHERE post_id = $1',[post_id])
      const comment = comment_query.rows
      socket.emit('comments',JSON.stringify(comment))
    })

  socket.on('getcomment_count',async (data)=>{
   const post = JSON.parse(data)
   const get_user_comment = await db.query('SELECT * FROM public.comments JOIN users ON commenter_id = users.id WHERE post_id = $1',[post.id])
   socket.emit('getcomment_count_processed',JSON.stringify(get_user_comment.rows))
  })

  socket.on('getcomment',async (data)=>{
    const post = JSON.parse(data)
    const get_comment = await db.query('SELECT * FROM public.comments JOIN users ON commenter_id = users.id WHERE post_id = $1',[post.id])
    socket.emit('getcomment_processed',JSON.stringify(get_comment.rows))
  })
  socket.on('add_comment',async (message,data)=>{
    const post = JSON.parse(data)
   const new_comment = await db.query('INSERT INTO comments (post_id,commenter_id,comment) VALUES($1,$2,$3) RETURNING *',[post.post_id,user.id,message])
   socket.emit('add_comment_processed',new_comment.rows[0].comment,`${user.first_name} ${user.last_name}`)
  })
    socket.on('searches', async (data) => {
      const searchInput = JSON.parse(data).search
      const result = await db.query("SELECT * FROM users WHERE LOWER(first_name) LIKE '%' || $1 || '%' AND NOT id = $2", [searchInput.toLowerCase().trim(),user.id])
      const searches = result.rows
      socket.emit('getSearch', JSON.stringify(searches))
    })

    socket.on('friend_verification',async(data, array)=>{
      const name = data.split(' ').join('').trim().toLowerCase()
      const check_for_friend = await db.query('SELECT * from friends WHERE LOWER (first_name || last_name) = $1 AND user_id = $2',[name,user.id])
      const friend = check_for_friend.rows
      console.log('once')
      socket.emit('isFriend',JSON.stringify(friend),data,array)
    })



    socket.on('follow_request',async (name)=>{
      const friendName = name.split(' ').join('').trim().toLowerCase()
      const result = await db.query('SELECT * FROM users WHERE LOWER(first_name || last_name )= $1', [friendName])
      const NewFriend = result.rows[0]
      await db.query("INSERT INTO friends (first_name, last_name, user_id, user_friend_id) VALUES ($1,$2,$3,$4)",
        [NewFriend.first_name, NewFriend.last_name, user.id, NewFriend.id])
        console.log('you are now following '+ name)
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
      socket.emit('message_request_processed',name)
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

      const fifth_query = await db.query("SELECT * FROM messages JOIN chatrooms ON messages.chat_id = chatrooms.chat_id WHERE messages.chat_id = $1 OR messages.chat_id = $2 ORDER BY time_of_chats ASC ", [reciever_chat_Id, sender_chat_id])
      const messages = fifth_query.rows
      socket.emit('getMessages', JSON.stringify(messages), JSON.stringify(user.id))
    })


    socket.on('newChat', async (message, friend_name) => {
      const friendName = friend_name.split(' ').join('').trim().toLowerCase()
      const name = `${user.first_name} ${user.last_name}`
      const date = new Date()
      const query = await db.query('SELECT * FROM users WHERE LOWER (first_name || last_name) = $1', [friendName])
      const id = query.rows[0].id
      const query_second = await db.query('SELECT * from chatrooms WHERE sender_id = $1  AND reciever_id = $2', [user.id, id])
      const chat_id = query_second.rows[0].chat_id
      const query_third = await db.query('SELECT * from chatrooms WHERE reciever_id = $1  AND sender_id = $2', [user.id, id])
      const reciever_chat_id = query_third.rows[0].chat_id
      const message_query= await db.query('SELECT * FROM messages WHERE chat_id = $1 OR chat_id = $2',[chat_id,reciever_chat_id])
      const last_message = message_query.rows[message_query.rows.length-1]
      const new_chat = await db.query("INSERT INTO messages (chat_id,message,time_of_chats) VALUES ($1,$2,$3) RETURNING *",
        [chat_id, message,date]
      )
      io.to(`room ${id}:${user.id}`).emit('addChat',name, JSON.stringify(new_chat.rows[0]),JSON.stringify(last_message),"recieved","friend")
      io.to(socket.id).emit('addChat',friend_name, JSON.stringify(new_chat.rows[0]),JSON.stringify(last_message),"sent","friend")
    }) 
    socket.on('group_newChat',async (message, name) =>{ 
      const date = new Date()
      const group_id_query = await db.query('SELECT group_id from group_rooms WHERE group_name = $1',[name])
      const group_id = group_id_query.rows[0].group_id
      socket.rooms.has(`group ${group_id}`) && socket.leave(`group ${group_id}`)
      await db.query('INSERT INTO group_chats (group_id,message,sender_id,time_of_chats) VALUES ($1,$2,$3,$4)',[group_id,message,user.id,date])
      const chat_query = await db.query('SELECT * FROM group_chats JOIN users ON sender_id = users.id')
      const previous_chat = chat_query.rows[chat_query.rows.length-2]
      const new_chat = chat_query.rows[chat_query.rows.length-1]
      io.to(`group ${group_id}`).emit('addChat',name, JSON.stringify(new_chat),JSON.stringify(previous_chat)? JSON.stringify(previous_chat) : JSON.stringify(previous_chat),"recieved","group")
      io.to(socket.id).emit('addChat',name, JSON.stringify(new_chat),JSON.stringify(previous_chat)? JSON.stringify(previous_chat) : JSON.stringify(previous_chat),"sent","group")
      socket.join(`group ${group_id}`)
    })
    socket.on('get_group_chats',async (name)=>{
      const group_id_query = await db.query('SELECT group_id from group_rooms WHERE group_name = $1',[name])
      const group_id = group_id_query.rows[0].group_id
      const get_messages = await db.query('SELECT * FROM group_chats JOIN users ON group_chats.sender_id = users.id WHERE group_id = $1 ',[group_id])
      socket.emit('gotten_group_chats',JSON.stringify(get_messages.rows),user.id)
    })

    socket.on('add_new_post',async (header,body) => {
    console.log(header)
    console.log(body)
    await db.query('INSERT INTO stories (user_id,header,body) VALUES ($1,$2,$3)',[user.id,header,body])
    })
  socket.on('getfriends', async ()=>{
    const getContacts = await db.query("SELECT * FROM friends WHERE user_id = $1 ", [user.id])
    const contacts = getContacts.rows
    socket.emit('allfriends',JSON.stringify(contacts))
    })

    socket.on('group_check',async()=>{
      const check = await db.query('SELECT * FROM group_friends WHERE member_id = $1 ',[user.id])
      socket.emit('group_check_complete',JSON.stringify(check.rows))
    })
    
  socket.on('get_group_friend',async (input)=>{
    const searchInput = input.name
    const result = await db.query("SELECT * FROM users WHERE LOWER(first_name) LIKE '%' || $1 || '%' AND NOT id = $2", [searchInput.toLowerCase().trim(),user.id])
    const searches = result.rows
    socket.emit('gotten_group_friend', JSON.stringify(searches))
  })


socket.on('form_group',async (input)=>{
  console.log('formed new group')
   const new_group = await db.query('INSERT INTO group_rooms (group_name) VALUES ($1) RETURNING group_id',[input.name])
   const group_id= new_group.rows[0].group_id
   await db.query('INSERT INTO group_friends (group_id, member_id) VALUES ($1,$2)',[group_id,user.id])
   input.friends.forEach(async(friend)=>{
    const friendName = friend.split(' ').join('').trim().toLowerCase()
    const query = await db.query('SELECT * FROM users WHERE LOWER (first_name || last_name) = $1', [friendName])
    const friend_id = query.rows[0].id
    await db.query('INSERT INTO group_friends (group_id, member_id) VALUES ($1,$2)',[group_id,friend_id])
})
})

socket.on('add_new_member',async(input)=>{
  console.log(input)
  const get_group = await db.query('SELECT * FROM group_rooms WHERE group_name = $1',[input.name])
  const get_group_members = await db.query('SELECT member_id FROM public.group_friends')
  const group_id = get_group.rows[0].group_id
  const group_members = get_group_members.rows
  input.friends.forEach(async(friend)=>{
   const friendName = friend.split(' ').join('').trim().toLowerCase()
   const query = await db.query('SELECT * FROM users WHERE LOWER (first_name || last_name) = $1', [friendName])
   const friend_id = query.rows[0].id
   !group_members.includes(friend_id) && await db.query('INSERT INTO group_friends (group_id, member_id) VALUES ($1,$2)',[group_id,friend_id])
})
})

socket.on('get_groups', async(data)=>{
  const user_groups = JSON.parse(data)
  const groups_array = [];
 user_groups.forEach(group=>{
  groups_array.push(getGroups(group))
  })
  Promise.all(groups_array)
  .then((result)=>{
    socket.emit('gotten_groups',JSON.stringify(result))
  })
})


    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  } else {
    console.log('User not authenticated');
  }

});

const getGroups = async (group)=>{
   const groups_query = await db.query('SELECT * FROM group_rooms WHERE group_id = $1',[group.group_id])
   const groups = groups_query.rows[0]
   return groups
 }



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






// create table stories(
//   id serial primary key,
//   user_id integer references users(id),
//   header varchar(300),
//   body varchar(300)
//   );
//   create table comments(
//   post_id integer references stories(id),
//   commenter_id integer references users(id),
//   comment varchar(300)
//   );
//   create table likes(
//   story_id integer references stories(id),
//   liker_id integer references users(id)
//   );
//   create table friends(
//   id serial primary key,
//   user_id integer references users(id),
//   first_name varchar(300),
//   last_name varchar(300),
//   user_friend_id integer references users(id)
//   )
  