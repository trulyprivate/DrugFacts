"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizeOutputInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let SanitizeOutputInterceptor = class SanitizeOutputInterceptor {
    sensitiveFields = ['_id', '__v', '_hash', 'password', 'token'];
    htmlFields = ['description', 'content', 'body'];
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)(data => this.sanitizeData(data)));
    }
    sanitizeData(data) {
        if (data === null || data === undefined) {
            return data;
        }
        if (typeof data === 'string') {
            return this.sanitizeString(data);
        }
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeData(item));
        }
        if (data instanceof Date) {
            return data.toISOString();
        }
        if (typeof data === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                if (this.sensitiveFields.includes(key)) {
                    continue;
                }
                if (this.htmlFields.includes(key) && typeof value === 'string') {
                    sanitized[key] = this.encodeHtmlEntities(value);
                }
                else {
                    sanitized[key] = this.sanitizeData(value);
                }
            }
            return sanitized;
        }
        return data;
    }
    sanitizeString(str) {
        return str.replace(/\0/g, '');
    }
    encodeHtmlEntities(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
};
exports.SanitizeOutputInterceptor = SanitizeOutputInterceptor;
exports.SanitizeOutputInterceptor = SanitizeOutputInterceptor = __decorate([
    (0, common_1.Injectable)()
], SanitizeOutputInterceptor);
//# sourceMappingURL=sanitize-output.interceptor.js.map