import { Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';

@Injectable()
export class CsvService {
  async parse<T>(file: Express.Multer.File): Promise<T[]> {
    const csvString = file.buffer.toString('utf-8');
    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data as T[]);
        },
        error: (error: Error) => {
          reject(error);
        },
      });
    });
  }

  serialize<T>(data: T[]): string {
    return Papa.unparse(data);
  }
}