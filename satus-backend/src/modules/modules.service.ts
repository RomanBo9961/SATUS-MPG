import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; 
import { Model } from 'mongoose'; 
import { ModuleEntity } from './entities/module.entity';
import { CreateModuleDto } from './dtos/create-module.dto';

@Injectable()
export class ModulesService {

    constructor(
        // Inyeccion del Modelo de Mongo 
        @InjectModel(ModuleEntity.name) 
        private moduleModel: Model<ModuleEntity>,
    ) { }

    async findByIds(ids: string[]) {
        // Busca múltiples documentos por su ID de Mongo
        return await this.moduleModel.find({
            _id: { $in: ids }
        }).exec();
    }

    async create(dto: CreateModuleDto) {
        // Crea una nueva instancia del modelo con los datos del DTO
        const newModule = new this.moduleModel(dto);
        return await newModule.save();
    }

    async findAll() {
        // Trae todos los módulos de la colección
        return await this.moduleModel.find().exec();
    }
}
