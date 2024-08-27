export interface LoggerService {
    log(message: string | Record<string, any>): void;

    info(message: string | Record<string, any>): void;

    error(message: string | Record<string, any>): void;

    warm(message: string | Record<string, any>): void;
}