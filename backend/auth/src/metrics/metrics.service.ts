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
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});