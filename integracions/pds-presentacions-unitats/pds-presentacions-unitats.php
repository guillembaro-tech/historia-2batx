<?php
/**
 * Plugin Name: PDS · Presentacions de les unitats
 * Description: Pestanya «Presentació» a les unitats amb el disseny v4 (ESO i 1r de Batxillerat). Si existeix uploads/pds-presentacions/unitat-ID/manifest.json, la unitat mostra un visor de les diapositives, les notes i els botons per descarregar-la en .pptx i en PDF. Les unitats sense presentació no canvien.
 * Version: 0.1.0
 * Author: Professor de socials
 * Requires PHP: 8.0
 * Text Domain: pds-presentacions-unitats
 *
 * @package pds-presentacions-unitats
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PDSP_VER', '0.1.0' );
define( 'PDSP_DIR', plugin_dir_path( __FILE__ ) );
define( 'PDSP_URL', plugin_dir_url( __FILE__ ) );

/** Carpeta i adreça de la presentació d'una unitat. */
function pdsp_lloc( int $id ): array {
	$rel = 'uploads/pds-presentacions/unitat-' . $id . '/';
	return array( WP_CONTENT_DIR . '/' . $rel, content_url( $rel ) );
}

/**
 * Dades de la presentació d'una unitat, o null si no en té.
 *
 * @return array{versio:string,pptx:string,pdf:string,mida_pptx:int,mida_pdf:int,url:string,diapositives:array}|null
 */
