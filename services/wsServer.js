import { Server, OPEN } from 'ws';
import { rooms,connections } from '../utils/roomData.js';

const wss = new Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.send(JSON.stringify({room:"::global",user:"system",msg:"Welcome to WebSocket Server in Github Codespace! o(*￣▽￣*)ブ"}));
  
    ws.on('message', (message) => {
      const { room, user, msg } = JSON.parse(message);
      if (!rooms[room]) {
        rooms[room] = [ws]; //create room
        ws.send(JSON.stringify({room, user: "system", msg: `Created a new room: ${room}` }));
      }
      else if (!rooms[room].includes(ws)) {
        rooms[room].push(ws);
        ws.send(JSON.stringify({room, user: "system", msg: `Welcome to the room: ${room}` }));
        rooms[room].forEach(client => {
          if (client !== ws && client.readyState === OPEN) {
            client.send(JSON.stringify({room, user: "system", msg: `${user} has joined the room` }));
          }
        });
      } else {
        rooms[room].forEach(client => {
          if (client.readyState === OPEN) {
            client.send(JSON.stringify({room, user, msg }));
          }
        });
      }
    });
  
    ws.on('close', (code, reason) => {
      console.log('Client disconnected');
      const statusDes=reason.toString();
      console.log(statusDes);
      try{
        const { room, user } = JSON.parse(statusDes);
      
        //remove ws from room
        if (rooms[room]) {
          if (rooms[room].includes(ws)) {
            rooms[room].forEach(client => {
              if (client.readyState === OPEN) {
                client.send(JSON.stringify({room, user: "system", msg: `${user} has left the room` }));
              }
            });
          }
        }
      }
      catch{
        return;
      }
    });
  });
  
  console.log('WebSocket Server is running on port 8080');