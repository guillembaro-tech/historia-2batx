<?php
/**
 * Pestanya «PAU» d'un tema, organització del 31/10/2026 (vegeu includes/pau-v3.php).
 * Els quatre exercicis de l'examen i, per a cada enunciat, tres passos: llegeix, escriu a mà i corregeix-te.
 * La dibuixa assets/js/pau-app.js a partir de les dades del <script id="pds2-pau-dades">.
 * S'inclou des de tema-v4.php, que ja té $pid, $n i $pau3 (les dades).
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( empty( $pau3 ) ) {
	$pau3 = pds2_pau_dades_tema( (int) $pid, (int) $n );
}
?>
<section class="um-sec pds2-pau3" id="activitats">
	<header><span class="um-num">PAU</span><h2>Practica aquest tema com a l'examen</h2></header>
	<div class="pau-intro">
		<p>Tria un exercici, fes-lo a mà i corregeix-te amb els criteris oficials. Primer hi ha els enunciats que han sortit a la PAU i després els de pràctica.</p>
		<a class="pau-link pau-link-p" href="<?php echo esc_url( pds2_pau_url() ); ?>">Com és l'examen<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
	</div>
	<div id="pds2-pau-app" class="pau-app">
		<noscript><p class="pau-buit">Per fer els exercicis cal tenir el JavaScript activat. Els exàmens i els criteris oficials són a <a href="<?php echo esc_url( pds2_pau_url() . '#practica' ); ?>">Preparar la PAU</a>.</p></noscript>
	</div>
	<script type="application/json" id="pds2-pau-dades"><?php echo pds2_pau_json( $pau3 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON amb JSON_HEX_TAG. ?></script>
</section>
