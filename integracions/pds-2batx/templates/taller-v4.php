<?php
/**
 * Taller PAU d'un tema amb el model de les unitats del lloc (disseny v4).
 * La capçalera és la de les unitats; l'aplicació (taller.js) es dibuixa dins de #taller.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();
	$pid     = get_the_ID();
	$n       = pds2_tema_numero( $pid );
	$oficial = pds2_temes_oficials()[ $n ] ?? array( 'nom' => get_the_title() );
	?>
	<?php pds2_avis_privat(); ?>
	<div class="um um4 um-c-2n-batxillerat pds2-v4 pds2-v4-taller pds2-t-<?php echo (int) $n; ?>" data-view="alumne">
		<header class="um-hero">
			<div class="um-wrap">
				<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / <a href="<?php echo esc_url( pds2_portada_url() ); ?>">2n Batxillerat</a> / <a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">Tema <?php echo (int) $n; ?></a> / Taller PAU</nav>
				<p class="um-eyebrow">2n Batxillerat · Història · Tema <?php echo (int) $n; ?>. <?php echo esc_html( $oficial['nom'] ); ?></p>
				<h1>Taller PAU</h1>
				<p class="um-guide">Com es responen els exercicis 1, 2 i 3, pas a pas. Llegeixes l'enunciat, planifiques, escrius, t'autoavalues i ho compares amb una resposta model comentada.</p>
				<ul class="um-facts">
					<li>Exercicis 1, 2 i 3 de la PAU</li>
					<li>La resposta s'escriu a mà, com a l'examen</li>
					<li>Respostes model comentades</li>
				</ul>
			</div>
		</header>

		<div class="um-wrap pds2-v4-tallerwrap">
			<div id="taller" class="pds2-taller">
				<p class="tl-loading">Carregant el taller…</p>
			</div>
		</div>
	</div>
	<?php
endwhile;

get_footer();
