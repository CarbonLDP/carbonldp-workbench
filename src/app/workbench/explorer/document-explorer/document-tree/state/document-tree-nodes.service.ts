import flatten from "lodash/flatten";

import { EMPTY, from, Observable, of, zip } from "rxjs";
import { flatMap, map, take } from "rxjs/operators";

import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Document } from "carbonldp/Document";
import { C } from "carbonldp/Vocabularies";
import { ChildCreatedEvent, DocumentDeletedEvent } from "carbonldp/Messaging";

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
		this.carbonldp.documents.$onChildCreated( this.onChildCreated.bind( this ) );
		this.carbonldp.documents.$onDocumentDeleted( this.onChildDeleted.bind( this ) );
	}

	refresh( id:string ):Observable<{ created:string[], modified:string[] }> {
		if( ! this.documentTreeNodesQuery.hasEntity( id ) ) return EMPTY;

		return from( this.getDocumentFromCarbon( id ) )
			.pipe( map( document => {
				const documentTreeNodes = [
					this.createNode( document ),
					...this.createChildNodes( document )
				];

				const modified:string[] = documentTreeNodes
					.filter( node => this.documentTreeNodesQuery.hasEntity( node.id ) )
					.map( node => {
						this.documentTreeNodesStore.update( node.id, previousState => ({
							...node,
							// Otherwise the update will wipe the node's parent (if it has one)
							...{ parent: previousState.parent }
						}) );

						return node.id;
					} );

				const created:string[] = documentTreeNodes
					.filter( node => ! this.documentTreeNodesQuery.hasEntity( node.id ) )
					.map( node => {
						this.documentTreeNodesStore.add( node );
						return node.id;
					} );

				return {
					modified,
					created,
				};
			} ) );
	}

	fetchOne( id:string ):Observable<DocumentTreeNode> {
		if( this.documentTreeNodesQuery.hasEntity( id ) ) return this.documentTreeNodesQuery.selectEntity( id );
		else return this.retrieveOne( id );
	}

	fetchChildren( parentID:string ):Observable<DocumentTreeNode[]> {
		return this.documentTreeNodesQuery
			.selectEntity( parentID )
			.pipe( flatMap( parent => {
				const missingDocumentIDs = parent.children.filter( id => ! this.documentTreeNodesQuery.hasEntity( id ) );

				if( ! missingDocumentIDs.length ) return this.documentTreeNodesQuery.selectChildren( parent.id );
				else return this.retrieveChildren( parent.id );
			} ) );
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

	private onChildCreated( event:ChildCreatedEvent ) {
		// FIXME
		const documentCreated = event.target.$id;
		console.log( `Document created: ${documentCreated}` );
	}

	private onChildDeleted( event:DocumentDeletedEvent ) {
		// FIXME
		const documentDeleted = event.target.$id;
		console.log( `Document deleted: ${documentDeleted}` );
	}

	private retrieveOne( id:string ):Observable<DocumentTreeNode> {
		return from( this.getDocumentFromCarbon( id ) )
			.pipe( map( document => {
				const documentTreeNodes = [
					this.createNode( document ),
					...this.createChildNodes( document )
				];

				this.documentTreeNodesStore.add( documentTreeNodes );

				return documentTreeNodes[ 0 ];
			} ) );
	}

	private retrieveChildren( parentID:string ):Observable<DocumentTreeNode[]> {
		return from( this.getChildrenFromCarbon( parentID ) )
			.pipe( map( children => {
				const documentTreeNodes = flatten(
					children.map( child => [
						this.createNode( child, parentID ),
						...this.createChildNodes( child )
					] )
				);

				this.documentTreeNodesStore.add( documentTreeNodes );

				return documentTreeNodes;
			} ) );
	}

	private retrieveMany( ids:string[] ):Observable<DocumentTreeNode[]> {
		// FIXME
		return of( null );
	}

	private getDocumentFromCarbon( documentID:string ):Promise<Document> {
		//@formatter:off
		return this.carbonldp.documents.$get( documentID, _ => _
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
		);
		//@formatter:on
	}

	private getChildrenFromCarbon( parentID:string ):Promise<Document[]> {
		//@formatter:off
		return this.carbonldp.documents.$getChildren( parentID, _ => _
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
	}

	private createNode( document:Document, parentID:string = undefined ):DocumentTreeNode {
		return createDocumentTreeNode( {
			id: document.$id,
			parent: parentID,
			children: document.contains
				? document.contains.map( child => child.$id )
				: [],
			types: document.types
				? [ ...document.types ]
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
