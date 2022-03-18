import { LatLngExpression, Map as LeafletMap } from 'leaflet';
import { useEffect, useRef } from 'react';
import { useStore } from '~/store';

export function useMapPan(position?: LatLngExpression) {
	const mapRef = useRef<LeafletMap>();
	const activePoint = useStore((state) => state.activePoint);

	useEffect(() => {
		if (position && !mapRef.current?.getBounds().contains(position)) {
			mapRef.current?.panTo(position);
		}
	}, [activePoint]);

	return (map: LeafletMap) => {
		mapRef.current = map;
	};
}
