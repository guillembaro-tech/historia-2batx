<?php
// Proves de la lògica del connector amb funcions de WordPress simulades.
define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );
$GLOBALS['opcions'] = array();
$GLOBALS['transients'] = array();
$GLOBALS['respostes'] = array();
$GLOBALS['peticions'] = array();
function add_action( ...$a ) {}
function plugin_dir_path( $f ) { return dirname( $f ) . '/'; }
function plugin_dir_url( $f ) { return 'https://exemple/'; }
function get_option( $k, $d = false ) { return $GLOBALS['opcions'][ $k ] ?? $d; }
function get_transient( $k ) { return $GLOBALS['transients'][ $k ] ?? false; }
function set_transient( $k, $v, $t ) { $GLOBALS['transients'][ $k ] = $v; }
function wp_json_encode( $v ) { return json_encode( $v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ); }
function is_wp_error( $x ) { return $x instanceof WP_Error; }
function current_user_can( $c ) { return true; }
class WP_Error { public $c; public $m; public $d; function __construct( $c, $m, $d = array() ) { $this->c = $c; $this->m = $m; $this->d = $d; } function get_error_message() { return $this->m; } function get_error_data() { return $this->d; } }
class WP_REST_Request { public $p; function __construct( $p ) { $this->p = $p; } function get_json_params() { return $this->p; } function get_param( $k ) { return $this->p[ $k ] ?? null; } }
function wp_remote_get( $url, $a ) { return array( 'code' => 200, 'body' => file_get_contents( '/home/claude/historia-2batx/content/temes/taller-1.json' ) ); }
function wp_remote_post( $url, $a ) { $GLOBALS['peticions'][] = json_decode( $a['body'], true ); return array_shift( $GLOBALS['respostes'] ); }
function wp_remote_retrieve_response_code( $r ) { return $r['code']; }
function wp_remote_retrieve_body( $r ) { return $r['body']; }

require dirname( __DIR__ ) . '/pds-correccio/pds-correccio.php';

$errors = 0;
function ok( $cond, $msg ) { global $errors; echo ( $cond ? "  OK   " : "  FALLA " ) . $msg . "\n"; if ( ! $cond ) { $errors++; } }

echo "1. Esquema JSON\n";
$check = function ( $node, $path ) use ( &$check ) {
	$problemes = array();
	if ( isset( $node['type'] ) && 'object' === $node['type'] ) {
		if ( ( $node['additionalProperties'] ?? null ) !== false ) { $problemes[] = "$path sense additionalProperties false"; }
		if ( array_keys( $node['properties'] ) !== $node['required'] ) { $problemes[] = "$path required diferent de properties"; }
		foreach ( $node['properties'] as $k => $v ) { $problemes = array_merge( $problemes, $check( $v, "$path.$k" ) ); }
	}
	if ( isset( $node['type'] ) && 'array' === $node['type'] ) { $problemes = array_merge( $problemes, $check( $node['items'], "{$path}[]" ) ); }
	foreach ( array( 'minimum', 'maximum', 'multipleOf', 'minLength', 'maxLength', 'maxItems' ) as $k ) { if ( isset( $node[ $k ] ) ) { $problemes[] = "$path usa $k"; } }
	if ( isset( $node['minItems'] ) && $node['minItems'] > 1 ) { $problemes[] = "$path minItems > 1"; }
	return $problemes;
};
$p = $check( pds_corr_esquema(), 'arrel' );
ok( ! $p, 'tots els objectes tenen additionalProperties false i required complet; cap paraula clau no admesa ' . implode( '; ', $p ) );

