// checking for previous data

let channel = new URL(window.location.href).searchParams.get("channel") || window.localStorage.getItem('channel');

let users = []
let afkUsers = []

window.localStorage.setItem('channel', channel)
document.querySelector("#channel").value = channel

let baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`;

if (window.localStorage.getItem('name')) {
  const inputName = document.querySelector("#your-name")
  inputName.value = window.localStorage.getItem('name');
} else {
  window.localStorage.setItem('name', '')
  window.localStorage.setItem('myName', '')
}


const buildLine = (messageContent) => {
  const line = document.createElement('p');
  line.classList.add('msg-txt')
  line.innerHTML = generateIfLink(messageContent)
  return line
  // return `<p class="msg-txt">${generateIfLink(messageContent)}</p>`
}

const buildMsg = (message) => {
  const name = window.localStorage.getItem('name')
  // preventing html code injection
  // let content = message.content.replaceAll(/&/g, "&amp;").replaceAll(/</g, "&lt;").replaceAll(/>/g, "&gt;");

  const time = new Date(message.created_at);
  const hours = time.getHours();
  const minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()

  const bubbleContainer = document.createElement('div')
  const bubble = document.createElement('div')
  const avatar = document.createElement('div')
  const img = document.createElement('img')
  const msgContainer = document.createElement('div')
  const msgHead = document.createElement('p')
  const msg = buildLine(message.content)

  if (name === message.author) {
    bubbleContainer.classList.add('bubble-container-right')
    bubble.classList.add('right')
    avatar.classList.add('d-none')
  } else {
    bubbleContainer.classList.add('bubble-container-left')
    bubble.classList.add('left')
  }

  bubbleContainer.classList.add(message.author.replaceAll(" ", '-'))
  bubble.classList.add('bubble')
  avatar.classList.add('avatar')
  img.src = `https://github.com/${message.author}.png`
  msgContainer.classList.add('msg-container')
  msgHead.classList.add('msg-head')
  msgHead.innerHTML = `<strong>${message.author}</strong> <span class="date">${hours}:${minutes}</span>`

  msgContainer.append(msgHead, msg)
  avatar.append(img)
  bubble.append(avatar, msgContainer)
  bubbleContainer.append(bubble)

  return bubbleContainer

  // return `<div class="${name === message.author ? 'bubble-container-right' : 'bubble-container-left'} ${message.author}">
  //           <div class="bubble ${name === message.author ? 'right' : 'left'}">
  //             <div class="avatar ${name === message.author ? 'hide' : ''}"><img src=/></div>
  //             <div class="msg-container">
  //               <p class="msg-head">
  //                 <strong>${message.author}</strong> <span class="date">${hours}:${minutes}</span>
  //               </p>
  //               <p class="msg-txt">${generateIfLink(content)}</p>
  //             </div>
  //           </div>
  //         </div>`
}

let lastMsg

const addMessage = (message) => {
  if (message.author === lastMsg.author) {
    const lastBubble = messageBoard.lastElementChild.firstElementChild.lastElementChild
    message = buildLine(message.content)
    lastBubble.append(message);
  } else {
    message = buildMsg(message)
    messageBoard.append(message);
  }
}

