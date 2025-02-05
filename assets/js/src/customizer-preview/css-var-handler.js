/* global _ */

const directions = ['top', 'right', 'bottom', 'left'];
const devices = ['mobile', 'tablet', 'desktop'];
const mediaQueries = {
	mobile: false,
	tablet: 'min-width: 576px',
	desktop: 'min-width: 961px',
};

export class CSSVariablesHandler {
	run(id, settingType, value, params) {
		const {
			selector,
			vars,
			responsive = false,
			suffix = '',
			fallback = 'inherit',
		} = params;

		//Bail if no selectors or variables.
		if (!selector || !vars) {
			return false;
		}

		this.id = id;
		this.settingType = settingType;
		this.value = value;
		this.vars = vars;
		this.selector = `html ${selector}`;
		this.suffix = suffix;
		this.responsive = responsive;
		this.fallback = fallback;

		const css = this.getStyle();

		addCSS(id, css);
	}

	getStyle() {
		const { vars, responsive } = this;

		if (vars === 'backgroundControl') {
			return this.getBackgroundControlVars();
		}

		if (this.isDirectionalValue(this.value)) {
			return this.getDirectionalNonResponsive();
		}

		//We have a simple (non-composed) responsive control.
		if (responsive) {
			return this.getResponsiveVarCSS(
				this.selector,
				vars,
				this.value,
				this.suffix,
				this.fallback
			);
		}

		if (Array.isArray(vars)) {
			let style = '';
			vars.forEach((variable) => {
				this.vars = variable;
				style += this.getStringVarCSS();
			});

			return style;
		}

		switch (typeof vars) {
			case 'string':
				return this.getStringVarCSS();
			case 'object':
				return this.getComposedVarCSS();
			default:
				break;
		}
	}

	getBackgroundControlVars() {
		const { value, selector } = this;

		const {
			type,
			imageUrl,
			focusPoint,
			colorValue,
			overlayColorValue,
			overlayOpacity,
			useFeatured,
			fixed,
		} = value;

		const definitions = {
			'--bgImage': 'unset',
			'--overlayColor': 'unset',
			'--bgOverlayOpacity': 'unset',
			'--bgAttachment': 'unset',
			'--bgPosition': 'unset',
		};

		if (type === 'color') {
			definitions['--bgColor'] = colorValue;
		} else {
			const { currentFeaturedImage } = window.neveCustomizePreview;

			let finalUrl = imageUrl;
			if (useFeatured) {
				finalUrl = currentFeaturedImage
					? currentFeaturedImage
					: imageUrl;
			}

			const hasImage = finalUrl !== '';

			const { x, y } = focusPoint;

			const focus = `${(x * 100).toFixed(0)}% ${(y * 100).toFixed(0)}%`;

			definitions['--bgImage'] = hasImage ? `url("${finalUrl}")` : 'none';
			definitions['--overlayColor'] = overlayColorValue || 'transparent';
			definitions['--bgOverlayOpacity'] = `${overlayOpacity / 100}`;
			definitions['--bgAttachment'] = fixed ? 'fixed' : 'unset';
			definitions['--bgPosition'] = focus;
		}

		const properties = Object.entries(definitions)
			.map(([prop, val]) => `${prop}:${val}`)
			.join(';');

		return `${selector}{${properties}}`;
	}

	getDirectionalNonResponsive() {
		const { selector, value, vars, suffix } = this;
		const parsedValue = this.maybeParseJson(value);

		let finalSuffix = suffix || '';

		if (parsedValue.unit !== undefined) {
			finalSuffix = parsedValue.unit;
		}

		const finalValue = this.parseDirectionalValue(parsedValue, finalSuffix);

		return `${selector}{${vars}:${finalValue};}`;
	}

	getResponsiveVarCSS(selector, variable, value, suffix, fallback) {
		const parsedValue = this.maybeParseJson(value);

		if (parsedValue === undefined) {
			return '';
		}

		let style = '';
		devices.forEach((device) => {
			let useFallback = false;
			let finalSuffix = suffix;

			if (parsedValue[`${device}-unit`] !== undefined) {
				finalSuffix = parsedValue[`${device}-unit`];
			}

			if (parsedValue.suffix && parsedValue.suffix[device]) {
				finalSuffix = parsedValue.suffix[device];
			}

			if (!parsedValue[device]) {
				useFallback = true;
			}

			let singularValue = parsedValue[device];
			singularValue = useFallback
				? fallback
				: this.parseDirectionalValue(singularValue, finalSuffix);

			if (mediaQueries[device]) {
				style += `@media(${mediaQueries[device]}) {`;
			}
			style += `${selector}{`;
			style += `${variable}:${singularValue};`;
			style += '}';
			if (mediaQueries[device]) {
				style += '}';
			}
		});

		return style;
	}

	getStringVarCSS() {
		const {
			selector,
			vars,
			value,
			suffix,
			fallback,
			validateSuffix,
		} = this;
		if (typeof selector)
			if (!value) {
				return `${selector} {${vars}:${fallback};}`;
			}
		return `${selector} {${vars}:${value}${validateSuffix(suffix)};}`;
	}

