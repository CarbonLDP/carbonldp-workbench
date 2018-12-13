import flatten from "lodash/flatten";

import { from, Observable, of, zip } from "rxjs";
import { flatMap, map, take } from "rxjs/operators";

import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Document } from "carbonldp/Document";
import { C } from "carbonldp/Vocabularies";

import { createDocumentTreeNode, DocumentTreeNode } from "./document-tree-node.model";
import { DocumentTreeNodesStore } from "./document-tree-nodes.store";
import { DocumentTreeNodesQuery } from "./document-tree-nodes.query";

@Injectable()
export class DocumentTreeNodesService {
	constructor(
		private carbonldp:CarbonLDP,
		private documentTreeNodesStore:DocumentTreeNodesStore,
		private documentTreeNodesQuery:DocumentTreeNodesQuery,
	) {
	}

	fetchOne( id:string ):Observable<DocumentTreeNode> {
		if( this.documentTreeNodesQuery.hasEntity( id ) ) return this.documentTreeNodesQuery.selectEntity( id );
		else return this.retrieveOne( id );
	}

	fetchChildren( parentID:string ):Observable<DocumentTreeNode[]> {
		return this.documentTreeNodesQuery
			.selectEntity( parentID )
			.pipe(
				flatMap( parent => {
					const missingDocumentIDs = parent.children.filter( id => ! this.documentTreeNodesQuery.hasEntity( id ) );

					if( ! missingDocumentIDs.length ) return this.documentTreeNodesQuery.selectChildren( parent.id );
					else return this.retrieveChildren( parent.id );
				} )
			);
	}

	fetchMany( ids:string[] ):Observable<DocumentTreeNode[]> {
		const missingDocumentIDs = [];
		const existingDocumentIDs = [];
		ids.forEach( id => {
			if( this.documentTreeNodesQuery.hasEntity( id ) ) existingDocumentIDs.push( id );
			else missingDocumentIDs.push( id );
		} );

		const existingDocuments$ = existingDocumentIDs.length
			? this.documentTreeNodesQuery.selectMany( existingDocumentIDs )
			// Since of expects an array of results, we need to use an array with an empty array inside as the first result
			: of( [ [] ] );

		const missingDocuments$ = missingDocumentIDs.length
			? this.retrieveMany( ids )
			// Since of expects an array of results, we need to use an array with an empty array inside as the first result
			: of( [ [] ] );

		return zip( existingDocuments$, missingDocuments$ )
			.pipe(
				// Flatten outputs from both observables into a single array
				map( value => flatten( value ) ),
				take( 1 ),
			);
	}

	add( document:DocumentTreeNode ) {
		this.documentTreeNodesStore.add( document );
	}

	update( id:string, document:Partial<DocumentTreeNode> ) {
		this.documentTreeNodesStore.update( id, document );
	}

	remove( id:string ) {
		this.documentTreeNodesStore.remove( id );
	}

	updateRootNodes( rootNodes:DocumentTreeNode[] ) {
		this.documentTreeNodesStore.updateRoot( {
			rootNodes
		} );
	}

	private retrieveOne( id:string ):Observable<DocumentTreeNode> {
		return from(
			//@formatter:off
			this.carbonldp.documents.$get( id, _ => _
				.withType( C.Document )
				.properties( {
					"contains": {
						query: _ => _
							.withType( C.Document )
							.properties( {
								"contains": _.inherit
							} )
					},
				} )
			)
			//@formatter:on
		).pipe(
			map( document => {
				const documentTreeNodes = [
					this.createNode( document ),
					...this.createChildNodes( document )
				];

				this.documentTreeNodesStore.add( documentTreeNodes );

				return documentTreeNodes[ 0 ];
			} )
		);
	}

	private retrieveChildren( parentID:string ):Observable<DocumentTreeNode[]> {
		return from(
			//@formatter:off
			this.carbonldp.documents.$getChildren( parentID, _ => _
				.withType( C.Document )
				.properties( {
					"contains": {
						query: _ => _
							.withType( C.Document )
							.properties( {
								"contains": _.inherit
							} )
					},
				} )
			)
			//@formatter:on
		).pipe(
			map( children => {
				const documentTreeNodes = flatten(
					children.map( child => [
						this.createNode( child, parentID ),
						...this.createChildNodes( child )
					] )
				);

				this.documentTreeNodesStore.add( documentTreeNodes );

				return documentTreeNodes;
			} )
		);
	}

	private retrieveMany( ids:string[] ):Observable<DocumentTreeNode[]> {
		// FIXME
		return of( null );
	}

	private createNode( document:Document, parentID:string = null ):DocumentTreeNode {
		return createDocumentTreeNode( {
			id: document.$id,
			parent: parentID,
			children: document.contains
				? document.contains.map( child => child.$id )
				: [],
			types: document.types
				? [...document.types]
				: [],
			created: document.created,
			modified: document.modified,
		} );
	}

	private createChildNodes( document:Document ):DocumentTreeNode[] {
		return document.contains
			? document.contains.map( child => this.createNode( child, document.$id ) )
			: [];
	}
}
