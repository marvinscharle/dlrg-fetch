#!/usr/bin/env node

const minimist = require('minimist');
const isNumber = require('is-number');
const fetch = require('node-fetch');
const ProgressBar = require('progress');
const toCSV = require('array-to-csv');
const fs = require('fs');

// Parse argv
const argv = minimist(process.argv);

// Type definitions
const recordTypeDefinitions = {
    gld: 1,
    jug: 2
};
const recordTypeMapping = {
    1: 'Gld',
    2: 'Jug'
};

// API Base URL
const baseUrl = 'https://services.dlrg.net/service.php';

// Check if required params are given
const recordType = argv['recordType'] || recordTypeDefinitions.gld;
let radius = argv['radius'] || undefined;
let lat = argv['lat'] || undefined;
let long = argv['long'] || undefined;
let targetFile = argv['targetFile'] || './results.csv';

if (Object.values(recordTypeDefinitions).indexOf(recordType) === -1) {
    console.error(`Error: record type definition ${recordType} is not allowed (allowed values = ${Object.values(recordTypeDefinitions).join(', ')})`);
    process.exit(1);
}

if (!isNumber(radius)) {
    console.error(`Error: radius is not a number`);
    process.exit(1);
}

if (!isNumber(lat)) {
    console.error(`Error: lat is not a number`);
    process.exit(1);
}

if (!isNumber(long)) {
    console.error(`Error: long is not a number`);
    process.exit(1);
}

// Ensure variables are of numeric type
radius = parseFloat(radius) * 2; // Because the API is kind of weird
lat = parseFloat(lat);
long = parseFloat(long);

// Helper functions
const createBar = steps => {
    return new ProgressBar(':bar', { total: steps });
};

// Fetch API for records
// Wrap inside async function because node is stupid
(async function() {
    console.info(`Fetching DLRG divisions near ${lat}, ${long}...`);

    const indexRequestUrl = `${baseUrl}?doc=poi&strict=1&typFilter=${recordTypeMapping[recordType]}&limit=999&radius=${radius}&lon=${long}&lat=${lat}`;
    const indexResult = await fetch(indexRequestUrl).then(res => res.json());

    console.info(`Found ${indexResult.count} DLRG division(s)`);

    // Cancel if no division has been found
    if (indexResult.count === 0) {
        process.exit(0);
    }

    // Fetch individual results
    console.info(`Fetching meta information about DLRG divisions...`);
    const bar = createBar(indexResult.count);
    const resultList = [[
        'description',
        'name',
        'url',
        'email',
        'street',
        'zip',
        'city',
        'phone'
    ]];

    for (let location of indexResult.locs) {
        const type = location.pois[0].typ;
        const id = location.pois[0].id;

        // Fetch data
        const result = await fetch(`${baseUrl}?doc=poi&strict=1&id=${id}&typ=${type}`).then(res => res.json());
        const data = result[type];

        resultList.push([
            data.bez,
            data.name,
            data.hp,
            data.eMail,
            data.gss.str,
            data.gss.plz,
            data.gss.ort,
            data.gss.tel
        ]);
        bar.tick();
    }

    // Write to CSV
    console.info(`Exporting data as CSV...`);
    fs.writeFileSync(targetFile, toCSV(resultList));
    console.info(`Done!`);
})();