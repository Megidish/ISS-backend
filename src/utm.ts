import { getIssLocation } from './iss';


export async function getIssLocationInUtm(): Promise<{ easting: number; northing: number; zoneNumber: number }> {
  try {
    const { latitude, longitude } = await getIssLocation();
    return { easting: latitude, northing: longitude, zoneNumber: 33 };
  } catch (error) {
    console.error('Error converting coordinates to UTM:', error);
    throw error; 
  }
}
