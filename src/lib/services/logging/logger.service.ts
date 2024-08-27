import {LoggerService} from "@/core/domain/logging";

export const loggerService: LoggerService = {
    log: function (message: string | Record<string, any>): void {
        console.log(message)
    },
    info: function (message: string | Record<string, any>): void {
        console.log(message)
    },
    error: function (message: string | Record<string, any>): void {
        console.log(message)
    },
    warm: function (message: string | Record<string, any>): void {
        console.log(message)
    }
}