<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Página de ajustes: Resultados Deportivos > Ajustes.
 * Permite subir un logotipo que aparece en la cabecera de la ventana
 * emergente (modal) donde se muestra el iframe de resultados.
 */
add_action( 'admin_menu', function() {
	$rd_settings_hook = add_submenu_page(
		'edit.php?post_type=rd_resultado',
		'Ajustes de Resultados Deportivos',
		'Ajustes',
		'manage_options',
		'rd-ajustes',
		'rd_render_settings_page'
	);

	// Cargar el uploader de medios (wp.media) y nuestro script solo en esta
	// pantalla. No se puede adivinar el nombre del "hook" de antemano porque
	// depende de cómo WordPress registra el menú del CPT, así que usamos el
	// valor real que devuelve add_submenu_page().
	if ( $rd_settings_hook ) {
		add_action( 'load-' . $rd_settings_hook, function() {
			add_action( 'admin_enqueue_scripts', 'rd_enqueue_settings_assets' );
		} );
	}
} );

function rd_enqueue_settings_assets() {
	wp_enqueue_media();
	wp_enqueue_script(
		'rd-admin-settings',
		RD_PLUGIN_URL . 'assets/js/admin-settings.js',
		array( 'jquery' ),
		RD_VERSION,
		true
	);
}

add_action( 'admin_init', function() {
	register_setting( 'rd_settings_group', 'rd_logo_id', array(
		'type'              => 'integer',
		'sanitize_callback' => 'absint',
		'default'           => 0,
	) );
	register_setting( 'rd_settings_group', 'rd_logo_dark_id', array(
		'type'              => 'integer',
		'sanitize_callback' => 'absint',
		'default'           => 0,
	) );
	register_setting( 'rd_settings_group', 'rd_firma_id', array(
		'type'              => 'integer',
		'sanitize_callback' => 'absint',
		'default'           => 0,
	) );
	register_setting( 'rd_settings_group', 'rd_ws_apiid', array(
		'type'              => 'string',
		'sanitize_callback' => 'sanitize_text_field',
		'default'           => '',
	) );
	register_setting( 'rd_settings_group', 'rd_ws_apipriv', array(
		'type'              => 'string',
		'sanitize_callback' => 'sanitize_text_field',
		'default'           => '',
	) );
} );

