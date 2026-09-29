<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Generador de PDF mínimo, sin dependencias externas, usado solo para
 * armar el certificado de participación en una sola página (tamaño carta
 * horizontal). No es una librería genérica: solo implementa lo necesario
 * (texto con las 2 fuentes estándar Helvetica / Helvetica-Bold, líneas,
 * rectángulos y una imagen JPEG opcional para el logotipo) para no tener
 * que empaquetar una librería de terceros (Dompdf, TCPDF, etc.) dentro
 * del plugin.
 */

// Anchos de carácter (por 1000 unidades de em) de las fuentes estándar
// Helvetica y Helvetica-Bold, según las métricas AFM de Adobe. Solo se
// listan los códigos que puede necesitar un certificado en español
// (ASCII imprimible + vocales acentuadas, Ñ/ñ, Ü/ü, ¿ y ¡ en WinAnsiEncoding,
// que para estos caracteres coincide con Latin-1/CP1252).
if ( ! function_exists( 'rd_pdf_helv_widths' ) ) {
	function rd_pdf_helv_widths() {
		static $w = null;
		if ( null === $w ) {
			$w = array(
				32 => 278, 33 => 278, 34 => 355, 35 => 556, 36 => 556, 37 => 889, 38 => 667, 39 => 191,
				40 => 333, 41 => 333, 42 => 389, 43 => 584, 44 => 278, 45 => 333, 46 => 278, 47 => 278,
				48 => 556, 49 => 556, 50 => 556, 51 => 556, 52 => 556, 53 => 556, 54 => 556, 55 => 556, 56 => 556, 57 => 556,
				58 => 278, 59 => 278, 60 => 584, 61 => 584, 62 => 584, 63 => 556, 64 => 1015,
				65 => 667, 66 => 667, 67 => 722, 68 => 722, 69 => 667, 70 => 611, 71 => 778, 72 => 722, 73 => 278, 74 => 500,
				75 => 667, 76 => 556, 77 => 833, 78 => 722, 79 => 778, 80 => 667, 81 => 778, 82 => 722, 83 => 667, 84 => 611,
				85 => 722, 86 => 667, 87 => 944, 88 => 667, 89 => 667, 90 => 611,
				91 => 278, 92 => 278, 93 => 278, 94 => 469, 95 => 556, 96 => 333,
				97 => 556, 98 => 556, 99 => 500, 100 => 556, 101 => 556, 102 => 278, 103 => 556, 104 => 556, 105 => 222, 106 => 222,
				107 => 500, 108 => 222, 109 => 833, 110 => 556, 111 => 556, 112 => 556, 113 => 556, 114 => 333, 115 => 500, 116 => 278,
				117 => 556, 118 => 500, 119 => 722, 120 => 500, 121 => 500, 122 => 500,
				123 => 334, 124 => 260, 125 => 334, 126 => 584,
				161 => 333, 191 => 556,
				193 => 667, 201 => 667, 205 => 278, 209 => 722, 211 => 778, 218 => 722, 220 => 722,
				225 => 556, 233 => 556, 237 => 222, 241 => 556, 243 => 556, 250 => 556, 252 => 556,
			);
		}
		return $w;
	}
}

