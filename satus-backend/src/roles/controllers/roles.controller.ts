/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    HttpCode,
    UseGuards,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/role.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { Modules } from '../../auth/decorators/modules.decorator';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';

@ApiBearerAuth()
@ApiTags('Roles')
@Modules('roles')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new role' })
    @ApiResponse({ status: 201, description: 'Role created successfully' })
    async create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all roles' })
    async findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get role by id' })
    // 🔹 CAMBIO: Quitamos ParseIntPipe y usamos string
    async findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a role by id' })
    // 🔹 CAMBIO: Quitamos ParseIntPipe y usamos string
    async update(
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @HttpCode(24) // Nota: 204 es el estándar para No Content
    @ApiOperation({ summary: 'Delete a role by id' })
    // 🔹 CAMBIO: Quitamos ParseIntPipe y usamos string
    async remove(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
