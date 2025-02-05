/* global neveCustomizePreview, _,jQuery */
import { initNavigation, repositionDropdowns } from '../frontend/navigation';
import { removeClass, addClass } from '../utils.js';
import { CSSVariablesHandler, addCSS, addTemplateCSS } from './css-var-handler';
const { newSkin } = window.neveCustomizePreview;

function handleResponsiveRadioButtons(args, nextValue) {
	if (!args.additional) return false;

	const items = document.querySelectorAll(args.selector);

	const classesToAdd = [];

	Object.keys(nextValue).map((device) => {
		classesToAdd.push(`${device}-${nextValue[device]}`);
		return device;
	});

	_.each(items, function (item) {
		item.parentNode.classList.remove(...args.additional.remove_classes);
		item.parentNode.classList.add(...classesToAdd);
	});
}

/**
 * Run JS on load.
 */
window.addEventListener('load', function () {
	/**
	 * Add action when Header Panel rendered by customizer.
	 */
	document.addEventListener('header_builder_panel_changed', function (e) {
		if (e.detail.partial_id === 'hfg_header_layout_partial') {
			window.HFG.init();
			window.HFG.initSearch();
			repositionDropdowns();
			return false;
		}
		if (e.detail.partial_id === 'primary-menu_partial') {
			initNavigation();
			repositionDropdowns();
			return false;
		}
	});

	document.addEventListener(
		'customize_control_sidebar',
		function (e) {
			if (e.detail === 'open') {
				window.HFG.toggleMenuSidebar(true);
			}
			if (e.detail === 'close') {
				window.HFG.toggleMenuSidebar(false);
			}
		}.bind(this)
	);

	document.addEventListener(
		'customize_section_opened',
		function (e) {
			if (e.detail === 'header_sidebar') {
				window.HFG.toggleMenuSidebar(true);
			}
		}.bind(this)
	);
	const deviceMap = {
		mobile: 'max-width: 576px',
		tablet: 'min-width: 576px',
		desktop: 'min-width: 961px',
	};

	const varsHandler = new CSSVariablesHandler();

	_.each(neveCustomizePreview, function (settings, settingType) {
		_.each(settings, function (args, settingId) {
			wp.customize(settingId, function (setting) {
				setting.bind(function (newValue) {
					if (
						neveCustomizePreview.newSkin &&
						args.additional &&
						args.additional.cssVar
					) {
						varsHandler.run(
							settingId,
							settingType,
							newValue,
							args.additional.cssVar
						);
						return false;
					}
					if (args.additional && args.additional.template) {
						// Handles new template selective refresh.
						addTemplateCSS(
							settingType,
							settingId,
							newValue,
							args.additional,
							args.responsive || false,
							args.directional || false
						);
						return false;
					}
					let style = '';
					switch (settingType) {
						case 'neve_color_control':
							if (args.additional.partial) {
								wp.customize.selectiveRefresh
									.partial(args.additional.partial)
									.refresh();
								return false;
							}
							_.each(args.additional, (i) => {
								if (!i.selector) {
									return false;
								}
								newValue = newValue || i.fallback;
								style += `body ${i.selector} {
                  ${i.prop}: ${newValue} !important;
                }`;
							});
							addCSS(settingId, style);
							break;
						case 'neve_background_control':
							if (newValue.type === 'color') {
								if (
									!newValue.colorValue &&
									args.additional.partial
								) {
									wp.customize.selectiveRefresh
										.partial(args.additional.partial)
										.refresh();
								}
								style += `body ${args.selector}{background-image: none !important;}`;
								const color =
									newValue.colorValue !== 'undefined'
										? newValue.colorValue
										: 'inherit';
								style += `${args.selector}:before{ content: none !important;}`;
								style += `body ${args.selector}, body ${args.selector} .primary-menu-ul .sub-menu {background-color: ${color}!important;}`;
								style += `${args.selector} .primary-menu-ul .sub-menu, ${args.selector} .primary-menu-ul .sub-menu li {border-color: ${color}!important;}`;
								addCSS(settingId, style);
								return false;
							}
							if (
								newValue.useFeatured &&
								neveCustomizePreview.currentFeaturedImage
							) {
								newValue.imageUrl =
									neveCustomizePreview.currentFeaturedImage;
							}
							style += args.selector + '{';
							style += newValue.imageUrl
								? `background-image: url("${newValue.imageUrl}") !important;`
								: 'background-image: none !important;';
							style +=
								newValue.fixed === true
									? 'background-attachment: fixed !important;'
									: 'background-attachment: initial !important;';
							if (
								newValue.focusPoint &&
								newValue.focusPoint.x &&
								newValue.focusPoint.y
							) {
								style +=
									'background-position:' +
									(newValue.focusPoint.x * 100).toFixed(2) +
									'% ' +
									(newValue.focusPoint.y * 100).toFixed(2) +
									'% !important;';
							}
							style += 'background-size: cover !important;';
							if (
								!document
									.querySelector('.header-menu-sidebar')
									.classList.contains('dropdown')
							) {
								style += neveCustomizePreview.newBuilder
									? ''
									: 'position: absolute;';
							}
							style +=
								'top: 0; bottom: 0; width: 100%; content:"";';
							style += '}';
							const color = newValue.overlayColorValue || 'unset';
							const overlay =
								newValue.overlayOpacity === 0
									? 0
									: newValue.overlayOpacity || 50;
							style += `body ${args.selector}, body ${args.selector} .primary-menu-ul .sub-menu {background-color: ${color}!important;}`;
							style += `${args.selector} .primary-menu-ul .sub-menu, ${args.selector} .primary-menu-ul .sub-menu li {border-color: ${color}!important;}`;
							style +=
								args.selector +
								':before { ' +
								'content: "";' +
								'position: absolute; top: 0; bottom: 0; width: 100%;' +
								`background-color: ${color}!important;` +
								'opacity: ' +
								overlay / 100 +
								'!important;}';
							style +=
								args.selector +
								'{ background-color: transparent !important; }';
							addCSS(settingId, style);
							break;
						case '\\Neve\\Customizer\\Controls\\React\\Responsive_Radio_Buttons':
							handleResponsiveRadioButtons(args, newValue);
							break;
						case '\\Neve\\Customizer\\Controls\\React\\Radio_Buttons':
							if (!args.additional) return false;
							const classes =
								'hfg-item-v-top hfg-item-v-middle hfg-item-v-bottom';
							const newClass = 'hfg-item-v-' + newValue;

							const itemInner = document.querySelectorAll(
								args.selector
							);
							_.each(itemInner, function (item) {
								const node = neveCustomizePreview.newBuilder
									? item.parentNode.parentNode
									: item.parentNode;
								removeClass(node, classes);
								addClass(node, newClass);
							});
							break;
						case '\\Neve\\Customizer\\Controls\\Radio_Image':
							break;
						case '\\Neve\\Customizer\\Controls\\Range':
						case '\\Neve\\Customizer\\Controls\\React\\Responsive_Range':
							const value = JSON.parse(newValue);
							if (value.mobile > 0) {
								style +=
									'@media (max-width: 576px) { body ' +
									args.selector +
									'{ ' +
									args.additional.prop +
									':' +
									value.mobile +
									args.additional.unit +
									';}}';
							} else {
								style +=
									'@media (max-width: 576px) { body ' +
									args.selector +
									'{ ' +
									args.additional.prop +
									':unset;}}';
							}
							if (value.tablet > 0) {
								style +=
									'@media (min-width: 576px) { body ' +
									args.selector +
									'{ ' +
									args.additional.prop +
									':' +
									value.tablet +
									args.additional.unit +
									';}}';
							} else {
								style +=
									'@media (min-width: 576px) { body ' +
									args.selector +
									'{ ' +
									args.additional.prop +
									':unset;}}';
							}
							if (value.desktop > 0) {
								style +=
									'@media (min-width: 961px) { body ' +
									args.selector +
									'{ ' +
									args.additional.prop +
									':' +
									value.desktop +
									args.additional.unit +
									';}}';
							} else {
								style +=
									'@media (min-width: 961px) { body ' +
									args.selector +
									'{ ' +
									args.additional.prop +
									':unset;}}';
							}
							addCSS(settingId, style);
							break;
						case '\\Neve\\Customizer\\Controls\\React\\Spacing':
							for (const device in deviceMap) {
								style +=
									'@media (' +
									deviceMap[device] +
									') { body ' +
									args.selector +
									'{';
								for (const optionType in newValue[device]) {
									if (newValue[device][optionType] !== '') {
										let cssProp =
											args.additional.prop +
											'-' +
											optionType;
										if (
											args.additional.prop ===
											'border-width'
										) {
											cssProp = `border-${optionType}-width`;
										}
										if (
											args.additional.prop ===
											'border-radius'
										) {
											const mapDirectionToCorners = {
												top: 'top-left',
												right: 'top-right',
												bottom: 'bottom-right',
												left: 'bottom-left',
											};
											cssProp = `border-${mapDirectionToCorners[optionType]}-radius`;
										}
										style +=
											cssProp +
											':' +
											newValue[device][optionType] +
											newValue[device + '-unit'] +
											';';
									} else {
										style +=
											args.additional.prop +
											'-' +
											optionType +
											': unset;';
									}
								}
								style += '}}';
							}
							addCSS(settingId, style);
							break;
						case '\\Neve\\Customizer\\Controls\\React\\Typography':
							style += `html ${args.selector}{`;
							if (newValue.textTransform) {
								style += `text-transform: ${newValue.textTransform};`;
							}
							if (
								newValue.fontWeight &&
								newValue.fontWeight !== 'none'
							) {
								style += `font-weight: ${newValue.fontWeight};`;
							}
							style += `}`;
							for (const device in deviceMap) {
								style += `@media (${deviceMap[device]}) {
											html ${args.selector} {`;
								if (
									args.live_refresh_default &&
									args.live_refresh_default.size
								) {
									style += `font-size:${args.live_refresh_default.size[device]}${args.live_refresh_default.size.suffix[device]};`;
								}
								if (
									newValue.fontSize &&
									newValue.fontSize[device]
								) {
									style += `font-size:${newValue.fontSize[device]}${newValue.fontSize.suffix[device]};`;
								}
								if (
									args.live_refresh_default &&
									args.live_refresh_default.letter_spacing
								) {
									style += `letter-spacing:${args.live_refresh_default.letter_spacing[device]}px;`;
								}
								if (
									newValue.letterSpacing &&
									newValue.letterSpacing[device]
								) {
									style += `letter-spacing:${newValue.letterSpacing[device]}px;`;
								}
								if (
									args.live_refresh_default &&
									args.live_refresh_default.line_height
								) {
									style += `line-height:${
										args.live_refresh_default.line_height[
											device
										]
									}${
										args.live_refresh_default.line_height
											.suffix &&
										args.live_refresh_default.line_height
											.suffix[device]
											? args.live_refresh_default
													.line_height.suffix[device]
											: ''
									};`;
								}
								if (
									newValue.lineHeight &&
									newValue.lineHeight[device]
								) {
									style += `line-height:${
										newValue.lineHeight[device]
									}${
										newValue.lineHeight.suffix[device] || ''
									};`;
								}
								style += `}}`;
							}
							addCSS(settingId, style);
							break;
						case '\\Neve\\Customizer\\Controls\\React\\Button_Appearance':
							const bgColor = newValue.background || 'unset';
							const txtColor = newValue.text || 'currentColor';
							const borderColor = newValue.text || '';

							let mainSelector = `html ${args.selector}`,
								colorSelector = `html ${args.selector} .icon-bar`;

							if (
								args.additional &&
								args.additional.additional_buttons
							) {
								_.each(
									args.additional.additional_buttons,
									(button) => {
										mainSelector +=
											',html ' + button.button;
										colorSelector +=
											',html ' +
											button.button +
											' ' +
											button.text;
									}
								);
							}
							style += `${mainSelector} {
										background-color: ${bgColor};
										color: ${txtColor};`;
							if (typeof newValue.borderRadius !== 'object') {
								style += `border-radius: ${newValue.borderRadius}px;`;
							} else {
								style += `
                border-top-left-radius: ${newValue.borderRadius.top}px;
                border-top-right-radius: ${newValue.borderRadius.right}px;
                border-bottom-right-radius: ${newValue.borderRadius.bottom}px;
                border-bottom-left-radius: ${newValue.borderRadius.left}px;
                `;
							}

							if (newValue.type === 'outline') {
								if (typeof newValue.borderWidth !== 'object') {
									style += `border: ${newValue.borderWidth}px solid ${borderColor};`;
								} else {
									style += `
                  border-style: solid;
                  border-color: ${borderColor};
                  border-top-width: ${newValue.borderWidth.top}px;
                  border-right-width: ${newValue.borderWidth.right}px;
                  border-bottom-width: ${newValue.borderWidth.bottom}px;
                  border-left-width: ${newValue.borderWidth.left}px;
                  `;
								}
							}
							if (newValue.type === 'fill') {
								style += 'border: none;';
							}
							style += '}';
							style += `${colorSelector} {
										background-color: ${txtColor};
										color: ${txtColor};
									}`;
							addCSS(settingId, style);
							break;
						case 'text':
							const textContainer = document.querySelector(
								args.selector
							);
							if (newValue === '') {
								textContainer.parentNode.removeChild(
									textContainer
								);
								return false;
							}
							if (textContainer === null) {
								const wrap = document.createElement(
									args.additional.html_tag
								);
								wrap.classList.add(args.additional.wrap_class);
								document
									.querySelector(args.additional.parent)
									.prepend(wrap);
							}
							document.querySelector(
								args.selector
							).innerHTML = newValue;
							break;
						case 'neve_range_control':
						case 'Neve\\Customizer\\Controls\\React\\Range':
							if (args.additional.type === 'svg-icon-size') {
								style += `html ${args.selector} {
											width: ${newValue}px;
											height: ${newValue}px;
										}`;
								addCSS(settingId, style);
								return false;
							}

							style += `html ${args.selector} {
											${args.additional.type}: ${newValue}px;
										}`;
							addCSS(settingId, style);

							break;
						case '\\Neve\\Customizer\\Controls\\React\\Color':
							const colorValue =
								newValue === '' ? 'unset' : newValue;
							style += `html ${args.selector} {
										${args.additional.prop}: ${colorValue};
									}`;
							addCSS(settingId, style);
							break;
						case '\\Neve\\Customizer\\Controls\\React\\Font_Family':
							break;
						case 'Neve\\Customizer\\Controls\\React\\Global_Colors':
							const cssTag = document.querySelector(
								'#nv-css-vars-inline-css'
							);

							const { palettes, activePalette } = newValue;
							const { colors } = palettes[activePalette];
							let globalColorsCSS = ':root{';
							Object.keys(colors).map((slug) => {
								globalColorsCSS += `--${slug}:${colors[slug]};`;
								if (typeof elementorFrontend !== 'undefined') {
									globalColorsCSS += `--e-global-color-${slug.replaceAll(
										'-',
										''
									)}:${colors[slug]};`;
								}
								return false;
							});
							globalColorsCSS += '}';
							cssTag.innerHTML = globalColorsCSS;
							break;
					}
				});
			});
		});
	});

	wp.customize.preview.bind('font-selection', function (data) {
		const controlData = neveCustomizePreview[data.type][data.controlId];

		let selector = controlData.selector;

		const source = data.source;
		const id = data.controlId + '_font_family';

		if (source.toLowerCase() === 'google') {
			const linkNode = document.querySelector('#' + id),
				fontValue = data.value.split(' ').join('+').split('"').join(''),
				url =
					'//fonts.googleapis.com/css?family=' +
					fontValue +
					'%3A100%2C200%2C300%2C400%2C500%2C600%2C700%2C800&display=swap"';
			if (linkNode !== null) {
				linkNode.setAttribute('href', url);
			} else {
				const newNode = document.createElement('link');
				newNode.setAttribute('rel', 'stylesheet');
				newNode.setAttribute('id', id);
				newNode.setAttribute('href', url);
				newNode.setAttribute('type', 'text/css');
				newNode.setAttribute('media', 'all');
				document.querySelector('head').appendChild(newNode);
			}
		}

		const { additional = false } = controlData;

		if (
			additional !== false &&
			additional.cssVar !== undefined &&
			neveCustomizePreview.newSkin
		) {
			return false;
		}

		const defaultFontface = data.inherit
			? 'inherit'
			: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';

		// Make selector more specific by adding `html` before.
		selector = selector.split(',');
		selector = selector
			.map(function (sel) {
				return 'html ' + sel;
			})
			.join(',');
		if (data.value === false) {
			addCSS(
				data.controlId,
				selector + '{font-family: ' + defaultFontface + ';}'
			);
		} else {
			addCSS(
				data.controlId,
				selector + '{font-family: ' + data.value + ' ;}'
			);
		}
	});

	wp.customize('background_image', function (value) {
		value.bind(function (newval) {
			if (!newval) {
				document
					.querySelector('body')
					.classList.remove('custom-background');
			}
		});
	});
});

