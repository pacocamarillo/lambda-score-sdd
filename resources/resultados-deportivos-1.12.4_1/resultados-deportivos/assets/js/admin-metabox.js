document.addEventListener( 'DOMContentLoaded', function () {
	var wrapIndividual = document.getElementById( 'rd-campo-fecha-lugar' );
	var wrapSerie = document.getElementById( 'rd-campo-serie' );
	var acumuladoRadio = document.getElementById( 'rd_tipo_acumulado' );
	var radios = document.querySelectorAll( 'input[name="rd_tipo"]' );

	if ( ( ! wrapIndividual && ! wrapSerie ) || ! radios.length ) {
		return;
	}

	function actualizar() {
		var esAcumulado = !! ( acumuladoRadio && acumuladoRadio.checked );
		if ( wrapIndividual ) {
			wrapIndividual.style.display = esAcumulado ? 'none' : 'block';
		}
		if ( wrapSerie ) {
			wrapSerie.style.display = esAcumulado ? 'block' : 'none';
		}
	}

	radios.forEach( function ( radio ) {
		radio.addEventListener( 'change', actualizar );
	} );

	actualizar();
} );
