import express from 'express';
import expressWs from 'express-ws';
import bodyParser from 'body-parser';
import Chat from './routers/chat.js';

const app=express();
expressWs(app);
const port=process.env.PORT || 3000;
app.use(bodyParser.json());

app.get('/',(req,res)=>{
    res.send('Hello World');
});

app.use('/chat',Chat);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});