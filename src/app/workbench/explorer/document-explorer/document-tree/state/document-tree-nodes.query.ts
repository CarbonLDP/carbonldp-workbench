import { Observable } from "rxjs";
import { flatMap } from "rxjs/operators";

import { Injectable } from "@angular/core";

import { QueryEntity } from "@datorama/akita";
import { DocumentTreeNodesState, DocumentTreeNodesStore } from "./document-tree-nodes.store";
import { DocumentTreeNode } from "./document-tree-node.model";

/**
 * Callback executed on every node visited by the {@link DocumentTreeNodesQuery::traverseNodes} method.
 *
 * @returns - Any value other than undefined to end the traversal
 */
type TraverseNodesFn<RESULT> = ( node:DocumentTreeNode, index:number ) => RESULT | undefined;

@Injectable( {
	providedIn: "root"
} )
export class DocumentTreeNodesQuery extends QueryEntity<DocumentTreeNodesState, DocumentTreeNode> {
	public rootNodes$ = this
		.select( state => state.rootNodesIDs )
		.pipe(
			flatMap( nodeIDs => this.selectMany( nodeIDs ) ),
		);
	public expandedNodes$ = this
		.select( state => state.expandedNodesIDs )
		.pipe(
			flatMap( nodeIDs => this.selectMany( nodeIDs ) ),
		);

	/**
	 * Function to sort documents returned by any query
	 * @param nodeA
	 * @param nodeB
	 */
	readonly sortBy = ( nodeA:DocumentTreeNode, nodeB:DocumentTreeNode ):number => {
		return nodeA.id.localeCompare( nodeB.id );
	};

	constructor( protected store:DocumentTreeNodesStore ) {
		super( store );
	}

	/**
	 * Checks if an entity exists ignoring dummy entities
	 * @param id
	 */
	hasRealEntity( id:string ):boolean {
		if( ! this.hasEntity( id ) ) return false;
		return ! this.getEntity( id ).isDummy;
	}

	/**
	 * Returns the children nodes of a node
	 * @param parentID
	 */
	getChildren( parentID:string ):DocumentTreeNode[] {
		const parent = this.getEntity( parentID );

		return this
			.getAll( {
				filterBy: entity => parent.children.includes( entity.id ),
			} )
			.sort( this.sortBy );
	}

	/**
	 * Returns an observable that emits the children of a node every time they change
	 * @param parentID
	 */
	selectChildren( parentID:string ):Observable<DocumentTreeNode[]> {
		return this
			.selectEntity( parentID )
			.pipe(
				flatMap( parent =>
					this.selectAll( {
						filterBy: entity => parent.children.includes( entity.id ),
						sortBy: this.sortBy,
					} )
				)
			);
	}

	/**
	 * Returns the depth level of a node relative to the root
	 * @param node
	 */
	getTreeLevel( node:DocumentTreeNode ):number {
		let level:number = 0;
		while( node.parent ) {
			level ++;
			node = this.getEntity( node.parent );
		}
		return level;
	}

	isExpanded( nodeID:string ):boolean {
		return this.getSnapshot().expandedNodesIDs.includes( nodeID );
	}

	/**
	 * Returns the index of a node if the tree was seen as a flatten list, where expanded nodes's children are appended next to the parent
	 * @param nodeID
	 */
	getTreeIndex( nodeID:string ):number {
		return this.traverseNodes<number>( ( node, index ) => {
			if( nodeID === node.id ) return index;
		} );
	}

	/**
	 * Executes the provided callback against every node in the order they would appear in a flatten structure.
	 *
	 * @returns - The value returned by the callback when it decided to exit the traversal or undefined if the traversal completed
	 */
	traverseNodes<RESULT>( fn:TraverseNodesFn<RESULT> ):RESULT | undefined {
		return this._traverseNodes( fn );
	}

	private _traverseNodes<RESULT>( fn:( node:DocumentTreeNode, index:number ) => RESULT | undefined, currentNode:DocumentTreeNode | null = null, state:{ index:number } = { index: 0 } ):RESULT | undefined {
		if( currentNode !== null ) {
			// Process current node
			const result:RESULT | undefined = fn( currentNode, state.index );
			if( typeof result !== "undefined" ) return result;

			state.index ++;

			if( ! currentNode.children.length || ! this.isExpanded( currentNode.id ) ) return;
		}

		const siblings = currentNode !== null
			? this.getChildren( currentNode!.id )
			// The tree is just starting so the root nodes need to be processed
			: this.getSnapshot().rootNodesIDs.map( nodeID => this.getEntity( nodeID ) ).sort( this.sortBy );

		for( let sibling of siblings ) {
			const result:RESULT | undefined = this._traverseNodes( fn, sibling, state );
			if( typeof result !== "undefined" ) return result;
		}

		return;
	}
}
