<?php
/**
 * Pestanya «PAU» de la pàgina d'un tema (nova organització de la PAU).
 * Reuneix el que abans eren «Pràctica PAU», «Què pregunta la PAU» i l'enllaç al Taller: el que en surt a la PAU
 * i els quatre exercicis de l'examen, cadascun amb l'accés directe al Taller.
 * S'inclou des de tema-v4.php, que ja té $pid, $n, $pau, $pau_max, $practica, $taller_on i $tests.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$tl      = $taller_on ? pds2_taller_data( (int) $n ) : null;
$t_url   = pds2_taller_url( $pid );
$t_tests = $tests ? $tests['tests'] : array();

// Enunciats de la pràctica que no són al Taller (els del Taller ja hi surten com a targeta).
$extres = array();
$titol1 = '';
foreach ( $practica as $p ) {
	$html = (string) ( $p['enunciat'] ?? '' );
	$ex   = (string) ( $p['exercici'] ?? '' );
	if ( false !== strpos( $html, 'Taller PAU' ) || false !== strpos( $html, '/taller/' ) ) {
		if ( '1' === $ex && '' === $titol1 && preg_match( '#<strong>(.*?)</strong>#s', $html, $m ) ) {
			$titol1 = rtrim( trim( wp_strip_all_tags( $m[1] ) ), '.' );
		}
		continue;
	}
	$extres[ $ex ][] = $html;
}

/** Enunciats de la pràctica que no són al Taller, en un desplegable dins de la targeta. */
$extra_html = static function ( string $ex ) use ( $extres ): string {
	if ( empty( $extres[ $ex ] ) ) {
		return '';
	}
	$n = count( $extres[ $ex ] );
	$h = '<details class="pds2-pau-mes"><summary>' . ( 1 === $n ? 'Un altre enunciat per practicar' : $n . ' enunciats més per practicar' ) . '</summary>';
	foreach ( $extres[ $ex ] as $e ) {
		$h .= '<div class="pds2-pau-mes-e">' . pds2_enllacos_pendents( wp_kses_post( $e ) ) . '</div>';
	}
	return $h . '</details>';
};

