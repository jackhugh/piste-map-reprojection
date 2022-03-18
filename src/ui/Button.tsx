import clsx from 'clsx';
import { MouseEventHandler } from 'react';
import ManagedCheckbox from './ManagedCheckbox';

type Props = {
	name?: string;
	className?: string;
	isChecked?: boolean;
	onClick?: MouseEventHandler<HTMLButtonElement>;
};

export default function Button({ name, className, isChecked, onClick }: Props) {
	return (
		<button
			onClick={onClick}
			className={clsx('font-medium rounded p-2 text-white flex gap-2 items-center justify-center', className)}
		>
			{typeof isChecked === 'boolean' && <ManagedCheckbox isChecked={isChecked} />}
			<span>{name}</span>
		</button>
	);
}
