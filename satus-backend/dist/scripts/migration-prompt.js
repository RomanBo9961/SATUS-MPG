"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = __importDefault(require("prompts"));
const child_process_1 = require("child_process");
const path_1 = require("path");
(async () => {
    const { environment } = await (0, prompts_1.default)({
        type: 'select',
        name: 'environment',
        message: '🌍 Selecciona el ambiente:',
        choices: [
            { title: 'Development', value: 'dev' },
        ],
    });
    if (!environment) {
        console.log('Operación cancelada.');
        process.exit(0);
    }
    process.env.NODE_ENV = environment;
    const { migrationName } = await (0, prompts_1.default)({
        type: 'text',
        name: 'migrationName',
        message: '📝 Ingresa el nombre de la migración (ej: AddNewColumn):',
        validate: (name) => name.trim() === '' ? 'El nombre no puede estar vacío' : true,
    });
    if (!migrationName) {
        console.log('Operación cancelada.');
        process.exit(0);
    }
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Entities pattern:', (0, path_1.join)(__dirname, '..', '**', '*.entity.{ts,js}'));
    try {
        console.log(`🔄 Generando migración "${migrationName}" en ambiente "${environment}"...`);
        (0, child_process_1.execSync)(`npm run typeorm -- migration:generate ./src/database/migrations/${migrationName} -d ./src/database/data-source.ts`, { stdio: 'inherit' });
        console.log('✅ ¡Migración generada con éxito!');
    }
    catch (error) {
        console.error('❌ Error al generar la migración:', error.message);
        process.exit(1);
    }
})();
//# sourceMappingURL=migration-prompt.js.map