<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Certificados de participación, generados en PDF a partir de los mismos
 * datos que ya trae la conexión JSON de Webscorer (nombre, dorsal,
 * categoría, tiempo, lugar obtenido; o nombre, puntos y carreras contadas
 * en los acumulados). No requiere ninguna librería nueva: el PDF se arma
 * con includes/pdf-writer.php.
 *
 * Dos formas de llegar al certificado:
 * 1) Un enlace "Imprimir certificado" en cada fila de la tabla de
 *    resultados (agregado en includes/webscorer.php), que va directo al
 *    PDF de ese corredor.
 * 2) El shortcode [certificado_deportivo], un buscador público donde el
 *    competidor elige el evento y escribe su dorsal o su nombre.
 *
 * Nota: Webscorer no expone correo electrónico ni otros datos de
 * contacto en su API, así que esto es para imprimir/descargar bajo
 * demanda, no para un envío automático por correo a cada participante.
 */

/** Ruta en el servidor del logotipo configurado en Ajustes, o '' si no hay. */
function rd_cert_get_logo_source_path() {
	$logo_id = (int) get_option( 'rd_logo_id', 0 );
	if ( ! $logo_id ) {
		return '';
	}
	$path = get_attached_file( $logo_id );
	return ( $path && file_exists( $path ) ) ? $path : '';
}

/**
 * Ruta en el servidor del logotipo "para fondo oscuro" configurado en
 * Ajustes (opcional), o '' si no hay uno subido. Pensado para una
 * versión del logotipo en blanco/colores claros, con fondo transparente,
 * que se ve bien sobre la banda azul marino del certificado.
 */
function rd_cert_get_logo_dark_source_path() {
	$logo_id = (int) get_option( 'rd_logo_dark_id', 0 );
	if ( ! $logo_id ) {
		return '';
	}
	$path = get_attached_file( $logo_id );
	return ( $path && file_exists( $path ) ) ? $path : '';
}

/**
 * Ruta en el servidor de la firma del comité organizador configurada en
 * Ajustes (opcional), o '' si no hay una subida. Se muestra al pie del
 * certificado, arriba de la línea "Comité Organizador".
 */
function rd_cert_get_firma_source_path() {
	$firma_id = (int) get_option( 'rd_firma_id', 0 );
	if ( ! $firma_id ) {
		return '';
	}
	$path = get_attached_file( $firma_id );
	return ( $path && file_exists( $path ) ) ? $path : '';
}

/**
 * Busca, dentro de la respuesta de rd_ws_fetch_race(), al corredor que
 * coincide con el dorsal (prioridad) o, si no hay dorsal, con el nombre
 * exacto (sin distinguir mayúsculas/minúsculas). Devuelve
 * array( $racer, $categoria, $distancia ) o null si no se encontró.
 */
function rd_cert_find_racer_in_race( $data, $bib, $nombre ) {
	if ( empty( $data['Results'] ) || ! is_array( $data['Results'] ) ) {
		return null;
	}
	$bib    = trim( (string) $bib );
	$nombre = trim( (string) $nombre );

	foreach ( $data['Results'] as $group ) {
		$racers   = isset( $group['Racers'] ) && is_array( $group['Racers'] ) ? $group['Racers'] : array();
		$grouping = isset( $group['Grouping'] ) && is_array( $group['Grouping'] ) ? $group['Grouping'] : array();
		$distance = isset( $grouping['Distance'] ) ? $grouping['Distance'] : '';
		$category = isset( $grouping['Category'] ) ? $grouping['Category'] : '';

		foreach ( $racers as $racer ) {
			$racer_bib = isset( $racer['Bib'] ) ? trim( (string) $racer['Bib'] ) : '';
			$racer_nom = isset( $racer['Name'] ) ? trim( (string) $racer['Name'] ) : '';

			if ( '' !== $bib && '' !== $racer_bib && 0 === strcasecmp( $racer_bib, $bib ) ) {
				return array( $racer, $category, $distance );
			}
			if ( '' === $bib && '' !== $nombre && '' !== $racer_nom && 0 === strcasecmp( $racer_nom, $nombre ) ) {
				return array( $racer, $category, $distance );
			}
		}
	}
	return null;
}

