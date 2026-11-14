<?php
/**
 * Vídeos dels temes. Cada vídeo és a YouTube i es posa dins el text del tema amb el codi curt
 * [pds_video id="…" titol="…" durada="…"], just abans del subapartat que explica.
 *
 * - La pàgina només carrega la miniatura pròpia (desada a la mediateca). YouTube no es carrega fins que
 *   l'alumne fa clic, i llavors s'obre el reproductor de privacitat millorada (youtube-nocookie.com)
 *   amb els subtítols en català activats.
 * - Al PDF i al Word, el vídeo surt com un codi QR que porta a youtu.be (PNG a uploads/pds-2batx/videos/).
 * - La llista de YouTube del tema és a la meta _pds2_llista_videos (identificador PL…).
 * - En desar un tema, es baixen les miniatures que falten (la miniatura del vídeo a YouTube, en WebP de 640 px).
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_shortcode( 'pds_video', 'pds2_video_sc' );

/** Identificador de YouTube vàlid (11 caràcters) o cadena buida. */
function pds2_video_id( $id ): string {
	$id = trim( (string) $id );
	return preg_match( '/^[A-Za-z0-9_-]{11}$/', $id ) ? $id : '';
}

/** Identificador de la llista de YouTube del tema (meta _pds2_llista_videos) o cadena buida. */
function pds2_video_llista( int $post_id ): string {
	$l = trim( (string) get_post_meta( $post_id, '_pds2_llista_videos', true ) );
	if ( preg_match( '#[?&]list=([A-Za-z0-9_-]+)#', $l, $m ) ) {
		$l = $m[1];
	}
	return preg_match( '/^PL[A-Za-z0-9_-]{8,40}$/', $l ) ? $l : '';
}

/**
 * Vídeo resum del tema (meta _pds2_video_resum, amb id, durada i titol), o null si no n'hi ha.
 * Surt a «Abans de començar», sense número d'apartat.
 */
function pds2_video_resum( int $post_id ): ?array {
	$m = get_post_meta( $post_id, '_pds2_video_resum', true );
	if ( ! is_array( $m ) ) {
		return null;
	}
	$id = pds2_video_id( $m['id'] ?? '' );
	if ( '' === $id ) {
		return null;
	}
	return array(
		'id'     => $id,
		'durada' => trim( (string) ( $m['durada'] ?? '' ) ),
		'titol'  => trim( (string) ( $m['titol'] ?? '' ) ),
	);
}

/** Targeta del vídeo resum del tema, amb l'etiqueta «Resum del tema». */
function pds2_video_resum_html( int $post_id ): string {
	$r = pds2_video_resum( $post_id );
	if ( ! $r ) {
		return '';
	}
	return pds2_video_sc(
		array(
			'id'       => $r['id'],
			'titol'    => $r['titol'],
			'durada'   => $r['durada'],
			'etiqueta' => 'Resum del tema',
		)
	);
}

/** Durada «m:ss» en format ISO 8601 (PT6M2S) per a l'atribut datetime. */
function pds2_video_iso( string $durada ): string {
	if ( ! preg_match( '/^(?:(\d+):)?(\d{1,2}):(\d{2})$/', $durada, $m ) ) {
		return '';
	}
	$h = (int) $m[1];
	return 'PT' . ( $h ? $h . 'H' : '' ) . (int) $m[2] . 'M' . (int) $m[3] . 'S';
}

/** Miniatura d'un vídeo a la mediateca (adjunt amb la meta _pds2_yt), o 0 si encara no hi és. */
function pds2_video_miniatura_id( string $yt ): int {
	static $cache = array();
	if ( isset( $cache[ $yt ] ) ) {
		return $cache[ $yt ];
	}
	$q = get_posts(
		array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'meta_key'       => '_pds2_yt', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- poques consultes, amb memòria cau.
			'meta_value'     => $yt, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			'numberposts'    => 1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
			'orderby'        => 'ID',
			'order'          => 'DESC',
		)
	);
	$id = (int) ( $q[0] ?? 0 );
	if ( $id ) {
		$cache[ $yt ] = $id; // Només es recorden les que hi són: una miniatura nova s'ha de trobar a la consulta següent.
	}
	return $id;
}