if ( ! function_exists( 'rd_pdf_helvb_widths' ) ) {
	function rd_pdf_helvb_widths() {
		static $w = null;
		if ( null === $w ) {
			$w = array(
				32 => 278, 33 => 333, 34 => 474, 35 => 556, 36 => 556, 37 => 889, 38 => 722, 39 => 238,
				40 => 333, 41 => 333, 42 => 389, 43 => 584, 44 => 278, 45 => 333, 46 => 278, 47 => 278,
				48 => 556, 49 => 556, 50 => 556, 51 => 556, 52 => 556, 53 => 556, 54 => 556, 55 => 556, 56 => 556, 57 => 556,
				58 => 333, 59 => 333, 60 => 584, 61 => 584, 62 => 584, 63 => 611, 64 => 975,
				65 => 722, 66 => 722, 67 => 722, 68 => 722, 69 => 667, 70 => 611, 71 => 778, 72 => 722, 73 => 278, 74 => 556,
				75 => 722, 76 => 611, 77 => 833, 78 => 722, 79 => 778, 80 => 667, 81 => 778, 82 => 722, 83 => 667, 84 => 611,
				85 => 722, 86 => 667, 87 => 944, 88 => 667, 89 => 667, 90 => 611,
				91 => 333, 92 => 278, 93 => 333, 94 => 584, 95 => 556, 96 => 333,
				97 => 556, 98 => 611, 99 => 556, 100 => 611, 101 => 556, 102 => 333, 103 => 611, 104 => 611, 105 => 278, 106 => 278,
				107 => 556, 108 => 278, 109 => 889, 110 => 611, 111 => 611, 112 => 611, 113 => 611, 114 => 389, 115 => 556, 116 => 333,
				117 => 611, 118 => 556, 119 => 778, 120 => 556, 121 => 556, 122 => 500,
				123 => 389, 124 => 280, 125 => 389, 126 => 584,
				161 => 333, 191 => 611,
				193 => 722, 201 => 667, 205 => 278, 209 => 722, 211 => 778, 218 => 722, 220 => 722,
				225 => 556, 233 => 556, 237 => 278, 241 => 611, 243 => 611, 250 => 611, 252 => 611,
			);
		}
		return $w;
	}
}

/**
 * Convierte texto UTF-8 (como llega de la base de datos / la API de
 * Webscorer) al byte-a-byte Latin-1/CP1252 que necesita PDF con
 * /Encoding /WinAnsiEncoding. Usa mbstring o iconv (casi siempre
 * disponibles); si ninguno existe, hace un mapeo manual de los acentos
 * más comunes en español y sustituye el resto por "?".
 */
function rd_pdf_to_latin1( $utf8 ) {
	$utf8 = (string) $utf8;

	if ( function_exists( 'mb_convert_encoding' ) ) {
		$out = @mb_convert_encoding( $utf8, 'Windows-1252', 'UTF-8' );
		if ( false !== $out && '' !== $out ) {
			return $out;
		}
	}

	if ( function_exists( 'iconv' ) ) {
		$out = @iconv( 'UTF-8', 'CP1252//TRANSLIT//IGNORE', $utf8 );
		if ( false !== $out ) {
			return $out;
		}
	}

	$map = array(
		'á' => "\xE1", 'é' => "\xE9", 'í' => "\xED", 'ó' => "\xF3", 'ú' => "\xFA", 'ñ' => "\xF1", 'ü' => "\xFC",
		'Á' => "\xC1", 'É' => "\xC9", 'Í' => "\xCD", 'Ó' => "\xD3", 'Ú' => "\xDA", 'Ñ' => "\xD1", 'Ü' => "\xDC",
		'¿' => "\xBF", '¡' => "\xA1",
	);
	$utf8 = strtr( $utf8, $map );
	// Cualquier secuencia UTF-8 de varios bytes que no se haya mapeado arriba
	// (emoji, otros idiomas, etc.) se sustituye por "?" para no romper el PDF.
	return preg_replace( '/[\xC2-\xF4][\x80-\xBF]+/', '?', $utf8 );
}

/** Escapa paréntesis y backslashes dentro de un string literal de PDF. */
function rd_pdf_esc( $latin1 ) {
	return str_replace( array( '\\', '(', ')' ), array( '\\\\', '\\(', '\\)' ), $latin1 );
}

/** Ancho (en puntos) de un string ya convertido a Latin-1, a un tamaño dado. */
function rd_pdf_str_width_latin1( $latin1, $size, $bold = false ) {
	$table = $bold ? rd_pdf_helvb_widths() : rd_pdf_helv_widths();
	$total = 0;
	$len   = strlen( $latin1 );
	for ( $i = 0; $i < $len; $i++ ) {
		$code   = ord( $latin1[ $i ] );
		$total += isset( $table[ $code ] ) ? $table[ $code ] : 556;
	}
	return $total * $size / 1000;
}

/**
 * Parte un texto (UTF-8) en líneas que no exceden $max_width puntos,
 * partiendo por palabras completas (ajuste de texto simple, sin guionado).
 */
