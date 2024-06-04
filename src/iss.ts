import axios from 'axios';
import * as turf from '@turf/turf';
import proj4 from 'proj4';
import { Feature, Point, Polygon, MultiPolygon } from 'geojson';
import { getCountries } from './countries';

const ISS_API_URL = 'http://api.open-notify.org/iss-now.json';

interface IssLocation {
  latitude: number;
  longitude: number;
}

async function fetchIssLocation(): Promise<IssLocation> {
  const response = await axios.get(ISS_API_URL);
  const { latitude, longitude } = response.data.iss_position;
  return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
}

export async function getIssLocation(): Promise<IssLocation> {
  return await fetchIssLocation();
}

export async function getCountryByIssLocation(): Promise<string> {
    const { latitude, longitude } = await fetchIssLocation();
    const coordinates = [longitude, latitude];
    const point: Point = { type: "Point", coordinates };
    const countries = getCountries();

    for (const feature of countries.features) {
        if (isPolygonOrMultiPolygon(feature.geometry)) {
            if (turf.booleanPointInPolygon(point, feature.geometry)) {
                return feature.properties?.name || 'Unknown';
            }
        }
    }

    return 'Ocean';
}


function isPolygonOrMultiPolygon(geometry: any): geometry is Polygon | MultiPolygon {
  return geometry.type === 'Polygon' || geometry.type === 'MultiPolygon';
}
