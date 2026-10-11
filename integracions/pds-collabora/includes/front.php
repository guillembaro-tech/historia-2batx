<?php
/**
 * Part pública: botó «Col·labora», finestra del formulari, invitació a cada unitat i
 * llista «Recomanat per la comunitat» amb les aportacions aprovades.
 *
 * El botó i la invitació els col·loca collabora.js, perquè el tema no s'ha de tocar.
 *
 * @package pds-collabora
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Unitat o tema que s'està veient (id, curs i títol), o id 0 si no n'és cap. */
function pdsc_context(): array {
	$ctx = array( 'id' => 0, 'curs' => '', 'titol' => '' );
	if ( is_singular( pdsc_tipus_unitat() ) ) {
		$id    = (int) get_queried_object_id();
		$terms = get_the_terms( $id, 'curs' );
		$ctx   = array(
			'id'    => $id,
			'curs'  => ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->slug : '',
			'titol' => html_entity_decode( get_the_title( $id ), ENT_QUOTES, 'UTF-8' ),
		);
	} elseif ( is_tax( 'curs' ) ) {
		$ctx['curs'] = (string) get_queried_object()->slug;
	}
	return $ctx;
}

/** Llista de cursos i unitats, desada una hora. */
function pdsc_cursos_cache(): array {
	$c = get_transient( 'pdsc_cursos' );
	if ( ! is_array( $c ) ) {
		$c = pdsc_cursos_unitats();
		set_transient( 'pdsc_cursos', $c, HOUR_IN_SECONDS );
	}
	return $c;
}
add_action(
	'save_post',
	static function ( $id, $post ) {
		if ( in_array( $post->post_type, pdsc_tipus_unitat(), true ) ) {
			delete_transient( 'pdsc_cursos' );
		}
	},
	10,
	2
);

add_action(
	'wp_enqueue_scripts',
	static function () {
		wp_enqueue_style( 'pds-collabora', PDSC_URL . 'assets/collabora.css', array(), (string) filemtime( PDSC_DIR . 'assets/collabora.css' ) );
		wp_enqueue_script( 'pds-collabora', PDSC_URL . 'assets/collabora.js', array(), (string) filemtime( PDSC_DIR . 'assets/collabora.js' ), true );
		wp_localize_script(
			'pds-collabora',
			'PDSC',
			array(
				'rest'   => esc_url_raw( rest_url( 'pds-collabora/v1/aportacio' ) ),
				't'      => pdsc_testimoni(),
				'ctx'    => pdsc_context(),
				'cursos' => pdsc_cursos_cache(),
				'max'    => PDSC_MAX_ARXIU,
			)
		);
	},
	30
);

/** Aportacions aprovades d'una unitat. */
function pdsc_aprovades( int $unitat ): array {
	if ( ! $unitat ) {
		return array();
	}
	return get_posts(
		array(
			'post_type'      => 'aportacio',
			'post_status'    => 'publish',
			'posts_per_page' => 30,
			'orderby'        => 'date',
			'order'          => 'DESC',
			'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				array( 'key' => 'pdsc_unitat', 'value' => $unitat, 'type' => 'NUMERIC' ),
				array( 'key' => 'pdsc_tipus', 'value' => pdsc_tipus_publicables(), 'compare' => 'IN' ),
			),
		)
	);
}

