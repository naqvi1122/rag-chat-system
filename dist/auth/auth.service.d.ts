import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { AuthDto } from './dto/auth.dto';
import { UserDocument } from './schemas/user.schema';
export declare class AuthService {
    private readonly userModel;
    private readonly jwt;
    constructor(userModel: Model<UserDocument>, jwt: JwtService);
    register(dto: AuthDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    login(dto: AuthDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    private signToken;
}
