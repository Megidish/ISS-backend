import fs from 'fs';

export function getCountries() {
    const countriesData = fs.readFileSync(__dirname + '/countries.geojson', 'utf8');
    return JSON.parse(countriesData);
}