import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import { useStore } from '~/store';
import React from 'react';
import clsx from 'clsx';
import { SavedMarker } from '../components/Markers';
import { useMapPan } from '~/hooks/useMapPan';
import { EstimateMarker } from '../components/EstimatedMarkers';
import MutableGeoJSON from '../components/MutableGeoJSON';
import { gpsCenter } from '~/pages';

type Props = { className?: string };

export default function GpsMap({ className }: Props) {
	const savedPoints = useStore((state) => state.savedPoints);
	const activePoint = useStore((state) => state.activePoint);
	const sidebarToggles = useStore((state) => state.sidebarToggles);
	const bounds = useStore((state) => state.gpsData.bounds);
	const tin = useStore((state) => state.gpsData.tin);
	const setPoint = useStore((state) => state.setPoint);
	const setActivePoint = useStore((state) => state.setActivePoint);

	const setStore = useStore((state) => state.setStore);

	const onMapCreated = useMapPan(savedPoints.find((point) => point.id === activePoint)?.gpsPos);

	return (
		<MapContainer
			center={gpsCenter}
			zoom={13}
			className={clsx('h-full', className)}
			whenCreated={(map) => {
				onMapCreated(map);
				setStore((state) => {
					state.gpsData.currentCenter = map.getCenter();
					state.estimatePos = map.getCenter();
				});
				map.on('moveend', () =>
					setStore((state) => {
						state.gpsData.currentCenter = map.getCenter();
					})
				);
			}}
		>
			<LayersControl position='topright'>
				<LayersControl.BaseLayer name='OpenStreetMap'>
					<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
				</LayersControl.BaseLayer>

				<LayersControl.BaseLayer checked name='Google'>
					<TileLayer
						maxZoom={20}
						url='http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
						subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
					/>
				</LayersControl.BaseLayer>

				<LayersControl.Overlay name='OpenSnowMap' checked>
					<TileLayer url='https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png' />
				</LayersControl.Overlay>
			</LayersControl>

			{savedPoints
				.filter((elem) => sidebarToggles.showAllPoints || elem.id === activePoint)
				.map((point) => (
					<SavedMarker
						key={point.id}
						position={point.gpsPos}
						isActive={point.id === activePoint}
						onClick={() => setActivePoint(point)}
						onDrag={(e) => setPoint(point, () => ({ gpsPos: e.latlng }))}
					/>
				))}

			{sidebarToggles.showEstimatePos && <EstimateMarker />}

			{sidebarToggles.showBounds && bounds && <MutableGeoJSON data={bounds} />}

			{sidebarToggles.showTin && <MutableGeoJSON data={tin} />}
		</MapContainer>
	);
}
