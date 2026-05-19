import { z } from 'zod';
export declare const LoginBodySchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const LoginResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        id: string;
        name: string;
    }, {
        email: string;
        id: string;
        name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    accessToken: string;
    user: {
        email: string;
        id: string;
        name: string;
    };
}, {
    accessToken: string;
    user: {
        email: string;
        id: string;
        name: string;
    };
}>;
export declare const authContract: {
    login: {
        summary: "Authenticate user and return JWT";
        method: "POST";
        body: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
        }, {
            email: string;
            password: string;
        }>;
        path: "/auth/login";
        responses: {
            200: z.ZodObject<{
                accessToken: z.ZodString;
                user: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    email: string;
                    id: string;
                    name: string;
                }, {
                    email: string;
                    id: string;
                    name: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                accessToken: string;
                user: {
                    email: string;
                    id: string;
                    name: string;
                };
            }, {
                accessToken: string;
                user: {
                    email: string;
                    id: string;
                    name: string;
                };
            }>;
            401: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
            }>;
        };
    };
};
//# sourceMappingURL=auth.contract.d.ts.map