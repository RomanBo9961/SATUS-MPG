/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsMongoId } from "class-validator";
import { PartialType, ApiProperty } from "@nestjs/swagger";

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly description: string;

    @ApiProperty({
        example: ['65f1a2b3c4d5e6f7a8b9c0d1'], 
        description: 'IDs de los módulos asignados al rol'
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({ each: true }) 
    readonly moduleIds: string[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) { }
