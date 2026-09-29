<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Devuelve la etiqueta de mes (capitalizada, ej. "Agosto") a partir de una
 * fecha en formato Y-m-d, o 'Sin fecha' si no hay fecha capturada.
 */
function rd_mes_label( $fecha ) {
	if ( ! $fecha ) {
		return 'Sin fecha';
	}
	return ucfirst( date_i18n( 'F', strtotime( $fecha ) ) );
}

/**
 * Recorre una lista de resultados ya ordenada y devuelve una nueva lista
 * con encabezados insertados cada vez que cambia la etiqueta que devuelve
 * $label_callback (por ejemplo, el mes). $nested indica si el encabezado
 * debe dibujarse con el estilo "anidado" (usado dentro de los años de la
 * pestaña "Todos").
 */
function rd_insertar_encabezados( $items, $label_callback, $nested = false ) {
	$out    = array();
	$actual = null;
	foreach ( $items as $item ) {
		$label = $label_callback( $item );
		if ( $label !== $actual ) {
			$actual = $label;
			$out[]  = array(
				'is_header' => true,
				'label'     => $label,
				'nested'    => $nested,
			);
		}
		$out[] = $item;
	}
	return $out;
}

/**
 * Indica si un término de la taxonomía "Año" es el término especial
 * "Todos" (el que se usa para juntar todos los años en una sola pestaña).
 */
function rd_is_todos_term( $term ) {
	return 'todos' === strtolower( trim( $term->slug ) ) || 'todos' === strtolower( trim( $term->name ) );
}

/**
 * Devuelve el nombre del año "real" de un resultado (el término de
 * rd_anio que no sea "Todos"), para poder subagrupar por año dentro de
 * la pestaña "Todos". Si el resultado tuviera más de un año asignado
 * además de "Todos", se usa el primero que se encuentre.
 */
function rd_get_post_anio_real( $post_id ) {
	$terms = get_the_terms( $post_id, 'rd_anio' );
	if ( empty( $terms ) || is_wp_error( $terms ) ) {
		return '';
	}
	foreach ( $terms as $t ) {
		if ( ! rd_is_todos_term( $t ) ) {
			return $t->name;
		}
	}
	return '';
}

/**
 * Construye el arreglo de resultados agrupados por año, ordenados
 * de más reciente a más antiguo (años y, dentro de cada año, fechas).
 *
 * @param string $tipo 'individual' o 'acumulado'.
 */
