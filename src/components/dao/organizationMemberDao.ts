import { OrganizationMember } from '../../db/model';
import { db } from '../../db/drizzle';
import { OrganizationMembers } from '../../db/schema';
import { and, count, eq, notInArray } from 'drizzle-orm';

export const createNewOrganizationMember = async (
    organizationMember: OrganizationMember,
): Promise<void> => {
    await db.insert(OrganizationMembers).values(organizationMember);
};

export const updateOrganizationMemberData = async (
    organizationMember: OrganizationMember,
): Promise<void> => {
    await db
        .update(OrganizationMembers)
        .set(organizationMember)
        .where(eq(OrganizationMembers.id, organizationMember.id));
};

export const doesOrganizationMemberExistById = async (id: number): Promise<boolean> => {
    const [{ value: countOrganizationMembers }] = await db
        .select({ value: count() })
        .from(OrganizationMembers)
        .where(eq(OrganizationMembers.id, id));
    return countOrganizationMembers !== 0;
};

export const updateOrCreateOrganizationMember = async (
    organizationMember: OrganizationMember,
): Promise<void> => {
    const exists = await doesOrganizationMemberExistById(organizationMember.id);
    if (exists) {
        return await updateOrganizationMemberData(organizationMember);
    }
    return await createNewOrganizationMember(organizationMember);
};

export const deleteAbsentOrganizationMembersByUserId = async (
    allowedIds: number[],
    memberUserId: number,
): Promise<void> => {
    await db
        .delete(OrganizationMembers)
        .where(
            and(
                eq(OrganizationMembers.memberUserId, BigInt(memberUserId)),
                notInArray(OrganizationMembers.id, allowedIds),
            ),
        );
};