function pdsp_dades( int $id ): ?array {
	static $cache = array();
	if ( array_key_exists( $id, $cache ) ) {
		return $cache[ $id ];
	}
	list( $dir, $url ) = pdsp_lloc( $id );
	$fitxer            = $dir . 'manifest.json';
	$m                 = null;
	if ( $id > 0 && is_readable( $fitxer ) ) {
		$m = json_decode( (string) file_get_contents( $fitxer ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- fitxer local.
		if ( ! is_array( $m ) || empty( $m['diapositives'] ) || empty( $m['pptx'] ) ) {
			$m = null;
		} else {
			$m['url'] = $url;
		}
	}
	$cache[ $id ] = $m;
	return $m;
}

/** Mida d'un fitxer en MB, amb coma decimal. */
function pdsp_mb( int $bytes ): string {
	return number_format_i18n( $bytes / 1048576, 1 ) . ' MB';
}

/** HTML de la secció «Presentació», amb el visor i les descàrregues. */
function pdsp_seccio( array $p ): string {
	$dia  = $p['diapositives'];
	$v    = rawurlencode( (string) ( $p['versio'] ?? PDSP_VER ) );
	$base = $p['url'];
	ob_start();
	?>
<section class="um-sec pdsp-pres" id="presentacio" aria-labelledby="pdsp-titol">
	<header><span class="um-num">Presentació</span><h2 id="pdsp-titol">Presentació de la unitat</h2></header>
	<p>Les idees de cada apartat amb imatges, mapes i dibuixos, i el «Comprova-ho» per repassar. Passa les diapositives amb les fletxes, lliscant el dit al mòbil o triant-ne una de la llista.</p>
	<div class="pdsp-v" data-base="<?php echo esc_url( $base ); ?>" data-v="<?php echo esc_attr( $v ); ?>">
		<div class="pdsp-stage">
			<img src="<?php echo esc_url( $base . $dia[0]['img'] . '?v=' . $v ); ?>" width="1600" height="900" alt="<?php echo esc_attr( 'Diapositiva 1. ' . $dia[0]['t'] ); ?>" decoding="async">
			<button type="button" class="pdsp-nav pdsp-prev" aria-label="Diapositiva anterior" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
			<button type="button" class="pdsp-nav pdsp-next" aria-label="Diapositiva següent"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></button>
		</div>
		<div class="pdsp-bar">
			<label class="pdsp-sr" for="pdsp-tria">Tria una diapositiva</label>
			<select id="pdsp-tria" class="pdsp-tria">
				<?php
				$grup = null;
				foreach ( $dia as $i => $d ) {
					if ( ( $d['s'] ?? '' ) !== $grup ) {
						if ( null !== $grup ) {
							echo '</optgroup>';
						}
						$grup = (string) ( $d['s'] ?? '' );
						echo '<optgroup label="' . esc_attr( $grup ) . '">';
					}
					echo '<option value="' . (int) $i . '">' . (int) ( $i + 1 ) . '. ' . esc_html( (string) $d['t'] ) . '</option>';
				}
				echo null !== $grup ? '</optgroup>' : '';
				?>
			</select>
			<span class="pdsp-comp" aria-live="polite">1 / <?php echo count( $dia ); ?></span>
			<button type="button" class="um-btn pdsp-full">Pantalla completa</button>
		</div>
	</div>
	<div class="um-box um-near pdsp-notes">
		<span class="um-box-t">Notes de la diapositiva</span>
		<p><?php echo esc_html( (string) ( $dia[0]['n'] ?? '' ) ); ?></p>
	</div>
	<div class="um-box um-key pdsp-baixa">
		<span class="um-box-t">Descarrega-la</span>
		<p>El fitxer de PowerPoint s'obre i s'edita a Presentacions de Google. Puja'l a Google Drive i obre'l amb Presentacions de Google. També el pots obrir amb PowerPoint o amb LibreOffice.</p>
		<p class="pdsp-btns">
			<a class="um-quiz-btn" href="<?php echo esc_url( $base . $p['pptx'] . '?v=' . $v ); ?>" download>Descarrega per a Google Slides (.pptx, <?php echo esc_html( pdsp_mb( (int) ( $p['mida_pptx'] ?? 0 ) ) ); ?>)</a>
			<?php if ( ! empty( $p['pdf'] ) ) : ?>
				<a class="um-btn pdsp-pdf" href="<?php echo esc_url( $base . $p['pdf'] . '?v=' . $v ); ?>" download>Descarrega en PDF (<?php echo esc_html( pdsp_mb( (int) ( $p['mida_pdf'] ?? 0 ) ) ); ?>)</a>
			<?php endif; ?>
		</p>
	</div>
	<script type="application/json" class="pdsp-dades"><?php echo wp_json_encode( array_map( static fn( $d ) => array( 'img' => (string) $d['img'], 't' => (string) $d['t'], 'n' => (string) ( $d['n'] ?? '' ) ), $dia ), JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP ); ?></script>
</section>
	<?php
	return (string) ob_get_clean();
}

/*
 * Afegeix la secció al final de l'article de la unitat i una línia a la capçalera.
 * El filtre pds_v4_html el crida pds_v4_render() (sandbox pds-v4-unitats.php).
 */
add_filter(
	'pds_v4_html',
	static function ( $html, $id ) {
		$p = pdsp_dades( (int) $id );
		if ( ! $p ) {
			return $html;
		}
		$html = (string) $html;
		$sec  = pdsp_seccio( $p );
		$pos  = strrpos( $html, '</article>' );
		$html = false === $pos ? $html . $sec : substr_replace( $html, $sec . "\n", $pos, 0 );
		$li   = '<li>Presentació (' . count( $p['diapositives'] ) . ' diapositives)</li>';
		$html = preg_replace( '#(<ul class="um-facts">.*?)(</ul>)#s', '$1 ' . $li . "\n  $2", $html, 1 );
		return $html;
	},
	10,
	2
);

// Estils i visor, només a les unitats que tenen presentació.
add_action(
	'wp_enqueue_scripts',
	static function () {
		if ( ! function_exists( 'pds_v4_unit_id' ) ) {
			return;
		}
		$id = pds_v4_unit_id();
		if ( ! $id || ! pdsp_dades( $id ) ) {
			return;
		}
		wp_enqueue_style( 'pdsp', PDSP_URL . 'assets/presentacio.css', array( 'pds-um' ), (string) filemtime( PDSP_DIR . 'assets/presentacio.css' ) );
		wp_enqueue_script( 'pdsp', PDSP_URL . 'assets/presentacio.js', array( 'pds-um-tabs' ), (string) filemtime( PDSP_DIR . 'assets/presentacio.js' ), true );
	},
	22
);
