import { ServiceErrorType } from '../../exception/errorHandling';

export interface ErrorResponseElement {
    errorMessage: string;
    errorType: ServiceErrorType;
    errorClass: string;
}

export interface ErrorResponseDto {
    errors: ErrorResponseElement[];
}
