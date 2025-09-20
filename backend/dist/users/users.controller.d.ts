import { UsersService } from './users.service';
import { UserPayload as IUserPayload } from '../auth/decorators/user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateMyProfile(user: IUserPayload, updateProfileDto: UpdateProfileDto): Promise<import("./entities/user.entity").User>;
    changePassword(user: IUserPayload, changePasswordDto: ChangePasswordDto): Promise<void>;
}
