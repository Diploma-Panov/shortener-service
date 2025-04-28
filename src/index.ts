import express from 'express';
import cors from 'cors';
import { config } from './config';
import { apiRouter } from './routes/api/shrt/v0';
import { startKafkaConsumer } from './kafka/userUpdatesConsumer.kafka';
import { resolutionsRouter } from './routes/api/shrt/v0/r/resolutions.controller';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/r', resolutionsRouter);
app.use('/api/shrt/v0', apiRouter);

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
