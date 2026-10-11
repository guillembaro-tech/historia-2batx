<?php
/**
 * Revisió de les aportacions al panell: comptador de pendents, columnes, filtre per tipus,
 * descàrrega segura de l'arxiu adjunt i acció ràpida «Aprova».
 *
 * @package pds-collabora
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Comptador de pendents al menú. */
add_action(
	'admin_menu',
	static function () {
		global $menu;
		$n = (int) ( wp_count_posts( 'aportacio' )->pending ?? 0 );
		if ( ! $n || ! is_array( $menu ) ) {
			return;
		}
		foreach ( $menu as $i => $item ) {
			if ( isset( $item[2] ) && 'edit.php?post_type=aportacio' === $item[2] ) {
				$menu[ $i ][0] .= ' <span class="awaiting-mod count-' . $n . '"><span class="pending-count">' . $n . '</span></span>'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride
			}
		}
	},
	99
);

/** Columnes de la llista. */
add_filter(
	'manage_aportacio_posts_columns',
	static function ( $cols ) {
		return array(
			'cb'           => $cols['cb'],
			'title'        => 'Aportació',
			'pdsc_tipus'   => 'Tipus',
			'pdsc_unitat'  => 'Unitat',
			'pdsc_nom'     => 'Nom',
			'pdsc_arxiu'   => 'Arxiu',
			'date'         => 'Data',
		);
	}
);
add_action(
	'manage_aportacio_posts_custom_column',
	static function ( $col, $id ) {
		switch ( $col ) {
			case 'pdsc_tipus':
				echo esc_html( pdsc_tipus()[ (string) get_post_meta( $id, 'pdsc_tipus', true ) ][0] ?? '' );
				break;
			case 'pdsc_unitat':
				$u = (int) get_post_meta( $id, 'pdsc_unitat', true );
				echo $u ? '<a href="' . esc_url( get_permalink( $u ) ) . '" target="_blank">' . esc_html( get_the_title( $u ) ) . '</a>' : 'General';
				break;
			case 'pdsc_nom':
				echo esc_html( (string) get_post_meta( $id, 'pdsc_nom', true ) );
				break;
			case 'pdsc_arxiu':
				echo get_post_meta( $id, 'pdsc_arxiu', true ) ? '<a href="' . esc_url( pdsc_url_arxiu( $id ) ) . '">Descarrega</a>' : '—';
				break;
		}
	},
	10,
	2
);

