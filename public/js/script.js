
const input = document.querySelector('#search');
const searchdiv = document.querySelector('#searchDivs');
const vertical_menu = document.querySelector('#vertical-menu');
const form = document.getElementById("message_form")
let originalHTML = vertical_menu.innerHTML
const send_message = document.getElementById('send_message')
const group_send_message = document.getElementById('group_send_message')
const post_body = document.querySelector('.post_box')
const baseHTML = document.querySelector('body').innerHTML
const notification_div = document.querySelector('.notification_div')
const hour_in_ms = 3600000
const message_button = document.getElementById('message_button')
const message_form = document.getElementById('message_form')
const group_message_form = document.getElementById('group_message_form')
const groupButton = document.getElementById('group_button')
const post_story = document.querySelector('#post_input')
const post_form = document.querySelector('.post_form')
const get_posts = document.getElementById('get_posts')
const post_button = document.getElementById('post_button')

// profile.ejs


const socket = io()

socket.on('connect', () => {
    console.log('connected to server')
    console.log(socket.id)

})

socket.emit('getVerif')
socket.emit('get_posts')
socket.emit('group_check')
socket.emit('notifications')


const sendData = async (event) => {
    try {
        const name = input.name
        let value = event.target.value;
        let dataArray = []
        const search = {
            [name]: value
        }
            if (input.value.trim() !== "") {
                console.log('heyy')
                vertical_menu.innerHTML = ""
                socket.emit('searches', JSON.stringify(search))
            }
            else if (input.value == "") {
                socket.emit('getVerif')
            }

    }
    catch (error) {
        console.log(error)
    }
}
function debounce(cb, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => cb(...args), wait);
    };
}
input.addEventListener('input', debounce(sendData, 500))

socket.on('getSearch', (data) => {
    dataArray = JSON.parse(data)
    console.log(dataArray)

if (dataArray.length == 0) {
    vertical_menu.innerHTML = `<p>No Results Found</p>`
} else {
    const chat_sign = document.createElement('h3');
    chat_sign.innerHTML = 'CHAT'
    vertical_menu.appendChild(chat_sign)
    dataArray.forEach(list => {
        const new_list = document.createElement('p');
        new_list.innerHTML = ` ${list.first_name} ${list.last_name}`
        new_list.className = "name_div" 
        new_list.id = "name_div"
        vertical_menu.appendChild(new_list) 
    });
    const name_div = document.querySelectorAll('#name_div');
    const profile_container = document.querySelector('.profile_container')
    name_div.forEach((div) => {
        div.addEventListener('click', () => {
            socket.emit('friend_verification', div.innerHTML,data)
        })
    })
}
})


socket.on('isFriend', (data,name,Array) => {
    const dataArray= JSON.parse(Array)
    console.log('more thatn once')
    const chat_container = document.getElementById('chat_container')
    const friend = JSON.parse(data)
    if (friend.length !== 0) {
        chat_container.innerHTML = ""
        const reciever_div = document.createElement('div')
        reciever_div.className('reciever_div')
        const reciever_title = document.createElement('div')
        reciever_title.className = "reciever_title"
        const chat_area = document.createElement('div')
        chat_area.id = "chat_area"
        chat_area.className = "chat_area"
        dataArray.forEach((data) => {
            const fullName = `${data.first_name} ${data.last_name}`
            if (fullName.split(' ').join('').trim().toLowerCase() == name.split(' ').join('').trim().toLowerCase()) {
                reciever_title.innerHTML = name
                reciever_title.addEventListener('click', () => {
                    show_profile(chat_container, reciever_title.innerHTML, friend.length)
                })
                socket.emit('getFriend', fullName)
                socket.on('getMessages', (data, user_id) => {
                    const messages = JSON.parse(data)
                    chat_area.innerHTML = ""
                    messages.forEach((chat) => {
                        const time = document.createElement('div')
                        time.className = 'time'
                        time.innerHTML = `${new Date(chat.time_of_chats).toLocaleDateString()}, ${new Date(chat.time_of_chats).toLocaleTimeString([],{hour: '2-digit',minute:'2-digit'})}`
                        const div = document.createElement('div')
                        div.innerHTML = chat.message

                        if(messages.indexOf(chat) == 0){
                            chat_area.appendChild(time)
                           }
                        else if(new Date(chat.time_of_chats).getTime() - new Date(messages[messages.indexOf(chat)-1].time_of_chats).getTime() > hour_in_ms){
                            chat_area.appendChild(time)
                        }
                        if (chat.sender_id == user_id) {
                            div.classList.add('sender_chats')
                            chat_area.appendChild(div)
                           }
                           else{
                           div.classList.add('reciever_chats')
                           chat_area.appendChild(div)
                           }
                    })
                    chat_area.scrollTop = chat_area.scrollHeight
                })
            }
        })
        reciever_div.appendChild(reciever_title)
        chat_container.appendChild(reciever_div)
        chat_area.scrollTop = chat_area.scrollHeight
        chat_container.appendChild(chat_area)
        send_message.classList.add("show")
        chat_container.appendChild(send_message)
    }
    else {
        console.log('good')
        show_profile(chat_container, name, friend.length)
    }
})


