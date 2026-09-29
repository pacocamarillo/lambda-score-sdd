<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Integración con la API JSON de Webscorer: permite mostrar los resultados
 * de una carrera individual (identificada por su "Race ID") en una tabla
 * con el estilo del sitio, en vez de un iframe. Requiere que el API ID y
 * el Token de Webscorer estén configurados en Resultados Deportivos > Ajustes,
 * y una suscripción PRO Results activa en la cuenta de Webscorer.
 */

/**
 * Consulta (con caché) los resultados de una carrera vía la API JSON de
 * Webscorer (endpoint /json/race). Devuelve el arreglo decodificado tal
 * cual lo entrega Webscorer, o array( 'error' => '...' ) si algo falla.
 */
function rd_ws_fetch_race( $raceid ) {
	$raceid = trim( (string) $raceid );
	if ( '' === $raceid ) {
		return array( 'error' => 'No se configuró un Race ID de Webscorer.' );
	}

	$apiid   = trim( (string) get_option( 'rd_ws_apiid', '' ) );
	$apipriv = trim( (string) get_option( 'rd_ws_apipriv', '' ) );

	if ( '' === $apiid || '' === $apipriv ) {
		return array( 'error' => 'Falta configurar el API ID y el Token de Webscorer en Resultados Deportivos > Ajustes.' );
	}

	$cache_key = 'rd_ws_race_' . md5( $raceid . '|' . $apiid );
	$cached    = get_transient( $cache_key );
	if ( false !== $cached ) {
		return $cached;
	}

	$url = add_query_arg(
		array(
			'raceid'  => rawurlencode( $raceid ),
			'apiid'   => rawurlencode( $apiid ),
			'apipriv' => rawurlencode( $apipriv ),
		),
		'https://www.webscorer.com/json/race'
	);

	$response = wp_remote_get( $url, array( 'timeout' => 15 ) );

	if ( is_wp_error( $response ) ) {
		// Error de red: se cachea poco tiempo para poder recuperarse rápido.
		$result = array( 'error' => 'No se pudo conectar con Webscorer: ' . $response->get_error_message() );
		set_transient( $cache_key, $result, 2 * MINUTE_IN_SECONDS );
		return $result;
	}

	$code = (int) wp_remote_retrieve_response_code( $response );
	$body = wp_remote_retrieve_body( $response );
	$data = json_decode( $body, true );

	if ( 200 !== $code || ! is_array( $data ) ) {
		$result = array( 'error' => 'Webscorer respondió con un error (código ' . $code . ').' );
		set_transient( $cache_key, $result, 2 * MINUTE_IN_SECONDS );
		return $result;
	}

	if ( ! empty( $data['Error'] ) ) {
		$result = array( 'error' => 'Webscorer: ' . sanitize_text_field( $data['Error'] ) );
		set_transient( $cache_key, $result, 2 * MINUTE_IN_SECONDS );
		return $result;
	}

	// Respuesta válida: se cachea poco tiempo (la carrera puede estar en
	// vivo) para no golpear la API en cada visita a la página.
	set_transient( $cache_key, $data, 5 * MINUTE_IN_SECONDS );

	return $data;
}

/**
 * Consulta (con caché) el catálogo completo de carreras posteadas en la
 * cuenta de Webscorer configurada (endpoint /json/mypostedraces). Se usa
 * en la pantalla de importación para no tener que copiar cada Race ID a
 * mano. Devuelve el arreglo decodificado, o array( 'error' => '...' ).
 *
 * @param bool $force_refresh Si es true, ignora la caché y vuelve a consultar.
 */
