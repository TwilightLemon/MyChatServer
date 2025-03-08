import express from 'express';
import { rooms,connections } from '../utils/roomData.js';
import {verify} from '../utils/trustedVfServer.js';
const router = express.Router();
router.get('/', (req, res) => {
    res.send(403, 'Forbidden');
  });
router.post('/connect', (req, res) => {
    const {uid,sign,rnd,token}=req.body;
    if(verify(uid,sign,rnd,token)){
        connections.set(token,0);
        res.json({success:true});
    }
    else{
        res.json({success:false,msg:"Invalid token"});
    }
});

router.post('/disconnect', (req, res) => {
    const {uid,sign,rnd,token}=req.body;
    if(verify(uid,sign,rnd,token)){
        if(connections.has(token)){
            connections.delete(token);
        }
        res.json({success:true});
    }
    else{
        res.json({success:false,msg:"Invalid token"});
    }
});

router.post('/createRoom', (req, res) => {
    const {token,room}=req.body;
    if(!connections.has(token)){
        res.json({success:false,msg:"Invalid token"});
        return;
    }
    if(!rooms[room]){
        rooms[room]=[];
        res.json({success:true});
    }
    else{
        res.json({success:false,msg:"Room already exists"});
    }
});
export default router;