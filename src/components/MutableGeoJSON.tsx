import React, { useRef } from 'react';
import { GeoJSON } from 'react-leaflet';

export default function MutableGeoJSON(props: React.ComponentProps<typeof GeoJSON>) {
	const key = useRef(0);
	const prevValue = useRef(props.data);

	if (props.data !== prevValue.current) {
		key.current++;
	}

	prevValue.current = props.data;

	return <GeoJSON {...props} key={key.current} />;
}
