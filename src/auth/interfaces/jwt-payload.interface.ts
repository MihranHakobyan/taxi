import { Role } from '../../common/enums/role.enum';

export interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
    iat?: number;
    exp?: number;
}

export interface AuthenticatedUser {
    userId: string;
    email: string;
    role: Role;
}