function rd_ws_fetch_myposted_races( $force_refresh = false ) {
	$apiid   = trim( (string) get_option( 'rd_ws_apiid', '' ) );
	$apipriv = trim( (string) get_option( 'rd_ws_apipriv', '' ) );

	if ( '' === $apiid || '' === $apipriv ) {
		return array( 'error' => 'Falta configurar el API ID y el Token de Webscorer en Resultados Deportivos > Ajustes.' );
	}

	$cache_key = 'rd_ws_myraces_' . md5( $apiid );

	if ( $force_refresh ) {
		delete_transient( $cache_key );
	} else {
		$cached = get_transient( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}
	}

	$url = add_query_arg(
		array(
			'apiid'   => rawurlencode( $apiid ),
			'apipriv' => rawurlencode( $apipriv ),
		),
		'https://www.webscorer.com/json/mypostedraces'
	);

	$response = wp_remote_get( $url, array( 'timeout' => 20 ) );

	if ( is_wp_error( $response ) ) {
		return array( 'error' => 'No se pudo conectar con Webscorer: ' . $response->get_error_message() );
	}

	$code = (int) wp_remote_retrieve_response_code( $response );
	$body = wp_remote_retrieve_body( $response );
	$data = json_decode( $body, true );

	if ( 200 !== $code || ! is_array( $data ) ) {
		return array( 'error' => 'Webscorer respondió con un error (código ' . $code . ').' );
	}

	if ( ! empty( $data['Error'] ) ) {
		return array( 'error' => 'Webscorer: ' . sanitize_text_field( $data['Error'] ) );
	}

	// La lista completa de carreras cambia poco de un minuto a otro, así
	// que se cachea un rato más que los resultados de una carrera en vivo.
	set_transient( $cache_key, $data, 10 * MINUTE_IN_SECONDS );

	return $data;
}

/**
 * Consulta (con caché) los resultados de un acumulado/serie vía la API JSON
 * de Webscorer (endpoint /json/seriesresult). Devuelve el arreglo decodificado
 * tal cual lo entrega Webscorer, o array( 'error' => '...' ) si algo falla.
 */
function rd_ws_fetch_series( $seriesid ) {
	$seriesid = trim( (string) $seriesid );
	if ( '' === $seriesid ) {
		return array( 'error' => 'No se configuró un Series ID de Webscorer.' );
	}

	$apiid   = trim( (string) get_option( 'rd_ws_apiid', '' ) );
	$apipriv = trim( (string) get_option( 'rd_ws_apipriv', '' ) );

	if ( '' === $apiid || '' === $apipriv ) {
		return array( 'error' => 'Falta configurar el API ID y el Token de Webscorer en Resultados Deportivos > Ajustes.' );
	}

	$cache_key = 'rd_ws_series_' . md5( $seriesid . '|' . $apiid );
	$cached    = get_transient( $cache_key );
	if ( false !== $cached ) {
		return $cached;
	}

	$url = add_query_arg(
		array(
			'seriesid' => rawurlencode( $seriesid ),
			'apiid'    => rawurlencode( $apiid ),
			'apipriv'  => rawurlencode( $apipriv ),
		),
		'https://www.webscorer.com/json/seriesresult'
	);

	$response = wp_remote_get( $url, array( 'timeout' => 15 ) );

	if ( is_wp_error( $response ) ) {
		// Error de red: se cachea poco tiempo para poder recuperarse rápido.
		$result = array( 'error' => 'No se pudo conectar con Webscorer: ' . $response->get_error_message() );
		set_transient( $cache_key, $result, 2 * MINUTE_IN_SECONDS );
		return $result;
	}

	$code = (int) wp_remote_retrieve_response_code( $response );
	$body = wp_remote_retrieve_body( $response );
	$data = json_decode( $body, true );

	if ( 200 !== $code || ! is_array( $data ) ) {
		$result = array( 'error' => 'Webscorer respondió con un error (código ' . $code . ').' );
		set_transient( $cache_key, $result, 2 * MINUTE_IN_SECONDS );
		return $result;
	}

	if ( ! empty( $data['Error'] ) ) {
		$result = array( 'error' => 'Webscorer: ' . sanitize_text_field( $data['Error'] ) );
		set_transient( $cache_key, $result, 2 * MINUTE_IN_SECONDS );
		return $result;
	}

	// Respuesta válida: se cachea unos minutos para no golpear la API en
	// cada visita a la página.
	set_transient( $cache_key, $data, 5 * MINUTE_IN_SECONDS );

	return $data;
}

