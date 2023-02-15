// checking for previous data

let channel = new URL(window.location.href).searchParams.get("channel") || window.localStorage.getItem('channel');

if (channel) {
  window.localStorage.setItem('channel', channel)
  channel = window.localStorage.getItem('channel')
  document.querySelector("h1").innerText = `#${channel}`
} else {
  alert('Error: please provide the channel')
  document.querySelector('#your-message').classList.add('d-none')
}

const baseUrl = `https://wagon-chat.herokuapp.com/${channel}/messages`;

const inputName = document.querySelector("#your-name")

if (window.localStorage.getItem('name')) {
  inputName.value = window.localStorage.getItem('name');
}

if (!window.localStorage.getItem('validName') || window.localStorage.getItem('validName') === 'false') {
  inputName.classList.add('border-danger');
  inputName.classList.add('border');
} else {
  inputName.classList.remove('border-danger');
  inputName.classList.remove('border');
}

// selecting message board

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

// checking if username is valid
const isUsernameValid = (e) => {
  const inputName = e.currentTarget
  const src = `https://github.com/${inputName.value}.png`
  const image = document.createElement("img")
  image.src = src
  inputName.classList.remove('border-danger');
  inputName.classList.remove('border');
  window.localStorage.setItem("validName", true)
  image.onerror = function () {
    inputName.classList.add('border-danger');
    inputName.classList.add('border');
    window.localStorage.setItem("validName", false)
  };
  image.remove();
}

const nameInput = document.querySelector('#your-name')
nameInput.addEventListener('blur', isUsernameValid)

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

const sendMessage = (event) => {
  event.preventDefault();
  const inputName = document.querySelector("#your-name");
  const msgInput = document.querySelector('#your-message');

  if (event.key === "Enter" && msgInput === document.activeElement) {
    if (window.localStorage.getItem("validName") === 'false') {
      alert('Please add a valid username.')
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

const inputs = document.querySelectorAll('input')
inputs.forEach(input => {
  input.addEventListener("focus", function () {
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    document.body.style = `height: ${h}px; width: ${w}px`
  })
})


setInterval(() => { refresh(); }, 1000);
