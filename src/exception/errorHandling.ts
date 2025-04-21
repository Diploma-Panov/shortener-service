import { AuthServiceApiError } from './AuthServiceApiError';
import { NextFunction, Request, Response } from 'express';
import { AuthError } from './AuthError';
import { ErrorResponseDto } from '../dto/common/errors';
import { NotFoundError } from './NotFoundError';

export enum ServiceErrorType {
    PLATFORM_ERROR = 'PLATFORM_ERROR',
    ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED',
    NO_ACCESS_TOKEN_FOUND = 'NO_ACCESS_TOKEN_FOUND',
    INVALID_ACCESS_TOKEN = 'INVALID_ACCESS_TOKEN',
    LOGIN_FAILED = 'LOGIN_FAILED',
    ACCESS_DENIED = 'ACCESS_DENIED',
    TOKEN_GENERATION_FAILED = 'TOKEN_GENERATION_FAILED',
    EMAIL_IS_INVALID = 'EMAIL_IS_INVALID',
    ENTITY_ALREADY_EXISTS = 'ENTITY_ALREADY_EXISTS',
    ORGANIZATION_ACTION_NOT_ALLOWED = 'ORGANIZATION_ACTION_NOT_ALLOWED',
    ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
    FORM_VALIDATION_FAILED = 'FORM_VALIDATION_FAILED',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    PASSWORD_IS_NOT_COMPLIANT = 'PASSWORD_IS_NOT_COMPLIANT',
    SHORT_CODE_EXPIRED = 'SHORT_CODE_EXPIRED',
}

const serviceErrorTypeToResponseStatus = (errorType: ServiceErrorType): number => {
    switch (errorType) {
        case ServiceErrorType.PLATFORM_ERROR:
        case ServiceErrorType.INTERNAL_ERROR:
        case ServiceErrorType.TOKEN_GENERATION_FAILED:
            return 500;
        case ServiceErrorType.ACCESS_TOKEN_EXPIRED:
        case ServiceErrorType.NO_ACCESS_TOKEN_FOUND:
        case ServiceErrorType.INVALID_ACCESS_TOKEN:
        case ServiceErrorType.SHORT_CODE_EXPIRED:
        case ServiceErrorType.LOGIN_FAILED:
            return 401;
        case ServiceErrorType.ACCESS_DENIED:
        case ServiceErrorType.ORGANIZATION_ACTION_NOT_ALLOWED:
            return 403;
        case ServiceErrorType.EMAIL_IS_INVALID:
        case ServiceErrorType.FORM_VALIDATION_FAILED:
        case ServiceErrorType.PASSWORD_IS_NOT_COMPLIANT:
            return 400;
        case ServiceErrorType.ENTITY_ALREADY_EXISTS:
            return 409;
        case ServiceErrorType.ENTITY_NOT_FOUND:
            return 404;
        default:
            return 500;
    }
};

export const errorHandlerMiddleware = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    if (error instanceof AuthServiceApiError) {
        const payload = error.errorResponse;
        res.status(
            serviceErrorTypeToResponseStatus(payload.errors[0].errorType as ServiceErrorType),
        ).json(payload);
    } else if (error instanceof AuthError) {
        const payload: ErrorResponseDto = {
            errors: [
                {
                    errorType: error.errorType,
                    errorMessage: error.message,
                    errorClass: 'AuthError',
                },
            ],
        };
        res.status(serviceErrorTypeToResponseStatus(error.errorType)).json(payload);
    } else if (error instanceof NotFoundError) {
        const payload: ErrorResponseDto = {
            errors: [
                {
                    errorType: ServiceErrorType.ENTITY_NOT_FOUND,
                    errorMessage: error.message,
                    errorClass: 'NotFoundError',
                },
            ],
        };
        res.status(404).json(payload);
    }
};