/**
 * Convierte una fecha (formato "Y-m-d", como se guarda en el campo
 * "Fecha del evento") a su forma larga en español, ej. "30 de agosto de
 * 2026". Se hace a mano (sin depender de date_i18n) para que el
 * certificado siempre salga en español sin importar el idioma con el
 * que esté configurado el sitio de WordPress.
 */
function rd_cert_fecha_larga_es( $fecha_raw ) {
	$fecha_raw = trim( (string) $fecha_raw );
	if ( '' === $fecha_raw ) {
		return '';
	}
	$ts = strtotime( $fecha_raw );
	if ( ! $ts ) {
		return '';
	}
	$meses = array(
		1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril', 5 => 'mayo', 6 => 'junio',
		7 => 'julio', 8 => 'agosto', 9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
	);
	$dia = (int) date( 'j', $ts );
	$mes = $meses[ (int) date( 'n', $ts ) ];
	$ano = date( 'Y', $ts );
	return $dia . ' de ' . $mes . ' de ' . $ano;
}

/**
 * Igual que rd_cert_find_racer_in_race() pero para acumulados/series
 * (rd_ws_fetch_series()); ahí Webscorer no da dorsal, así que solo se
 * busca por nombre exacto.
 */
function rd_cert_find_racer_in_series( $data, $nombre ) {
	if ( empty( $data['Results'] ) || ! is_array( $data['Results'] ) ) {
		return null;
	}
	$nombre = trim( (string) $nombre );
	if ( '' === $nombre ) {
		return null;
	}

	foreach ( $data['Results'] as $group ) {
		$racers   = isset( $group['Racers'] ) && is_array( $group['Racers'] ) ? $group['Racers'] : array();
		$grouping = isset( $group['Grouping'] ) && is_array( $group['Grouping'] ) ? $group['Grouping'] : array();
		$label    = isset( $grouping['Category'] ) ? $grouping['Category'] : '';

		foreach ( $racers as $racer ) {
			$racer_nom = isset( $racer['Name'] ) ? trim( (string) $racer['Name'] ) : '';
			if ( '' !== $racer_nom && 0 === strcasecmp( $racer_nom, $nombre ) ) {
				return array( $racer, $label );
			}
		}
	}
	return null;
}

/**
 * Arma el PDF del certificado (una sola página, carta horizontal) y
 * devuelve los bytes. Diseño tipo "ficha de datos" (nombre arriba,
 * logotipo a la derecha, lista de campo: valor debajo), con todas las
 * etiquetas en español.
 */
