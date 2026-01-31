
const socket = io(window.location.origin);

let me = { socketId: null, index: null };
const users = new Map(); // socketId -> index
const rooms = new Map(); // roomId -> { roomId, participants: [], messages: [] }
let currentRoomId = null;

/* DOM */
const meEl = document.getElementById('me');
const usersEl = document.getElementById('users');
const roomsEl = document.getElementById('rooms');
const roomArea = document.getElementById('roomArea');
const roomTitle = document.getElementById('roomTitle');
const roomMessagesEl = document.getElementById('roomMessages');
const roomInput = document.getElementById('roomInput');
const sendRoomBtn = document.getElementById('sendRoomBtn');

/* Socket events */
socket.on('connect', () => console.log('Connected', socket.id));
socket.on('welcome', (payload) => {
  me.socketId = payload.socketId;
  me.index = payload.index;
  meEl.textContent = `id=${me.socketId}  index=${me.index}`;
});

socket.on('user_list', (list) => {
  users.clear();
  list.forEach(u => users.set(u.socketId, u.index));
  renderUsers();
});

socket.on('room_created', ({ roomId, participants }) => {
  rooms.set(roomId, { roomId, participants, messages: [] });
  renderRooms();
  // auto-switch to the new room
  selectRoom(roomId);
});

socket.on('joined_room', ({ roomId }) => {
  if (!rooms.has(roomId)) rooms.set(roomId, { roomId, participants: [], messages: [] });
  renderRooms();
});

socket.on('room_message', ({ roomId, from, message }) => {
  const room = rooms.get(roomId) || { roomId, participants: [], messages: [] };
  room.messages.push({ from, message });
  rooms.set(roomId, room);
  if (roomId === currentRoomId) renderRoomMessages(room);
});

/* UI functions */
function renderUsers() {
  usersEl.innerHTML = '';
  for (const [socketId, index] of users) {
    if (socketId === me.socketId) continue;
    const li = document.createElement('li');
    li.textContent = `#${index} (${socketId.slice(0,6)}) `;
    const btn = document.createElement('button');
    btn.textContent = 'Start Chat';
    btn.onclick = () => createRoomWith(socketId);
    li.appendChild(btn);
    usersEl.appendChild(li);
  }
}

function renderRooms() {
  roomsEl.innerHTML = '';
  for (const [roomId, room] of rooms) {
    const li = document.createElement('li');
    li.textContent = `${roomId.slice(0,8)} (${room.participants.map(p => p.index ?? p.socketId.slice(0,4)).join(',')}) `;
    li.onclick = () => selectRoom(roomId);
    roomsEl.appendChild(li);
  }
}

function selectRoom(roomId) {
  currentRoomId = roomId;
  const room = rooms.get(roomId);
  roomTitle.textContent = `Room ${roomId}`;
  roomArea.style.display = 'block';
  renderRoomMessages(room);
}

function renderRoomMessages(room) {
  roomMessagesEl.innerHTML = '';
  room.messages.forEach(m => {
    const li = document.createElement('li');
    li.textContent = `#${m.from.index ?? m.from.socketId.slice(0,6)}: ${m.message}`;
    roomMessagesEl.appendChild(li);
  });
}

sendRoomBtn.onclick = () => {
  const txt = roomInput.value.trim();
  if (!txt || !currentRoomId) return;
  socket.emit('room_message', { roomId: currentRoomId, message: txt });
  // Optionally append locally immediately:
  const myFrom = { socketId: socket.id, index: me.index };
  const room = rooms.get(currentRoomId);
  room.messages.push({ from: myFrom, message: txt });
  renderRoomMessages(room);
  roomInput.value = '';
};

/* Actions */
function createRoomWith(targetSocketId) {
  socket.emit('create_room', { to: targetSocketId, meta: { createdAt: Date.now() } });
}

// Expose for console debugging
window._chat = { socket, users, rooms, createRoomWith, selectRoom };