add_action(
	'wp_footer',
	static function () {
		$ctx   = pdsc_context();
		$color = $ctx['curs'] ? sprintf( '--pdsc: var(--c-%1$s, #202124); --pdsc-soft: var(--c-%1$s-soft, #F1F3F4);', sanitize_html_class( $ctx['curs'] ) ) : '';

		// Recomanacions aprovades de la unitat (collabora.js les col·loca a «Recursos»).
		$aprovades = pdsc_aprovades( (int) $ctx['id'] );
		if ( $aprovades ) {
			echo '<section class="pdsc-comunitat" id="pdsc-comunitat" hidden style="' . esc_attr( $color ) . '"><h3>Recomanat per la comunitat</h3><ul>';
			foreach ( $aprovades as $a ) {
				$tipus  = (string) get_post_meta( $a->ID, 'pdsc_tipus', true );
				$titol  = (string) get_post_meta( $a->ID, 'pdsc_titol', true );
				$any    = (string) get_post_meta( $a->ID, 'pdsc_any', true );
				$enllac = (string) get_post_meta( $a->ID, 'pdsc_enllac', true );
				$nom    = get_post_meta( $a->ID, 'pdsc_mostrar_nom', true ) ? (string) get_post_meta( $a->ID, 'pdsc_nom', true ) : '';
				echo '<li><span class="pdsc-etiq">' . esc_html( pdsc_tipus()[ $tipus ][0] ?? '' ) . '</span>';
				$t = esc_html( $titol ) . ( '' !== $any ? ' <span class="pdsc-any">(' . esc_html( $any ) . ')</span>' : '' );
				echo $enllac ? '<a class="pdsc-tit" href="' . esc_url( $enllac ) . '" target="_blank" rel="noopener nofollow ugc">' . $t . '</a>' : '<span class="pdsc-tit">' . $t . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput -- escapat a dalt.
				echo '<p>' . esc_html( wp_trim_words( wp_strip_all_tags( $a->post_content ), 45, '…' ) ) . '</p>';
				if ( '' !== $nom ) {
					echo '<p class="pdsc-qui">Recomanat per ' . esc_html( $nom ) . '</p>';
				}
				echo '</li>';
			}
			echo '</ul></section>';
		}

		// Invitació dins de la unitat.
		if ( $ctx['id'] ) {
			echo '<div class="pdsc-unitat" id="pdsc-unitat" hidden style="' . esc_attr( $color ) . '"><div><h3>Col·labora amb aquesta unitat</h3><p>Coneixes una pel·lícula, un llibre o una web que hi encaixi? Has vist algun error? Explica-ho i ho revisarem.</p></div><button type="button" data-pdsc-obre>Fes una aportació</button></div>';
		}

		$xips = '';
		foreach ( pdsc_tipus() as $k => $t ) {
			$xips .= '<label><input type="radio" name="tipus" value="' . esc_attr( $k ) . '"' . ( 'pellicula' === $k ? ' checked' : '' ) . '>' . esc_html( $t[1] ) . '</label>';
		}
		?>
<div class="pdsc-fons" hidden data-pdsc-tanca></div>
<div class="pdsc" id="pdsc" role="dialog" aria-modal="true" aria-labelledby="pdsc-t" hidden style="<?php echo esc_attr( $color ); ?>">
	<button type="button" class="pdsc-tanca" aria-label="Tanca" data-pdsc-tanca>×</button>
	<form class="pdsc-form" novalidate>
		<p class="pdsc-ey">Col·labora</p>
		<h2 id="pdsc-t">Fes la teva aportació</h2>
		<p class="pdsc-sub">Recomana una pel·lícula, un llibre o una web, o avisa'ns d'un error. No cal registrar-se. Revisem cada aportació abans de publicar-la.</p>

		<fieldset>
			<legend><b>1</b>Què vols fer?</legend>
			<div class="pdsc-xips"><?php echo $xips; // phpcs:ignore WordPress.Security.EscapeOutput -- escapat a dalt. ?></div>
		</fieldset>

		<fieldset>
			<legend><b>2</b>On encaixa?</legend>
			<div class="pdsc-graella">
				<label class="pdsc-camp"><span>Curs</span><select name="curs"></select></label>
				<label class="pdsc-camp"><span>Unitat o tema</span><select name="unitat"></select></label>
				<label class="pdsc-camp is-ample" data-pdsc-apartat hidden><span>Apartat (opcional)</span><select name="apartat"></select></label>
			</div>
			<p class="pdsc-nota" data-pdsc-prefill hidden>Ja hi hem posat la unitat on eres. Ho pots canviar.</p>
		</fieldset>

		<fieldset>
			<legend><b>3</b>La teva aportació</legend>
			<div class="pdsc-graella">
				<label class="pdsc-camp" data-pdsc-c="titol"><span data-pdsc-l="titol">Títol</span><input type="text" name="titol" maxlength="200"></label>
				<label class="pdsc-camp" data-pdsc-c="any"><span>Any (opcional)</span><input type="text" name="any" maxlength="20" placeholder="Per exemple, 1995"></label>
				<label class="pdsc-camp is-ample" data-pdsc-c="enllac"><span data-pdsc-l="enllac">Enllaç (opcional)</span><input type="url" name="enllac" maxlength="500" placeholder="https://"></label>
				<label class="pdsc-camp is-ample"><span data-pdsc-l="text">Per què la recomanes? Com la faries servir a classe?</span><textarea name="text" maxlength="4000" required></textarea></label>
			</div>
			<label class="pdsc-arxiu"><input type="file" name="arxiu" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"><span><b>Adjunta un arxiu</b> (opcional) · PDF o imatge, fins a 5 MB</span></label>
		</fieldset>

		<fieldset>
			<legend><b>4</b>Sobre tu (opcional)</legend>
			<div class="pdsc-graella">
				<label class="pdsc-camp"><span>Nom</span><input type="text" name="nom" maxlength="80" autocomplete="name" placeholder="Per agrair-te-la a la unitat"></label>
				<label class="pdsc-camp"><span>Correu</span><input type="email" name="correu" maxlength="120" autocomplete="email" placeholder="Només si cal aclarir-nos res"></label>
			</div>
			<label class="pdsc-check"><input type="checkbox" name="mostrar_nom" value="1" checked> Si es publica, vull que hi surti el meu nom.</label>
			<p class="pdsc-avis">Si tens menys de 14 anys, no escriguis ni el nom ni el correu. Les dades només serveixen per gestionar l'aportació i el correu només el farem servir per respondre't si cal. Si vols que esborrem les teves dades, demana-ho amb una aportació del tipus «Altres».</p>
			<label class="pdsc-check"><input type="checkbox" name="accepto" value="1" required> Accepto que les dades d'aquest formulari es facin servir per gestionar la meva aportació.</label>
		</fieldset>

		<label class="pdsc-parany" aria-hidden="true">Web <input type="text" name="web" tabindex="-1" autocomplete="off"></label>
		<p class="pdsc-msg" role="alert" hidden></p>
		<div class="pdsc-peu"><button type="button" class="alt" data-pdsc-tanca>Cancel·la</button><button type="submit" class="prim">Envia l'aportació</button></div>
	</form>
	<div class="pdsc-gracies" hidden>
		<p class="pdsc-ey">Col·labora</p>
		<h2>Gràcies per la teva aportació!</h2>
		<p class="pdsc-sub">La revisarem aviat. Si és una recomanació i l'aprovem, sortirà a la unitat.</p>
		<div class="pdsc-peu"><button type="button" class="alt" data-pdsc-nova>Fes-ne una altra</button><button type="button" class="prim" data-pdsc-tanca>Tanca</button></div>
	</div>
</div>
		<?php
	},
	5 // Abans dels scripts del peu (prioritat 20).
);
