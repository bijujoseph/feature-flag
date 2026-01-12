'use strict';

const constants = require('./constants');

describe('Feature Flag Validation', () => {
    
    test('should load all environment flag files', () => {
        constants.envs.forEach(env => {
            expect(() => {
                const flags = require(`./flags/${env}.json`);
                expect(flags).toBeInstanceOf(Array);
            }).not.toThrow();
        });
    });

    test('should have valid structure for all flags', () => {
        constants.envs.forEach(env => {
            const flags = require(`./flags/${env}.json`);
            
            flags.forEach(flag => {
                expect(flag.name).toBeDefined();
                expect(flag.type).toBeDefined();
                expect(flag.tags).toBeInstanceOf(Array);
                expect(flag.description).toBeDefined();
                expect(flag.value).toBeDefined();
                
                // Type should be one of allowed types
                expect(constants.types).toContain(flag.type);
                
                // All tags should be valid
                flag.tags.forEach(tag => {
                    expect(constants.tags).toContain(tag);
                });
            });
        });
    });

    test('should have no duplicate flag names within each environment', () => {
        constants.envs.forEach(env => {
            const flags = require(`./flags/${env}.json`);
            const names = flags.map(f => f.name);
            const uniqueNames = [...new Set(names)];
            
            expect(names.length).toBe(uniqueNames.length);
        });
    });

    test('should have consistent flag names across environments', () => {
        const devFlags = require('./flags/dev.json');
        const devFlagNames = new Set(devFlags.map(f => f.name));
        
        constants.envs.filter(env => env !== 'dev').forEach(env => {
            const flags = require(`./flags/${env}.json`);
            const flagNames = new Set(flags.map(f => f.name));
            
            // All flags should exist in dev
            flagNames.forEach(name => {
                expect(devFlagNames.has(name)).toBe(true);
            });
        });
    });

    test('should have consistent types across environments', () => {
        const devFlags = require('./flags/dev.json');
        
        constants.envs.filter(env => env !== 'dev').forEach(env => {
            const flags = require(`./flags/${env}.json`);
            
            flags.forEach(flag => {
                const devFlag = devFlags.find(f => f.name === flag.name);
                if (devFlag) {
                    expect(flag.type).toBe(devFlag.type);
                }
            });
        });
    });

    test('should have consistent descriptions across environments', () => {
        const devFlags = require('./flags/dev.json');
        
        constants.envs.filter(env => env !== 'dev').forEach(env => {
            const flags = require(`./flags/${env}.json`);
            
            flags.forEach(flag => {
                const devFlag = devFlags.find(f => f.name === flag.name);
                if (devFlag) {
                    expect(flag.description).toBe(devFlag.description);
                }
            });
        });
    });

    test('should have consistent tags across environments', () => {
        const devFlags = require('./flags/dev.json');
        
        constants.envs.filter(env => env !== 'dev').forEach(env => {
            const flags = require(`./flags/${env}.json`);
            
            flags.forEach(flag => {
                const devFlag = devFlags.find(f => f.name === flag.name);
                if (devFlag) {
                    expect(flag.tags.sort()).toEqual(devFlag.tags.sort());
                }
            });
        });
    });

    test('should have valid date format for date type flags', () => {
        const moment = require('moment');
        
        constants.envs.forEach(env => {
            const flags = require(`./flags/${env}.json`);
            
            flags.filter(f => f.type === 'date').forEach(flag => {
                const isValid = moment(flag.value, constants.DATE_FORMAT, true).isValid();
                expect(isValid).toBe(true);
            });
        });
    });

    test('should have valid date format for date-range type flags', () => {
        const moment = require('moment');
        
        constants.envs.forEach(env => {
            const flags = require(`./flags/${env}.json`);
            
            flags.filter(f => f.type === 'date-range').forEach(flag => {
                if (flag.value.start) {
                    const isValidStart = moment(flag.value.start, constants.DATE_FORMAT, true).isValid();
                    expect(isValidStart).toBe(true);
                }
                if (flag.value.end) {
                    const isValidEnd = moment(flag.value.end, constants.DATE_FORMAT, true).isValid();
                    expect(isValidEnd).toBe(true);
                }
            });
        });
    });

    test('boolean flags should have boolean values', () => {
        constants.envs.forEach(env => {
            const flags = require(`./flags/${env}.json`);
            
            flags.filter(f => f.type === 'boolean').forEach(flag => {
                expect(typeof flag.value).toBe('boolean');
            });
        });
    });

    test('string flags should have string values', () => {
        constants.envs.forEach(env => {
            const flags = require(`./flags/${env}.json`);
            
            flags.filter(f => f.type === 'string').forEach(flag => {
                expect(typeof flag.value).toBe('string');
            });
        });
    });

    test('number flags should have number values', () => {
        constants.envs.forEach(env => {
            const flags = require(`./flags/${env}.json`);
            
            flags.filter(f => f.type === 'number').forEach(flag => {
                expect(typeof flag.value).toBe('number');
            });
        });
    });
});
