// checking for previous data

let channel = new URL(window.location.href).searchParams.get("channel") || window.localStorage.getItem('channel');

while (channel === '' || channel === null || !Number.isInteger(Number(channel))) {
  channel = prompt('Please provide the channel')
}
window.localStorage.setItem('channel', channel)
document.querySelector("#channel").value = channel

const baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`;

const inputName = document.querySelector("#your-name")

if (window.localStorage.getItem('name')) {
  inputName.value = window.localStorage.getItem('name');
}

const chatHeader = document.querySelector('#chat-header')

if (!window.localStorage.getItem('validName') || window.localStorage.getItem('validName') === 'false') {
  chatHeader.classList.add('red');
} else {
  chatHeader.classList.remove('red');
}

const areInputsValid = () => {
  if (document.querySelector('#user')) document.querySelector('#user').remove()
  const image = document.createElement("img")
  const div = document.createElement('div')
  const inputName = document.querySelector('#your-name')
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
  userInfo.setAttribute('style', 'display: flex; align-items: center')
  userInfo.appendChild(div);

  const channelInput = document.querySelector('#channel')
  const channel = channelInput.value
  if (channel === '' || channel === null || !Number.isInteger(Number(channel))) {
    chatHeader.classList.add('red');
    window.localStorage.setItem('validChannel', false)
  } else {
    chatHeader.classList.remove('red');
    window.localStorage.setItem('validChannel', true)
    window.localStorage.setItem('channel', channel)
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
  const idRegex = /https:\/\/www\.youtube\.com\/watch\?v=(\w+)/
  if (!!url.match(idRegex)) {
    const id = url.match(idRegex)[1]
    return `<iframe width="100%" height="260" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; web-share" allowfullscreen></iframe>`
  }
  return `<a href="${url}" class="link" target=_blank><strong><i class="fa-solid fa-link"></i> ${url.match(regex)[2]}</strong></a>`
}

const generateIfLink = (word) => {
  if (regex.test(word) && word.match(regex)[2] && word.match(regex)[2] === 'youtube') {
    return addYoutubeVideo(word)
  } else {
    return regex.test(word) ? `<a href="${word}" class="link" target=_blank><strong><i class="fa-solid fa-link"></i> ${word.match(regex)[2]}</strong></a>` : word
  }
}

const buildLine = (messageContent) => {
  return `<br><small>${generateIfLink(messageContent)}</small>`
}


const buildMsg = (message, name) => {
  // link regex

  // preventing code injection
  let content = message.content
    .replaceAll(/</g, "&lt").replaceAll(/>/g, "&gt")

    content =  generateIfLink(content)

  const time = new Date(message.created_at);
  const hours = time.getHours();
  const minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()
  return `<div class="msg d-flex ${name === message.author ? 'justify-content-end' : 'justify-content-start'}">
            <div class="${name === message.author ? 'bubble-right' : 'bubble-left'} py-2 px-3 my-1 col-8 d-flex align-items-center">
              ${name === message.author ? '' : `<div class="avatar"><img src="https://github.com/${message.author}.png"/></div>`}
              <div class="msg-container flex-grow-1">
                <p class="m-0 p-0 border-bottom d-flex justify-content-between">
                  <strong>${message.author}</strong> <span class="date">${hours}:${minutes}</span>
                </p>
                ${buildLine(message.content)}
              </div>
            </div>
          </div>`
}

let lastMsg

// const mergeMsgs = (messages) => {
//   const fusedMsgs = []
//   messages.forEach((message, index) => {
//     const nextMsg = messages[index + 1]
//     if (nextMsg && nextMsg.author === message.author) {
//       nextMsg.content = message.content + '</small><br><small>' + nextMsg.content
//     } else {
//       fusedMsgs.push(message)
//       lastMsg = message
//     }
//   });
//   return fusedMsgs
// }


const refresh = () => {
  fetch(baseUrl)
  .then(response => response.json())
  .then((data) => {
      const name = document.querySelector("#your-name").value;
      window.localStorage.setItem('name', name)

      if (lastMsg) {
        data.messages.forEach((message) => {
          if (message.id > lastMsg.id) {
            let msgContent
            if (message.author === lastMsg.author) {
              msgContent = buildLine(message.content)
              messageBoard.lastElementChild.lastElementChild.firstElementChild.insertAdjacentHTML("beforeend", msgContent);
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

      } else {
        messageBoard.innerHTML = "";
        data.messages.forEach(message => {
          const msgContent = buildMsg(message, name)
          messageBoard.insertAdjacentHTML("beforeend", msgContent);
          lastMsg = message
        })
      }

    });
};

const sendMessage = (event) => {
  event.preventDefault();
  const inputName = document.querySelector("#your-name");
  const msgInput = document.querySelector('#your-message');

  if (event.key === "Enter" && msgInput === document.activeElement) {
    if (window.localStorage.getItem("validName") === 'false') {
      alert('Please add a valid username.')
    } else if (window.localStorage.getItem("validChannel") === 'false') {
      alert('Please add a valid channel.')
    } else {
      const yourMessage = msgInput.value;
      const yourName = inputName.value;
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
