import { Kafka } from 'kafkajs';
import { config } from '../config';
import { KafkaUserUpdateDto } from './dto/userUpdates';
import { logger } from '../config/logger';
import { db } from '../db/drizzle';
import { Users } from '../db/schema';
import { eq } from 'drizzle-orm';

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

                const existing = await db.select().from(Users).where(eq(Users.id, userUpdate.id));

                if (existing.length !== 0) {
                    logger.info('Updating');
                    await db
                        .update(Users)
                        .set({
                            firstname: userUpdate.firstname,
                            lastname: userUpdate.lastname,
                            email: userUpdate.email,
                        })
                        .where(eq(Users.id, userUpdate.id));
                } else {
                    logger.info('Creating');
                    await db.insert(Users).values({
                        id: userUpdate.id,
                        firstname: userUpdate.firstname,
                        lastname: userUpdate.lastname,
                        email: userUpdate.email,
                    });
                }
                logger.info('Kafka user update received:', userUpdate);
            } catch (err) {
                logger.error('Failed to parse Kafka message:', err);
            }
        },
    });
};
