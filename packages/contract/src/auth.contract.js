"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authContract = exports.LoginResponseSchema = exports.LoginBodySchema = void 0;
const core_1 = require("@ts-rest/core");
const zod_1 = require("zod");
const c = (0, core_1.initContract)();
exports.LoginBodySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.LoginResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    user: zod_1.z.object({
        id: zod_1.z.string(),
        email: zod_1.z.string().email(),
        name: zod_1.z.string(),
    }),
});
exports.authContract = c.router({
    login: {
        method: 'POST',
        path: '/auth/login',
        body: exports.LoginBodySchema,
        responses: {
            200: exports.LoginResponseSchema,
            401: zod_1.z.object({ message: zod_1.z.string() }),
        },
        summary: 'Authenticate user and return JWT',
    },
});
//# sourceMappingURL=auth.contract.js.map