	getComposedVarCSS() {
		const { selector, vars, settingType, value, suffix, fallback } = this;

		const isButton = this.isButtonSetting(settingType);

		let style = '';

		Object.keys(vars).forEach((cssVar) => {
			let currentSuffix = suffix;
			let settingKey = vars[cssVar];

			// If we have a key with additional values, we make sure to take them into account.
			if (typeof settingKey === 'object') {
				if (settingKey.suffix) {
					currentSuffix = settingKey.suffix;
				}

				// If the setting inside is responsive, we add CSS for the responsive case and bail.
				if (settingKey.responsive) {
					style += this.getResponsiveVarCSS(
						selector,
						cssVar,
						value[settingKey.key],
						currentSuffix,
						fallback
					);
					return false;
				}

				settingKey = settingKey.key;
			}

			style += `${selector} {`;

			let newValue = value[settingKey] || null;

			//Account for the button [don't add border width if no need]
			if (cssVar.toLowerCase().includes('borderwidth') && isButton) {
				if (value.type !== 'outline') {
					style += `${cssVar}: 0;`;
					return;
				}
			}

			if (newValue) {
				newValue = this.parseDirectionalValue(newValue, currentSuffix);
			} else {
				newValue = fallback;
			}
			style += `${cssVar}:${newValue};`;
			style += '}';
		});

		return style;
	}

	isButtonSetting(settingId) {
		return [
			'\\Neve\\Customizer\\Controls\\React\\Button_Appearance',
			'neve_button_appearance',
		].includes(settingId);
	}

	parseDirectionalValue(value, suffix) {
		if (typeof value !== 'object') {
			return value + this.validateSuffix(suffix);
		}

		if (!this.isDirectionalValue(value)) {
			return value;
		}

		let directionalValue = '';
		directions.forEach((direction) => {
			if (value[direction] !== 0 && !value[direction]) {
				directionalValue += this.fallback ? `${this.fallback} ` : '0 ';
			} else {
				directionalValue += `${value[direction]}${this.validateSuffix(
					suffix
				)} `;
			}
		});

		directionalValue = directionalValue.trim();

		return directionalValue;
	}

	isDirectionalValue(value) {
		return (
			typeof value.top !== 'undefined' &&
			typeof value.right !== 'undefined' &&
			typeof value.bottom !== 'undefined' &&
			typeof value.left !== 'undefined'
		);
	}

	maybeParseJson(input) {
		if (typeof input !== 'string') {
			return input;
		}
		try {
			JSON.parse(input);
		} catch (error) {
			return input;
		}
		return JSON.parse(input);
	}

	validateSuffix(val) {
		const valid = ['px', 'em', '%', 'vh', 'vw'];
		if (!valid.includes(val)) {
			return '';
		}

		return val;
	}
}

export const addCSS = (id, content = '') => {
	let style = document.querySelector('#' + id + '-css-style');

	if (!style) {
		style = document.createElement('style');
		style.setAttribute('id', id + '-css-style');
		style.setAttribute('type', 'text/css');
		document.querySelector('head').appendChild(style);
	}
	style.innerHTML = content;
};

export const addTemplateCSS = (settingType, id, newValue, args) => {
	const map = {
		mobile: 'max-width: 576px',
		tablet: 'min-width: 576px',
		desktop: 'min-width: 960px',
	};

	let style = '';
	if (args.directional) {
		if (args.responsive) {
			for (const device in map) {
				let deviceStyle = args.template;
				const suffix = newValue[device + '-unit'];
				_.each(newValue[device], function (value, direction) {
					const directionRegex = new RegExp(
						`{{value.${direction}}}`,
						'g'
					);
					deviceStyle = deviceStyle.replace(
						directionRegex,
						value + suffix
					);
				});
				style += `@media (${map[device]}) {${deviceStyle}}`;
			}
		} else {
			style = args.template;
			_.each(directions, function (dir) {
				const directionRegex = new RegExp(`{{value.${dir}}}`, 'g');
				style = style.replace(
					directionRegex,
					newValue[dir] + newValue.unit
				);
			});
		}
		addCSS(id, style);
		return false;
	}

	const regex = new RegExp('{{value}}', 'g');
	if (args.responsive) {
		const template = args.template;
		const value = JSON.parse(newValue);
		for (const device in map) {
			let suffixDefault = '';
			if (args.suffix) {
				suffixDefault = args.suffix[device];
			}

			let suffix = suffixDefault;
			if (value[device + '-unit']) {
				suffix = value[device + '-unit'];
			}

			if (value.suffix && value.suffix[device]) {
				suffix = value.suffix[device];
			}

			if (value[device] === 0 || value[device] === '0') {
				style += `@media (${map[device]}) {${template.replace(
					regex,
					'0' + suffix
				)}}`;
			} else {
				style += `@media (${map[device]}) {${template.replace(
					regex,
					value[device] + suffix || 'inherit'
				)}}`;
			}
		}
	} else if (newValue === 0 || newValue === '0') {
		style += args.template.replace(regex, '0');
	} else {
		const value = newValue || args.fallback || 'inherit';
		style += args.template.replace(regex, value.toString());
	}
	addCSS(id, style);
};