socket.on("messageVerif", (message) => {
    console.log('message recieved')
    const ismessaged = JSON.parse(message)
    vertical_menu.innerHTML = ""
    ismessaged.sort((a, b) => b.lastElementID - a.lastElementID)
    ismessaged.forEach((chat) => {
        const name_div = document.createElement('div')
        name_div.className = "name_div"
        name_div.id = "name_div"
        const picture = document.createElement('i')
        picture.className = 'fa fa-user fa-lg fa-2x'
        const name_and_chat_div = document.createElement('div')
        const new_list = document.createElement('p');
        new_list.innerHTML = chat.reciever
        new_list.className = 'searchDiv'
        new_list.id = 'searchDiv'
        const small_paragraph = document.createElement('div')
        small_paragraph.className = 'smallParagraph'

        // name_div.appendChild(picture)
        name_and_chat_div.appendChild(new_list)
        name_and_chat_div.appendChild(small_paragraph)
        name_div.appendChild(picture)
        name_div.appendChild(name_and_chat_div)
        vertical_menu.appendChild(name_div)

        const nameDiv = document.querySelectorAll('#name_div');
        nameDiv.forEach((div) => {
            if (chat.reciever.split(' ').join('').trim().toLowerCase() === div.children[1].firstChild.innerHTML.split(' ').join('').trim().toLowerCase()) {
                if (chat.message == 0) {
                    div.children[1].children[1].innerHTML = `Say hi to ${new_list.innerHTML}`
                }
                else {
                    div.children[1].children[1].innerHTML = chat.lastElement
                }
            }
            div.addEventListener('click', () => {
                document.querySelector('.active')?.classList.remove('active');
                div.classList.add("active")
                const chat_container = document.getElementById('chat_container')
                const reciever_title = document.createElement('div')
                reciever_title.className = "reciever_title"
                const fullName = chat.reciever
                if (fullName.split(' ').join('').trim().toLowerCase() == div.children[1].firstChild.innerHTML.split(' ').join('').trim().toLowerCase()) {
                    chat_container.innerHTML = ""
                    const chat_area = document.createElement('div')
                    chat_area.id = "chat_area"
                    chat_area.className = "chat_area"
                    const reciever_div = document.createElement('div')
                    reciever_div.className = 'reciever_div'
                    reciever_title.innerHTML = div.children[1].firstChild.innerHTML
                    reciever_title.addEventListener('click', () => {
                        show_profile(chat_container, reciever_title.innerHTML)
                    })


                    // USE chat.reciever INSTEAD OF FULLNAME FOR THE GETFRIEND LISTENER


                    socket.emit('getFriend', fullName)
                    socket.on('getMessages', (data, user_id) => {
                        const messages = JSON.parse(data)
                        chat_area.innerHTML = ""
                        messages.forEach((chat) => {
                            const time = document.createElement('div')
                            time.className = 'time'
                            time.innerHTML = `${new Date(chat.time_of_chats).toLocaleDateString()}, ${new Date(chat.time_of_chats).toLocaleTimeString([],{hour: '2-digit',minute:'2-digit'})}`
                            const div = document.createElement('div')
                            div.innerHTML = chat.message

                            if(messages.indexOf(chat) == 0){
                                chat_area.appendChild(time)
                               }
                            else if(new Date(chat.time_of_chats).getTime() - new Date(messages[messages.indexOf(chat)-1].time_of_chats).getTime() > hour_in_ms){
                                chat_area.appendChild(time)
                            }
                            if (chat.sender_id == user_id) {
                                div.classList.add('sender_chats')
                                chat_area.appendChild(div)
                               }
                               else{
                               div.classList.add('reciever_chats')
                               chat_area.appendChild(div)
                               }
                        })
                        chat_area.scrollTop = chat_area.scrollHeight
                    })
                    reciever_div.appendChild(reciever_title)
                    chat_container.appendChild(reciever_div)
                    chat_container.appendChild(chat_area)
                    send_message.classList.add('show')
                    chat_container.appendChild(send_message)
                }
            })
        })

    })
})


