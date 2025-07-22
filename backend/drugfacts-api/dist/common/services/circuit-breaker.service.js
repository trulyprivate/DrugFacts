"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (CircuitState = {}));
class CircuitBreakerState {
    failureThreshold;
    resetTimeout;
    halfOpenMaxAttempts;
    state = CircuitState.CLOSED;
    failures = 0;
    lastFailureTime;
    halfOpenAttempts = 0;
    constructor(failureThreshold, resetTimeout, halfOpenMaxAttempts) {
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
        this.halfOpenMaxAttempts = halfOpenMaxAttempts;
    }
    isOpen() {
        return this.state === CircuitState.OPEN;
    }
    isHalfOpen() {
        return this.state === CircuitState.HALF_OPEN;
    }
    recordSuccess() {
        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.CLOSED;
        }
        this.failures = 0;
        this.halfOpenAttempts = 0;
    }
    recordFailure() {
        this.failures++;
        this.lastFailureTime = new Date();
        if (this.state === CircuitState.HALF_OPEN) {
            this.halfOpenAttempts++;
            if (this.halfOpenAttempts >= this.halfOpenMaxAttempts) {
                this.open();
            }
        }
    }
    shouldOpen() {
        return this.failures >= this.failureThreshold;
    }
    open() {
        this.state = CircuitState.OPEN;
    }
    halfOpen() {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
    }
    canAttemptReset() {
        if (this.state !== CircuitState.OPEN || !this.lastFailureTime) {
            return false;
        }
        const now = new Date();
        const timeSinceLastFailure = now.getTime() - this.lastFailureTime.getTime();
        return timeSinceLastFailure >= this.resetTimeout;
    }
}
let CircuitBreakerService = class CircuitBreakerService {
    states = new Map();
    defaultOptions = {
        failureThreshold: 5,
        resetTimeout: 60000,
        halfOpenMaxAttempts: 3,
    };
    async call(key, fn, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        const state = this.getState(key, config);
        if (state.isOpen() && state.canAttemptReset()) {
            state.halfOpen();
        }
        if (state.isOpen()) {
            throw new common_1.ServiceUnavailableException(`Service ${key} is temporarily unavailable. Circuit breaker is OPEN.`);
        }
        try {
            const result = await fn();
            state.recordSuccess();
            return result;
        }
        catch (error) {
            state.recordFailure();
            if (state.shouldOpen()) {
                state.open();
                setTimeout(() => {
                    if (state.isOpen()) {
                        state.halfOpen();
                    }
                }, config.resetTimeout);
            }
            throw error;
        }
    }
    getState(key, config) {
        if (!this.states.has(key)) {
            this.states.set(key, new CircuitBreakerState(config.failureThreshold, config.resetTimeout, config.halfOpenMaxAttempts));
        }
        return this.states.get(key);
    }
    getStatus(key) {
        const state = this.states.get(key);
        return state ? state['state'] : null;
    }
    reset(key) {
        this.states.delete(key);
    }
    resetAll() {
        this.states.clear();
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = __decorate([
    (0, common_1.Injectable)()
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map