function rd_get_grouped_results( $tipo = 'individual' ) {
	$terms = get_terms( array(
		'taxonomy'   => 'rd_anio',
		'hide_empty' => true,
	) );

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	// Ordenar años de mayor a menor.
	usort( $terms, function( $a, $b ) {
		return strcmp( $b->name, $a->name );
	} );

	// Los resultados creados antes de que existiera el campo "Tipo" se
	// tratan como "individual" para no perder nada de lo ya publicado.
	if ( 'acumulado' === $tipo ) {
		$tipo_clause = array(
			'key'   => '_rd_tipo',
			'value' => 'acumulado',
		);
	} else {
		$tipo_clause = array(
			'relation' => 'OR',
			array(
				'key'     => '_rd_tipo',
				'compare' => 'NOT EXISTS',
			),
			array(
				'key'     => '_rd_tipo',
				'value'   => 'acumulado',
				'compare' => '!=',
			),
		);
	}

	$base_args = array(
		'post_type'      => 'rd_resultado',
		'posts_per_page' => -1,
		'post_status'    => 'publish',
		'meta_query'     => array(
			'relation' => 'AND',
			$tipo_clause,
		),
	);

	// Los resultados individuales se ordenan por fecha del evento (todos la
	// tienen). Los acumulados no requieren fecha, así que se ordenan por
	// título para no dejar fuera a los que no la tengan capturada.
	if ( 'acumulado' === $tipo ) {
		$base_args['orderby'] = 'title';
		$base_args['order']   = 'ASC';
	} else {
		$base_args['meta_key'] = '_rd_fecha';
		$base_args['orderby']  = 'meta_value';
		$base_args['order']    = 'DESC';
	}

	$grouped = array();

	foreach ( $terms as $term ) {
		$posts = get_posts( array_merge( $base_args, array(
			'tax_query' => array(
				array(
					'taxonomy' => 'rd_anio',
					'field'    => 'term_id',
					'terms'    => $term->term_id,
				),
			),
		) ) );

		if ( empty( $posts ) ) {
			continue;
		}

		$items = array();
		foreach ( $posts as $p ) {
			$fecha       = get_post_meta( $p->ID, '_rd_fecha', true );
			$lugar       = get_post_meta( $p->ID, '_rd_lugar', true );
			$descripcion = get_post_meta( $p->ID, '_rd_descripcion', true );
			$url         = get_post_meta( $p->ID, '_rd_url', true );
			$iframe      = get_post_meta( $p->ID, '_rd_iframe', true );
			$ws_raceid   = get_post_meta( $p->ID, '_rd_ws_raceid', true );
			$ws_seriesid = get_post_meta( $p->ID, '_rd_ws_seriesid', true );

			// Si hay Race ID (individual) o Series ID (acumulado) de
			// Webscorer, se intenta jalar la tabla vía la API. Si falla (sin
			// credenciales, error de red, etc.) se deja vacío y el resultado
			// usa el iframe o el enlace como respaldo.
			$ws_html = '';
			if ( 'acumulado' === $tipo ) {
				if ( '' !== trim( (string) $ws_seriesid ) ) {
					$ws_data = rd_ws_fetch_series( $ws_seriesid );
					if ( empty( $ws_data['error'] ) ) {
						$ws_html = rd_ws_render_series_table( $ws_data, $p->ID );
					}
				}
			} else {
				if ( '' !== trim( (string) $ws_raceid ) ) {
					$ws_data = rd_ws_fetch_race( $ws_raceid );
					if ( empty( $ws_data['error'] ) ) {
						$ws_html = rd_ws_render_race_table( $ws_data, $p->ID );
					}
				}
			}

			$items[] = array(
				'post_id'     => $p->ID,
				'title'       => get_the_title( $p ),
				'fecha'       => $fecha,
				'lugar'       => $lugar,
				'descripcion' => $descripcion,
				'url'         => $url,
				'iframe'      => $iframe,
				'ws_html'     => $ws_html,
			);
		}

		// El término "Todos" junta resultados de todos los años en un solo
		// grupo; sin esto quedan en el orden de la consulta (por título en
		// acumulados), sin ninguna relación visible con su año. Aquí se
		// reordenan por año real (más reciente primero) y se insertan
		// encabezados de año entre ellos (y de mes, si son individuales).
		if ( rd_is_todos_term( $term ) ) {
			foreach ( $items as &$item ) {
				$item['anio'] = rd_get_post_anio_real( $item['post_id'] );
			}
			unset( $item );

			usort( $items, function( $a, $b ) {
				$cmp = strcmp( $b['anio'], $a['anio'] );
				if ( 0 !== $cmp ) {
					return $cmp;
				}
				// Dentro del mismo año: acumulados por título, individuales
				// por fecha (más reciente primero).
				if ( 'acumulado' === $tipo ) {
					return strcmp( $a['title'], $b['title'] );
				}
				return strcmp( $b['fecha'], $a['fecha'] );
			} );

			$items_con_encabezados = array();
			$anio_actual           = null;
			$mes_actual            = null;
			foreach ( $items as $item ) {
				if ( $item['anio'] !== $anio_actual ) {
					$anio_actual             = $item['anio'];
					$mes_actual              = null; // Reiniciar el mes al cambiar de año.
					$items_con_encabezados[] = array(
						'is_header' => true,
						'label'     => '' !== $anio_actual ? $anio_actual : 'Sin año',
						'nested'    => false,
					);
				}
				if ( 'individual' === $tipo ) {
					$mes_label = rd_mes_label( $item['fecha'] );
					if ( $mes_label !== $mes_actual ) {
						$mes_actual              = $mes_label;
						$items_con_encabezados[] = array(
							'is_header' => true,
							'label'     => $mes_label,
							'nested'    => true,
						);
					}
				}
				$items_con_encabezados[] = $item;
			}
			$items = $items_con_encabezados;
		} elseif ( 'individual' === $tipo ) {
			// Dentro de cada año en "Resultados", se agrupan las carreras por
			// mes (ya vienen ordenadas por fecha desc desde la consulta).
			$items = rd_insertar_encabezados( $items, function( $item ) {
				return rd_mes_label( $item['fecha'] );
			} );
		}

		$grouped[] = array(
			'label' => $term->name,
			'items' => $items,
		);
	}

	return $grouped;
}

