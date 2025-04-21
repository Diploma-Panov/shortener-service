import { User } from '../../db/model';
import { db } from '../../db/drizzle';
import { count, eq } from 'drizzle-orm';
import { Users } from '../../db/schema';
import { NotFoundError } from '../../exception/NotFoundError';

export const findUserByIdThrowable = async (id: number): Promise<User> => {
    const found: User[] = await db.select().from(Users).where(eq(Users.id, id));
    if (found.length === 0) {
        throw new NotFoundError('User', 'id', id);
    }
    return found[0];
};

export const createNewUser = async (user: User): Promise<void> => {
    await db.transaction(async (tx) => {
        await tx.insert(Users).values(user);
    });
};

export const updateUserData = async (user: User): Promise<void> => {
    await db.transaction(async (tx) => {
        await tx.update(Users).set(user).where(eq(Users.id, user.id));
    });
};

export const doesUserExistById = async (id: number): Promise<boolean> => {
    const [{ value: countUsers }] = await db
        .select({ value: count() })
        .from(Users)
        .where(eq(Users.id, id));
    return countUsers !== 0;
};

export const updateOrCreateUser = async (user: User): Promise<void> => {
    const exists = await doesUserExistById(user.id);
    if (exists) {
        return await updateUserData(user);
    }
    return await createNewUser(user);
};
