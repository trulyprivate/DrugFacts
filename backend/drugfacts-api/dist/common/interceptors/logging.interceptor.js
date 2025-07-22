"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const { method, url, body, query, params } = request;
        const userAgent = request.get('user-agent') || '';
        const ip = request.ip;
        const now = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const responseTime = Date.now() - now;
                const { statusCode } = response;
                this.logger.log({
                    method,
                    url,
                    statusCode,
                    responseTime: `${responseTime}ms`,
                    userAgent,
                    ip,
                    ...(method !== 'GET' && { body }),
                    ...(Object.keys(query).length && { query }),
                    ...(Object.keys(params).length && { params }),
                });
            },
            error: (error) => {
                const responseTime = Date.now() - now;
                this.logger.error({
                    method,
                    url,
                    error: error.message,
                    responseTime: `${responseTime}ms`,
                    userAgent,
                    ip,
                    ...(method !== 'GET' && { body }),
                    ...(Object.keys(query).length && { query }),
                    ...(Object.keys(params).length && { params }),
                });
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map