/**
 * Barra superior con: 1) los filtros "Ganadores" / "Top 3" / "Resultados
 * completos" (igual que en las páginas normales de resultados de Webscorer),
 * y 2) cuando hay más de una categoría, los enlaces "Expandir todas" /
 * "Contraer todas" para plegar/desplegar todas de un jalón (cada categoría
 * también se puede abrir o cerrar por separado dando clic en su título).
 *
 * @param bool $incluir_expandir_colapsar Si se debe incluir el segundo grupo
 *                                         de botones (solo tiene sentido con
 *                                         más de una categoría).
 */
function rd_ws_render_toolbar( $incluir_expandir_colapsar ) {
	?>
	<div class="rd-ws-toolbar">
		<div class="rd-ws-toolbar-group" role="group" aria-label="Filtrar resultados">
			<button type="button" class="rd-ws-filter-btn" data-rd-ws-filter="winners">Ganadores</button>
			<button type="button" class="rd-ws-filter-btn" data-rd-ws-filter="top3">Top 3</button>
			<button type="button" class="rd-ws-filter-btn is-active" data-rd-ws-filter="all">Resultados completos</button>
		</div>
		<?php if ( $incluir_expandir_colapsar ) : ?>
			<div class="rd-ws-toolbar-group">
				<button type="button" class="rd-ws-toggle-all" data-rd-ws-action="expand">Expandir todas</button>
				<button type="button" class="rd-ws-toggle-all" data-rd-ws-action="collapse">Contraer todas</button>
			</div>
		<?php endif; ?>
	</div>
	<?php
}

/**
 * Convierte la respuesta de rd_ws_fetch_series() en una tabla HTML agrupada
 * por categoría, con el estilo del plugin. Cada categoría se puede plegar o
 * desplegar (y todas a la vez si hay más de una). Cada corredor incluye
 * además un detalle desplegable ("Ver carreras") con el desglose carrera por
 * carrera. Devuelve '' si $data trae un error (el llamador debe usar el
 * iframe/enlace como respaldo en ese caso).
 *
 * @param array $data    Respuesta de rd_ws_fetch_series().
 * @param int   $post_id ID del "Resultado" (rd_resultado) al que pertenece,
 *                        usado para armar el enlace "Imprimir certificado"
 *                        de cada corredor. Si es 0, esa columna no aparece.
 */
