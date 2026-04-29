import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { AuthDto } from './dto/auth.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: AuthDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const user = await this.userModel.create({
        email: dto.email.toLowerCase(),
        passwordHash,
      });

      return this.signToken({ id: user.id, email: user.email });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(dto: AuthDto) {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.signToken({ id: user.id, email: user.email });
  }

  private signToken(user: { id: string; email: string }) {
    return {
      accessToken: this.jwt.sign({ sub: user.id, email: user.email }),
      user: { id: user.id, email: user.email },
    };
  }
}
