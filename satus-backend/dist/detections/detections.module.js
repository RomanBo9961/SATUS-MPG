"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const axios_1 = require("@nestjs/axios");
const jwt_1 = require("@nestjs/jwt");
const detections_service_1 = require("./detections.service");
const detections_controller_1 = require("./detections.controller");
const detection_entity_1 = require("./entities/detection.entity");
let DetectionsModule = class DetectionsModule {
};
exports.DetectionsModule = DetectionsModule;
exports.DetectionsModule = DetectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: detection_entity_1.Detection.name, schema: detection_entity_1.DetectionSchema }
            ]),
            axios_1.HttpModule,
            jwt_1.JwtModule.register({})
        ],
        controllers: [detections_controller_1.DetectionsController],
        providers: [detections_service_1.DetectionsService],
        exports: [detections_service_1.DetectionsService]
    })
], DetectionsModule);
//# sourceMappingURL=detections.module.js.map