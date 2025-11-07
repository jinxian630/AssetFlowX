import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import {
  LoginDto,
  RegisterDto,
  Web3LoginDto,
  ConnectWalletDto,
  VerifyIAMDto,
  RefreshTokenDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Traditional email/password login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user (student/instructor/enterprise)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    // Validate role
    if (!['student', 'instructor', 'enterprise'].includes(registerDto.role)) {
      throw new BadRequestException('Invalid role');
    }

    const user = await this.authService.register(registerDto);
    return this.authService.login(user);
  }

  @Public()
  @Post('login/web3')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Web3 wallet login (MetaMask/zkLogin)' })
  @ApiResponse({ status: 200, description: 'Web3 login successful' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async web3Login(@Body() web3LoginDto: Web3LoginDto) {
    const user = await this.authService.web3Login(web3LoginDto);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('wallet/connect')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect Web3 wallet to existing account' })
  @ApiResponse({ status: 200, description: 'Wallet connected successfully' })
  async connectWallet(@Request() req, @Body() connectWalletDto: ConnectWalletDto) {
    return this.authService.connectWallet(req.user.id, connectWalletDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('iam/verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Huawei Cloud IAM credentials' })
  @ApiResponse({ status: 200, description: 'IAM verified successfully' })
  async verifyIAM(@Request() req, @Body() verifyIAMDto: VerifyIAMDto) {
    return this.authService.verifyHuaweiCloudIAM(req.user.id, verifyIAMDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.id);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @Request() req,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('enable-2fa')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async enable2FA(@Request() req) {
    return this.authService.enable2FA(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2FA code' })
  @ApiResponse({ status: 200, description: '2FA verified successfully' })
  async verify2FA(@Request() req, @Body('code') code: string) {
    return this.authService.verify2FA(req.user.id, code);
  }
}
