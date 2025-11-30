import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyCredentialDto {
    @ApiProperty({
        description: 'JWT proof token from the credential to verify',
        example: 'eyJhbGciOiJFZERTQSJ9.eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiXSwiaWQiOiJ1cm46dXVpZDpkNDgwODExNi05Y2RjLTQwYTUtYmVlMC03ZjFmNjBhNjFiMDMiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwidGVzdCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6InRlc3QiLCJrayI6ImtrIn0sImlzc3VlciI6ImRpZDpleGFtcGxlOnVzZXItbWlqaTZyeWwtbTlvYW1odWl6NDU1YzZhIiwiaXNzdWFuY2VEYXRlIjoiMjAyNS0xMS0zMFQxMzoxMzo0Mi42OTJaIiwidXNlcklkIjoidXNlci1taWppNnJ5bC1tOW9hbWh1aXo0NTVjNmEiLCJpYXQiOjE3MzI5NzU5Mjd9.yyjJWsrI99mJghLXTHkmf4hB-fEJUmLzpwtno6cKuisKFu4c_GBPGhPXAKVh9yKe0s0wFEkTJC-kymCCL-8-Bg',
        maxLength: 10000,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10000)
    token: string;
}