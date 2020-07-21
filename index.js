'use strict';
let moment = require('moment');
let constants = require('./constants');
let DATE_FORMAT = constants.DATE_FORMAT;
process.env.TZ = constants.TIME_ZONE; // set default TimeZone to Eastern

// for simple caching - till next cold-start
let allFlags = {};
constants.envs.forEach(env => allFlags[env] = require(`./flags/${env}.json`));

// checks if the current date-time is within the date range
let isInRange = (now, flag) => {
    let start = flag.value.start ? moment(flag.value.start, DATE_FORMAT) : moment().subtract(2, 'd');
    let end = flag.value.end ? moment(flag.value.end, DATE_FORMAT): moment().add(2, 'd');
    return now.isAfter(start) && now.isBefore(end);
};

// we are only anticipating GET type requests for this
exports.handler = async (event) => {
    let now = moment();

    let params = Object.assign({}, event.queryStringParameters);
    params.env = params.env || 'prod';

    console.log('Feature Flags Request', params.env, params.name, params.tag);

    let response = { statusCode: 200 };

    try {
        // load the feature flags based on env
        let flags = allFlags[params.env];

        // filter those as needed
        if (params.name) flags = flags.filter(f => f.name === params.name);
        if (params.tag) flags = flags.filter(f => f.tags.includes(params.tag));

        // map it into {name:value} only pairs (also compute time driven date-range flags)
        let transformedFlags = flags.map(f => {
            let value = f.value;
            let name = f.name;

            // only for date-range, value will evaluate to true/false depending on ` current time`.
            // (assumption server time is Eastern & data in feature flag file is also Eastern)
            if (f.type === 'date-range') {
                value = isInRange(now, f);
                return ({name, value, range:f.value});
            }
            return ({name, value})
        });


        let body = {
            meta : {
                now: now.format(DATE_FORMAT),
                filter: {name: params.name, tag: params.tag, env: params.env}
            },
            data: {
                featureFlags: transformedFlags
            }
        };

        response.body = JSON.stringify(body);

    } catch (err) {
        console.error('Error processing', err);
        response.body = JSON.stringify(err.message);
        response.statusCode = 500;
    }

    return response;

};