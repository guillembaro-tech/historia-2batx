<?php
/**
 * Camps (ACF PRO). Les definicions són al connector perquè el contingut s'editi des del panell.
 *
 * @package pds-historia-art
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Valor d'un camp amb un valor per defecte. */
function pdsha_f( string $name, $id, $default = '' ) {
	if ( ! function_exists( 'get_field' ) ) {
		return $default;
	}
	$v = get_field( $name, $id );
	return ( null === $v || false === $v || '' === $v || array() === $v ) ? $default : $v;
}

add_action( 'acf/init', 'pdsha_camps' );

function pdsha_camps(): void {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}
	$tab  = static fn( string $k, string $l ) => array( 'key' => 'field_pdsha_tab_' . $k, 'label' => $l, 'type' => 'tab', 'placement' => 'top' );
	$text = static fn( string $k, string $l, string $i = '' ) => array( 'key' => 'field_pdsha_' . $k, 'name' => $k, 'label' => $l, 'type' => 'text', 'instructions' => $i );
	$area = static fn( string $k, string $l, string $i = '', int $rows = 3 ) => array( 'key' => 'field_pdsha_' . $k, 'name' => $k, 'label' => $l, 'type' => 'textarea', 'rows' => $rows, 'new_lines' => '', 'instructions' => $i );
	$wys  = static fn( string $k, string $l, string $i = '' ) => array( 'key' => 'field_pdsha_' . $k, 'name' => $k, 'label' => $l, 'type' => 'wysiwyg', 'tabs' => 'all', 'toolbar' => 'full', 'media_upload' => 1, 'delay' => 1, 'instructions' => $i );

	acf_add_local_field_group(
		array(
			'key'        => 'group_pdsha_obra',
			'title'      => "Fitxa de l'obra",
			'location'   => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'obra_art' ) ) ),
			'position'   => 'acf_after_title',
			'style'      => 'default',
			'menu_order' => 0,
			'fields'     => array(
				$tab( 'fitxa', 'Fitxa' ),
				array( 'key' => 'field_pdsha_numero', 'name' => 'numero', 'label' => 'Número a la llista oficial', 'type' => 'number', 'min' => 1, 'max' => 99, 'instructions' => "Número de l'obra a la llista d'obres de referència de la PAU." ),
				$text( 'autor', 'Autor', 'Per a les targetes. Si és anònim, deixa-ho en blanc.' ),
				$text( 'dates', 'Dates', 'Forma curta, per exemple 1075-1211.' ),
				$text( 'lloc', 'Lloc', 'On és avui.' ),
				$area( 'resum', 'En trenta segons', "Resum de l'obra en tres o quatre frases. Admet **negreta** i *cursiva*.", 4 ),
				array(
					'key'          => 'field_pdsha_fitxa',
					'name'         => 'fitxa',
					'label'        => 'Fitxa tècnica',
					'type'         => 'repeater',
					'layout'       => 'table',
					'button_label' => 'Afegeix una fila',
					'sub_fields'   => array(
						array( 'key' => 'field_pdsha_fitxa_etiqueta', 'name' => 'etiqueta', 'label' => 'Etiqueta', 'type' => 'text', 'column_width' => 25 ),
						array( 'key' => 'field_pdsha_fitxa_valor', 'name' => 'valor', 'label' => 'Valor', 'type' => 'textarea', 'rows' => 2, 'new_lines' => '', 'instructions' => 'Admet **negreta** i *cursiva*.' ),
					),
				),
				array(
					'key'          => 'field_pdsha_imatges',
					'name'         => 'imatges',
					'label'        => 'Imatges',
					'type'         => 'repeater',
					'layout'       => 'block',
					'button_label' => 'Afegeix una imatge',
					'instructions' => "L'autoria i la llicència de cada imatge es posen a la mediateca (camp «Llegenda»).",
					'sub_fields'   => array(
						array( 'key' => 'field_pdsha_img_imatge', 'name' => 'imatge', 'label' => 'Imatge', 'type' => 'image', 'return_format' => 'id', 'preview_size' => 'medium' ),
						array(
							'key'     => 'field_pdsha_img_seccio',
							'name'    => 'seccio',
							'label'   => 'On va',
							'type'    => 'select',
							'choices' => array(
								'inici'    => 'A dalt, amb la fitxa',
								'context'  => 'a) Datació i context',
								'analisi'  => 'b) Anàlisi formal',
								'funcio'   => 'c) Funció',
								'destacat' => 'Apartat destacat',
								'relacio'  => 'd) Relació',
							),
						),
						array( 'key' => 'field_pdsha_img_titol', 'name' => 'titol', 'label' => 'Títol', 'type' => 'text' ),
						array( 'key' => 'field_pdsha_img_text', 'name' => 'text', 'label' => 'Text del peu', 'type' => 'textarea', 'rows' => 2, 'new_lines' => '' ),
					),
				),
				$tab( 'context', 'a) Context' ),
				$text( 'q_context', 'Pregunta guia' ),
				$wys( 'context', 'Datació i context' ),
				$tab( 'analisi', 'b) Anàlisi' ),
				$text( 'q_analisi', 'Pregunta guia' ),
				$wys( 'analisi', 'Anàlisi formal i estil' ),
				$tab( 'funcio', 'c) Funció' ),
				$text( 'q_funcio', 'Pregunta guia' ),
				$wys( 'funcio', 'Funció (o tema i funció)' ),
				$tab( 'destacat', 'Destacat' ),
				$text( 'destacat_titol', "Títol de l'apartat destacat", 'Opcional. Per exemple, «El Pòrtic de la Glòria».' ),
				$text( 'q_destacat', 'Pregunta guia' ),
				$wys( 'destacat', 'Text' ),
				$tab( 'relacio', 'd) Relació' ),
				$text( 'q_relacio', 'Pregunta guia' ),
				$wys( 'relacio', 'Relació amb altres obres' ),
				array( 'key' => 'field_pdsha_compara', 'name' => 'compara', 'label' => 'Compara-la amb', 'type' => 'relationship', 'post_type' => array( 'obra_art' ), 'post_status' => array( 'publish', 'private' ), 'filters' => array( 'search' ), 'return_format' => 'id', 'instructions' => 'Obres de la llista que surten com a targetes al final de l\'apartat.' ),
				$tab( 'pau', 'PAU' ),
				$wys( 'tambe', 'També pot sortir a', 'Exercicis 1, 3 i 4.' ),
				$text( 'pau_etiqueta', "Etiqueta de l'enunciat", 'Per exemple, «Enunciat oficial, Sèrie 0 (2025). Exercici 2, opció A.» o «Proposta en format PAU (no és un enunciat oficial).»' ),
				$wys( 'pau_enunciat', 'Enunciat' ),
				$wys( 'pau_criteris', 'Criteris de correcció' ),
				$wys( 'pau_model', 'Resposta model' ),
				$wys( 'pau_propostes', 'Altres preguntes possibles' ),
				$tab( 'fonts', 'Fonts' ),
				$wys( 'fonts', 'Fonts consultades' ),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'      => 'group_pdsha_estil',
			'title'    => "Tema de l'estil",
			'location' => array( array( array( 'param' => 'taxonomy', 'operator' => '==', 'value' => 'estil' ) ) ),
			'fields'   => array(
				array( 'key' => 'field_pdsha_estil_ordre', 'name' => 'pdsha_ordre', 'label' => 'Ordre', 'type' => 'number', 'instructions' => 'Ordre cronològic dins del període.' ),
				$text( 'estil_titol', 'Títol del tema', 'Per exemple, «El romànic».' ),
				$text( 'estil_dates', 'Dates', 'Per exemple, «Segles XI i XII».' ),
				$text( 'estil_pregunta', 'Pregunta guia' ),
				$area( 'estil_resum', 'Resum', '', 3 ),
				$wys( 'estil_pau', 'Com entra a la PAU' ),
				array(
					'key'          => 'field_pdsha_estil_seccions',
					'name'         => 'estil_seccions',
					'label'        => 'Apartats',
					'type'         => 'repeater',
					'layout'       => 'block',
					'button_label' => 'Afegeix un apartat',
					'sub_fields'   => array(
						array( 'key' => 'field_pdsha_sec_titol', 'name' => 'titol', 'label' => 'Títol', 'type' => 'text' ),
						array(
							'key'           => 'field_pdsha_sec_llenguatge',
							'name'          => 'llenguatge',
							'label'         => 'Llenguatge',
							'type'          => 'select',
							'allow_null'    => 1,
							'choices'       => array(
								'arquitectura'       => 'Arquitectura',
								'escultura'          => 'Escultura',
								'pintura'            => 'Pintura',
								'altres-llenguatges' => 'Altres llenguatges',
							),
							'instructions'  => "Si l'apartat explica un llenguatge, surt també a la pàgina filtrada (per exemple, Romànic · Arquitectura).",
						),
						array( 'key' => 'field_pdsha_sec_pregunta', 'name' => 'pregunta', 'label' => 'Pregunta guia', 'type' => 'text' ),
						array( 'key' => 'field_pdsha_sec_cos', 'name' => 'cos', 'label' => 'Text', 'type' => 'wysiwyg', 'tabs' => 'all', 'toolbar' => 'full', 'media_upload' => 1, 'delay' => 1 ),
					),
				),
				$wys( 'estil_fonts', 'Fonts consultades' ),
			),
		)
	);
}
