import { Server, OPEN } from 'ws';
import { rooms,connections } from '../utils/roomData.js';

const wss = new Server({ port: 8080 });
function groupMsg(roomUsers,type,message,ws){
  roomUsers.forEach(user => {
    if (user!==ws&&user.readyState === OPEN) {
      user.send(JSON.stringify({
        type,
        message
      }));
    }
  });
}
wss.on('connection', (ws) => {
    console.log('New client connected');
  
    ws.on('message', (message) => {
      const {name,token,room,type,message} = JSON.parse(message);
      if(!connections.has(token) || !rooms.has(room)){
        ws.close(1008,JSON.stringify({room,token}));
        return;
      }
      const roomUsers=rooms.get(room);
      if (type == "chat") {
        groupMsg(roomUsers,type,message,ws);
      }else if(type=="leave"){
        roomUsers.delete(ws);
        groupMsg(roomUsers,type,name,ws);
      }else if(type=="join"){
        if(!roomUsers.has(ws)){
          roomUsers.add(ws);
          groupMsg(roomUsers,type,name,ws);
        }
      }
    });
  
    ws.on('close', (code, reason) => {
      console.log('Client disconnected');
      const statusDes=reason.toString();
      console.log(statusDes);
      try{
        const { roomIds,name, token } = JSON.parse(statusDes);
        roomIds.forEach(roomId => {
          if(rooms.has(roomId)){
            const roomUsers=rooms.get(roomId);
            if (roomUsers.has(ws)) {
              roomUsers.delete(ws);
              groupMsg(roomUsers, "exit", name, ws);
            }
          }
        });
      }
      catch{
        return;
      }
    });
  });
  
  console.log('WebSocket Server is running on port 8080');