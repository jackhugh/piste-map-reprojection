import { SavedPoint } from '~/store';
import * as turf from '@turf/turf';

export function calculateGpsTin(savedPoints: SavedPoint[]) {
	return turf.tin(
		turf.featureCollection(
			savedPoints.map((point) => turf.point([point.gpsPos.lng, point.gpsPos.lat], { resortPos: point.resortPos }))
		),
		'resortPos'
	);
}

export function calculateMapTin(gpsTin: turf.helpers.FeatureCollection<turf.helpers.Polygon, turf.helpers.Properties>) {
	const mapTin = turf.clone(gpsTin) as typeof gpsTin;
	for (const poly of mapTin.features) {
		poly.geometry.coordinates[0][0][0] = poly.properties?.a.lng;
		poly.geometry.coordinates[0][0][1] = poly.properties?.a.lat;
		poly.geometry.coordinates[0][1][0] = poly.properties?.b.lng;
		poly.geometry.coordinates[0][1][1] = poly.properties?.b.lat;
		poly.geometry.coordinates[0][2][0] = poly.properties?.c.lng;
		poly.geometry.coordinates[0][2][1] = poly.properties?.c.lat;
		poly.geometry.coordinates[0][3][0] = poly.properties?.a.lng;
		poly.geometry.coordinates[0][3][1] = poly.properties?.a.lat;
	}
	return mapTin;
}
