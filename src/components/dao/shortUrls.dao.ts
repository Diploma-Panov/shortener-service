import { ShortUrl, ShortUrlState } from '../../db/model';
import { db } from '../../db/drizzle';
import { ShortUrls } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '../../exception/NotFoundError';
import { config } from '../../config';

export const findUrlByIdThrowable = async (id: number): Promise<ShortUrl> => {
    const [found] = await db.select().from(ShortUrls).where(eq(ShortUrls.id, id));
    if (!found) {
        throw new NotFoundError('ShortUrl', 'id', id);
    }
    return found;
};

export const findUrlByShortCodeThrowable = async (code: string): Promise<ShortUrl> => {
    const fullShortUrl = `${config.urls.baseUrl}/${code}`;
    const [found] = await db.select().from(ShortUrls).where(eq(ShortUrls.shortUrl, fullShortUrl));
    if (!found) {
        throw new NotFoundError('ShortUrl', 'shortUrl', fullShortUrl);
    }
    return found;
};

export const updateUrlWithNewStateById = async (
    id: number,
    state: ShortUrlState,
): Promise<ShortUrl | null> => {
    const [updated] = await db
        .update(ShortUrls)
        .set({ shortUrlState: state })
        .where(eq(ShortUrls.id, id))
        .returning();
    if (!updated) {
        return null;
    }
    return updated;
};
