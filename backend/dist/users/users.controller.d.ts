import { UsersService } from './users.service';
import { UserPayload as IUserPayload } from '../auth/interfaces/user-payload.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateMyProfile(user: IUserPayload, updateProfileDto: UpdateProfileDto): any;
    changePassword(user: IUserPayload, changePasswordDto: ChangePasswordDto): Promise<void>;
}
