import { Role } from '../../common/enums/role.enum';

export interface IAuthEntity {
    id: string;
    email: string;
    password: string;
    refreshToken?: string;
    role?: Role;
    get(options?: { plain: boolean }): any;
    update(values: object, options?: object): Promise<this>;
}