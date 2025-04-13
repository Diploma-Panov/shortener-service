export interface ErrorResponseElement {
    errorMessage: string;
    errorType: string;
    errorClass: string;
}

export interface ErrorResponseDto {
    errors: ErrorResponseElement[];
}
