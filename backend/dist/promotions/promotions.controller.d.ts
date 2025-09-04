import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { UserPayload } from '../auth/decorators/user.decorator';
import { FilesService } from '../files/files.service';
export declare class PromotionsController {
    private readonly promotionsService;
    private readonly filesService;
    constructor(promotionsService: PromotionsService, filesService: FilesService);
    create(createPromotionDto: CreatePromotionDto, user: UserPayload): Promise<import("./entities/promotion.entity").Promotion>;
    findAll(user: UserPayload): Promise<import("./entities/promotion.entity").Promotion[]>;
    findOne(id: string, user: UserPayload): Promise<import("./entities/promotion.entity").Promotion>;
    update(id: string, updatePromotionDto: UpdatePromotionDto, user: UserPayload): Promise<import("./entities/promotion.entity").Promotion>;
    remove(id: string, user: UserPayload): Promise<void>;
    uploadImage(id: string, file: Express.Multer.File, user: UserPayload): Promise<import("./entities/promotion.entity").Promotion>;
}
