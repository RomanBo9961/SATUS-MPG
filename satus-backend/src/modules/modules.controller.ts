import { Controller, Get, Post, Body } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dtos/create-module.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Modules')
@Controller('modules')
export class ModulesController {

  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new module' })
  create(@Body() dto: CreateModuleDto) {
    return this.modulesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all modules' })
  findAll() {
    return this.modulesService.findAll();
  }

}