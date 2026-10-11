<?php
/**
 * Què pregunta la PAU d'Història (2010-2024), tots els temes. L'aplicació (preguntes.js) es dibuixa dins de #pq.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<?php pds2_avis_privat(); ?>
<header class="unit-hero pds2-hero pds2-hero--portada">
	<div class="inner">
		<?php pds2_molla( array( 'Preguntes PAU' => '' ) ); ?>
		<p class="num">PAU 2010–2024</p>
		<h1>Què pregunta la PAU d'Història</h1>
		<p class="lede">Recompte de les preguntes de fonts i de les preguntes llargues de les PAU d'Història de Catalunya entre el 2010 i el 2024, per tema i per aspecte. Serveix per saber quins continguts es repeteixen més.</p>
	</div>
</header>

<div class="pds2-sec pds2-sec--first">
	<div class="pds2-in">
		<div id="pq" class="pds2-pq"><p class="pq-loading">Carregant les dades…</p></div>
	</div>
</div>
<?php
get_footer();
