"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt = require("bcryptjs");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
let AuthService = class AuthService {
    userModel;
    jwt;
    constructor(userModel, jwt) {
        this.userModel = userModel;
        this.jwt = jwt;
    }
    async register(dto) {
        const passwordHash = await bcrypt.hash(dto.password, 12);
        try {
            const user = await this.userModel.create({
                email: dto.email.toLowerCase(),
                passwordHash,
            });
            return this.signToken({ id: user.id, email: user.email });
        }
        catch (error) {
            if (error?.code === 11000) {
                throw new common_1.ConflictException('Email already registered');
            }
            throw error;
        }
    }
    async login(dto) {
        const user = await this.userModel
            .findOne({ email: dto.email.toLowerCase() })
            .exec();
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordOk) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return this.signToken({ id: user.id, email: user.email });
    }
    signToken(user) {
        return {
            accessToken: this.jwt.sign({ sub: user.id, email: user.email }),
            user: { id: user.id, email: user.email },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map