const fetchMessages = () => {
  const channel = window.localStorage.getItem('channel')
  const baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`
  fetch(baseUrl)
    .then(response => response.json())
    .then((data) => {
      if (data.messages.length > 0) {
        const name = window.localStorage.getItem('name');

        if (users.includes(name) && window.localStorage.getItem('myName') != `${name}@${channel}`) areInputsValid()
        const list = document.querySelector('#list');
        if (!lastMsg) {
          messageBoard.innerHTML = "";
          lastMsg = data.messages[0]
          if (lastMsg) {
            const msg = buildMsg(lastMsg);
            messageBoard.append(msg);
            users.push(lastMsg.author);
            list.insertAdjacentHTML('beforeend', `<p class="user-list-item"><span>●</span> ${lastMsg.author}</p>`)
          }
        }

        data.messages.forEach((message) => {
          if (!users.includes(message.author)) {
            users.push(message.author);
            if (!afkUsers.includes(message.author)) list.insertAdjacentHTML('beforeend', `<p class="user-list-item"><span>●</span> ${message.author}</p>`)
          }
          if (message.id > lastMsg.id) {
            addMessage(message)
            if (lastMsg.id != message.id) messageBoard.lastElementChild.scrollIntoView();
            lastMsg = message
          }
        });

      } else {
        users.forEach((user) => afkUsers.push(user))
        users = []
      }
    });
}

const refresh = () => {
  const messageBoard = document.querySelector('#messages');
  if (window.localStorage.getItem('channel') === '') {
    messageBoard.classList.add('hide')
  } else {
    messageBoard.classList.remove('hide')
    fetchMessages()
  }
};

let validName
let validChannel

const updateBubbles = () => {
  if (validName) {
    const name = document.querySelector('#your-name').value
    document.querySelectorAll('.bubble').forEach(bubble => {
      bubble = bubble.parentElement
      if (bubble.classList.contains(name)) {
        bubble.classList.add('bubble-container-right')
        bubble.firstElementChild.classList.add('right')
        bubble.classList.remove('bubble-container-left')
        bubble.firstElementChild.classList.remove('left')
        bubble.firstElementChild.firstElementChild.classList.add('d-none')
      } else {
        bubble.classList.remove('bubble-container-right')
        bubble.firstElementChild.classList.remove('right')
        bubble.classList.add('bubble-container-left')
        bubble.firstElementChild.classList.add('left')
        bubble.firstElementChild.firstElementChild.classList.remove('d-none')
      }
    })
  }
}

const areInputsValid = () => {
  const channelInput = document.querySelector('#channel')
  const channel = channelInput.value
  const inputName = document.querySelector('#your-name')
  const chatHeader = document.querySelector('.chat-header')
  const msgInput = document.querySelector('#msg-input-container')
  const messageContainer = document.querySelector('#messages')
  const oldChannel = window.localStorage.getItem('channel')

  if (!(channel === '' || channel === null || !Number.isInteger(Number(channel)))) {
    chatHeader.classList.remove('initial-pos-head');
    msgInput.classList.remove('hide');
    messageContainer.classList.remove('d-none');
    if (oldChannel != channel) {
      baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`;
      lastMsg = false
      messageContainer.innerHTML = ''
      users = []
      window.localStorage.setItem('name', inputName.value)
      if (inputName.value != '' && document.querySelector(`.${inputName.value}`)) {
        window.localStorage.setItem('myName',`${inputName.value}@${oldChannel}`)
      }
      if (channel != '' && oldChannel === channel) location.reload()
    }
    validChannel = true
    window.localStorage.setItem('channel', channel)
    document.title = `#${channel} Channel`
  } else {
    chatHeader.classList.add('red', 'initial-pos-head');
    msgInput.classList.add('hide');
    messageContainer.classList.add('d-none');
    window.localStorage.setItem('channel', '')
    channelInput.value = ''
  }

  // console.log(window.localStorage.getItem("myName"), channel, oldChannel)

  if (users.includes(inputName.value) && window.localStorage.getItem("myName") != `${inputName.value}@${oldChannel}`) {
    validName = false
    alert('Name already in use.')
    inputName.value = ''
  }

  if (inputName.value != '') {
    const image = document.createElement("img")
    const div = document.createElement('div')
    const name = inputName.value || window.localStorage.getItem('name')
    image.src = `https://github.com/${name}.png`
    div.appendChild(image)
    div.setAttribute('class', 'avatar')
    div.setAttribute('id', 'user')
    validName = true
    image.onerror = function () {
      validName = false
      div.remove()
    };
    const userInfo = chatHeader.lastElementChild;
    if (validName) userInfo.appendChild(div)
    if (document.querySelectorAll(`#user`).length > 1) document.querySelector(`#user`).remove()
  } else {
    validName = false
  }

  if (!validName) {
    chatHeader.classList.add('red')
    if (document.querySelector(`#user`)) document.querySelector(`#user`).remove()
  }

  if (validName && validChannel) chatHeader.classList.remove('red');

  if (validName) {
    chatHeader.classList.remove('red')
    if (window.localStorage.getItem('name') != inputName.value) {
      updateBubbles()
      window.localStorage.setItem('name', inputName.value)
      // window.localStorage.setItem('myName', '')
    }
  }

}

