'use strict';

const fs = require('fs');
const constants = require('./constants');

describe('TSV Generation', () => {
    
    beforeAll(() => {
        // Run the TSV generation
        require('./tsv.js');
    });

    test('should create flags.tsv file', () => {
        expect(fs.existsSync('./generated/flags.tsv')).toBe(true);
    });

    test('should have correct header row', () => {
        const content = fs.readFileSync('./generated/flags.tsv', 'utf8');
        const lines = content.split('\n');
        
        expect(lines[0]).toBe('name\ttype\ttags\tdescription\tprod\timp\tdev\tdev-pre');
    });

    test('should have one row per unique flag', () => {
        const content = fs.readFileSync('./generated/flags.tsv', 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        // Load all flags to count unique names
        let allFlagNames = new Set();
        constants.envs.forEach(env => {
            const flags = require(`./flags/${env}.json`);
            flags.forEach(f => allFlagNames.add(f.name));
        });
        
        // Should be header + number of unique flags
        expect(lines.length).toBe(allFlagNames.size + 1);
    });

    test('should have correct number of columns in each row', () => {
        const content = fs.readFileSync('./generated/flags.tsv', 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            const columns = line.split('\t');
            // name, type, tags, description, prod, imp, dev, dev-pre
            expect(columns.length).toBe(8);
        });
    });

    test('should include all environments as columns', () => {
        const content = fs.readFileSync('./generated/flags.tsv', 'utf8');
        const header = content.split('\n')[0];
        
        constants.envs.forEach(env => {
            expect(header).toContain(env);
        });
    });

    test('should show date-range values correctly', () => {
        const content = fs.readFileSync('./generated/flags.tsv', 'utf8');
        const lines = content.split('\n');
        
        // Find a date-range flag (like SUBMISSION_WINDOW)
        const submissionWindowLine = lines.find(line => line.startsWith('SUBMISSION_WINDOW'));
        
        if (submissionWindowLine) {
            expect(submissionWindowLine).toContain('till');
        }
    });

    test('should include flag names in TSV', () => {
        const content = fs.readFileSync('./generated/flags.tsv', 'utf8');
        
        // Load flags from dev environment
        const devFlags = require('./flags/dev.json');
        
        devFlags.forEach(flag => {
            expect(content).toContain(flag.name);
        });
    });

    test('should include flag types in TSV', () => {
        const content = fs.readFileSync('./generated/flags.tsv', 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        // Skip header
        lines.slice(1).forEach(line => {
            const columns = line.split('\t');
            const type = columns[1];
            expect(constants.types).toContain(type);
        });
    });
});
