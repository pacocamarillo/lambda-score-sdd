<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registrar el Custom Post Type "Resultado" y la taxonomía "Año".
 */
function rd_register_cpt_and_taxonomy() {

	register_post_type( 'rd_resultado', array(
		'labels' => array(
			'name'               => 'Resultados',
			'singular_name'      => 'Resultado',
			'add_new'            => 'Agregar resultado',
			'add_new_item'       => 'Agregar nuevo resultado',
			'edit_item'          => 'Editar resultado',
			'new_item'           => 'Nuevo resultado',
			'view_item'          => 'Ver resultado',
			'search_items'       => 'Buscar resultados',
			'not_found'          => 'No se encontraron resultados',
			'not_found_in_trash' => 'No hay resultados en la papelera',
			'menu_name'          => 'Resultados Deportivos',
		),
		'public'             => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'menu_icon'          => 'dashicons-awards',
		'has_archive'        => false,
		'exclude_from_search' => true,
		'publicly_queryable' => false,
		'rewrite'            => false,
		'supports'           => array( 'title' ),
		'show_in_rest'       => false,
	) );

	register_taxonomy( 'rd_anio', 'rd_resultado', array(
		'labels' => array(
			'name'          => 'Años',
			'singular_name' => 'Año',
			'add_new_item'  => 'Agregar nuevo año',
			'search_items'  => 'Buscar años',
			'all_items'     => 'Todos los años',
			'edit_item'     => 'Editar año',
			'menu_name'     => 'Años',
		),
		'hierarchical'      => true,
		'public'            => false,
		'show_ui'           => true,
		'show_admin_column' => true,
		'show_in_rest'      => false,
	) );
}
add_action( 'init', 'rd_register_cpt_and_taxonomy' );

/**
 * Devuelve el tipo de resultado ('individual' o 'acumulado') de un post,
 * tratando como 'individual' cualquier resultado creado antes de que
 * existiera este campo (compatibilidad con datos ya guardados).
 */
function rd_get_tipo( $post_id ) {
	$tipo = get_post_meta( $post_id, '_rd_tipo', true );
	return 'acumulado' === $tipo ? 'acumulado' : 'individual';
}

/**
 * Columnas propias en el listado de administración.
 */
add_filter( 'manage_rd_resultado_posts_columns', function( $columns ) {
	$new = array();
	foreach ( $columns as $key => $label ) {
		$new[ $key ] = $label;
		if ( 'title' === $key ) {
			$new['rd_tipo']    = 'Tipo';
			$new['rd_fecha']   = 'Fecha';
			$new['rd_ws_race'] = 'Webscorer';
			$new['rd_url']     = 'Enlace de resultados';
		}
	}
	return $new;
} );

add_action( 'manage_rd_resultado_posts_custom_column', function( $column, $post_id ) {
	if ( 'rd_tipo' === $column ) {
		echo 'acumulado' === rd_get_tipo( $post_id ) ? 'Acumulado' : 'Individual';
	}
	if ( 'rd_fecha' === $column ) {
		$fecha = get_post_meta( $post_id, '_rd_fecha', true );
		echo $fecha ? esc_html( date_i18n( 'd/m/Y', strtotime( $fecha ) ) ) : '—';
	}
	if ( 'rd_ws_race' === $column ) {
		if ( 'acumulado' === rd_get_tipo( $post_id ) ) {
			$seriesid = get_post_meta( $post_id, '_rd_ws_seriesid', true );
			echo $seriesid ? '✅ Serie ' . esc_html( $seriesid ) : '—';
		} else {
			$raceid = get_post_meta( $post_id, '_rd_ws_raceid', true );
			echo $raceid ? '✅ ' . esc_html( $raceid ) : '—';
		}
	}
	if ( 'rd_url' === $column ) {
		$url = get_post_meta( $post_id, '_rd_url', true );
		if ( $url ) {
			echo '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $url ) . '</a>';
		} else {
			echo '—';
		}
	}
}, 10, 2 );

/**
 * Filtro "Tipo" (Individual / Acumulado) en el listado de administración.
 */