socket.on('group_check_complete',(input)=>{
    const user_membership = JSON.parse(input)
    if(user_membership.length != 0){
        const membership_array = []
        user_membership.forEach(membership=>{
         membership_array.push({group_id : membership.group_id})
        })
        const menu = document.querySelector('.menu')
        const group_div = document.createElement('div')
        group_div.className= 'group_div'
        const group_header = document.createElement('div')
        group_header.className= 'group_header'
        group_header.innerHTML= 'GROUPS :'
        const all_groups = document.createElement('div')
        all_groups.className = 'group_vertical-menu'
        all_groups.id = 'group_vertical-menu'

    socket.emit('get_groups',JSON.stringify(membership_array))
    socket.on('gotten_groups',(data)=>{
     const groups = JSON.parse(data)
     groups.forEach(group=>{
        const groupName = document.createElement('div')
        const name_of_groups = document.createElement('p')
        const small_paragraph = document.createElement('div')
        const div = document.createElement('div')
        small_paragraph.className = 'smallParagraph'
        groupName.className= 'group_name_div'
        groupName.id = 'group_name_div'
        name_of_groups.innerHTML = group.group_name
        name_of_groups.className = 'searchDiv'
        const group_icon = document.createElement('i')
        group_icon.className = "fas fa-users fa-2x"
        group_icon.id = "group_button"
        groupName.addEventListener('click',()=>{group_clicked(group.group_id,group.group_name)})
        div.appendChild(name_of_groups)
        div.appendChild(small_paragraph)
        groupName.appendChild(group_icon)
        groupName.appendChild(div)
        all_groups.appendChild(groupName)
     })
     const group_nameDiv = document.querySelectorAll('#group_name_div');
     group_nameDiv.forEach(div=>{
        div.addEventListener('click',()=>{
            const group_name = div.children[1].firstChild.innerHTML
            document.querySelector('.active')?.classList.remove('active');
            div.classList.add("active")
        })
     })
    })
        group_div.appendChild(group_header)
        group_div.appendChild(all_groups)
        menu.appendChild(group_div)
    }
})

socket.on('notification_check_complete',(data)=>{
    console.log('you have friend requests')
    const requests = JSON.parse(data)
    if(requests.length != 0 ){
    const notification_div = document.querySelector('.notification_div')
    const activity_sign = document.createElement('div')
    activity_sign.className = 'notification_activity'
    notification_div.appendChild(activity_sign)
    }
    notification_div.addEventListener('click',()=>{clickNotification(requests)})
})


socket.on('addChat', (group_name,data,old_data,status,chatState) => {
        const new_chat = JSON.parse(data)
        const previous_chat = JSON.parse(old_data)
        const chat_area = document.getElementById('chat_area')
        const name_div = document.querySelectorAll('#name_div');
        const vertical_menu = document.querySelector('#vertical-menu');
        const group_name_div = document.querySelectorAll('#group_name_div');
        const group_vertical_menu = document.querySelector('#group_vertical-menu')
        const wholeDiv = document.createElement('div')
        const div = document.createElement('div')
        div.innerHTML = new_chat.message
        const chat = document.getElementById('chat')
        const time = document.createElement('div')
        const name = document.createElement('div')
        name.className = 'group_chat_friend'
        name.id = 'group_chat_friend'
        name.innerHTML = `${new_chat.first_name} ${new_chat.last_name}`
        time.className = 'time'
        time.innerHTML = `${new Date(new_chat.time_of_chats).toLocaleDateString()}, ${new Date(new_chat.time_of_chats).toLocaleTimeString([],{hour: '2-digit',minute:'2-digit'})}`
        if(chatState == "group"){
            console.log('group convo')
            group_name_div.forEach((div)=>{
                if(div.children[1].firstChild.innerHTML == group_name){
                    div.children[1].children[1].innerHTML = new_chat.message
                    div.remove()
                    vertical_menu.insertAdjacentElement("afterbegin", div);
                }
            })
        }
        else if(chatState == "friend"){
            console.log('friend convo')
            name_div.forEach((div)=>{
                if(div.children[1].firstChild.innerHTML == group_name){
                    console.log(div.children[1].firstChild.innerHTML)
                    console.log(div.children[1].children[1].innerHTML)
                    div.children[1].children[1].innerHTML = new_chat.message
                    div.remove()
                    vertical_menu.insertAdjacentElement("afterbegin", div);
                }
            })
        }

        if(previous_chat != null){
            if(new Date(new_chat.time_of_chats).getTime() - new Date(previous_chat.time_of_chats).getTime() > hour_in_ms){
                chat_area.appendChild(time)
            }
        }
        else{
            chat_area.appendChild(time)
        }

        status == 'recieved'&&(new_chat.sender_id != previous_chat.sender_id && wholeDiv.appendChild(name))
        status == 'sent'? div.classList.add('sender_chats'):div.classList.add('reciever_chats')
        wholeDiv.appendChild(div)
        chat_area.appendChild(wholeDiv)
        chat_area.scrollTop = chat_area.scrollHeight
        chat.value = ""
})


