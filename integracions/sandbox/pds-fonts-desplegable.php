<?php
/* Fonts de la unitat dins d'un desplegable, al final del temari (octubre de 2026).
   Va al filtre pds_v4_html de pds_v4_render() (sandbox pds-v4-unitats.php). Només afecta les unitats:
   als temes de 2n, «Fonts» són els documents de l'època i es mostren com fins ara. */
add_filter( 'pds_v4_html', static function ( $html, $id ) {
	if ( get_post_type( $id ) !== 'unitat' || strpos( $html, 'id="fonts"' ) === false || strpos( $html, 'um-refs' ) !== false ) {
		return $html;
	}
	return preg_replace_callback(
		'~<section class="um-sec" id="fonts">\s*<header>.*?</header>(.*?)</section>~s',
		static function ( $m ) {
			return '<section class="um-sec um-refs" id="fonts"><details class="um-refs-d"><summary>'
				. '<span class="um-refs-t">Fonts</span>'
				. '<span class="um-refs-n">Obres consultades i crèdits de les imatges i els mapes</span>'
				. '</summary><div class="um-refs-cos">' . $m[1] . '</div></details></section>';
		},
		$html,
		1
	);
}, 10, 2 );