echo "2. Petició\n";
$data = pds_corr_exercici( 1 );
ok( is_array( $data ) && ! empty( $data['ex1'] ), 'exercici carregat i desat a la memòria cau' );
$imgs = array( array( 'data' => 'QUJD', 'mime' => 'image/jpeg', 'w' => 1624, 'h' => 2296 ), array( 'data' => 'REVG', 'mime' => 'image/jpeg', 'w' => 1624, 'h' => 2296 ) );
$body = pds_corr_peticio( $data, $imgs, 'claude-sonnet-5-5' );
$tipus = array_map( function ( $b ) { return $b['type']; }, $body['messages'][0]['content'] );
ok( $tipus === array( 'text', 'image', 'text', 'image', 'text' ), 'ordre dels blocs: ' . implode( ',', $tipus ) );
ok( 'base64' === $body['messages'][0]['content'][1]['source']['type'] && 'image/jpeg' === $body['messages'][0]['content'][1]['source']['media_type'], 'bloc d\'imatge amb format base64' );
ok( isset( $body['output_config']['format']['schema'] ) && 'json_schema' === $body['output_config']['format']['type'], 'output_config.format amb json_schema' );
ok( 8000 === $body['max_tokens'] && 'claude-sonnet-5-5' === $body['model'] && '' !== $body['system'], 'model, max_tokens i system' );
$txt = end( $body['messages'][0]['content'] )['text'];
ok( false !== strpos( $txt, 'imatge 1 = 1624×2296 píxels' ), 'el prompt dona les mides de cada imatge' );
ok( false !== strpos( $txt, '«Marc cronològic» (0,30)' ) && false !== strpos( $txt, '«Confrontació de les fonts» (0,50)' ), 'criteris amb el valor en format català' );
ok( false !== strpos( $txt, 'Constitución' ) || false !== strpos( $txt, 'Constitucion' ) || false !== strpos( $txt, 'Cortes' ), 'el text de la font 1 hi és' );
ok( false !== strpos( $txt, 'Costa' ), 'la font 2 hi és' );
ok( false !== strpos( $txt, 'Idees vàlides' ), 'les idees vàlides del model hi són' );
ok( ! preg_match( '/\[\[|\]\]|\{\{|\}\}|__\w/u', $txt ), 'sense marques del taller al prompt' );
$body2 = pds_corr_peticio( $data, $imgs, 'claude-sonnet-5-5', "1.1\nUna idea", false );
ok( ! isset( $body2['output_config'] ) && false !== strpos( end( $body2['messages'][0]['content'] )['text'], 'Transcripció revisada pel professor' ), 'versió sense esquema i amb transcripció revisada' );
file_put_contents( __DIR__ . '/prompt.txt', $txt );
echo '   (prompt: ' . mb_strlen( $txt ) . " caràcters)\n";

echo "3. Postprocessament\n";
$raw = array(
	'llegibilitat' => 'regular', 'avis_llegibilitat' => 'Lletra petita',
	'transcripcio' => array( array( 'pregunta' => '1.1', 'text' => 'La sobirania...' ) ),
	'preguntes' => array(
		array( 'n' => '1.1', 'criteris' => array( array( 'criteri' => 'Primera idea fonamental, ben identificada i explicada', 'punts' => 0.4, 'assoliment' => 'assolit', 'justificacio' => 'a' ), array( 'criteri' => 'Segona idea fonamental, diferent de la primera i ben explicada', 'punts' => 0.1, 'assoliment' => 'parcial', 'justificacio' => 'b' ) ), 'valoracio' => 'v' ),
		array( 'n' => '1.3', 'criteris' => array( array( 'criteri' => 'marc cronològic', 'punts' => 0.3, 'assoliment' => 'assolit', 'justificacio' => '' ), array( 'criteri' => 'altre nom', 'punts' => -1, 'assoliment' => 'x', 'justificacio' => '' ) ), 'valoracio' => '' ),
	),
	'comentaris' => array(
		array( 'imatge' => 1, 'pregunta' => '1.1', 'tipus' => 'error', 'fragment' => 'f', 'comentari' => 'c', 'caixa' => array( 900, 500, 100, 400 ) ),
		array( 'imatge' => 5, 'pregunta' => '1.3', 'tipus' => 'raro', 'fragment' => 'f', 'comentari' => 'c', 'caixa' => array( -50, 10, 5000, 3000 ) ),
		array( 'imatge' => 2, 'pregunta' => 'general', 'tipus' => 'encert', 'fragment' => '', 'comentari' => 'c', 'caixa' => array( 1, 2 ) ),
	),
	'valoracio_general' => 'g', 'consells' => array( 'x', 'y' ),
);
$r = pds_corr_post( $raw, $imgs );
ok( 0.25 === $r['preguntes'][0]['criteris'][0]['punts'] && 0.1 === $r['preguntes'][0]['criteris'][1]['punts'] && 0.35 === $r['preguntes'][0]['punts'], 'punts limitats al valor de cada criteri (1.1 = 0,35)' );
ok( 0.0 === $r['preguntes'][1]['punts'] && 'No s\'ha trobat la resposta a aquesta pregunta.' === $r['preguntes'][1]['valoracio'], 'pregunta que falta (1.2) = 0' );
ok( 0.3 === $r['preguntes'][2]['criteris'][0]['punts'] && 0.0 === $r['preguntes'][2]['criteris'][1]['punts'] && 0.3 === $r['preguntes'][2]['punts'], '1.3 casa noms sense majúscules i no accepta negatius' );
ok( 5 === count( $r['preguntes'][2]['criteris'] ), 'la 1.3 té sempre els cinc criteris' );
ok( 0.65 === $r['nota_total'], 'nota total recalculada = ' . $r['nota_total'] );
ok( array( 100, 400, 900, 500 ) === $r['comentaris'][0]['caixa'], 'requadre girat es reordena' );
ok( 2 === $r['comentaris'][1]['imatge'] && array( 0, 10, 1624, 2296 ) === $r['comentaris'][1]['caixa'] && 'millora' === $r['comentaris'][1]['tipus'], 'imatge fora de rang, requadre retallat i tipus desconegut corregit' );
ok( array() === $r['comentaris'][2]['caixa'], 'requadre incomplet s\'elimina' );

