import { Observable } from "rxjs";

import { Injectable } from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { TreeControl } from "@angular/cdk/tree";

import { DocumentTreeNode } from "./state/document-tree-node.model";
import { DocumentTreeNodesQuery } from "app/workbench/explorer/document-explorer/document-tree/state/document-tree-nodes.query";
import { DocumentTreeNodesService } from "app/workbench/explorer/document-explorer/document-tree/state/document-tree-nodes.service";

@Injectable()
export class DocumentTreeControl implements TreeControl<DocumentTreeNode> {
	constructor(
		private documentTreeNodesQuery:DocumentTreeNodesQuery,
		private documentTreeNodesService:DocumentTreeNodesService,
	) {}

	// ======= START: Not used by this implementation
	// FIXME: Document why each property isn't being used
	get dataNodes():DocumentTreeNode[] {
		throw new Error( "DocumentTreeControl doesn't implement TreeControl::dataNodes" );
	}
	set dataNodes( nodes:DocumentTreeNode[] ) {
		throw new Error( "DocumentTreeControl doesn't implement TreeControl::dataNodes" );
	}

	get expansionModel():SelectionModel<DocumentTreeNode> {
		throw new Error( "DocumentTreeControl doesn't implement TreeControl::expansionModel" );
	}
	set expansionModel( nodes:SelectionModel<DocumentTreeNode> ) {
		throw new Error( "DocumentTreeControl doesn't implement TreeControl::expansionModel" );
	}

	// Not used since it is only required by flat trees
	readonly getLevel:( dataNode:DocumentTreeNode ) => number;

	// Not used since it is only required by flat trees
	readonly isExpandable:( dataNode:DocumentTreeNode ) => boolean;
	// ======= END: Not used by this implementation

	// FIXME: Document why it works
	readonly getChildren = node => this.documentTreeNodesQuery.selectChildren( node.id );

	isExpanded( node:DocumentTreeNode ):boolean {
		return this.documentTreeNodesQuery.isExpanded( node.id );
	}

	expand( node:DocumentTreeNode ):void {
		this.documentTreeNodesService.expand( node.id );
	}

	expandAll():void {
		// FIXME
		throw new Error( "Not implemented" );
	}

	toggle( node:DocumentTreeNode ):void {
		this.documentTreeNodesService.toggle( node.id );
	}

	collapse( node:DocumentTreeNode ):void {
		this.documentTreeNodesService.collapse( node.id );
	}

	collapseAll():void {
		// FIXME
		throw new Error( "Not implemented" );
	}

	/**
	 * Get all descendants of a node (recursively)
	 * @param node
	 */
	getDescendants( node:DocumentTreeNode ):DocumentTreeNode[] {
		// FIXME
		throw new Error( "Not implemented" );
	}

	toggleDescendants( dataNode:DocumentTreeNode ):void {
		// FIXME
		throw new Error( "Not implemented" );
	}

	expandDescendants( dataNode:DocumentTreeNode ):void {
		// FIXME
		throw new Error( "Not implemented" );
	}

	collapseDescendants( dataNode:DocumentTreeNode ):void {
		// FIXME
		throw new Error( "Not implemented" );
	}
}
