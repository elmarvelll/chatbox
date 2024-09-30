
const input = document.querySelector('#search');
const searchdiv = document.querySelector('#searchDivs');
const vertical_menu = document.querySelector('#vertical-menu');
const form = document.getElementById("message_form")
let originalHTML = vertical_menu.innerHTML


// profile.ejs


const socket = io()

socket.on('connect', (socket) => {
    console.log('connected to server')

})


socket.emit('getVerif')
socket.emit('get_posts')

function debounce(cb, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => cb(...args), wait);
    };
}
const sendData = async (event) => {
    try {
        const name = input.name
        let value = event.target.value;
        let dataArray = []
        const search = {
            [name]: value
        }
        socket.emit('searches', JSON.stringify(search))
        socket.on('getSearch', (data) => {
            dataArray = JSON.parse(data)
            if (input.value.trim() !== "") {
                vertical_menu.innerHTML = ""
                if (dataArray.length == 0) {
                    vertical_menu.innerHTML = `<li>No Results Found</li>`
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
                            socket.emit('friend_verification', div.innerHTML)
                            socket.on('isFriend', (data) => {
                                const send_message = document.getElementById('send_message')
                                const chat_container = document.getElementById('chat_container')
                                const friend = JSON.parse(data)
                                if (friend.length !== 0) {
                                    chat_container.innerHTML = ""
                                    const reciever_title = document.createElement('div')
                                    reciever_title.className = "reciever_title"
                                    const chat_area = document.createElement('div')
                                    chat_area.id = "chat_area"
                                    chat_area.className = "chat_area"
                                    dataArray.forEach((data) => {
                                        const fullName = `${data.first_name} ${data.last_name}`
                                        if (fullName.split(' ').join('').trim().toLowerCase() == div.innerHTML.split(' ').join('').trim().toLowerCase()) {
                                            reciever_title.innerHTML = div.innerHTML
                                            reciever_title.addEventListener('click', () => {
                                                show_profile(chat_container, reciever_title.innerHTML, friend.length)
                                            })
                                            socket.emit('getFriend', fullName)
                                            socket.on('getMessages', (data, user_id) => {
                                                const messages = JSON.parse(data)
                                                chat_area.innerHTML = ""
                                                messages.forEach((chat) => {
                                                    const div = document.createElement('div')
                                                    div.innerHTML = chat.message
                                                    if (chat.sender_id == user_id) {
                                                        div.classList.add('sender_chats')
                                                    }
                                                    else {
                                                        div.classList.add('reciever_chats')
                                                    }
                                                    chat_area.appendChild(div)
                                                })
                                                chat_area.scrollTop = chat_area.scrollHeight
                                            })
                                        }
                                    })
                                    chat_container.appendChild(reciever_title)
                                    chat_area.scrollTop = chat_area.scrollHeight
                                    chat_container.appendChild(chat_area)
                                    send_message.classList.add("show")
                                    chat_container.appendChild(send_message)
                                }
                                else {
                                    show_profile(chat_container, div.innerHTML, friend.length)
                                    socket.on('message_request_processed', () => {
                                        chat_container.innerHTML = ""
                                        const chat_area = document.createElement('div')
                                        chat_area.id = "chat_area"
                                        chat_area.className = "chat_area"
                                        const reciever_title = document.createElement('div')
                                        reciever_title.className = "reciever_title"
                                        reciever_title.innerHTML = div.innerHTML
                                        socket.emit('getFriend', div.innerHTML)
                                        socket.on('getMessages', (data, user_id) => {
                                            const messages = JSON.parse(data)
                                            chat_area.innerHTML = ""
                                            messages.forEach((chat) => {
                                                const div = document.createElement('div')
                                                div.innerHTML = chat.message
                                                if (chat.sender_id == user_id) {
                                                    div.classList.add('sender_chats')
                                                }
                                                else {
                                                    div.classList.add('reciever_chats')
                                                }
                                                chat_area.appendChild(div)
                                            })
                                            chat_area.scrollTop = chat_area.scrollHeight
                                        })
                                        chat_container.appendChild(reciever_title)
                                        chat_container.appendChild(chat_area)
                                        send_message.classList.add("show")
                                        chat_container.appendChild(send_message)
                                    })

                                }
                            })
                        })
                    })

                }
            }
            if (input.value == "") {
                socket.emit('getVerif')
            }
        })

    }
    catch (error) {
        console.log(error)
    }
}
input.addEventListener('input', debounce(sendData, 500))




