<?php
/**
 * Portada de 2n de Batxillerat (arxiu dels Temes PAU).
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
$taller1 = isset( $posts[1] ) && 'disponible' === pds2_f( 'estat_taller', $posts[1]->ID, '' ) ? pds2_taller_url( $posts[1]->ID ) : '';
?>
<?php pds2_avis_privat(); ?>
<header class="unit-hero pds2-hero pds2-hero--portada">
	<div class="inner">
		<?php pds2_molla(); ?>
		<p class="num">HISTÒRIA · 2N BATXILLERAT</p>
		<h1>Història d'Espanya i Catalunya</h1>
		<p class="lede">Els sis temes de 2n de Batxillerat que entren a les PAU, de la Restauració a la consolidació democràtica (1875–1986).</p>
	</div>
</header>

<section class="pds2-sec pds2-sec--first">
	<div class="pds2-in">
		<h2 class="pds2-h2">La línia del temps</h2>
		<div class="pds2-crono" role="list" aria-label="Els sis temes en el temps">
			<?php
			$d2 = $anys( $oficials[2]['dates'] );
			$u2 = isset( $posts[2] ) ? get_permalink( $posts[2] ) : '';
			?>
			<div class="pds2-crono-par" role="listitem">
				<?php echo $u2 ? '<a' : '<span'; ?> class="pds2-crono-seg pds2-crono-seg--par" style="--c: <?php echo esc_attr( $oficials[2]['color'] ); ?>; left: 0; width: <?php echo esc_attr( (string) $pos( $d2[1] ) ); ?>%;"<?php echo $u2 ? ' href="' . esc_url( $u2 ) . '"' : ''; ?>>
					<b>2</b><span>Catalanisme polític<span class="pds2-crono-extra"> (1833–1931), en paral·lel a la Restauració</span></span>
				<?php echo $u2 ? '</a>' : '</span>'; ?>
			</div>
			<div class="pds2-crono-main">
				<?php foreach ( array( 1, 3, 4, 5, 6 ) as $n ) :
					$d   = $anys( $oficials[ $n ]['dates'] );
					$url = isset( $posts[ $n ] ) ? get_permalink( $posts[ $n ] ) : '';
					$tag = $url ? 'a' : 'span';
					?>
					<<?php echo $tag; ?> role="listitem" class="pds2-crono-seg<?php echo $url ? '' : ' is-off'; ?><?php echo ( $d[1] - $d[0] ) < 10 ? ' is-estret' : ''; ?>" style="--c: <?php echo esc_attr( $oficials[ $n ]['color'] ); ?>; left: <?php echo esc_attr( (string) $pos( $d[0] ) ); ?>%; width: <?php echo esc_attr( (string) ( $pos( $d[1] ) - $pos( $d[0] ) ) ); ?>%;"<?php echo $url ? ' href="' . esc_url( $url ) . '"' : ''; ?> title="<?php echo esc_attr( 'Tema ' . $n . '. ' . $oficials[ $n ]['nom'] . ' (' . $oficials[ $n ]['dates'] . ')' ); ?>">
						<b><?php echo (int) $n; ?></b><span class="pds2-crono-nom"><?php echo esc_html( $oficials[ $n ]['curt'] ); ?></span>
					</<?php echo $tag; ?>>
				<?php endforeach; ?>
			</div>
			<div class="pds2-crono-anys" aria-hidden="true">
				<?php foreach ( array( 1875, 1931, 1936, 1939, 1975, 1986 ) as $a ) : ?>
					<span class="pds2-any-<?php echo (int) $a; ?>" style="left: <?php echo esc_attr( (string) $pos( $a ) ); ?>%;"><?php echo (int) $a; ?></span>
				<?php endforeach; ?>
			</div>
		</div>
	</div>
</section>

<section class="course-cluster pds2-temes">
	<div class="container">
		<div class="course-head">
			<div class="num">PAU</div>
			<div class="meta">
				<h2>Els sis temes</h2>
				<p class="text-muted">Cada tema té l'explicació per apartats, les fonts, la pràctica per a l'examen i les preguntes que hi ha fet la PAU.</p>
			</div>
		</div>
		<ul class="unit-list">
			<?php foreach ( $oficials as $n => $o ) :
				$p = $posts[ $n ] ?? null;
				?>
				<li>
					<?php if ( $p ) : ?>
						<a class="unit-list-row pds2-tema-row" href="<?php echo esc_url( get_permalink( $p ) ); ?>" style="--c: <?php echo esc_attr( pds2_tema_color( $p->ID ) ); ?>;">
							<div class="num"><?php echo (int) $n; ?></div>
							<div>
								<div class="ttl"><?php echo esc_html( get_the_title( $p ) ); ?></div>
								<div class="meta text-muted"><?php echo esc_html( (string) pds2_f( 'dates', $p->ID, $o['dates'] ) ); ?><?php echo 'disponible' === pds2_f( 'estat_taller', $p->ID, '' ) ? ' · amb Taller PAU' : ''; ?></div>
							</div>
							<span class="arrow" aria-hidden="true"><?php function_exists( 'pds_icon' ) ? pds_icon( 'arrow', 18 ) : print( '→' ); ?></span>
						</a>
					<?php else : ?>
						<div class="unit-list-row pds2-tema-row is-off" style="--c: <?php echo esc_attr( $o['color'] ); ?>;">
							<div class="num"><?php echo (int) $n; ?></div>
							<div>
								<div class="ttl"><?php echo esc_html( $o['nom'] ); ?></div>
								<div class="meta text-muted"><?php echo esc_html( $o['dates'] ); ?> · En preparació</div>
							</div>
						</div>
					<?php endif; ?>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>

<section class="pds2-sec pds2-sec--alt">
	<div class="pds2-in">
		<h2 class="pds2-h2">Com és l'examen</h2>
		<p class="pds2-sub">Quatre exercicis de 2,5 punts cadascun. Cada examen equilibra l'àmbit català i l'espanyol, i temes polítics, socials i econòmics.</p>
		<div class="pds2-examen">
			<div><span class="pds2-ex">Exercici 1</span><h3>Anàlisi crítica de fonts</h3><p>Dues fonts amb un mateix eix temàtic i tres preguntes.</p></div>
			<div><span class="pds2-ex">Exercici 2</span><h3>Situeu-vos en el temps utilitzant termes històrics</h3><p>Dos enunciats per triar-ne un, amb cinc termes històrics i escrit des del personatge que proposa l'enunciat.</p></div>
			<div><span class="pds2-ex">Exercici 3</span><h3>Exposeu un tema a través dels descriptors d'un glossari</h3><p>Un tema transversal a partir del glossari oficial.</p></div>
			<div><span class="pds2-ex">Exercici 4</span><h3>Poseu a prova els vostres sabers</h3><p>Deu preguntes sobre fets, esdeveniments i contextos.</p></div>
		</div>
		<div class="pds2-links">
			<?php if ( $taller1 ) : ?>
				<a class="pds2-btn" href="<?php echo esc_url( $taller1 ); ?>">Taller PAU · Tema 1</a>
			<?php endif; ?>
			<a class="pds2-btn pds2-btn--outline" href="<?php echo esc_url( pds2_preguntes_url() ); ?>">Què pregunta la PAU (2010-2024)</a>
		</div>
	</div>
</section>
<?php
get_footer();
