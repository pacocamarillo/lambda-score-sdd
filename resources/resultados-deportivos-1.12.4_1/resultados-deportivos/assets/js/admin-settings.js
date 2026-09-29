jQuery( document ).ready( function( $ ) {
	// Mismo patrón de subida de imagen (wp.media) para el logotipo normal
	// y el logotipo para fondo oscuro: cada botón indica, en
	// data-target="rd_xxx", el prefijo de sus campos (rd_xxx_id,
	// rd_xxx_preview, y los botones con el mismo data-target).
	var frames = {};

	$( '.rd-media-upload-btn' ).on( 'click', function( e ) {
		e.preventDefault();
		var target = $( this ).data( 'target' );

		if ( frames[ target ] ) {
			frames[ target ].open();
			return;
		}

		var frame = wp.media( {
			title: 'Seleccionar logotipo',
			button: { text: 'Usar esta imagen' },
			library: { type: 'image' },
			multiple: false,
		} );

		frame.on( 'select', function() {
			var attachment = frame.state().get( 'selection' ).first().toJSON();
			$( '#' + target + '_id' ).val( attachment.id );

			var previewUrl = attachment.sizes && attachment.sizes.medium
				? attachment.sizes.medium.url
				: attachment.url;

			$( '#' + target + '_preview' ).attr( 'src', previewUrl ).show();
			$( '.rd-media-remove-btn[data-target="' + target + '"]' ).show();
		} );

		frames[ target ] = frame;
		frame.open();
	} );

	$( '.rd-media-remove-btn' ).on( 'click', function( e ) {
		e.preventDefault();
		var target = $( this ).data( 'target' );
		$( '#' + target + '_id' ).val( '' );
		$( '#' + target + '_preview' ).hide().attr( 'src', '' );
		$( this ).hide();
	} );
} );
