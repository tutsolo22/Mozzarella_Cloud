import { Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';

@Injectable()
export class CsvService {
  /**
   * Parses a CSV buffer into an array of objects.
   * @param buffer The CSV data as a buffer.
   * @returns An array of objects.
   */
  parse<T>(buffer: Buffer): T[] {
    const csvString = buffer.toString('utf-8');
    const result = Papa.parse<T>(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (result.errors.length > 0) {
      console.error('CSV parsing errors:', result.errors);
    }

    return result.data;
  }

  /**
   * Converts an array of objects into a CSV string.
   * @param data The array of objects to stringify.
   * @param options Configuration for stringifying.
   * @returns A CSV string.
   */
  stringify(data: any[], options?: Papa.UnparseConfig): string {
    return Papa.unparse(data, options);
  }
}