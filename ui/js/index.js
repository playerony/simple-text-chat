const socket = io();

const inputElement = document.getElementById("content-container-input");
const buttonElement = document.getElementById(
  "content-container-submit-button"
);

let clientId = null;

const classNames = (...classNames) => {
  if (!classNames) {
    return "";
  }

  if (Array.isArray(classNames)) {
    return classNames.filter(Boolean).join(" ");
  }

  return String(classNames);
};

const getMessageContent = (message) => {
  const createdAt = new Date(message.createdAt);

  const day = createdAt.getDate();
  const year = createdAt.getFullYear();
  const month = createdAt.getMonth() + 1;

  const hours = createdAt.getHours();
  const minutes = createdAt.getMinutes();
  const seconds = createdAt.getSeconds();

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

  return `
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
};

const createMessageElement = (message) => {
  const newMessageElement = document.createElement("li");

  const isClientMessage = message.socketId === clientId;
  const newMessageElementClass = classNames(
    "content-container__message",
    isClientMessage && "content-container__message--client"
  );

  newMessageElement.setAttribute("id", message.id);
  newMessageElement.setAttribute("class", newMessageElementClass);

  const newMessageContent = getMessageContent(message);
  newMessageElement.innerHTML = newMessageContent;

  return newMessageElement;
};

const updateMessageList = ({ messages }) => {
  const messagesContainer = document.getElementById("messages-container");

  messages.forEach((message) => {
    const alreadyExistingMessage = document.getElementById(message.id);

    if (!alreadyExistingMessage) {
      const newMessageElement = createMessageElement(message);

      messagesContainer.appendChild(newMessageElement);
      messagesContainer.scrollTo(0, messagesContainer.scrollHeight);
    }
  });
};

const createUserElement = (socketId) => {
  const activeUserElement = document.createElement("div");

  activeUserElement.innerHTML = socketId;
  activeUserElement.setAttribute("id", `user_${socketId}`);
  activeUserElement.setAttribute("class", "users-panel__active-user");

  return activeUserElement;
};

const updateUserList = ({ users }) => {
  const usersPanelContainer = document.getElementById("users-panel");

  users.forEach((socketId) => {
    const alreadyExistingUser = document.getElementById(`user_${socketId}`);
    if (!alreadyExistingUser) {
      const newUserElement = createUserElement(socketId);

      usersPanelContainer.appendChild(newUserElement);
    }
  });
};

const removeUser = ({ socketId }) => {
  const elementToRemove = document.getElementById(socketId);

  if (elementToRemove) {
    elementToRemove.remove();
  }
};

const setClientId = ({ socketId }) => {
  clientId = socketId;
};

socket.on("remove-user", removeUser);
socket.on("get-client-id", setClientId);
socket.on("update-user-list", updateUserList);
socket.on("update-message-list", updateMessageList);

buttonElement.addEventListener("click", (event) => {
  event.preventDefault();

  if (inputElement.value) {
    socket.emit("send-message", inputElement.value);

    inputElement.value = "";
  }
});
