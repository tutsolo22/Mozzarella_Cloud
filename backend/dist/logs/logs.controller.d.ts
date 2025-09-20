import { LogsService } from './logs.service';
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    getLogFiles(): Promise<string[]>;
    getLogs(fileName: string, lines: number): Promise<{
        log: string;
    }>;
}
