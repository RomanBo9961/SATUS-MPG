export declare class CreateRoleDto {
    readonly name: string;
    readonly description: string;
    readonly moduleIds: string[];
}
declare const UpdateRoleDto_base: import("@nestjs/common").Type<Partial<CreateRoleDto>>;
export declare class UpdateRoleDto extends UpdateRoleDto_base {
}
export {};
