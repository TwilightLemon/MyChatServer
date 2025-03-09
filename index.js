import WebSocket, { WebSocketServer } from 'ws';
import { verify } from './utils/trustedVfServer.js';
const rooms = {};

const wss = new WebSocketServer({ port:8080 });
function groupMsg(roomUsers, type, message, ws,roomId,name) {
  roomUsers.forEach(user => {
    if (user.readyState === WebSocket.OPEN) {
      user.send(JSON.stringify({
        type,
        roomId,
        name,
        message
      }));
    }
  });
}
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (msg) => {
    const { name, token, sign, room, type, message } = JSON.parse(msg);
    if (!verify(sign, token)) {
      ws.close(1008, "Invalid token");
      return;
    }
    if (!rooms[room]) {  //check if the room existed
      rooms[room] = [];
    }
    
    const roomUsers = rooms[room];

    if (!roomUsers.includes(ws)) {   //check if the client is in the room
      roomUsers.push(ws);
      groupMsg(roomUsers, type, `${name} joined the room`, ws,room,name);
    }

    if (type == "chat") {
      groupMsg(roomUsers, type, message, ws,room,name);
    } else if (type == "leave") {
      //remove the client from the room
      roomUsers.slice(roomUsers.indexOf(ws), 1);
      groupMsg(roomUsers, type, `${name} left the room`, ws,room,name);
    }
  });

  ws.on('close', (code, reason) => {
    console.log('Client disconnected');
    const statusDes = reason.toString();
    console.log(statusDes);
    try {
      const { roomIds, name, token,sign } = JSON.parse(statusDes);
      if (!verify(sign, token))return;//refuse to remove.

      roomIds.forEach(roomId => {
        const roomUsers = rooms[roomId];
        if (roomUsers) {
          if (roomUsers[ws]) {
            roomUsers.slice(roomUsers.indexOf(ws), 1);
            groupMsg(roomUsers, "leave", name, ws,roomId,name);
          }
        }
      });
    }
    catch {
      return;
    }
  });
});

console.log('WebSocket Server is running on port 8080');