import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

const roomId = 'test-room-' + Math.random().toString(36).substring(7);

console.log('--- WebSocket Verification Script ---');

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
  
  console.log(`📡 Joining room: ${roomId}`);
  socket.emit('join-room', { roomId });
});

socket.on('sendToken', (msg) => {
  console.log('📩 Received sendToken signal:', msg);
});

socket.on('filesReady', (msg) => {
  console.log('📩 Received filesReady signal:', msg);
});

socket.on('user-joined', (data) => {
  console.log('👥 User joined event:', data);
});

socket.on('code-change', (data) => {
  console.log('📝 Received code-change:', data);
});

socket.on('cursor-change', (data) => {
  console.log('🖱️ Received cursor-change:', data);
});

socket.on('output', (data) => {
  console.log('💻 Terminal output received:', data);
});

// Simulate events after 2 seconds
setTimeout(() => {
  console.log('🚀 Simulating code-change...');
  socket.emit('code-change', { roomId, path: 'test.js', code: 'console.log("hello");' });

  console.log('🚀 Simulating cursor-change...');
  socket.emit('cursor-change', { roomId, path: 'test.js', position: { line: 1, ch: 5 } });

  console.log('🚀 Simulating chat message...');
  socket.emit('send_message', { roomId, text: 'Hello from test script!' });
}, 2000);

// Close after 10 seconds
setTimeout(() => {
  console.log('--- Verification Done ---');
  socket.disconnect();
  // process.exit(0);
}, 10000);

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
  // process.exit(1);
});
