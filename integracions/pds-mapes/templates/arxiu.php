<?php
/**
 * Portada de l'arxiu de mapes i pàgines de filtre (/mapes/, /mapes/periode/…, /mapes/curs/…).
 * Els filtres funcionen sense JavaScript (enllaços i formulari GET). El JavaScript només envia el formulari en canviar un desplegable.
 *
 * @package pds-mapes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$taxs   = pdsm_taxonomies();
$taxs   = array( 'pdsm_periode' => $taxs['pdsm_periode'], 'pdsm_territori' => $taxs['pdsm_territori'], 'pdsm_tipus' => $taxs['pdsm_tipus'] );
$curt   = array( 'pdsm_periode' => 'periode', 'pdsm_territori' => 'territori', 'pdsm_tipus' => 'tipus', 'curs' => 'curs' );
$actiu  = array();
$terme  = null;
$q_obj  = get_queried_object();

// Filtres actius. El de l'adreça (/mapes/periode/edat-antiga/) i els del formulari (?territori=…).
foreach ( $curt as $tax => $param ) {
	$v = isset( $_GET[ $param ] ) ? sanitize_title( wp_unslash( $_GET[ $param ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- filtre públic de lectura.
	if ( '' !== $v ) {
		$actiu[ $tax ] = $v;
	}
}
if ( is_tax() && $q_obj instanceof WP_Term ) {
	$terme                       = $q_obj;
	$actiu[ $q_obj->taxonomy ] = $q_obj->slug;
}
$curs_q = sanitize_title( (string) get_query_var( 'pdsm_curs' ) );
if ( '' !== $curs_q ) {
	$actiu['curs'] = $curs_q;
	$terme         = get_term_by( 'slug', $curs_q, 'curs' ) ?: null;
}
$cerca = isset( $_GET['cerca'] ) ? sanitize_text_field( wp_unslash( $_GET['cerca'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

// Tots els mapes que es poden veure, amb els seus termes.
$tots = get_posts(
	array(
		'post_type'      => 'mapa',
		'post_status'    => pdsm_estats(),
		'posts_per_page' => -1,
		'orderby'        => 'title',
		'order'          => 'ASC',
		'perm'           => 'readable',
	)
);
$fitxes = array();
foreach ( $tots as $p ) {
	$f = array( 'id' => $p->ID, 'text' => remove_accents( mb_strtolower( $p->post_title . ' ' . $p->post_excerpt . ' ' . wp_strip_all_tags( (string) pdsm_camp( 'pdsm_descripcio', $p->ID ) ) ) ) );
	foreach ( array_keys( $curt ) as $tax ) {
		$f[ $tax ] = wp_list_pluck( pdsm_termes( $p->ID, $tax ), 'slug' );
	}
	$per          = pdsm_termes( $p->ID, 'pdsm_periode' );
	$f['ordre']   = $per ? (int) get_term_meta( $per[0]->term_id, 'pdsm_ordre', true ) : 99;
	$fitxes[]     = $f;
}
usort( $fitxes, static fn( $a, $b ) => $a['ordre'] <=> $b['ordre'] );

/** Passa els filtres, menys el que s'indiqui. */
$passa = static function ( array $f, ?string $menys = null ) use ( $actiu, $cerca ): bool {
	foreach ( $actiu as $tax => $slug ) {
		if ( $tax !== $menys && ! in_array( $slug, $f[ $tax ], true ) ) {
			return false;
		}
	}
	if ( '' !== $cerca ) {
		foreach ( preg_split( '/\s+/', remove_accents( mb_strtolower( $cerca ) ) ) as $w ) {
			if ( '' !== $w && false === strpos( $f['text'], $w ) ) {
				return false;
			}
		}
	}
	return true;
};
$llista = array_values( array_filter( $fitxes, static fn( $f ) => $passa( $f ) ) );