/** Baixa la miniatura del vídeo de YouTube, la passa a WebP de 640x360 i la desa a la mediateca. */
function pds2_video_crea_miniatura( string $yt, int $post_id = 0 ): int {
	$yt = pds2_video_id( $yt );
	if ( '' === $yt ) {
		return 0;
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$tmp = new WP_Error( 'pds2_video', 'Sense miniatura' );
	foreach ( array( 'maxresdefault', 'sddefault', 'hqdefault' ) as $q ) {
		$tmp = download_url( 'https://i.ytimg.com/vi/' . $yt . '/' . $q . '.jpg', 30 );
		if ( ! is_wp_error( $tmp ) ) {
			break;
		}
	}
	if ( is_wp_error( $tmp ) ) {
		return 0;
	}
	$ed = wp_get_image_editor( $tmp );
	if ( is_wp_error( $ed ) ) {
		wp_delete_file( $tmp );
		return 0;
	}
	$ed->resize( 640, 360, true );
	$ed->set_quality( 82 );
	$desat = $ed->save( trailingslashit( get_temp_dir() ) . 'pds2-video-' . $yt . '.webp', 'image/webp' );
	wp_delete_file( $tmp );
	if ( is_wp_error( $desat ) || empty( $desat['path'] ) ) {
		return 0;
	}
	$att = media_handle_sideload(
		array(
			'name'     => 'video-' . $yt . '.webp',
			'tmp_name' => $desat['path'],
		),
		$post_id,
		'Miniatura del vídeo ' . $yt
	);
	if ( is_wp_error( $att ) ) {
		wp_delete_file( $desat['path'] );
		return 0;
	}
	update_post_meta( (int) $att, '_pds2_yt', $yt );
	update_post_meta( (int) $att, '_wp_attachment_image_alt', '' );
	return (int) $att;
}

/** Vídeos d'un tema (codis curts del text), amb la miniatura creada si encara no hi era. */
function pds2_videos_prepara( int $post_id ): array {
	$text = (string) get_post_field( 'post_content', $post_id );
	$out  = array();
	$resum = pds2_video_resum( $post_id );
	if ( $resum ) {
		$att                 = pds2_video_miniatura_id( $resum['id'] );
		$out[ $resum['id'] ] = $att ? $att : pds2_video_crea_miniatura( $resum['id'], $post_id );
	}
	if ( ! has_shortcode( $text, 'pds_video' ) ) {
		return $out;
	}
	preg_match_all( '/' . get_shortcode_regex( array( 'pds_video' ) ) . '/s', $text, $m, PREG_SET_ORDER );
	foreach ( $m as $sc ) {
		$a  = shortcode_parse_atts( $sc[3] );
		$yt = pds2_video_id( is_array( $a ) ? ( $a['id'] ?? '' ) : '' );
		if ( '' === $yt || isset( $out[ $yt ] ) ) {
			continue;
		}
		$att        = pds2_video_miniatura_id( $yt );
		$out[ $yt ] = $att ? $att : pds2_video_crea_miniatura( $yt, $post_id );
	}
	return $out;
}

add_action(
	'save_post_tema_pau',
	static function ( $post_id ) {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}
		pds2_videos_prepara( (int) $post_id );
	},
	20
);

/**
 * Codi QR (PNG) que porta a youtu.be, desat a uploads/pds-2batx/videos/. Es fa la primera vegada que cal.
 * Biblioteca QRCode de Kazuhiko Arase (llicència MIT), a lib/qrcode.php.
 *
 * @return array{url:string,w:int}|null
 */
