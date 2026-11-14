<?php
/**
 * Banc d'exercicis oficials de la PAU per temes.
 *
 * - Les dades són a l'opció pds2_banc_pau (exàmens, convocatòries i exercicis). Cada exercici té els temes que toca,
 *   perquè un mateix exercici 3 pot travessar diversos temes.
 * - Surt a la pestanya PAU de cada tema (#pau-banc), amb un filtre per exercici, l'enunciat literal, els enllaços a la
 *   teoria i la correcció amb les idees dels criteris oficials. L'exercici 4 es fa i es corregeix amb la puntuació oficial.
 * - Els enunciats i les preguntes de l'exercici 4 són literals. Les idees de la correcció resumeixen els criteris oficials.
 *
 * @package pds-2batx
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Dades del banc, amb els valors per defecte buits. */
function pds2_banc(): array {
	$d = (array) get_option( 'pds2_banc_pau', array() );
	return array(
		'examens'       => (string) ( $d['examens'] ?? '' ),
		'convocatories' => (array) ( $d['convocatories'] ?? array() ),
		'ex1_buit'      => (array) ( $d['ex1_buit'] ?? array() ),
		'items'         => array_values( (array) ( $d['items'] ?? array() ) ),
	);
}

/** Exercicis del banc que toquen un tema, ordenats per exercici i convocatòria. */
function pds2_banc_tema( int $n ): array {
	$d     = pds2_banc();
	$ordre = array_flip( array_keys( $d['convocatories'] ) );
	$items = array_values(
		array_filter(
			$d['items'],
			static fn( $i ) => in_array( $n, array_map( 'intval', (array) ( $i['temes'] ?? array() ) ), true )
		)
	);
	usort(
		$items,
		static function ( $a, $b ) use ( $ordre ) {
			return array( (int) $a['ex'], $ordre[ $a['conv'] ] ?? 99, (string) ( $a['opcio'] ?? '' ) )
				<=> array( (int) $b['ex'], $ordre[ $b['conv'] ] ?? 99, (string) ( $b['opcio'] ?? '' ) );
		}
	);
	return $items;
}

/** Puntuació amb coma decimal. */
function pds2_banc_p( float $p ): string {
	return str_replace( '.', ',', rtrim( rtrim( number_format( $p, 2, '.', '' ), '0' ), '.' ) );
}

/** Segell de la convocatòria d'un exercici («Setembre 2025 · sèrie 3 · opció B»). */
function pds2_banc_segell( array $i, array $convs ): string {
	$c = (array) ( $convs[ $i['conv'] ] ?? array() );
	$s = trim( ( $c['nom'] ?? '' ) . ' · ' . ( $c['serie'] ?? '' ), ' ·' );
	if ( ! empty( $i['opcio'] ) ) {
		$s .= ' · opció ' . $i['opcio'];
	} elseif ( 4 === (int) $i['ex'] && ! empty( $i['n0'] ) ) {
		$s .= ' · qüestions ' . (int) $i['n0'] . '-' . ( (int) $i['n0'] + 4 );
	}
	return $s;
}

/** Bloc «Exercicis de la PAU sobre aquest tema» de la pestanya PAU. Buit si el tema no en té. */
function pds2_banc_tema_html( int $pid, int $n ): string {
	$items = pds2_banc_tema( $n );
	if ( ! $items ) {
		return '';
	}
	$d       = pds2_banc();
	$convs   = $d['convocatories'];
	$t_url   = pds2_taller_url( $pid );
	$noms_ex = array(
		1 => 'Anàlisi crítica de fonts',
		2 => 'Situeu-vos en el temps',
		3 => 'Glossari',
		4 => 'Poseu a prova els vostres sabers',
	);
	$compte  = array( 1 => 0, 2 => 0, 3 => 0, 4 => 0 );
	foreach ( $items as $i ) {
		++$compte[ (int) $i['ex'] ];
	}

	$h  = '<div class="pds2-banc" id="pau-banc">';
	$h .= '<h3>Exercicis de la PAU sobre aquest tema</h3>';
	$h .= '<p>Tots els exercicis d\'aquest tema que han sortit a la PAU des del model d\'examen del 2025. S\'han revisat ' . esc_html( $d['examens'] ) . '. Els enunciats són literals. Escriu la resposta a mà i després corregeix-te amb les idees que demanen els criteris oficials de correcció.</p>';

	// Filtre per exercici.
	$h .= '<div class="pds2-banc-f" role="group" aria-label="Filtra per exercici">';
	$h .= '<button type="button" class="pds2-banc-fb" data-ex="" aria-pressed="true">Tots <span>' . count( $items ) . '</span></button>';
	foreach ( $compte as $e => $c ) {
		$h .= '<button type="button" class="pds2-banc-fb" data-ex="' . (int) $e . '" aria-pressed="false">Exercici ' . (int) $e . ' <span>' . (int) $c . '</span></button>';
	}
	$h .= '</div>';

	$h .= '<div class="pds2-banc-l">';
	$actual = 0;
	foreach ( array( 1, 2, 3, 4 ) as $e ) {
		$h .= '<p class="pds2-banc-g" data-ex="' . $e . '"><span class="pds2-pau-n">' . $e . '</span>' . esc_html( $noms_ex[ $e ] ) . '</p>';
		$llista = array_filter( $items, static fn( $i ) => (int) $i['ex'] === $e );
		if ( ! $llista ) {
			$buit = (string) ( $d['ex1_buit'][ (string) $n ] ?? '' );
			$h   .= '<div class="pds2-banc-buit" data-ex="' . $e . '"><p>' . esc_html( '' !== $buit && 1 === $e ? $buit : 'Encara no n\'ha sortit cap exercici d\'aquest tema.' ) . '</p>';
			if ( 1 === $e ) {
				$h .= '<p><a href="' . esc_url( $t_url . '#e1' ) . '">Practica l\'exercici 1 al Taller amb fonts reals del tema</a></p>';
			}
			$h .= '</div>';
			continue;
		}
		foreach ( $llista as $i ) {
			$h .= pds2_banc_item_html( $i, $convs, $t_url, $n );
		}
	}
	$h .= '</div></div>';
	return $h;
}