function rd_pdf_wrap_text( $utf8_text, $bold, $size, $max_width ) {
	$words = preg_split( '/\s+/', trim( (string) $utf8_text ) );
	$lines   = array();
	$current = '';
	foreach ( $words as $word ) {
		if ( '' === $word ) {
			continue;
		}
		$test = ( '' === $current ) ? $word : ( $current . ' ' . $word );
		$w    = rd_pdf_str_width_latin1( rd_pdf_to_latin1( $test ), $size, $bold );
		if ( $w > $max_width && '' !== $current ) {
			$lines[] = $current;
			$current = $word;
		} else {
			$current = $test;
		}
	}
	if ( '' !== $current ) {
		$lines[] = $current;
	}
	return $lines;
}

/**
 * Documento PDF de una sola página, pensado exclusivamente para el
 * certificado de participación (no es un generador genérico).
 */
class RD_Certificate_PDF {
	public $w;
	public $h;
	private $ops = '';
	// Varias imágenes distintas pueden aparecer en el mismo certificado
	// (el logotipo y la firma, por ejemplo), así que se guardan en una
	// lista; cada una ocupa su propio slot /ImN en el PDF final.
	private $images = array();

	public function __construct( $w = 792, $h = 612 ) {
		$this->w = $w;
		$this->h = $h;
	}

	public function set_stroke_color( $r, $g, $b ) {
		$this->ops .= sprintf( "%.3F %.3F %.3F RG\n", $r, $g, $b );
	}

	public function set_fill_color( $r, $g, $b ) {
		$this->ops .= sprintf( "%.3F %.3F %.3F rg\n", $r, $g, $b );
	}

	public function set_line_width( $lw ) {
		$this->ops .= sprintf( "%.2F w\n", $lw );
	}

	public function rect( $x, $y, $w, $h, $mode = 'S' ) {
		$this->ops .= sprintf( "%.2F %.2F %.2F %.2F re %s\n", $x, $y, $w, $h, $mode );
	}

	public function line( $x1, $y1, $x2, $y2 ) {
		$this->ops .= sprintf( "%.2F %.2F m %.2F %.2F l S\n", $x1, $y1, $x2, $y2 );
	}

	/** Espaciado extra entre caracteres (operador Tc), para texto tipo "eyebrow". */
	public function set_char_spacing( $cs ) {
		$this->ops .= sprintf( "BT %.2F Tc ET\n", $cs );
	}

	public function text( $x, $y, $utf8, $bold = false, $size = 12 ) {
		$font   = $bold ? '/F2' : '/F1';
		$latin1 = rd_pdf_to_latin1( $utf8 );
		$esc    = rd_pdf_esc( $latin1 );
		$this->ops .= sprintf( "BT %s %.2F Tf %.2F %.2F Td (%s) Tj ET\n", $font, $size, $x, $y, $esc );
	}

	/** Escribe texto centrado horizontalmente en $cx; devuelve el ancho usado. */
	public function text_centered( $cx, $y, $utf8, $bold = false, $size = 12 ) {
		$latin1 = rd_pdf_to_latin1( $utf8 );
		$w      = rd_pdf_str_width_latin1( $latin1, $size, $bold );
		$this->text( $cx - ( $w / 2 ), $y, $utf8, $bold, $size );
		return $w;
	}

	/** Escribe texto terminando exactamente en $right_x (alineado a la derecha). */
	public function text_right( $right_x, $y, $utf8, $bold = false, $size = 12 ) {
		$latin1 = rd_pdf_to_latin1( $utf8 );
		$w      = rd_pdf_str_width_latin1( $latin1, $size, $bold );
		$this->text( $right_x - $w, $y, $utf8, $bold, $size );
		return $w;
	}

