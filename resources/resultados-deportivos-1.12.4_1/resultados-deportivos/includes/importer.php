<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pantalla "Resultados Deportivos > Importar de Webscorer": muestra el
 * catálogo de carreras de la cuenta de Webscorer configurada (vía
 * /json/mypostedraces). Es un flujo de dos pasos: 1) se marcan las carreras
 * que se quieren traer, 2) se revisan en una sola pantalla (con campos para
 * Lugar y Descripción) y se publican de un jalón, en vez de crearlas como
 * borrador y tener que abrir cada una por separado para completarla y
 * publicarla.
 */
add_action( 'admin_menu', function() {
	add_submenu_page(
		'edit.php?post_type=rd_resultado',
		'Importar de Webscorer',
		'Importar de Webscorer',
		'manage_options',
		'rd-importar-webscorer',
		'rd_render_importer_page'
	);
} );

/**
 * Arma un mapa RaceId => post_id de los resultados que ya existen en
 * WordPress, para no ofrecer importar de nuevo lo que ya está y para
 * marcarlo en la tabla.
 */
function rd_ws_get_imported_raceids() {
	$posts = get_posts( array(
		'post_type'      => 'rd_resultado',
		'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
		'posts_per_page' => -1,
		'meta_query'     => array(
			array(
				'key'     => '_rd_ws_raceid',
				'compare' => 'EXISTS',
			),
		),
		'fields'         => 'ids',
	) );

	$map = array();
	foreach ( $posts as $post_id ) {
		$raceid = get_post_meta( $post_id, '_rd_ws_raceid', true );
		if ( '' !== trim( (string) $raceid ) ) {
			$map[ (string) $raceid ] = $post_id;
		}
	}
	return $map;
}

/**
 * Convierte la fecha de Webscorer (ej. "Aug 30, 2026") a formato Y-m-d,
 * o '' si no se puede interpretar.
 */
function rd_ws_parse_date( $ws_date ) {
	$ts = strtotime( (string) $ws_date );
	return $ts ? gmdate( 'Y-m-d', $ts ) : '';
}

/**
 * Da de alta el término de año correspondiente (creándolo si hace falta)
 * y lo asigna al resultado. Devuelve el term_id usado, o 0 si falló.
 */
function rd_ws_asignar_anio( $post_id, $anio ) {
	$anio = trim( (string) $anio );
	if ( '' === $anio ) {
		return 0;
	}

	$term    = term_exists( $anio, 'rd_anio' );
	$term_id = 0;

	if ( is_array( $term ) && isset( $term['term_id'] ) ) {
		$term_id = (int) $term['term_id'];
	} elseif ( is_numeric( $term ) ) {
		$term_id = (int) $term;
	}

	if ( ! $term_id ) {
		$nuevo = wp_insert_term( $anio, 'rd_anio' );
		if ( ! is_wp_error( $nuevo ) && isset( $nuevo['term_id'] ) ) {
			$term_id = (int) $nuevo['term_id'];
		}
	}

	if ( $term_id ) {
		wp_set_object_terms( $post_id, $term_id, 'rd_anio' );
	}

	return $term_id;
}

/**
 * Crea el post "Resultado" para una carrera de Webscorer con los datos ya
 * conocidos del catálogo, más el Lugar/Descripción capturados en la pantalla
 * de revisión. Devuelve el post_id creado, o 0 si falló.
 *
 * @param array  $race        Datos de la carrera tal como vienen de /json/mypostedraces.
 * @param string $raceid      Race ID de Webscorer.
 * @param string $lugar       Lugar del evento (ya sanitizado).
 * @param string $descripcion Descripción del evento (ya sanitizada).
 * @param string $post_status 'publish' o 'draft'.
 */
