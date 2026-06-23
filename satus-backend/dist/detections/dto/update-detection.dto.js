"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDetectionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_detection_dto_1 = require("./create-detection.dto");
class UpdateDetectionDto extends (0, swagger_1.PartialType)(create_detection_dto_1.CreateDetectionDto) {
}
exports.UpdateDetectionDto = UpdateDetectionDto;
//# sourceMappingURL=update-detection.dto.js.map