add_action( 'restrict_manage_posts', function( $post_type ) {
	if ( 'rd_resultado' !== $post_type ) {
		return;
	}
	$selected = isset( $_GET['rd_tipo_filtro'] ) ? sanitize_text_field( wp_unslash( $_GET['rd_tipo_filtro'] ) ) : '';
	?>
	<select name="rd_tipo_filtro">
		<option value="">Todos los tipos</option>
		<option value="individual" <?php selected( $selected, 'individual' ); ?>>Individual</option>
		<option value="acumulado" <?php selected( $selected, 'acumulado' ); ?>>Acumulado</option>
	</select>
	<?php
} );

add_action( 'pre_get_posts', function( $query ) {
	if ( ! is_admin() || ! $query->is_main_query() ) {
		return;
	}
	if ( 'rd_resultado' !== $query->get( 'post_type' ) ) {
		return;
	}
	if ( empty( $_GET['rd_tipo_filtro'] ) ) {
		return;
	}
	$tipo = sanitize_text_field( wp_unslash( $_GET['rd_tipo_filtro'] ) );

	if ( 'acumulado' === $tipo ) {
		$query->set( 'meta_query', array(
			array(
				'key'   => '_rd_tipo',
				'value' => 'acumulado',
			),
		) );
	} elseif ( 'individual' === $tipo ) {
		$query->set( 'meta_query', array(
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
		) );
	}
} );

/**
 * Cargar el script que oculta Fecha/Lugar cuando el tipo es "Acumulado",
 * solo en la pantalla de edición de un resultado.
 */
add_action( 'admin_enqueue_scripts', function( $hook ) {
	if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}
	$screen = get_current_screen();
	if ( ! $screen || 'rd_resultado' !== $screen->post_type ) {
		return;
	}
	wp_enqueue_script(
		'rd-admin-metabox',
		RD_PLUGIN_URL . 'assets/js/admin-metabox.js',
		array(),
		RD_VERSION,
		true
	);
} );

/**
 * Metabox: Fecha del evento + URL externa de resultados.
 */
add_action( 'add_meta_boxes', function() {
	add_meta_box(
		'rd_detalles',
		'Detalles del resultado',
		'rd_render_meta_box',
		'rd_resultado',
		'normal',
		'high'
	);
} );

