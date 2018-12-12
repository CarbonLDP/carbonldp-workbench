import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";

import { DocumentTreeNode } from "./document-tree-node.model";

export interface DocumentTreeNodesState extends EntityState<DocumentTreeNode> {
	rootNodes:DocumentTreeNode[];
}

@Injectable()
@StoreConfig( { name: "documents" } )
export class DocumentTreeNodesStore extends EntityStore<DocumentTreeNodesState, DocumentTreeNode> {
	constructor() {
		super({
			rootNodes: [],
		});
	}
}
