import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class VerifyCredentialDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(10000)
    token: string;
}