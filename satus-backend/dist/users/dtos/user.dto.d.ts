export declare class CreateUserDto {
    readonly name: string;
    readonly lastName: string;
    readonly docType: string;
    readonly docNumber: string;
    readonly email: string;
    readonly password: string;
    readonly isActive: boolean;
    readonly roleIds: string[];
}
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
}
export {};