	/**
	 * Carga una imagen (logotipo) desde una ruta del servidor. Si es JPEG
	 * se incrusta tal cual; si es PNG/GIF/WEBP (que pueden tener
	 * transparencia) se "aplana" con GD sobre el color de fondo indicado
	 * en $bg y se reconvierte a JPEG en memoria (evita tener que
	 * implementar el canal alfa dentro del PDF). Aplanar sobre el mismo
	 * color que va a rodear a la imagen (en vez de blanco a fuerzas) es
	 * lo que hace que un logotipo con fondo transparente se vea "flotando"
	 * sobre ese color en lugar de traer su propio recuadro blanco. Si algo
	 * falla, simplemente no hay logotipo y el resto del certificado se
	 * genera igual.
	 *
	 * @param string $path Ruta de la imagen en el servidor.
	 * @param array  $bg   Color de fondo [r, g, b] (0-255) sobre el que se
	 *                     aplana la transparencia. Blanco por defecto.
	 */
	public function set_image( $path, $bg = array( 255, 255, 255 ) ) {
		if ( ! $path || ! file_exists( $path ) ) {
			return false;
		}
		$info = @getimagesize( $path );
		if ( ! $info ) {
			return false;
		}
		list( $width, $height, $type ) = $info;
		if ( $width <= 0 || $height <= 0 ) {
			return false;
		}

		if ( IMAGETYPE_JPEG === $type ) {
			// Evitar JPEG en CMYK: el color quedaría mal con /DeviceRGB.
			if ( isset( $info['channels'] ) && 4 === (int) $info['channels'] ) {
				return false;
			}
			$bytes = @file_get_contents( $path );
			if ( false === $bytes ) {
				return false;
			}
			$this->images[] = array( 'bytes' => $bytes, 'w' => $width, 'h' => $height );
			return count( $this->images ) - 1;
		}

		if ( ! function_exists( 'imagecreatetruecolor' ) ) {
			return false;
		}

		$src = null;
		if ( IMAGETYPE_PNG === $type ) {
			$src = @imagecreatefrompng( $path );
		} elseif ( IMAGETYPE_GIF === $type ) {
			$src = @imagecreatefromgif( $path );
		} elseif ( IMAGETYPE_WEBP === $type && function_exists( 'imagecreatefromwebp' ) ) {
			$src = @imagecreatefromwebp( $path );
		}
		if ( ! $src ) {
			return false;
		}

		$bg_r   = isset( $bg[0] ) ? (int) $bg[0] : 255;
		$bg_g   = isset( $bg[1] ) ? (int) $bg[1] : 255;
		$bg_b   = isset( $bg[2] ) ? (int) $bg[2] : 255;
		$canvas = imagecreatetruecolor( $width, $height );
		$fondo  = imagecolorallocate( $canvas, $bg_r, $bg_g, $bg_b );
		imagefill( $canvas, 0, 0, $fondo );
		imagealphablending( $canvas, true );
		imagecopy( $canvas, $src, 0, 0, 0, 0, $width, $height );

		ob_start();
		imagejpeg( $canvas, null, 90 );
		$bytes = ob_get_clean();
		imagedestroy( $canvas );
		imagedestroy( $src );

		if ( ! $bytes ) {
			return false;
		}
		$this->images[] = array( 'bytes' => $bytes, 'w' => $width, 'h' => $height );
		return count( $this->images ) - 1;
	}

	/**
	 * Dibuja la imagen $index (devuelto por set_image()) centrada
	 * horizontalmente, con su borde superior en $top_y, ajustada dentro
	 * de $max_w x $max_h conservando proporción. Devuelve el alto (en
	 * puntos) que ocupó, o 0 si el índice no es válido.
	 */
	public function draw_image_centered_top( $index, $top_y, $max_w, $max_h ) {
		if ( ! isset( $this->images[ $index ] ) ) {
			return 0;
		}
		$iw = $this->images[ $index ]['w'];
		$ih = $this->images[ $index ]['h'];
		if ( $iw <= 0 || $ih <= 0 ) {
			return 0;
		}
		$ratio = $iw / $ih;
		$dw    = $max_w;
		$dh    = $dw / $ratio;
		if ( $dh > $max_h ) {
			$dh = $max_h;
			$dw = $dh * $ratio;
		}
		$x = ( $this->w - $dw ) / 2;
		$y = $top_y - $dh;
		$this->ops .= sprintf( "q %.2F 0 0 %.2F %.2F %.2F cm /Im%d Do Q\n", $dw, $dh, $x, $y, $index );
		return $dh;
	}

	/**
	 * Igual que draw_image_centered_top() pero anclada por su borde
	 * inferior en $bottom_y (útil para una firma que debe "pararse" justo
	 * encima de una línea, sin importar su alto). Devuelve
	 * array( $ancho_usado, $alto_usado ) en puntos, o array( 0, 0 ) si el
	 * índice no es válido.
	 */
	public function draw_image_centered_bottom( $index, $bottom_y, $max_w, $max_h ) {
		if ( ! isset( $this->images[ $index ] ) ) {
			return array( 0, 0 );
		}
		$iw = $this->images[ $index ]['w'];
		$ih = $this->images[ $index ]['h'];
		if ( $iw <= 0 || $ih <= 0 ) {
			return array( 0, 0 );
		}
		$ratio = $iw / $ih;
		$dw    = $max_w;
		$dh    = $dw / $ratio;
		if ( $dh > $max_h ) {
			$dh = $max_h;
			$dw = $dh * $ratio;
		}
		$x = ( $this->w - $dw ) / 2;
		$this->ops .= sprintf( "q %.2F 0 0 %.2F %.2F %.2F cm /Im%d Do Q\n", $dw, $dh, $x, $bottom_y, $index );
		return array( $dw, $dh );
	}

