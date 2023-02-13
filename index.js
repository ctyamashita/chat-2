// let channel = window.location.search.match(/channel=(\d+)/)[1];
// const user = window.location.search.match(/name=(.+)/)[1];

let channel = new URL(window.location.href).searchParams.get("channel") || window.localStorage.getItem('channel');
// let user = new URL(window.location.href).searchParams.get("name");

// document.querySelector('#your-name').innerText = user;
if (channel) {
  window.localStorage.setItem('channel', channel)
  channel = window.localStorage.getItem('channel')
  document.querySelector("h1").innerText = `#${channel}`
} else {
  alert('Error: please provide the channel')
}

// const channel = 858; // change to your own channel id
const baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`;


if (window.localStorage.getItem('name')) {
  document.querySelector("#your-name").value = window.localStorage.getItem('name');
}

const messageBoard = document.querySelector('#messages');

const buildMsg = (message, name) => {
  // prevent code injection
  const content = message.content.replaceAll(/</g, "&lt").replaceAll(/>/g, "&gt");

  const time = new Date(message.created_at);
  const hours = time.getHours();
  const minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()
  return `<div class="msg d-flex ${name === message.author ? 'justify-content-end' : 'justify-content-start'}">
            <div class="${name === message.author ? 'bg-warning bubble-right' : 'bg-light bubble-left'} py-2 px-3 my-1 col-8 d-flex align-items-center">
              <div class="avatar">
                <img src="https://github.com/${message.author}.png"/>
              </div>
              <div class="msg-container flex-grow-1">
                <p class="m-0 p-0 border-bottom d-flex justify-content-between">
                  <strong>${message.author}</strong> <span class="date">${hours}:${minutes}</span>
                </p>
                <small>
                  ${content}
                </small>
              </div>
            </div>
          </div>`
}

let lastMsg

const refresh = () => {
  fetch(baseUrl)
  .then(response => response.json())
  .then((data) => {
      const name = document.querySelector("#your-name").value;
      window.localStorage.setItem('name', name)
      if (lastMsg) {
        data.messages.forEach((message) => {
          if (message.id > lastMsg.id) {

            const msgContent = buildMsg(message, name)
            messageBoard.insertAdjacentHTML("beforeend", msgContent);
            if (document.querySelector('#messages').lastElementChild && lastMsg.id != message.id) {
              document.querySelector('#messages').lastElementChild.scrollIntoView();
            }
            lastMsg = message
          }
        });

      } else {
        messageBoard.innerHTML = "";
        data.messages.forEach((message) => {

            const msgContent = buildMsg(message, name)
            messageBoard.insertAdjacentHTML("beforeend", msgContent);
            lastMsg = message
        });
      }


    });
};

const checkName = (inputName) => {
  if (inputName.value) {
    inputName.classList.remove('border-danger');
    inputName.classList.remove('border');
  } else {
    inputName.classList.add('border-danger');
    inputName.classList.add('border');
  }
}

const sendMessage = (event) => {
  event.preventDefault();
  const inputName = document.querySelector("#your-name");
  const msgInput = document.querySelector('#your-message');

  checkName(inputName);

  if (event.key === "Enter" && msgInput === document.activeElement) {
    if (!inputName.value) {
      alert('Please add a username.')
    } else {
      const yourMessage = document.querySelector('#your-message').value;
      const yourName = document.querySelector('#your-name').value;
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


setInterval(() => { refresh(); }, 1000);


const isAndroid = navigator.userAgent.toLocaleLowerCase().indexOf('android') > -1

if (isAndroid) {
  document.write(`<meta name="viewport" content="width=device-width,height=${window.innerHeight}", initial-scale="1.0"`)
}
