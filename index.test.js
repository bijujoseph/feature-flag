'use strict';

const handler = require('./index').handler;
const moment = require('moment');

describe('Feature Flag Lambda Handler', () => {
    
    test('should return all flags for default prod environment', async () => {
        const event = {
            queryStringParameters: {}
        };
        
        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.meta.filter.env).toBe('prod');
        expect(body.data.featureFlags).toBeInstanceOf(Array);
        expect(body.data.featureFlags.length).toBeGreaterThan(0);
    });

    test('should return flags for dev environment', async () => {
        const event = {
            queryStringParameters: { env: 'dev' }
        };
        
        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.meta.filter.env).toBe('dev');
        expect(body.data.featureFlags).toBeInstanceOf(Array);
    });

    test('should filter flags by name', async () => {
        const event = {
            queryStringParameters: { 
                env: 'dev',
                name: 'ENABLE_OAUTH' 
            }
        };
        
        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.featureFlags.length).toBe(1);
        expect(body.data.featureFlags[0].name).toBe('ENABLE_OAUTH');
    });

    test('should filter flags by tag', async () => {
        const event = {
            queryStringParameters: { 
                env: 'dev',
                tag: 'SUB' 
            }
        };
        
        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.featureFlags.length).toBeGreaterThan(0);
        body.data.featureFlags.forEach(flag => {
            // Note: we can't check tags directly as they're not in response
            expect(flag.name).toBeDefined();
            expect(flag.value).toBeDefined();
        });
    });

    test('should transform date-range flags to boolean with range', async () => {
        const event = {
            queryStringParameters: { 
                env: 'dev',
                name: 'SUBMISSION_WINDOW' 
            }
        };
        
        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.featureFlags.length).toBe(1);
        const flag = body.data.featureFlags[0];
        expect(flag.name).toBe('SUBMISSION_WINDOW');
        expect(typeof flag.value).toBe('boolean');
        expect(flag.range).toBeDefined();
        expect(flag.range.start).toBeDefined();
        expect(flag.range.end).toBeDefined();
    });

    test('should return boolean value for simple boolean flags', async () => {
        const event = {
            queryStringParameters: { 
                env: 'dev',
                name: 'ENABLE_OAUTH' 
            }
        };
        
        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        const flag = body.data.featureFlags[0];
        expect(flag.name).toBe('ENABLE_OAUTH');
        expect(typeof flag.value).toBe('boolean');
        expect(flag.range).toBeUndefined();
    });

    test('should include metadata in response', async () => {
        const event = {
            queryStringParameters: { 
                env: 'imp',
                tag: 'AUTH'
            }
        };
        
        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.meta).toBeDefined();
        expect(body.meta.now).toBeDefined();
        expect(body.meta.filter).toBeDefined();
        expect(body.meta.filter.env).toBe('imp');
        expect(body.meta.filter.tag).toBe('AUTH');
    });

    test('should handle empty results', async () => {
        const event = {
            queryStringParameters: { 
                env: 'dev',
                name: 'NON_EXISTENT_FLAG' 
            }
        };
        
        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.featureFlags.length).toBe(0);
    });

    test('should return all environments flags', async () => {
        const environments = ['dev', 'imp', 'prod', 'dev-pre'];
        
        for (const env of environments) {
            const event = {
                queryStringParameters: { env }
            };
            
            const response = await handler(event);
            
            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.meta.filter.env).toBe(env);
            expect(body.data.featureFlags).toBeInstanceOf(Array);
        }
    });
});
