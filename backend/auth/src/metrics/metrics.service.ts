import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
    constructor() {
        client.collectDefaultMetrics();
    }

    async getMetrics() {
        return client.register.metrics();
    }

    getContentType() {
        return client.register.contentType;
    }

}


export const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['user_role', 'method', 'route', 'status', 'BodySize'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});

export const activeUsers = new client.Gauge({
    name: 'active_users',
    help: 'Number of currently active users',
});