function rd_ws_render_series_table( $data, $post_id = 0 ) {
	if ( ! empty( $data['error'] ) ) {
		return '';
	}

	$results = isset( $data['Results'] ) && is_array( $data['Results'] ) ? $data['Results'] : array();

	$grupos_validos = array();
	foreach ( $results as $group ) {
		$racers = isset( $group['Racers'] ) && is_array( $group['Racers'] ) ? $group['Racers'] : array();
		if ( ! empty( $racers ) ) {
			$grupos_validos[] = $group;
		}
	}

	if ( empty( $grupos_validos ) ) {
		return '<p>Todavía no hay resultados publicados para este acumulado.</p>';
	}

	ob_start();

	rd_ws_render_toolbar( count( $grupos_validos ) > 1 );

	foreach ( $grupos_validos as $group ) {
		$grouping = isset( $group['Grouping'] ) && is_array( $group['Grouping'] ) ? $group['Grouping'] : array();
		$racers   = $group['Racers'];

		$label = isset( $grouping['Category'] ) ? $grouping['Category'] : '';

		$hay_equipo = false;
		foreach ( $racers as $racer ) {
			if ( ! empty( $racer['TeamName'] ) ) {
				$hay_equipo = true;
				break;
			}
		}
		?>
		<details class="rd-ws-group" open>
			<summary class="rd-ws-group-title">
				<span><?php echo $label ? esc_html( $label ) : 'Resultados'; ?></span>
				<span class="rd-ws-group-icon" aria-hidden="true">▾</span>
			</summary>
			<div class="rd-ws-table-wrap">
				<table class="rd-ws-table">
					<thead>
						<tr>
							<th>Lugar</th>
							<th>Nombre</th>
							<?php if ( $hay_equipo ) : ?><th>Equipo</th><?php endif; ?>
							<th>Carreras</th>
							<th>Puntos</th>
							<th>Detalle</th>
							<?php if ( $post_id ) : ?><th>Certificado</th><?php endif; ?>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $racers as $racer ) :
							$carreras  = isset( $racer['Races'] ) && is_array( $racer['Races'] ) ? $racer['Races'] : array();
							$puntos    = isset( $racer['TotalPoints'] ) && '' !== $racer['TotalPoints']
								? $racer['TotalPoints']
								: ( isset( $racer['TotalTime'] ) ? $racer['TotalTime'] : '' );
							$lugar_raw = isset( $racer['Place'] ) ? $racer['Place'] : '';
							$lugar_num = is_numeric( $lugar_raw ) ? (int) $lugar_raw : null;
							$es_top3   = ( null !== $lugar_num && $lugar_num >= 1 && $lugar_num <= 3 );
							$nombre    = isset( $racer['Name'] ) ? $racer['Name'] : '';
							?>
							<tr data-rd-place="<?php echo esc_attr( $lugar_raw ); ?>"<?php echo $es_top3 ? ' class="rd-ws-top3"' : ''; ?>>
								<td><?php echo esc_html( $lugar_raw ); ?></td>
								<td><?php echo esc_html( $nombre ); ?></td>
								<?php if ( $hay_equipo ) : ?>
									<td><?php echo esc_html( isset( $racer['TeamName'] ) ? $racer['TeamName'] : '' ); ?></td>
								<?php endif; ?>
								<td><?php echo esc_html( isset( $racer['RacesCounted'] ) ? $racer['RacesCounted'] : '' ); ?></td>
								<td><?php echo esc_html( $puntos ); ?></td>
								<?php if ( $post_id ) :
									$cert_url = '';
									if ( '' !== $nombre ) {
										$cert_url = add_query_arg(
											array(
												'action'  => 'rd_certificado',
												'post_id' => $post_id,
												'nombre'  => rawurlencode( $nombre ),
											),
											admin_url( 'admin-post.php' )
										);
									}
									?>
									<td>
										<?php if ( $cert_url ) : ?>
											<a class="rd-cert-link" href="<?php echo esc_url( $cert_url ); ?>" target="_blank" rel="noopener">Imprimir certificado</a>
										<?php else : ?>
											—
										<?php endif; ?>
									</td>
								<?php endif; ?>
								<td>
									<?php if ( ! empty( $carreras ) ) : ?>
										<details class="rd-ws-detalle">
											<summary>Ver carreras</summary>
											<table class="rd-ws-subtable">
												<thead>
													<tr>
														<th>Etapa</th>
														<th>Lugar</th>
														<th>Puntos</th>
														<th>Tiempo</th>
													</tr>
												</thead>
												<tbody>
													<?php foreach ( $carreras as $carrera ) :
														$nombre_etapa = isset( $carrera['RaceName'] ) ? $carrera['RaceName'] : ( isset( $carrera['RaceNumber'] ) ? ( 'Carrera ' . $carrera['RaceNumber'] ) : '' );
														$enlace_etapa = '';
														if ( ! empty( $carrera['RaceDisplayUrl'] ) ) {
															$ruta         = $carrera['RaceDisplayUrl'];
															$enlace_etapa = ( 0 === strpos( $ruta, 'http' ) ) ? $ruta : ( 'https://www.webscorer.com' . $ruta );
														}
														?>
														<tr>
															<td>
																<?php if ( $enlace_etapa ) : ?>
																	<a href="<?php echo esc_url( $enlace_etapa ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $nombre_etapa ); ?></a>
																<?php else : ?>
																	<?php echo esc_html( $nombre_etapa ); ?>
																<?php endif; ?>
															</td>
															<td><?php echo esc_html( isset( $carrera['Place'] ) ? $carrera['Place'] : '' ); ?></td>
															<td><?php echo esc_html( isset( $carrera['Points'] ) ? $carrera['Points'] : '' ); ?></td>
															<td><?php echo esc_html( isset( $carrera['Time'] ) ? $carrera['Time'] : '' ); ?></td>
														</tr>
													<?php endforeach; ?>
												</tbody>
											</table>
										</details>
									<?php else : ?>
										—
									<?php endif; ?>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</div>
		</details>
		<?php
	}
	return trim( (string) ob_get_clean() );
}