/** Filtre per tipus. */
add_action(
	'restrict_manage_posts',
	static function ( $post_type ) {
		if ( 'aportacio' !== $post_type ) {
			return;
		}
		$sel = isset( $_GET['pdsc_tipus'] ) ? sanitize_key( wp_unslash( $_GET['pdsc_tipus'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		echo '<select name="pdsc_tipus"><option value="">Tots els tipus</option>';
		foreach ( pdsc_tipus() as $k => $t ) {
			echo '<option value="' . esc_attr( $k ) . '"' . selected( $sel, $k, false ) . '>' . esc_html( $t[0] ) . '</option>';
		}
		echo '</select>';
	}
);
add_action(
	'pre_get_posts',
	static function ( $q ) {
		if ( ! is_admin() || ! $q->is_main_query() || 'aportacio' !== $q->get( 'post_type' ) || empty( $_GET['pdsc_tipus'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}
		$q->set( 'meta_key', 'pdsc_tipus' );
		$q->set( 'meta_value', sanitize_key( wp_unslash( $_GET['pdsc_tipus'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	}
);

/** Acció ràpida «Aprova» a les pendents. */
add_filter(
	'post_row_actions',
	static function ( $actions, $post ) {
		if ( 'aportacio' === $post->post_type && 'pending' === $post->post_status && current_user_can( 'publish_post', $post->ID ) ) {
			$url             = wp_nonce_url( admin_url( 'admin-post.php?action=pdsc_aprova&post=' . $post->ID ), 'pdsc_aprova_' . $post->ID );
			$actions['pdsc'] = '<a href="' . esc_url( $url ) . '">Aprova</a>';
		}
		return $actions;
	},
	10,
	2
);
add_action(
	'admin_post_pdsc_aprova',
	static function () {
		$id = absint( $_GET['post'] ?? 0 );
		check_admin_referer( 'pdsc_aprova_' . $id );
		if ( ! current_user_can( 'publish_post', $id ) || 'aportacio' !== get_post_type( $id ) ) {
			wp_die( 'No tens permís per fer això.' );
		}
		wp_publish_post( $id );
		wp_safe_redirect( admin_url( 'edit.php?post_type=aportacio' ) );
		exit;
	}
);

/** Adreça de descàrrega de l'arxiu adjunt (només per a qui pot editar l'aportació). */
function pdsc_url_arxiu( int $id ): string {
	return wp_nonce_url( admin_url( 'admin-post.php?action=pdsc_arxiu&post=' . $id ), 'pdsc_arxiu_' . $id );
}
add_action(
	'admin_post_pdsc_arxiu',
	static function () {
		$id = absint( $_GET['post'] ?? 0 );
		check_admin_referer( 'pdsc_arxiu_' . $id );
		if ( ! current_user_can( 'edit_post', $id ) || 'aportacio' !== get_post_type( $id ) ) {
			wp_die( 'No tens permís per fer això.' );
		}
		$fitxer = basename( (string) get_post_meta( $id, 'pdsc_arxiu', true ) );
		$cami   = pdsc_carpeta() . $fitxer;
		if ( '' === $fitxer || ! is_file( $cami ) ) {
			wp_die( "L'arxiu no existeix." );
		}
		$nom = (string) get_post_meta( $id, 'pdsc_arxiu_nom', true );
		nocache_headers();
		header( 'Content-Type: ' . ( (string) get_post_meta( $id, 'pdsc_arxiu_mime', true ) ?: 'application/octet-stream' ) );
		header( 'Content-Disposition: attachment; filename="' . rawurlencode( $nom ?: $fitxer ) . '"' );
		header( 'Content-Length: ' . filesize( $cami ) );
		header( 'X-Content-Type-Options: nosniff' );
		readfile( $cami ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		exit;
	}
);

/** Caixa lateral amb l'arxiu, la pàgina d'origen i com funciona la revisió. */
add_action(
	'add_meta_boxes_aportacio',
	static function () {
		add_meta_box(
			'pdsc_info',
			'Revisió',
			static function ( $post ) {
				echo '<p><strong>Publicar vol dir aprovar.</strong> Les pel·lícules, els llibres, les webs i les activitats aprovades surten a la unitat com a «Recomanat per la comunitat». Els errors i «Altres» no es mostren mai.</p>';
				if ( get_post_meta( $post->ID, 'pdsc_arxiu', true ) ) {
					echo '<p><a class="button" href="' . esc_url( pdsc_url_arxiu( $post->ID ) ) . '">Descarrega l\'arxiu adjunt</a><br><small>' . esc_html( (string) get_post_meta( $post->ID, 'pdsc_arxiu_nom', true ) ) . '. No es publica mai.</small></p>';
				}
				$u = (int) get_post_meta( $post->ID, 'pdsc_unitat', true );
				if ( $u ) {
					echo '<p><a href="' . esc_url( get_permalink( $u ) ) . '" target="_blank">Obre la unitat</a></p>';
				}
			},
			'aportacio',
			'side',
			'high'
		);
	}
);

/** En esborrar una aportació definitivament, també s'esborra l'arxiu. */
add_action(
	'before_delete_post',
	static function ( $id ) {
		if ( 'aportacio' !== get_post_type( $id ) ) {
			return;
		}
		$fitxer = basename( (string) get_post_meta( $id, 'pdsc_arxiu', true ) );
		if ( '' !== $fitxer && is_file( pdsc_carpeta() . $fitxer ) ) {
			wp_delete_file( pdsc_carpeta() . $fitxer );
		}
	}
);