const message_button = document.getElementById('message_button')
const message_form = document.getElementById('message_form')


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
    chat.value = ""
}
message_form.addEventListener('submit', add_chat)




socket.on('addChat', (data) => {
    const chat_area = document.getElementById('chat_area')
    const chat = document.getElementById('chat')
    const new_chat = JSON.parse(data)
    const div = document.createElement('div')
    div.innerHTML = new_chat.message
    div.classList.add('sender_chats')
    chat_area.appendChild(div)
    chat_area.scrollTop = chat_area.scrollHeight
    chat.value = ""

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
                const send_message = document.getElementById('send_message')
                const chat_container = document.getElementById('chat_container')
                const reciever_title = document.createElement('div')
                reciever_title.className = "reciever_title"
                const fullName = chat.reciever
                if (fullName.split(' ').join('').trim().toLowerCase() == div.children[1].firstChild.innerHTML.split(' ').join('').trim().toLowerCase()) {
                    chat_container.innerHTML = ""
                    const chat_area = document.createElement('div')
                    chat_area.id = "chat_area"
                    chat_area.className = "chat_area"
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
                            const div = document.createElement('div')
                            div.innerHTML = chat.message
                            if (chat.sender_id == user_id) {
                                div.classList.add('sender_chats')
                            }
                            else {
                                div.classList.add('reciever_chats')
                            }
                            chat_area.appendChild(div)
                        })
                        chat_area.scrollTop = chat_area.scrollHeight
                    })
                    chat_container.appendChild(reciever_title)
                    chat_container.appendChild(chat_area)
                    send_message.classList.add("show")
                    chat_container.appendChild(send_message)
                }
            })
        })

    })

})


