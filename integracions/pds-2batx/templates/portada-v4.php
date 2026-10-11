<?php
/**
 * Portada de 2n de Batxillerat amb el model de les unitats del lloc (disseny v4).
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
$inici = 1875;
$fi    = 1986;
$pos   = static function ( int $any ) use ( $inici, $fi ): float {
	return round( ( max( $inici, min( $fi, $any ) ) - $inici ) / ( $fi - $inici ) * 100, 2 );
};
$anys  = static function ( string $dates ): array {
	preg_match_all( '/\d{4}/', $dates, $m );
	return array( (int) ( $m[0][0] ?? 0 ), (int) ( $m[0][1] ?? 0 ) );
};
$amb_taller = array_filter( $posts, static fn( $p ) => 'disponible' === pds2_f( 'estat_taller', $p->ID, '' ) );
?>
<?php pds2_avis_privat(); ?>
<div class="um um4 um-c-2n-batxillerat pds2-v4 pds2-v4-portada" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / 2n Batxillerat</nav>
			<p class="um-eyebrow">2n Batxillerat · Història · PAU</p>
			<h1>Història d'Espanya i Catalunya</h1>
			<p class="um-guide">Els sis temes de 2n de Batxillerat que entren a les PAU, de la Restauració a la consolidació democràtica (1875–1986).</p>
			<ul class="um-facts">
				<li>6 temes de la PAU</li>
				<li><?php echo count( $amb_taller ); ?> <?php echo 1 === count( $amb_taller ) ? 'tema' : 'temes'; ?> amb Taller PAU</li>
				<li>Preguntes de les PAU del 2010 al 2024</li>
			</ul>
		</div>
	</header>

	<div class="um-wrap pds2-v4-pagina">

		<section class="um-sec" id="temes">
			<header><span class="um-num">Temes</span><h2>Els sis temes</h2></header>
			<p>Cada tema té l'explicació per apartats, les fonts, la pràctica per a l'examen i les preguntes que hi ha fet la PAU.</p>
			<ol class="pds2-v4-temes">
				<?php foreach ( $oficials as $n => $o ) :
					$p      = $posts[ $n ] ?? null;
					$taller = $p && 'disponible' === pds2_f( 'estat_taller', $p->ID, '' );
					?>
					<li class="<?php echo $p ? 'is-on' : 'is-off'; ?>">
						<span class="pds2-v4-tn"><?php echo (int) $n; ?></span>
						<div>
							<?php if ( $p ) : ?>
								<a class="pds2-v4-tt" href="<?php echo esc_url( get_permalink( $p ) ); ?>"><?php echo esc_html( $o['nom'] ); ?></a>
							<?php else : ?>
								<span class="pds2-v4-tt"><?php echo esc_html( $o['nom'] ); ?></span>
							<?php endif; ?>
							<span class="pds2-v4-tm"><?php echo esc_html( $p ? (string) pds2_f( 'dates', $p->ID, $o['dates'] ) : $o['dates'] ); ?><?php echo $p ? '' : ' · En preparació'; ?></span>
						</div>
						<?php if ( $taller ) : ?>
							<a class="pds2-v4-tl" href="<?php echo esc_url( pds2_taller_url( $p->ID ) ); ?>">Taller PAU</a>
						<?php endif; ?>
					</li>
				<?php endforeach; ?>
			</ol>
		</section>

		<section class="um-sec" id="cronologia">
			<header><span class="um-num">Cronologia</span><h2>La línia del temps</h2></header>
			<div class="pds2-v4-crono" aria-hidden="true">
				<?php $d2 = $anys( $oficials[2]['dates'] ); ?>
				<div class="pds2-v4-crono-par<?php echo isset( $posts[2] ) ? ' is-on' : ''; ?>" style="width: <?php echo esc_attr( (string) $pos( $d2[1] ) ); ?>%;">
					<b>2</b><span>Catalanisme polític<span class="pds2-v4-extra"> (1833–1931), en paral·lel a la Restauració</span></span>
				</div>
				<div class="pds2-v4-crono-main">
					<?php foreach ( array( 1, 3, 4, 5, 6 ) as $n ) :
						$d = $anys( $oficials[ $n ]['dates'] );
						?>
						<div class="pds2-v4-crono-seg<?php echo isset( $posts[ $n ] ) ? ' is-on' : ''; ?><?php echo ( $d[1] - $d[0] ) < 10 ? ' is-estret' : ''; ?>" style="left: <?php echo esc_attr( (string) $pos( $d[0] ) ); ?>%; width: <?php echo esc_attr( (string) ( $pos( $d[1] ) - $pos( $d[0] ) ) ); ?>%;" title="<?php echo esc_attr( 'Tema ' . $n . '. ' . $oficials[ $n ]['nom'] . ' (' . $oficials[ $n ]['dates'] . ')' ); ?>">
							<b><?php echo (int) $n; ?></b><span class="pds2-v4-nom"><?php echo esc_html( $oficials[ $n ]['curt'] ); ?></span>
						</div>
					<?php endforeach; ?>
				</div>
				<div class="pds2-v4-crono-anys">
					<?php foreach ( array( 1875, 1931, 1936, 1939, 1975, 1986 ) as $a ) : ?>
						<span class="pds2-v4-any-<?php echo (int) $a; ?>" style="left: <?php echo esc_attr( (string) $pos( $a ) ); ?>%;"><?php echo (int) $a; ?></span>
					<?php endforeach; ?>
				</div>
			</div>
			<p class="um-foot-note">El catalanisme polític comença abans de la Restauració, però a la PAU s'estudia en paral·lel al Tema 1.</p>
		</section>

		<section class="um-sec" id="examen">
			<header><span class="um-num">Examen</span><h2>Com és l'examen</h2></header>
			<p>Quatre exercicis de 2,5 punts cadascun. Cada examen equilibra l'àmbit català i l'espanyol, i temes polítics, socials i econòmics.</p>
			<div class="um-cards">
				<article class="um-card"><h4>Exercici 1. Anàlisi crítica de fonts</h4><span class="um-tag">0,50 + 0,50 + 1,50 punts</span><p>Dues fonts amb un mateix eix temàtic i tres preguntes.</p></article>
				<article class="um-card"><h4>Exercici 2. Situeu-vos en el temps</h4><span class="um-tag">1,50 + 5 termes × 0,20 punts</span><p>Dos enunciats per triar-ne un, amb cinc termes històrics i escrit des del personatge que proposa l'enunciat.</p></article>
				<article class="um-card"><h4>Exercici 3. Glossari</h4><span class="um-tag">1,00 + 1,00 + 0,50 punts</span><p>Un tema transversal a partir d'un descriptor del glossari oficial.</p></article>
				<article class="um-card"><h4>Exercici 4. Poseu a prova els vostres sabers</h4><span class="um-tag">10 preguntes · 2,50 punts</span><p>Deu preguntes tipus test sobre fets, esdeveniments i contextos.</p></article>
			</div>
			<p class="pds2-v4-botons">
				<a class="um-quiz-btn" href="<?php echo esc_url( pds2_preguntes_url() ); ?>">Què pregunta la PAU (2010-2024)</a>
			</p>
		</section>

	</div>
</div>
<?php
get_footer();
