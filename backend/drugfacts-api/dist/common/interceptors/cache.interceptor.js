"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheControlInterceptor = void 0;
const common_1 = require("@nestjs/common");
let CacheControlInterceptor = class CacheControlInterceptor {
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        if (request.url.includes('/therapeutic-classes') ||
            request.url.includes('/manufacturers')) {
            response.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
            response.setHeader('Surrogate-Control', 'max-age=86400');
        }
        else if (request.url.match(/\/drugs\/[^\/]+$/)) {
            response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
            response.setHeader('Surrogate-Control', 'max-age=3600');
        }
        else if (request.url.includes('/drugs/index')) {
            response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        }
        else if (request.url.includes('/drugs?')) {
            response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
        }
        else {
            response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
        return next.handle();
    }
};
exports.CacheControlInterceptor = CacheControlInterceptor;
exports.CacheControlInterceptor = CacheControlInterceptor = __decorate([
    (0, common_1.Injectable)()
], CacheControlInterceptor);
//# sourceMappingURL=cache.interceptor.js.map