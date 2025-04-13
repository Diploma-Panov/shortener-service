import { IsBase64, IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export interface UpdateUserInfoDto {
    newFirstname?: string | null;
    newLastname?: string | null;
    newCompanyName?: string | null;
    newEmail?: string | null;
}

export class UpdateUserProfilePictureDto {
    @IsNotEmpty()
    @IsBase64()
    newProfilePictureBase64: string;
}

export interface UserInfoDto {
    id: number;
    firstname: string;
    lastname: string;
    companyName: string | null;
    email: string;
    profilePictureUrl: string | null;
}

export class UserLoginDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
}

export class UserSignupDto {
    @IsNotEmpty()
    @IsEmail()
    @Length(0, 255)
    username: string;

    @Length(8, 64)
    password: string;

    @IsNotEmpty()
    @Length(1, 255)
    firstName: string;

    @IsOptional()
    @Length(0, 255)
    lastName?: string | null;

    @IsOptional()
    @Length(0, 255)
    companyName?: string | null;

    @IsOptional()
    @IsBase64()
    profilePictureBase64?: string | null;

    @IsNotEmpty()
    @IsString()
    organizationScope: 'SHORTENER_SCOPE';

    @IsOptional()
    @IsString()
    siteUrl?: string | null;
}