/**
 * Renderiza el selector de años + la lista de resultados de un grupo
 * (se usa una vez para "Resultados" y otra vez para "Acumulados").
 *
 * @param array  $grouped   Resultado de rd_get_grouped_results().
 * @param string $id_prefix Prefijo único para los IDs (evita choques entre
 *                           pestañas y entre varios shortcodes en la misma página).
 */
function rd_render_years_panel( $grouped, $id_prefix ) {
	if ( empty( $grouped ) ) {
		return '<p>Aún no hay resultados publicados en esta sección.</p>';
	}
	ob_start();
	?>
	<div class="rd-layout">
		<div class="rd-years">
			<?php foreach ( $grouped as $i => $group ) : ?>
				<button type="button" class="rd-year-btn<?php echo 0 === $i ? ' is-active' : ''; ?>" data-rd-target="<?php echo esc_attr( $id_prefix . '-' . $i ); ?>">
					<?php echo esc_html( $group['label'] ); ?>
					<span class="rd-year-icon">+</span>
				</button>
			<?php endforeach; ?>
		</div>
		<div class="rd-panel">
			<?php foreach ( $grouped as $i => $group ) : ?>
				<ul class="rd-list" id="<?php echo esc_attr( $id_prefix . '-' . $i ); ?>" <?php echo 0 !== $i ? 'style="display:none;"' : ''; ?>>
					<?php foreach ( $group['items'] as $item ) : ?>
						<?php if ( ! empty( $item['is_header'] ) ) : ?>
							<li class="rd-list-subheader<?php echo ! empty( $item['nested'] ) ? ' rd-list-subheader--nested' : ''; ?>"><?php echo esc_html( $item['label'] ); ?></li>
							<?php continue; ?>
						<?php endif; ?>
						<?php $fecha_fmt = $item['fecha'] ? date_i18n( 'd/m/y', strtotime( $item['fecha'] ) ) : ''; ?>
						<li class="rd-item">
							<?php if ( ! empty( $item['ws_html'] ) ) :
								$ws_tpl_id = 'rd-ws-tpl-' . $item['post_id'];
								?>
								<button
									type="button"
									class="rd-item-link rd-item-modal-btn"
									data-rd-ws-target="<?php echo esc_attr( $ws_tpl_id ); ?>"
									data-rd-title="<?php echo esc_attr( $item['title'] ); ?>"
									data-rd-fecha="<?php echo esc_attr( $fecha_fmt ); ?>"
									data-rd-lugar="<?php echo esc_attr( $item['lugar'] ); ?>"
									data-rd-descripcion="<?php echo esc_attr( $item['descripcion'] ); ?>"
								>
									<?php echo esc_html( $fecha_fmt ); ?><?php echo $fecha_fmt ? ' - ' : ''; ?><?php echo esc_html( $item['title'] ); ?>
								</button>
								<template id="<?php echo esc_attr( $ws_tpl_id ); ?>"><?php echo $item['ws_html']; ?></template>
							<?php elseif ( ! empty( $item['iframe'] ) ) : ?>
								<button
									type="button"
									class="rd-item-link rd-item-modal-btn"
									data-rd-iframe="<?php echo esc_attr( $item['iframe'] ); ?>"
									data-rd-title="<?php echo esc_attr( $item['title'] ); ?>"
									data-rd-fecha="<?php echo esc_attr( $fecha_fmt ); ?>"
									data-rd-lugar="<?php echo esc_attr( $item['lugar'] ); ?>"
									data-rd-descripcion="<?php echo esc_attr( $item['descripcion'] ); ?>"
								>
									<?php echo esc_html( $fecha_fmt ); ?><?php echo $fecha_fmt ? ' - ' : ''; ?><?php echo esc_html( $item['title'] ); ?>
								</button>
							<?php elseif ( $item['url'] ) : ?>
								<a href="<?php echo esc_url( $item['url'] ); ?>" target="_blank" rel="noopener">
									<?php echo esc_html( $fecha_fmt ); ?><?php echo $fecha_fmt ? ' - ' : ''; ?><?php echo esc_html( $item['title'] ); ?>
								</a>
							<?php else : ?>
								<span><?php echo esc_html( $fecha_fmt ); ?><?php echo $fecha_fmt ? ' - ' : ''; ?><?php echo esc_html( $item['title'] ); ?></span>
							<?php endif; ?>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php endforeach; ?>
		</div>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * Renderiza el bloque de resultados (usado por el shortcode y el widget de Elementor).
 */
function rd_render_results_block( $args = array() ) {
	static $rd_instance = 0;
	$rd_instance++;

	$defaults = array(
		'titulo'               => 'Resultados',
		'etiqueta_resultados'  => 'Resultados',
		'etiqueta_acumulados'  => 'Acumulados',
	);
	$args = wp_parse_args( $args, $defaults );

	$grouped_individual = rd_get_grouped_results( 'individual' );
	$grouped_acumulado  = rd_get_grouped_results( 'acumulado' );

	wp_enqueue_style( 'rd-style' );
	wp_enqueue_script( 'rd-script' );

	if ( empty( $grouped_individual ) && empty( $grouped_acumulado ) ) {
		return '<p>Aún no hay resultados publicados.</p>';
	}

	$id_resultados = 'rd-' . $rd_instance . '-resultados';
	$id_acumulados = 'rd-' . $rd_instance . '-acumulados';

	// Por defecto se abre la pestaña "Resultados"; si esa está vacía pero
	// "Acumulados" sí tiene datos, se abre esa en su lugar.
	$resultados_activo = ! ( empty( $grouped_individual ) && ! empty( $grouped_acumulado ) );

	ob_start();
	?>
	<div class="rd-wrapper">
		<?php if ( ! empty( $args['titulo'] ) ) : ?>
			<h2 class="rd-heading"><?php echo esc_html( $args['titulo'] ); ?></h2>
		<?php endif; ?>

		<div class="rd-tabs">
			<button type="button" class="rd-tab-btn<?php echo $resultados_activo ? ' is-active' : ''; ?>" data-rd-tab-target="<?php echo esc_attr( $id_resultados ); ?>">
				<?php echo esc_html( $args['etiqueta_resultados'] ); ?>
			</button>
			<button type="button" class="rd-tab-btn<?php echo $resultados_activo ? '' : ' is-active'; ?>" data-rd-tab-target="<?php echo esc_attr( $id_acumulados ); ?>">
				<?php echo esc_html( $args['etiqueta_acumulados'] ); ?>
			</button>
		</div>

		<div class="rd-tab-panel<?php echo $resultados_activo ? ' is-active' : ''; ?>" id="<?php echo esc_attr( $id_resultados ); ?>" <?php echo $resultados_activo ? '' : 'style="display:none;"'; ?>>
			<?php echo rd_render_years_panel( $grouped_individual, $id_resultados . '-g' ); ?>
		</div>
		<div class="rd-tab-panel<?php echo $resultados_activo ? '' : ' is-active'; ?>" id="<?php echo esc_attr( $id_acumulados ); ?>" <?php echo $resultados_activo ? 'style="display:none;"' : ''; ?>>
			<?php echo rd_render_years_panel( $grouped_acumulado, $id_acumulados . '-g' ); ?>
		</div>

		<?php
		$rd_logo_id  = (int) get_option( 'rd_logo_id', 0 );
		$rd_logo_url = $rd_logo_id ? wp_get_attachment_image_url( $rd_logo_id, 'medium' ) : '';
		?>
		<div class="rd-modal" aria-hidden="true">
			<div class="rd-modal-overlay" data-rd-close="1"></div>
			<div class="rd-modal-dialog" role="dialog" aria-modal="true">
				<div class="rd-modal-header">
					<div class="rd-modal-heading">
						<?php if ( $rd_logo_url ) : ?>
							<img src="<?php echo esc_url( $rd_logo_url ); ?>" alt="" class="rd-modal-logo">
						<?php endif; ?>
						<span class="rd-modal-title"></span>
					</div>
					<button type="button" class="rd-modal-close" data-rd-close="1" aria-label="Cerrar">&times;</button>
				</div>
				<div class="rd-modal-info"></div>
				<div class="rd-modal-body"></div>
			</div>
		</div>
	</div>
	<?php
	return ob_get_clean();
}

add_shortcode( 'resultados_deportivos', function( $atts ) {
	$atts = shortcode_atts( array(
		'titulo'              => 'Resultados',
		'etiqueta_resultados' => 'Resultados',
		'etiqueta_acumulados' => 'Acumulados',
	), $atts, 'resultados_deportivos' );

	return rd_render_results_block( $atts );
} );
