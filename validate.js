'use strict';
// validation of code
let _ = require('lodash');
let moment = require('moment');
let constants = require('./constants');

// checks if a given date in string form is valid
let isValidDate = (v) => moment(v, constants.DATE_FORMAT, true).isValid();

// validator mappings
let validators =  {
    'boolean': _.isBoolean,
    'string': _.isString,
    'number': _.isNumber,
    'object': _.isObject,
    'array': _.isArray,
    'date': (v) => isValidDate(v),
    'date-range': (v) => {
        if (v.start && !isValidDate(v.start)) return false;
        if (v.end && !isValidDate(v.end)) return false;
        return true;
    }
};


let validate = () => {
    let errors = [];
    let allFlags = {};

    // load feature flags of every env
    constants.envs.forEach(env => allFlags[env] = require(`./flags/${env}.json`));

    // check for dups in every file
    constants.envs.forEach(env => consitencyCheck(env, errors, allFlags[env]));

    //compare the flags between dev and other envs for match
    constants.envs.filter(env => env !== 'dev')
        .forEach(env => comparisonChecks('dev', env, errors, allFlags['dev'], allFlags[env]));

    if (errors.length > 0) {
        throw new Error(`\n-------------------\n${errors.join('\n')}\n---------------------\n` );
    }
    return errors;

};

// checks if the flag data is syntactically right.
let consitencyCheck = (env, errors, flags) => {
    // ensure there are no dups
    let names = flags.map(ff => ff.name);
    let distinctNames = [...new Set(names)];
    if( distinctNames.length !== flags.length) {
        errors.push(`${env} has duplicate feature flags`);
        return;
    }

    // verify every entry
    flags.forEach(f => {

        // name - OK ?
        if (!f.name) {
            errors.push(`${env} has a flag without a name`);
            return;
        }

        //type check - OK ?
        if(!f.type || !constants.types.includes(f.type)) {
            errors.push(`${f.name} has unknown type in ${env} [${f.type}] - supported type values are [${constants.types.join(',')}]`);
            return;
        }

        // value check - OK ?
        if(f.value && !validators[f.type](f.value)) {
            errors.push(`${f.name} in ${env} is not supported, expected ${f.type} but is ${typeof  f.value}`);
        }

        // tags - OK?
        let tagDiff = _.difference(f.tags, constants.tags);
        if(tagDiff.length > 0) {
            errors.push(`${f.name} has unknown tags in ${env} [${tagDiff}] - allowed tags are [${constants.tags.join(',')}]`);
        }
    });
};

// ensure the presence of a feature flag in list of flags
let comparisonChecks = (env1, env2, errors, flags1, flags2) => {
   flags1.forEach(f1 => {
       let f2 = flags2.find(f => f.name === f1.name);
       if (!f2) {
           errors.push(`${f1.name} is available in ${env1} but not in ${env2}`);
           return;
       }
       if(f1.type !== f2.type) {
           errors.push(`${f1.name} type mismatch between ${env1} and ${env2} - ${f1.type} vs ${f2.type}`);
       }
       if(f1.description !== f2.description) {
           errors.push(`${f1.name} description mismatch between ${env1} and ${env2}`);
       }
       if(_.difference(f1.tags, f2.tags).length > 0) {
           errors.push(`${f1.name} tags mismatch between ${env1} and ${env2} - ${f1.tags.join(',')} vs ${f2.tags.join(',')}`);
       }
   });
};
validate();
// module.exports.validate = validate;