function rd_render_meta_box( $post ) {
	wp_nonce_field( 'rd_save_meta', 'rd_meta_nonce' );

	$fecha       = get_post_meta( $post->ID, '_rd_fecha', true );
	$lugar       = get_post_meta( $post->ID, '_rd_lugar', true );
	$descripcion = get_post_meta( $post->ID, '_rd_descripcion', true );
	$url         = get_post_meta( $post->ID, '_rd_url', true );
	$iframe      = get_post_meta( $post->ID, '_rd_iframe', true );
	$ws_raceid   = get_post_meta( $post->ID, '_rd_ws_raceid', true );
	$ws_seriesid = get_post_meta( $post->ID, '_rd_ws_seriesid', true );
	$tipo        = rd_get_tipo( $post->ID );
	?>
	<p>
		<strong>Tipo de resultado</strong><br>
		<label style="margin-right:1.5rem;">
			<input type="radio" name="rd_tipo" id="rd_tipo_individual" value="individual" <?php checked( $tipo, 'individual' ); ?>>
			Resultado individual (carrera)
		</label>
		<label>
			<input type="radio" name="rd_tipo" id="rd_tipo_acumulado" value="acumulado" <?php checked( $tipo, 'acumulado' ); ?>>
			Acumulado
		</label>
		<br>
		<span class="description">Los resultados individuales y los acumulados se muestran en dos pestañas separadas ("Resultados" y "Acumulados") donde se use el shortcode o el widget. Los acumulados no necesitan fecha ni lugar, esos campos se ocultan al elegir "Acumulado".</span>
	</p>
	<div id="rd-campo-fecha-lugar">
		<p>
			<label for="rd_fecha"><strong>Fecha del evento</strong></label><br>
			<input type="date" id="rd_fecha" name="rd_fecha" value="<?php echo esc_attr( $fecha ); ?>" style="width:100%;max-width:260px;">
		</p>
		<p>
			<label for="rd_lugar"><strong>Lugar del evento</strong></label><br>
			<input type="text" id="rd_lugar" name="rd_lugar" value="<?php echo esc_attr( $lugar ); ?>" placeholder="Ej. Torreón, Coahuila" style="width:100%;max-width:400px;">
			<span class="description">Opcional. Se muestra junto con la fecha en la ventana emergente del resultado.</span>
		</p>
		<p>
			<label for="rd_ws_raceid"><strong>Race ID de Webscorer (API)</strong></label><br>
			<input type="text" id="rd_ws_raceid" name="rd_ws_raceid" value="<?php echo esc_attr( $ws_raceid ); ?>" placeholder="Ej. 445535" style="width:100%;max-width:260px;">
			<span class="description">Opcional. Es el número que aparece en la URL de la carrera en Webscorer (<code>webscorer.com/race?raceid=445535</code> → <code>445535</code>). Si lo llenas, el resultado se muestra como una tabla con el estilo de tu sitio, jalada en vivo de Webscorer, en lugar del iframe o el enlace de abajo. Requiere el API ID y el Token configurados en Resultados Deportivos &gt; Ajustes. Si Webscorer no responde, el plugin usa automáticamente el iframe o el enlace externo como respaldo.</span>
		</p>
	</div>
	<div id="rd-campo-serie" style="display:none;">
		<p>
			<label for="rd_ws_seriesid"><strong>Series ID de Webscorer (API)</strong></label><br>
			<input type="text" id="rd_ws_seriesid" name="rd_ws_seriesid" value="<?php echo esc_attr( $ws_seriesid ); ?>" placeholder="Ej. 427927" style="width:100%;max-width:260px;">
			<span class="description">Opcional. Es el número que aparece en la URL del acumulado/serie en Webscorer (<code>webscorer.com/seriesresult?seriesid=427927</code> → <code>427927</code>). Si lo llenas, el acumulado se muestra como una tabla con el estilo de tu sitio (puntos, carreras contadas y el detalle carrera por carrera de cada corredor), jalada en vivo de Webscorer, en lugar del iframe o el enlace de abajo. Requiere el API ID y el Token configurados en Resultados Deportivos &gt; Ajustes. Si Webscorer no responde, el plugin usa automáticamente el iframe o el enlace externo como respaldo.</span>
		</p>
	</div>
	<p>
		<label for="rd_descripcion"><strong>Descripción / nota del evento</strong></label><br>
		<textarea id="rd_descripcion" name="rd_descripcion" rows="3" style="width:100%;" placeholder="Ej. Acumulado de enero a junio 2026, categoría varonil y femenil."><?php echo esc_textarea( $descripcion ); ?></textarea>
		<span class="description">Opcional. Texto libre que se muestra arriba del iframe en la ventana emergente. Para un acumulado, aquí puedes indicar el periodo que abarca.</span>
	</p>
	<p>
		<label for="rd_url"><strong>Enlace externo de resultados</strong></label><br>
		<input type="url" id="rd_url" name="rd_url" value="<?php echo esc_attr( $url ); ?>" placeholder="https://" style="width:100%;">
		<span class="description">La URL donde están publicados los resultados completos (por ejemplo, tu página de Chrono Laguna Sports). Se usa solo si no hay un iframe configurado abajo.</span>
	</p>
	<p>
		<label for="rd_iframe"><strong>Código iframe (embed)</strong></label><br>
		<textarea id="rd_iframe" name="rd_iframe" rows="4" style="width:100%;font-family:monospace;" placeholder='&lt;iframe id="wshost" width="990" height="1200" src="https://www.webscorer.com/race?pid=1&amp;raceid=432615&amp;embed=2"&gt;&lt;/iframe&gt;'><?php echo esc_textarea( $iframe ); ?></textarea>
		<span class="description">Pega aquí el código &lt;iframe&gt; completo (por ejemplo, el de Webscorer). Si se llena este campo (y no hay Race ID de Webscorer arriba, o Webscorer no responde), el resultado se abrirá en una ventana emergente con el iframe en lugar de abrir el enlace externo. La fecha, el lugar y la descripción de arriba se muestran dentro de esa ventana, junto con el logotipo configurado en Resultados Deportivos &gt; Ajustes.</span>
	</p>
	<p class="description">
		Título del resultado: usa el campo "Título" de arriba (ej. "Tour Paso Nacional 100K"). Asigna el <strong>Año</strong> correspondiente en el panel lateral derecho.
	</p>
	<?php
}

