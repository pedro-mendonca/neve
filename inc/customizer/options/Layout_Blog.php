<?php
/**
 * Blog layout section.
 *
 * Author:          Andrei Baicus <andrei@themeisle.com>
 * Created on:      20/08/2018
 * @package Neve\Customizer\Options
 */

namespace Neve\Customizer\Options;

use Neve\Customizer\Base_Customizer;
use Neve\Customizer\Types\Control;
use Neve\Customizer\Types\Section;

/**
 * Class Layout_Blog
 * @package Neve\Customizer\Options
 */
class Layout_Blog extends Base_Customizer {
	/**
	 * Function that should be extended to add customizer controls.
	 *
	 * @return void
	 */
	public function add_controls() {
		$this->section_blog();
		$this->control_blog_layout();
		$this->control_excerpt();
		$this->control_pagination_type();
		$this->control_content_order();
		$this->control_meta_order();
	}

	/**
	 * Add customize section
	 */
	private function section_blog() {
		$this->add_section(
			new Section(
				'neve_blog_archive_layout',
				array(
					'priority' => 35,
					'title'    => esc_html__( 'Blog / Archive', 'neve' ),
					'panel'    => 'neve_layout',
				)
			)
		);
	}

	/**
	 * Add blog layout controls
	 */
	private function control_blog_layout() {
		$this->add_control(
			new Control(
				'neve_blog_archive_layout',
				array(
					'default'           => 'default',
					'sanitize_callback' => array( $this, 'sanitize_blog_layout' ),
				),
				array(
					'label'    => esc_html__( 'Blog', 'hestia-pro' ) . ' ' . esc_html__( 'Layout', 'hestia-pro' ),
					'section'  => 'neve_blog_archive_layout',
					'priority' => 25,
					'choices'  => array(
						'default'     => array(
							'url' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAABqAgMAAAAjP0ATAAAACVBMVEX///8+yP/V1dXG9YqxAAAAS0lEQVRYw2NgGAXDE4RCQMDAKONahQ5WUKBs1AujXqDEC6NgiANRSDyH0EwZRvJZ1UCBslEvjHqBZl4YBYMUjNb1o14Y9cIoGH4AALJWvPSk+QsLAAAAAElFTkSuQmCC',
						),
						'alternative' => array(
							'url' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAABqAgMAAAAjP0ATAAAACVBMVEX///8+yP/V1dXG9YqxAAAAPklEQVR42mNgGAXDE4RCQMDAKONahQ5WUKBs1AujXqDEC6NgtOAazTKjXhgtuEbBaME1mutHvTBacI0C4gEAenW95O4Ccg4AAAAASUVORK5CYII=',
						),
						'grid'        => array(
							'url' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAABqCAMAAABpj1iyAAAACVBMVEUAyv/V1dX////o4eoDAAAAfUlEQVR42u3ZoQ0AMAgAQej+Q3cDCI6QQyNOvKGNt3KwsLCwsLB2sKKc4V6/iIWFhYWFhYWFhXWN5cQ4xcpyhos9K8tZytKW5CWvLclLXltYWFhYWFj+Ez0kYWFhYWFhYWFhYTkxrrGyHC/N2pK85LUleclrCwsLCwvrMOsDUDxdDThzw38AAAAASUVORK5CYII=',
						),
					),
//					'subcontrols' => array(
//						'alternative' => array(),
//						'default'     => array(),
//						'grid'        => array(
//							'neve_grid_layout',
//						),
//					),
				),
				'Neve\Customizer\Controls\Radio_Image'
			)
		);

		$this->add_control(
			new Control(
				'neve_grid_layout',
				array(
					'sanitize_callback' => 'absint',
					'default'           => '1',
				),
				array(
					'priority'        => 30,
					'section'         => 'neve_blog_archive_layout',
					'label'           => esc_html__( 'Grid Layout', 'neve' ),
					'choices'         => array(
						'1' => esc_html__( '1 Column', 'neve' ),
						'2' => esc_html__( '2 Columns', 'neve' ),
						'3' => esc_html__( '3 Columns', 'neve' ),
						'4' => esc_html__( '4 Columns', 'neve' ),
					),
					'type'            => 'select',
					'active_callback' => array( $this, 'should_show_grid_cols' ),
				)
			)
		);

		$this->add_control(
			new Control(
				'neve_enable_masonry',
				array(
					'sanitize_callback' => 'neve_sanitize_checkbox',
					'default'           => false,
				),
				array(
					'type'            => 'checkbox',
					'priority'        => 35,
					'section'         => 'neve_blog_archive_layout',
					'label'           => esc_html__( 'Enable Masonry', 'neve' ),
					'active_callback' => array( $this, 'should_show_masonry' ),
				)
			)
		);
	}

