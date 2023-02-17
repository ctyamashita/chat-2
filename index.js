// checking for previous data

let channel = new URL(window.location.href).searchParams.get("channel") || window.localStorage.getItem('channel');

let users = []

window.localStorage.setItem('channel', channel)
document.querySelector("#channel").value = channel

let baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`;

if (window.localStorage.getItem('name')) {
  const inputName = document.querySelector("#your-name")
  inputName.value = window.localStorage.getItem('name');
}


const buildLine = (messageContent) => {
  const line = document.createElement('p')
  line.classList.add('msg-txt')
  line.innerHTML = generateIfLink(messageContent)
  return line
  // return `<p class="msg-txt">${generateIfLink(messageContent)}</p>`
}

const buildMsg = (message) => {
  const name = window.localStorage.getItem('name')
  // preventing html code injection
  let content = message.content.replaceAll(/</g, "&lt").replaceAll(/>/g, "&gt")

  content =  generateIfLink(content)

  const time = new Date(message.created_at);
  const hours = time.getHours();
  const minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()

  const bubbleContainer = document.createElement('div')
  const bubble = document.createElement('div')
  const avatar = document.createElement('div')
  const img = document.createElement('img')
  const msgContainer = document.createElement('div')
  const msgHead = document.createElement('p')
  const msg = buildLine(content)

  if (name === message.author) {
    bubbleContainer.classList.add('bubble-container-right')
    bubble.classList.add('right')
    avatar.classList.add('hide')
  } else {
    bubbleContainer.classList.add('bubble-container-left')
    bubble.classList.add('left')
  }

  bubbleContainer.classList.add(message.author)
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

let previousData

const fetchMessages = () => {
  const channel = window.localStorage.getItem('channel')
  const baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`
  fetch(baseUrl)
    .then(response => response.json())
    .then((data) => {
      if (data.messages.length > 0) {
        const name = window.localStorage.getItem('name');

        if (users.includes(name) && window.localStorage.getItem('myName') === '') areInputsValid()
        if (!lastMsg || previousData.channel != data.channel) {
          messageBoard.innerHTML = "";
          lastMsg = data.messages[0]
          if (lastMsg) {
            const msg = buildMsg(lastMsg);
            messageBoard.append(msg);
            users.push(lastMsg.author)
          }
          data.messages.forEach((message) => {
            if (!users.includes(message.author)) users.push(message.author)
            if (message.id > lastMsg.id) {
              addMessage(message)
              if (lastMsg.id != message.id) messageBoard.lastElementChild.scrollIntoView();
              lastMsg = message
              previousData = data
            }
          });
        }

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
        bubble.firstElementChild.firstElementChild.classList.add('hide')
      } else {
        bubble.classList.remove('bubble-container-right')
        bubble.firstElementChild.classList.remove('right')
        bubble.classList.add('bubble-container-left')
        bubble.firstElementChild.classList.add('left')
        bubble.firstElementChild.firstElementChild.classList.remove('hide')
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

  if (!(channel === '' || channel === null || !Number.isInteger(Number(channel)))) {
    chatHeader.classList.remove('initial-pos-head');
    msgInput.classList.remove('hide');
    messageContainer.classList.remove('hide');
    if (window.localStorage.getItem('channel') != channel) {
      baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`;
      lastMsg = false
      users = []
      window.localStorage.setItem('myName',inputName.value)
      refresh()
    }
    validChannel = true
    window.localStorage.setItem('channel', channel)
  } else {
    chatHeader.classList.add('red', 'initial-pos-head');
    msgInput.classList.add('hide');
    messageContainer.classList.add('hide');
    window.localStorage.setItem('channel', '')
    channelInput.value = ''
  }

  if (users.includes(inputName.value) && window.localStorage.getItem("myName") === '') {
    validName = false
    const name = window.localStorage.getItem('name')
    window.localStorage.setItem("myName", name)
    alert('Name already in use.')
    inputName.value = name
  } else if (inputName.value != '') {
    const image = document.createElement("img")
    const div = document.createElement('div')
    image.src = `https://github.com/${inputName.value}.png`
    div.appendChild(image)
    div.setAttribute('class', 'avatar')
    div.setAttribute('id', 'user')
    validName = true
    image.onerror = function () {
      validName = false
      div.remove()
    };
    const userInfo = chatHeader.lastElementChild;
    if (document.querySelector(`#user`)) document.querySelector(`#user`).remove()
    if (validName) userInfo.appendChild(div)
  } else {
    validName = false
  }

  if (validName && validChannel) chatHeader.classList.remove('red');

  if (validName) {
    chatHeader.classList.remove('red')
    if (window.localStorage.getItem('name') != inputName.value) {
      updateBubbles()
      window.localStorage.setItem('name', inputName.value)
      window.localStorage.setItem('myName', '')
    }
  }

}

areInputsValid()

const channelInput = document.querySelector('#channel')
const nameInput = document.querySelector('#your-name')
channelInput.addEventListener('blur', areInputsValid)
nameInput.addEventListener('blur', areInputsValid)

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

const generateIfLink = (word) => {
  let domain
  if (word.match(regex)) domain = word.match(regex)[2]

  if (regex.test(word) && domain && domain === 'youtube' || domain === 'youtu') {
    return addYoutubeVideo(word)
  } else {
    return regex.test(word) ? `<a href="${word}" class="link" target=_blank><strong><i class="fa-solid fa-link"></i> ${domain}</strong></a>` : word
  }
}

const sendMessage = (event) => {
  event.preventDefault();
  const msgInput = document.querySelector('#your-message');
  const currentName = document.querySelector('#your-name').value

  if (event.key === "Enter" && msgInput === document.activeElement) {
    let error
    if (!validName) {
      error = users.includes(currentName) ? 'Name already in use.' : 'Please add a valid username.'
      alert(error)
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
      document.querySelector('#your-message').value = ''
      window.localStorage.setItem('name', currentName)
      window.localStorage.setItem('myName', currentName)
      refresh();
    }
  }
};

const form = document.querySelector("#comment-form");
form.addEventListener("keyup", sendMessage);


setInterval(() => {
  refresh()
}, 1000);