add_action( 'save_post_rd_resultado', function( $post_id ) {
	if ( ! isset( $_POST['rd_meta_nonce'] ) || ! wp_verify_nonce( $_POST['rd_meta_nonce'], 'rd_save_meta' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['rd_tipo'] ) && in_array( $_POST['rd_tipo'], array( 'individual', 'acumulado' ), true ) ) {
		update_post_meta( $post_id, '_rd_tipo', $_POST['rd_tipo'] );
	}
	if ( isset( $_POST['rd_fecha'] ) ) {
		update_post_meta( $post_id, '_rd_fecha', sanitize_text_field( $_POST['rd_fecha'] ) );
	}
	if ( isset( $_POST['rd_lugar'] ) ) {
		update_post_meta( $post_id, '_rd_lugar', sanitize_text_field( $_POST['rd_lugar'] ) );
	}
	if ( isset( $_POST['rd_descripcion'] ) ) {
		update_post_meta( $post_id, '_rd_descripcion', sanitize_textarea_field( $_POST['rd_descripcion'] ) );
	}
	if ( isset( $_POST['rd_url'] ) ) {
		update_post_meta( $post_id, '_rd_url', esc_url_raw( $_POST['rd_url'] ) );
	}
	if ( isset( $_POST['rd_iframe'] ) ) {
		update_post_meta( $post_id, '_rd_iframe', rd_sanitize_iframe_embed( wp_unslash( $_POST['rd_iframe'] ) ) );
	}
	if ( isset( $_POST['rd_ws_raceid'] ) ) {
		$ws_raceid = sanitize_text_field( $_POST['rd_ws_raceid'] );
		update_post_meta( $post_id, '_rd_ws_raceid', $ws_raceid );
		// Forzar una consulta nueva a Webscorer la próxima vez que se muestre,
		// en vez de esperar a que expire el caché de unos minutos.
		if ( '' !== $ws_raceid && function_exists( 'rd_ws_fetch_race' ) ) {
			$apiid = trim( (string) get_option( 'rd_ws_apiid', '' ) );
			delete_transient( 'rd_ws_race_' . md5( $ws_raceid . '|' . $apiid ) );
		}
	}
	if ( isset( $_POST['rd_ws_seriesid'] ) ) {
		$ws_seriesid = sanitize_text_field( $_POST['rd_ws_seriesid'] );
		update_post_meta( $post_id, '_rd_ws_seriesid', $ws_seriesid );
		// Forzar una consulta nueva a Webscorer la próxima vez que se muestre,
		// en vez de esperar a que expire el caché de unos minutos.
		if ( '' !== $ws_seriesid && function_exists( 'rd_ws_fetch_series' ) ) {
			$apiid = trim( (string) get_option( 'rd_ws_apiid', '' ) );
			delete_transient( 'rd_ws_series_' . md5( $ws_seriesid . '|' . $apiid ) );
		}
	}
} );

/**
 * Sanitiza el código embed permitiendo únicamente una etiqueta <iframe>
 * con los atributos habituales de este tipo de embeds.
 */
function rd_sanitize_iframe_embed( $html ) {
	$html = trim( $html );
	if ( '' === $html ) {
		return '';
	}

	$allowed = array(
		'iframe' => array(
			'id'              => true,
			'src'             => true,
			'width'           => true,
			'height'          => true,
			'frameborder'     => true,
			'allow'           => true,
			'allowfullscreen' => true,
			'scrolling'       => true,
			'style'           => true,
			'class'           => true,
			'title'           => true,
			'loading'         => true,
			'referrerpolicy'  => true,
		),
	);

	return wp_kses( $html, $allowed );
}