function rd_ws_crear_resultado_desde_race( $race, $raceid, $lugar, $descripcion, $post_status ) {
	$post_id = wp_insert_post( array(
		'post_type'   => 'rd_resultado',
		'post_status' => $post_status,
		'post_title'  => ! empty( $race['Name'] ) ? sanitize_text_field( $race['Name'] ) : ( 'Carrera ' . $raceid ),
	) );

	if ( ! $post_id || is_wp_error( $post_id ) ) {
		return 0;
	}

	update_post_meta( $post_id, '_rd_tipo', 'individual' );
	update_post_meta( $post_id, '_rd_ws_raceid', $raceid );

	if ( '' !== $lugar ) {
		update_post_meta( $post_id, '_rd_lugar', $lugar );
	}
	if ( '' !== $descripcion ) {
		update_post_meta( $post_id, '_rd_descripcion', $descripcion );
	}

	$fecha = ! empty( $race['Date'] ) ? rd_ws_parse_date( $race['Date'] ) : '';
	if ( $fecha ) {
		update_post_meta( $post_id, '_rd_fecha', $fecha );
		rd_ws_asignar_anio( $post_id, gmdate( 'Y', strtotime( $fecha ) ) );
	}

	if ( ! empty( $race['DisplayURL'] ) ) {
		update_post_meta( $post_id, '_rd_url', esc_url_raw( $race['DisplayURL'] ) );

		// Arma también el código iframe (el mismo patrón que ya se usaba
		// pegándolo a mano), como respaldo por si la API llega a fallar. El
		// Race ID de la API sigue teniendo prioridad al mostrarlo.
		$separador   = ( false === strpos( $race['DisplayURL'], '?' ) ) ? '?' : '&';
		$iframe_src  = $race['DisplayURL'] . $separador . 'embed=2';
		$iframe_html = '<iframe id="wshost" width="990" height="1200" src="' . esc_url( $iframe_src ) . '"></iframe>';
		update_post_meta( $post_id, '_rd_iframe', rd_sanitize_iframe_embed( $iframe_html ) );
	}

	return $post_id;
}