socket.on('posts', (data,thisguy) => {
    const posts = JSON.parse(data)
    const user = JSON.parse(thisguy)
    const chat_container = document.querySelector(".chat_container")
    chat_container.innerHTML = ''
    const whole_post_container =  document.createElement('div')
    whole_post_container.className = 'Whole_post_container'
    posts.forEach((post) => {
        const post_container = document.createElement('div')
        post_container.className = 'post_container'
        const posted = document.createElement('div')
        posted.className = 'posted'
        posted.id = post.id
        const poster = document.createElement('div')
        if(`${post.first_name} ${post.last_name}` == `${user.first_name} ${user.last_name}`){
            poster.innerHTML = `You`
        }
        else{
            poster.innerHTML =`${post.first_name} ${post.last_name}`
        }
        poster.className = 'poster'
        const post_header = document.createElement('div')
        post_header.innerHTML = post.header
        post_header.className = 'post_header'
        const post_body = document.createElement('div')
        post_body.innerHTML = post.body
        post_body.className = 'post_body'
        const likes_and_comments = document.createElement('div')
        likes_and_comments.className = 'likes_and_comments'
        const likes = document.createElement('div')
        likes.className = 'likes'
        const comments = document.createElement('div')
        comments.className = 'comments'
        const comment_img = document.createElement('span')
        comment_img.className = 'far fa-comment fa-lg'
        socket.emit('getcomment_count', JSON.stringify(post))
        socket.emit('comment_count')
        comments.appendChild(comment_img)  
        likes_and_comments.appendChild(likes)
        likes_and_comments.appendChild(comments)
        posted.appendChild(poster)
        posted.appendChild(post_header)
        posted.appendChild(post_body)
        posted.appendChild(likes_and_comments)
        post_container.appendChild(posted)
        whole_post_container.appendChild(post_container)
        chat_container.appendChild(whole_post_container)
    })
})


socket.on('all_comments',(result)=>{   
    const comments = document.querySelectorAll('.comments')
    const post_comments = JSON.parse(result)
    for (let i = 0; i < comments.length; i++) {
        const post_id = comments[i].parentNode.parentNode.id
        for(let i = 0; i < post_comments.length; i++){
            if(post_id == post_comments[i].post_id){
                const comment_count = document.createElement('div')
                comment_count.className = 'comment_count'
                comment_count.innerHTML = post_comments[i].comments.length
                comments[i].appendChild(comment_count)
            }
        }
     comments[i].addEventListener('click',()=>{
        const body = document.querySelector('.body')
        const comment_html = document.createElement('div')
        comment_html.className = 'comment_html'
        body.appendChild(comment_html)

        const postID ={
            post_id : post_id
        }
        socket.emit('comment_button_clicked' , JSON.stringify(postID))
        socket.on('comments',(data)=>{
            const comments = JSON.parse(data)
                    const comment_div = document.createElement('div')
                    comment_div.className = 'comment_div'
                    const comment_div_comment = document.createElement('div')
                    comment_div_comment.className = 'comment_div_comment'
                    const comment_close_button = document.createElement('button')
                    comment_close_button.className = 'comment_close_button'
                    comment_close_button.innerHTML = '&#x2715;'
                    comment_close_button.addEventListener('click', () => {
                        body.removeChild(comment_html)
                    })

                    comments.forEach(commented=>{
                    const comment = document.createElement('div')
                    const comment_header = document.createElement('div')
                    comment_header.className = 'comment_header'
                    comment_header.innerText = `${commented.first_name} ${commented.last_name}`
                    const comment_body = document.createElement('div')
                    comment_body.className = 'comment_body'
                    comment_body.innerHTML = ` ${commented.comment}`
                    comment.appendChild(comment_header)
                    comment.appendChild(comment_body)
                    comment_div_comment.appendChild(comment)
                    })
            const comment_form = document.createElement('form')
            comment_form.className = 'comment_form'
            const comment_input = document.createElement('input')
            comment_input.className = 'comment_input'
            const comment_send = document.createElement('span')
            comment_send.className = 'fas fa-paper-plane'
            comment_form.addEventListener('submit',(event)=>{
                event.preventDefault()
                const input = document.querySelector('.comment_input')
                socket.emit('add_comment',input.value,JSON.stringify(postID))
                input.value = ""
            })
            comment_send.addEventListener('click',()=>{
                const input = document.querySelector('.comment_input')
                socket.emit('add_comment',input.value,JSON.stringify(postID))
                input.value = ""
            })
            comment_div.appendChild(comment_div_comment)
            comment_div.appendChild(comment_close_button)                   
            comment_form.appendChild(comment_input)
            comment_form.appendChild(comment_send)
            comment_div.appendChild(comment_form)
            comment_html.appendChild(comment_div)

        })
     })
    }
    socket.on('add_comment_processed',(message, user)=>{
    const comment_div = document.querySelector('.comment_div_comment')
    const new_comment = document.createElement('div')
    const new_comment_header = document.createElement('div')
    new_comment_header.className = 'comment_header'
    new_comment_header.innerText = user
    const new_comment_body = document.createElement('div')
    new_comment_body.className = 'comment_body'
    new_comment_body.innerHTML = message
    new_comment.appendChild(new_comment_header)
    new_comment.appendChild(new_comment_body)
    comment_div.appendChild(new_comment)
})
})


