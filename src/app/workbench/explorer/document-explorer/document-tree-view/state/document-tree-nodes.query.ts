import { Observable } from "rxjs";
import { flatMap } from "rxjs/operators";

import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { DocumentTreeNodesState, DocumentTreeNodesStore } from "./document-tree-nodes.store";
import { DocumentTreeNode } from "./document-tree-node.model";

@Injectable( {
	providedIn: "root"
} )
export class DocumentTreeNodesQuery extends QueryEntity<DocumentTreeNodesState, DocumentTreeNode> {
	rootNodes$ = this.select( state => state.rootNodes );

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
}