function rd_cert_generate_pdf_bytes( $ctx ) {
	$pdf = new RD_Certificate_PDF( 792, 612 ); // Carta horizontal.
	$w   = $pdf->w;
	$h   = $pdf->h;

	// Paleta: azul marino de la marca (#14213d) + dorado de acento, y los
	// colores clásicos de medalla para resaltar el lugar 1-2-3.
	$brand  = array( 20 / 255, 33 / 255, 61 / 255 );
	$gold   = array( 0.72, 0.55, 0.13 );
	$oro    = array( 0.72, 0.53, 0.04 );
	$plata  = array( 0.47, 0.52, 0.58 );
	$bronce = array( 0.62, 0.42, 0.24 );
	$franja_clara = array( 0.955, 0.96, 0.975 );

	$margen_izq = 60;
	$margen_der = 60;

	// Bordes decorativos.
	$pdf->set_stroke_color( $brand[0], $brand[1], $brand[2] );
	$pdf->set_line_width( 3 );
	$pdf->rect( 24, 24, $w - 48, $h - 48, 'S' );
	$pdf->set_line_width( 1 );
	$pdf->rect( 34, 34, $w - 68, $h - 68, 'S' );

	// Banda superior a color (azul marino), de borde a borde interior.
	$banda_h  = 148;
	$banda_y1 = $h - 34; // Tope = borde interior.
	$banda_y0 = $banda_y1 - $banda_h;
	$pdf->set_fill_color( $brand[0], $brand[1], $brand[2] );
	$pdf->rect( 34, $banda_y0, $w - 68, $banda_h, 'f' );

	// Franja dorada, justo debajo de la banda (el "acento" de color).
	$pdf->set_fill_color( $gold[0], $gold[1], $gold[2] );
	$pdf->rect( 34, $banda_y0 - 6, $w - 68, 6, 'f' );

	// Logotipo, arriba a la derecha. Si hay un "logotipo para fondo
	// oscuro" configurado (versión en blanco/colores claros, con fondo
	// transparente), se dibuja directo sobre la banda azul marino, sin
	// ninguna tarjeta detrás. Si solo existe el logotipo normal (pensado
	// para fondos claros), se le pone una tarjeta blanca detrás para que
	// no se pierda contra el azul marino.
	$top_y   = $banda_y1 - 24;
	$right_x = $w - $margen_der;
	$logo_dw = 0;
	$logo_dh = 0;

	$logo_dark_path = rd_cert_get_logo_dark_source_path();
	$logo_idx       = $logo_dark_path ? $pdf->set_image( $logo_dark_path, array( 20, 33, 61 ) ) : false;
	if ( false !== $logo_idx ) {
		list( $logo_dw, $logo_dh ) = $pdf->draw_image_top_right( $logo_idx, $top_y, $right_x, 150, 62 );
	} else {
		$logo_path = rd_cert_get_logo_source_path();
		$logo_idx  = $logo_path ? $pdf->set_image( $logo_path, array( 255, 255, 255 ) ) : false;
		if ( false !== $logo_idx ) {
			$patch_pad = 14;
			$patch_w   = 150 + ( $patch_pad * 2 );
			$patch_h   = 62 + ( $patch_pad * 2 );
			$patch_x   = $right_x - $patch_w;
			$patch_y   = $top_y - $patch_h;
			$pdf->set_fill_color( 1, 1, 1 );
			$pdf->rect( $patch_x, $patch_y, $patch_w, $patch_h, 'f' );
			list( $logo_dw, $logo_dh ) = $pdf->draw_image_top_right( $logo_idx, $top_y - $patch_pad, $right_x - $patch_pad, 150, 62 );
			$logo_dw += $patch_pad * 2; // Para el cálculo del ancho disponible del encabezado.
		}
	}

	// Encabezado (etiqueta + nombre), en blanco sobre la banda; su ancho
	// se reduce si hay logotipo, para que no se encimen.
	$encabezado_max_w = ( $w - $margen_izq - $margen_der ) - ( $logo_dw ? ( $logo_dw + 20 ) : 0 );

	$cursor_y = $banda_y1 - 40;
	$pdf->set_fill_color( $oro[0] + 0.15, $oro[1] + 0.2, $oro[2] + 0.35 );
	$pdf->set_char_spacing( 1.4 );
	$pdf->text( $margen_izq, $cursor_y, 'CERTIFICADO DE PARTICIPACIÓN', true, 11 );
	$pdf->set_char_spacing( 0 );
	$cursor_y -= 32;

	$nombre = ( '' !== trim( (string) $ctx['nombre'] ) ) ? $ctx['nombre'] : 'Participante';
	$pdf->set_fill_color( 1, 1, 1 );
	$name_lines = rd_pdf_wrap_text( $nombre, true, 27, $encabezado_max_w );
	if ( empty( $name_lines ) ) {
		$name_lines = array( $nombre );
	}
	foreach ( $name_lines as $line ) {
		$pdf->text( $margen_izq, $cursor_y, $line, true, 27 );
		$cursor_y -= 31;
	}

	// La lista de campo/valor empieza debajo de la banda.
	$rows_start_y = $banda_y0 - 6 - 34;

	// Filas campo: valor. Se arman distinto según sea carrera individual
	// o acumulado/serie, y se omite cualquier fila cuyo valor venga vacío
	// (o, en "Equipo", cuando Webscorer solo trae el valor por defecto
	// "NOTEAM" de quienes no están afiliados a ningún equipo).
	if ( 'acumulado' === $ctx['tipo'] ) {
		$filas = array(
			array( 'Acumulado', $ctx['evento'] ),
			array( 'Categoría', $ctx['categoria'] ),
			array( 'Lugar en el acumulado', $ctx['lugar_obtenido'] ),
			array( 'Carreras contadas', $ctx['carreras_contadas'] ),
			array( 'Puntos', $ctx['puntos'] ),
		);
	} else {
		$filas = array(
			array( 'Nombre de la carrera', $ctx['evento'] ),
			array( 'Fecha', $ctx['fecha_fmt'] ),
			array( 'Lugar', $ctx['lugar'] ),
			array( 'Equipo', $ctx['equipo'] ),
			array( 'Dorsal', $ctx['dorsal'] ),
			array( 'Distancia', $ctx['distancia'] ),
			array( 'Categoría', $ctx['categoria'] ),
			array( 'Tiempo', $ctx['tiempo'] ),
			array( 'Lugar obtenido', $ctx['lugar_obtenido'] ),
		);
	}

	$label_x     = $margen_izq + 190;
	$value_x     = $label_x + 16;
	$value_max_w = ( $w - $margen_der ) - $value_x;

	$cursor_y  = $rows_start_y;
	$fila_num  = 0;
	foreach ( $filas as $fila ) {
		list( $etiqueta, $valor ) = $fila;
		$valor = trim( (string) $valor );
		if ( '' === $valor ) {
			continue;
		}
		if ( 'Equipo' === $etiqueta && 0 === strcasecmp( $valor, 'NOTEAM' ) ) {
			continue;
		}

		$vlineas = rd_pdf_wrap_text( $valor, false, 12.5, $value_max_w );
		if ( empty( $vlineas ) ) {
			$vlineas = array( $valor );
		}
		$n_lineas    = count( $vlineas );
		$bloque_alto = ( ( $n_lineas - 1 ) * 17 ) + 26;

		// Rayas alternadas (zebra) para que la lista no se vea tan plana.
		if ( 0 === ( $fila_num % 2 ) ) {
			$pdf->set_fill_color( $franja_clara[0], $franja_clara[1], $franja_clara[2] );
			$pdf->rect( 34, $cursor_y - $bloque_alto + 17, $w - 68, $bloque_alto, 'f' );
		}
		$fila_num++;

		// El lugar obtenido (1°, 2° o 3°) se resalta con el color de
		// medalla correspondiente; el resto de los valores va en gris oscuro.
		$valor_color = array( 0.15, 0.15, 0.15 );
		$valor_bold  = false;
		if ( in_array( $etiqueta, array( 'Lugar obtenido', 'Lugar en el acumulado' ), true )
			&& preg_match( '/^(\d+)/', $valor, $m ) ) {
			$puesto = (int) $m[1];
			if ( 1 === $puesto ) {
				$valor_color = $oro;
			} elseif ( 2 === $puesto ) {
				$valor_color = $plata;
			} elseif ( 3 === $puesto ) {
				$valor_color = $bronce;
			} else {
				$valor_color = $brand;
			}
			$valor_bold = true;
		}

		$pdf->set_fill_color( 0.55, 0.44, 0.18 );
		$pdf->text_right( $label_x, $cursor_y, $etiqueta . ':', true, 12.5 );

		$pdf->set_fill_color( $valor_color[0], $valor_color[1], $valor_color[2] );
		foreach ( $vlineas as $i => $vlinea ) {
			$pdf->text( $value_x, $cursor_y, $vlinea, $valor_bold, 12.5 );
			if ( $i < $n_lineas - 1 ) {
				$cursor_y -= 17;
			}
		}
		$cursor_y -= 26;
	}

	// Pie: una sola línea centrada ("Comité Organizador"), con la firma
	// (si se configuró en Ajustes) justo arriba, y el mismo dorado de
	// acento que la banda superior.
	$firma_y    = 96;
	$firma_path = rd_cert_get_firma_source_path();
	$firma_idx  = $firma_path ? $pdf->set_image( $firma_path, array( 255, 255, 255 ) ) : false;
	if ( false !== $firma_idx ) {
		$pdf->draw_image_centered_bottom( $firma_idx, $firma_y + 6, 130, 46 );
	}

	$pdf->set_stroke_color( $gold[0], $gold[1], $gold[2] );
	$pdf->set_line_width( 1 );
	$pdf->line( ( $w / 2 ) - 110, $firma_y, ( $w / 2 ) + 110, $firma_y );
	$pdf->set_fill_color( $brand[0], $brand[1], $brand[2] );
	$pdf->text_centered( $w / 2, $firma_y - 16, 'Comité Organizador', true, 10 );

	$site = get_bloginfo( 'name' );
	$pdf->set_fill_color( 0.55, 0.55, 0.55 );
	$pdf->text_centered( $w / 2, 55, 'Certificado generado automáticamente' . ( $site ? ' · ' . $site : '' ), false, 8.5 );

	return $pdf->output();
}

