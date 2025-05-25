let socket = io();
const post = document.getElementById("onlineUsers");

let nickname = "";

const setNickname = () => {
  const nicknameText = document.getElementById("nicknameInput");
  nickname = nicknameText.value.trim();

  if (!nickname) {
    nicknameText.placeholder = "Please input a valid name";
  } else {
    socket.emit("set nickname", nickname);
    document.getElementById("messageBox").style.display = "flex";
  }
};

const sendMessage = () => {
  const messageText = document.getElementById("messageTextInput");
  const message = messageText.value.trim();
  if (message) socket.emit("messages", message);
};

document.getElementById("messageTextInput").addEventListener("keydown", (e) => {
  let timeout;
  socket.emit("user typing");
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    socket.emit("user not typing");
  }, 2000);
});

// socket listening

socket.on("set nickname", (name) => {
  const nicknameContainer = document.getElementById("nicknameContainer");
  const nicknameCheck = document.getElementById("nicknameCheck");
  console.log("working");

  if (name === "invalid") {
    nicknameCheck.textContent = `User already exists under ${nickname}`;
    nicknameCheck.style.display = "flex";
  } else {
    nicknameContainer.innerHTML = `<h3>Connected as ${nickname}</h3>`;
    nicknameCheck.style.display = "none";
    document.querySelector(".userPictureLetter").textContent = nickname[0];
  }
  nicknameContainer.style.visibility = "visible";
  nicknameContainer.style.color = "darkgreen";
});

socket.on("user list", (users) => {
  const userPostList = document.getElementById("userPostList");
  userPostList.innerHTML = "";
  users.forEach((user) => {
    const userElem = document.createElement("h3");
    userElem.innerText = user;
    if (userElem.innerText === nickname) {
      userElem.innerText = `${user}(you)`;
      userElem.style.color = "darkgreen";
    }
    userPostList.appendChild(userElem);
  });
});

socket.on("messages", (message) => {
  const chatContent = document.getElementById("chatContent");
  const messageElem = document.createElement("h4");
  messageElem.innerHTML = `${message.username}: ${message.message}`;
  console.log("nickname", nickname);
  chatContent.appendChild(messageElem);
  chatContent.scrollTop = chatContent.scrollHeight;
});

socket.on("new user connected", (name) => {
  const chatContent = document.getElementById("chatContent");
  const messageElem = document.createElement("h4");
  messageElem.innerText = `${name} has connected!`;
  messageElem.style.color = "green";
  messageElem.style.backgroundColor = "lightgreen";
  chatContent.appendChild(messageElem);
});

socket.on("user disconnected", (msg) => {
  const chatContent = document.getElementById("chatContent");
  const messageElem = document.createElement("h4");
  messageElem.innerText = `${msg.nickname} ${msg.text}!`;
  messageElem.style.color = "black";
  messageElem.style.backgroundColor = "red";
  chatContent.appendChild(messageElem);
});

socket.on("user typing", (user) => {
  if (user === nickname) return;
  document.getElementById("userTyping").innerText = `${user} is typing...`;
});

socket.on("user not typing", (user) => {
  document.getElementById("userTyping").innerText = "";
});