(function ($) {
	$.neveCustomizeUtilities = {
		setLiveCss(settings, to) {
			'use strict';
			let result = '';
			if (typeof to !== 'object') {
				$(settings.selectors).css(
					settings.cssProperty,
					to.toString() + settings.propertyUnit
				);
				return false;
			}
			$.each(to, function (key, value) {
				if (key === 'suffix') {
					return true;
				}
				let unit = settings.propertyUnit;
				if (typeof settings.propertyUnit === 'object') {
					unit = settings.propertyUnit[key];
				}
				const styleToAdd =
					settings.selectors +
					'{ ' +
					settings.cssProperty +
					':' +
					value +
					unit +
					'}';
				switch (key) {
					default:
					case 'mobile':
						result += styleToAdd;
						break;

					case 'desktop':
						result +=
							'@media(min-width: 960px) {' + styleToAdd + '}';
						break;

					case 'tablet':
						result +=
							'@media (min-width: 576px){' + styleToAdd + '}';
						break;
				}
			});

			const styleClass = $('.' + settings.styleClass);
			if (styleClass.length > 0) {
				styleClass.text(result);
			} else {
				$('head').append(
					'<style type="text/css" class="' +
						settings.styleClass +
						'">' +
						result +
						'</style>'
				);
			}
		},
	};
})(jQuery);

