import express from 'express';
import bodyParser from 'body-parser';
import router from './services/router.js';

const port=8080;

const app = express();
app.use(bodyParser.json());
app.use('/', router);

app.listen(port, () => {
  console.log('Server is running on port 8080');
});