socket.on('getliked_processed', (data,posts) => {
    const likes = JSON.parse(data)
    const post = JSON.parse(posts) 
    const get_posts = document.querySelectorAll('.post_container')

    for (let i = 0; i < get_posts.length; i++) {
        const heart_img = document.createElement('span')
        heart_img.id ='heart_img'
        const like_count = document.createElement('div')
        like_count.className = 'like_count'
        like_count.innerHTML = likes[i].total_likes
            if (likes[i].user_like == 0) {
                heart_img.className = 'far fa-heart fa-lg'
            }
            else {
                heart_img.className = 'fas fa-heart fa-lg'
            }
        get_posts[i].children[0].children[3].children[0].appendChild(heart_img)
        get_posts[i].children[0].children[3].children[0].appendChild(like_count)
    }




    const heart_img = document.querySelectorAll('#heart_img')
    for (let i = 0; i < post.length; i++) {
        heart_img[i].addEventListener('click',()=>{
            socket.emit('isliked',JSON.stringify(post[i]))
            socket.once('isliked_processed',(user_likes,all_likes)=>{
            const isLiked = JSON.parse(user_likes).length
            const allLiked = JSON.parse(all_likes).length
            heart_img[i].parentNode.children[1].innerHTML = allLiked
            if (isLiked == 0 ){
                heart_img[i].className = 'fas fa-heart fa-lg'
            }
            else{
                heart_img[i].className = 'far fa-heart fa-lg'
            }
            })

        })        
    }

}) 


socket.on('message_request_processed', (name) => {
    const chat_container = document.getElementById('chat_container')
    chat_container.innerHTML = ""
    const chat_area = document.createElement('div')
    chat_area.id = "chat_area"
    chat_area.className = "chat_area"
    const reciever_div = document.createElement('div')
    reciever_div.className = 'reciever_div'
    const reciever_title = document.createElement('div')
    reciever_title.className = "reciever_title"
    reciever_title.innerHTML = name
    socket.emit('getFriend', name)
    socket.on('getMessages', (data, user_id) => {
        const messages = JSON.parse(data)
        chat_area.innerHTML = ""
        messages.forEach((chat) => {
            const time = document.createElement('div')
            time.className = 'time'
            time.innerHTML = `${new Date(chat.time_of_chats).toLocaleDateString()}, ${new Date(chat.time_of_chats).toLocaleTimeString([],{hour: '2-digit',minute:'2-digit'})}`
            const div = document.createElement('div')
            div.innerHTML = chat.message
            if(messages.indexOf(chat) == 0){
                chat_area.appendChild(time)
               }
            else if(new Date(chat.time_of_chats).getTime() - new Date(messages[messages.indexOf(chat)-1].time_of_chats).getTime() > hour_in_ms){
                chat_area.appendChild(time)
            }
            if (chat.sender_id == user_id) {
                div.classList.add('sender_chats')
                chat_area.appendChild(div)
               }
               else{
               div.classList.add('reciever_chats')
               chat_area.appendChild(div)
               }
        })
        chat_area.scrollTop = chat_area.scrollHeight
    })
    reciever_div.append(reciever_title)
    chat_container.appendChild(reciever_div)
    chat_container.appendChild(chat_area)
    send_message.classList.add("show")
    chat_container.appendChild(send_message)
})

get_posts.addEventListener('click',()=>{
    socket.emit('get_posts')
})

post_button.addEventListener('click', ()=>{
    console.log('post story was clicked')
    const body = document.querySelector('.body')
    const post_story_background = document.createElement('div')
    post_story_background.className = 'post_story_background'
    body.appendChild(post_story_background)
    const post_block = document.createElement('div')
    post_block.className = 'post_block'
    post_body.classList.add('show')
    post_block.appendChild(post_body)
    const comment_close_button = document.createElement('button')
    comment_close_button.className = 'comment_close_button'
    comment_close_button.innerHTML = '&#x2715;'
    comment_close_button.addEventListener('click', () => {
        body.removeChild(post_story_background)
    })
    post_block.appendChild(comment_close_button)
    post_story_background.appendChild(post_block) 

})

groupButton.addEventListener('click',()=>{
    console.log('button was clicked')
    const body = document.querySelector('.body')
    const post_story_background = document.createElement('div')
    post_story_background.className = 'post_story_background'
    const addGroup = document.createElement('div')
    addGroup.className ='addGroup' 
    post_story_background.appendChild(addGroup)

    const comment_close_button = document.createElement('button')
    comment_close_button.className = 'comment_close_button'
    comment_close_button.innerHTML = '&#x2715;'
    comment_close_button.addEventListener('click', () => {
        body.removeChild(post_story_background)
    })
    addGroup.appendChild(comment_close_button)


    const group_name = document.createElement('input')
    group_name.className= 'group_name'
    group_name.placeholder = 'Select Group Name'
    addGroup.appendChild(group_name)

    const group_search_input = document.createElement('input')
    group_search_input.className= 'group_search_input'
    group_search_input.placeholder = 'Select Friends'
    addGroup.appendChild(group_search_input)

    group_search_input.addEventListener('input',debounce(onInput,500))

    const groupfriends = document.createElement('div')
    groupfriends.className = 'groupfriends'
    addGroup.appendChild(groupfriends)

    socket.emit('getfriends')
    socket.on('allfriends',(contacts)=>{
    const friends = JSON.parse(contacts) 
    friends.forEach((friend)=>{
    const div = document.createElement('div')
    div.className = 'check'
    const friend_div = document.createElement('p') 
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.id = 'checkbox'
    checkbox.name = `${friend.first_name} ${friend.last_name}`
    friend_div.innerHTML = `${friend.first_name} ${friend.last_name}`
    div.appendChild(friend_div)
    div.appendChild(checkbox)
    groupfriends.appendChild(div)
    })

//   create the group message system

    })
    const groupDetails = ()=>{
        const group_name = document.querySelector('.group_name').value
        const checkboxes = document.querySelectorAll('#checkbox')
        const friends = []
        checkboxes.forEach((checkbox)=>{
            checkbox.checked? friends.push(checkbox.name ) : null 
        })
        const form = {
            'name': group_name,
            'friends':friends 
        }
        socket.emit('form_group',form)
        location.reload()
    }

    const submit_button = document.createElement('button')
    submit_button.className= 'group_submit'
    submit_button.innerHTML = 'Create'
    submit_button.addEventListener('click',groupDetails)
    addGroup.appendChild(submit_button)

    body.appendChild(post_story_background)

})


