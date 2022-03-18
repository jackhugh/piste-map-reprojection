import create, { GetState, PartialState, SetState, State, StateCreator, StateSelector, StoreApi } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import produce from 'immer';
import { LatLngLiteral } from 'leaflet';
import * as turf from '@turf/turf';
import { WritableDraft } from 'immer/dist/internal';
import { calculateGpsTin, calculateMapTin } from './estimation/tin';
import { calculateBounds } from './estimation/bounds';

export type SavedPoint = {
	resortPos: LatLngLiteral;
	gpsPos: LatLngLiteral;
	id: string;
	name: string;
};

export type Map = {
	id: string;
	resortName: string;
	mapUrl: string;
};

type MapData = {
	currentCenter: LatLngLiteral;
	tin: turf.helpers.FeatureCollection<turf.helpers.Polygon, turf.helpers.Properties>;
	bounds: turf.Feature<turf.Polygon | turf.MultiPolygon, turf.Properties> | null;
};

type ComputeState<T extends State> = <
	InitialValue,
	SelectorValue,
	K1 extends keyof T = keyof T,
	K2 extends keyof T = K1,
	K3 extends keyof T = K2,
	K4 extends keyof T = K3
>(
	initialValue: InitialValue,
	partial: PartialState<T, K1, K2, K3, K4>,
	selector: StateSelector<T, SelectorValue>
) => InitialValue;

type ComputedStateCreator<T extends State> = (
	set: SetState<T>,
	get: GetState<T>,
	api: StoreApi<T>,
	compute: ComputeState<T>
) => T;

const computed = <T extends State>(config: ComputedStateCreator<T>): StateCreator<T> => {
	return (set, get, api) => {
		const compute: ComputeState<T> = (initialValue, partial, selector) => {
			setTimeout(() => {
				api.subscribe(() => {
					api.setState(typeof partial === 'function' ? produce(partial) : (partial as T));
				}, selector);
			});

			return initialValue;
		};
		return config(set, get, api, compute);
	};
};

const immer = <T extends State>(config: StateCreator<T>): StateCreator<T> => {
	return (set, get, api) => {
		return config(
			(partial, replace) => {
				const nextState = typeof partial === 'function' ? produce(partial) : (partial as T);
				return set(nextState, replace);
			},
			get,
			api
		);
	};
};

const createWithMiddleware = <T extends State>(config: ComputedStateCreator<T>) => {
	return create(immer(persist(computed(config), { name: 'resort-mapper' })));
};

export type StoreType = {
	savedPoints: SavedPoint[];
	activePoint: string | null;
	estimatePos: LatLngLiteral;
	gpsData: MapData;
	resortData: MapData;
	sidebarToggles: {
		showAllPoints: boolean;
		showBounds: boolean;
		showTin: boolean;
		showEstimatePos: boolean;
	};
	addPoint: () => void;
	deletePoint: (point: SavedPoint) => void;
	setActivePoint: (point: SavedPoint | null) => void;
	setEstimatePos: (gpsPos: LatLngLiteral) => void;
	toggleAllPoints: () => void;
	toggleBounds: () => void;
	toggleTin: () => void;
	toggleEstimatePos: () => void;
	setStore: SetState<StoreType>;
	setPoint: (
		point: SavedPoint,
		setter: (state: WritableDraft<SavedPoint>) => void | Partial<WritableDraft<SavedPoint>>
	) => void;
};

export const useStore = createWithMiddleware<StoreType>((set, get, api, compute) => ({
	savedPoints: [],
	activePoint: null,
	estimatePos: { lat: 0, lng: 0 },
	gpsData: {
		currentCenter: { lat: 0, lng: 0 },
		tin: compute(
			turf.tin(turf.featureCollection([])),
			(state) => {
				state.gpsData.tin = calculateGpsTin(state.savedPoints);
			},
			(state) => state.savedPoints
		),
		bounds: compute(
			null,
			(state) => {
				state.gpsData.bounds = calculateBounds(state.savedPoints.map((point) => point.gpsPos));
			},
			(state) => state.savedPoints
		),
	},
	resortData: {
		currentCenter: { lat: 0, lng: 0 },
		tin: compute(
			turf.tin(turf.featureCollection([])),
			(state) => {
				state.resortData.tin = calculateMapTin(state.gpsData.tin);
			},
			(state) => state.gpsData.tin
		),
		bounds: compute(
			null,
			(state) => {
				state.resortData.bounds = calculateBounds(state.savedPoints.map((point) => point.resortPos));
			},
			(state) => state.savedPoints
		),
	},
	sidebarToggles: {
		showAllPoints: true,
		showBounds: false,
		showTin: false,
		showEstimatePos: false,
	},
	addPoint: () =>
		set((state) => {
			const newPoint: SavedPoint = {
				id: uuid(),
				name: '',
				resortPos: state.resortData.currentCenter,
				gpsPos: state.gpsData.currentCenter,
			};
			state.savedPoints.push(newPoint);
			state.activePoint = newPoint.id;
		}),
	deletePoint: (point) =>
		set((state) => {
			const found = state.savedPoints.findIndex((elem) => elem.id === point.id);
			if (found < 0) return;
			state.savedPoints.splice(found, 1);
		}),
	setActivePoint: (point) => set({ activePoint: point === null ? null : point.id }),
	setEstimatePos: (gpsPos) => set({ estimatePos: gpsPos }),
	toggleAllPoints: () =>
		set((state) => {
			state.sidebarToggles.showAllPoints = !state.sidebarToggles.showAllPoints;
		}),
	toggleBounds: () =>
		set((state) => {
			state.sidebarToggles.showBounds = !state.sidebarToggles.showBounds;
		}),
	toggleTin: () =>
		set((state) => {
			state.sidebarToggles.showTin = !state.sidebarToggles.showTin;
		}),
	toggleEstimatePos: () =>
		set((state) => {
			state.sidebarToggles.showEstimatePos = !state.sidebarToggles.showEstimatePos;
		}),
	setStore: set,
	setPoint: (point, setter) => {
		set((state) => {
			const found = state.savedPoints.findIndex((elem) => elem.id === point.id);
			if (found < 0) return;
			const mutation = setter(state.savedPoints[found]);
			if (mutation) {
				state.savedPoints[found] = {
					...state.savedPoints[found],
					...mutation,
				};
			}
		});
	},
}));

useStore.subscribe(
	(state) => console.log(state),
	(state) => state
);
