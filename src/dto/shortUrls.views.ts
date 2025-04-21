import { PagedResponse } from './common/PagedResponse';
import { ShortUrlState, ShortUrlType } from '../db/model';
import { IsDefined, IsNotEmpty, IsUrl } from 'class-validator';

export interface ShortUrlsSearchParams {
    p?: number;
    q?: number;
    tags?: string[];
    s?: ShortUrlState[];
    t?: ShortUrlType[];
    sb?: string;
    dir?: string;
}

export interface ShortUrlDto {
    id: number;
    creatorName: string;
    originalUrl: string;
    shortUrl: string;
    state: ShortUrlState;
    type: ShortUrlType;
    tags: string[];
}

export interface ShortUrlsListDto extends PagedResponse {
    entries: ShortUrlDto[];
}

export class CreateShortUrlDto {
    @IsUrl()
    @IsNotEmpty()
    originalUrl: string;

    @IsDefined()
    tags: string[];
}
