export enum HealthStatus {
    UP = 'UP',
}

export interface HealthResponseDto {
    status: HealthStatus;
}