socket.on('posts', (data) => {
    const posts = JSON.parse(data)
    const chat_container = document.querySelector(".chat_container")
    chat_container.innerHTML = ''
    posts.forEach((post) => {
        const post_container = document.createElement('div')
        post_container.className = 'post_container'
        const posted = document.createElement('div')
        posted.className = 'posted'
        const poster = document.createElement('div')
        poster.innerHTML = `${post.first_name} ${post.last_name}`
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
        const like_count = document.createElement('div')
        like_count.className = 'like_count'
        const comment_count = document.createElement('div')
        comment_count.className = 'comment_count'
        const heart_img = document.createElement('span')
        socket.emit('getliked', JSON.stringify(post))
        socket.on('getliked_processed', (data) => {
            const userLike = JSON.parse(data)
            socket.emit('get_like_count', JSON.stringify(post))
            socket.on('like_count', (data) => {
                like_count.innerHTML = JSON.parse(data).length
            })
            if (userLike.length == 0) {
                heart_img.className = 'far fa-heart fa-lg'
            }
            else {
                heart_img.className = 'fas fa-heart fa-lg'
            }
        })
        heart_img.addEventListener('click', () => {
            socket.emit('isliked', JSON.stringify(post))
            socket.once('isliked_processed', (data) => {
                const is_like = JSON.parse(data)
                if (is_like.length == 0) {
                    heart_img.className = 'fas fa-heart fa-lg'
                    socket.emit('add_like_request', JSON.stringify(post))
                    console.log('liked added')
                    socket.emit('get_like_count', JSON.stringify(post))
                    socket.on('like_count', (data) => {
                        like_count.innerHTML = JSON.parse(data).length
                    })
                }
                else {
                    heart_img.className = 'far fa-heart fa-lg'
                    socket.emit('delete_like_request', JSON.stringify(post))
                    socket.emit('get_like_count', JSON.stringify(post))
                    socket.on('like_count', (data) => {
                        like_count.innerHTML = JSON.parse(data).length
                    })
                    console.log('like removed')
                    like_count.innerHTML = is_like.length
                }
            })


        })
        const comments = document.createElement('div')
        comments.className = 'comments'
        const comment_img = document.createElement('span')
        comment_img.className = 'far fa-comment fa-lg'
        socket.emit('getcomment_count', JSON.stringify(post))
        socket.on('getcomment_count_processed', (data) => {
            comment_count.innerHTML = JSON.parse(data).length
        })
        comment_img.addEventListener('click', () => {
            socket.emit('getcomment', JSON.stringify(post))
            const body = document.querySelector('.body')
            const old_body_innerHTML = body.innerHTML
            body.innerHTML = ''
            const comment_div = document.createElement('div')
            comment_div.className = 'comment_div'
            const comment_div_comment = document.createElement('div')
            comment_div_comment.className = 'comment_div_comment'
            const comment_close_button = document.createElement('button')
            comment_close_button.className = 'comment_close_button'
            comment_close_button.innerHTML = '&#x2715;'
            comment_close_button.addEventListener('click', () => {
                body.innerHTML = old_body_innerHTML
                socket.emit('getVerif')
                socket.emit('get_posts')
            })


            socket.on('getcomment_processed', (data) => {
                const comments = JSON.parse(data)
                console.log(comments)
                comments.forEach((commented) => {
                    const comment = document.createElement('div')
                    const comment_header = document.createElement('div')
                    comment_header.className = 'comment_header'
                    comment_header.innerText = `${commented.first_name} ${commented.last_name} `
                    const comment_body = document.createElement('div')
                    comment_body.className = 'comment_body'
                    comment_body.innerHTML = ` ${commented.comment}`
                    comment.appendChild(comment_header)
                    comment.appendChild(comment_body)
                    comment_div_comment.appendChild(comment)
                })
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
                socket.emit('add_comment',input.value,JSON.stringify(post))
                input.value = ""
            })
            comment_send.addEventListener('click',()=>{
                const input = document.querySelector('.comment_input')
                socket.emit('add_comment',input.value,JSON.stringify(post))
                input.value = ""
            })
            comment_form.appendChild(comment_input)
            comment_form.appendChild(comment_send)
            comment_div.appendChild(comment_close_button)
            comment_div.appendChild(comment_div_comment)
            comment_div.appendChild(comment_form)
            body.appendChild(comment_div)
            console.log('comment img clicked')
        })



        likes.appendChild(heart_img)
        likes.appendChild(like_count)
        comments.appendChild(comment_img)
        comments.appendChild(comment_count)
        likes_and_comments.appendChild(likes)
        likes_and_comments.appendChild(comments)
        posted.appendChild(poster)
        posted.appendChild(post_header)
        posted.appendChild(post_body)
        posted.appendChild(likes_and_comments)
        post_container.appendChild(posted)
        chat_container.appendChild(post_container)
    })
})
socket.on('add_comment_processed',(message, user)=>{
    console.log('hi')
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
    console.log(new_comment)
})
function show_profile(chat_container, name, friend) {
    const body = document.querySelector('.body')
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
        profile.appendChild(first_line_break)
        profile_about.appendChild(about_header)
        profile_about.appendChild(about_info)
        profile.appendChild(profile_about)
        profile.appendChild(second_line_break)
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
        profile.appendChild(first_line_break)
        profile_about.appendChild(about_header)
        profile_about.appendChild(about_info)
        profile.appendChild(profile_about)
        profile.appendChild(second_line_break)
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
        body.appendChild(profile_container)
        close_button.addEventListener('click', () => {
            body.removeChild(profile_container)
        })
    }
}
