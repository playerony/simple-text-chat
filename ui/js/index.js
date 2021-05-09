const socket = io();

const input = document.getElementById("message-input");
const button = document.getElementById("submit-button");

let clientId = null;

const createUserElement = (socketId) => {
  const activeUserElement = document.createElement("div");

  activeUserElement.innerHTML = socketId;
  activeUserElement.setAttribute("class", "active-user");
  activeUserElement.setAttribute("id", `user_${socketId}`);

  return activeUserElement;
};

const createMessageElement = (message) => {
  const activeUserElement = document.createElement("li");

  const isClientMessage = message.socketId === clientId;

  activeUserElement.setAttribute("id", `message_${message.socketId}`);
  activeUserElement.setAttribute(
    "class",
    isClientMessage ? "client-message" : "chat-message"
  );
  activeUserElement.innerHTML = `${message.message} ${message.createdAt}`;

  return activeUserElement;
};

const updateUserList = (socketIds) => {
  const activeUserContainer = document.getElementById("active-users-container");

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
    const alreadyExistingMessage = document.getElementById(
      `message_${message.socketId}`
    );

    if (!alreadyExistingMessage) {
      const messageContainerEl = createMessageElement(message);

      messagesContainer.appendChild(messageContainerEl);
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
