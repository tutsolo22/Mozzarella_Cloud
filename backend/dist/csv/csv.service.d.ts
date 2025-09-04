export declare class CsvService {
    parse<T>(file: Express.Multer.File): Promise<T[]>;
    serialize<T>(data: T[]): string;
}