	/**
	 * Igual que draw_image_centered_top() pero con el borde derecho de la
	 * imagen anclado en $right_x en vez de centrarla. Devuelve
	 * array( $ancho_usado, $alto_usado ) en puntos, o array( 0, 0 ) si el
	 * índice no es válido.
	 */
	public function draw_image_top_right( $index, $top_y, $right_x, $max_w, $max_h ) {
		if ( ! isset( $this->images[ $index ] ) ) {
			return array( 0, 0 );
		}
		$iw = $this->images[ $index ]['w'];
		$ih = $this->images[ $index ]['h'];
		if ( $iw <= 0 || $ih <= 0 ) {
			return array( 0, 0 );
		}
		$ratio = $iw / $ih;
		$dw    = $max_w;
		$dh    = $dw / $ratio;
		if ( $dh > $max_h ) {
			$dh = $max_h;
			$dw = $dh * $ratio;
		}
		$x = $right_x - $dw;
		$y = $top_y - $dh;
		$this->ops .= sprintf( "q %.2F 0 0 %.2F %.2F %.2F cm /Im%d Do Q\n", $dw, $dh, $x, $y, $index );
		return array( $dw, $dh );
	}

	/** Arma y devuelve el PDF completo como string binario. */
	public function output() {
		$n_font1     = 5;
		$n_font2     = 6;
		$n_image_base = 7; // Las imágenes ocupan los números de objeto a partir de aquí.

		$xobject_entries = array();
		foreach ( $this->images as $idx => $img ) {
			$xobject_entries[] = "/Im{$idx} " . ( $n_image_base + $idx ) . ' 0 R';
		}

		$resources = "<< /Font << /F1 $n_font1 0 R /F2 $n_font2 0 R >>";
		if ( ! empty( $xobject_entries ) ) {
			$resources .= ' /XObject << ' . implode( ' ', $xobject_entries ) . ' >>';
		}
		$resources .= ' >>';

		$page_dict = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$this->w} {$this->h}] /Resources $resources /Contents 4 0 R >>";

		$stream_len  = strlen( $this->ops );
		$content_obj = "<< /Length $stream_len >>\nstream\n{$this->ops}endstream";

		$objects    = array();
		$objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
		$objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
		$objects[3] = $page_dict;
		$objects[4] = $content_obj;
		$objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
		$objects[6] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

		foreach ( $this->images as $idx => $img ) {
			$img_bytes = $img['bytes'];
			$img_len   = strlen( $img_bytes );
			$obj_num   = $n_image_base + $idx;
			$objects[ $obj_num ] = "<< /Type /XObject /Subtype /Image /Width {$img['w']} /Height {$img['h']} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length $img_len >>\nstream\n$img_bytes\nendstream";
		}

		$pdf     = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
		$offsets = array();
		ksort( $objects );
		foreach ( $objects as $num => $body ) {
			$offsets[ $num ] = strlen( $pdf );
			$pdf            .= "$num 0 obj\n$body\nendobj\n";
		}

		$xref_offset = strlen( $pdf );
		$count       = max( array_keys( $objects ) ) + 1;
		$pdf        .= "xref\n0 $count\n";
		$pdf        .= "0000000000 65535 f\r\n";
		for ( $i = 1; $i < $count; $i++ ) {
			if ( isset( $offsets[ $i ] ) ) {
				$pdf .= sprintf( "%010d 00000 n\r\n", $offsets[ $i ] );
			} else {
				$pdf .= "0000000000 00000 f\r\n";
			}
		}
		$pdf .= "trailer\n<< /Size $count /Root 1 0 R >>\nstartxref\n$xref_offset\n%%EOF";

		return $pdf;
	}
}
