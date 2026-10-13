<?php
/**
 * Preparar la PAU d'Història (/2n-batxillerat/historia/pau/), amb el model de les unitats del lloc (disseny v4).
 * Reuneix el que és comú a tots els temes: com és l'examen, un test barrejat de l'exercici 4,
 * la caixa d'eines per redactar i el recompte de preguntes 2010-2024.
 * El test i la caixa d'eines els dibuixa taller.js dins de #taller; les preguntes, preguntes.js dins de #pq.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$oficials = pds2_temes_oficials();
$posts    = array();
foreach ( pds2_temes() as $p ) {
	$posts[ pds2_tema_numero( $p->ID ) ] = $p;
}
?>
<?php pds2_avis_privat(); ?>
<div class="um um4 um-c-2n-batxillerat pds2-v4 pds2-v4-portada pds2-v4-pau" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / <a href="<?php echo esc_url( pds2_portada_url() ); ?>">2n Batxillerat</a> / <a href="<?php echo esc_url( pds2_historia_url() ); ?>">Història</a> / Preparar la PAU</nav>
			<p class="um-eyebrow">2n Batxillerat · Història · PAU</p>
			<h1>Preparar la PAU</h1>
			<p class="um-guide">Com és l'examen d'Història, un test amb qüestions de diversos temes, la caixa d'eines per redactar i el que ha preguntat la PAU fins ara.</p>
			<ul class="um-facts">
				<li>Quatre exercicis de 2,5 punts</li>
				<li>Tests de l'exercici 4 amb la puntuació oficial</li>
				<li>Connectors i verbs per redactar</li>
			</ul>
		</div>
	</header>

	<div class="um-wrap pds2-v4-pagina">

		<nav class="pds2-pau-salts" aria-label="En aquesta pàgina">
			<a href="#examen">L'examen</a>
			<a href="#test">Test de l'exercici 4</a>
			<a href="#eines">Caixa d'eines</a>
			<a href="#preguntes">Què pregunta la PAU</a>
		</nav>

		<section class="um-sec" id="examen">
			<header><span class="um-num">Examen</span><h2>Com és l'examen</h2></header>
			<p>Quatre exercicis obligatoris de 2,5 punts cadascun, en 90 minuts. Als exercicis 2 i 3 es tria una de les dues opcions. Cada examen equilibra l'àmbit català i l'espanyol, i temes polítics, socials i econòmics.</p>
			<div class="um-cards">
				<article class="um-card"><h4>Exercici 1. Anàlisi crítica de fonts</h4><span class="um-tag">0,50 + 0,50 + 1,50 punts</span><p>Dues fonts amb un mateix eix temàtic. Dues idees de cada font i una breu redacció que les compara i les relaciona amb el context.</p></article>
				<article class="um-card"><h4>Exercici 2. Situeu-vos en el temps</h4><span class="um-tag">1,50 + 5 termes × 0,20 punts</span><p>Una redacció des del personatge que proposa l'enunciat, amb cinc termes històrics ben integrats.</p></article>
				<article class="um-card"><h4>Exercici 3. Glossari</h4><span class="um-tag">1,00 + 1,00 + 0,50 punts</span><p>Un tema transversal, que pot travessar diverses etapes, a partir d'un descriptor del glossari oficial.</p></article>
				<article class="um-card"><h4>Exercici 4. Poseu a prova els vostres sabers</h4><span class="um-tag">10 qüestions · 2,50 punts</span><p>Deu qüestions tipus test amb quatre opcions. Cada encert suma 0,25, cada error resta 0,08 i les qüestions en blanc no compten.</p></article>
			</div>
			<p class="um-foot-note">Als exercicis 2 i 3, la redacció, l'ortografia i la presentació poden restar fins al 10% del valor de l'exercici.</p>
			<h3>Practica per temes</h3>
			<p>Cada tema té la seva pestanya PAU, amb el que en surt i els quatre exercicis pas a pas.</p>
			<ol class="pds2-v4-temes pds2-pau-temes">
				<?php foreach ( $oficials as $n => $o ) :
					$p = $posts[ $n ] ?? null;
					?>
					<li class="<?php echo $p ? 'is-on' : 'is-off'; ?>">
						<span class="pds2-v4-tn"><?php echo (int) $n; ?></span>
						<div>
							<?php if ( $p ) : ?>
								<a class="pds2-v4-tt" href="<?php echo esc_url( get_permalink( $p ) . '#activitats' ); ?>"><?php echo esc_html( $o['nom'] ); ?></a>
							<?php else : ?>
								<span class="pds2-v4-tt"><?php echo esc_html( $o['nom'] ); ?></span>
							<?php endif; ?>
							<span class="pds2-v4-tm"><?php echo esc_html( $o['dates'] ); ?><?php echo $p ? '' : ' · En preparació'; ?></span>
						</div>
					</li>
				<?php endforeach; ?>
			</ol>
		</section>

		<div id="taller" class="pds2-taller pds2-pau-app">
			<section class="um-sec" id="test">
				<header><span class="um-num">Exercici 4</span><h2>Test com a l'examen</h2></header>
				<div id="pds2-test-mixt" class="tt"><p class="tl-loading">Carregant els tests…</p></div>
			</section>

			<section class="um-sec" id="eines">
				<header><span class="um-num">Redactar</span><h2>Caixa d'eines</h2></header>
				<div id="pds2-eines"></div>
			</section>
		</div>

		<section class="um-sec" id="preguntes">
			<header><span class="um-num">2010-2024</span><h2>Què pregunta la PAU</h2></header>
			<p>Recompte de les preguntes de fonts i de les preguntes llargues de les PAU d'Història entre el 2010 i el 2024, amb el model d'examen anterior al 2025. Serveix per saber quins continguts es repeteixen més.</p>
			<div id="pq" class="pds2-pq"><p class="pq-loading">Carregant les dades…</p></div>
		</section>

	</div>
</div>
<?php
get_footer();
