<?php
/**
 * Què pregunta la PAU d'Història (2010-2024), tots els temes, amb el model de les unitats del lloc (disseny v4).
 * L'aplicació (preguntes.js) es dibuixa dins de #pq.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<?php pds2_avis_privat(); ?>
<div class="um um4 um-c-2n-batxillerat pds2-v4 pds2-v4-preguntes" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / <a href="<?php echo esc_url( pds2_portada_url() ); ?>">2n Batxillerat</a> / Preguntes PAU</nav>
			<p class="um-eyebrow">2n Batxillerat · Història · PAU del 2010 al 2024</p>
			<h1>Què pregunta la PAU d'Història</h1>
			<p class="um-guide">Recompte de les preguntes de fonts i de les preguntes llargues de les PAU d'Història de Catalunya entre el 2010 i el 2024, per tema i per aspecte. Serveix per saber quins continguts es repeteixen més.</p>
		</div>
	</header>

	<div class="um-wrap pds2-v4-pagina">
		<section class="um-sec" id="preguntes">
			<div id="pq" class="pds2-pq"><p class="pq-loading">Carregant les dades…</p></div>
		</section>
	</div>
</div>
<?php
get_footer();
