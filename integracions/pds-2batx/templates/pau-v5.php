<?php
/**
 * Preparar la PAU d'Història (/2n-batxillerat/historia/pau/), organització del 31/10/2026.
 * El que és comú a tots els temes: com és l'examen, com es fa cada exercici, on practicar (temes, exàmens
 * oficials sencers i simulacre de 90 minuts) i la caixa d'eines. Els exercicis de cada tema són a la seva
 * pestanya PAU. El recompte de preguntes 2010-2024 només s'enllaça per als docents.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$exs      = pds2_pau_exercicis();
$met      = pds2_pau_metode();
$eines    = pds2_pau_eines();
$dades    = pds2_pau_dades_global();
$banc     = pds2_banc();
$oficials = pds2_temes_oficials();
$per_n    = array();
foreach ( $dades['temes'] as $t ) {
	$per_n[ (int) $t['n'] ] = $t;
}
$fletxa = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
?>
<?php pds2_avis_privat(); ?>
<div class="um um4 um-c-2n-batxillerat pds2-v4 pds2-v4-portada pds2-v4-pau pds2-pau3" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / <a href="<?php echo esc_url( pds2_portada_url() ); ?>">2n Batxillerat</a> / <a href="<?php echo esc_url( pds2_historia_url() ); ?>">Història</a> / Preparar la PAU</nav>
			<p class="um-eyebrow">2n Batxillerat · Història · PAU</p>
			<h1>Preparar la PAU d'Història</h1>
			<p class="um-guide">Com és l'examen, com es fa cada exercici i on practicar-lo. Els exercicis de cada tema són a la pestanya PAU del tema.</p>
			<ul class="um-facts">
				<li>Quatre exercicis de 2,5 punts</li>
				<li>Com es fa cada exercici</li>
				<li>Simulacre de 90 minuts</li>
				<li>Exàmens oficials sencers</li>
			</ul>
		</div>
	</header>

	<div class="um-wrap pds2-v4-pagina">

		<nav class="pds2-pau-salts" aria-label="En aquesta pàgina">
			<a href="#examen">L'examen</a>
			<a href="#metode">Com es fa cada exercici</a>
			<a href="#practica">Practica</a>
			<a href="#eines">Caixa d'eines</a>
		</nav>

		<section class="um-sec" id="examen">
			<header><span class="um-num">Examen</span><h2>L'examen en un cop d'ull</h2></header>
			<p>Quatre exercicis obligatoris de 2,5 punts. Als exercicis 2 i 3 tries entre l'opció A i la B. Tens una hora i mitja.</p>
			<div class="pau-exs">
				<?php foreach ( $exs as $k => $e ) : ?>
					<article class="pau-ex">
						<div class="pau-ex-h"><span class="pau-n"><?php echo (int) $k; ?></span><span class="pau-ex-tria"><?php echo esc_html( $e['tria'] ); ?></span></div>
						<p class="pau-ex-t"><?php echo esc_html( $e['nom'] ); ?></p>
						<p class="pau-s"><?php echo esc_html( $e['punts'] ); ?>.</p>
					</article>
				<?php endforeach; ?>
			</div>
			<p class="pau-s">Una manera de repartir els 90 minuts. És una proposta, no un criteri oficial.</p>
			<div class="pau-temps" role="img" aria-label="Exercici 1, 20 minuts. Exercici 2, 20 minuts. Exercici 3, 25 minuts. Exercici 4, 10 minuts. Repàs, 15 minuts.">
				<span style="flex: 20 1 0">1 · 20 min</span><span style="flex: 20 1 0">2 · 20 min</span><span style="flex: 25 1 0">3 · 25 min</span><span style="flex: 10 1 0">4 · 10</span><span style="flex: 15 1 0">Repàs · 15</span>
			</div>
			<p class="um-foot-note">Als exercicis 2 i 3, la redacció, l'ortografia i la presentació poden restar fins a 0,25 punts.</p>
		</section>

		<section class="um-sec" id="metode">
			<header><span class="um-num">Mètode</span><h2>Com es fa cada exercici</h2></header>
			<p>Explicat una sola vegada, perquè és igual a tots els temes. Des de cada exercici del tema hi ha un enllaç cap aquí.</p>
			<div class="pau-met-tabs" role="group" aria-label="Tria l'exercici" hidden>
				<?php foreach ( $exs as $k => $e ) : ?>
					<button type="button" data-met="<?php echo (int) $k; ?>" aria-pressed="<?php echo 1 === $k ? 'true' : 'false'; ?>">Exercici <?php echo (int) $k; ?> · <?php echo esc_html( $e['curt'] ); ?></button>
				<?php endforeach; ?>
			</div>
			<?php foreach ( $met as $k => $m ) : ?>
				<div class="pau-met" id="metode-<?php echo (int) $k; ?>">
					<h3>Exercici <?php echo (int) $k; ?>. <?php echo esc_html( $exs[ $k ]['nom'] ); ?></h3>
					<div class="pau-met-2">
						<div><p class="pau-k">Què et demanen</p><p><?php echo esc_html( $m['demanen'] ); ?></p></div>
						<div><p class="pau-k">Com es puntua</p><p><?php echo esc_html( $m['puntua'] ); ?></p></div>
					</div>
					<div>
						<p class="pau-k">L'estructura de la resposta</p>
						<ol class="pau-estr">
							<?php foreach ( $m['estructura'] as $p ) : ?>
								<li><b><?php echo esc_html( $p['k'] ); ?></b><span><?php echo esc_html( $p['d'] ); ?></span></li>
							<?php endforeach; ?>
						</ol>
					</div>
					<div class="pau-sino">
						<div><p>El que fan les respostes que puntuen</p><ul><?php foreach ( $m['si'] as $x ) : ?><li><?php echo esc_html( $x ); ?></li><?php endforeach; ?></ul></div>
						<div><p>El que fa perdre punts</p><ul><?php foreach ( $m['errors'] as $x ) : ?><li><?php echo esc_html( $x ); ?></li><?php endforeach; ?></ul></div>
					</div>
				</div>
			<?php endforeach; ?>
		</section>

		<section class="um-sec" id="practica">
			<header><span class="um-num">Practica</span><h2>On practicar</h2></header>
			<div class="pau-pr">
				<div>
					<h3>Tema per tema</h3>
					<p class="pau-s">Primer cada tema per separat, quan l'estudies. Els números són els exercicis de cada tipus que hi ha a la pestanya PAU del tema.</p>
					<ol class="pau-temes">
						<?php foreach ( $oficials as $nn => $o ) :
							$t = $per_n[ (int) $nn ] ?? null;
							$c = $t ? pds2_pau_compte( $t['fitxes'] ) : null;
							?>
							<li class="<?php echo $t ? 'is-on' : 'is-off'; ?>">
								<span class="pau-tn"><span class="pau-n"><?php echo (int) $nn; ?></span><span>
									<?php if ( $t ) : ?>
										<a href="<?php echo esc_url( $t['url'] . '#activitats' ); ?>"><?php echo esc_html( $o['nom'] ); ?></a>
									<?php else : ?>
										<?php echo esc_html( $o['nom'] ); ?>
									<?php endif; ?>
									<small><?php echo esc_html( $o['dates'] ); ?><?php echo $t ? '' : ' · En preparació'; ?></small></span></span>
								<?php if ( $c ) : ?>
									<span class="pau-cnt">Ex. 1 · <?php echo (int) $c[1]; ?> &nbsp; Ex. 2 · <?php echo (int) $c[2]; ?> &nbsp; Ex. 3 · <?php echo (int) $c[3]; ?> &nbsp; Ex. 4 · <?php echo (int) $c[4]; ?></span>
								<?php endif; ?>
							</li>
						<?php endforeach; ?>
					</ol>
				</div>
				<div>
					<h3>Exàmens oficials sencers</h3>
					<p class="pau-s">Per fer-ne un de cap a peus, amb el temps de l'examen, i corregir-lo amb els criteris de la mateixa convocatòria.</p>
					<div class="pau-taula">
						<table class="pau-exams">
							<thead><tr><th scope="col">Convocatòria</th><th scope="col">Examen</th><th scope="col">Criteris</th></tr></thead>
							<tbody>
								<?php foreach ( $banc['convocatories'] as $cv ) : ?>
									<tr>
										<td><?php echo esc_html( trim( ( $cv['nom'] ?? '' ) . ' · ' . ( $cv['serie'] ?? '' ), ' ·' ) ); ?></td>
										<td><?php if ( ! empty( $cv['examen'] ) ) : ?><a href="<?php echo esc_url( $cv['examen'] ); ?>" target="_blank" rel="noopener">PDF<span class="screen-reader-text"> de l'examen <?php echo esc_html( $cv['nom'] ?? '' ); ?></span></a><?php endif; ?></td>
										<td><?php if ( ! empty( $cv['criteris'] ) ) : ?><a href="<?php echo esc_url( $cv['criteris'] ); ?>" target="_blank" rel="noopener">PDF<span class="screen-reader-text"> dels criteris <?php echo esc_html( $cv['nom'] ?? '' ); ?></span></a><?php endif; ?></td>
									</tr>
								<?php endforeach; ?>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div class="pau-sim-box" id="simulacre">
				<h3>Simulacre de 90 minuts</h3>
				<p>Un examen sencer amb enunciats barrejats dels temes que triïs. Un exercici 1, les opcions A i B del 2 i del 3, i deu qüestions de test. Escrius a mà, amb el cronòmetre en marxa, i en acabar et corregeixes amb els criteris.</p>
				<div id="pds2-sim"><noscript><p>Per fer el simulacre cal tenir el JavaScript activat.</p></noscript></div>
			</div>
		</section>

		<section class="um-sec" id="eines">
			<header><span class="um-num">Redactar</span><h2>Caixa d'eines</h2></header>
			<p>Tria el connector segons la relació que vols expressar, no perquè quedi bé, ja que cada connector afirma com s'enllacen dos fets.</p>
			<div class="pau-eines-g">
				<div class="pau-eines">
					<?php foreach ( $eines['connectors'] as $c ) : ?>
						<div class="pau-eina"><p class="pau-eina-t"><?php echo esc_html( $c[0] ); ?></p><p class="pau-s"><?php echo esc_html( $c[1] ); ?></p><ul><?php foreach ( $c[2] as $w ) : ?><li><?php echo esc_html( $w ); ?></li><?php endforeach; ?></ul></div>
					<?php endforeach; ?>
					<div class="pau-eina"><p class="pau-eina-t">Verbs precisos</p><p class="pau-s">En lloc de fer, posar o dir, verbs que expliquin exactament què passa.</p><ul><?php foreach ( $eines['verbs'] as $w ) : ?><li><?php echo esc_html( $w ); ?></li><?php endforeach; ?></ul></div>
				</div>
				<h3>Errors de llengua freqüents</h3>
				<div class="pau-taula">
					<table class="pau-errs-t">
						<thead><tr><th scope="col">Evita</th><th scope="col">Escriu</th><th scope="col">Per què</th></tr></thead>
						<tbody>
							<?php foreach ( $eines['errors'] as $r ) : ?>
								<tr><td><?php echo esc_html( $r[0] ); ?></td><td><?php echo esc_html( $r[1] ); ?></td><td><?php echo esc_html( $r[2] ); ?></td></tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				</div>
				<div class="um-box um-key"><span class="um-box-t">Regles d'estil que valoren els correctors</span><p><?php echo esc_html( $eines['estil'] ); ?></p></div>
			</div>
		</section>

		<?php if ( ( function_exists( 'pds_is_docent' ) && pds_is_docent() ) || current_user_can( 'manage_options' ) ) : ?>
			<p class="pau-docent"><strong>Per al docent.</strong> El recompte del que preguntava la PAU entre el 2010 i el 2024, amb el model d'examen anterior, és a <a href="<?php echo esc_url( pds2_preguntes_url() ); ?>">Què preguntava la PAU</a>.</p>
		<?php endif; ?>

	</div>
</div>
<script type="application/json" id="pds2-pau-dades"><?php echo pds2_pau_json( $dades ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON amb JSON_HEX_TAG. ?></script>
<?php
get_footer();