/** Un exercici del banc. */
function pds2_banc_item_html( array $i, array $convs, string $t_url, int $n ): string {
	$ex   = (int) $i['ex'];
	$id   = 'banc-' . sanitize_html_class( (string) $i['id'] );
	$c    = (array) ( $convs[ $i['conv'] ] ?? array() );
	$h    = '<details class="pds2-banc-d" id="' . esc_attr( $id ) . '" data-ex="' . $ex . '">';
	$h   .= '<summary><span class="pds2-banc-t">' . esc_html( (string) $i['titol'] ) . '</span>';
	$h   .= '<span class="pds2-banc-seg">' . esc_html( pds2_banc_segell( $i, $convs ) ) . '</span>';
	$alt  = array_values( array_diff( array_map( 'intval', (array) $i['temes'] ), array( $n ) ) );
	if ( $alt ) {
		$h .= '<span class="pds2-banc-alt">També tema ' . esc_html( implode( ' i ', $alt ) ) . '</span>';
	}
	$h .= '</summary><div class="pds2-banc-c">';

	if ( ! empty( $i['rol'] ) && 4 !== $ex ) {
		$h .= '<p class="pds2-banc-rol">Personatge · ' . esc_html( (string) $i['rol'] ) . '</p>';
	}
	if ( 4 === $ex ) {
		$h .= pds2_banc_test_html( $i, $id );
	} elseif ( 1 === $ex ) {
		$h .= pds2_banc_fonts_html( $i, $n );
	} else {
		$h .= '<blockquote class="pds2-banc-e">' . esc_html( (string) $i['enunciat'] ) . '</blockquote>';
		if ( ! empty( $i['termes'] ) ) {
			$h .= '<ul class="pds2-pj-termes" aria-label="Termes de l\'examen">';
			foreach ( (array) $i['termes'] as $t ) {
				$h .= '<li>' . esc_html( (string) $t ) . '</li>';
			}
			$h .= '</ul>';
		}
	}
	$nota = pds2_banc_nota( $i, $n );
	if ( '' !== $nota ) {
		$h .= '<p class="pds2-banc-nota">' . esc_html( $nota ) . '</p>';
	}

	// Teoria per repassar.
	$teo = pds2_banc_teoria_html( $i, $n );
	if ( '' !== $teo ) {
		$h .= '<div class="pds2-banc-teo"><p class="pds2-banc-k">No ho tens clar? Repassa la teoria</p><ul>' . $teo . '</ul></div>';
	}

	if ( 4 !== $ex ) {
		$h .= pds2_banc_rubrica_html( $i, $id );
	}

	// Peu, amb el Taller (si l'exercici hi és) i l'original.
	$h .= '<p class="pds2-banc-peu">';
	if ( ! empty( $i['taller'] ) ) {
		$h .= '<a class="um-quiz-btn" href="' . esc_url( $t_url . (string) $i['taller'] ) . '">Fes-lo pas a pas al Taller</a>';
	}
	if ( ! empty( $c['examen'] ) ) {
		$h .= '<a href="' . esc_url( (string) $c['examen'] ) . '" target="_blank" rel="noopener">Examen original (PDF)</a>';
	}
	if ( ! empty( $c['criteris'] ) ) {
		$h .= '<a href="' . esc_url( (string) $c['criteris'] ) . '" target="_blank" rel="noopener">Criteris de correcció (PDF)</a>';
	}
	$h .= '</p></div></details>';
	return $h;
}