areInputsValid()

const channelInput = document.querySelector('#channel')
const nameInput = document.querySelector('#your-name')
channelInput.addEventListener('blur', areInputsValid)
nameInput.addEventListener('change', areInputsValid)

// selecting message board

const messageBoard = document.querySelector('#messages');


const regex = /^https:\/\/(www\.|)([-a-zA-Z0-9@:%._\+~#=]{1,256})\.[a-zA-Z0-9()]{1,6}\S*/

const addYoutubeVideo = (url) => {
  const idRegexTwo = /https:\/\/youtu.be\/(\w+)/
  const idRegex = /https:\/\/www\.youtube\.com\/watch\?v=(\w+)/
  let id
  if (!!url.match(idRegex)) {
    id = url.match(idRegex)[1]
  } else if (!!url.match(idRegexTwo)) {
    id = url.match(idRegexTwo)[1]
  } else {
    return `<a href="${url}" class="link" target=_blank><strong><i class="fa-solid fa-link"></i> ${url.match(regex)[2]}</strong></a>`
  }
  return `<iframe width="100%" height="180" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; web-share" allowfullscreen></iframe>`
}

const addGiphy = (url) => {
  const giphyRegex = /https:\/\/giphy\.com\/clips\/(\w+-)*(\w+)/
  const id = url.match(giphyRegex)[2]
  return `<iframe frameBorder="0" width="100%" height="180" src="https://giphy.com/embed/${id}/video"></iframe>`
}

const addImage = (url) => {
  return `<img class="img-msg" src=${url} />`
}

const generateIfLink = (text) => {
  let domain
  if (text.match(regex)) domain = text.match(regex)[2]

  if (regex.test(text) && domain && domain === 'youtube' || domain === 'youtu') {
    return addYoutubeVideo(text)
  } else if (regex.test(text) && domain && domain === 'giphy') {
    return addGiphy(text)
  } else if (/(\.jpg|\.png|\.gif)$/.test(text)) {
    return addImage(text)
  } else {
    if (regex.test(text)) {
      return `<a href="${text}" class="link" target=_blank><strong><i class="fa-solid fa-link"></i> ${domain}</strong></a> `
    } else {
      return text.replaceAll(/</g, "&lt;").replaceAll(/>/g, "&gt;")
    }
  }
}

const sendMessage = (event) => {
  event.preventDefault();
  const msgInput = document.querySelector('#your-message');
  const channel = window.localStorage.getItem('channel')

  if (event.key === "Enter" && msgInput === document.activeElement) {
    if (!validName) {
      alert('Please add a valid username.')
    } else if (!validChannel) {
      alert('Please add a valid channel.')
    } else {
      const yourMessage = msgInput.value;
      const yourName = window.localStorage.getItem('name')
      fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: yourName, content: yourMessage }),
      });
      const currentName = `${yourName}@${channel}`
      document.querySelector('#your-message').value = ''
      window.localStorage.setItem('name', yourName)
      window.localStorage.setItem('myName', currentName)
      refresh();
    }
  }
};

const form = document.querySelector("#comment-form");
form.addEventListener("keyup", sendMessage);

let currentCount = 0

setInterval(() => {
  refresh();
  const names = document.querySelectorAll('.user-list-item');
  currentCount = (afkUsers.length === 0) ? users.length : names.length
  const previousCount = document.querySelector('#count > span')
  if (previousCount.innerHTML != currentCount) previousCount.innerHTML = currentCount;
  names.forEach((name) => (afkUsers.includes(name.innerHTML.replace('<span>●</span> ', '')) && !users.includes(name.innerHTML.replace('<span>●</span> ', ''))) ? name.classList.add('offline') : name.classList.remove('offline'))
}, 1000);

const btnList = document.querySelector('#count');
btnList.addEventListener('click', () => {
  const list = document.querySelector('#list');
  list.classList.toggle('hide');
})


// users = users.filter((value, index, array) => array.indexOf(value) === index);
//             const usernames = users.map((user) => `<p class="user-list-item">${user}</p>`);
//             list.innerHTML = usernames.join('');
