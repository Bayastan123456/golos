import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';

import { Prisma } from '../../generated/prisma/client.js';

import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,

    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  private async createToken(userId: string) {
    return this.jwtService.signAsync({
      sub: userId,
    });
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    // bcrypt учитывает не более 72 байт пароля.
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new BadRequestException(
        'Пароль слишком длинный: максимум 72 байта в UTF-8',
      );
    }

    const passwordHash = await hash(dto.password, 12);

    let user;

    try {
      user = await this.usersService.create({
        email,
        passwordHash,
        name: dto.name?.trim() || undefined,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }

      throw error;
    }

    const accessToken = await this.createToken(user.id);

    return {
      accessToken,
      tokenType: 'Bearer',
      user,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(email);

    const validPassword = user
      ? await compare(dto.password, user.passwordHash)
      : false;

    if (!user || !validPassword) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const accessToken = await this.createToken(user.id);

    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findPublicById(userId);

    if (!user) {
      throw new UnauthorizedException('Пользователь больше не существует');
    }

    return user;
  }
}