/** Correcció dels exercicis 2 i 3: les idees dels criteris oficials i, a l'exercici 2, els cinc termes. */
function pds2_banc_rubrica_html( array $i, string $id ): string {
	$ex = (int) $i['ex'];
	$h  = '<details class="pds2-banc-r"><summary>Corregeix-te amb els criteris oficials</summary>';
	$h .= '<p class="pds2-banc-s">Marca el que surt a la teva resposta, ben explicat i relacionat amb el context.</p>';
	foreach ( (array) $i['blocs'] as $k => $b ) {
		$tria = (int) ( $b['tria'] ?? 0 );
		$h   .= '<fieldset class="pds2-banc-b" data-punts="' . esc_attr( (string) (float) $b['punts'] ) . '"' . ( $tria ? ' data-tria="' . $tria . '"' : '' ) . '>';
		$h   .= '<legend>' . esc_html( (string) $b['t'] ) . ' <span>' . esc_html( pds2_banc_p( (float) $b['punts'] ) ) . ' ' . ( 1.0 === (float) $b['punts'] ? 'punt' : 'punts' ) . ( $tria ? ' · n\'hi ha prou amb ' . $tria : '' ) . '</span></legend>';
		foreach ( (array) $b['idees'] as $j => $idea ) {
			$h .= '<label><input type="checkbox"> ' . esc_html( (string) $idea ) . '</label>';
		}
		$h .= '</fieldset>';
	}
	if ( 2 === $ex && ! empty( $i['termes'] ) ) {
		$h .= '<fieldset class="pds2-banc-b pds2-banc-tm" data-punts="1" data-cada="0.2"><legend>Els cinc termes <span>0,20 punts cadascun</span></legend>';
		foreach ( (array) $i['termes'] as $t ) {
			$h .= '<label><input type="checkbox"> <b>' . esc_html( (string) $t ) . '</b>, integrat a l\'explicació i subratllat</label>';
		}
		$h .= '</fieldset>';
	}
	$h .= '<p class="pds2-banc-nota-r" aria-live="polite">Nota orientativa <strong>0</strong> de 2,5</p>';
	$h .= '<p class="pds2-banc-s">És orientativa. El corrector també valora l\'ordre, la claredat i la redacció, i pot descomptar fins a 0,25 punts per la correcció lingüística i la presentació.</p>';
	return $h . '</details>';
}

/** Exercici 4: el bloc de cinc qüestions, amb la correcció oficial. */
function pds2_banc_test_html( array $i, string $id ): string {
	$h  = '<p class="pds2-banc-ctx">' . esc_html( (string) $i['context'] ) . '</p>';
	$h .= '<form class="pds2-banc-test" data-ok="' . esc_attr( implode( ',', array_map( static fn( $p ) => (int) $p['ok'], (array) $i['preguntes'] ) ) ) . '"><ol>';
	foreach ( (array) $i['preguntes'] as $k => $p ) {
		$nom = $id . '-q' . $k;
		$h  .= '<li><fieldset><legend><span class="pds2-banc-qn">4.' . ( (int) ( $i['n0'] ?? 1 ) + (int) $k ) . '.</span> ' . esc_html( (string) $p['q'] ) . '</legend>';
		foreach ( (array) $p['ops'] as $j => $o ) {
			$h .= '<label><input type="radio" name="' . esc_attr( $nom ) . '" value="' . (int) $j . '"> <span class="pds2-banc-ll">' . esc_html( 'abcd'[ $j ] ) . ')</span> ' . esc_html( (string) $o ) . '</label>';
		}
		$h .= '</fieldset></li>';
	}
	$h .= '</ol><p class="pds2-banc-tb"><button type="submit" class="um-quiz-btn">Corregeix</button><button type="reset" class="pds2-banc-reset">Torna-hi</button></p>';
	$h .= '<p class="pds2-banc-res" aria-live="polite"></p></form>';
	$h .= '<p class="pds2-banc-s">Com a l\'examen, cada encert suma 0,25 i cada error resta 0,08. Les qüestions en blanc no compten. A l\'examen hi ha deu qüestions, en dos blocs com aquest.</p>';
	return $h;
}

/** Nota d'un exercici, amb una variant per tema si n'hi ha (nota_t). */
function pds2_banc_nota( array $i, int $n ): string {
	$t = (array) ( $i['nota_t'] ?? array() );
	return (string) ( $t[ (string) $n ] ?? ( $i['nota'] ?? '' ) );
}

/** URL d'un tema publicat, o buit si encara no és públic. */
function pds2_banc_tema_url( int $t ): string {
	static $c = array();
	if ( ! isset( $c[ $t ] ) ) {
		$of     = pds2_temes_oficials();
		$slug   = (string) ( $of[ $t ]['slug'] ?? '' );
		$post   = '' !== $slug ? get_page_by_path( $slug, OBJECT, 'tema_pau' ) : null;
		$c[ $t ] = ( $post && 'publish' === $post->post_status ) ? (string) get_permalink( $post ) : '';
	}
	return $c[ $t ];
}