/**
 * Handler de admin-post.php?action=rd_certificado — genera y entrega el
 * PDF de un solo corredor. Público (funciona con o sin sesión).
 */
function rd_cert_handle_download() {
	$post_id = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : 0;
	$bib     = isset( $_GET['bib'] ) ? sanitize_text_field( wp_unslash( $_GET['bib'] ) ) : '';
	$nombre_q = isset( $_GET['nombre'] ) ? sanitize_text_field( wp_unslash( $_GET['nombre'] ) ) : '';

	if ( ! $post_id || 'rd_resultado' !== get_post_type( $post_id ) || 'publish' !== get_post_status( $post_id ) ) {
		wp_die( esc_html__( 'Ese resultado no existe o ya no está disponible.', 'resultados-deportivos' ), esc_html__( 'Certificado no disponible', 'resultados-deportivos' ), array( 'response' => 404 ) );
	}

	$tipo      = rd_get_tipo( $post_id );
	$evento    = get_the_title( $post_id );
	$fecha_raw = get_post_meta( $post_id, '_rd_fecha', true );
	$fecha_fmt = rd_cert_fecha_larga_es( $fecha_raw );
	$lugar     = get_post_meta( $post_id, '_rd_lugar', true );

	$ctx = array(
		'tipo'              => $tipo,
		'evento'            => $evento,
		'fecha_fmt'         => $fecha_fmt,
		'lugar'             => $lugar,
		'nombre'            => '',
		'categoria'         => '',
		'distancia'         => '',
		'equipo'            => '',
		'dorsal'            => '',
		'tiempo'            => '',
		'lugar_obtenido'    => '',
		'puntos'            => '',
		'carreras_contadas' => '',
	);

	if ( 'acumulado' === $tipo ) {
		$seriesid = get_post_meta( $post_id, '_rd_ws_seriesid', true );
		$data     = rd_ws_fetch_series( $seriesid );
		if ( ! empty( $data['error'] ) ) {
			wp_die( esc_html( 'No se pudo obtener la información de Webscorer: ' . $data['error'] ), esc_html__( 'Certificado no disponible', 'resultados-deportivos' ), array( 'response' => 502 ) );
		}
		$found = rd_cert_find_racer_in_series( $data, $nombre_q );
		if ( ! $found ) {
			wp_die( esc_html__( 'No encontramos a ese participante en este acumulado. Revisa que tu nombre esté escrito igual que en los resultados.', 'resultados-deportivos' ), esc_html__( 'Certificado no disponible', 'resultados-deportivos' ), array( 'response' => 404 ) );
		}
		list( $racer, $categoria ) = $found;
		$ctx['nombre']            = isset( $racer['Name'] ) ? $racer['Name'] : $nombre_q;
		$ctx['categoria']         = $categoria;
		$ctx['lugar_obtenido']    = isset( $racer['Place'] ) ? $racer['Place'] : '';
		$ctx['carreras_contadas'] = isset( $racer['RacesCounted'] ) ? $racer['RacesCounted'] : '';
		$ctx['puntos']            = ( isset( $racer['TotalPoints'] ) && '' !== $racer['TotalPoints'] )
			? $racer['TotalPoints']
			: ( isset( $racer['TotalTime'] ) ? $racer['TotalTime'] : '' );
	} else {
		$raceid = get_post_meta( $post_id, '_rd_ws_raceid', true );
		$data   = rd_ws_fetch_race( $raceid );
		if ( ! empty( $data['error'] ) ) {
			wp_die( esc_html( 'No se pudo obtener la información de Webscorer: ' . $data['error'] ), esc_html__( 'Certificado no disponible', 'resultados-deportivos' ), array( 'response' => 502 ) );
		}
		$found = rd_cert_find_racer_in_race( $data, $bib, $nombre_q );
		if ( ! $found ) {
			wp_die( esc_html__( 'No encontramos a ese participante en esta carrera. Revisa tu dorsal o que tu nombre esté escrito igual que en los resultados.', 'resultados-deportivos' ), esc_html__( 'Certificado no disponible', 'resultados-deportivos' ), array( 'response' => 404 ) );
		}
		list( $racer, $categoria, $distancia ) = $found;
		$ctx['nombre']         = isset( $racer['Name'] ) ? $racer['Name'] : $nombre_q;
		$ctx['categoria']      = $categoria;
		$ctx['distancia']      = $distancia;
		$ctx['equipo']         = isset( $racer['TeamName'] ) ? $racer['TeamName'] : '';
		$ctx['dorsal']         = isset( $racer['Bib'] ) ? $racer['Bib'] : $bib;
		$ctx['tiempo']         = isset( $racer['Time'] ) ? $racer['Time'] : '';
		$ctx['lugar_obtenido'] = isset( $racer['Place'] ) ? $racer['Place'] : '';
	}

	$pdf_bytes = rd_cert_generate_pdf_bytes( $ctx );
	$filename  = 'certificado-' . sanitize_title( '' !== trim( (string) $ctx['nombre'] ) ? $ctx['nombre'] : 'participante' ) . '.pdf';

	if ( function_exists( 'nocache_headers' ) ) {
		nocache_headers();
	}
	header( 'Content-Type: application/pdf' );
	header( 'Content-Disposition: inline; filename="' . $filename . '"' );
	header( 'Content-Length: ' . strlen( $pdf_bytes ) );
	echo $pdf_bytes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- binario, no HTML.
	exit;
}
add_action( 'admin_post_rd_certificado', 'rd_cert_handle_download' );
add_action( 'admin_post_nopriv_rd_certificado', 'rd_cert_handle_download' );