function submit_post (event){
    const post_story_header = document.querySelector('.post_story_header')
    const post_story_body = document.querySelector('.post_story_body')
    socket.emit('add_new_post',post_story_header.value,post_story_body.value)
    post_story_body.value = ""
    post_story_header.value = ""
    location.reload();

}
post_story.addEventListener('click',submit_post)
post_form.addEventListener('submit',submit_post)


const group_clicked = (id,name) => {
         const chat_container = document.getElementById('chat_container')
                chat_container.innerHTML = ""
                const reciever_div = document.createElement('div')
                reciever_div.className = "reciever_div"
                const reciever_title = document.createElement('div')
                reciever_title.className = "reciever_title"
                const add_member = document.createElement('div')
                add_member.className = 'add_member'
                add_member.innerHTML = '+'
                const chat_area = document.createElement('div')
                chat_area.id = "chat_area"
                chat_area.className = "chat_area"
                    const fullName = `${name}`
                        reciever_title.innerHTML = fullName
                        socket.emit('get_group_chats',name)
                 add_member.addEventListener('click',()=>{addmember(fullName)})

           socket.on('gotten_group_chats',(data,user_id) => {
            const messages = JSON.parse(data)
            chat_area.innerHTML = ""
            messages.forEach((chat) => {
                const time = document.createElement('div')
                time.className = 'time'
                time.innerHTML = `${new Date(chat.time_of_chats).toLocaleDateString()}, ${new Date(chat.time_of_chats).toLocaleTimeString([],{hour: '2-digit',minute:'2-digit'})}`
                const div = document.createElement('div')
                const reciever_div = document.createElement('div')
                div.innerHTML = chat.message
                const friend = document.createElement('div')
                friend.className = 'group_chat_friend'
                friend.id = 'group_chat_friend'
                if (chat.sender_id == user_id) {
                   if(messages.indexOf(chat) == 0){
                    chat_area.appendChild(time)
                   }
                   else{
                    if(new Date(chat.time_of_chats).getTime() - new Date(messages[messages.indexOf(chat)-1].time_of_chats).getTime() > hour_in_ms){
                        chat_area.appendChild(time)
                    }
                   }

                    div.classList.add('sender_chats')
                    chat_area.appendChild(div)
                }
                else {
                    div.classList.add('reciever_chats')
                    friend.innerHTML = `${chat.first_name} ${chat.last_name}`
                    if(messages.indexOf(chat) == 0){
                        reciever_div.appendChild(friend)
                        chat_area.appendChild(time)
                       }
                       else{
                        const previous_chat = messages[messages.indexOf(chat)-1]
                        const previous_person = `${previous_chat.first_name} ${previous_chat.last_name}`
                        if(new Date(chat.time_of_chats).getTime() - new Date(previous_chat.time_of_chats).getTime() > hour_in_ms){
                            reciever_div.appendChild(friend)
                            chat_area.appendChild(time)
                        }
                        if(friend.innerHTML != previous_person){
                            reciever_div.appendChild(friend)
                        }
                       }
                       reciever_div.appendChild(div)
                       chat_area.appendChild(reciever_div)
                }
            })
            chat_area.scrollTop = chat_area.scrollHeight
           })
                reciever_div.appendChild(reciever_title)
                reciever_div.appendChild(add_member)
                chat_container.appendChild(reciever_div)
                chat_area.scrollTop = chat_area.scrollHeight
                chat_container.appendChild(chat_area)
                group_send_message.classList.add("show")
                chat_container.appendChild(group_send_message)
            }


 function addmember(name){
                    const body = document.querySelector('.body')
                    const post_story_background = document.createElement('div')
                    post_story_background.className = 'post_story_background'
                    const addGroup = document.createElement('div')
                    addGroup.className ='addGroup' 
                    post_story_background.appendChild(addGroup)
                    body.appendChild(post_story_background)
                    const comment_close_button = document.createElement('button')
                    comment_close_button.className = 'comment_close_button'
                    comment_close_button.innerHTML = '&#x2715;'
                    comment_close_button.addEventListener('click', () => {
                    body.removeChild(post_story_background)
                    })
                    addGroup.appendChild(comment_close_button)
                      const group_search_input = document.createElement('input')
                      group_search_input.className= 'group_search_input'
                      group_search_input.placeholder = 'Select Friends'
                      addGroup.appendChild(group_search_input)
                      const groupfriends = document.createElement('div')
                      groupfriends.className = 'groupfriends'
                      addGroup.appendChild(groupfriends)  
                      group_search_input.addEventListener('input',debounce(onInput,500))

                      const submit_button = document.createElement('button')
                      submit_button.className= 'group_submit'
                      submit_button.innerHTML = 'Add'
                      submit_button.addEventListener('click',()=>{
                        const checkboxes = document.querySelectorAll('#checkbox')
                        const friends = []
                        checkboxes.forEach((checkbox)=>{
                            checkbox.checked? friends.push(checkbox.name ) : null 
                        }) 
                        console.log(friends)
                        const form = {
                            'name': name,
                            'friends':friends 
                        }
                        socket.emit('add_new_member',form)
                        location.reload()
                      })
                      addGroup.appendChild(submit_button)  

 }


 const onInput = (event) => {
    const value = event.target.value
    const search = {
       'name': value
   }
    socket.emit('get_group_friend', search)
    socket.on("gotten_group_friend" ,(input)=>{
       const groupfriends = document.querySelector('.groupfriends')
       const friends = JSON.parse(input)
       if(friends.length != 0){
       groupfriends.innerHTML = ""
       friends.forEach((friend)=>{
        const div = document.createElement('div')
        div.className = 'check'
           const friend_div = document.createElement('p') 
           friend_div.innerHTML = `${friend.first_name} ${friend.last_name}`
           const checkbox = document.createElement('input')
           checkbox.type = 'checkbox'
           checkbox.id = 'checkbox'
           checkbox.name = `${friend.first_name} ${friend.last_name}`
           div.appendChild(friend_div)
           div.appendChild(checkbox)
           groupfriends.appendChild(div)
           })}
       else{
           groupfriends.innerHTML = ""
           const friend_div = document.createElement('p') 
           friend_div.innerHTML = "Oops, couldn't find anybody...."
           console.log('no friends')
           groupfriends.appendChild(friend_div)

       }
    })
   }

   const clickNotification = (array)=>{
    const activity_sign = document.querySelector('.notification_activity')
    if(activity_sign){
        notification_div.removeChild(activity_sign)
    }
    const body = document.querySelector('.whole_body')
    const profile_container = document.createElement('div')
    profile_container.className = 'profile_container'
if(array.length == 0){
    const notification = document.createElement('div')
    notification.className = 'notification'
    notification.innerHTML = 'You currently have no requests'
    profile_container.appendChild(notification)
}
else{
    array.forEach((unit)=>{
        const notification = document.createElement('div')
        notification.className = 'notification'
        const notification_text = document.createElement('div')
        const noti_follow = document.createElement('div')
        noti_follow.className='noti_follow'
        const follow = document.createElement('button')
        notification_text.className = 'notification_text'
        notification_text.innerHTML = `${unit.first_name} ${unit.last_name} wants to be your friend!`
        follow.innerHTML= 'follow'
        follow.addEventListener('click',()=>{
            socket.emit('follow_request',`${unit.first_name} ${unit.last_name}`)
            follow.disabled = 'true'
            const message = document.createElement('button')
            message.innerHTML = 'message'
            message.addEventListener('click',()=>{
                socket.emit("message_request", `${unit.first_name} ${unit.last_name}`)
                body.removeChild(profile_container)
            })
            noti_follow.appendChild(message)
        })
        noti_follow.appendChild(follow)
        notification.appendChild(notification_text)
        notification.appendChild(noti_follow)
        profile_container.appendChild(notification)
    })
}

    document.querySelector('.profile_container')? body.removeChild(document.querySelector('.profile_container')):body.appendChild(profile_container)
    setTimeout(() => {
        profile_container.classList.add('active');
    }, 100);
}


   function show_profile(chat_container, name, friend) {
    console.log('profile')
    const body = document.querySelector('.whole_body')
    const profile_container = document.createElement('div')
    profile_container.className = 'profile_container'
    const profile_header = document.createElement('div')
    profile_header.className = 'profile_header'
    const close_button = document.createElement('button')
    close_button.className = 'close_button'
    close_button.innerHTML = '&#x2715;'
    const contact_info = document.createElement('p')
    contact_info.className = 'contact_info'
    contact_info.innerHTML = 'Contact'
    profile_header.appendChild(close_button)
    profile_header.appendChild(contact_info)
    profile_container.appendChild(profile_header)

    const profile = document.createElement('div')
    profile.className = 'profile'
    const profile_picture = document.createElement('div')
    profile_picture.className = 'fa fa-user fa-9x'
    const profile_name = document.createElement('span')
    profile_name.className = 'profile_name'
    profile_name.innerHTML = name
    const first_line_break = document.createElement('div')
    first_line_break.className = 'line_break'
    const second_line_break = document.createElement('div')
    second_line_break.className = 'line_break'
    const profile_about = document.createElement('div')
    profile_about.className = 'profile_about'
    const about_header = document.createElement('p')
    about_header.className = 'about_header'
    about_header.innerHTML = 'About'
    const about_info = document.createElement('div')
    about_info.className = 'about_info'
    about_info.innerHTML = 'Lorem ipsum'
    if (friend !== 0) {
        profile.appendChild(profile_picture)
        profile.appendChild(profile_name)
        profile.appendChild(profile_about)
        const delete_div = document.createElement('div')
        delete_div.className = 'delete_div'
        delete_div.id = 'delete_div'
        const label = document.createElement('label')
        label.htmlFor = 'delete_div'
        label.className = 'label'
        label.innerHTML = `Delete chat for ${name}`
        delete_div.appendChild(label)
        profile.appendChild(delete_div)
        profile_container.appendChild(profile)
        body.appendChild(profile_container)
        close_button.addEventListener('click', () => {
            body.removeChild(profile_container)
        })
    }
    else {
        profile.appendChild(profile_picture)
        profile.appendChild(profile_name)
        profile.appendChild(profile_about)
        const follow_div = document.createElement('input')
        follow_div.className = 'follow_div'
        follow_div.id = 'follow_div'
        follow_div.type = 'button'
        follow_div.value = `Follow ${name}`
        const follow_label = document.createElement('label')
        follow_label.htmlFor = 'message_div'
        follow_label.className = 'label'
        follow_label.innerHTML = `Follow ${name}`
        follow_div.appendChild(follow_label)
        if (follow_label.innerHTML = `Follow ${name}`) {

        }
        follow_div.addEventListener('click', () => {
            follow_div.disabled = true
            socket.emit("follow_request", name)
        })
        profile.appendChild(follow_div)
        socket.on('follow_request_processed', () => {
            follow_div.value = ` You follow ${name}`
            const message_div = document.createElement('div')
            message_div.className = 'message_div'
            message_div.id = 'message_div'
            const message_label = document.createElement('label')
            message_label.htmlFor = 'message_div'
            message_label.className = 'label'
            message_label.innerHTML = `Message ${name}`
            message_div.appendChild(message_label)
            message_div.addEventListener('click', () => {
                socket.emit("message_request", name)
                body.removeChild(profile_container)
            })

            profile.appendChild(message_div)
        })
        profile_container.appendChild(profile)
        document.querySelector('.profile_container')? body.removeChild(document.querySelector('.profile_container')):body.appendChild(profile_container)
        setTimeout(() => {
            profile_container.classList.add('active');
          }, 100);
        close_button.addEventListener('click', () => {
            document.querySelector('.profile_container').classList.remove('active')
            body.removeChild(profile_container)
        })
    } 
}