/**
 * Convierte la respuesta de rd_ws_fetch_race() en una tabla HTML agrupada
 * por categoría, con el estilo del plugin. Cada categoría se puede plegar o
 * desplegar (y todas a la vez si hay más de una). Devuelve '' si $data trae
 * un error (el llamador debe usar el iframe/enlace como respaldo en ese caso).
 *
 * @param array $data    Respuesta de rd_ws_fetch_race().
 * @param int   $post_id ID del "Resultado" (rd_resultado) al que pertenece,
 *                        usado para armar el enlace "Imprimir certificado"
 *                        de cada corredor. Si es 0, esa columna no aparece.
 */
function rd_ws_render_race_table( $data, $post_id = 0 ) {
	if ( ! empty( $data['error'] ) ) {
		return '';
	}

	$results = isset( $data['Results'] ) && is_array( $data['Results'] ) ? $data['Results'] : array();

	$grupos_validos = array();
	foreach ( $results as $group ) {
		$racers = isset( $group['Racers'] ) && is_array( $group['Racers'] ) ? $group['Racers'] : array();
		if ( ! empty( $racers ) ) {
			$grupos_validos[] = $group;
		}
	}

	if ( empty( $grupos_validos ) ) {
		return '<p>Todavía no hay resultados publicados para esta carrera.</p>';
	}

	ob_start();

	rd_ws_render_toolbar( count( $grupos_validos ) > 1 );

	foreach ( $grupos_validos as $group ) {
		$grouping = isset( $group['Grouping'] ) && is_array( $group['Grouping'] ) ? $group['Grouping'] : array();
		$racers   = $group['Racers'];

		$distance = isset( $grouping['Distance'] ) ? $grouping['Distance'] : '';
		$category = isset( $grouping['Category'] ) ? $grouping['Category'] : '';
		if ( $distance && $category && $distance !== $category ) {
			$label = $distance . ' · ' . $category;
		} else {
			$label = $category ? $category : $distance;
		}

		$hay_equipo = false;
		// Solo tiene sentido mostrar el desglose por vuelta si la carrera
		// tiene más de una vuelta; con una sola vuelta el tiempo total ya
		// es el mismo dato, así que la columna "Vueltas" no aportaría nada.
		$hay_vueltas = false;
		foreach ( $racers as $racer ) {
			if ( ! empty( $racer['TeamName'] ) ) {
				$hay_equipo = true;
			}
			if ( ! empty( $racer['LapTimes'] ) && is_array( $racer['LapTimes'] ) && count( $racer['LapTimes'] ) > 1 ) {
				$hay_vueltas = true;
			}
		}
		?>
		<details class="rd-ws-group" open>
			<summary class="rd-ws-group-title">
				<span><?php echo $label ? esc_html( $label ) : 'Resultados'; ?></span>
				<span class="rd-ws-group-icon" aria-hidden="true">▾</span>
			</summary>
			<div class="rd-ws-table-wrap">
				<table class="rd-ws-table">
					<thead>
						<tr>
							<th>Lugar</th>
							<th>Dorsal</th>
							<th>Nombre</th>
							<?php if ( $hay_equipo ) : ?><th>Equipo</th><?php endif; ?>
							<th>Tiempo</th>
							<th>Diferencia</th>
							<?php if ( $post_id ) : ?><th>Certificado</th><?php endif; ?>
							<?php if ( $hay_vueltas ) : ?><th>Vueltas</th><?php endif; ?>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $racers as $racer ) :
							$vueltas         = isset( $racer['LapTimes'] ) && is_array( $racer['LapTimes'] ) ? $racer['LapTimes'] : array();
							$mostrar_vueltas = count( $vueltas ) > 1;
							$lugar_raw       = isset( $racer['Place'] ) ? $racer['Place'] : '';
							$lugar_num       = is_numeric( $lugar_raw ) ? (int) $lugar_raw : null;
							$es_top3         = ( null !== $lugar_num && $lugar_num >= 1 && $lugar_num <= 3 );
							$bib             = isset( $racer['Bib'] ) ? $racer['Bib'] : '';
							$nombre          = isset( $racer['Name'] ) ? $racer['Name'] : '';
							?>
							<tr data-rd-place="<?php echo esc_attr( $lugar_raw ); ?>"<?php echo $es_top3 ? ' class="rd-ws-top3"' : ''; ?>>
								<td><?php echo esc_html( $lugar_raw ); ?></td>
								<td><?php echo esc_html( $bib ); ?></td>
								<td><?php echo esc_html( $nombre ); ?></td>
								<?php if ( $hay_equipo ) : ?>
									<td><?php echo esc_html( isset( $racer['TeamName'] ) ? $racer['TeamName'] : '' ); ?></td>
								<?php endif; ?>
								<td><?php echo esc_html( isset( $racer['Time'] ) ? $racer['Time'] : '' ); ?></td>
								<td><?php echo esc_html( isset( $racer['Difference'] ) ? $racer['Difference'] : '' ); ?></td>
								<?php if ( $post_id ) :
									$cert_url = '';
									if ( '' !== trim( (string) $bib ) || '' !== $nombre ) {
										$cert_url = add_query_arg(
											array(
												'action'  => 'rd_certificado',
												'post_id' => $post_id,
												'bib'     => $bib,
												'nombre'  => rawurlencode( $nombre ),
											),
											admin_url( 'admin-post.php' )
										);
									}
									?>
									<td>
										<?php if ( $cert_url ) : ?>
											<a class="rd-cert-link" href="<?php echo esc_url( $cert_url ); ?>" target="_blank" rel="noopener">Imprimir certificado</a>
										<?php else : ?>
											—
										<?php endif; ?>
									</td>
								<?php endif; ?>
								<?php if ( $hay_vueltas ) : ?>
									<td>
										<?php if ( $mostrar_vueltas ) : ?>
											<details class="rd-ws-detalle">
												<summary>Ver vueltas</summary>
												<table class="rd-ws-subtable">
													<thead>
														<tr>
															<th>Vuelta</th>
															<th>Tiempo</th>
															<th>Lugar en la vuelta</th>
															<th>Tiempo acumulado</th>
															<th>Lugar acumulado</th>
														</tr>
													</thead>
													<tbody>
														<?php foreach ( $vueltas as $vuelta ) : ?>
															<tr>
																<td><?php echo esc_html( isset( $vuelta['LapNumber'] ) ? $vuelta['LapNumber'] : '' ); ?></td>
																<td><?php echo esc_html( isset( $vuelta['LapTime'] ) ? $vuelta['LapTime'] : '' ); ?></td>
																<td><?php echo esc_html( isset( $vuelta['LapRank'] ) ? $vuelta['LapRank'] : '' ); ?></td>
																<td><?php echo esc_html( isset( $vuelta['RaceTime'] ) ? $vuelta['RaceTime'] : '' ); ?></td>
																<td><?php echo esc_html( isset( $vuelta['RaceRank'] ) ? $vuelta['RaceRank'] : '' ); ?></td>
															</tr>
														<?php endforeach; ?>
													</tbody>
												</table>
											</details>
										<?php else : ?>
											—
										<?php endif; ?>
									</td>
								<?php endif; ?>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</div>
		</details>
		<?php
	}
	return trim( (string) ob_get_clean() );
}
