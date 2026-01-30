// const socket = io("http://localhost:3001")

// const message = document.getElementById('message');
// const messages = document.getElementById('messages');

// const handleSubmitNewMessage = () => {
//     socket.emit('message', {data: message.value})
// }

// socket.on('message', ({data}) => {
//     handleNewMessage(data);
// })

// const handleNewMessage = (message) => {
//     messages.appendChild(buildNewMessage(message));

// }

// const buildNewMessage = (message) => {
//     const li = document.createElement("li");
//     li.appendChild(document.createTextNode(message))
//     return li;
// }

const socket = io(window.location.origin);

const message = document.getElementById('message');
const messages = document.getElementById('messages');

socket.on('connect', () => {
  console.log('Connected to chat server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from chat server');
});

socket.on('message', (data) => {
  console.log('Received message:', data);
  handleNewMessage(data.data);
});

const handleSubmitNewMessage = () => {
  const msgText = message.value.trim();
  if (msgText) {
    console.log('Sending message:', msgText);
    socket.emit('message', { data: msgText });
    message.value = '';
  }
};

const handleNewMessage = (messageText) => {
  const li = document.createElement('li');
  li.textContent = messageText;
  messages.appendChild(li);
};