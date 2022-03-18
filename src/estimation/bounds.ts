import * as turf from '@turf/turf';
import { LatLngLiteral } from 'leaflet';

export function calculateBounds(points: LatLngLiteral[]) {
	const pointsCollection = turf.featureCollection(points.map((point) => turf.point([point.lng, point.lat])));
	return turf.concave(pointsCollection);
}
