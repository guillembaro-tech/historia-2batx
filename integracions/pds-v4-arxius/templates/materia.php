<?php
/**
 * Arxiu d'una matèria amb el model de les unitats: unitats per curs, amb el color de cada curs.
 *
 * @package pds-v4-arxius
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$term = get_queried_object();
if ( ! ( $term instanceof WP_Term ) ) {
	get_footer();
	return;
}

$grups = array();
$total = 0;
foreach ( pdsa_cursos() as $c ) {
	$u = pdsa_unitats( $c, $term );
	if ( $u ) {
		$grups[] = array( $c, $u );
		$total  += count( $u );
	}
}
?>
<div class="um um4 pdsa-v4 pdsa-v4-materia" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / Matèries / <?php echo esc_html( $term->name ); ?></nav>
			<p class="um-eyebrow">Matèria</p>
			<h1><?php echo esc_html( $term->name ); ?></h1>
			<?php if ( $term->description ) : ?>
				<p class="um-guide"><?php echo wp_kses_post( $term->description ); ?></p>
			<?php endif; ?>
			<?php if ( $total ) : ?>
				<ul class="um-facts">
					<li><?php echo esc_html( sprintf( _n( '%d unitat publicada', '%d unitats publicades', $total, 'pds-v4-arxius' ), $total ) ); ?></li>
					<li><?php echo esc_html( implode( ', ', array_map( static fn( $g ) => $g[0]->name, $grups ) ) ); ?></li>
				</ul>
			<?php endif; ?>
		</div>
	</header>

	<div class="um-wrap pdsa-pagina">
		<?php if ( ! $grups ) : ?>
			<section class="um-sec"><p>Encara no hi ha unitats publicades en aquesta matèria.</p></section>
		<?php endif; ?>
		<?php foreach ( $grups as [ $c, $unitats ] ) :
			$enllac = get_term_link( $c );
			?>
			<section class="um-sec pdsa-curs" id="curs-<?php echo esc_attr( $c->slug ); ?>" style="--c: var(--c-<?php echo esc_attr( $c->slug ); ?>, var(--primary)); --c-soft: var(--c-<?php echo esc_attr( $c->slug ); ?>-soft, var(--primary-soft));">
				<header data-curt="<?php echo esc_attr( pdsa_curt( $c ) ); ?>">
					<span class="um-num"><?php echo esc_html( pdsa_curt( $c ) ); ?></span>
					<h2><?php echo esc_html( $c->name ); ?></h2>
					<?php if ( ! is_wp_error( $enllac ) ) : ?>
						<a class="pdsa-veure" href="<?php echo esc_url( $enllac ); ?>">Veure el curs <span aria-hidden="true">→</span></a>
					<?php endif; ?>
				</header>
				<?php pdsa_llista_unitats( $unitats ); ?>
			</section>
		<?php endforeach; ?>
	</div>
</div>
<?php
get_footer();
