<?php
/**
 * Portada del lloc amb el model de les unitats: totes les unitats, per curs.
 *
 * @package pds-v4-arxius
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$cursos = pdsa_cursos();
$total  = (int) ( wp_count_posts( 'unitat' )->publish ?? 0 );
$temes  = pdsa_temes_2batx();
$blocs  = array();
foreach ( $cursos as $c ) {
	$u = pdsa_unitats( $c );
	if ( $u || ( '2n-batxillerat' === $c->slug && $temes ) ) {
		$blocs[] = array( $c, $u );
	}
}
?>
<div class="um um4 pdsa-v4 pdsa-v4-portada" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<p class="um-eyebrow">Curs 2025–26 · <?php echo esc_html( sprintf( _n( '%d unitat publicada', '%d unitats publicades', $total, 'pds-v4-arxius' ), $total ) ); ?></p>
			<h1>Totes les unitats, ordenades per curs</h1>
			<p class="um-guide">Geografia, història i història de l'art per a tota la secundària i el batxillerat. Tria el curs i comença a navegar.</p>
			<ul class="um-facts pdsa-salts">
				<?php foreach ( $blocs as [ $c ] ) : ?>
					<li><a href="#curs-<?php echo esc_attr( $c->slug ); ?>"><?php echo esc_html( $c->name ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</div>
	</header>

	<div class="um-wrap pdsa-pagina">
		<?php foreach ( $blocs as [ $c, $unitats ] ) :
			$es_2batx = '2n-batxillerat' === $c->slug && ! $unitats;
			$enllac   = $es_2batx && function_exists( 'pds2_portada_url' ) ? pds2_portada_url() : get_term_link( $c );
			$n        = $es_2batx ? count( $temes ) : count( $unitats );
			?>
			<section class="um-sec pdsa-curs" id="curs-<?php echo esc_attr( $c->slug ); ?>" style="--c: var(--c-<?php echo esc_attr( $c->slug ); ?>, var(--primary)); --c-soft: var(--c-<?php echo esc_attr( $c->slug ); ?>-soft, var(--primary-soft));">
				<header data-curt="<?php echo esc_attr( pdsa_curt( $c ) ); ?>">
					<span class="um-num"><?php echo esc_html( pdsa_curt( $c ) ); ?></span>
					<h2><?php echo esc_html( $c->name ); ?></h2>
					<a class="pdsa-veure" href="<?php echo esc_url( is_wp_error( $enllac ) ? home_url( '/' ) : $enllac ); ?>"><?php echo esc_html( $es_2batx ? sprintf( _n( '%d tema', '%d temes', $n, 'pds-v4-arxius' ), $n ) : sprintf( _n( '%d unitat', '%d unitats', $n, 'pds-v4-arxius' ), $n ) ); ?> <span aria-hidden="true">→</span></a>
				</header>
				<ul class="pdsa-graella">
					<?php if ( $es_2batx ) : ?>
						<?php foreach ( $temes as $t ) :
							$nt  = function_exists( 'pds2_tema_numero' ) ? pds2_tema_numero( $t->ID ) : 0;
							$nom = function_exists( 'pds2_temes_oficials' ) ? ( pds2_temes_oficials()[ $nt ]['nom'] ?? get_the_title( $t ) ) : get_the_title( $t );
							?>
							<li>
								<a class="pdsa-targeta" href="<?php echo esc_url( get_permalink( $t ) ); ?>">
									<span class="pdsa-imatge is-buida"><span><?php echo (int) $nt; ?></span></span>
									<span class="pdsa-cos">
										<span class="pdsa-etiqueta"><b>Tema <?php echo (int) $nt; ?></b> Història</span>
										<span class="pdsa-titol"><?php echo esc_html( $nom ); ?></span>
										<?php if ( has_excerpt( $t ) ) : ?>
											<span class="pdsa-desc"><?php echo esc_html( wp_trim_words( wp_strip_all_tags( get_the_excerpt( $t ) ), 22, '…' ) ); ?></span>
										<?php endif; ?>
									</span>
								</a>
							</li>
						<?php endforeach; ?>
					<?php else : ?>
						<?php foreach ( $unitats as $u ) :
							$num   = function_exists( 'get_field' ) ? (string) get_field( 'numero_unitat', $u->ID ) : '';
							$mat   = get_the_terms( $u->ID, 'materia' );
							$mat_n = ( $mat && ! is_wp_error( $mat ) ) ? $mat[0]->name : '';
							$img   = get_the_post_thumbnail_url( $u->ID, 'medium_large' );
							?>
							<li>
								<a class="pdsa-targeta" href="<?php echo esc_url( get_permalink( $u ) ); ?>">
									<?php if ( $img ) : ?>
										<span class="pdsa-imatge" style="background-image: url('<?php echo esc_url( $img ); ?>');" aria-hidden="true"></span>
									<?php else : ?>
										<span class="pdsa-imatge is-buida" aria-hidden="true"><span><?php echo esc_html( $num ); ?></span></span>
									<?php endif; ?>
									<span class="pdsa-cos">
										<span class="pdsa-etiqueta"><?php echo '' !== $num ? '<b>U' . esc_html( $num ) . '</b> ' : ''; ?><?php echo esc_html( $mat_n ); ?></span>
										<span class="pdsa-titol"><?php echo esc_html( get_the_title( $u ) ); ?></span>
										<?php if ( has_excerpt( $u ) ) : ?>
											<span class="pdsa-desc"><?php echo esc_html( wp_trim_words( wp_strip_all_tags( get_the_excerpt( $u ) ), 22, '…' ) ); ?></span>
										<?php endif; ?>
									</span>
								</a>
							</li>
						<?php endforeach; ?>
					<?php endif; ?>
				</ul>
			</section>
		<?php endforeach; ?>
	</div>
</div>
<?php
get_footer();
