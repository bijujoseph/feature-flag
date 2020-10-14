// allowed date format & timezones
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const TIME_ZONE = 'America/New_York';

// allowed constants
module.exports = {
    envs: ['dev', 'imp', 'prod', 'dev-pre'],
    tags: ['SUB', 'AUTH', 'SF', 'FE', 'TR', 'SN', 'EL'],
    types: ['boolean', 'string', 'number', 'object', 'array', 'date', 'date-range'],
    DATE_FORMAT: DATE_FORMAT,
    TIME_ZONE: TIME_ZONE
};
