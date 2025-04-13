import { ErrorResponseDto } from '../dto/common/errors';

export class AuthServiceApiError extends Error {
    public errorResponse: ErrorResponseDto;

    constructor(errorResponse: ErrorResponseDto) {
        super('AuthServiceApiError');
        this.errorResponse = errorResponse;
        Object.setPrototypeOf(this, AuthServiceApiError.prototype);
    }
}
