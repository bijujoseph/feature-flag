let constants = require('./constants');
let allFlags = {};
constants.envs.forEach(env => allFlags[env] = require(`./flags/${env}.json`));

let combinedFlags = [];
constants.envs.forEach(env => {
    allFlags[env].forEach(ff => {
        let flag = combinedFlags.find(f => f.name === ff.name);
        if(!flag) {
            flag = Object.assign({}, ff);
            flag.value = {};
            combinedFlags.push(flag);
        }
        flag.value[env] = ff.value;
    });
});

let valueToString = (env, ff) => {
    let value = ff.value[env];
    if (ff.type === 'date-range') return `${value.start} till ${value.end}`;
    return JSON.stringify(value);
};

let tsv = ['name\ttype\ttags\tdescription\tprod\timp\tdev\tdev-pre'];
combinedFlags.forEach(ff => {
    let data = [];
    data.push(ff.name);
    data.push(ff.type);
    data.push(ff.tags.sort());
    data.push(ff.description);
    constants.envs.forEach(env => data.push(valueToString(env, ff)));
    tsv.push(data.join('\t'));
});

console.info('writing file ./generated/flags.tsv');
require('fs').writeFileSync('./generated/flags.tsv', tsv.join('\n'));