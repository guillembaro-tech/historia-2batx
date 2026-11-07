<?php
/**
 * Fitxa d'un mapa. Versió completa i muda (botó per canviar-les), PDF per imprimir, amb capçalera
 * o sense, dades del mapa, on surt i llicència.
 *
 * @package pds-mapes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$id    = (int) get_queried_object_id();
$img_c = (int) pdsm_camp( 'pdsm_img_complet', $id );
$img_m = (int) pdsm_camp( 'pdsm_img_mut', $id );
$pdf   = array();
foreach ( array( 'complet', 'mut', 'complet_net', 'mut_net' ) as $k ) {
	$a         = (int) pdsm_camp( 'pdsm_pdf_' . $k, $id );
	$pdf[ $k ] = $a ? wp_get_attachment_url( $a ) : '';
}
$per   = pdsm_termes( $id, 'pdsm_periode' );
$ter   = pdsm_termes( $id, 'pdsm_territori' );
$tip   = pdsm_termes( $id, 'pdsm_tipus' );
$cur   = pdsm_termes( $id, 'curs' );
$data  = (string) pdsm_camp( 'pdsm_data', $id );
$desc  = (string) pdsm_camp( 'pdsm_descripcio', $id );
$desm  = (string) pdsm_camp( 'pdsm_descripcio_mut', $id );
$fonts = array_filter( array_map( 'trim', preg_split( '/\R/', (string) pdsm_camp( 'pdsm_fonts', $id ) ) ) );
$autor = (string) pdsm_camp( 'pdsm_autor', $id ) ?: 'professordesocials.cat';
$llic  = pdsm_llicencies()[ (string) pdsm_camp( 'pdsm_llicencia', $id ) ?: 'cc-by-sa-4.0' ] ?? pdsm_llicencies()['cc-by-sa-4.0'];
$ap    = (array) pdsm_camp( 'pdsm_aparicions', $id );
$base  = get_post_type_archive_link( 'mapa' );

$enllacos = static function ( array $termes ): string {
	return implode( ', ', array_map( static fn( $t ) => '<a href="' . esc_url( get_term_link( $t ) ) . '">' . esc_html( $t->name ) . '</a>', $termes ) );
};
$cursos = implode(
	', ',
	array_map( static fn( $t ) => '<a href="' . esc_url( home_url( '/mapes/curs/' . $t->slug . '/' ) ) . '">' . esc_html( $t->name ) . '</a>', $cur )
);

// Altres mapes del mateix període o, si no n'hi ha prou, del mateix territori.
$rel = array();
foreach ( array( array( 'pdsm_periode', $per ), array( 'pdsm_territori', $ter ) ) as [ $tax, $termes ] ) {
	if ( ! $termes || count( $rel ) >= 4 ) {
		continue;
	}
	$rel = array_unique(
		array_merge(
			$rel,
			get_posts(
				array(
					'post_type'      => 'mapa',
					'post_status'    => pdsm_estats(),
					'posts_per_page' => 4,
					'post__not_in'   => array_merge( array( $id ), $rel ),
					'fields'         => 'ids',
					'tax_query'      => array( array( 'taxonomy' => $tax, 'field' => 'term_id', 'terms' => wp_list_pluck( $termes, 'term_id' ) ) ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				)
			)
		)
	);
}
$rel = array_slice( $rel, 0, 4 );

$eyebrow = ( $tip && 'cartografia' !== $tip[0]->slug ) ? 'Mapa ' . mb_strtolower( $tip[0]->name ) : 'Mapa';
if ( $per ) {
	$eyebrow .= ' · ' . $per[0]->name;
}
$dades_img = static function ( int $a ): array {
	$m = wp_get_attachment_metadata( $a );
	return array( (int) ( $m['width'] ?? 0 ), (int) ( $m['height'] ?? 0 ) );
};

get_header();
?>
<div class="<?php echo esc_attr( pdsm_hero_classes() ); ?> pdsm-fitxa-pg" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / <a href="<?php echo esc_url( $base ); ?>">Mapes</a><?php if ( $per ) : ?> / <a href="<?php echo esc_url( get_term_link( $per[0] ) ); ?>"><?php echo esc_html( $per[0]->name ); ?></a><?php endif; ?></nav>
			<p class="um-eyebrow"><?php echo esc_html( $eyebrow ); ?></p>
			<h1><?php echo esc_html( pdsm_titol( $id ) ); ?></h1>
			<?php if ( has_excerpt( $id ) ) : ?><p class="um-guide"><?php echo esc_html( get_the_excerpt( $id ) ); ?></p><?php endif; ?>
		</div>
	</header>

	<div class="um-wrap pdsm-wrap">
		<?php if ( 'private' === get_post_status( $id ) ) : ?>
			<p class="pdsm-avis">Mapa en privat. Només el veuen els administradors.</p>
		<?php endif; ?>
		<div class="pdsm-fitxa">
			<div class="pdsm-main">
				<section class="pdsm-visor" aria-label="Mapa">
					<?php if ( $img_m ) : ?>
						<div class="pdsm-seg" role="group" aria-label="Versió del mapa">
							<button type="button" class="on" aria-pressed="true" data-pdsm-v="complet">Mapa complet</button>
							<button type="button" aria-pressed="false" data-pdsm-v="mut">Mapa mut</button>
						</div>
					<?php endif; ?>
					<?php
					foreach ( array( 'complet' => $img_c, 'mut' => $img_m ) as $v => $a ) :
						if ( ! $a ) {
							continue;
						}
						[ $w, $h ] = $dades_img( $a );
						?>
						<figure class="pdsm-fig" data-pdsm-fig="<?php echo esc_attr( $v ); ?>">
							<a href="<?php echo esc_url( wp_get_attachment_url( $a ) ); ?>" class="pdsm-gran">
								<?php
								echo wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput
									$a,
									'full',
									false,
									array(
										'loading'       => 'complet' === $v ? 'eager' : 'lazy',
										'fetchpriority' => 'complet' === $v ? 'high' : 'auto',
										'sizes'         => '(max-width: 700px) 100vw, 640px',
									)
								);
								?>
							</a>
							<figcaption><?php echo 'complet' === $v ? 'Mapa complet' : 'Mapa mut, sense noms, amb els límits per pintar'; ?><?php echo $w ? esc_html( ' · ' . $w . ' × ' . $h . ' px' ) : ''; ?>. Toca'l per veure'l més gran.</figcaption>
						</figure>
					<?php endforeach; ?>
					<?php if ( $pdf['complet'] || $pdf['mut'] ) : ?>
						<div class="pdsm-dl">
							<?php if ( $pdf['complet'] ) : ?><a class="pdsm-btn pri" href="<?php echo esc_url( $pdf['complet'] ); ?>" data-net="<?php echo esc_url( $pdf['complet_net'] ); ?>" download><?php echo pdsm_icona_baixa(); // phpcs:ignore ?>PDF complet <small>A4</small></a><?php endif; ?>
							<?php if ( $pdf['mut'] ) : ?><a class="pdsm-btn" href="<?php echo esc_url( $pdf['mut'] ); ?>" data-net="<?php echo esc_url( $pdf['mut_net'] ); ?>" download><?php echo pdsm_icona_baixa(); // phpcs:ignore ?>PDF mut <small>A4</small></a><?php endif; ?>
						</div>
						<?php if ( $pdf['complet_net'] || $pdf['mut_net'] ) : ?>
							<label class="pdsm-net"><input type="checkbox" data-pdsm-net> Sense capçalera ni peu de pàgina</label>
						<?php endif; ?>
					<?php endif; ?>
				</section>

				<?php if ( $desc || $desm ) : ?>
					<section class="pdsm-text">
						<?php if ( $desc ) : ?><h2>Què mostra</h2><?php echo wp_kses_post( wpautop( $desc ) ); ?><?php endif; ?>
						<?php if ( $desm ) : ?><h2>El mapa mut</h2><?php echo wp_kses_post( wpautop( $desm ) ); ?><?php endif; ?>
					</section>
				<?php endif; ?>
			</div>

			<aside class="pdsm-side">
				<div class="pdsm-box">
					<h2>Sobre aquest mapa</h2>
					<dl class="pdsm-dl2">
						<?php if ( $per ) : ?><dt>Període</dt><dd><?php echo $enllacos( $per ); // phpcs:ignore ?></dd><?php endif; ?>
						<?php if ( $data ) : ?><dt>Data</dt><dd><?php echo esc_html( $data ); ?></dd><?php endif; ?>
						<?php if ( $ter ) : ?><dt>Territori</dt><dd><?php echo $enllacos( $ter ); // phpcs:ignore ?></dd><?php endif; ?>
						<?php if ( $tip ) : ?><dt>Tipus</dt><dd><?php echo $enllacos( $tip ); // phpcs:ignore ?></dd><?php endif; ?>
						<?php if ( $cur ) : ?><dt>Curs</dt><dd><?php echo $cursos; // phpcs:ignore ?></dd><?php endif; ?>
					</dl>
				</div>
				<?php
				$llista_ap = '';
				foreach ( $ap as $r ) {
					$pid = (int) ( $r['pdsm_ap_post'] ?? 0 );
					if ( ! $pid || 'publish' !== get_post_status( $pid ) ) {
						continue;
					}
					$cs   = get_the_terms( $pid, 'curs' );
					$c    = ( $cs && ! is_wp_error( $cs ) ) ? $cs[0] : null;
					$num  = function_exists( 'get_field' ) ? (string) get_field( 'numero_unitat', $pid ) : '';
					$anc  = trim( (string) ( $r['pdsm_ap_ancora'] ?? '' ) );
					$url  = get_permalink( $pid ) . ( '' !== $anc ? '#' . rawurlencode( $anc ) : '' );
					$sub  = implode( ' · ', array_filter( array( $c ? $c->name : '', (string) ( $r['pdsm_ap_apartat'] ?? '' ) ) ) );
					$llista_ap .= '<li><a class="pdsm-unitat" href="' . esc_url( $url ) . '"' . ( $c ? ' style="' . esc_attr( pdsm_estil_curs( $c ) ) . '"' : '' ) . '><i aria-hidden="true">' . esc_html( $num ? 'U' . $num : '·' ) . '</i><span><b>' . esc_html( get_the_title( $pid ) ) . '</b>' . esc_html( $sub ) . '</span></a></li>';
				}
				if ( $llista_ap ) :
					?>
					<div class="pdsm-box"><h2>On surt</h2><ul class="pdsm-ap"><?php echo $llista_ap; // phpcs:ignore ?></ul></div>
				<?php endif; ?>
				<div class="pdsm-box" id="llicencia">
					<h2>Llicència</h2>
					<p><a href="<?php echo esc_url( $llic[2] ); ?>" rel="license"><?php echo esc_html( $llic[0] ); ?></a>, <?php echo esc_html( $llic[1] ); ?>.</p>
					<p class="pdsm-fonts">Mapa: <?php echo esc_html( $autor ); ?>.<?php foreach ( $fonts as $f ) { echo ' ' . esc_html( rtrim( $f, '.' ) ) . '.'; } ?></p>
				</div>
			</aside>
		</div>

		<?php if ( $rel ) : ?>
			<section class="pdsm-rel">
				<h2><?php echo esc_html( $per ? preg_replace( '/^Mapes /u', 'Altres mapes ', pdsm_titol_terme( $per[0] ) ) : 'Altres mapes' ); ?></h2>
				<ul class="pdsm-grid"><?php foreach ( $rel as $r ) { echo pdsm_targeta( (int) $r ); } // phpcs:ignore ?></ul>
			</section>
		<?php endif; ?>
	</div>
</div>
<?php
get_footer();
