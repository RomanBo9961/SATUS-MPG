/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Modules } from '../../../auth/decorators/modules.decorator';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { CreateUserDto, UpdateUserDto } from 'src/users/dtos/user.dto';
import { UsersService } from '../../../users/services/users/users.service';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';

@ApiTags('users') // 🔹 Agregué Tags para que en Swagger se vea ordenado
@ApiBearerAuth()
@Modules('users')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService){}

    @Get()
    getUsers() {
        return this.usersService.findAll();
    }

    @Get(':userId')
    // 🔹 CAMBIO: Eliminamos ParseIntPipe y usamos string
    getOne(@Param('userId') userId: string){
        return this.usersService.findOne(userId);
    }

    @Post()
    createUser(@Body() payload: CreateUserDto){
        return this.usersService.create(payload);
    }

    @Put(':userId')
    // 🔹 CAMBIO: Eliminamos ParseIntPipe y usamos string
    updateUser(@Param('userId') userId: string, @Body() payloadUpdated: UpdateUserDto){
        return this.usersService.updateUser(userId, payloadUpdated);
    }

    @Delete(':userId')
    // 🔹 CAMBIO: Eliminamos ParseIntPipe y usamos string
    async deleteUser(@Param('userId') userId: string){
        return await this.usersService.deleteUser(userId);
    }
}
