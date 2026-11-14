<?php
/**
 * Plugin Name: PDS · Puja presentacions
 * Description: Dos formularis (un d'admin ràpid i un públic restringit a esborrany) per crear posts del CPT `presentacio`. Inclou validació estricta de l'URL de Slides, honeypot, nonce, rate-limit per IP i notificació per email a l'admin.
 * Version: 1.0.0
 * Author: Professor de socials
 * License: GPL-2.0-or-later
 *
 * @package pds-presentacions-submit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PDS_PSUB_VER', '1.0.0' );

/* =====================================================================
   Helpers: validation + sanitization
   ===================================================================== */

/**
 * Validate a Google Slides URL: must point to docs.google.com/presentation/d/{id}.
 * Returns the canonical edit URL if valid, or empty string.
 */
function pds_psub_validate_slides_url( string $raw ): string {
	$raw = trim( $raw );
	if ( '' === $raw ) { return ''; }
	if ( ! filter_var( $raw, FILTER_VALIDATE_URL ) ) { return ''; }
	$host = wp_parse_url( $raw, PHP_URL_HOST );
	if ( 'docs.google.com' !== strtolower( (string) $host ) ) { return ''; }
	if ( ! preg_match( '#/presentation/d/([a-zA-Z0-9_\-]{16,})#', $raw, $m ) ) { return ''; }
	return 'https://docs.google.com/presentation/d/' . $m[1] . '/edit';
}

/**
 * Per-IP rate limit (default: 5 submissions per hour).
 */
function pds_psub_is_rate_limited(): bool {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? preg_replace( '/[^0-9a-fA-F\.:]/', '', (string) $_SERVER['REMOTE_ADDR'] ) : 'unknown';
	$key   = 'pds_psub_rl_' . md5( $ip );
	$count = (int) get_transient( $key );
	if ( $count >= 5 ) { return true; }
	set_transient( $key, $count + 1, HOUR_IN_SECONDS );
	return false;
}

/**
 * Core insert: takes already-sanitized inputs and creates the post.
 * Returns the new post ID or WP_Error.
 *
 * @param array  $data    Sanitized fields.
 * @param string $status  'publish' (admin) or 'draft' (public form).
 * @return int|WP_Error
 */
function pds_psub_insert_presentacio( array $data, string $status ) {
	$post_id = wp_insert_post( array(
		'post_type'    => 'presentacio',
		'post_status'  => $status,
		'post_title'   => $data['title'],
		'post_excerpt' => $data['description'],
		'post_content' => '',
	), true );

	if ( is_wp_error( $post_id ) ) { return $post_id; }

	update_field( 'slides_url', $data['slides_url'], $post_id );
	if ( ! empty( $data['durada'] ) )    { update_field( 'durada_aprox', $data['durada'], $post_id ); }
	if ( ! empty( $data['unitat_id'] ) ) { update_field( 'unitat_associada', (int) $data['unitat_id'], $post_id ); }

	if ( ! empty( $data['curs'] ) )    { wp_set_object_terms( $post_id, $data['curs'], 'curs' ); }
	if ( ! empty( $data['materia'] ) ) { wp_set_object_terms( $post_id, $data['materia'], 'materia' ); }

	return $post_id;
}

/**
 * Sanitize a submitted form payload. Returns [$data, $errors].
 */
