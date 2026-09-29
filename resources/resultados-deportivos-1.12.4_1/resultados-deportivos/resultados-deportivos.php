<?php
/**
 * Plugin Name: Resultados de Eventos Deportivos
 * Description: Administra y muestra una lista de resultados de eventos deportivos agrupados por año, cada uno enlazando a una página externa de resultados. Compatible con shortcode y con Elementor.
 * Version: 1.12.4
 * Author: Chrono Laguna Sports
 * Text Domain: resultados-deportivos
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Salir si se accede directamente.
}

define( 'RD_PLUGIN_FILE', __FILE__ );
define( 'RD_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'RD_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'RD_VERSION', '1.12.4' );

require_once RD_PLUGIN_DIR . 'includes/cpt.php';
require_once RD_PLUGIN_DIR . 'includes/settings.php';
require_once RD_PLUGIN_DIR . 'includes/webscorer.php';
require_once RD_PLUGIN_DIR . 'includes/importer.php';
require_once RD_PLUGIN_DIR . 'includes/shortcode.php';
require_once RD_PLUGIN_DIR . 'includes/pdf-writer.php';
require_once RD_PLUGIN_DIR . 'includes/certificates.php';

// Cargar el widget de Elementor solo si Elementor está activo. Se engancha
// directamente a la acción "elementor/loaded" (en vez de revisarla dentro de
// "plugins_loaded") para no depender del orden en que WordPress cargue los
// plugins: así funciona sin importar si Elementor se activó antes o después
// de este plugin.
add_action( 'elementor/loaded', function() {
	require_once RD_PLUGIN_DIR . 'includes/elementor-widget.php';
} );

// Encolar CSS/JS del frontend.
add_action( 'wp_enqueue_scripts', function() {
	wp_register_style( 'rd-style', RD_PLUGIN_URL . 'assets/css/style.css', array(), RD_VERSION );
	wp_register_script( 'rd-script', RD_PLUGIN_URL . 'assets/js/script.js', array(), RD_VERSION, true );
} );

// Activación: crear el custom post type y flush de reglas de reescritura.
register_activation_hook( __FILE__, function() {
	rd_register_cpt_and_taxonomy();
	flush_rewrite_rules();
} );

register_deactivation_hook( __FILE__, function() {
	flush_rewrite_rules();
} );
