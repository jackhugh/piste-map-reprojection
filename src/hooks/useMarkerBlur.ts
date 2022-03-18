import { useEffect, useRef } from 'react';
import { useStore } from '~/store';

/**
 * Hook to set active element to null if click src element or a parent does not have the class 'can-set-active'.
 */

export function useMarkerBlur() {
	const setActivePoint = useStore((state) => state.setActivePoint);
	const isDragging = useRef(false);

	useEffect(() => {
		const clickListener = (e: MouseEvent) => {
			let elem: HTMLElement | null = e.target as HTMLElement;
			while (elem) {
				if (elem.classList.contains('can-set-active')) {
					return;
				}
				elem = elem.parentElement;
			}
			if (!isDragging.current) {
				setActivePoint(null);
			}
		};

		const mouseDownListener = () => (isDragging.current = false);
		const mouseMoveListener = () => (isDragging.current = true);

		window.addEventListener('click', clickListener);
		window.addEventListener('mousedown', mouseDownListener);
		window.addEventListener('mousemove', mouseMoveListener);

		return () => {
			window.removeEventListener('click', clickListener);
			window.removeEventListener('mousedown', mouseDownListener);
			window.removeEventListener('mousemove', mouseMoveListener);
		};
	}, []);
}
