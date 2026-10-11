<?php
/**
 * Taller PAU d'un tema. L'aplicació (taller.js) es dibuixa dins de #taller.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();
	$pid   = get_the_ID();
	$n     = pds2_tema_numero( $pid );
	$color = pds2_tema_color( $pid );
	$o     = pds2_temes_oficials();
	?>
	<?php pds2_avis_privat(); ?>
	<header class="unit-hero pds2-hero pds2-hero--taller" style="--pds2-tc: <?php echo esc_attr( $color ); ?>;">
		<div class="inner">
			<?php pds2_molla( array( 'Tema ' . $n => get_permalink( $pid ), 'Taller PAU' => '' ) ); ?>
			<p class="num">TALLER PAU · TEMA <?php echo esc_html( (string) $n ); ?></p>
			<h1><?php echo esc_html( $o[ $n ]['nom'] ?? get_the_title() ); ?></h1>
			<div class="pds2-taller-intro">
				<p class="lede">Com es responen els exercicis 1, 2 i 3, pas a pas. Llegeix l'enunciat, planifica, escriu, autoavalua't i compara amb un model comentat.</p>
				<div class="pds2-paper">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
					<p><strong>La resposta s'escriu a mà.</strong> El taller et guia i t'ajuda a corregir-te, però el pas 3 el fas en paper i amb bolígraf, com a l'examen.</p>
				</div>
			</div>
		</div>
	</header>

	<div id="taller" class="pds2-taller" style="--tc: <?php echo esc_attr( $color ); ?>;">
		<p class="tl-loading">Carregant el taller…</p>
	</div>
	<?php
endwhile;

get_footer();
