<?php
/**
 * Portada de 2n de Batxillerat (/2n-batxillerat/): les matèries del curs, Història i Història de l'Art,
 * amb el model de les unitats del lloc (disseny v4). La portada de la matèria Història és historia-v4.php.
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

// Història de l'Art, si el connector hi és i l'usuari la pot veure.
$art = function_exists( 'pdsha_pot_veure' ) && function_exists( 'pdsha_periodes' ) && function_exists( 'pdsha_estils_ordenats' ) && pdsha_pot_veure();
$art_estils = array(); // Una fila per estil previst o fet: període, nom, terme (o null si és en preparació).
$art_obres  = 0;
$art_total  = 0;
if ( $art ) {
	$fets_de = array();
	foreach ( pdsha_estils_ordenats() as $branca ) {
		foreach ( $branca['estils'] as $t ) {
			$fets_de[ $branca['periode']->slug ][ $t->slug ] = $t;
		}
	}
	foreach ( pdsha_periodes() as $slug => $per ) {
		$fets  = $fets_de[ $slug ] ?? array();
		$ordre = array_unique( array_merge( array_keys( $per['estils'] ), array_keys( $fets ) ) );
		foreach ( $ordre as $es ) {
			$art_estils[] = array(
				'per'   => $per,
				'nom'   => isset( $fets[ $es ] ) ? pdsha_titol_estil( $fets[ $es ] ) : $per['estils'][ $es ],
				'terme' => $fets[ $es ] ?? null,
			);
		}
		if ( ! $ordre ) {
			$art_estils[] = array(
				'per'   => $per,
				'nom'   => $per['resum'],
				'terme' => null,
			);
		}
	}
	$art_obres = count( pdsha_obres_per_numero() );
	$art_total = count( pdsha_obres_oficials() );
}
?>
<?php pds2_avis_privat(); ?>
<div class="um um4 um-c-2n-batxillerat pds2-v4 pds2-v4-portada pds2-v4-curs" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / 2n Batxillerat</nav>
			<p class="um-eyebrow">Curs · Història<?php echo $art ? ", Història de l'Art" : ''; ?></p>
			<h1>2n Batxillerat</h1>
			<p class="um-guide">Les matèries de 2n de Batxillerat, preparades per a les PAU.<?php echo $art ? " Història explica els sis temes de l'examen i Història de l'Art, les obres de referència agrupades per estils." : " Història explica els sis temes de l'examen."; ?></p>
			<ul class="um-facts">
				<li><?php echo $art ? '2 matèries' : '1 matèria'; ?></li>
				<li><?php echo count( $posts ); ?> de 6 temes d'Història</li>
				<?php if ( $art ) : ?>
					<li><?php echo (int) $art_obres; ?> de <?php echo (int) $art_total; ?> obres d'Història de l'Art</li>
				<?php endif; ?>
			</ul>
		</div>
	</header>

	<div class="um-wrap pds2-v4-pagina">

		<section class="um-sec" id="materia-historia">
			<header><span class="um-num">Matèria</span><h2>Història</h2><a class="pds2-v4-veure" href="<?php echo esc_url( pds2_historia_url() ); ?>">Obre la matèria <span aria-hidden="true">→</span></a></header>
			<p>Història d'Espanya i Catalunya, de la Restauració a la consolidació democràtica (1875–1986). Cada tema té l'explicació per apartats, les fonts, la pràctica per a l'examen i les preguntes que hi ha fet la PAU.</p>
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
			<p class="pds2-v4-botons"><a class="um-quiz-btn" href="<?php echo esc_url( pds2_historia_url() ); ?>">Obre Història</a></p>
		</section>

		<?php if ( $art ) : ?>
			<section class="um-sec" id="materia-historia-art">
				<header><span class="um-num">Matèria</span><h2>Història de l'Art</h2><a class="pds2-v4-veure" href="<?php echo esc_url( pdsha_portada_url() ); ?>">Obre la matèria <span aria-hidden="true">→</span></a></header>
				<p>Les <?php echo (int) $art_total; ?> obres de referència de la PAU, explicades una a una i agrupades per estils i per llenguatges artístics. Cada estil té el seu tema.</p>
				<ol class="pds2-v4-temes pds2-v4-estils">
					<?php foreach ( $art_estils as $e ) :
						$t     = $e['terme'];
						$obres = $t ? pdsha_obres( array( 'estil' => $t->term_id ) ) : array();
						$dates = $t ? (string) pdsha_f( 'ha_estil_dates', $t, '' ) : '';
						$meta  = $t
							? implode( ' · ', array_filter( array( $e['per']['nom'], $dates, count( $obres ) . ' ' . ( 1 === count( $obres ) ? 'obra' : 'obres' ) ) ) )
							: $e['per']['nom'] . ' · En preparació';
						?>
						<li class="<?php echo $t ? 'is-on' : 'is-off'; ?>">
							<span class="pds2-v4-tn" title="<?php echo esc_attr( $e['per']['nom'] ); ?>"><?php echo esc_html( $e['per']['num'] ); ?></span>
							<div>
								<?php if ( $t ) : ?>
									<a class="pds2-v4-tt" href="<?php echo esc_url( pdsha_estil_url( $t ) ); ?>"><?php echo esc_html( $e['nom'] ); ?></a>
								<?php else : ?>
									<span class="pds2-v4-tt"><?php echo esc_html( $e['nom'] ); ?></span>
								<?php endif; ?>
								<span class="pds2-v4-tm"><?php echo esc_html( $meta ); ?></span>
							</div>
						</li>
					<?php endforeach; ?>
				</ol>
				<p class="pds2-v4-botons"><a class="um-quiz-btn" href="<?php echo esc_url( pdsha_portada_url() ); ?>">Obre Història de l'Art</a></p>
			</section>
		<?php endif; ?>

	</div>
</div>
<?php
get_footer();
