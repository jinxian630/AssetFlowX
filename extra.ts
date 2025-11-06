import { Injectable, UnauthorizedException, Module } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as LocalStrategyBase } from 'passport-local';
import { Strategy as JwtStrategyBase, ExtractJwt } from 'passport-jwt';
import { Strategy as CustomStrategy } from 'passport-custom';
import { AuthGuard } from '@nestjs/passport';
import { ethers } from 'ethers';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

// Local Strategy - email + password login

@Injectable()
export class LocalStrategy extends PassportStrategy(LocalStrategyBase) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    return user;
  }
}

// Web3 Strategy - wallet signature login

@Injectable()
export class Web3Strategy extends PassportStrategy(CustomStrategy, 'web3') {
  constructor(private usersService: UsersService) {
    super();
  }

  async validate(req: any): Promise<any> {
    const { address, signature, message } = req.body;
    if (!address || !signature || !message)
      throw new UnauthorizedException('Missing Web3 credentials');

    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase())
      throw new UnauthorizedException('Invalid signature');

    const user = await this.usersService.findByWallet(address);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}


// Guards - to protect routes

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class Web3AuthGuard extends AuthGuard('web3') {}

// Mock User Service - demo user database

@Injectable()
export class UsersService {
  private users = [
    {
      id: 1,
      email: 'test@example.com',
      password: bcrypt.hashSync('123456', 10),
      role: 'user',
      wallet: '0x1234...',
    },
  ];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email);
  }

  async findByWallet(wallet: string) {
    return this.users.find(
      (u) => u.wallet.toLowerCase() === wallet.toLowerCase(),
    );
  }
}

// Users Module - to be imported by AuthModule

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
