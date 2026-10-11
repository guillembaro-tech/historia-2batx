<?php
/**
 * Pàgina d'un Tema PAU.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();
	$pid       = get_the_ID();
	$n         = pds2_tema_numero( $pid );
	$color     = pds2_tema_color( $pid );
	$dates     = (string) pds2_f( 'dates', $pid, '' );
	$pregunta  = (string) pds2_f( 'pregunta', $pid, '' );
	$apartats  = array_values( (array) pds2_f( 'apartats', $pid, array() ) );
	$fonts     = array_values( (array) pds2_f( 'fonts', $pid, array() ) );
	$practica  = array_values( (array) pds2_f( 'practica', $pid, array() ) );
	$pau       = array_values( (array) pds2_f( 'pau', $pid, array() ) );
	$preguntes = array_values( (array) pds2_f( 'preguntes', $pid, array() ) );
	$taller_on = 'disponible' === pds2_f( 'estat_taller', $pid, '' );
	$pau_max   = max( array_merge( array( 1 ), array_map( static fn( $r ) => (int) ( $r['n'] ?? 0 ), $pau ) ) );
	$pau_tot   = array_sum( array_map( static fn( $r ) => (int) ( $r['n'] ?? 0 ), $pau ) );
	?>
	<?php pds2_avis_privat(); ?>
	<header class="unit-hero pds2-hero" style="--pds2-tc: <?php echo esc_attr( $color ); ?>;">
		<div class="inner">
			<?php pds2_molla( array( 'Tema ' . $n => '' ) ); ?>
			<p class="num">TEMA <?php echo esc_html( (string) $n ); ?><?php echo $dates ? ' · ' . esc_html( $dates ) : ''; ?></p>
			<h1><?php the_title(); ?></h1>
			<?php if ( has_excerpt() ) : ?>
				<p class="lede"><?php echo esc_html( wp_strip_all_tags( get_the_excerpt() ) ); ?></p>
			<?php endif; ?>
			<div class="pds2-hero-actions">
				<?php if ( $taller_on ) : ?>
					<a class="pds2-btn pds2-btn--light" href="<?php echo esc_url( pds2_taller_url( $pid ) ); ?>">Taller PAU d'aquest tema</a>
				<?php endif; ?>
				<?php if ( $preguntes ) : ?>
					<a class="pds2-btn pds2-btn--ghost" href="#preguntes">Què hi pregunta la PAU</a>
				<?php endif; ?>
			</div>
		</div>
	</header>

	<div class="unit-body unit-body--3col unit-body--v2 pds2-body" style="--pds2-tc: <?php echo esc_attr( $color ); ?>;">
		<aside class="toc-left" aria-label="Índex d'aquest tema">
			<h4>En aquest tema</h4>
			<ol>
				<?php foreach ( $apartats as $i => $ap ) : ?>
					<li><a href="#ap<?php echo (int) $i; ?>"><?php echo esc_html( (string) ( $ap['titol'] ?? '' ) ); ?></a></li>
				<?php endforeach; ?>
				<?php if ( $fonts ) : ?>
					<li><a href="#fonts">Fonts</a></li>
				<?php endif; ?>
				<?php if ( $practica ) : ?>
					<li><a href="#practica">Pràctica per a l'examen</a></li>
				<?php endif; ?>
				<?php if ( $preguntes || $pau ) : ?>
					<li><a href="#preguntes">Què hi pregunta la PAU</a></li>
				<?php endif; ?>
			</ol>
		</aside>

		<article class="article article--v2 pds2-article">
			<?php if ( $pregunta ) : ?>
				<aside class="pds2-pregunta" aria-label="Pregunta guia">
					<p class="pds2-pregunta-k">Pregunta guia</p>
					<p class="pds2-pregunta-t"><?php echo esc_html( $pregunta ); ?></p>
				</aside>
			<?php endif; ?>
			<?php echo pds2_contingut_tema( $pid ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- contingut del tema filtrat per the_content. ?>
		</article>

		<aside class="toc-right" aria-label="Recursos del tema">
			<?php if ( $taller_on ) : ?>
				<div class="rail-card pds2-rail-taller">
					<h4>Taller PAU</h4>
					<p class="lbl-sm">Exercicis 1, 2 i 3 d'aquest tema, pas a pas, amb resposta model comentada.</p>
					<a class="pds2-rail-link" href="<?php echo esc_url( pds2_taller_url( $pid ) ); ?>">Obre el taller</a>
				</div>
			<?php endif; ?>
			<?php if ( $pau_tot ) : ?>
				<div class="rail-card">
					<h4>A la PAU</h4>
					<div class="stat"><?php echo esc_html( (string) $pau_tot ); ?></div>
					<div class="lbl-sm">preguntes sobre aquest tema entre el 2010 i el 2024</div>
					<a class="pds2-rail-link" href="#preguntes">Veure per aspecte</a>
				</div>
			<?php endif; ?>
			<div class="rail-card">
				<h4>2n Batxillerat</h4>
				<ul class="rail-list">
					<li><a href="<?php echo esc_url( pds2_portada_url() ); ?>">Els sis temes</a></li>
					<li><a href="<?php echo esc_url( pds2_preguntes_url() ); ?>">Preguntes PAU 2010-2024</a></li>
				</ul>
			</div>
		</aside>
	</div>

	<?php if ( $fonts ) : ?>
		<section id="fonts" class="pds2-sec" style="--pds2-tc: <?php echo esc_attr( $color ); ?>;">
			<div class="pds2-in">
				<h2 class="pds2-h2">Fonts</h2>
				<p class="pds2-sub">Documents de l'època en la llengua original, amb la procedència i el context.</p>
				<div class="pds2-fonts">
					<?php foreach ( $fonts as $j => $f ) : ?>
						<article class="pds2-font" id="font<?php echo (int) ( $j + 1 ); ?>">
							<header class="pds2-font-h">
								<span class="pds2-font-num"><?php echo (int) ( $j + 1 ); ?></span>
								<div>
									<h3><?php echo esc_html( (string) ( $f['titol'] ?? '' ) ); ?></h3>
									<p class="pds2-font-meta">
										<span class="pds2-chip"><?php echo esc_html( (string) ( $f['tipus'] ?? 'Text' ) ); ?></span>
										<?php echo esc_html( implode( ' · ', array_filter( array( (string) ( $f['autor'] ?? '' ), (string) ( $f['data'] ?? '' ) ) ) ) ); ?>
									</p>
								</div>
							</header>
							<?php if ( ! empty( $f['imatge'] ) ) : ?>
								<figure class="pds2-font-img"><?php echo wp_get_attachment_image( (int) $f['imatge'], 'large' ); ?></figure>
							<?php endif; ?>
							<?php if ( '' !== trim( (string) ( $f['text'] ?? '' ) ) ) : ?>
								<blockquote class="pds2-font-text">
									<?php foreach ( pds2_paragrafs( $f['text'] ) as $par ) : ?>
										<p><?php echo esc_html( $par ); ?></p>
									<?php endforeach; ?>
								</blockquote>
							<?php endif; ?>
							<p class="pds2-font-proc">
								<?php echo esc_html( (string) ( $f['procedencia'] ?? '' ) ); ?>
								<?php if ( ! empty( $f['enllac'] ) ) : ?>
									· <a href="<?php echo esc_url( $f['enllac'] ); ?>" target="_blank" rel="noopener">Digitalització</a>
								<?php endif; ?>
							</p>
							<?php if ( '' !== trim( wp_strip_all_tags( (string) ( $f['context'] ?? '' ) ) ) ) : ?>
								<div class="pds2-font-ctx"><p class="pds2-k">Context</p><?php echo wp_kses_post( $f['context'] ); ?></div>
							<?php endif; ?>
						</article>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php if ( $practica ) : ?>
		<section id="practica" class="pds2-sec pds2-sec--alt" style="--pds2-tc: <?php echo esc_attr( $color ); ?>;">
			<div class="pds2-in">
				<h2 class="pds2-h2">Pràctica per a l'examen</h2>
				<p class="pds2-sub">Enunciats en format PAU sobre aquest tema. Els oficials ho indiquen al començament.</p>
				<ol class="pds2-practica">
					<?php foreach ( $practica as $p ) : ?>
						<li>
							<span class="pds2-ex">Exercici <?php echo esc_html( (string) ( $p['exercici'] ?? '' ) ); ?></span>
							<div class="pds2-practica-t"><?php echo wp_kses_post( (string) ( $p['enunciat'] ?? '' ) ); ?></div>
						</li>
					<?php endforeach; ?>
				</ol>
			</div>
		</section>
	<?php endif; ?>

	<?php if ( $pau || $preguntes ) : ?>
		<section id="preguntes" class="pds2-sec" style="--pds2-tc: <?php echo esc_attr( $color ); ?>;">
			<div class="pds2-in">
				<h2 class="pds2-h2">Què hi pregunta la PAU</h2>
				<p class="pds2-sub">Preguntes de fonts i preguntes llargues de les PAU d'Història de Catalunya entre el 2010 i el 2024.</p>
				<?php if ( $pau ) : ?>
					<div class="pds2-bars" role="list">
						<?php foreach ( $pau as $r ) : ?>
							<div class="pds2-bar" role="listitem">
								<span class="pds2-bar-t"><?php echo esc_html( (string) ( $r['aspecte'] ?? '' ) ); ?></span>
								<span class="pds2-bar-track" aria-hidden="true"><i style="width: <?php echo esc_attr( (string) round( (int) $r['n'] / $pau_max * 100, 1 ) ); ?>%"></i></span>
								<b class="pds2-bar-n"><?php echo (int) ( $r['n'] ?? 0 ); ?></b>
							</div>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
				<?php if ( $preguntes ) : ?>
					<h3 class="pds2-h3">Aspecte per aspecte</h3>
					<div id="pq" class="pds2-pq"><p class="pq-loading">Carregant les dades…</p></div>
				<?php endif; ?>
			</div>
		</section>
	<?php endif; ?>
	<?php
endwhile;

get_footer();
