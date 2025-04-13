import { Organization } from '../../db/model';
import { db } from '../../db/drizzle';
import { Organizations } from '../../db/schema';
import { and, count, eq, notInArray } from 'drizzle-orm';

export const createNewOrganization = async (organization: Organization): Promise<void> => {
    await db.insert(Organizations).values(organization);
};

export const updateOrganizationData = async (organization: Organization): Promise<void> => {
    await db.update(Organizations).set(organization).where(eq(Organizations.id, organization.id));
};

export const doesOrganizationExistById = async (id: number): Promise<boolean> => {
    const [{ value: countOrganizations }] = await db
        .select({ value: count() })
        .from(Organizations)
        .where(eq(Organizations.id, id));
    return countOrganizations !== 0;
};

export const updateOrCreateOrganization = async (organization: Organization): Promise<void> => {
    const exists = await doesOrganizationExistById(organization.id);
    if (exists) {
        return await updateOrganizationData(organization);
    }
    return await createNewOrganization(organization);
};

export const deleteAbsentOrganizationsByCreatorUserId = async (
    allowedIds: number[],
    creatorUserId: number,
): Promise<void> => {
    await db
        .delete(Organizations)
        .where(
            and(
                eq(Organizations.creatorUserId, BigInt(creatorUserId)),
                notInArray(Organizations.id, allowedIds),
            ),
        );
};
