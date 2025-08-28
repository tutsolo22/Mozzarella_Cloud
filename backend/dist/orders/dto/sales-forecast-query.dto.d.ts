export declare enum ForecastPeriod {
    Daily = "daily",
    Weekly = "weekly"
}
export declare class SalesForecastQueryDto {
    period?: ForecastPeriod;
    duration?: string;
}
