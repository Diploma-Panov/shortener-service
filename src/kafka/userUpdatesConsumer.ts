import { Kafka } from 'kafkajs';
import { config } from '../config';
import {
    KafkaOrganizationMembersUpdateDto,
    KafkaOrganizationUpdateDto,
    KafkaUserUpdateDto,
    OrganizationScope,
} from './dto/userUpdates';
import { logger } from '../config/logger';
import { updateOrCreateUser } from '../components/dao/userDao';
import {
    deleteAbsentOrganizationsByCreatorUserId,
    updateOrCreateOrganization,
} from '../components/dao/organizationDao';
import {
    deleteAbsentOrganizationMembersByUserId,
    updateOrCreateOrganizationMember,
} from '../components/dao/organizationMemberDao';

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

                const organizations: KafkaOrganizationUpdateDto[] =
                    userUpdate.organizationsCreatedByUser;
                const organizationIds: number[] = organizations.map((o) => o.id);

                await deleteAbsentOrganizationsByCreatorUserId(organizationIds, userUpdate.id);

                const organizationPromises: Promise<void>[] = [];
                for (const organization of organizations) {
                    if (organization.scope === OrganizationScope.SHORTENER_SCOPE) {
                        organizationPromises.push(
                            updateOrCreateOrganization({
                                id: organization.id,
                                creatorUserId: BigInt(userUpdate.id),
                                name: organization.name,
                                slug: organization.slug,
                                siteUrl: organization.siteUrl,
                                description: organization.description,
                            }),
                        );
                    }
                }
                await Promise.all(organizationPromises);

                const organizationMembers: KafkaOrganizationMembersUpdateDto[] = userUpdate.members;
                const organizationMemberIds: number[] = organizationMembers.map((om) => om.id);

                await deleteAbsentOrganizationMembersByUserId(organizationMemberIds, userUpdate.id);

                const organizationMemberPromises: Promise<void>[] = [];
                for (const organizationMember of organizationMembers) {
                    organizationMemberPromises.push(
                        updateOrCreateOrganizationMember({
                            id: organizationMember.id,
                            memberUserId: BigInt(userUpdate.id),
                            organizationId: BigInt(organizationMember.organizationId),
                            displayFirstname: organizationMember.displayFirstname,
                            displayLastname: organizationMember.displayLastname,
                        }),
                    );
                }
                await Promise.all(organizationMemberPromises);

                logger.info('Kafka user update received:', userUpdate);
            } catch (err) {
                logger.error('Failed to parse Kafka message:', err);
            }
        },
    });
};
