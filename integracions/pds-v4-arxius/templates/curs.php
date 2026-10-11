<?php
/**
 * Arxiu d'un curs amb el model de les unitats: unitats per matèria i cronograma sessió a sessió.
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
$tots  = array();
foreach ( pdsa_materies() as $m ) {
	$fills = get_terms( array( 'taxonomy' => 'materia', 'parent' => $m->term_id, 'hide_empty' => false ) );
	if ( ! is_wp_error( $fills ) && $fills ) {
		continue; // Les matèries mare no es llisten, per no repetir les unitats de les filles.
	}
	$u = pdsa_unitats( $term, $m );
	if ( $u ) {
		$grups[] = array( $m, $u );
		foreach ( $u as $x ) {
			$tots[ $x->ID ] = $x;
		}
	}
}
$sessions = 0;
$sa       = 0;
foreach ( $tots as $x ) {
	[ $t, $s ] = pdsa_sessions( $x->ID );
	$sessions += $t;
	$sa       += $s;
}
$materies_txt = implode( ', ', array_map( static fn( $g ) => $g[0]->name, $grups ) );
?>
<div class="um um4 um-c-<?php echo esc_attr( $term->slug ); ?> pdsa-v4 pdsa-v4-curs" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / Per curs / <?php echo esc_html( $term->name ); ?></nav>
			<p class="um-eyebrow">Curs<?php echo $materies_txt ? ' · ' . esc_html( $materies_txt ) : ''; ?></p>
			<h1><?php echo esc_html( $term->name ); ?></h1>
			<?php if ( $term->description ) : ?>
				<p class="um-guide"><?php echo wp_kses_post( $term->description ); ?></p>
			<?php else : ?>
				<p class="um-guide">Les unitats de <?php echo esc_html( $term->name ); ?>, amb el temari, les activitats, l'avaluació i les situacions d'aprenentatge.</p>
			<?php endif; ?>
			<?php if ( $tots ) : ?>
				<ul class="um-facts">
					<li><?php echo esc_html( sprintf( _n( '%d unitat publicada', '%d unitats publicades', count( $tots ), 'pds-v4-arxius' ), count( $tots ) ) ); ?></li>
					<?php if ( $sessions ) : ?>
						<li><?php echo esc_html( pdsa_text_sessions( $sessions, $sa ) ); ?></li>
					<?php endif; ?>
				</ul>
			<?php endif; ?>
		</div>
	</header>

	<div class="um-wrap pdsa-pagina">
		<?php if ( ! $tots ) : ?>
			<section class="um-sec"><p>Encara no hi ha unitats publicades en aquest curs.</p></section>
		<?php endif; ?>

		<?php foreach ( $grups as [ $m, $unitats ] ) : ?>
			<section class="um-sec" id="materia-<?php echo esc_attr( $m->slug ); ?>">
				<header><span class="um-num">Unitats</span><h2><?php echo esc_html( $m->name ); ?></h2><span class="pdsa-veure is-text"><?php echo esc_html( sprintf( _n( '%d unitat', '%d unitats', count( $unitats ), 'pds-v4-arxius' ), count( $unitats ) ) ); ?></span></header>
				<?php pdsa_llista_unitats( $unitats ); ?>
			</section>
		<?php endforeach; ?>

		<?php
		$amb_sessions = array_filter( $tots, static fn( $x ) => (bool) pdsa_sessions( $x->ID )[2] );
		if ( $amb_sessions ) :
			$acumulat = 0;
			?>
			<section class="um-sec" id="cronograma">
				<header><span class="um-num">Cronograma</span><h2>Cronograma sessió a sessió</h2></header>
				<p>Totes les sessions del curs en ordre, amb numeració acumulativa. Obre cada unitat per veure'n les sessions.</p>
				<?php foreach ( $amb_sessions as $x ) :
					[ $t, $s, $sd ] = pdsa_sessions( $x->ID );
					$num            = function_exists( 'get_field' ) ? (string) get_field( 'numero_unitat', $x->ID ) : '';
					?>
					<details class="pdsa-crono">
						<summary><span class="pdsa-n"><?php echo esc_html( $num ?: '·' ); ?></span><span class="pdsa-crono-t"><?php echo esc_html( get_the_title( $x ) ); ?></span><span class="pdsa-m"><?php echo esc_html( pdsa_text_sessions( $t, $s ) ); ?></span></summary>
						<ol>
							<?php foreach ( $sd as $i => $ses ) :
								++$acumulat;
								$es_sa = 'sa' === ( $ses['tipus'] ?? 'classe' );
								?>
								<li class="<?php echo $es_sa ? 'is-sa' : ''; ?>"><span class="pdsa-acum"><?php echo esc_html( str_pad( (string) $acumulat, 2, '0', STR_PAD_LEFT ) ); ?></span><span class="pdsa-snum">S<?php echo esc_html( (string) ( $ses['numero'] ?? ( $i + 1 ) ) ); ?></span><span><?php echo esc_html( (string) ( $ses['titol'] ?? '' ) ); ?></span><span class="pdsa-tipus"><?php echo $es_sa ? "Situació d'aprenentatge" : 'Classe'; ?></span></li>
							<?php endforeach; ?>
						</ol>
					</details>
				<?php endforeach; ?>
				<p class="um-foot-note">
					<?php
					if ( '1r-eso' === $term->slug ) {
						printf( esc_html__( '%1$d sessions de contingut. Cal afegir-hi proves trimestrals (~9 sessions) i el buffer del curs (~12-15 sessions per a sortides, jornades especials i imprevistos), per arribar a les ~88-90 sessions efectives d\'un curs de 1r ESO.', 'pds-v4-arxius' ), (int) $acumulat );
					} else {
						printf( esc_html__( '%d sessions de contingut.', 'pds-v4-arxius' ), (int) $acumulat );
					}
					?>
				</p>
			</section>
		<?php endif; ?>
	</div>
</div>
<?php
get_footer();
