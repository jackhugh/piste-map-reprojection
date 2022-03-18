import * as turf from '@turf/turf';
import { SavedPoint, StoreType } from '~/store';

export function estimateMapPosition(gpsPos: SavedPoint['gpsPos'], tin: StoreType['gpsData']['tin']) {
	const gpsPoint = turf.point([gpsPos.lng, gpsPos.lat]);

	for (const poly of tin.features) {
		if (!turf.booleanPointInPolygon(gpsPoint, poly)) {
			continue;
		}

		const xInterpolated = turf.planepoint(
			gpsPoint,
			turf.polygon(poly.geometry.coordinates, {
				a: poly.properties?.a.lng,
				b: poly.properties?.b.lng,
				c: poly.properties?.c.lng,
			})
		);
		const yInterpolated = turf.planepoint(
			gpsPoint,
			turf.polygon(poly.geometry.coordinates, {
				a: poly.properties?.a.lat,
				b: poly.properties?.b.lat,
				c: poly.properties?.c.lat,
			})
		);

		if (xInterpolated > 0 && yInterpolated > 0) {
			return { lat: yInterpolated, lng: xInterpolated };
		}
	}
	return null;
}

export function convertGeoJsonPosition(geoJson: turf.LineString, tin: StoreType['gpsData']['tin']) {
	const clone = turf.clone(geoJson) as typeof geoJson;
	turf.coordEach(clone, (pos) => {
		const newPos = estimateMapPosition({ lng: pos[0], lat: pos[1] }, tin);
		if (newPos) {
			pos[0] = newPos.lng;
			pos[1] = newPos.lat;
		}
	});
	return turf.bezierSpline(clone);
}
