import { useStore } from '~/store';
import { icon, Marker } from './Markers';
import { LeafletEventHandlerFn, LeafletMouseEvent } from 'leaflet';
import { useMemo } from 'react';
import { estimateMapPosition } from '~/estimation/estimate';

export function EstimateMarker() {
	const estimatePos = useStore((state) => state.estimatePos);
	const setEstimatePos = useStore((state) => state.setEstimatePos);

	return (
		<Marker
			draggable
			position={estimatePos}
			icon={icon}
			className='marker-green'
			zIndexOffset={20}
			eventHandlers={{
				drag: ((e: LeafletMouseEvent) => setEstimatePos(e.latlng)) as LeafletEventHandlerFn,
			}}
		/>
	);
}

export function EstimatedMarker() {
	const tin = useStore((state) => state.gpsData.tin);
	const estimatePos = useStore((state) => state.estimatePos);

	const estimatedPos = useMemo(() => estimateMapPosition(estimatePos, tin), [estimatePos, tin]);

	if (!estimatedPos) return null;

	return <Marker position={estimatedPos} icon={icon} className='marker-green' zIndexOffset={20} />;
}