	/**
	 * Add excerpt control
	 */
	private function control_excerpt() {
		$this->add_control( new Control(
				'neve_post_excerpt_length',
				array(
					'sanitize_callback' => 'neve_sanitize_range_value',
					'default'           => 40,
				),
				array(
					'label'      => esc_html__( 'Excerpt Length', 'neve' ),
					'section'    => 'neve_blog_archive_layout',
					'type'       => 'range-value',
					'input_attr' => array(
						'min'  => 5,
						'max'  => 300,
						'step' => 5,
					),
					'priority'   => 40,
				),
				'Neve\Customizer\Controls\Range'
			)
		);
	}

	/**
	 * Add infinite scroll control
	 */
	private function control_pagination_type() {
		$this->add_control(
			new Control(
				'neve_pagination_type',
				array(
					'default'           => 'number',
					'sanitize_callback' => array( $this, 'sanitize_pagination_type' ),
				),
				array(
					'label'    => esc_html__( 'Post Pagination', 'neve' ),
					'section'  => 'neve_blog_archive_layout',
					'priority' => 45,
					'type'     => 'select',
					'choices'  => array(
						'number'   => esc_html__( 'Number', 'neve' ),
						'infinite' => esc_html__( 'Infinite Scroll', 'neve' ),
					),
				)
			)
		);
	}

	/**
	 * Add categories toggle control
	 */

	/**
	 * Sanitize the container layout value
	 *
	 * @param string $value value from the control.
	 *
	 * @return bool
	 */
	public function sanitize_blog_layout( $value ) {
		$allowed_values = array( 'default', 'alternative', 'grid' );
		if ( ! in_array( $value, $allowed_values ) ) {
			return 'default';
		}

		return esc_html( $value );
	}

	/**
	 * Sanitize the pagination type
	 *
	 * @param string $value value from the control.
	 *
	 * @return bool
	 */
	public function sanitize_pagination_type( $value ) {
		$allowed_values = array( 'number', 'infinite' );
		if ( ! in_array( $value, $allowed_values ) ) {
			return 'number';
		}

		return esc_html( $value );
	}


	private function control_content_order() {
		$order_default_components = array(
			'thumbnail',
			'title',
			'meta',
			'excerpt',
			'read-more',
		);

		$this->add_control( new Control(
				'neve_post_content_ordering',
				array(
					'sanitize_callback' => array( $this, 'sanitize_post_content_ordering' ),
					'default'           => json_encode( $order_default_components ),
				),
				array(
					'label'      => esc_html__( 'Post Content Order', 'neve' ),
					'section'    => 'neve_blog_archive_layout',
					'type'       => 'ordering',
					'components' => $order_default_components,
					'priority'   => 55,
				),
				'Neve\Customizer\Controls\Ordering'
			)
		);
	}

	private function control_meta_order() {
		$order_default_components = array(
			'author',
			'category',
			'date',
			'comments',
		);

		$this->add_control( new Control(
				'neve_post_meta_ordering',
				array(
					'sanitize_callback' => array( $this, 'sanitize_meta_ordering' ),
					'default'           => json_encode( $order_default_components ),
				),
				array(
					'label'           => esc_html__( 'Meta Order', 'neve' ),
					'section'         => 'neve_blog_archive_layout',
					'type'            => 'ordering',
					'components'      => $order_default_components,
					'priority'        => 60,
					'active_callback' => array( $this, 'should_show_meta_order' ),
				),
				'Neve\Customizer\Controls\Ordering'
			)
		);
	}

	public function sanitize_meta_ordering( $value ) {
		$allowed = array(
			'author',
			'category',
			'date',
			'comments',
		);

		if ( empty ( $value ) ) {
			return $allowed;
		}

		$decoded = json_decode( $value );

		foreach ( $decoded as $val ) {
			if ( ! in_array( $val, $allowed ) ) {
				return $allowed;
			}
		}

		return $value;
	}

	public function sanitize_post_content_ordering( $value ) {
		$allowed = array(
			'thumbnail',
			'title',
			'meta',
			'excerpt',
			'read-more',
		);

		if ( empty ( $value ) ) {
			return $allowed;
		}

		$decoded = json_decode( $value );

		foreach ( $decoded as $val ) {
			if ( ! in_array( $val, $allowed ) ) {
				return $allowed;
			}
		}

		return $value;
	}

	public function should_show_meta_order() {
		$default       = array(
			'thumbnail',
			'title',
			'meta',
			'excerpt',
			'read-more',
		);
		$content_order = get_theme_mod( 'neve_post_content_ordering', json_encode( $default ) );
		$content_order = json_decode( $content_order, true );
		if ( ! in_array( 'meta', $content_order ) ) {
			return false;
		}

		return true;
	}

	public function should_show_grid_cols() {
		$blog_layout = get_theme_mod( 'neve_blog_archive_layout', 'default' );
		if ( $blog_layout !== 'grid' ) {
			return false;
		}

		return true;
	}

	public function should_show_masonry() {
		$blog_layout = get_theme_mod( 'neve_blog_archive_layout', 'default' );
		$columns     = get_theme_mod( 'neve_grid_layout', '1' );
		if ( $blog_layout !== 'grid' || $columns === 1 ) {
			return false;
		}

		return true;
	}
}