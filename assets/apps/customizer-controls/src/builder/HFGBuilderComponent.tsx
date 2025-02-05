/* jshint esversion: 6 */
import React from 'react';
import { useEffect, useState } from '@wordpress/element';
import { WPCustomizeControl } from '../@types/customizer-control';
import { BuilderContentInterface } from '../@types/utils';
import { maybeParseJson } from './common/utils';
import HFGBuilder from './HFGBuilder';

type Props = {
	control: WPCustomizeControl;
	portalMount: HTMLElement;
};

const HFGBuilderComponent: React.FC<Props> = ({ control, portalMount }) => {
	const { setting, params } = control;

	const builder: string = params.builderType;
	const hasColumns: boolean = params.columnsLayout;

	const [value, setValue] = useState<BuilderContentInterface>(
		// @ts-ignore
		maybeParseJson(setting.get())
	);
	const [isHidden, setHidden] = useState<boolean>(true);

	const onChange = (nextValue: BuilderContentInterface) => {
		const next = JSON.stringify(nextValue);
		const prev = setting.get();

		if (next === prev) {
			return;
		}

		setValue(nextValue);
		control.setting.set(next);
	};

	/**
	 * Toggles builder visibility based on the migration notification.
	 */
	const bindOverlayNotificationHiding = () => {
		window.wp.customize.notifications.bind(
			'add',
			(data: { code: string }) => {
				if (data.code !== 'neve_migrating_builders') {
					return false;
				}

				setHidden(true);
			}
		);

		window.wp.customize.notifications.bind(
			'removed',
			(data: { code: string }) => {
				if (data.code !== 'neve_migrating_builders') {
					return false;
				}

				setHidden(false);
			}
		);
	};

	/**
	 * Shows builder when its panel is expanded.
	 */
	const bindShowOnExpand = () => {
		window.wp.customize
			.state('expandedPanel')
			.bind((panel: Record<string, unknown>) => {
				if (panel.id && panel.id === `hfg_${builder}` && isHidden) {
					setHidden(false);
					return false;
				}
				setHidden(true);
			});
	};

	/**
	 * Hides builder when customizer is collapsed.
	 */
	const bindHideOnPaneCollapse = () => {
		window.wp.customize.bind('ready', () => {
			window.wp.customize
				.state('paneVisible')
				.bind((nextValue: boolean) => {
					const currentPanel = window.wp.customize
						.state('expandedPanel')
						.get();
					if (nextValue) {
						if (
							currentPanel.id &&
							currentPanel.id === `hfg_${builder}` &&
							isHidden
						) {
							setHidden(false);
						}
						return false;
					}

					setHidden(true);
				});
		});
	};

	useEffect(() => {
		bindShowOnExpand();
		bindOverlayNotificationHiding();
		bindHideOnPaneCollapse();
	}, []);

	return (
		<HFGBuilder
			hasColumns={hasColumns}
			hidden={isHidden}
			builder={builder}
			value={value}
			onChange={onChange}
			portalMount={portalMount}
		/>
	);
};

export default HFGBuilderComponent;
