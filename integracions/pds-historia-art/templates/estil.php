<?php
/**
 * Tema d'un estil (per exemple, el romànic) amb les obres de la llista agrupades per llenguatge.
 * Amb un llenguatge a l'adreça (/romanic/arquitectura/) només mostra els apartats i les obres d'aquell llenguatge.
 * Un període (Edat mitjana) mostra els seus estils i les seves obres.
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$estil   = get_queried_object();
$llg     = pdsha_llenguatge_actual();
$periode = $estil instanceof WP_Term ? pdsha_periode_de( $estil ) : null;
$es_per  = $estil instanceof WP_Term && ! $estil->parent;

$totes   = $estil instanceof WP_Term ? pdsha_obres( array( 'estil' => $estil->term_id ) ) : array();
$comptes = array();
foreach ( $totes as $p ) {
	$l = pdsha_llenguatge_de( $p->ID );
	if ( $l ) {
		$comptes[ $l->slug ] = ( $comptes[ $l->slug ] ?? 0 ) + 1;
	}
}
$obres = $llg ? array_values( array_filter( $totes, static fn( $p ) => ( pdsha_llenguatge_de( $p->ID )?->slug ?? '' ) === $llg->slug ) ) : $totes;

$seccions = $es_per ? array() : array_values(
	array_filter(
		(array) pdsha_f( 'estil_seccions', $estil, array() ),
		static fn( $s ) => ! $llg || ( $s['llenguatge'] ?? '' ) === $llg->slug
	)
);
$titol    = pdsha_titol_estil( $estil );
$dates    = (string) pdsha_f( 'estil_dates', $estil, '' );
$pregunta = (string) pdsha_f( 'estil_pregunta', $estil, '' );
$resum    = (string) pdsha_f( 'estil_resum', $estil, '' );
$pau      = (string) pdsha_f( 'estil_pau', $estil, '' );
$fonts    = (string) pdsha_f( 'estil_fonts', $estil, '' );

$molla = array();
if ( $llg ) {
	$molla[ $titol ] = pdsha_estil_url( $estil );
	$molla[ $llg->name ] = '';
} else {
	$molla[ $titol ] = '';
}
$oficials = pdsha_obres_oficials();
$per_n    = pdsha_obres_per_numero();
?>
<?php pdsha_avis_privat(); ?>
<div class="um um4 um-c-2n-batxillerat pdsha-v4 pdsha-estil" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<?php pdsha_molla( $molla ); ?>
			<p class="um-eyebrow">2n Batxillerat · Història de l'Art<?php echo $periode && ! $es_per ? ' · ' . esc_html( $periode->name ) : ''; ?><?php echo $dates ? ' · ' . esc_html( $dates ) : ''; ?></p>
			<h1><?php echo esc_html( $titol . ( $llg ? ' · ' . $llg->name : '' ) ); ?></h1>
			<?php if ( $pregunta ) : ?>
				<p class="um-guide"><?php echo esc_html( $pregunta ); ?></p>
			<?php endif; ?>
			<ul class="um-facts">
				<?php if ( $dates ) : ?>
					<li><?php echo esc_html( $dates ); ?> (Cronologia)</li>
				<?php endif; ?>
				<li><?php echo count( $totes ); ?> <?php echo 1 === count( $totes ) ? 'obra' : 'obres'; ?> de la llista PAU</li>
				<?php if ( $seccions ) : ?>
					<li><?php echo count( $seccions ); ?> <?php echo 1 === count( $seccions ) ? 'apartat' : 'apartats'; ?></li>
				<?php endif; ?>
			</ul>
			<div class="um-tools">
				<div class="um-seg" role="group" aria-label="Mida del text">
					<button type="button" class="um-btn" data-um-fs="down" aria-label="Text més petit">A−</button>
					<button type="button" class="um-btn" data-um-fs="up" aria-label="Text més gran">A+</button>
				</div>
				<button type="button" class="um-btn" data-um-print>Imprimir o desar en PDF</button>
			</div>
		</div>
	</header>

	<div class="um-wrap um-layout">
		<nav class="um-toc" aria-label="Índex del tema">
			<p>Índex</p>
			<ol>
				<li><a href="#comencem"><?php echo $es_per ? 'Estils i obres' : 'Les obres de la PAU'; ?></a></li>
				<?php foreach ( $seccions as $i => $s ) : ?>
					<li><a href="#s<?php echo (int) ( $i + 1 ); ?>"><?php echo (int) ( $i + 1 ) . '. ' . esc_html( (string) ( $s['titol'] ?? '' ) ); ?></a></li>
				<?php endforeach; ?>
				<?php if ( '' !== trim( wp_strip_all_tags( $fonts ) ) && ! $llg ) : ?>
					<li><a href="#fonts">Fonts</a></li>
				<?php endif; ?>
			</ol>
			<div class="um-progress"><span></span></div>
		</nav>

		<article class="um-main">

			<section class="um-sec" id="comencem">
				<header><span class="um-num">Abans de començar</span><h2><?php echo $es_per ? 'Estils i obres' : 'Les obres de la PAU'; ?></h2></header>
				<?php if ( $resum && ! $llg ) : ?>
					<p class="um-intro"><?php echo pdsha_marques( $resum ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?></p>
				<?php endif; ?>

				<?php if ( $es_per ) : ?>
					<?php
					$fills = get_terms(
						array(
							'taxonomy'   => 'estil',
							'parent'     => $estil->term_id,
							'hide_empty' => false,
						)
					);
					$fills = is_wp_error( $fills ) ? array() : $fills;
					usort( $fills, static fn( $a, $b ) => pdsha_ordre( $a ) <=> pdsha_ordre( $b ) );
					$rang = pdsha_periodes()[ $estil->slug ]['obres'] ?? null;
					?>
					<?php if ( $fills ) : ?>
						<nav class="pdsha-chips" aria-label="Estils del període">
							<?php foreach ( $fills as $f ) : ?>
								<a href="<?php echo esc_url( pdsha_estil_url( $f ) ); ?>"><?php echo esc_html( pdsha_titol_estil( $f ) ); ?></a>
							<?php endforeach; ?>
						</nav>
					<?php endif; ?>
					<?php if ( $rang ) : ?>
						<ol class="pdsha-llista" start="<?php echo (int) $rang[0]; ?>">
							<?php for ( $k = $rang[0]; $k <= $rang[1]; $k++ ) : ?>
								<li value="<?php echo (int) $k; ?>" class="<?php echo isset( $per_n[ $k ] ) ? 'is-on' : 'is-off'; ?>">
									<?php if ( isset( $per_n[ $k ] ) ) : ?>
										<a href="<?php echo esc_url( get_permalink( $per_n[ $k ] ) ); ?>"><?php echo esc_html( $oficials[ $k ] ); ?></a>
									<?php else : ?>
										<?php echo esc_html( $oficials[ $k ] ); ?> <small>En preparació</small>
									<?php endif; ?>
								</li>
							<?php endfor; ?>
						</ol>
					<?php endif; ?>
				<?php else : ?>
					<?php echo pdsha_xips_llenguatge( $estil, $llg, $comptes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?>
					<?php if ( $obres ) : ?>
						<div class="pdsha-cards">
							<?php foreach ( $obres as $p ) : ?>
								<?php echo pdsha_targeta( $p ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?>
							<?php endforeach; ?>
						</div>
					<?php else : ?>
						<p>Encara no hi ha cap obra d'aquest estil a la web.</p>
					<?php endif; ?>
					<?php if ( $pau && ! $llg ) : ?>
						<div class="um-box um-near"><span class="um-box-t">Com entra a la PAU</span><?php echo $pau; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- camp WYSIWYG formatat per ACF. ?></div>
					<?php endif; ?>
				<?php endif; ?>
			</section>

			<?php foreach ( $seccions as $i => $s ) : ?>
				<section class="um-sec" id="s<?php echo (int) ( $i + 1 ); ?>">
					<header><span class="um-num">Apartat <?php echo (int) ( $i + 1 ); ?></span><h2><?php echo esc_html( (string) ( $s['titol'] ?? '' ) ); ?></h2></header>
					<?php if ( ! empty( $s['pregunta'] ) ) : ?>
						<p class="um-q"><?php echo esc_html( $s['pregunta'] ); ?></p>
					<?php endif; ?>
					<?php echo (string) ( $s['cos'] ?? '' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- camp WYSIWYG formatat per ACF. ?>
					<?php
					// Al final de l'apartat d'un llenguatge, les obres de la llista d'aquell llenguatge.
					$del = ! empty( $s['llenguatge'] ) ? array_values( array_filter( $totes, static fn( $p ) => ( pdsha_llenguatge_de( $p->ID )?->slug ?? '' ) === $s['llenguatge'] ) ) : array();
					?>
					<?php if ( $del ) : ?>
						<div class="um-box um-key pdsha-obres-ap">
							<span class="um-box-t"><?php echo 1 === count( $del ) ? 'Obra de la PAU' : 'Obres de la PAU'; ?></span>
							<ul>
								<?php foreach ( $del as $p ) : ?>
									<li><a href="<?php echo esc_url( get_permalink( $p ) ); ?>"><?php echo esc_html( pdsha_f( 'numero', $p->ID, '' ) . '. ' . get_the_title( $p ) ); ?></a></li>
								<?php endforeach; ?>
							</ul>
						</div>
					<?php endif; ?>
				</section>
			<?php endforeach; ?>

			<?php if ( '' !== trim( wp_strip_all_tags( $fonts ) ) && ! $llg ) : ?>
				<section class="um-sec" id="fonts">
					<header><span class="um-num">Fonts</span><h2>Fonts i crèdits</h2></header>
					<?php echo $fonts; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- camp WYSIWYG formatat per ACF. ?>
					<p class="um-foot-note">Material obert de professordesocials.cat amb llicència Creative Commons BY-SA 4.0. Les imatges tenen la llicència que s'indica a cadascuna.</p>
				</section>
			<?php endif; ?>

		</article>
	</div>
</div>
<?php
get_footer();
