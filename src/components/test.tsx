import * as turf from '@turf/turf';
import L, { LatLngExpression } from 'leaflet';
import { useRef, useState } from 'react';
import { LayersControl, MapContainer, TileLayer } from 'react-leaflet';
import CanvasOverlay from 'react-leaflet-canvas-overlay';
import { gpsCenter, mapUrl } from '~/pages';

const width = 3000;
const height = 2122;

interface MappedPoint {
	from: LatLngExpression;
	to: LatLngExpression;
}

export default function Test() {
	const canvas = useRef<HTMLCanvasElement>(document.createElement('canvas')).current;

	const [points, setPoints] = useState<MappedPoint[]>([
		{ from: [0, 0], to: [0, 0] },
		{ from: [width, 0], to: [width, 0] },
		{ from: [width, height], to: [width, height] },
		{ from: [0, height], to: [0, height] },
	]);

	const draw = () => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const image = new Image();
		image.setAttribute('src', mapUrl);
		image.addEventListener('load', () => {
			const tin = turf.tin(turf.featureCollection(points.map((point) => turf.point(point.from as number[]))));
			tin.features.forEach((triangle, i) => {
				const coords = triangle.geometry.coordinates[0] as [number, number][];
				drawImageTriangle(image, ctx, coords[0], coords[1], coords[2], coords[0], coords[1], coords[2]);
			});
		});
	};

	const bounds = 0.2;

	return (
		<MapContainer center={gpsCenter} zoom={13} className='h-full' whenCreated={draw}>
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

			<CanvasOverlay
				canvas={canvas}
				bounds={L.latLngBounds(
					[gpsCenter.lat - bounds, gpsCenter.lng - bounds],
					[gpsCenter.lat + bounds, gpsCenter.lng + bounds]
				)}
				width={width}
				height={height}
			/>
		</MapContainer>
	);
}

function linearSolution(
	r1: number,
	s1: number,
	t1: number,
	r2: number,
	s2: number,
	t2: number,
	r3: number,
	s3: number,
	t3: number
) {
	const a = ((t2 - t3) * (s1 - s2) - (t1 - t2) * (s2 - s3)) / ((r2 - r3) * (s1 - s2) - (r1 - r2) * (s2 - s3));
	const b = ((t2 - t3) * (r1 - r2) - (t1 - t2) * (r2 - r3)) / ((s2 - s3) * (r1 - r2) - (s1 - s2) * (r2 - r3));
	const c = t1 - r1 * a - s1 * b;

	return [a, b, c];
}

type XYTuple = [number, number];

function drawImageTriangle(
	img: HTMLImageElement,
	ctx: CanvasRenderingContext2D,
	s1: XYTuple,
	s2: XYTuple,
	s3: XYTuple,
	d1: XYTuple,
	d2: XYTuple,
	d3: XYTuple
) {
	const xm = linearSolution(s1[0], s1[1], d1[0], s2[0], s2[1], d2[0], s3[0], s3[1], d3[0]);
	const ym = linearSolution(s1[0], s1[1], d1[1], s2[0], s2[1], d2[1], s3[0], s3[1], d3[1]);

	ctx.save();

	ctx.setTransform(xm[0], ym[0], xm[1], ym[1], xm[2], ym[2]);
	ctx.beginPath();
	ctx.moveTo(s1[0], s1[1]);
	ctx.lineTo(s2[0], s2[1]);
	ctx.lineTo(s3[0], s3[1]);
	ctx.closePath();
	ctx.clip();
	ctx.drawImage(img, 0, 0, img.width, img.height);

	ctx.restore();
}