function rd_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$logo_id  = (int) get_option( 'rd_logo_id', 0 );
	$logo_url = $logo_id ? wp_get_attachment_image_url( $logo_id, 'medium' ) : '';

	$logo_dark_id  = (int) get_option( 'rd_logo_dark_id', 0 );
	$logo_dark_url = $logo_dark_id ? wp_get_attachment_image_url( $logo_dark_id, 'medium' ) : '';

	$firma_id  = (int) get_option( 'rd_firma_id', 0 );
	$firma_url = $firma_id ? wp_get_attachment_image_url( $firma_id, 'medium' ) : '';

	$ws_apiid   = get_option( 'rd_ws_apiid', '' );
	$ws_apipriv = get_option( 'rd_ws_apipriv', '' );
	?>
	<div class="wrap">
		<h1>Ajustes de Resultados Deportivos</h1>
		<form method="post" action="options.php">
			<?php settings_fields( 'rd_settings_group' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="rd_logo_preview">Logotipo</label></th>
					<td>
						<div style="margin-bottom:10px;">
							<img id="rd_logo_preview" src="<?php echo esc_url( $logo_url ); ?>" style="max-width:220px;max-height:120px;display:<?php echo $logo_url ? 'block' : 'none'; ?>;border:1px solid #ddd;padding:4px;background:#fff;">
						</div>
						<input type="hidden" id="rd_logo_id" name="rd_logo_id" value="<?php echo esc_attr( $logo_id ); ?>">
						<button type="button" class="button rd-media-upload-btn" data-target="rd_logo">Seleccionar imagen</button>
						<button type="button" class="button rd-media-remove-btn" data-target="rd_logo" style="<?php echo $logo_url ? '' : 'display:none;'; ?>">Quitar logotipo</button>
						<p class="description">Este logotipo aparece en la cabecera de la ventana emergente que se abre al hacer clic en un resultado, y en los certificados de participación cuando no hay uno específico para fondo oscuro (ver abajo). Se recomienda una imagen horizontal con fondo transparente (PNG) de no más de 300px de ancho, en sus colores normales, pensada para verse sobre fondos claros.</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="rd_logo_dark_preview">Logotipo para fondo oscuro</label></th>
					<td>
						<div style="margin-bottom:10px;">
							<img id="rd_logo_dark_preview" src="<?php echo esc_url( $logo_dark_url ); ?>" style="max-width:220px;max-height:120px;display:<?php echo $logo_dark_url ? 'block' : 'none'; ?>;border:1px solid #ddd;padding:4px;background:#14213d;">
						</div>
						<input type="hidden" id="rd_logo_dark_id" name="rd_logo_dark_id" value="<?php echo esc_attr( $logo_dark_id ); ?>">
						<button type="button" class="button rd-media-upload-btn" data-target="rd_logo_dark">Seleccionar imagen</button>
						<button type="button" class="button rd-media-remove-btn" data-target="rd_logo_dark" style="<?php echo $logo_dark_url ? '' : 'display:none;'; ?>">Quitar logotipo</button>
						<p class="description">Opcional. Se usa en la banda de color de los certificados de participación en PDF, en vez del logotipo normal. Sube aquí una versión en blanco (o en colores claros) de tu logotipo, con fondo transparente (PNG), pensada para verse bien sobre un fondo azul marino oscuro. Si no subes nada aquí, el certificado usa el logotipo normal de arriba sobre una tarjeta blanca.</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="rd_firma_preview">Firma (comité organizador)</label></th>
					<td>
						<div style="margin-bottom:10px;">
							<img id="rd_firma_preview" src="<?php echo esc_url( $firma_url ); ?>" style="max-width:220px;max-height:120px;display:<?php echo $firma_url ? 'block' : 'none'; ?>;border:1px solid #ddd;padding:4px;background:#fff;">
						</div>
						<input type="hidden" id="rd_firma_id" name="rd_firma_id" value="<?php echo esc_attr( $firma_id ); ?>">
						<button type="button" class="button rd-media-upload-btn" data-target="rd_firma">Seleccionar imagen</button>
						<button type="button" class="button rd-media-remove-btn" data-target="rd_firma" style="<?php echo $firma_url ? '' : 'display:none;'; ?>">Quitar firma</button>
						<p class="description">Opcional. Aparece al pie de los certificados de participación en PDF, arriba de la línea que dice "Comité Organizador". Lo ideal es una foto o escaneo de la firma con fondo transparente (PNG); si subes tal cual una foto con fondo blanco (una hoja de papel normal, por ejemplo), también se ve bien porque el fondo del certificado en esa zona también es blanco. Si no subes nada aquí, el certificado solo muestra la línea y el texto, sin firma encima.</p>
					</td>
				</tr>
			</table>

			<h2>Integración con la API de Webscorer (opcional)</h2>
			<p class="description">
				Si llenas esto, un resultado individual con "Race ID de Webscorer" configurado (en el campo del mismo nombre al editar el resultado) muestra una tabla con el estilo de tu sitio en vez del iframe, jalando los datos directo de Webscorer. Requiere una cuenta de organizador con suscripción <strong>PRO Results</strong> activa.
			</p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="rd_ws_apiid">API ID</label></th>
					<td>
						<input type="text" id="rd_ws_apiid" name="rd_ws_apiid" value="<?php echo esc_attr( $ws_apiid ); ?>" class="regular-text" autocomplete="off">
						<p class="description">Los dígitos al final de la URL de tu página de organizador en Webscorer (ej. <code>webscorer.com/organizer/44167</code> → <code>44167</code>).</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="rd_ws_apipriv">Token API</label></th>
					<td>
						<input type="password" id="rd_ws_apipriv" name="rd_ws_apipriv" value="<?php echo esc_attr( $ws_apipriv ); ?>" class="regular-text" autocomplete="new-password">
						<p class="description">El token de 8 caracteres que generas en la configuración de tu cuenta de organizador en Webscorer. Es privado: nunca se muestra en el sitio público, solo se usa desde el servidor para pedirle los datos a Webscorer.</p>
					</td>
				</tr>
			</table>

			<?php submit_button( 'Guardar cambios' ); ?>
		</form>
	</div>
	<?php
}
