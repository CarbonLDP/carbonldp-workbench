import { Observable, Subject } from "rxjs";
import { flatMap, map, tap } from "rxjs/operators";

import { Injectable } from "@angular/core";

import { SelectionChange } from "@angular/cdk/collections";

import { QueryEntity } from "@datorama/akita";
import { DocumentTreeNodesState, DocumentTreeNodesStore } from "./document-tree-nodes.store";
import { DocumentTreeNode } from "./document-tree-node.model";

@Injectable( {
	providedIn: "root"
} )
export class DocumentTreeNodesQuery extends QueryEntity<DocumentTreeNodesState, DocumentTreeNode> {
	public rootNodes$ = this
		.select( state => state.rootNodesIDs )
		.pipe(
			flatMap( rootNodeIDs => this.selectMany( rootNodeIDs ) ),
		);

	constructor( protected store:DocumentTreeNodesStore ) {
		super( store );
	}

	selectChildren( parentID:string ):Observable<DocumentTreeNode[]> {
		return this
			.selectEntity( parentID )
			.pipe(
				flatMap( parent =>
					this.selectAll( {
						filterBy: entity => parent.children.includes( entity.id ),
						sortBy: "id",
					} )
				)
			);
	}

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
}
