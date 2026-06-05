/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Modules } from '../../../auth/decorators/modules.decorator';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { CreateUserDto, UpdateUserDto } from '../../../users/dtos/user.dto';
import { UsersService } from '../../../users/services/users/users.service';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { Types } from 'mongoose';

@ApiTags('users')
@ApiBearerAuth()
@Modules('users')
//@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) { }

    @UseGuards(JwtAuthGuard, ModulesGuard)
    @Get()
    getUsers() {
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard, ModulesGuard)
    @Get(':userId')
    getOne(@Param('userId') userId: string) {
        return this.usersService.findOne(userId);
    }

    @UseGuards(JwtAuthGuard, ModulesGuard)
    @Post()
    createUser(@Body() payload: CreateUserDto) {
        return this.usersService.create(payload);
    }

    @UseGuards(JwtAuthGuard, ModulesGuard)
    @Put(':userId')
    updateUser(@Param('userId') userId: string, @Body() payloadUpdated: UpdateUserDto) {
        return this.usersService.updateUser(userId, payloadUpdated);
    }

    @UseGuards(JwtAuthGuard, ModulesGuard)
    @Delete(':userId')
    async deleteUser(@Param('userId') userId: string) {
        return await this.usersService.deleteUser(userId);
    }

    @Post('register')
    async registerPublicNode(@Body() createUserDto: any) {
        const defaultRole = [];

        const nameBase = createUserDto.name ? createUserDto.name.toLowerCase().trim() : 'node';
        const generatedUsername = `${nameBase}_${Math.floor(Math.random() * 999)}`;

        const finalUserData = {
            ...createUserDto,
            username: generatedUsername,
            docType: createUserDto.docType || 'GUEST',
            docNumber: createUserDto.docNumber || 'PENDING_REG',
            lastName: createUserDto.lastName || 'SATUS'
        };

        return this.usersService.create({ ...finalUserData, roleIds: defaultRole });
    }

    @Post('admin/mutate-role')
    async mutateUserRoleInCaliente(@Body() payload: { userId: string, targetTier: 'FREE' | 'PRO' }) {
        const { userId, targetTier } = payload;

        console.log(`⚡ [TORRE CONTROL] Comando de escalada recibido para el usuario: ${userId} -> Destino: ${targetTier}`);

        // Converte el string de la interfaz en ids de roles 
        let targetRoleId = '660000000000000000000001';
        if (targetTier === 'PRO') {
            targetRoleId = '660000000000000000000003';
        }

        // Ejecuta la inyección directa desde el updateUser
        const userUpdated = await this.usersService.updateUser(userId, { roleIds: [targetRoleId] } as any);

        return {
            success: true,
            message: `Aduana SATUS: Rango alterado correctamente a nivel de infraestructura.`,
            user: userUpdated
        };
    }
}
