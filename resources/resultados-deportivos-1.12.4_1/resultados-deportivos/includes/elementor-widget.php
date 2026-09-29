<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RD_Elementor_Widget extends \Elementor\Widget_Base {

	public function get_name() {
		return 'resultados_deportivos';
	}

	public function get_title() {
		return 'Resultados Deportivos';
	}

	public function get_icon() {
		return 'eicon-post-list';
	}

	public function get_categories() {
		return array( 'general' );
	}

	protected function register_controls() {
		$this->start_controls_section( 'section_content', array(
			'label' => 'Contenido',
		) );

		$this->add_control( 'titulo', array(
			'label'   => 'Título',
			'type'    => \Elementor\Controls_Manager::TEXT,
			'default' => 'Resultados',
		) );

		$this->add_control( 'etiqueta_resultados', array(
			'label'   => 'Etiqueta de la pestaña "Resultados"',
			'type'    => \Elementor\Controls_Manager::TEXT,
			'default' => 'Resultados',
		) );

		$this->add_control( 'etiqueta_acumulados', array(
			'label'   => 'Etiqueta de la pestaña "Acumulados"',
			'type'    => \Elementor\Controls_Manager::TEXT,
			'default' => 'Acumulados',
		) );

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		echo rd_render_results_block( array(
			'titulo'              => $settings['titulo'],
			'etiqueta_resultados' => $settings['etiqueta_resultados'],
			'etiqueta_acumulados' => $settings['etiqueta_acumulados'],
		) );
	}
}

add_action( 'elementor/widgets/register', function( $widgets_manager ) {
	$widgets_manager->register( new RD_Elementor_Widget() );
} );
