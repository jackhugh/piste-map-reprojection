import { LatLngLiteral, LatLngTuple } from 'leaflet';
import dynamic from 'next/dynamic';
import { useMarkerBlur } from '~/hooks/useMarkerBlur';
const Sidebar = dynamic(() => import('~/components/Sidebar'), { ssr: false });
const GpsMap = dynamic(() => import('~/maps/GpsMap'), { ssr: false });
const ResortMap = dynamic(() => import('~/maps/ResortMap'), { ssr: false });

export const gpsCenter: LatLngLiteral = { lat: 36.70324067728794, lng: 137.83572769799568 };
export const mapSize: LatLngTuple = [2122, 3000];
export const mapCenter: LatLngLiteral = { lat: mapSize[0] / 2, lng: mapSize[1] / 2 };
export const mapUrl = 'happo.jpg';

export default function Index() {
	useMarkerBlur();

	return (
		<div className='flex w-full h-full'>
			<Sidebar className='w-[23rem] shadow-bold z-30' />
			<div className='flex-1 flex'>
				<ResortMap className='w-1/2 shadow-bold z-20' />
				<GpsMap className='w-1/2 shadow-bold z-10' />
			</div>
		</div>
	);
}
