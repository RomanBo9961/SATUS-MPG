export declare class CreateModuleDto {
    name: string;
    description?: string;
}
declare const UpdateModuleDto_base: import("@nestjs/common").Type<Partial<CreateModuleDto>>;
export declare class UpdateModuleDto extends UpdateModuleDto_base {
}
export {};
