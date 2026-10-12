<?php
/**
 * Portada d'Història de l'Art. Els estils per períodes, la llista oficial d'obres de referència
 * (enllaçades les que ja són a la web) i com és l'examen.
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$oficials = pdsha_obres_oficials();
$per_n    = pdsha_obres_per_numero();
$periodes = pdsha_periodes();
$arbre    = pdsha_estils_ordenats();
$llg      = isset( $_GET['llenguatge'] ) ? get_term_by( 'slug', sanitize_title( wp_unslash( $_GET['llenguatge'] ) ), 'llenguatge' ) : false; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- només filtra la llista.
$filtrades = $llg instanceof WP_Term ? pdsha_obres( array( 'llenguatge' => $llg->slug ) ) : array();
?>
<?php pdsha_avis_privat(); ?>
<div class="um um4 um-c-2n-batxillerat pdsha-v4 pdsha-portada" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<?php pdsha_molla(); ?>
			<p class="um-eyebrow">2n Batxillerat · Història de l'Art · PAU</p>
			<h1>Història de l'Art</h1>
			<p class="um-guide">Les <?php echo count( $oficials ); ?> obres de referència de la PAU, explicades una a una i agrupades per estils i per llenguatges artístics.</p>
			<ul class="um-facts">
				<li><?php echo count( $oficials ); ?> obres de referència</li>
				<li><?php echo count( $per_n ); ?> ja a la web</li>
				<li>4 exercicis a l'examen</li>
			</ul>
		</div>
	</header>

	<div class="um-wrap pdsha-pagina">

		<section class="um-sec" id="obres">
			<header><span class="um-num">Obres</span><h2>Les obres de referència</h2></header>
			<p>L'exercici 2 de l'examen sempre analitza una d'aquestes obres, i a l'exercici 3 almenys una de les imatges és de la llista. Les preguntes, però, demanen situar l'obra en el seu estil i relacionar-la amb altres obres. Per això cada estil té el seu tema.</p>
			<nav class="pdsha-chips" aria-label="Filtra per llenguatge">
				<a href="<?php echo esc_url( pdsha_portada_url() ); ?>"<?php echo $llg ? '' : ' aria-current="page"'; ?>>Totes</a>
				<?php foreach ( pdsha_llenguatges() as $l ) : ?>
					<a href="<?php echo esc_url( add_query_arg( 'llenguatge', $l->slug, pdsha_portada_url() ) ); ?>"<?php echo ( $llg && $llg->slug === $l->slug ) ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $l->name ); ?></a>
				<?php endforeach; ?>
			</nav>

			<?php if ( $llg ) : ?>
				<?php if ( $filtrades ) : ?>
					<div class="pdsha-cards">
						<?php foreach ( $filtrades as $p ) : ?>
							<?php echo pdsha_targeta( $p ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?>
						<?php endforeach; ?>
					</div>
				<?php else : ?>
					<p>Encara no hi ha cap obra d'aquest llenguatge a la web.</p>
				<?php endif; ?>
				<p class="um-foot-note">Només hi surten les obres que ja són a la web.</p>
			<?php else : ?>
				<?php foreach ( $arbre as $branca ) :
					$per  = $branca['periode'];
					$rang = $periodes[ $per->slug ]['obres'] ?? null;
					?>
					<div class="pdsha-periode">
						<h3><?php echo esc_html( $per->name ); ?><?php echo $rang ? ' <small>Obres ' . (int) $rang[0] . ' a ' . (int) $rang[1] . '</small>' : ''; ?></h3>
						<?php if ( $branca['estils'] ) : ?>
							<nav class="pdsha-chips pdsha-chips-estils" aria-label="<?php echo esc_attr( 'Estils · ' . $per->name ); ?>">
								<?php foreach ( $branca['estils'] as $e ) : ?>
									<a href="<?php echo esc_url( pdsha_estil_url( $e ) ); ?>"><?php echo esc_html( pdsha_titol_estil( $e ) ); ?></a>
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
											<?php echo esc_html( $oficials[ $k ] ); ?>
										<?php endif; ?>
									</li>
								<?php endfor; ?>
							</ol>
						<?php endif; ?>
					</div>
				<?php endforeach; ?>
				<p class="um-foot-note">Llista oficial «Història de l'Art. PAU 2026. Obres de referència», del Consell Interuniversitari de Catalunya. Les obres enllaçades ja són a la web.</p>
			<?php endif; ?>
		</section>

		<section class="um-sec" id="examen">
			<header><span class="um-num">Examen</span><h2>Com és l'examen</h2></header>
			<p>Quatre exercicis obligatoris i 10 punts. Als exercicis 2 i 4 es tria una de les dues opcions.</p>
			<div class="um-cards">
				<article class="um-card"><h4>Exercici 1. Aproximació a la història de l'art</h4><span class="um-tag">2 punts</span><p>Dues qüestions de vocabulari, tècniques i estils. Per exemple, assenyalar les parts d'un edifici o identificar l'estil de cinc obres.</p></article>
				<article class="um-card"><h4>Exercici 2. Art: forma i funció</h4><span class="um-tag">4 punts</span><p>Anàlisi d'una obra de la llista, amb preguntes sobre la datació i el context, la forma i l'estil, la funció i la relació amb altres obres.</p></article>
				<article class="um-card"><h4>Exercici 3. Dimensió individual i social de l'art</h4><span class="um-tag">2 punts</span><p>Dues o tres preguntes a partir d'imatges, sobre l'artista, la societat, la perspectiva de gènere o el mercat de l'art.</p></article>
				<article class="um-card"><h4>Exercici 4. Art: espai, natura i ciutat</h4><span class="um-tag">2 punts</span><p>Un cas sobre patrimoni, museus, ciutat o turisme, sovint a partir d'una notícia. Les obres no han de ser de la llista.</p></article>
			</div>
		</section>

	</div>
</div>
<?php
get_footer();
