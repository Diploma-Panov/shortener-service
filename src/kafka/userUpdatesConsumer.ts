import { Kafka } from 'kafkajs';
import { config } from '../config';
import { KafkaUserUpdateDto } from './dto/userUpdates';
import { logger } from '../config/logger';
import { updateOrCreateUser } from '../components/dao/userDao';

const kafka = new Kafka({
    clientId: 'user-updates-consumer',
    brokers: [config.kafka.bootstrapServer],
});

const consumer = kafka.consumer({ groupId: 'user-updates-group' });

export const startKafkaConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: config.kafka.userUpdatesTopicName, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const raw = message.value?.toString();
                if (!raw) return;

                const userUpdate: KafkaUserUpdateDto = JSON.parse(raw);

                await updateOrCreateUser({
                    id: userUpdate.id,
                    firstname: userUpdate.firstname,
                    lastname: userUpdate.lastname,
                    email: userUpdate.email,
                });

                logger.info('Kafka user update received:', userUpdate);
            } catch (err) {
                logger.error('Failed to parse Kafka message:', err);
            }
        },
    });
};
