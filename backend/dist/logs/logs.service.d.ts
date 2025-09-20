export declare class LogsService {
    private readonly logger;
    private readonly logsDir;
    getLogFiles(): Promise<string[]>;
    getLogContent(fileName: string, lines?: number): Promise<string>;
}
