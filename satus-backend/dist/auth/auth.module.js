"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("../auth/services/auth.service");
const auth_controller_1 = require("../auth/controllers/auth.controller");
const users_module_1 = require("../users/users.module");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const config_1 = __importDefault(require("../config"));
const modules_guard_guard_1 = require("./guards/modules.guard.guard");
const auth_guard_1 = require("./guards/auth.guard");
const roles_module_1 = require("../roles/roles.module");
const telemetry_module_1 = require("../telemetry/telemetry.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            passport_1.PassportModule,
            roles_module_1.RolesModule,
            telemetry_module_1.TelemetryModule,
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.default.KEY],
                useFactory: (configType) => {
                    return {
                        secret: configType.jwtSecret,
                        signOptions: {
                            expiresIn: configType.jwtExpiresIn,
                        },
                    };
                },
            }),
        ],
        providers: [auth_service_1.AuthService, modules_guard_guard_1.ModulesGuard, auth_guard_1.JwtAuthGuard, jwt_strategy_1.JwtStrategy],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, modules_guard_guard_1.ModulesGuard, auth_guard_1.JwtAuthGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map