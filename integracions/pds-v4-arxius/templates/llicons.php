<?php
/**
 * Arxiu de lliçons interactives amb el model de les unitats: targetes per curs, en l'ordre de les unitats.
 *
 * @package pds-v4-arxius
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$total = (int) ( wp_count_posts( 'llico_interactiva' )->publish ?? 0 );
$nivells = array( 'facil' => 'Fàcil', 'mitja' => 'Mitjà', 'avancat' => 'Avançat' );
$blocs = array();
foreach ( pdsa_cursos() as $c ) {
	$ll = get_posts(
		array(
			'post_type'      => 'llico_interactiva',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'tax_query'      => array( array( 'taxonomy' => 'curs', 'field' => 'term_id', 'terms' => array( $c->term_id ) ) ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
		)
	);
	if ( ! $ll ) {
		continue;
	}
	$files = array();
	foreach ( $ll as $p ) {
		$f      = static fn( $k, $id ) => function_exists( 'get_field' ) ? get_field( $k, $id ) : '';
		$unitat = (int) $f( 'unitat_relacionada', $p->ID );
		$img    = get_the_post_thumbnail_url( $p->ID, 'pds-llico-card' ) ?: get_the_post_thumbnail_url( $p->ID, 'medium_large' );
		if ( ! $img && $unitat ) {
			$img = get_the_post_thumbnail_url( $unitat, 'pds-llico-card' ) ?: get_the_post_thumbnail_url( $unitat, 'medium_large' );
		}
		$files[] = array(
			'post'   => $p,
			'num'    => $unitat ? (int) $f( 'numero_unitat', $unitat ) : 999,
			'unitat' => $unitat ? get_the_title( $unitat ) : '',
			'temps'  => (string) $f( 'temps_estimat', $p->ID ),
			'nivell' => (string) $f( 'nivell_dificultat', $p->ID ),
			'desc'   => (string) $f( 'descripcio_breu', $p->ID ),
			'img'    => $img,
		);
	}
	usort( $files, static fn( $a, $b ) => $a['num'] === $b['num'] ? strcmp( $a['post']->post_title, $b['post']->post_title ) : $a['num'] <=> $b['num'] );
	$blocs[] = array( $c, $files );
}
?>
<div class="um um4 pdsa-v4 pdsa-v4-llicons" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / Lliçons interactives</nav>
			<p class="um-eyebrow"><?php echo esc_html( sprintf( _n( '%d lliçó interactiva publicada', '%d lliçons interactives publicades', $total, 'pds-v4-arxius' ), $total ) ); ?></p>
			<h1>Lliçons interactives</h1>
			<p class="um-guide">Vuit estrats per unitat, activitats amb sistema de punts i esquemes visuals per repassar cada tema. Tria el curs i comença a jugar.</p>
			<ul class="um-facts pdsa-salts">
				<?php foreach ( $blocs as [ $c ] ) : ?>
					<li><a href="#curs-<?php echo esc_attr( $c->slug ); ?>"><?php echo esc_html( $c->name ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</div>
	</header>

	<div class="um-wrap pdsa-pagina">
		<?php foreach ( $blocs as [ $c, $files ] ) : ?>
			<section class="um-sec pdsa-curs" id="curs-<?php echo esc_attr( $c->slug ); ?>" style="--c: var(--c-<?php echo esc_attr( $c->slug ); ?>, var(--primary)); --c-soft: var(--c-<?php echo esc_attr( $c->slug ); ?>-soft, var(--primary-soft));">
				<header data-curt="<?php echo esc_attr( pdsa_curt( $c ) ); ?>">
					<span class="um-num"><?php echo esc_html( pdsa_curt( $c ) ); ?></span>
					<h2><?php echo esc_html( $c->name ); ?></h2>
					<span class="pdsa-veure is-text"><?php echo esc_html( sprintf( _n( '%d lliçó', '%d lliçons', count( $files ), 'pds-v4-arxius' ), count( $files ) ) ); ?></span>
				</header>
				<ul class="pdsa-graella">
					<?php foreach ( $files as $r ) : ?>
						<li>
							<a class="pdsa-targeta" href="<?php echo esc_url( get_permalink( $r['post'] ) ); ?>">
								<?php if ( $r['img'] ) : ?>
									<span class="pdsa-imatge" style="background-image: url('<?php echo esc_url( $r['img'] ); ?>');" aria-hidden="true"></span>
								<?php else : ?>
									<span class="pdsa-imatge is-buida" aria-hidden="true"><span><?php echo 999 !== $r['num'] ? (int) $r['num'] : ''; ?></span></span>
								<?php endif; ?>
								<span class="pdsa-cos">
									<span class="pdsa-etiqueta"><?php echo 999 !== $r['num'] ? '<b>U' . (int) $r['num'] . '</b> ' : ''; ?><?php echo esc_html( $r['unitat'] ); ?></span>
									<span class="pdsa-titol"><?php echo esc_html( get_the_title( $r['post'] ) ); ?></span>
									<?php if ( '' !== $r['desc'] ) : ?>
										<span class="pdsa-desc"><?php echo esc_html( wp_trim_words( $r['desc'], 22, '…' ) ); ?></span>
									<?php endif; ?>
									<?php if ( $r['temps'] || $r['nivell'] ) : ?>
										<span class="pdsa-xips">
											<?php if ( $r['temps'] ) : ?><span><?php echo esc_html( $r['temps'] ); ?></span><?php endif; ?>
											<?php if ( $r['nivell'] ) : ?><span><?php echo esc_html( $nivells[ $r['nivell'] ] ?? $r['nivell'] ); ?></span><?php endif; ?>
										</span>
									<?php endif; ?>
								</span>
							</a>
						</li>
					<?php endforeach; ?>
				</ul>
			</section>
		<?php endforeach; ?>
	</div>
</div>
<?php
get_footer();
