export interface HealthResponseDto {
    status: HealthStatus;
}

export enum HealthStatus {
    UP = 'UP',
    DOWN = 'DOWN'
}