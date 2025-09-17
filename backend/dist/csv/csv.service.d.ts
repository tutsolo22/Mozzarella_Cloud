import * as Papa from 'papaparse';
export declare class CsvService {
    parse<T>(buffer: Buffer): T[];
    stringify(data: any[], options?: Papa.UnparseConfig): string;
}