/** Xips de les opcions d'un exercici (a i b), amb la marca d'enunciat oficial. */
$opcions = static function ( array $ops ): string {
	$h = '<ul class="pds2-pau-ops">';
	foreach ( $ops as $o ) {
		$boto = (string) ( $o['boto'] ?? '' );
		$h   .= '<li>' . esc_html( $boto ) . ( ! empty( $o['oficial'] ) ? ' <span class="pds2-pau-of">oficial</span>' : '' ) . '</li>';
	}
	return $h . '</ul>';
};
?>
<section class="um-sec pds2-pau" id="activitats">
	<header><span class="um-num">PAU</span><h2>Prepara l'examen amb aquest tema</h2></header>
	<p>L'examen té quatre exercicis de 2,5 punts. Mira primer què en surt d'aquest tema a la PAU i després practica els exercicis un per un.</p>

	<?php if ( $pau ) : ?>
		<h3 id="pau-surt">Què en surt</h3>
		<p class="pds2-pau-nota">Preguntes de fonts i preguntes llargues de les PAU d'Història del 2010 al 2024, amb el model d'examen anterior al 2025. Indiquen quins continguts són els més importants. Cada barra porta a l'apartat del temari on s'explica.</p>
		<div class="pds2-pau-bars" role="list">
			<?php foreach ( $pau as $r ) :
				$ap  = (int) ( $r['apartat'] ?? 0 );
				$tag = $ap ? 'a' : 'div';
				?>
				<<?php echo $tag; ?> class="pds2-pau-bar" role="listitem"<?php echo $ap ? ' href="#s' . (int) $ap . '"' : ''; ?>>
					<span class="pds2-pau-bar-t"><?php echo esc_html( (string) ( $r['aspecte'] ?? '' ) ); ?></span>
					<i aria-hidden="true"><b style="width: <?php echo esc_attr( (string) round( (int) $r['n'] / $pau_max * 100, 1 ) ); ?>%"></b></i>
					<span class="pds2-pau-bar-n"><strong><?php echo (int) ( $r['n'] ?? 0 ); ?></strong><?php echo $ap ? ' · Ap. ' . (int) $ap : ''; ?></span>
				</<?php echo $tag; ?>>
			<?php endforeach; ?>
		</div>
		<p class="pds2-pau-mesdades"><a href="<?php echo esc_url( pds2_pau_url() . '#preguntes' ); ?>">Totes les dades, aspecte per aspecte</a></p>
	<?php endif; ?>

	<h3 id="pau-exercicis">Practica els exercicis</h3>
	<div class="pds2-pau-grid">

		<article class="pds2-pau-card" id="pau-e1">
			<p class="pds2-pau-k"><span class="pds2-pau-n">1</span>Anàlisi crítica de fonts</p>
			<?php if ( $tl && ! empty( $tl['ex1'] ) ) : ?>
				<h4><?php echo esc_html( $titol1 ? $titol1 : 'Dues fonts i tres preguntes' ); ?></h4>
				<p class="pds2-pau-s"><?php echo esc_html( (string) $tl['ex1']['segell'] ); ?></p>
				<p class="pds2-pau-go"><a class="um-quiz-btn" href="<?php echo esc_url( $t_url . '#e1' ); ?>">Fes-lo pas a pas</a></p>
			<?php else : ?>
				<p class="pds2-pau-s">En preparació.</p>
			<?php endif; ?>
			<?php echo $extra_html( '1' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtrat amb wp_kses_post. ?>
		</article>

		<article class="pds2-pau-card" id="pau-e2">
			<p class="pds2-pau-k"><span class="pds2-pau-n">2</span>Situeu-vos en el temps</p>
			<?php if ( $tl && ! empty( $tl['ex2']['opcions'] ) ) : ?>
				<h4>Tria una opció i escriu des del personatge</h4>
				<?php echo $opcions( $tl['ex2']['opcions'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?>
				<p class="pds2-pau-go"><a class="um-quiz-btn" href="<?php echo esc_url( $t_url . '#e2' ); ?>">Fes-lo pas a pas</a></p>
			<?php else : ?>
				<p class="pds2-pau-s">En preparació.</p>
			<?php endif; ?>
			<?php echo $extra_html( '2' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtrat amb wp_kses_post. ?>
		</article>

		<article class="pds2-pau-card" id="pau-e3">
			<p class="pds2-pau-k"><span class="pds2-pau-n">3</span>Glossari</p>
			<?php if ( $tl && ! empty( $tl['ex3']['opcions'] ) ) : ?>
				<h4>Un tema transversal a partir d'un descriptor</h4>
				<?php echo $opcions( $tl['ex3']['opcions'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapat a la funció. ?>
				<p class="pds2-pau-s">Travessa diverses etapes. Comença per la part d'aquest tema i completa-la quan estudiïs les altres.</p>
				<p class="pds2-pau-go"><a class="um-quiz-btn" href="<?php echo esc_url( $t_url . '#e3' ); ?>">Fes-lo pas a pas</a></p>
			<?php else : ?>
				<p class="pds2-pau-s">En preparació.</p>
			<?php endif; ?>
			<?php echo $extra_html( '3' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtrat amb wp_kses_post. ?>
		</article>

		<article class="pds2-pau-card" id="pau-e4">
			<p class="pds2-pau-k"><span class="pds2-pau-n">4</span>Poseu a prova els vostres sabers</p>
			<?php if ( $t_tests ) : ?>
				<h4>Tests de deu qüestions, com a l'examen</h4>
				<ul class="pds2-pau-tests">
					<?php foreach ( $t_tests as $t ) :
						$ofi = (bool) array_filter( $t['blocs'], static fn( $b ) => ! empty( $b['segell'] ) );
						?>
						<li><a href="<?php echo esc_url( $t_url . '#test-' . (int) $t['numero'] ); ?>">Test <?php echo (int) $t['numero']; ?><?php echo $ofi ? ' <span class="pds2-pau-of">oficial</span>' : ''; ?></a></li>
					<?php endforeach; ?>
				</ul>
				<p class="pds2-pau-s">Cada encert suma 0,25 i cada error resta 0,08, com a la PAU.</p>
				<p class="pds2-pau-go"><a class="um-quiz-btn" href="<?php echo esc_url( $t_url . '#e4' ); ?>">Comença un test</a></p>
			<?php else : ?>
				<p class="pds2-pau-s">Els tests d'aquest tema estan en preparació.</p>
			<?php endif; ?>
			<?php echo $extra_html( '4' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtrat amb wp_kses_post. ?>
		</article>

	</div>
	<p class="pds2-pau-mesdades">Com es puntua cada exercici, la caixa d'eines per redactar i un test amb qüestions de tots els temes, a <a href="<?php echo esc_url( pds2_pau_url() ); ?>">Preparar la PAU</a>.</p>
</section>
