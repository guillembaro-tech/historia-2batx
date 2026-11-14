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
	$oficial = pds2_temes_oficials()[ $n ] ?? array( 'nom' => get_the_title(), 'dates' => '' );
	$dates   = (string) pds2_f( 'dates', $pid, $oficial['dates'] );
	?>
	<?php pds2_avis_privat(); ?>
	<div class="um um4 um-c-2n-batxillerat pds2-v4 pds2-v4-taller pds2-t-<?php echo (int) $n; ?>" data-view="alumne">
		<header class="um-hero">
			<div class="um-wrap">
				<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / <a href="<?php echo esc_url( pds2_portada_url() ); ?>">2n Batxillerat</a> / <a href="<?php echo esc_url( pds2_historia_url() ); ?>">Història</a> / <a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">Tema <?php echo (int) $n; ?></a> / <a href="<?php echo esc_url( get_permalink( $pid ) . '#activitats' ); ?>">PAU</a> / Taller</nav>
				<p class="um-eyebrow">2n Batxillerat · Història · Tema <?php echo (int) $n; ?><?php echo $dates ? ' · ' . esc_html( $dates ) : ''; ?></p>
				<p class="pds2-v4-kicker">Tema <?php echo (int) $n; ?> · <?php echo esc_html( $oficial['nom'] ); ?></p>
				<h1>Taller PAU</h1>
				<?php if ( pds2_pau_v2() ) : ?>
					<p class="um-guide">Els quatre exercicis de l'examen, pas a pas. Als exercicis 1, 2 i 3 llegeixes l'enunciat, planifiques, escrius a mà, t'autoavalues i ho compares amb una resposta model comentada. L'exercici 4 és un test.</p>
				<?php else : ?>
					<p class="um-guide">Els exercicis 1, 2 i 3 de l'examen, pas a pas. Llegeixes l'enunciat, planifiques, escrius a mà, t'autoavalues i ho compares amb una resposta model comentada.</p>
				<?php endif; ?>
			</div>
		</header>

		<div class="um-wrap pds2-v4-tallerwrap">
			<nav class="pds2-tl-torna" aria-label="Tornar">
				<a class="pds2-tl-torna-a" href="<?php echo esc_url( get_permalink( $pid ) . '#activitats' ); ?>" data-tema="<?php echo esc_url( get_permalink( $pid ) ); ?>"><span aria-hidden="true">←</span> Torna a la PAU de <?php echo esc_html( $oficial['nom'] ); ?></a>
				<?php if ( pds2_pau_v2() ) : ?>
					<a class="pds2-tl-torna-b" href="<?php echo esc_url( pds2_pau_url() ); ?>">Preparar la PAU</a>
				<?php endif; ?>
			</nav>
			<script>
			/* En tornar al tema, s'obre la pestanya PAU a la targeta de l'exercici que s'estava fent (#pau-e1 a #pau-e4) */
			document.querySelector('.pds2-tl-torna-a').addEventListener('click', function () {
				var t = document.querySelector('#taller .tab[aria-selected="true"]');
				var id = t && /^e[1-4]$/.test(t.getAttribute('data-tab')) ? t.getAttribute('data-tab') : '';
				if (id) { this.href = this.getAttribute('data-tema') + '#pau-' + id; }
			});
			</script>
			<div id="taller" class="pds2-taller">
				<p class="tl-loading">Carregant el taller…</p>
			</div>
			<?php // Lloc de la invitació «Col·labora» (pds-collabora la posa dins de .um #recursos), perquè quedi dins dels marges de la pàgina. ?>
			<div id="recursos" class="pds2-v4-collabora"></div>
		</div>
	</div>
	<?php
endwhile;

get_footer();
