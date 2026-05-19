import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
});

export const authContract = c.router({
  login: {
    method: 'POST',
    path: '/auth/login',
    body: LoginBodySchema,
    responses: {
      200: LoginResponseSchema,
      401: z.object({ message: z.string() }),
    },
    summary: 'Authenticate user and return JWT',
  },
});