// Opcions de cada filtre, només amb els termes que tenen algun mapa.
$opcions = array();
foreach ( array_keys( $curt ) as $tax ) {
	$termes = 'curs' === $tax ? ( function_exists( 'pds_get_cursos_ordered' ) ? pds_get_cursos_ordered() : get_terms( array( 'taxonomy' => 'curs' ) ) ) : get_terms( array( 'taxonomy' => $tax, 'hide_empty' => false ) );
	if ( is_wp_error( $termes ) ) {
		continue;
	}
	if ( 'curs' !== $tax ) {
		usort( $termes, 'pdsm_ordena_termes' );
	}
	foreach ( $termes as $t ) {
		$n = count( array_filter( $fitxes, static fn( $f ) => in_array( $t->slug, $f[ $tax ], true ) && $passa( $f, $tax ) ) );
		$tots_t = count( array_filter( $fitxes, static fn( $f ) => in_array( $t->slug, $f[ $tax ], true ) ) );
		if ( $tots_t > 0 ) {
			$opcions[ $tax ][] = array( $t, $n );
		}
	}
}

$base     = get_post_type_archive_link( 'mapa' );
$altres   = static function ( ?string $menys ) use ( $actiu, $cerca, $curt ): array {
	$a = array();
	foreach ( $actiu as $tax => $slug ) {
		if ( $tax !== $menys && 'pdsm_periode' !== $tax ) {
			$a[ $curt[ $tax ] ] = $slug;
		}
	}
	if ( '' !== $cerca ) {
		$a['cerca'] = $cerca;
	}
	return $a;
};
$url_per  = static fn( ?WP_Term $t ) => add_query_arg( $altres( 'pdsm_periode' ), $t ? get_term_link( $t ) : $base );
// El formulari va a la pàgina del període si n'hi ha un de triat.
$per_actiu = isset( $actiu['pdsm_periode'] ) ? get_term_by( 'slug', $actiu['pdsm_periode'], 'pdsm_periode' ) : null;
$accio     = $per_actiu ? get_term_link( $per_actiu ) : $base;

$titol  = $terme ? pdsm_titol_terme( $terme ) : 'Mapes d\'història i geografia';
$guia   = $terme && $terme->description ? $terme->description : 'Mapes de totes les unitats, de la prehistòria al món actual. Cada mapa té la versió completa i la muda, per pintar, i totes dues es descarreguen en PDF per imprimir.';
$n_tots = count( $fitxes );
$hi_ha_filtre = $actiu || '' !== $cerca;
$n_filtres_sec = count( array_diff_key( $actiu, array( 'pdsm_periode' => 1 ) ) );

