import jwt from 'jsonwebtoken';
import { JwtPayload, JwtUserSubject } from './common';
import { config } from '../config';
import { logger } from '../config/logger';

export const parseJwtToken = (token: string): JwtUserSubject => {
    try {
        const tokenStr = token.startsWith('Bearer ') ? token.substring(7) : token;

        const verifiedPayload = jwt.verify(tokenStr, config.jwt.publicKey, {
            algorithms: ['RS512'],
            issuer: 'Maksym Panov',
        }) as JwtPayload;

        return JSON.parse(verifiedPayload.sub) as JwtUserSubject;
    } catch (error) {
        logger.error('JWT verification failed:', error);
        throw new Error('Invalid JWT token');
    }
};
