<?php
/**
 * Pàgina d'un Tema PAU amb el model de les unitats del lloc (disseny v4: capçalera de color, pestanyes i targetes).
 * Fa servir els fulls d'estil i els scripts del model (uploads/pds-model) i el color del curs de 2n de Batxillerat.
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
	$oficial   = pds2_temes_oficials()[ $n ] ?? array( 'nom' => get_the_title(), 'dates' => '' );
	$dates     = (string) pds2_f( 'dates', $pid, $oficial['dates'] );
	$pregunta  = (string) pds2_f( 'pregunta', $pid, '' );
	$idea_clau = (string) pds2_f( 'idea_clau', $pid, '' );
	$claus     = array_values( array_filter( (array) pds2_f( 'claus', $pid, array() ), static fn( $c ) => '' !== trim( (string) ( $c['text'] ?? '' ) ) ) );
	$apartats  = array_values( (array) pds2_f( 'apartats', $pid, array() ) );
	$fonts     = array_values( (array) pds2_f( 'fonts', $pid, array() ) );
	$practica  = array_values( (array) pds2_f( 'practica', $pid, array() ) );
	$pau       = array_values( (array) pds2_f( 'pau', $pid, array() ) );
	$preguntes = array_values( (array) pds2_f( 'preguntes', $pid, array() ) );
	$taller_on = 'disponible' === pds2_f( 'estat_taller', $pid, '' );
	$pres      = pds2_presentacio( (int) $n );
	$seccions  = pds2_v4_seccions( $pid );
	$pau_tot   = array_sum( array_map( static fn( $r ) => count( pds2_convocatories( $r['fonts'] ?? '' ) ) + count( pds2_convocatories( $r['llargues'] ?? '' ) ), $preguntes ) );
	$pau_max   = max( array_merge( array( 1 ), array_map( static fn( $r ) => (int) ( $r['n'] ?? 0 ), $pau ) ) );
	$minuts    = max( 5, (int) ( round( $seccions['paraules'] / 200 / 5 ) * 5 ) );
	$v2        = pds2_pau_v2();
	$tests     = $v2 ? pds2_tests_data( (int) $n ) : null;
	$n_tests   = $tests ? count( $tests['tests'] ) : 0;

	?>
	<?php pds2_avis_privat(); ?>
	<div class="um um4 um-c-2n-batxillerat pds2-v4 pds2-t-<?php echo (int) $n; ?>" data-view="alumne">
		<header class="um-hero">
			<div class="um-wrap">
				<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / <a href="<?php echo esc_url( pds2_portada_url() ); ?>">2n Batxillerat</a> / <a href="<?php echo esc_url( pds2_historia_url() ); ?>">Història</a> / Tema <?php echo (int) $n; ?></nav>
				<p class="um-eyebrow">2n Batxillerat · Història · Tema <?php echo (int) $n; ?><?php echo $dates ? ' · ' . esc_html( $dates ) : ''; ?></p>
				<h1><?php echo esc_html( $oficial['nom'] ); ?></h1>
				<?php if ( $pregunta ) : ?>
					<p class="um-guide"><?php echo esc_html( $pregunta ); ?></p>
				<?php endif; ?>
				<ul class="um-facts">
					<li><?php echo count( $apartats ); ?> apartats<?php echo $dates ? ' (' . esc_html( $dates ) . ')' : ''; ?></li>
					<li>Lectura del temari, uns <?php echo (int) $minuts; ?> minuts</li>
					<?php if ( $pres ) : ?>
						<li>Presentació (<?php echo count( $pres['diapositives'] ); ?> diapositives)</li>
					<?php endif; ?>
					<?php if ( $v2 ) : ?>
						<?php if ( $taller_on ) : ?>
							<li>Taller PAU, els quatre exercicis pas a pas</li>
						<?php endif; ?>
						<?php if ( $n_tests ) : ?>
							<li><?php echo (int) $n_tests; ?> <?php echo 1 === $n_tests ? 'test' : 'tests'; ?> de l'exercici 4</li>
						<?php endif; ?>
					<?php else : ?>
						<?php if ( $taller_on ) : ?>
							<li>Taller PAU (exercicis 1, 2 i 3, pas a pas)</li>
						<?php endif; ?>
						<?php if ( $pau_tot ) : ?>
							<li><?php echo (int) $pau_tot; ?> preguntes a les PAU (del 2010 al 2024)</li>
						<?php endif; ?>
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
					<li><a href="#comencem">Abans de començar</a></li>
					<?php foreach ( $seccions['apartats'] as $i => $s ) : ?>
						<li><a href="#s<?php echo (int) ( $i + 1 ); ?>"><?php echo (int) ( $i + 1 ) . '. ' . esc_html( $s['titol'] ); ?></a>
							<?php if ( $s['sub'] ) : ?>
								<ol>
									<?php foreach ( $s['sub'] as $sub ) : ?>
										<li><a href="#<?php echo esc_attr( $sub['id'] ); ?>"><?php echo esc_html( $sub['titol'] ); ?></a></li>
									<?php endforeach; ?>
								</ol>
							<?php endif; ?>
						</li>
					<?php endforeach; ?>
					<?php if ( $fonts ) : ?>
						<li><a href="#fonts">Fonts</a></li>
					<?php endif; ?>
				</ol>
				<div class="um-progress"><span></span></div>
			</nav>

			<article class="um-main">

				<section class="um-sec" id="comencem">
					<header><span class="um-num">Abans de començar</span><h2>Què has d'entendre d'aquest tema</h2></header>
					<?php if ( $idea_clau || $claus ) : ?>
						<?php if ( $idea_clau ) : ?>
							<div class="um-box um-key pds2-idea"><span class="um-box-t">Si només en recordes una idea</span><p><?php echo esc_html( $idea_clau ); ?></p></div>
						<?php endif; ?>
						<?php if ( $claus ) : ?>
							<ol class="pds2-claus">
								<?php foreach ( $claus as $c ) : ?>
									<li><?php echo ! empty( $c['titol'] ) ? '<strong>' . esc_html( rtrim( (string) $c['titol'], '.' ) ) . '.</strong> ' : ''; ?><?php echo esc_html( (string) $c['text'] ); ?></li>
								<?php endforeach; ?>
							</ol>
						<?php endif; ?>
					<?php elseif ( has_excerpt() ) : ?>
						<p class="um-intro"><?php echo esc_html( wp_strip_all_tags( get_the_excerpt() ) ); ?></p>
					<?php endif; ?>
					<div class="um-box um-near">
						<span class="um-box-t">Tema <?php echo (int) $n; ?> de la PAU d'Història</span>
						<p><?php echo esc_html( get_the_title() ); ?><?php echo $dates ? ' (' . esc_html( $dates ) . ')' : ''; ?>.</p>
					</div>
					<?php if ( $apartats && ! $claus ) : ?>
						<h3>Els apartats</h3>
						<ol>
							<?php foreach ( $apartats as $i => $ap ) : ?>
								<li><a href="#s<?php echo (int) ( $i + 1 ); ?>"><?php echo esc_html( (string) ( $ap['titol'] ?? '' ) ); ?></a><?php echo ! empty( $ap['dates'] ) ? ' (' . esc_html( $ap['dates'] ) . ')' : ''; ?></li>
							<?php endforeach; ?>
						</ol>
					<?php endif; ?>
				</section>

				<?php foreach ( $seccions['apartats'] as $i => $s ) :
					$ap = $apartats[ $i ] ?? array();
					?>
					<section class="um-sec" id="s<?php echo (int) ( $i + 1 ); ?>">
						<header><span class="um-num">Apartat <?php echo (int) ( $i + 1 ); ?></span><h2 id="ap<?php echo (int) $i; ?>"><?php echo esc_html( $s['titol'] ); ?></h2></header>
						<?php if ( ! empty( $ap['resum'] ) ) : ?>
							<p class="um-q"><?php echo ! empty( $ap['dates'] ) ? '<strong>' . esc_html( $ap['dates'] ) . '.</strong> ' : ''; ?><?php echo esc_html( $ap['resum'] ); ?></p>
						<?php endif; ?>
						<?php echo $s['html']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- contingut del tema filtrat per the_content. ?>
						<?php echo pds2_v4_peu( $ap ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?>
					</section>
				<?php endforeach; ?>

				<?php if ( $fonts ) : ?>
					<section class="um-sec" id="fonts">
						<header><span class="um-num">Fonts</span><h2>Fonts del tema</h2></header>
						<p>Documents de l'època en la llengua original, amb la procedència i el context.</p>
						<?php foreach ( $fonts as $j => $f ) : ?>
							<article class="pds2-v4-font" id="font<?php echo (int) ( $j + 1 ); ?>">
								<header>
									<span class="pds2-v4-n"><?php echo (int) ( $j + 1 ); ?></span>
									<div>
										<h3><?php echo esc_html( (string) ( $f['titol'] ?? '' ) ); ?></h3>
										<p class="pds2-v4-meta"><?php echo esc_html( implode( ' · ', array_filter( array( (string) ( $f['tipus'] ?? 'Text' ), (string) ( $f['autor'] ?? '' ), (string) ( $f['data'] ?? '' ) ) ) ) ); ?></p>
									</div>
								</header>
								<?php if ( ! empty( $f['imatge'] ) ) : ?>
									<figure class="um-fig um-photo"><?php echo wp_get_attachment_image( (int) $f['imatge'], 'large' ); ?></figure>
								<?php endif; ?>
								<?php if ( '' !== trim( (string) ( $f['text'] ?? '' ) ) ) : ?>
									<blockquote class="pds2-v4-cita">
										<?php foreach ( pds2_paragrafs( $f['text'] ) as $par ) : ?>
											<p><?php echo esc_html( $par ); ?></p>
										<?php endforeach; ?>
									</blockquote>
								<?php endif; ?>
								<p class="pds2-v4-proc">
									<?php echo esc_html( (string) ( $f['procedencia'] ?? '' ) ); ?>
									<?php if ( ! empty( $f['enllac'] ) ) : ?>
										· <a href="<?php echo esc_url( $f['enllac'] ); ?>" target="_blank" rel="noopener">Digitalització</a>
									<?php endif; ?>
								</p>
								<?php if ( '' !== trim( wp_strip_all_tags( (string) ( $f['context'] ?? '' ) ) ) ) : ?>
									<div class="um-box um-near"><span class="um-box-t">Context</span><?php echo pds2_enllacos_pendents( wp_kses_post( $f['context'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- ja filtrat amb wp_kses_post. ?></div>
								<?php endif; ?>
							</article>
						<?php endforeach; ?>
						<p class="um-foot-note">Material obert de professordesocials.cat amb llicència Creative Commons BY-SA 4.0.</p>
					</section>
				<?php endif; ?>

				<?php if ( $pres ) :
					$dia  = $pres['diapositives'];
					$v    = rawurlencode( (string) ( $pres['versio'] ?? PDS2_VER ) );
					$base = $pres['url'];
					?>
					<section class="um-sec pds2-pres" id="sa" aria-labelledby="presentacio">
						<header><span class="um-num">Presentació</span><h2 id="presentacio">Presentació del tema</h2></header>
						<p>Les idees clau de cada apartat, amb les imatges i el que en surt a la PAU. Passa les diapositives amb les fletxes, lliscant el dit al mòbil o triant-ne una de la llista.</p>
						<div class="pds2-pres-v" data-base="<?php echo esc_url( $base ); ?>" data-v="<?php echo esc_attr( $v ); ?>">
							<div class="pds2-pres-stage">
								<img src="<?php echo esc_url( $base . $dia[0]['img'] . '?v=' . $v ); ?>" width="1600" height="900" alt="<?php echo esc_attr( 'Diapositiva 1. ' . $dia[0]['t'] ); ?>" decoding="async">
								<button type="button" class="pds2-pres-nav pds2-pres-prev" aria-label="Diapositiva anterior" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
								<button type="button" class="pds2-pres-nav pds2-pres-next" aria-label="Diapositiva següent"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></button>
							</div>
							<div class="pds2-pres-bar">
								<label class="screen-reader-text" for="pds2-pres-tria">Tria una diapositiva</label>
								<select id="pds2-pres-tria" class="pds2-pres-tria">
									<?php
									$grup = null;
									foreach ( $dia as $i => $d ) :
										if ( ( $d['s'] ?? '' ) !== $grup ) :
											if ( null !== $grup ) :
												echo '</optgroup>';
											endif;
											$grup = (string) ( $d['s'] ?? '' );
											echo '<optgroup label="' . esc_attr( $grup ) . '">';
										endif;
										?>
										<option value="<?php echo (int) $i; ?>"><?php echo (int) ( $i + 1 ) . '. ' . esc_html( (string) $d['t'] ); ?></option>
									<?php endforeach; ?>
									<?php echo null !== $grup ? '</optgroup>' : ''; ?>
								</select>
								<span class="pds2-pres-comp" aria-live="polite">1 / <?php echo count( $dia ); ?></span>
								<button type="button" class="um-btn pds2-pres-full">Pantalla completa</button>
							</div>
						</div>
						<div class="um-box um-near pds2-pres-notes">
							<span class="um-box-t">Notes de la diapositiva</span>
							<p><?php echo esc_html( (string) ( $dia[0]['n'] ?? '' ) ); ?></p>
						</div>
						<div class="um-box um-key pds2-pres-baixa">
							<span class="um-box-t">Descarrega-la</span>
							<p>El fitxer de PowerPoint s'obre i s'edita a Presentacions de Google. Puja'l a Google Drive i obre'l amb Presentacions de Google. També el pots obrir amb PowerPoint o amb LibreOffice.</p>
							<p class="pds2-pres-btns">
								<a class="um-quiz-btn" href="<?php echo esc_url( $base . $pres['pptx'] . '?v=' . $v ); ?>" download>Descarrega per a Google Slides (.pptx, <?php echo esc_html( pds2_mb( (int) ( $pres['mida_pptx'] ?? 0 ) ) ); ?>)</a>
								<?php if ( ! empty( $pres['pdf'] ) ) : ?>
									<a class="um-btn pds2-pres-pdf" href="<?php echo esc_url( $base . $pres['pdf'] . '?v=' . $v ); ?>" download>Descarrega en PDF (<?php echo esc_html( pds2_mb( (int) ( $pres['mida_pdf'] ?? 0 ) ) ); ?>)</a>
								<?php endif; ?>
							</p>
						</div>
						<script type="application/json" class="pds2-pres-dades"><?php echo wp_json_encode( array_map( static fn( $d ) => array( 'img' => (string) $d['img'], 't' => (string) $d['t'], 'n' => (string) ( $d['n'] ?? '' ) ), $dia ), JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP ); ?></script>
					</section>
				<?php endif; ?>

				<?php if ( $v2 ) :
					include pds2_plantilla( 'tema-pau-v4.php' );
				elseif ( $practica || $taller_on ) : ?>
					<section class="um-sec" id="activitats">
						<header><span class="um-num">Practica</span><h2>Pràctica per a l'examen</h2></header>
						<p>Enunciats en format PAU sobre aquest tema. Els oficials ho indiquen al començament.</p>
						<?php if ( $taller_on ) : ?>
							<div class="um-box um-key pds2-v4-taller">
								<span class="um-box-t">Taller PAU</span>
								<p>Els exercicis 1, 2 i 3 d'aquest tema, pas a pas. Llegeixes l'enunciat, planifiques, escrius a mà, t'autoavalues i ho compares amb una resposta model comentada.</p>
								<p><a class="um-quiz-btn" href="<?php echo esc_url( pds2_taller_url( $pid ) ); ?>">Obre el Taller PAU</a></p>
							</div>
						<?php endif; ?>
						<?php foreach ( $practica as $p ) : ?>
							<div class="um-box um-think pds2-v4-ex">
								<span class="um-box-t">Exercici <?php echo esc_html( (string) ( $p['exercici'] ?? '' ) ); ?></span>
								<?php echo pds2_enllacos_pendents( wp_kses_post( (string) ( $p['enunciat'] ?? '' ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- ja filtrat amb wp_kses_post. ?>
							</div>
						<?php endforeach; ?>
					</section>
				<?php endif; ?>

				<?php if ( ! $v2 && ( $pau || $preguntes ) ) : ?>
					<section class="um-sec" id="recursos">
						<header><span class="um-num">PAU</span><h2>Què hi pregunta la PAU</h2></header>
						<p>Preguntes de fonts i preguntes llargues de les PAU d'Història de Catalunya entre el 2010 i el 2024<?php echo $pau_tot ? ', ' . (int) $pau_tot . ' en total sobre aquest tema' : ''; ?>.</p>
						<?php if ( $pau ) : ?>
							<h3>El que més surt a la PAU</h3>
							<div class="pds2-v4-bars" role="list">
								<?php foreach ( $pau as $r ) : ?>
									<div class="pds2-v4-bar" role="listitem">
										<span><?php echo esc_html( (string) ( $r['aspecte'] ?? '' ) ); ?></span>
										<i aria-hidden="true"><b style="width: <?php echo esc_attr( (string) round( (int) $r['n'] / $pau_max * 100, 1 ) ); ?>%"></b></i>
										<strong><?php echo (int) ( $r['n'] ?? 0 ); ?></strong>
									</div>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>
						<?php if ( $preguntes ) : ?>
							<h3>Aspecte per aspecte</h3>
							<div id="pq" class="pds2-pq"><p class="pq-loading">Carregant les dades…</p></div>
						<?php endif; ?>
					</section>
				<?php endif; ?>

			</article>
		</div>
	</div>
	<?php
endwhile;

get_footer();
