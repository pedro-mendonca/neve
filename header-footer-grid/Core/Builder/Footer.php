<?php
/**
 * Footer class for Header Footer Grid.
 *
 * Name:    Header Footer Grid
 * Author:  Bogdan Preda <bogdan.preda@themeisle.com>
 *
 * @version 1.0.0
 * @package HFG
 */

namespace HFG\Core\Builder;

use HFG\Main;
use Neve\Customizer\Controls\React\Presets_Selector;
use WP_Customize_Manager;

/**
 * Class Footer
 *
 * @package HFG\Core\Builder
 */
class Footer extends Abstract_Builder {
	/**
	 * Builder name.
	 */
	const BUILDER_NAME = 'footer';

	/**
	 * Footer constructor.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function init() {
		$this->set_property( 'title', __( 'Footer', 'neve' ) );
		$this->set_property(
			'description',
			apply_filters(
				'hfg_footer_panel_description',
				sprintf(
					/* translators: %s link to documentation */
					esc_html__( 'Design your %1$s by dragging, dropping and resizing all the elements in real-time. %2$s.', 'neve' ),
					/* translators: %s builder type */
					$this->get_property( 'title' ),
					/* translators: %s link text */
					sprintf(
						'<br/><a target="_blank" href="https://docs.themeisle.com/article/946-neve-doc#footer-builder">%s</a>',
						esc_html__( 'Read full documentation', 'neve' )
					)
				)
			)
		);
		$this->set_property(
			'instructions_array',
			array(
				'description' => sprintf(
					/* translators: %s builder type */
					esc_html__( 'Welcome to the %1$s builder! Click the "+" button to add a new component or follow the Quick Links.', 'neve' ),
					$this->get_property( 'title' )
				),
				'image'       => esc_url( get_template_directory_uri() . '/header-footer-grid/assets/images/customizer/hfg.mp4' ),
				'quickLinks'  => array(
					'footer_copyright_content'            => array(
						'label' => esc_html__( 'Change Copyright', 'neve' ),
						'icon'  => 'dashicons-nametag',
					),
					'hfg_footer_layout_bottom_background' => array(
						'label' => esc_html__( 'Change Footer Color', 'neve' ),
						'icon'  => 'dashicons-admin-appearance',
					),
				),
			)
		);
		$this->devices = [
			'desktop' => __( 'Footer', 'neve' ),
		];
	}

	/**
	 * Called to register component controls.
	 *
	 * @param WP_Customize_Manager $wp_customize The Customize Manager.
	 *
	 * @return WP_Customize_Manager
	 * @since   1.0.0
	 * @access  public
	 */
	public function customize_register( WP_Customize_Manager $wp_customize ) {
		$wp_customize->add_section(
			'neve_footer_presets',
			[
				'title'    => __( 'Footer Presets', 'neve' ),
				'priority' => 200,
				'panel'    => 'hfg_footer',
			]
		);

		$wp_customize->add_setting(
			'hfg_neve_footer_presets',
			[
				'sanitize_callback' => 'sanitize_text_field',
				'label'             => __( 'Footer Presets', 'neve' ),
			]
		);
		$wp_customize->add_control(
			new Presets_Selector(
				$wp_customize,
				'hfg_neve_footer_presets',
				[
					'section'   => 'neve_footer_presets',
					'transport' => 'postMessage',
					'priority'  => 30,
					'presets'   => $this->get_footer_presets(),
					'builder'   => 'footer',
				]
			)
		);

		return parent::customize_register( $wp_customize );
	}

	/**
	 * Method called via hook.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function load_template() {

		Main::get_instance()->load( 'footer-wrapper' );
	}

	/**
	 * Render builder row.
	 *
	 * @param string $device_id The device id.
	 * @param string $row_id The row id.
	 * @param array  $row_details Row data.
	 */
	public function render_row( $device_id, $row_id, $row_details ) {
		Main::get_instance()->load( 'footer-row-wrapper' );
	}

	/**
	 * Get builder id.
	 *
	 * @return string Builder id.
	 */
	public function get_id() {
		return self::BUILDER_NAME;
	}

	/**
	 * Overrides parent method to limit rows.
	 *
	 * @return array
	 * @since   1.0.0
	 * @access  protected
	 */
	protected function get_rows() {

		return [
			'top'    => array(
				'title'       => __( 'Footer Top', 'neve' ),
				'description' => $this->get_property( 'description' ),
			),
			'bottom' => array(
				'title'       => __( 'Footer Bottom', 'neve' ),
				'description' => $this->get_property( 'description' ),
			),
		];
	}

	/**
	 * Get footer presets.
	 *
	 * @return array
	 */
	private function get_footer_presets() {
		return apply_filters(
			'neve_footer_presets',
			[
				[
					'label' => 'Empty',
					'image' => NEVE_ASSETS_URL . 'img/header-presets/Classic.jpg',
					'setup' => '{"hfg_footer_layout":"{\"desktop\":{\"top\":[],\"bottom\":[]}}","hfg_footer_layout_top_layout":"layout-full-contained","hfg_footer_layout_bottom_layout":"layout-full-contained"}',
				],
				[
					'label' => 'Menu Right',
					'image' => NEVE_ASSETS_URL . 'img/header-presets/Classic.jpg',
					'setup' => '{"hfg_footer_layout":"{\"desktop\":{\"top\":[{\"x\":0,\"y\":1,\"width\":4,\"height\":1,\"id\":\"footer_copyright\"},{\"x\":6,\"y\":1,\"width\":6,\"height\":1,\"id\":\"footer-menu\"}],\"bottom\":[]}}","hfg_footer_layout_top_layout":"layout-full-contained","hfg_footer_layout_bottom_layout":"layout-full-contained"}',
				],
				[
					'label' => 'Menu Left',
					'image' => NEVE_ASSETS_URL . 'img/header-presets/Classic.jpg',
					'setup' => '{"hfg_footer_layout":"{\"desktop\":{\"top\":[{\"x\":0,\"y\":1,\"width\":6,\"height\":1,\"id\":\"footer-menu\"},{\"x\":8,\"y\":1,\"width\":4,\"height\":1,\"id\":\"footer_copyright\"}],\"bottom\":[]}}","hfg_footer_layout_top_layout":"layout-full-contained","hfg_footer_layout_bottom_layout":"layout-full-contained"}',
				],
			]
		);
	}
}
