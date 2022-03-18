import { Icon, LatLngLiteral, LeafletEventHandlerFn, LeafletMouseEventHandlerFn } from 'leaflet';
import React, { useEffect, useRef } from 'react';
import { Marker as LeafletMarker } from 'leaflet';
import { Marker as ReactLeafletMarker } from 'react-leaflet';
import clsx from 'clsx';

export const icon = new Icon({
	iconUrl: 'marker.svg',
	iconSize: [40, 40],
	iconAnchor: [20, 40],
	shadowUrl: 'marker-shadow.png',
	shadowAnchor: [12, 41],
});

type SavedMarkerProps = {
	position: LatLngLiteral;
	isActive: boolean;
	onClick?: LeafletMouseEventHandlerFn;
	onDrag?: LeafletMouseEventHandlerFn;
};

export function SavedMarkerComponent({ position, isActive, onClick, onDrag }: SavedMarkerProps) {
	return (
		<Marker
			draggable={isActive}
			position={position}
			className={clsx('can-set-active', isActive ? 'marker-red' : 'marker-blue')}
			zIndexOffset={isActive ? 10 : 0}
			eventHandlers={{
				drag: onDrag as LeafletEventHandlerFn,
				click: onClick,
			}}
		/>
	);
}

export const SavedMarker = React.memo(SavedMarkerComponent, (prev, next) => {
	if (prev.position !== next.position) return false;
	if (prev.isActive !== next.isActive) return false;
	return true;
});

type MarkerProps = { className?: string } & React.ComponentProps<typeof ReactLeafletMarker>;

export function Marker({ className, ...props }: MarkerProps) {
	const marker = useRef<LeafletMarker>(null);
	const prevClasses = useRef<string[]>([]);

	useEffect(() => {
		const newClasses = clsx(className).split(' ').filter(Boolean);
		marker.current?.getElement()?.classList.remove(...prevClasses.current);
		marker.current?.getElement()?.classList.add(...newClasses);
		prevClasses.current = newClasses;
	}, [className]);

	return <ReactLeafletMarker ref={marker} icon={icon} autoPan {...props} />;
}
