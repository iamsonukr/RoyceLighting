import {
  Controller, Post, Get, Body, UseGuards, Request, Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto, RegisterVendorDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return { success: true, message: 'Registered successfully', data };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return { success: true, message: 'Login successful', data };
  }

  @Post('vendor/register')
  async registerVendor(@Body() dto: RegisterVendorDto) {
    const data = await this.authService.registerVendor(dto);
    return { success: true, message: 'Vendor registered successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    const data = await this.authService.changePassword(req.user._id, dto);
    return { success: true, ...data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const data = await this.authService.getProfile(req.user._id);
    return { success: true, data };
  }
}
