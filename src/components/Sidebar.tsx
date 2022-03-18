import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { SavedPoint, useStore } from '~/store';
import Button from '~/ui/Button';

type Props = { className?: string };

export default function Sidebar({ className }: Props) {
	const savedPoints = useStore((state) => state.savedPoints);
	const sidebarToggles = useStore((state) => state.sidebarToggles);
	const addPoint = useStore((state) => state.addPoint);
	const toggleAllPoints = useStore((state) => state.toggleAllPoints);
	const toggleBounds = useStore((state) => state.toggleBounds);
	const toggleTin = useStore((state) => state.toggleTin);
	const toggleEstimatePos = useStore((state) => state.toggleEstimatePos);

	return (
		<div className={clsx('h-full flex flex-col relative', className)}>
			<div className='bg-white shadow z-10 relative flex flex-col gap-4 p-4'>
				<h1 className='text-center text-gray-800 font-bold text-4xl select-none'>Resort Mapper</h1>
				<div className='flex flex-wrap gap-2 px-2'>
					<Button
						name='Points'
						onClick={toggleAllPoints}
						className='bg-blue-500 hover:bg-blue-400'
						isChecked={sidebarToggles.showAllPoints}
					/>
					<Button
						name='Bounds'
						onClick={toggleBounds}
						className='bg-blue-500 hover:bg-blue-400'
						isChecked={sidebarToggles.showBounds}
					/>
					<Button
						name='TIN'
						onClick={toggleTin}
						className='bg-blue-500 hover:bg-blue-400'
						isChecked={sidebarToggles.showTin}
					/>
					<Button
						name='Estimate'
						onClick={toggleEstimatePos}
						className='bg-blue-500 hover:bg-blue-400'
						isChecked={sidebarToggles.showEstimatePos}
					/>
				</div>
			</div>
			<div className='bg-gray-200 flex-1 p-2 flex flex-col gap-2 overflow-y-auto'>
				<Button
					onClick={addPoint}
					name='+'
					className='bg-green-500 hover:bg-green-400 ml-auto text-2xl w-12 h-12  shadow-xl can-set-active'
				/>
				{savedPoints.map((point) => <SidebarPointRow key={point.id} point={point} />).reverse()}
			</div>
		</div>
	);
}

type SidebarPointProps = { point: SavedPoint };

function SidebarPointRow({ point }: SidebarPointProps) {
	const ref = useRef<HTMLInputElement>(null);

	const activePoint = useStore((state) => state.activePoint);
	const setActivePoint = useStore((state) => state.setActivePoint);
	const deletePoint = useStore((state) => state.deletePoint);
	const setPoint = useStore((state) => state.setPoint);

	useEffect(() => {
		if (point.id === activePoint) {
			ref.current?.focus();
		}
	}, [activePoint]);

	return (
		<div
			onClick={() => setActivePoint(point)}
			className={clsx(
				'text-left p-2 rounded flex items-center cursor-pointer gap-2 can-set-active',
				point.id === activePoint ? 'bg-blue-500' : 'bg-white'
			)}
		>
			<input
				type='text'
				ref={ref}
				value={point.name}
				placeholder='Enter name...'
				onChange={(e) => setPoint(point, () => ({ name: e.target.value }))}
				className={clsx(
					'p-2 focus:outline-none rounded flex-1 h-10',
					activePoint !== point.id && 'cursor-pointer'
				)}
			/>
			<Button
				name='-'
				onClick={() => deletePoint(point)}
				className='bg-red-500 hover:bg-red-400 text-xl w-10 h-10'
			/>
		</div>
	);
}