get_header();
?>
<div class="<?php echo esc_attr( pdsm_hero_classes() ); ?> pdsm-arxiu" data-view="alumne">
	<header class="um-hero">
		<div class="um-wrap">
			<nav class="um-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inici</a> / <?php if ( $terme ) : ?><a href="<?php echo esc_url( $base ); ?>">Mapes</a> / <?php echo esc_html( $terme->name ); ?><?php else : ?>Mapes<?php endif; ?></nav>
			<p class="um-eyebrow"><?php echo esc_html( sprintf( 'Arxiu de mapes · %d %s', $n_tots, 1 === $n_tots ? 'mapa' : 'mapes' ) ); ?></p>
			<h1><?php echo esc_html( $titol ); ?></h1>
			<p class="um-guide"><?php echo esc_html( $guia ); ?></p>
		</div>
	</header>

	<div class="um-wrap pdsm-wrap">
		<?php if ( ! pdsm_publicat() ) : ?>
			<p class="pdsm-avis">Arxiu en privat. Només el veuen els administradors.</p>
		<?php endif; ?>
		<form class="pdsm-filtres" method="get" action="<?php echo esc_url( $accio ); ?>" role="search" aria-label="Filtra els mapes">
			<label class="pdsm-cerca">
				<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
				<span class="screen-reader-text">Cerca un mapa</span>
				<input type="search" name="cerca" value="<?php echo esc_attr( $cerca ); ?>" placeholder="Cerca un mapa (per exemple, «Roma» o «comarques»)">
			</label>
			<?php if ( ! empty( $opcions['pdsm_periode'] ) ) : ?>
				<p class="pdsm-lbl" id="pdsm-lbl-per">Període</p>
				<ul class="pdsm-pills" aria-labelledby="pdsm-lbl-per">
					<li><a class="pdsm-pill<?php echo isset( $actiu['pdsm_periode'] ) ? '' : ' on'; ?>" href="<?php echo esc_url( $url_per( null ) ); ?>"<?php echo isset( $actiu['pdsm_periode'] ) ? '' : ' aria-current="true"'; ?>>Tots</a></li>
					<?php foreach ( $opcions['pdsm_periode'] as [ $t, $n ] ) : ?>
						<?php $on = ( $actiu['pdsm_periode'] ?? '' ) === $t->slug; ?>
						<li><a class="pdsm-pill<?php echo $on ? ' on' : ''; ?><?php echo 0 === $n ? ' off' : ''; ?>" href="<?php echo esc_url( $url_per( $t ) ); ?>"<?php echo $on ? ' aria-current="true"' : ''; ?>><?php echo esc_html( $t->name ); ?><b><?php echo (int) $n; ?></b></a></li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
			<details class="pdsm-mes"<?php echo $n_filtres_sec ? ' open' : ''; ?>>
				<summary>Territori, curs i tipus<?php if ( $n_filtres_sec ) : ?> <b><?php echo (int) $n_filtres_sec; ?></b><?php endif; ?></summary>
				<div class="pdsm-sels">
					<?php
					foreach ( array( 'pdsm_territori' => 'Territori', 'curs' => 'Curs', 'pdsm_tipus' => 'Tipus de mapa' ) as $tax => $lbl ) :
						if ( empty( $opcions[ $tax ] ) ) {
							continue;
						}
						?>
						<label class="pdsm-sel"><span><?php echo esc_html( $lbl ); ?></span>
							<select name="<?php echo esc_attr( $curt[ $tax ] ); ?>" data-pdsm-auto>
								<option value=""><?php echo 'curs' === $tax ? 'Tots els cursos' : ( 'pdsm_tipus' === $tax ? 'Tots els tipus' : 'Tots' ); ?></option>
								<?php foreach ( $opcions[ $tax ] as [ $t, $n ] ) : ?>
									<option value="<?php echo esc_attr( $t->slug ); ?>"<?php selected( $actiu[ $tax ] ?? '', $t->slug ); ?>><?php echo esc_html( $t->name . ' (' . $n . ')' ); ?></option>
								<?php endforeach; ?>
							</select>
						</label>
					<?php endforeach; ?>
				</div>
				<noscript><button type="submit" class="pdsm-btn">Filtra</button></noscript>
			</details>
		</form>

		<div class="pdsm-res" aria-live="polite">
			<span><strong><?php echo esc_html( count( $llista ) . ' ' . ( 1 === count( $llista ) ? 'mapa' : 'mapes' ) ); ?></strong></span>
			<?php if ( $hi_ha_filtre ) : ?><a href="<?php echo esc_url( $base ); ?>">Esborra els filtres</a><?php endif; ?>
		</div>

		<?php if ( $llista ) : ?>
			<ul class="pdsm-grid">
				<?php foreach ( $llista as $f ) { echo pdsm_targeta( (int) $f['id'] ); } // phpcs:ignore WordPress.Security.EscapeOutput -- escapat a pdsm_targeta(). ?>
			</ul>
		<?php else : ?>
			<p class="pdsm-buit">No hi ha cap mapa amb aquests filtres. <a href="<?php echo esc_url( $base ); ?>">Mira'ls tots</a>.</p>
		<?php endif; ?>
	</div>
</div>
<?php
get_footer();
