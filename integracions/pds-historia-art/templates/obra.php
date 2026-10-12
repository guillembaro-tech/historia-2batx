<?php
/**
 * Fitxa d'una obra de referència amb el model de les unitats (disseny v4).
 * Els apartats segueixen les preguntes de l'exercici 2 de la PAU.
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();
	$pid     = get_the_ID();
	$n       = (int) pdsha_f( 'ha_numero', $pid, 0 );
	$estil   = pdsha_estil_de( $pid );
	$periode = $estil ? pdsha_periode_de( $estil ) : null;
	$llg     = pdsha_llenguatge_de( $pid );
	$dates   = (string) pdsha_f( 'ha_dates', $pid, '' );
	$lloc    = (string) pdsha_f( 'ha_lloc', $pid, '' );
	$autor   = (string) pdsha_f( 'ha_autor', $pid, '' );
	$resum   = (string) pdsha_f( 'ha_resum', $pid, '' );
	$arq     = $llg && 'arquitectura' === $llg->slug;

	// Apartats de l'exercici 2, en l'ordre de les preguntes. El destacat només hi és si té text.
	$apartats = array(
		array( 'k' => 'context', 'num' => 'a)', 'titol' => 'Datació i context' ),
		array( 'k' => 'analisi', 'num' => 'b)', 'titol' => 'Anàlisi formal i estil' ),
		array( 'k' => 'funcio', 'num' => 'c)', 'titol' => $arq ? 'Funció' : 'Tema i funció' ),
	);
	if ( '' !== trim( (string) pdsha_f( 'ha_destacat_titol', $pid, '' ) ) && '' !== trim( wp_strip_all_tags( pdsha_html( 'destacat', $pid ) ) ) ) {
		$apartats[] = array( 'k' => 'destacat', 'num' => 'Destacat', 'titol' => (string) pdsha_f( 'ha_destacat_titol', $pid, '' ) );
	}
	$apartats[] = array( 'k' => 'relacio', 'num' => 'd)', 'titol' => 'Relació amb altres obres' );

	$compara = array_values( array_filter( array_map( 'get_post', (array) pdsha_f( 'ha_compara', $pid, array() ) ), static fn( $p ) => $p instanceof WP_Post && in_array( $p->post_status, pdsha_estats(), true ) ) );
	$te_pau  = '' !== trim( wp_strip_all_tags( pdsha_html( 'pau_enunciat', $pid ) . pdsha_html( 'pau_propostes', $pid ) . pdsha_html( 'tambe', $pid ) ) );

	// Obra anterior i següent segons el número de la llista.
	$per_n = pdsha_obres_per_numero();
	ksort( $per_n );
	$nums = array_keys( $per_n );
	$pos  = array_search( $n, $nums, true );
	$ant  = ( false !== $pos && $pos > 0 ) ? $per_n[ $nums[ $pos - 1 ] ] : null;
	$seg  = ( false !== $pos && $pos < count( $nums ) - 1 ) ? $per_n[ $nums[ $pos + 1 ] ] : null;

	$molla = array();
	if ( $estil ) {
		$molla[ pdsha_titol_estil( $estil ) ] = pdsha_estil_url( $estil );
	}
	$molla[ $n ? 'Obra ' . $n : get_the_title() ] = '';
	?>
	<?php pdsha_avis_privat(); ?>
	<div class="um um4 um-c-2n-batxillerat pdsha-v4 pdsha-obra" data-view="alumne">
		<header class="um-hero">
			<div class="um-wrap">
				<?php pdsha_molla( $molla ); ?>
				<p class="um-eyebrow">2n Batxillerat · Història de l'Art<?php echo $n ? ' · Obra ' . (int) $n . ' de la llista PAU' : ''; ?></p>
				<h1><?php the_title(); ?></h1>
				<p class="um-guide"><?php echo esc_html( implode( ' · ', array_filter( array( $estil ? $estil->name : '', $llg ? $llg->name : '', $autor, $dates, $lloc ) ) ) ); ?></p>
				<ul class="um-facts">
					<?php if ( $estil ) : ?>
						<li><?php echo esc_html( $estil->name ); ?><?php echo $periode && $periode->term_id !== $estil->term_id ? ' (' . esc_html( $periode->name ) . ')' : ''; ?></li>
					<?php endif; ?>
					<?php if ( $dates ) : ?>
						<li><?php echo esc_html( $dates ); ?> (Cronologia)</li>
					<?php endif; ?>
					<?php if ( $llg ) : ?>
						<li><?php echo esc_html( $llg->name ); ?> (Llenguatge)</li>
					<?php endif; ?>
					<?php if ( $n ) : ?>
						<li>Obra <?php echo (int) $n; ?> (Llista oficial de la PAU)</li>
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
			<nav class="um-toc" aria-label="Índex de la fitxa">
				<p>Índex</p>
				<ol>
					<li><a href="#comencem">Fitxa de l'obra</a></li>
					<?php foreach ( $apartats as $i => $a ) : ?>
						<li><a href="#s<?php echo (int) ( $i + 1 ); ?>"><?php echo esc_html( ( 'Destacat' === $a['num'] ? '' : $a['num'] . ' ' ) . $a['titol'] ); ?></a></li>
					<?php endforeach; ?>
					<li><a href="#fonts">Crèdits i fonts</a></li>
				</ol>
				<div class="um-progress"><span></span></div>
			</nav>

			<article class="um-main">

				<section class="um-sec" id="comencem">
					<header><span class="um-num">Fitxa</span><h2>Fitxa de l'obra</h2></header>
					<?php echo pdsha_imatges( $pid, 'inici' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?>
					<?php echo pdsha_fitxa_html( $pid ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?>
					<?php if ( $resum ) : ?>
						<div class="um-box um-key pdsha-resum"><span class="um-box-t">En trenta segons</span><p><?php echo pdsha_marques( $resum ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?></p></div>
					<?php endif; ?>
				</section>

				<?php foreach ( $apartats as $i => $a ) :
					$q = (string) pdsha_f( 'ha_q_' . $a['k'], $pid, '' );
					?>
					<section class="um-sec pdsha-ap-<?php echo esc_attr( $a['k'] ); ?>" id="s<?php echo (int) ( $i + 1 ); ?>"<?php echo 'Destacat' === $a['num'] ? '' : ' data-lletra="' . esc_attr( rtrim( $a['num'], ')' ) ) . '"'; ?>>
						<header><span class="um-num"><?php echo esc_html( 'Destacat' === $a['num'] ? 'Destacat' : 'Apartat ' . $a['num'] ); ?></span><h2><?php echo esc_html( $a['titol'] ); ?></h2></header>
						<?php if ( $q ) : ?>
							<p class="um-q"><?php echo esc_html( $q ); ?></p>
						<?php endif; ?>
						<?php echo pdsha_imatges( $pid, $a['k'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?>
						<?php echo pdsha_html( $a['k'], $pid ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- camp WYSIWYG formatat per ACF. ?>
						<?php if ( 'relacio' === $a['k'] && $compara ) : ?>
							<h3>Compara-la amb</h3>
							<div class="pdsha-cards">
								<?php foreach ( $compara as $c ) : ?>
									<?php echo pdsha_targeta( $c ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>
						<?php if ( 'relacio' === $a['k'] && ( $ant || $seg || $estil ) ) : ?>
							<nav class="pdsha-pasa" aria-label="Altres obres">
								<?php if ( $ant ) : ?>
									<a class="pdsha-pasa-ant" href="<?php echo esc_url( get_permalink( $ant ) ); ?>"><small>Obra anterior</small><?php echo esc_html( pdsha_f( 'ha_numero', $ant->ID, '' ) . '. ' . get_the_title( $ant ) ); ?></a>
								<?php endif; ?>
								<?php if ( $estil ) : ?>
									<a class="pdsha-pasa-estil" href="<?php echo esc_url( pdsha_estil_url( $estil ) ); ?>"><small>Tema de l'estil</small><?php echo esc_html( pdsha_titol_estil( $estil ) ); ?></a>
								<?php endif; ?>
								<?php if ( $seg ) : ?>
									<a class="pdsha-pasa-seg" href="<?php echo esc_url( get_permalink( $seg ) ); ?>"><small>Obra següent</small><?php echo esc_html( pdsha_f( 'ha_numero', $seg->ID, '' ) . '. ' . get_the_title( $seg ) ); ?></a>
								<?php endif; ?>
							</nav>
						<?php endif; ?>
					</section>
				<?php endforeach; ?>

				<section class="um-sec" id="fonts">
					<header><span class="um-num">Fonts</span><h2>Crèdits i fonts</h2></header>
					<?php
					$credits = array();
					foreach ( (array) pdsha_f( 'ha_imatges', $pid, array() ) as $r ) {
						$att = (int) ( $r['imatge'] ?? 0 );
						if ( $att && ! isset( $credits[ $att ] ) ) {
							$credits[ $att ] = $r;
						}
					}
					?>
					<?php if ( $credits ) : ?>
						<h3>Crèdits de les imatges</h3>
						<ul class="pdsha-credits">
							<?php foreach ( $credits as $att => $r ) :
								$font = (string) get_post_meta( $att, 'pdsha_font_url', true );
								?>
								<li><strong><?php echo esc_html( (string) ( $r['titol'] ?? get_the_title( $att ) ) ); ?>.</strong> <?php echo esc_html( pdsha_credit( $att ) ); ?><?php echo $font ? ' · <a href="' . esc_url( $font ) . '" target="_blank" rel="noopener">Fitxa de la imatge</a>' : ''; ?></li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
					<?php if ( '' !== trim( wp_strip_all_tags( pdsha_html( 'fonts', $pid ) ) ) ) : ?>
						<h3>Fonts consultades</h3>
						<?php echo pdsha_html( 'fonts', $pid ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- camp WYSIWYG formatat per ACF. ?>
					<?php endif; ?>
					<p class="um-foot-note">Material obert de professordesocials.cat amb llicència Creative Commons BY-SA 4.0. Les imatges tenen la llicència que s'indica a cadascuna.</p>
				</section>

				<?php if ( $te_pau ) : ?>
					<section class="um-sec" id="activitats">
						<header><span class="um-num">PAU</span><h2>Així surt a la PAU</h2></header>
						<?php if ( '' !== trim( wp_strip_all_tags( pdsha_html( 'pau_enunciat', $pid ) ) ) ) : ?>
							<div class="um-box um-think pdsha-enunciat">
								<?php if ( pdsha_f( 'ha_pau_etiqueta', $pid, '' ) ) : ?>
									<span class="um-box-t">Exercici 2</span>
									<p class="pdsha-etiqueta"><em><?php echo esc_html( (string) pdsha_f( 'ha_pau_etiqueta', $pid, '' ) ); ?></em></p>
								<?php endif; ?>
								<?php echo pdsha_html( 'pau_enunciat', $pid ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- camp WYSIWYG formatat per ACF. ?>
							</div>
						<?php endif; ?>
						<?php if ( '' !== trim( wp_strip_all_tags( pdsha_html( 'pau_criteris', $pid ) ) ) ) : ?>
							<div class="um-box um-near"><span class="um-box-t">Criteris oficials de correcció (resum)</span><?php echo pdsha_html( 'pau_criteris', $pid ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- camp WYSIWYG formatat per ACF. ?></div>
						<?php endif; ?>
						<?php if ( '' !== trim( wp_strip_all_tags( pdsha_html( 'pau_model', $pid ) ) ) ) : ?>
							<div class="pdsha-model">
								<button type="button" class="pdsha-model-btn" aria-expanded="false" aria-controls="pdsha-model-cos">Mostra la resposta</button>
								<div class="pdsha-model-cos" id="pdsha-model-cos" hidden>
									<?php echo pdsha_html( 'pau_model', $pid ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- camp WYSIWYG formatat per ACF. ?>
								</div>
							</div>
						<?php endif; ?>
						<?php if ( '' !== trim( wp_strip_all_tags( pdsha_html( 'pau_propostes', $pid ) ) ) ) : ?>
							<h3>Altres preguntes possibles</h3>
							<?php echo pdsha_html( 'pau_propostes', $pid ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- camp WYSIWYG formatat per ACF. ?>
						<?php endif; ?>
						<?php if ( '' !== trim( wp_strip_all_tags( pdsha_html( 'tambe', $pid ) ) ) ) : ?>
							<div class="um-box um-key"><span class="um-box-t">També pot sortir a</span><?php echo pdsha_html( 'tambe', $pid ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- camp WYSIWYG formatat per ACF. ?></div>
						<?php endif; ?>
					</section>
				<?php endif; ?>

			</article>
		</div>
	</div>
	<?php
endwhile;

get_footer();