/**
 * Enllaços a la teoria. Cada enllaç és [ancoratge, títol, tema]; sense tema, és del primer tema de l'exercici.
 * Si l'enllaç és d'un altre tema, porta a la pàgina d'aquell tema (només si ja és pública).
 */
function pds2_banc_teoria_html( array $i, int $n ): string {
	$h    = '';
	$base = (int) ( ( (array) ( $i['temes'] ?? array( $n ) ) )[0] ?? $n );
	foreach ( (array) ( $i['teoria'] ?? array() ) as $t ) {
		$tema = (int) ( $t[2] ?? $base );
		if ( $tema === $n ) {
			$h .= '<li><a href="#' . esc_attr( (string) $t[0] ) . '">' . esc_html( (string) $t[1] ) . '</a></li>';
			continue;
		}
		$url = pds2_banc_tema_url( $tema );
		if ( '' === $url ) {
			continue;
		}
		$h .= '<li><a href="' . esc_url( $url . '#' . (string) $t[0] ) . '">' . esc_html( (string) $t[1] ) . '</a> <span class="pds2-banc-alt">Tema ' . $tema . '</span></li>';
	}
	return $h;
}

/** Exercici 1: la consigna, les dues fonts (text o imatge) i les tres preguntes. */
function pds2_banc_fonts_html( array $i, int $n ): string {
	$h = '';
	if ( ! empty( $i['consigna'] ) ) {
		$h .= '<p class="pds2-banc-ctx">' . esc_html( (string) $i['consigna'] ) . '</p>';
	}
	$h .= '<div class="pds2-banc-fonts">';
	foreach ( (array) ( $i['fonts'] ?? array() ) as $f ) {
		$h .= '<figure class="pds2-banc-font"><figcaption class="pds2-banc-ft"><b>' . esc_html( (string) $f['etiqueta'] ) . '.</b> ' . esc_html( (string) $f['titol'] ) . '</figcaption>';
		if ( ! empty( $f['img'] ) ) {
			$h .= '<a class="pds2-banc-img" href="' . esc_url( (string) $f['img'] ) . '" target="_blank" rel="noopener"><img src="' . esc_url( (string) $f['img'] ) . '" alt="' . esc_attr( (string) ( $f['alt'] ?? '' ) ) . '" loading="lazy" decoding="async"></a>';
		} else {
			$h .= '<blockquote class="pds2-banc-e"' . ( ! empty( $f['lang'] ) ? ' lang="' . esc_attr( (string) $f['lang'] ) . '"' : '' ) . '>';
			foreach ( preg_split( '/\n\s*\n/', trim( (string) $f['text'] ) ) as $par ) {
				$h .= '<p>' . nl2br( esc_html( $par ), false ) . '</p>';
			}
			$h .= '</blockquote>';
		}
		$h .= '<p class="pds2-banc-fref">' . esc_html( (string) $f['font'] ) . '</p>';
		if ( ! empty( $f['nota'] ) ) {
			$h .= '<p class="pds2-banc-fref">' . esc_html( (string) $f['nota'] ) . '</p>';
		}
		$h .= '</figure>';
	}
	$h .= '</div><ol class="pds2-banc-qs">';
	foreach ( (array) ( $i['qs'] ?? array() ) as $q ) {
		$h .= '<li><span class="pds2-banc-qn">' . esc_html( (string) $q['n'] ) . '</span> ' . esc_html( (string) $q['q'] ) . ' <span class="pds2-banc-pt">[' . esc_html( pds2_banc_p( (float) $q['p'] ) ) . ' punts]</span></li>';
	}
	return $h . '</ol>';
}
/** Enllaços a la teoria per a l'aplicació PAU ([{t, h}]), amb el mateix criteri que pds2_banc_teoria_html(). */
function pds2_banc_teoria_llista( array $i, int $n ): array {
	$o    = array();
	$base = (int) ( ( (array) ( $i['temes'] ?? array( $n ) ) )[0] ?? $n );
	foreach ( (array) ( $i['teoria'] ?? array() ) as $t ) {
		$tema = (int) ( $t[2] ?? $base );
		if ( $tema === $n ) {
			$o[] = array( 't' => (string) $t[1], 'h' => '#' . (string) $t[0] );
			continue;
		}
		$url = pds2_banc_tema_url( $tema );
		if ( '' !== $url ) {
			$o[] = array( 't' => (string) $t[1] . ' (Tema ' . $tema . ')', 'h' => $url . '#' . (string) $t[0] );
		}
	}
	return $o;
}