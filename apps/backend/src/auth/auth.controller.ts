import { Controller } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { authContract } from '@drs/contract';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @TsRestHandler(authContract.login)
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async login() {
    // Return type is inferred by tsRestHandler — ts-rest handles this internally
    return tsRestHandler(authContract.login, async ({ body }) => {
      try {
        const result = await this.authService.login(body.email, body.password);
        return { status: 200 as const, body: result };
      } catch {
        return {
          status: 401 as const,
          body: { message: 'Invalid email or password' },
        };
      }
    });
  }
}
