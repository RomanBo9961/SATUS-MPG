/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsBoolean, IsMongoId } from "class-validator";
import { PartialType, ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly lastName: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly docType: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly docNumber: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly password: string;

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty()
    readonly isActive: boolean;

    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({ each: true }) 
    @ApiProperty({ type: [String] }) 
    readonly roleIds: string[]; 
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }
