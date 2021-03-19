import { Button, ButtonGroup } from '@wordpress/components';
import { desktop, mobile } from '@wordpress/icons';
import { useContext } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import classnames from 'classnames';

import { BuilderContext } from '../BuilderContext';

const BuilderResponsiveSwitcher = ({ children }) => {
	const { setCurrentDevice, currentDevice } = useContext(BuilderContext);

	const buttons = [
		{ title: __('Desktop', 'neve'), icon: desktop, slug: 'desktop' },
		{ title: __('Mobile', 'neve'), icon: mobile, slug: 'mobile' },
	];

	return (
		<>
			<ButtonGroup>
				{buttons.map((button, index) => {
					const { title, icon, slug } = button;
					const buttonClasses = classnames('device-switcher', {
						active: slug === currentDevice,
					});
					return (
						<Button
							className={buttonClasses}
							key={index}
							icon={icon}
							disabled={slug === currentDevice}
							onClick={() => setCurrentDevice(slug)}
						>
							{title}
						</Button>
					);
				})}
			</ButtonGroup>
			{children}
		</>
	);
};

export default BuilderResponsiveSwitcher;