echo "4. Crida amb repetició sense esquema i càlcul del cost\n";
$GLOBALS['opcions']['connectors_ai_anthropic_api_key'] = 'sk-prova';
$model_json = wp_json_encode( $raw );
$GLOBALS['respostes'] = array(
	array( 'code' => 400, 'body' => wp_json_encode( array( 'type' => 'error', 'error' => array( 'type' => 'invalid_request_error', 'message' => 'output_config.format: not supported with image input' ) ) ) ),
	array( 'code' => 200, 'body' => wp_json_encode( array( 'stop_reason' => 'end_turn', 'content' => array( array( 'type' => 'text', 'text' => "Aquí tens:\n" . $model_json ) ), 'usage' => array( 'input_tokens' => 12000, 'output_tokens' => 1500 ) ) ) ),
);
$res = pds_corr_rest_corregeix( new WP_REST_Request( array( 'tema' => 1, 'model' => 'claude-sonnet-5-5', 'imatges' => $imgs ) ) );
ok( is_array( $res ) && 0.65 === $res['resultat']['nota_total'], 'resultat correcte després de repetir sense esquema' );
ok( 2 === count( $GLOBALS['peticions'] ) && isset( $GLOBALS['peticions'][0]['output_config'] ) && ! isset( $GLOBALS['peticions'][1]['output_config'] ), 'primer amb esquema, després sense' );
ok( 0.039 === $res['cost_usd'], 'cost = ' . $res['cost_usd'] . ' $ (12.000 + 1.500 tokens amb Sonnet)' );

echo "5. Errors\n";
$GLOBALS['opcions']['connectors_ai_anthropic_api_key'] = '';
$e = pds_corr_rest_corregeix( new WP_REST_Request( array( 'tema' => 1, 'imatges' => $imgs ) ) );
ok( is_wp_error( $e ) && false !== strpos( $e->get_error_message(), 'Connectors' ), 'sense clau: ' . $e->get_error_message() );
$GLOBALS['opcions']['connectors_ai_anthropic_api_key'] = 'sk-prova';
$GLOBALS['respostes'] = array( array( 'code' => 401, 'body' => '{"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}' ) );
$e = pds_corr_rest_corregeix( new WP_REST_Request( array( 'tema' => 1, 'imatges' => $imgs ) ) );
ok( is_wp_error( $e ) && false !== strpos( $e->get_error_message(), 'no és vàlida' ), 'clau dolenta: ' . $e->get_error_message() );
$e = pds_corr_imatges( array( array( 'data' => 'abc$', 'mime' => 'image/jpeg', 'w' => 100, 'h' => 100 ) ) );
ok( is_wp_error( $e ), 'base64 no vàlid rebutjat' );
$e = pds_corr_imatges( array_fill( 0, 4, $imgs[0] ) );
ok( is_wp_error( $e ), 'més de 3 fotos rebutjat' );
$GLOBALS['respostes'] = array( array( 'code' => 200, 'body' => wp_json_encode( array( 'stop_reason' => 'max_tokens', 'content' => array(), 'usage' => array() ) ) ) );
$e = pds_corr_rest_corregeix( new WP_REST_Request( array( 'tema' => 1, 'imatges' => $imgs ) ) );
ok( is_wp_error( $e ) && false !== strpos( $e->get_error_message(), 'tallada' ), 'resposta tallada detectada' );


echo "6. Majúscules als enums\n";
$r6 = pds_corr_post( array( 'llegibilitat' => 'Bona', 'preguntes' => array( array( 'n' => ' 1.1 ', 'criteris' => array( array( 'criteri' => 'Primera idea fonamental, ben identificada i explicada', 'punts' => 0.25, 'assoliment' => 'Assolit', 'justificacio' => '' ) ), 'valoracio' => '' ) ), 'comentaris' => array( array( 'imatge' => 1, 'pregunta' => '1.3', 'tipus' => 'Error', 'fragment' => '', 'comentari' => '', 'caixa' => array() ) ), 'transcripcio' => array() ), $imgs );
ok( 'bona' === $r6['llegibilitat'] && 'assolit' === $r6['preguntes'][0]['criteris'][0]['assoliment'] && 0.25 === $r6['preguntes'][0]['punts'] && 'error' === $r6['comentaris'][0]['tipus'], 'enums en majúscules i amb espais es normalitzen' );

echo $errors ? "\n$errors PROVES FALLADES\n" : "\nTOTES LES PROVES OK\n";
