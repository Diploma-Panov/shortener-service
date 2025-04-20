import { ServiceErrorType } from './errorHandling';

export class AuthError extends Error {
    constructor(message: string, public readonly errorType: ServiceErrorType) {
        super(message);
    }
}
