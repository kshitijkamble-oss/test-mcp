import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

const USERS: Array<{ id: string; email: string; password: string; name: string }> = [
  { id: 'user-001', email: 'super.admin@adani.com', password: 'Test@1234', name: 'Super Admin' },
];

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<AuthUser> {
    const user = USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email, name: user.name };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, email: user.email, name: user.name };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }
}
