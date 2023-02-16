// checking for previous data

let channel = new URL(window.location.href).searchParams.get("channel") || window.localStorage.getItem('channel');

let myUsernames = []

let users = []

while (channel === '' || channel === null || !Number.isInteger(Number(channel))) {
  channel = prompt('Please provide the channel')
}
window.localStorage.setItem('channel', channel)
document.querySelector("#channel").value = channel

let baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`;

const inputName = document.querySelector("#your-name")

if (window.localStorage.getItem('myNames')) {
  myUsernames = window.localStorage.getItem('myNames').split(',')
}


if (window.localStorage.getItem('name')) {
  inputName.value = window.localStorage.getItem('name');
  if (!myUsernames.includes(inputName.value)) myUsernames.push(inputName.value)
  window.localStorage.setItem('myNames', myUsernames)
}



const chatHeader = document.querySelector('#chat-header')

if (!window.localStorage.getItem('validName') || window.localStorage.getItem('validName') === 'false') {
  chatHeader.classList.add('red');
} else {
  chatHeader.classList.remove('red');
}

const buildLine = (messageContent) => {
  return `<p class="msg-txt">${generateIfLink(messageContent)}</p>`
}


const buildMsg = (message, name) => {
  // preventing code injection
  let content = message.content
    .replaceAll(/</g, "&lt").replaceAll(/>/g, "&gt")

    content =  generateIfLink(content)

  const time = new Date(message.created_at);
  const hours = time.getHours();
  const minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()
  return `<div class="${name === message.author ? 'bubble-container-right' : 'bubble-container-left'} ${message.author}">
            <div class="${name === message.author ? 'bubble right' : 'bubble left'}">
              <div class="avatar ${name === message.author ? 'hide' : ''}"><img src="https://github.com/${message.author}.png"/></div>
              <div class="msg-container">
                <p class="msg-head">
                  <strong>${message.author}</strong> <span class="date">${hours}:${minutes}</span>
                </p>
                ${buildLine(message.content)}
              </div>
            </div>
          </div>`
}

let lastMsg

const refresh = () => {
  fetch(baseUrl)
  .then(response => response.json())
  .then((data) => {
      const name = window.localStorage.getItem('name');
      if (!lastMsg) {
        messageBoard.innerHTML = "";
        lastMsg = data.messages[0]
        if (lastMsg) {
          const msg = buildMsg(lastMsg, name);
          messageBoard.insertAdjacentHTML("beforeend", msg);
        }
      }

      data.messages.forEach((message) => {
        if (!users.includes(message.author)) users.push(message.author)
        if (message.id > lastMsg.id) {
          let msgContent
          if (message.author === lastMsg.author) {
            msgContent = buildLine(message.content)
            const lastBubble = messageBoard.lastElementChild.firstElementChild.lastElementChild
            lastBubble.insertAdjacentHTML("beforeend", msgContent);
          } else {
            msgContent = buildMsg(message, name);
            messageBoard.insertAdjacentHTML("beforeend", msgContent);
          }
          if (document.querySelector('#messages').lastElementChild && lastMsg.id != message.id) {
            document.querySelector('#messages').lastElementChild.scrollIntoView();
          }
          lastMsg = message
        }
      });

      if (users.length === 0) window.localStorage.setItem('myNames', '')
    });
};

const updateBubbles = () => {
  const name = document.querySelector('#your-name').value
  document.querySelector('#messages').childNodes.forEach(bubble => {
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

const areInputsValid = () => {
  if (document.querySelector('#user')) document.querySelector('#user').remove()
  const inputName = document.querySelector('#your-name')

  if (users.includes(inputName.value) && !myUsernames.includes(inputName.value)) {
    window.localStorage.setItem("validName", false)
    chatHeader.classList.add('red');
    alert('Name already in use.')
    inputName.value = ''
  } else {
    const image = document.createElement("img")
    const div = document.createElement('div')
    const src = `https://github.com/${inputName.value}.png`
    image.src = src
    div.appendChild(image)
    div.setAttribute('class', 'avatar')
    div.setAttribute('id', 'user')
    chatHeader.classList.remove('red');
    window.localStorage.setItem("validName", true)
    image.onerror = function () {
      chatHeader.classList.add('red');
      window.localStorage.setItem("validName", false)
      div.remove()
    };
    const userInfo = chatHeader.lastElementChild
    userInfo.appendChild(div);
  }

  const channelInput = document.querySelector('#channel')
  const channel = channelInput.value

  if (channel === '' || channel === null || !Number.isInteger(Number(channel))) {
    chatHeader.classList.add('red');
    window.localStorage.setItem('validChannel', false)
  } else {
    window.localStorage.setItem('validChannel', true)
  }

  if (window.localStorage.getItem("validName") === "true" && window.localStorage.getItem("validChannel") === "true") {
    chatHeader.classList.remove('red');
  }

  if (window.localStorage.getItem("validName") === "true") {
    if (window.localStorage.getItem('name') != inputName.value) {
      // lastMsg = false
      updateBubbles()
      window.localStorage.setItem('name', inputName.value)
      const newName = inputName.value
      if (!myUsernames.includes(newName)) myUsernames.push(newName)
      window.localStorage.setItem('myNames', myUsernames)
    }
  }

  if (window.localStorage.getItem("validChannel") === "true") {
    if (window.localStorage.getItem('channel') != channel) {
      baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`;
      users = []
      lastMsg = false
      window.localStorage.setItem('channel', channel)
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
  if (!!url.match(idRegex) || url.match(idRegexTwo)[1]) {
    let id
    if (!!url.match(idRegex)) id = url.match(idRegex)[1]
    if (!!url.match(idRegexTwo)) id = url.match(idRegexTwo)[1]
    return `<iframe width="100%" height="180" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; web-share" allowfullscreen></iframe>`
  }
  return `<a href="${url}" class="link" target=_blank><strong><i class="fa-solid fa-link"></i> ${url.match(regex)[2]}</strong></a>`
}

const generateIfLink = (word) => {
  let domain
  if (word.match(regex)) {
    domain = word.match(regex)[2]
  }
  if (regex.test(word) && domain && domain === 'youtube' || domain === 'youtu') {
    return addYoutubeVideo(word)
  } else {
    return regex.test(word) ? `<a href="${word}" class="link" target=_blank><strong><i class="fa-solid fa-link"></i> ${domain}</strong></a>` : word
  }
}


const sendMessage = (event) => {
  event.preventDefault();
  const msgInput = document.querySelector('#your-message');

  if (event.key === "Enter" && msgInput === document.activeElement) {
    if (window.localStorage.getItem("validName") === 'false') {
      alert('Please add a valid username.')
    } else if (window.localStorage.getItem("validChannel") === 'false') {
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
      refresh();
    }
  }
};



const form = document.querySelector("#comment-form");
form.addEventListener("keyup", sendMessage);


setInterval(() => { refresh() }, 1000);