function rd_render_importer_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$refrescar = ! empty( $_GET['rd_ws_refresh'] );
	$data      = rd_ws_fetch_myposted_races( $refrescar );
	$races     = ( empty( $data['error'] ) && isset( $data['ResultList'] ) && is_array( $data['ResultList'] ) )
		? $data['ResultList']
		: array();

	// Más recientes primero, sin depender del orden que entregue la API.
	usort( $races, function( $a, $b ) {
		$ta = isset( $a['Date'] ) ? strtotime( $a['Date'] ) : 0;
		$tb = isset( $b['Date'] ) ? strtotime( $b['Date'] ) : 0;
		return $tb <=> $ta;
	} );

	$races_by_id = array();
	foreach ( $races as $race ) {
		if ( isset( $race['RaceId'] ) ) {
			$races_by_id[ (string) $race['RaceId'] ] = $race;
		}
	}

	$mensaje       = '';
	$paso          = 'lista'; // 'lista' (elegir carreras) o 'revisar' (completar y publicar).
	$para_revisar  = array(); // Race IDs a mostrar en el paso de revisión.
	$ya_importadas = rd_ws_get_imported_raceids();

	// --- Paso final: se envió el formulario de revisión -> crear/publicar los posts.
	if ( isset( $_POST['rd_publish_nonce'] ) && wp_verify_nonce( $_POST['rd_publish_nonce'], 'rd_publish_races' ) ) {
		$raceids       = isset( $_POST['rd_raceid'] ) && is_array( $_POST['rd_raceid'] )
			? array_map( 'sanitize_text_field', wp_unslash( $_POST['rd_raceid'] ) )
			: array();
		$lugares       = isset( $_POST['rd_lugar'] ) && is_array( $_POST['rd_lugar'] ) ? wp_unslash( $_POST['rd_lugar'] ) : array();
		$descripciones = isset( $_POST['rd_descripcion'] ) && is_array( $_POST['rd_descripcion'] ) ? wp_unslash( $_POST['rd_descripcion'] ) : array();
		$como_borrador = ! empty( $_POST['rd_guardar_borrador'] );
		$post_status   = $como_borrador ? 'draft' : 'publish';

		$creados = array();

		foreach ( $raceids as $i => $raceid ) {
			// Se ignora si ya se había importado, o si el raceid no viene en
			// los datos que acabamos de traer de Webscorer (evita dar de alta
			// algo con datos inventados/alterados).
			if ( isset( $ya_importadas[ $raceid ] ) || ! isset( $races_by_id[ $raceid ] ) ) {
				continue;
			}

			$lugar       = isset( $lugares[ $i ] ) ? sanitize_text_field( $lugares[ $i ] ) : '';
			$descripcion = isset( $descripciones[ $i ] ) ? sanitize_textarea_field( $descripciones[ $i ] ) : '';

			$post_id = rd_ws_crear_resultado_desde_race( $races_by_id[ $raceid ], $raceid, $lugar, $descripcion, $post_status );
			if ( $post_id ) {
				$creados[] = $post_id;
			}
		}

		if ( ! empty( $creados ) ) {
			$enlaces = array_map( function( $post_id ) {
				return '<a href="' . esc_url( get_edit_post_link( $post_id ) ) . '">' . esc_html( get_the_title( $post_id ) ) . '</a>';
			}, $creados );
			$mensaje = count( $creados ) . ' resultado(s) ' . ( $como_borrador ? 'guardado(s) como borrador' : 'publicado(s)' ) . ': ' . implode( ', ', $enlaces ) . '.';
		} else {
			$mensaje = 'No se creó nada nuevo (puede que ya estuvieran importadas).';
		}

		// Refrescar el mapa para que la lista de abajo ya las marque como importadas.
		$ya_importadas = rd_ws_get_imported_raceids();
	}
	// --- Paso 1 -> 2: se seleccionaron carreras en la lista -> mostrar pantalla de revisión.
	elseif ( isset( $_POST['rd_review_nonce'] ) && wp_verify_nonce( $_POST['rd_review_nonce'], 'rd_review_races' ) ) {
		$seleccionadas = isset( $_POST['rd_import_race'] ) && is_array( $_POST['rd_import_race'] )
			? array_map( 'sanitize_text_field', wp_unslash( $_POST['rd_import_race'] ) )
			: array();

		foreach ( $seleccionadas as $raceid ) {
			if ( ! isset( $ya_importadas[ $raceid ] ) && isset( $races_by_id[ $raceid ] ) ) {
				$para_revisar[] = $raceid;
			}
		}

		if ( ! empty( $para_revisar ) ) {
			$paso = 'revisar';
		} else {
			$mensaje = 'No se seleccionó ninguna carrera nueva para revisar (puede que ya estuvieran importadas).';
		}
	}
	?>
	<div class="wrap">
		<h1>Importar carreras de Webscorer</h1>

		<?php if ( 'revisar' === $paso ) : ?>

			<p class="description">
				Revisa el nombre y la fecha, agrega Lugar/Descripción si quieres, y publica de una vez — ya no hace falta abrir cada resultado por separado para completarlo y publicarlo.
			</p>

			<form method="post">
				<?php wp_nonce_field( 'rd_publish_races', 'rd_publish_nonce' ); ?>

				<table class="widefat striped">
					<thead>
						<tr>
							<th>Nombre</th>
							<th style="width:110px;">Fecha</th>
							<th style="width:220px;">Lugar</th>
							<th>Descripción</th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $para_revisar as $raceid ) :
							$race = $races_by_id[ $raceid ];
							?>
							<tr>
								<td>
									<input type="hidden" name="rd_raceid[]" value="<?php echo esc_attr( $raceid ); ?>">
									<strong><?php echo esc_html( isset( $race['Name'] ) ? $race['Name'] : ( 'Carrera ' . $raceid ) ); ?></strong>
								</td>
								<td><?php echo esc_html( isset( $race['Date'] ) ? $race['Date'] : '' ); ?></td>
								<td>
									<input type="text" name="rd_lugar[]" placeholder="Ej. Torreón, Coahuila" style="width:100%;">
								</td>
								<td>
									<textarea name="rd_descripcion[]" rows="2" style="width:100%;"></textarea>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>

				<p class="submit">
					<button type="submit" class="button button-primary">Publicar <?php echo (int) count( $para_revisar ); ?> resultado(s)</button>
					<label style="margin-left:1.5rem;font-weight:normal;">
						<input type="checkbox" name="rd_guardar_borrador" value="1"> Guardar como borrador en vez de publicar
					</label>
					<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=rd_resultado&page=rd-importar-webscorer' ) ); ?>" class="button" style="margin-left:1.5rem;">Cancelar y volver a la lista</a>
				</p>
			</form>

		<?php else : ?>

			<p class="description">
				Trae el catálogo de carreras de tu cuenta de Webscorer para no tener que copiar nada a mano. Marca las que quieras traer, revísalas en una sola pantalla (nombre, fecha, lugar, descripción) y publícalas de un jalón.
			</p>

			<?php if ( $mensaje ) : ?>
				<div class="notice notice-success"><p><?php echo wp_kses_post( $mensaje ); ?></p></div>
			<?php endif; ?>

			<?php if ( ! empty( $data['error'] ) ) : ?>
				<div class="notice notice-error"><p><?php echo esc_html( $data['error'] ); ?></p></div>
				<p><a href="<?php echo esc_url( admin_url( 'edit.php?post_type=rd_resultado&page=rd-ajustes' ) ); ?>">Ir a Ajustes para revisar el API ID y el Token</a></p>
			<?php else : ?>
				<p>
					<?php echo esc_html( count( $races ) ); ?> carreras encontradas en tu cuenta de Webscorer.
					<a href="<?php echo esc_url( add_query_arg( 'rd_ws_refresh', '1' ) ); ?>">🔄 Actualizar lista</a>
				</p>

				<?php if ( empty( $races ) ) : ?>
					<p>No se encontraron carreras publicadas en tu cuenta de Webscorer.</p>
				<?php else : ?>
					<form method="post">
						<?php wp_nonce_field( 'rd_review_races', 'rd_review_nonce' ); ?>

						<p>
							<button type="button" class="button" id="rd-seleccionar-todo">Seleccionar todo</button>
							<button type="button" class="button" id="rd-deseleccionar-todo">Quitar selección</button>
							<button type="submit" class="button button-primary">Revisar y publicar seleccionadas</button>
						</p>

						<table class="widefat striped">
							<thead>
								<tr>
									<th style="width:32px;"></th>
									<th>Nombre</th>
									<th>Fecha</th>
									<th>Deporte</th>
									<th>Visibilidad</th>
									<th>Estado en el sitio</th>
								</tr>
							</thead>
							<tbody>
								<?php foreach ( $races as $race ) :
									$raceid = isset( $race['RaceId'] ) ? (string) $race['RaceId'] : '';
									if ( '' === $raceid ) {
										continue;
									}
									$ya = isset( $ya_importadas[ $raceid ] );
									?>
									<tr>
										<td>
											<?php if ( $ya ) : ?>
												<input type="checkbox" disabled>
											<?php else : ?>
												<input type="checkbox" class="rd-import-checkbox" name="rd_import_race[]" value="<?php echo esc_attr( $raceid ); ?>">
											<?php endif; ?>
										</td>
										<td><?php echo esc_html( isset( $race['Name'] ) ? $race['Name'] : '' ); ?></td>
										<td><?php echo esc_html( isset( $race['Date'] ) ? $race['Date'] : '' ); ?></td>
										<td><?php echo esc_html( isset( $race['Sport'] ) ? $race['Sport'] : '' ); ?></td>
										<td><?php echo empty( $race['Public'] ) ? '<span style="color:#a33;">Privada</span>' : 'Pública'; ?></td>
										<td>
											<?php if ( $ya ) : ?>
												✅ Ya importado — <a href="<?php echo esc_url( get_edit_post_link( $ya_importadas[ $raceid ] ) ); ?>">editar</a>
											<?php else : ?>
												—
											<?php endif; ?>
										</td>
									</tr>
								<?php endforeach; ?>
							</tbody>
						</table>

						<p class="submit">
							<button type="submit" class="button button-primary">Revisar y publicar seleccionadas</button>
						</p>
					</form>

					<script>
					( function() {
						var marcarTodo = function ( valor ) {
							document.querySelectorAll( '.rd-import-checkbox' ).forEach( function ( c ) {
								c.checked = valor;
							} );
						};
						var btnTodo = document.getElementById( 'rd-seleccionar-todo' );
						var btnNinguno = document.getElementById( 'rd-deseleccionar-todo' );
						if ( btnTodo ) {
							btnTodo.addEventListener( 'click', function () { marcarTodo( true ); } );
						}
						if ( btnNinguno ) {
							btnNinguno.addEventListener( 'click', function () { marcarTodo( false ); } );
						}
					} )();
					</script>
				<?php endif; ?>
			<?php endif; ?>

		<?php endif; ?>
	</div>
	<?php
}