function pds2_video_qr( string $yt ): ?array {
	$up  = wp_upload_dir();
	$dir = trailingslashit( $up['basedir'] ) . 'pds-2batx/videos/';
	$url = trailingslashit( $up['baseurl'] ) . 'pds-2batx/videos/';
	$f   = 'qr-' . $yt . '.png';
	if ( ! file_exists( $dir . $f ) ) {
		if ( ! function_exists( 'imagecreatetruecolor' ) || ! wp_mkdir_p( $dir ) ) {
			return null;
		}
		if ( ! class_exists( 'QRCode' ) ) {
			require_once PDS2_DIR . 'lib/qrcode.php';
		}
		$qr = QRCode::getMinimumQRCode( 'https://youtu.be/' . $yt, QR_ERROR_CORRECT_LEVEL_M );
		$n  = (int) $qr->getModuleCount();
		$m  = 8;
		$s  = ( $n + 8 ) * $m;
		$im = imagecreatetruecolor( $s, $s );
		$bl = imagecolorallocate( $im, 255, 255, 255 );
		$ng = imagecolorallocate( $im, 0, 0, 0 );
		imagefill( $im, 0, 0, $bl );
		for ( $r = 0; $r < $n; $r++ ) {
			for ( $c = 0; $c < $n; $c++ ) {
				if ( $qr->isDark( $r, $c ) ) {
					imagefilledrectangle( $im, ( $c + 4 ) * $m, ( $r + 4 ) * $m, ( $c + 5 ) * $m - 1, ( $r + 5 ) * $m - 1, $ng );
				}
			}
		}
		$ok = imagepng( $im, $dir . $f, 9 );
		imagedestroy( $im );
		if ( ! $ok ) {
			return null;
		}
	}
	$sz = @getimagesize( $dir . $f ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	return array(
		'url' => $url . $f . '?v=' . filemtime( $dir . $f ),
		'w'   => (int) ( $sz[0] ?? 296 ),
	);
}

/**
 * Targeta del vídeo. El número («Vídeo 1.1», apartat i ordre) el posa pds2_videos_numera() quan es divideix el text.
 * A la pantalla es veu la miniatura amb el botó; a la impressió i al Word, el botó desapareix i es veu el codi QR.
 * El comentari final marca on acaba la targeta, per saber quin subapartat comença amb un vídeo.
 */
function pds2_video_sc( $atts ): string {
	$a  = shortcode_atts(
		array(
			'id'     => '',
			'titol'  => '',
			'durada'   => '',
			'etiqueta' => '',
		),
		$atts,
		'pds_video'
	);
	$yt = pds2_video_id( $a['id'] );
	if ( '' === $yt ) {
		return '';
	}
	$titol  = trim( (string) $a['titol'] );
	$titol  = '' !== $titol ? $titol : 'Vídeo del tema';
	$durada = trim( (string) $a['durada'] );
	$iso    = pds2_video_iso( $durada );
	$att    = pds2_video_miniatura_id( $yt );
	$img    = $att ? wp_get_attachment_image(
		$att,
		'full',
		false,
		array(
			'alt'      => '',
			'class'    => 'pds2-vid-img',
			'loading'  => 'lazy',
			'decoding' => 'async',
			'sizes'    => '(max-width: 600px) 132px, 208px',
		)
	) : '<span class="pds2-vid-img pds2-vid-buit"></span>';
	$qr = pds2_video_qr( $yt );

	$h  = '<figure class="pds2-vid" data-yt="' . esc_attr( $yt ) . '">';
	$h .= '<button type="button" class="pds2-vid-play" aria-label="' . esc_attr( 'Mira el vídeo «' . $titol . '»' ) . '">' . $img . '<span class="pds2-vid-ic" aria-hidden="true"></span></button>';
	if ( $qr ) {
		$h .= '<img class="pds2-vid-qr" src="' . esc_url( $qr['url'] ) . '" width="' . (int) $qr['w'] . '" height="' . (int) $qr['w'] . '" alt="' . esc_attr( 'Codi QR del vídeo «' . $titol . '»' ) . '" decoding="async" loading="lazy" fetchpriority="low">';
	}
	$h .= '<figcaption class="pds2-vid-t">';
	$etiq = trim( (string) $a['etiqueta'] );
	// Amb etiqueta (el resum del tema), el vídeo no porta número d'apartat: pds2_videos_numera() només numera «Vídeo».
	$h .= '<span class="pds2-vid-k">' . ( '' !== $etiq ? '<span class="pds2-vid-n pds2-vid-resum">' . esc_html( $etiq ) . '</span>' : '<span class="pds2-vid-n">Vídeo</span>' );
	if ( '' !== $durada ) {
		$h .= ' · ' . ( $iso ? '<time datetime="' . esc_attr( $iso ) . '">' . esc_html( $durada ) . '</time>' : esc_html( $durada ) );
	}
	$h .= '</span> <strong class="pds2-vid-tit">' . esc_html( $titol ) . '</strong> ';
	$h .= '<span class="pds2-vid-nota">A YouTube, <a href="' . esc_url( 'https://youtu.be/' . $yt ) . '" target="_blank" rel="noopener">youtu.be/' . esc_html( $yt ) . '</a>';
	$llista = pds2_video_llista( (int) ( get_the_ID() ? get_the_ID() : get_queried_object_id() ) );
	if ( '' !== $llista ) {
		$h .= '<span class="pds2-vid-llista"> · <a href="' . esc_url( 'https://www.youtube.com/playlist?list=' . $llista ) . '" target="_blank" rel="noopener">tots els vídeos del tema</a></span>';
	}
	$h .= '</span>';
	$h .= '</figcaption></figure><!--/pds2-vid-->';
	return $h;
}

/**
 * Numera els vídeos d'un apartat («Vídeo 1.1», «Vídeo 1.2»…) i marca a l'índex els subapartats que comencen amb un vídeo.
 *
 * @param string $cos    HTML de l'apartat, amb els subtítols ja convertits en h3 amb àncora.
 * @param array  $sub    Subapartats de l'índex (s'hi afegeix 'video' => true).
 * @param int    $apartat Número de l'apartat (1, 2…).
 * @param int    $videos  Nombre de vídeos de l'apartat.
 */
function pds2_videos_numera( string $cos, array &$sub, int $apartat, ?int &$videos = 0 ): string {
	$n   = 0;
	$cos = (string) preg_replace_callback(
		'#<span class="pds2-vid-n">Vídeo</span>#u',
		static function () use ( &$n, $apartat ) {
			++$n;
			return '<span class="pds2-vid-n">Vídeo ' . $apartat . '.' . $n . '</span>';
		},
		$cos
	);
	$videos = $n;
	if ( $n && preg_match_all( '#<!--/pds2-vid-->(?:\s|</?p>)*<h3 id="(ap\d+-\d+)"#', $cos, $m ) ) {
		$ids = array_flip( $m[1] );
		foreach ( $sub as $k => $s ) {
			if ( isset( $ids[ $s['id'] ] ) ) {
				$sub[ $k ]['video'] = true;
			}
		}
	}
	return $cos;
}

/** Full d'estil i script dels vídeos, només a la pàgina dels temes que en tenen. */
add_action(
	'wp_enqueue_scripts',
	static function () {
		if ( 'tema' !== pds2_vista() || is_404() ) {
			return;
		}
		if ( ! has_shortcode( (string) get_post_field( 'post_content', get_queried_object_id() ), 'pds_video' ) && ! pds2_video_resum( (int) get_queried_object_id() ) ) {
			return;
		}
		wp_enqueue_style( 'pds2-videos', PDS2_URL . 'assets/css/videos.css', wp_style_is( 'pds2-tema-v4', 'enqueued' ) ? array( 'pds2-tema-v4' ) : array(), PDS2_VER );
		wp_enqueue_script( 'pds2-videos', PDS2_URL . 'assets/js/videos.js', array(), PDS2_VER . '.' . filemtime( PDS2_DIR . 'assets/js/videos.js' ), true );
	},
	22
);
