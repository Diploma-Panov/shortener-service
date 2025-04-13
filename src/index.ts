import express from 'express';
import { config } from './config';
import { apiRouter } from './routes/api/shrt/v0';
import { startKafkaConsumer } from './kafka/userUpdatesConsumer';
import { errorHandlerMiddleware } from './exception/errorHandling';

const app = express();

app.use(express.json());

app.use('/api/shrt/v0', apiRouter);

app.use(errorHandlerMiddleware);

startKafkaConsumer();

const start = async () => {
    try {
        console.log('Postgres connection established.');
        app.listen(config.app.port, () =>
            console.log(`Server at http://localhost:${config.app.port}`),
        );
    } catch (err) {
        console.error('Unable to connect:', err);
    }
};

start();
