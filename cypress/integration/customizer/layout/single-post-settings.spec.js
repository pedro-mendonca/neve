describe( 'Single Post Check', () => {
	const CONTROL = 'neve_layout_single_post_elements_order';
	const DEFAULT = '["title-meta","thumbnail","content","tags","comments"]';
	const REORDERED =
		'["post-navigation","tags","comments","author-biography","related-posts","sharing-icons","title-meta","content","thumbnail"]';

	const BEFORE = () => {
		cy.login();
		cy.visit( '/markup-image-alignment/' );
		cy.get( '#wp-admin-bar-edit' ).click();

		cy.clearWelcome();
		cy.get( '.components-panel__body' ).each( ( el ) => {
			cy.get( el )
				.invoke( 'attr', 'class' )
				.then( ( className ) => {
					if ( ! className.includes( 'is-opened' ) ) {
						cy.get( el ).click();
					}
				} );
		} );
		cy.get( '.components-checkbox-control__label' )
			.contains( 'Allow comments' )
			.parent()
			.find( '.components-checkbox-control__input' )
			.click();
		cy.get( 'button' ).contains( 'Update' ).click();
	};

	const AFTER = () => {
		cy.login( 'wp-admin/customize.php' );
		cy.window().then( ( win ) => {
			win.wp.customize.control( CONTROL ).setting.set( DEFAULT );
		} );
		aliasRestRoutes();
		saveCustomizer();
	};

	before( () => BEFORE() );
	after( () => AFTER() );

	it( 'All elements hidden', function () {
		cy.login( 'wp-admin/customize.php' );
		cy.window().then( ( win ) => {
			win.wp.customize.control( CONTROL ).setting.set( '[]' );
		} );
		aliasRestRoutes();
		saveCustomizer();

		const HIDDEN = [
			'.entry-header',
			'.nv-thumb-wrap',
			'.entry-content',
			'.nv-tags-list',
			'.comments-area',
			'.nv-post-navigation',
		];

		cy.visit( '/markup-image-alignment/' );
		HIDDEN.forEach( ( className ) => {
			cy.get( '.nv-single-post-wrap' ).should(
				'not.have.descendants',
				className
			);
		} );
	} );

	it( 'All elements enabled and reordered', () => {
		cy.login( 'wp-admin/customize.php' );
		cy.window().then( ( win ) => {
			win.wp.customize.control( CONTROL ).setting.set( REORDERED );
		} );
		aliasRestRoutes();
		saveCustomizer();

		const ORDER = [
			'nv-post-navigation',
			'nv-tags-list',
			'comments-area',
			'nv-author-biography',
			'nv-related-posts',
			'nv-post-share',
			'entry-header',
			'nv-content-wrap',
			'nv-thumb-wrap',
		];

		cy.visit( '/markup-image-alignment/' );
		ORDER.forEach( ( className ) => {
			cy.get( '.nv-single-post-wrap' )
				.find( '> *' )
				.each( ( el, index ) => {
					cy.get( el ).should( 'have.class', ORDER[ index ] );
				} );
		} );
	} );
} );

/**
 * Enable all ordering items.
 *
 * @param selector
 */
function setOrderElementsVisible( selector ) {
	cy.get( selector )
		.find( 'li.order-component' )
		.each( function ( el ) {
			cy.get( el )
				.invoke( 'attr', 'data-id' )
				.then( function () {
					cy.get( el )
						.invoke( 'attr', 'class' )
						.then( ( val ) => {
							if ( ! val.includes( 'enabled' ) ) {
								cy.get( el ).find( '.toggle-display' ).click();
							}
						} );
				} );
		} );
}

/**
 * Alias Rest Routes
 */
function aliasRestRoutes() {
	const home = Cypress.config().baseUrl;
	cy.server()
		.route( 'POST', home + '/wp-admin/admin-ajax.php' )
		.as( 'customizerSave' );
}

/**
 * Publish customizer changes.
 */
function saveCustomizer() {
	cy.get( '#save' ).click( { force: true } );
	cy.wait( '@customizerSave' ).then( ( req ) => {
		expect( req.status ).to.equal( 200 );
	} );
}
