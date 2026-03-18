import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; 
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { User, UserSchema } from './entities/user.entity';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports:[
    // MongooseModule registra el Schema para que el Service lo use
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RolesModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
