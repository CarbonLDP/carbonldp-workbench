import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";

import { DocumentTreeNode } from "./document-tree-node.model";

export interface DocumentTreeNodesState extends EntityState<DocumentTreeNode> {
	rootNodesIDs:string[];
	expandedNodesIDs:string[]
}

@Injectable( {
	providedIn: "root"
} )
@StoreConfig( { name: "documents" } )
export class DocumentTreeNodesStore extends EntityStore<DocumentTreeNodesState, DocumentTreeNode> {
	constructor() {
		super( {
			rootNodesIDs: [],
			expandedNodesIDs: [],
		} );
	}
}