function pds_psub_sanitize_payload( array $raw ): array {
	$errors = array();

	$title       = isset( $raw['pds_title'] ) ? sanitize_text_field( wp_unslash( $raw['pds_title'] ) ) : '';
	$slides_in   = isset( $raw['pds_slides_url'] ) ? wp_unslash( $raw['pds_slides_url'] ) : '';
	$description = isset( $raw['pds_description'] ) ? sanitize_textarea_field( wp_unslash( $raw['pds_description'] ) ) : '';
	$durada      = isset( $raw['pds_durada'] ) ? sanitize_text_field( wp_unslash( $raw['pds_durada'] ) ) : '';
	$unit_id     = isset( $raw['pds_unitat_id'] ) ? absint( $raw['pds_unitat_id'] ) : 0;
	$curs_raw    = isset( $raw['pds_curs'] )    ? (array) $raw['pds_curs']    : array();
	$materia_raw = isset( $raw['pds_materia'] ) ? (array) $raw['pds_materia'] : array();

	$title       = mb_substr( $title, 0, 180 );
	$description = mb_substr( $description, 0, 600 );
	$durada      = mb_substr( $durada, 0, 30 );

	if ( '' === $title )         { $errors[] = 'El títol és obligatori.'; }
	$slides_clean = pds_psub_validate_slides_url( (string) $slides_in );
	if ( '' === $slides_clean )  { $errors[] = "L'URL ha de ser una presentació de Google Slides vàlida (docs.google.com/presentation/d/...)."; }

	if ( $unit_id ) {
		$pp = get_post( $unit_id );
		if ( ! $pp || $pp->post_type !== 'unitat' || $pp->post_status !== 'publish' ) {
			$unit_id = 0;
		}
	}

	$valid_curs = array();
	foreach ( $curs_raw as $slug ) {
		$slug = sanitize_title( $slug );
		if ( $slug && get_term_by( 'slug', $slug, 'curs' ) ) { $valid_curs[] = $slug; }
	}
	$valid_materia = array();
	foreach ( $materia_raw as $slug ) {
		$slug = sanitize_title( $slug );
		if ( $slug && get_term_by( 'slug', $slug, 'materia' ) ) { $valid_materia[] = $slug; }
	}

	return array(
		array(
			'title'       => $title,
			'description' => $description,
			'slides_url'  => $slides_clean,
			'durada'      => $durada,
			'unitat_id'   => $unit_id,
			'curs'        => $valid_curs,
			'materia'     => $valid_materia,
		),
		$errors,
	);
}

/* =====================================================================
   Form fields (shared markup for shortcode + admin)
   ===================================================================== */

function pds_psub_render_field_markup( array $values = array() ): string {
	$cursos   = get_terms( array( 'taxonomy' => 'curs',    'hide_empty' => false ) );
	$materies = get_terms( array( 'taxonomy' => 'materia', 'hide_empty' => false ) );

	$units = get_posts( array(
		'post_type' => 'unitat', 'posts_per_page' => -1, 'orderby' => 'title', 'order' => 'ASC',
		'fields' => 'ids', 'post_status' => 'publish',
	) );

	$v_title  = esc_attr( $values['title']  ?? '' );
	$v_slides = esc_attr( $values['slides_url'] ?? '' );
	$v_durada = esc_attr( $values['durada'] ?? '' );
	$v_desc   = esc_textarea( $values['description'] ?? '' );
	$v_unit   = (int) ( $values['unitat_id'] ?? 0 );
	$v_curs   = (array) ( $values['curs'] ?? array() );
	$v_mat    = (array) ( $values['materia'] ?? array() );

	ob_start();
	?>
	<div class="psub-grid">

		<label class="psub-field psub-field--full">
			<span class="psub-label">Títol de la presentació <em>*</em></span>
			<input type="text" name="pds_title" required maxlength="180" value="<?php echo $v_title; ?>" placeholder="Per ex. La Unió Europea: introducció">
		</label>

		<label class="psub-field psub-field--full">
			<span class="psub-label">URL de Google Slides <em>*</em></span>
			<input type="url" name="pds_slides_url" required pattern="https://docs\.google\.com/presentation/d/.*" value="<?php echo $v_slides; ?>" placeholder="https://docs.google.com/presentation/d/...">
			<span class="psub-hint">Pega l'URL de la presentació (la d'edició o la de compartir). Només s'accepten URLs de Google Slides.</span>
		</label>

		<label class="psub-field psub-field--full">
			<span class="psub-label">Descripció breu</span>
			<textarea name="pds_description" rows="3" maxlength="600" placeholder="Una o dues frases que diguin de què va."><?php echo $v_desc; ?></textarea>
		</label>

		<label class="psub-field">
			<span class="psub-label">Durada aproximada</span>
			<input type="text" name="pds_durada" maxlength="30" value="<?php echo $v_durada; ?>" placeholder="Per ex. 25 min">
		</label>

		<label class="psub-field">
			<span class="psub-label">Unitat associada (opcional)</span>
			<select name="pds_unitat_id">
				<option value="0">— cap —</option>
				<?php foreach ( $units as $uid ) : ?>
					<option value="<?php echo (int) $uid; ?>" <?php selected( $uid, $v_unit ); ?>><?php echo esc_html( get_the_title( $uid ) ); ?></option>
				<?php endforeach; ?>
			</select>
		</label>

		<?php if ( ! is_wp_error( $cursos ) && ! empty( $cursos ) ) : ?>
			<fieldset class="psub-field psub-field--full psub-checks">
				<legend class="psub-label">Curs</legend>
				<div class="psub-checks-grid">
					<?php foreach ( $cursos as $c ) : ?>
						<label><input type="checkbox" name="pds_curs[]" value="<?php echo esc_attr( $c->slug ); ?>" <?php checked( in_array( $c->slug, $v_curs, true ) ); ?>> <?php echo esc_html( $c->name ); ?></label>
					<?php endforeach; ?>
				</div>
			</fieldset>
		<?php endif; ?>

		<?php if ( ! is_wp_error( $materies ) && ! empty( $materies ) ) : ?>
			<fieldset class="psub-field psub-field--full psub-checks">
				<legend class="psub-label">Matèria</legend>
				<div class="psub-checks-grid">
					<?php foreach ( $materies as $m ) : ?>
						<label><input type="checkbox" name="pds_materia[]" value="<?php echo esc_attr( $m->slug ); ?>" <?php checked( in_array( $m->slug, $v_mat, true ) ); ?>> <?php echo esc_html( $m->name ); ?></label>
					<?php endforeach; ?>
				</div>
			</fieldset>
		<?php endif; ?>

		<?php /* Honeypot: real users never fill this, bots usually do. */ ?>
		<div class="psub-hp" aria-hidden="true" style="position:absolute; left:-9999px; opacity:0; pointer-events:none;">
			<label>El teu lloc web<input type="text" name="pds_website" tabindex="-1" autocomplete="off"></label>
		</div>
	</div>
	<?php
	return (string) ob_get_clean();
}

