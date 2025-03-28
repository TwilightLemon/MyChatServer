import express from 'express';
import expressWs from 'express-ws';
import { rooms } from '../utils/sharedData.js';
import { verify } from '../utils/trustedVfServer.js';

const router = express.Router();
expressWs(router);
function groupMsg(roomUsers, type, message, ws, roomId, name, senderId) {
    roomUsers.forEach(user => {
        if (user.readyState === WebSocket.OPEN) {
            user.send(JSON.stringify({
                type,//leave\join\chat
                roomId,
                senderId,
                name,
                message
            }));
        }
    });
}
router.ws('/', (ws, req) => {
    console.log('New client connected');

    ws.on('message', (msg) => {
        const { name, senderId, token, sign, room, type, message } = JSON.parse(msg);
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
            groupMsg(roomUsers, 'join', `${name} joined the room`, ws, room, name, senderId);
        }

        if (type == "chat") {
            groupMsg(roomUsers, type, message, ws, room, name, senderId);
        } else if (type == "leave") {
            //remove the client from the room
            roomUsers.slice(roomUsers.indexOf(ws), 1);
            groupMsg(roomUsers, type, `${name} left the room`, ws, room, name, senderId);
        }
    });

    ws.on('close', (code, reason) => {
        console.log('Client disconnected');
        const statusDes = reason.toString();
        console.log(statusDes);
        try {
            const { roomIds, name } = JSON.parse(statusDes);

            roomIds.forEach(roomId => {
                const roomUsers = rooms[roomId];
                if (roomUsers) {
                    if (roomUsers[ws]) {
                        roomUsers.slice(roomUsers.indexOf(ws), 1);
                        groupMsg(roomUsers, "leave", `${name} left the room`, ws, roomId, name, 'system');
                    }
                }
            });
        }
        catch (e) {
            return;
        }
    });
});

router.get('/', (req, res) => {
    res.send('Chat router');
});

export default router;