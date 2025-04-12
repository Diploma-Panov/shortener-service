import express from 'express';
import { config } from './config';
import { apiRouter } from './routes/api/shrt/v0';

const app = express();

app.use(express.json());

app.use('/api/shrt/v0', apiRouter);

const start = async () => {
    try {
        console.log('Postgres connection established.');
        app.listen(config.app.port, () => console.log(`Server at http://localhost:${config.app.port}`));
    } catch (err) {
        console.error('Unable to connect:', err);
    }
};

start();
