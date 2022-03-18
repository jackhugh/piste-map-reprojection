import clsx from 'clsx';
import { CRS } from 'leaflet';
import { ImageOverlay, MapContainer } from 'react-leaflet';
import { EstimatedMarker } from '~/components/EstimatedMarkers';
import { SavedMarker } from '~/components/Markers';
import MutableGeoJSON from '~/components/MutableGeoJSON';
import { useMapPan } from '~/hooks/useMapPan';
import { mapCenter, mapSize, mapUrl } from '~/pages';
import { useStore } from '~/store';

type Props = { className?: string };

export default function ResortMap({ className }: Props) {
	const savedPoints = useStore((state) => state.savedPoints);
	const activePoint = useStore((state) => state.activePoint);
	const sidebarToggles = useStore((state) => state.sidebarToggles);
	const bounds = useStore((state) => state.resortData.bounds);
	const tin = useStore((state) => state.resortData.tin);
	const setPoint = useStore((state) => state.setPoint);
	const setActivePoint = useStore((state) => state.setActivePoint);

	const setStore = useStore((state) => state.setStore);

	const onMapCreated = useMapPan(savedPoints.find((point) => point.id === activePoint)?.resortPos);

	return (
		<MapContainer
			crs={CRS.Simple}
			center={mapCenter}
			zoom={-1}
			minZoom={-5}
			className={clsx('h-full', className)}
			whenCreated={(map) => {
				onMapCreated(map);
				setStore((state) => {
					state.resortData.currentCenter = map.getCenter();
				});
				map.on('moveend', () =>
					setStore((state) => {
						state.resortData.currentCenter = map.getCenter();
					})
				);
			}}
		>
			<ImageOverlay bounds={[[0, 0], mapSize]} url={mapUrl} />

			{savedPoints
				.filter((elem) => sidebarToggles.showAllPoints || elem.id === activePoint)
				.map((point) => (
					<SavedMarker
						key={point.id}
						position={point.resortPos}
						isActive={point.id === activePoint}
						onClick={() => setActivePoint(point)}
						onDrag={(e) => setPoint(point, () => ({ resortPos: e.latlng }))}
					/>
				))}

			{sidebarToggles.showEstimatePos && <EstimatedMarker />}

			{sidebarToggles.showBounds && bounds && <MutableGeoJSON data={bounds} />}

			{sidebarToggles.showTin && <MutableGeoJSON data={tin} />}
		</MapContainer>
	);
}
