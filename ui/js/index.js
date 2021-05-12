const socket = io();

const input = document.getElementById("content-container-input");
const button = document.getElementById("content-container-submit-button");

let clientId = null;

const createUserElement = (socketId) => {
  const activeUserElement = document.createElement("div");

  activeUserElement.innerHTML = socketId;
  activeUserElement.setAttribute("class", "users-panel__active-user");
  activeUserElement.setAttribute("id", `user_${socketId}`);

  return activeUserElement;
};

const createMessageElement = (message) => {
  const newMessageElement = document.createElement("li");

  const isClientMessage = message.socketId === clientId;

  newMessageElement.setAttribute("id", message.id);
  newMessageElement.setAttribute(
    "class",
    `content-container__message ${
      isClientMessage ? "content-container__message--client" : ""
    }`
  );

  const createdAt = new Date(message.createdAt);
  const formattedDate = `${createdAt.getDate()}/${
    createdAt.getMonth() + 1
  }/${createdAt.getFullYear()}`;

  newMessageElement.innerHTML = `
    <span>
      <strong>user:</strong> ${message.socketId}
    </span> <br />
    <span>
      <strong>message:</strong> ${message.message}
    </span> <br />
    <span>
      <strong>createdAt:</strong> ${formattedDate}
    </span>
  `;

  return newMessageElement;
};

const updateUserList = (socketIds) => {
  const activeUserContainer = document.getElementById("users-panel");

  socketIds.forEach((socketId) => {
    const alreadyExistingUser = document.getElementById(`user_${socketId}`);
    if (!alreadyExistingUser) {
      const userContainerEl = createUserElement(socketId);

      activeUserContainer.appendChild(userContainerEl);
    }
  });
};

const updateMessageList = (messages) => {
  const messagesContainer = document.getElementById("messages-container");

  messages.forEach((message) => {
    const alreadyExistingMessage = document.getElementById(message.id);

    if (!alreadyExistingMessage) {
      const messageContainerEl = createMessageElement(message);

      messagesContainer.appendChild(messageContainerEl);

      messagesContainer.scrollTo(0, messagesContainer.scrollHeight)
    }
  });
};

const removeUser = (socketId) => {
  const elementToRemove = document.getElementById(socketId);

  if (elementToRemove) {
    elementToRemove.remove();
  }
};

socket.on("get-client-id", ({ socketId }) => {
  clientId = socketId;
});

socket.on("update-user-list", ({ users }) => {
  updateUserList(users);
});

socket.on("remove-user", ({ socketId }) => {
  removeUser(socketId);
});

socket.on("update-message-list", ({ messages }) => {
  updateMessageList(messages);
});

button.addEventListener("click", (event) => {
  event.preventDefault();

  if (input.value) {
    socket.emit("send-message", input.value);

    input.value = "";
  }
});