const add_chat = (event) => {
    const name_div = document.querySelectorAll('#name_div');
    const vertical_menu = document.querySelector('#vertical-menu');
    const reciever = document.querySelector('.reciever_title')
    const chat_area = document.getElementById('chat_area')
    event.preventDefault()
    const chat = document.getElementById('chat')
    socket.emit('newChat', chat.value, reciever.innerHTML)
    name_div.forEach((div) => {
        if (div.children[1].firstChild.innerHTML == reciever.innerHTML) {
            div.children[1].children[1].innerHTML = chat.value
            div.remove()
            vertical_menu.insertAdjacentElement("afterbegin", div);
        }
    })
    console.log('add chat')
    chat.value = ""
}
message_form.addEventListener('submit', add_chat) 
socket.on('room',(message)=>{
    console.log(message)
})

const group_add_chat = (event)=>{
    const group_name_div = document.querySelectorAll('#group_name_div');
    const group_vertical_menu = document.querySelector('#group_vertical-menu');
    const reciever = document.querySelector('.reciever_title')
    const chat_area = document.getElementById('chat_area')
    event.preventDefault()
    const chat = document.getElementById('chat')
    socket.emit('group_newChat', chat.value, reciever.innerHTML)
    group_name_div.forEach((div) => {
        if (div.children[1].firstChild.innerHTML == reciever.innerHTML) {
            div.children[1].children[1].innerHTML = chat.value
            div.remove()
            group_vertical_menu.insertAdjacentElement("afterbegin", div);
        }
    })
    chat.value = ""
}
group_message_form.addEventListener('submit', group_add_chat)


// things to do
// make the group chats db done
// put the chats on the page done
// add other pples chats on the groups done
// put the names of those who are texting on the chats done
// set timestamps for when you text done
// fix it for the normal chat text as well and make it a conditional statement as it can throw errors when you refresh the chat db done
// fix the names on the gc done
// fix the profile pictures done
// fix the message part of the profile pics done
// add close icon to the add group done
// make a friend request icon to see friend requests done
// make it so that you can add new people to already existing groups done
// inspect the search 
//  do the groups socket kini
// remove excess shit from the codebase
// beautify the page