(function ($) {
	$.neveRangesPreview = {
		init() {
			this.rangesPreview();
		},
		ranges: {
			neve_container_width: {
				selector: '.container',
				cssProp: 'max-width',
				unit: 'px',
				styleClass: 'container-width-css',
			},
		},
		rangesPreview() {
			'use strict';
			_.each(this.ranges, function (args, id) {
				wp.customize(id, function (value) {
					value.bind(function (newval) {
						const values = JSON.parse(newval);
						if (!values) {
							return true;
						}
						if (typeof values.suffix === 'object') {
							args.unit = values.suffix;
						}
						const settings = {
							selectors: args.selector,
							cssProperty: args.cssProp,
							propertyUnit: args.unit ? args.unit : '',
							styleClass: args.styleClass,
						};
						$.neveCustomizeUtilities.setLiveCss(settings, values);
					});
				});
			});
		},
	};
})(jQuery);

if (!newSkin) {
	jQuery.neveRangesPreview.init();
}

(function ($) {
	$.neveLayoutPreview = {
		init() {
			this.contentWidthsPreview();
			this.containersLivePreview();
		},
		contentWidths: {
			neve_sitewide_content_width: {
				content: '.neve-main > .container .col',
				sidebar: '.nv-sidebar-wrap',
			},
			neve_blog_archive_content_width: {
				content: '.archive-container .nv-index-posts',
				sidebar: '.archive-container .nv-sidebar-wrap',
			},
			neve_single_post_content_width: {
				content: '.single-post-container .nv-single-post-wrap',
				sidebar: '.single-post-container .nv-sidebar-wrap',
			},
			neve_shop_archive_content_width: {
				content: '.archive.woocommerce .shop-container .nv-shop.col',
				sidebar:
					'.archive.woocommerce .shop-container .nv-sidebar-wrap',
			},
			neve_single_product_content_width: {
				content: '.single-product .shop-container .nv-shop.col',
				sidebar: '.single-product .shop-container .nv-sidebar-wrap',
			},
			neve_other_pages_content_width: {
				content:
					'body:not(.single):not(.archive):not(.blog):not(.search) .neve-main > .container .col, body.post-type-archive-course .neve-main > .container .col, body.post-type-archive-llms_membership .neve-main > .container .col',
				sidebar:
					'body:not(.single):not(.archive):not(.blog):not(.search) .nv-sidebar-wrap, body.post-type-archive-course .nv-sidebar-wrap, body.post-type-archive-llms_membership .nv-sidebar-wrap',
			},
		},
		contentWidthsPreview() {
			$.each(this.contentWidths, function (id, args) {
				wp.customize(id, function (value) {
					value.bind(function (newval) {
						const style = ` @media (min-width: 961px) {
							${args.content} { max-width: ${newval}% !important; }
							${args.sidebar} { max-width: ${100 - newval}% !important; }
						}`;
						addCSS(id + '-css', style);
					});
				});
			});
		},
		containersLayoutMap: {
			neve_default_container_style:
				'.page:not(.woocommerce) .single-page-container',
			neve_blog_archive_container_style: '.archive-container',
			neve_single_post_container_style: '.single-post-container',
			neve_shop_archive_container_style:
				'.woocommerce-page.post-type-archive .neve-main > div',
			neve_single_product_container_style:
				'.single-product .neve-main > div',
		},
		containersLivePreview() {
			'use strict';
			$.each(this.containersLayoutMap, function (controlId, cssSelector) {
				cssSelector += ':not(.set-in-metabox)';
				wp.customize(controlId, function (value) {
					value.bind(function (newval) {
						if (newval === 'contained') {
							$(cssSelector)
								.removeClass('container-fluid')
								.addClass('container');
							return false;
						}
						$(cssSelector)
							.removeClass('container')
							.addClass('container-fluid');
					});
				});
			});
		},
	};
})(jQuery);

jQuery.neveLayoutPreview.init();
//# sourceMappingURL=customizer-preview.js.map
