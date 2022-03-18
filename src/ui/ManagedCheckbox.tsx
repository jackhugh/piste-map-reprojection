import clsx from 'clsx';

type Props = { className?: string; isChecked: boolean };

export default function ManagedCheckbox({ className, isChecked }: Props) {
	return (
		<div
			className={clsx('relative rounded bg-white', className)}
			style={{
				width: 20,
				height: 20,
			}}
		>
			<div className={clsx('absolute inset-0 flex justify-center items-center')}>
				<div
					style={{
						borderBottomWidth: 3,
						borderRightWidth: 3,
						transform: 'rotate(45deg)',
						width: 7,
						height: 16,
						position: 'relative',
						top: -1,
						borderColor: isChecked ? 'rgb(59, 130, 246)' : 'transparent',
					}}
				></div>
			</div>
		</div>
	);
}