/**
 * Handler de admin-post.php?action=rd_certificado_buscar — usado por el
 * formulario del shortcode [certificado_deportivo]. Busca por dorsal
 * (coincidencia exacta) o por nombre (coincidencia parcial, por si hay
 * varios resultados) dentro de un evento, y muestra una lista sencilla
 * con un enlace "Imprimir certificado" para cada coincidencia.
 */
function rd_cert_handle_search() {
	$post_id = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : 0;
	$query   = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';

	if ( ! $post_id || 'rd_resultado' !== get_post_type( $post_id ) || 'publish' !== get_post_status( $post_id ) ) {
		wp_die( esc_html__( 'Selecciona un evento válido.', 'resultados-deportivos' ), esc_html__( 'Buscar certificado', 'resultados-deportivos' ), array( 'response' => 404 ) );
	}
	if ( '' === trim( $query ) ) {
		wp_die( esc_html__( 'Escribe tu dorsal o tu nombre para buscar tu certificado.', 'resultados-deportivos' ), esc_html__( 'Buscar certificado', 'resultados-deportivos' ), array( 'response' => 400 ) );
	}

	$tipo   = rd_get_tipo( $post_id );
	$evento = get_the_title( $post_id );
	$matches = array();

	if ( 'acumulado' === $tipo ) {
		$seriesid = get_post_meta( $post_id, '_rd_ws_seriesid', true );
		$data     = rd_ws_fetch_series( $seriesid );
		if ( empty( $data['error'] ) ) {
			$results = isset( $data['Results'] ) && is_array( $data['Results'] ) ? $data['Results'] : array();
			foreach ( $results as $group ) {
				$racers = isset( $group['Racers'] ) && is_array( $group['Racers'] ) ? $group['Racers'] : array();
				foreach ( $racers as $racer ) {
					$nombre = isset( $racer['Name'] ) ? $racer['Name'] : '';
					if ( '' !== $nombre && false !== stripos( $nombre, $query ) ) {
						$matches[] = array( 'nombre' => $nombre, 'bib' => '' );
					}
				}
			}
		}
	} else {
		$raceid = get_post_meta( $post_id, '_rd_ws_raceid', true );
		$data   = rd_ws_fetch_race( $raceid );
		if ( empty( $data['error'] ) ) {
			$results = isset( $data['Results'] ) && is_array( $data['Results'] ) ? $data['Results'] : array();
			foreach ( $results as $group ) {
				$racers = isset( $group['Racers'] ) && is_array( $group['Racers'] ) ? $group['Racers'] : array();
				foreach ( $racers as $racer ) {
					$nombre = isset( $racer['Name'] ) ? $racer['Name'] : '';
					$bib    = isset( $racer['Bib'] ) ? (string) $racer['Bib'] : '';
					$coincide_bib    = ( '' !== $bib && 0 === strcasecmp( trim( $bib ), trim( $query ) ) );
					$coincide_nombre = ( '' !== $nombre && false !== stripos( $nombre, $query ) );
					if ( $coincide_bib || $coincide_nombre ) {
						$matches[] = array( 'nombre' => $nombre, 'bib' => $bib );
					}
				}
			}
		}
	}

	if ( function_exists( 'nocache_headers' ) ) {
		nocache_headers();
	}
	header( 'Content-Type: text/html; charset=UTF-8' );
	?>
	<!doctype html>
	<html lang="es">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title><?php echo esc_html__( 'Buscar certificado', 'resultados-deportivos' ); ?></title>
		<style>
			body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 620px; margin: 40px auto; padding: 0 20px; color: #222; }
			h1 { font-size: 1.25rem; color: #14213d; }
			ul { padding-left: 0; list-style: none; margin: 1.5rem 0; }
			li { padding: 0.85rem 0; border-bottom: 1px solid #e2e2e2; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
			.rd-cert-btn { background: #14213d; color: #fff; text-decoration: none; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; white-space: nowrap; }
			.rd-cert-btn:hover { background: #0a1226; }
			.rd-cert-back { display: inline-block; margin-top: 1.5rem; color: #14213d; }
		</style>
	</head>
	<body>
		<h1><?php echo esc_html( $evento ); ?> — <?php echo esc_html__( 'resultados de tu búsqueda', 'resultados-deportivos' ); ?></h1>
		<?php if ( empty( $matches ) ) : ?>
			<p><?php echo esc_html( sprintf( /* translators: %s: texto buscado */ __( 'No encontramos a nadie con "%s". Revisa cómo está escrito tu nombre o tu número de dorsal e intenta de nuevo.', 'resultados-deportivos' ), $query ) ); ?></p>
		<?php else : ?>
			<ul>
				<?php foreach ( $matches as $m ) :
					$url = add_query_arg(
						array(
							'action'  => 'rd_certificado',
							'post_id' => $post_id,
							'bib'     => $m['bib'],
							'nombre'  => rawurlencode( $m['nombre'] ),
						),
						admin_url( 'admin-post.php' )
					);
					?>
					<li>
						<span><?php echo esc_html( $m['nombre'] ); ?><?php echo $m['bib'] ? ' · ' . esc_html__( 'Dorsal', 'resultados-deportivos' ) . ' ' . esc_html( $m['bib'] ) : ''; ?></span>
						<a class="rd-cert-btn" href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener"><?php echo esc_html__( 'Imprimir certificado', 'resultados-deportivos' ); ?></a>
					</li>
				<?php endforeach; ?>
			</ul>
		<?php endif; ?>
		<a class="rd-cert-back" href="javascript:history.back()">&larr; <?php echo esc_html__( 'Volver a buscar', 'resultados-deportivos' ); ?></a>
	</body>
	</html>
	<?php
	exit;
}
add_action( 'admin_post_rd_certificado_buscar', 'rd_cert_handle_search' );
add_action( 'admin_post_nopriv_rd_certificado_buscar', 'rd_cert_handle_search' );

/**
 * Shortcode [certificado_deportivo]: formulario público donde el
 * competidor elige el evento (de entre los que ya tienen Race ID o
 * Series ID de Webscorer configurado) y escribe su dorsal o su nombre.
 */
add_shortcode( 'certificado_deportivo', function( $atts ) {
	$atts = shortcode_atts( array(
		'titulo' => 'Descarga tu certificado de participación',
	), $atts, 'certificado_deportivo' );

	$todos = get_posts( array(
		'post_type'      => 'rd_resultado',
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		'orderby'        => 'title',
		'order'          => 'ASC',
	) );

	$posts = array();
	foreach ( $todos as $p ) {
		$rid = get_post_meta( $p->ID, '_rd_ws_raceid', true );
		$sid = get_post_meta( $p->ID, '_rd_ws_seriesid', true );
		if ( '' !== trim( (string) $rid ) || '' !== trim( (string) $sid ) ) {
			$posts[] = $p;
		}
	}

	if ( empty( $posts ) ) {
		return '<p>Todavía no hay certificados disponibles.</p>';
	}

	wp_enqueue_style( 'rd-style' );

	ob_start();
	?>
	<div class="rd-cert-form-wrap">
		<?php if ( ! empty( $atts['titulo'] ) ) : ?>
			<h3 class="rd-cert-form-title"><?php echo esc_html( $atts['titulo'] ); ?></h3>
		<?php endif; ?>
		<form class="rd-cert-form" method="get" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" target="_blank">
			<input type="hidden" name="action" value="rd_certificado_buscar">
			<p>
				<label for="rd-cert-evento-<?php echo esc_attr( $atts['titulo'] ); ?>"><strong>Evento</strong></label><br>
				<select name="post_id" id="rd-cert-evento" required>
					<?php foreach ( $posts as $p ) :
						$tipo_p  = rd_get_tipo( $p->ID );
						$fecha_p = get_post_meta( $p->ID, '_rd_fecha', true );
						$etiqueta = get_the_title( $p );
						if ( $fecha_p ) {
							$etiqueta .= ' (' . date_i18n( 'd/m/Y', strtotime( $fecha_p ) ) . ')';
						}
						if ( 'acumulado' === $tipo_p ) {
							$etiqueta .= ' — Acumulado';
						}
						?>
						<option value="<?php echo esc_attr( $p->ID ); ?>"><?php echo esc_html( $etiqueta ); ?></option>
					<?php endforeach; ?>
				</select>
			</p>
			<p>
				<label for="rd-cert-q"><strong>Tu dorsal o tu nombre</strong></label><br>
				<input type="text" id="rd-cert-q" name="q" required placeholder="Ej. 245 o Juan Pérez">
			</p>
			<p>
				<button type="submit" class="rd-cert-submit">Buscar mi certificado</button>
			</p>
		</form>
	</div>
	<?php
	return ob_get_clean();
} );
