export interface GlobalStatisticsDto {
    countryCounts: Record<string, number>;
    cityCounts: Record<string, number>;
}

export interface PeriodCountDto {
    timestamp: string;
    count: number;
}

export interface PeriodCountsDto {
    counts: PeriodCountDto[];
}

export enum StatsPeriod {
    MINUTE = 60,
    HOUR = 3600,
    DAY = 86400,
    MONTH = 2592000,
}