/* =====================================================================
   PUBLIC FORM — shortcode [pds_presentacio_form]
   Saves as DRAFT and emails the admin.
   ===================================================================== */

function pds_psub_shortcode_form(): string {
	// Status messages from a previous submission via ?pds_psub_done=
	$msg = '';
	if ( isset( $_GET['pds_psub_done'] ) ) {
		if ( '1' === $_GET['pds_psub_done'] ) {
			$msg = '<div class="psub-msg psub-msg--ok">Gràcies! La teva proposta s\'ha registrat com a esborrany i la revisarem aviat.</div>';
		} elseif ( 'rate' === $_GET['pds_psub_done'] ) {
			$msg = '<div class="psub-msg psub-msg--ko">Has fet massa enviaments en poca estona. Torna-ho a provar més tard.</div>';
		} else {
			$err = isset( $_GET['pds_psub_err'] ) ? sanitize_text_field( wp_unslash( $_GET['pds_psub_err'] ) ) : '';
			$msg = '<div class="psub-msg psub-msg--ko">No s\'ha pogut enviar: ' . esc_html( $err ?: 'error desconegut' ) . '</div>';
		}
	}

	$action_url = esc_url( admin_url( 'admin-post.php' ) );
	$nonce      = wp_nonce_field( 'pds_psub_public', 'pds_psub_nonce', true, false );

	$fields = pds_psub_render_field_markup();

	ob_start();
	?>
	<div class="psub-wrap">
		<?php echo $msg; // already escaped above ?>

		<form class="psub-form" action="<?php echo $action_url; ?>" method="post" autocomplete="off">
			<input type="hidden" name="action" value="pds_psub_public">
			<?php echo $nonce; ?>
			<?php echo $fields; ?>

			<div class="psub-actions">
				<button type="submit" class="psub-btn psub-btn--primary">Envia la proposta</button>
				<p class="psub-disclaimer">
					Les propostes públiques queden com a <strong>esborrany</strong> fins que l'editor les revisi i les publiqui.
				</p>
			</div>
		</form>
	</div>

	<style>
		.psub-wrap { max-width: 720px; margin: 0 auto; padding: 0; }
		.psub-msg { padding: 12px 16px; border-radius: 10px; margin-bottom: 18px; font-size: .95rem; line-height: 1.4; }
		.psub-msg--ok { background:#E6F6EE; color:#127a4f; border:1px solid #C2EAD3; }
		.psub-msg--ko { background:#FDECEC; color:#C93B40; border:1px solid #F4C4C4; }

		.psub-form { display:flex; flex-direction:column; gap:18px; }
		.psub-grid { display:grid; grid-template-columns: 1fr 1fr; gap:14px 18px; }
		.psub-field--full { grid-column: 1 / -1; }
		.psub-field { display:flex; flex-direction:column; gap:5px; }
		.psub-label { font-size:.78rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#4A5075; }
		.psub-label em { color:#C93B40; font-style:normal; }
		.psub-hint { font-size:.78rem; color:#777; line-height:1.4; }
		.psub-field input[type=text], .psub-field input[type=url], .psub-field select, .psub-field textarea {
			width:100%; padding:9px 12px; border:1px solid #DCD5C4; border-radius:8px;
			font:inherit; line-height:1.4; background:#fff;
		}
		.psub-field input:focus, .psub-field select:focus, .psub-field textarea:focus { outline:2px solid #1F5FBF; outline-offset:1px; border-color:#1F5FBF; }
		.psub-checks legend { font-size:.78rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#4A5075; padding:0; margin-bottom:8px; }
		.psub-checks-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:6px 12px; font-size:.9rem; }
		.psub-checks-grid label { display:flex; align-items:center; gap:6px; cursor:pointer; }
		.psub-actions { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; flex-wrap:wrap; margin-top:6px; }
		.psub-btn { padding:10px 22px; border:0; border-radius:9px; cursor:pointer; font-weight:600; font-size:1rem; }
		.psub-btn--primary { background:#1F5FBF; color:#fff; }
		.psub-btn--primary:hover { background:#174A96; }
		.psub-disclaimer { font-size:.82rem; color:#777; max-width: 40ch; margin: 0; }
		@media (max-width: 640px) { .psub-grid { grid-template-columns: 1fr; } }
	</style>
	<?php
	return (string) ob_get_clean();
}
add_shortcode( 'pds_presentacio_form', 'pds_psub_shortcode_form' );

/**
 * Handler for the public form. Always saves as DRAFT.
 */
function pds_psub_handle_public(): void {
	$redirect_back = wp_get_referer() ?: home_url( '/' );

	if ( ! isset( $_POST['pds_psub_nonce'] ) || ! wp_verify_nonce( $_POST['pds_psub_nonce'], 'pds_psub_public' ) ) {
		wp_safe_redirect( add_query_arg( 'pds_psub_done', '0', $redirect_back ) ); exit;
	}
	// Honeypot
	if ( ! empty( $_POST['pds_website'] ) ) {
		wp_safe_redirect( add_query_arg( 'pds_psub_done', '1', $redirect_back ) ); exit; // silent ok
	}
	if ( pds_psub_is_rate_limited() ) {
		wp_safe_redirect( add_query_arg( 'pds_psub_done', 'rate', $redirect_back ) ); exit;
	}

	list( $data, $errors ) = pds_psub_sanitize_payload( $_POST );
	if ( ! empty( $errors ) ) {
		wp_safe_redirect( add_query_arg( array( 'pds_psub_done' => '0', 'pds_psub_err' => rawurlencode( implode( ' ', $errors ) ) ), $redirect_back ) );
		exit;
	}

	$post_id = pds_psub_insert_presentacio( $data, 'draft' );
	if ( is_wp_error( $post_id ) ) {
		wp_safe_redirect( add_query_arg( array( 'pds_psub_done' => '0', 'pds_psub_err' => rawurlencode( $post_id->get_error_message() ) ), $redirect_back ) );
		exit;
	}

	// Notify the admin so the draft doesn't sit unseen.
	$admin = get_option( 'admin_email' );
	if ( $admin ) {
		$subject = '[professordesocials] Nova proposta de presentació: ' . $data['title'];
		$edit    = admin_url( 'post.php?post=' . $post_id . '&action=edit' );
		$body    = "Algú ha enviat una nova proposta de presentació pel lloc.\n\n"
			. 'Títol: ' . $data['title'] . "\n"
			. 'Slides: ' . $data['slides_url'] . "\n"
			. 'Descripció: ' . $data['description'] . "\n\n"
			. 'Revisa-la i publica-la (o esborra-la) aquí:' . "\n" . $edit;
		wp_mail( $admin, $subject, $body );
	}

	wp_safe_redirect( add_query_arg( 'pds_psub_done', '1', $redirect_back ) ); exit;
}
add_action( 'admin_post_nopriv_pds_psub_public', 'pds_psub_handle_public' );
add_action( 'admin_post_pds_psub_public', 'pds_psub_handle_public' );

/* =====================================================================
   ADMIN FORM — submenu under Presentacions
   Saves as PUBLISH (admin can do whatever they want).
   ===================================================================== */

function pds_psub_admin_menu(): void {
	add_submenu_page(
		'edit.php?post_type=presentacio',
		'Puja una presentació ràpidament',
		'Pujada ràpida',
		'edit_posts',
		'pds-psub-quick',
		'pds_psub_admin_page'
	);
}
add_action( 'admin_menu', 'pds_psub_admin_menu' );

function pds_psub_admin_page(): void {
	if ( ! current_user_can( 'edit_posts' ) ) { return; }

	$msg = '';
	$values = array();
	if ( isset( $_POST['pds_psub_admin_nonce'] ) && wp_verify_nonce( $_POST['pds_psub_admin_nonce'], 'pds_psub_admin' ) ) {
		list( $data, $errors ) = pds_psub_sanitize_payload( $_POST );
		if ( ! empty( $errors ) ) {
			$values = $data;
			$msg = '<div class="notice notice-error"><p>' . esc_html( implode( ' ', $errors ) ) . '</p></div>';
		} else {
			$post_id = pds_psub_insert_presentacio( $data, 'publish' );
			if ( is_wp_error( $post_id ) ) {
				$values = $data;
				$msg = '<div class="notice notice-error"><p>' . esc_html( $post_id->get_error_message() ) . '</p></div>';
			} else {
				$link = get_permalink( $post_id );
				$edit = admin_url( 'post.php?post=' . $post_id . '&action=edit' );
				$msg  = '<div class="notice notice-success"><p>Presentació creada: <a href="' . esc_url( $link ) . '" target="_blank">veure-la</a> · <a href="' . esc_url( $edit ) . '">edita-la</a></p></div>';
			}
		}
	}

	echo '<div class="wrap"><h1>Puja una presentació ràpidament</h1>';
	echo $msg;
	echo '<form method="post" autocomplete="off">';
	wp_nonce_field( 'pds_psub_admin', 'pds_psub_admin_nonce' );
	echo pds_psub_render_field_markup( $values );
	echo '<p><button type="submit" class="button button-primary button-large">Publica la presentació</button></p>';
	echo '</form>';

	echo '<style>
		.wrap .psub-grid { display:grid; grid-template-columns: 1fr 1fr; gap:14px 22px; max-width:900px; }
		.wrap .psub-field--full { grid-column: 1 / -1; }
		.wrap .psub-field { display:flex; flex-direction:column; gap:5px; margin-bottom:6px; }
		.wrap .psub-label { font-weight:600; }
		.wrap .psub-hint { font-size:12px; color:#666; }
		.wrap .psub-checks-grid { display:flex; flex-wrap:wrap; gap:6px 14px; }
		.wrap .psub-checks legend { font-weight:600; margin-bottom:6px; }
		.wrap input[type=text], .wrap input[type=url], .wrap select, .wrap textarea {
			width:100%; padding:6px 10px; border:1px solid #dcdcde; border-radius:4px;
		}
	</style></div>';
}
