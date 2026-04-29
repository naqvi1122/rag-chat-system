import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
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
}
