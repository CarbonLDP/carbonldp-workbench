import { merge, Observable } from "rxjs";
import { flatMap } from "rxjs/operators";

import { CollectionViewer, DataSource, SelectionChange } from "@angular/cdk/collections";
import { NestedTreeControl } from "@angular/cdk/tree";

import { DocumentTreeNode } from "./state/document-tree-node.model";
import { DocumentTreeNodesQuery } from "./state/document-tree-nodes.query";
import { DocumentTreeNodesService } from "./state/document-tree-nodes.service";

/**
 * {@link DataSource} that powers the document tree. It is in charge of three things:
 * <ul>
 *     <li>Give the tree the data it will use to render</li>
 *     <li>Bind to data changes to notify the tree component so it gets refreshed</li>
 *     <li>Respond to expansion/collapse of nodes and retrieve more data if needed</li>
 * </ul>
 */
export class DocumentTreeDataSource extends DataSource<DocumentTreeNode> {
	constructor(
		private treeControl:NestedTreeControl<DocumentTreeNode>,
		private documentTreeNodesQuery:DocumentTreeNodesQuery,
		private documentTreeNodesService:DocumentTreeNodesService,
	) {
		super();
	}

	// Called by the tree to get the data to render
	connect( collectionViewer:CollectionViewer ):Observable<DocumentTreeNode[] | ReadonlyArray<DocumentTreeNode>> {
		// The TreeControl's expansion is in charge of node expand/contract actions. Its changed property is an observable
		// that emits a value every time one or more tree nodes get expanded/contracted
		// Here we are subscribing to those changes to handle them and load data if necessary
		this.treeControl.expansionModel.changed.subscribe( this.handleTreeChange.bind( this ) );

		// The connect action is in charge of returning an Observable that will be used by the Tree as its data
		// Here we merge two observables to emit a value whenever any of them emits one
		// In this case, if the view changes or if there's any change in any of the tree nodes, a value will be emitted
		return merge( collectionViewer.viewChange, this.documentTreeNodesQuery.selectAll() )
			.pipe(
				// Every time a value gets emitted, we discard it (since we only care about the change taking place)
				// And we emit the document tree root nodes (which is not going to change, but the value emission will cause
				// the tree to refresh
				flatMap( () => this.documentTreeNodesQuery.rootNodes$ )
			);
	}

	disconnect( collectionViewer:CollectionViewer ) {
		// FIXME: Should we unsubscribe from any observable?
	}

	private handleTreeChange( change:SelectionChange<DocumentTreeNode> ) {
		// In this case if there are "added" values, it means some nodes were expanded
		if( change.added ) {
			change.added.forEach( node => this.handleExpand( node ) );
		}
		// In this case if there are "removed" values, it means some nodes were collapsed
		if( change.removed ) {
			// Create a copy of the values array (slice) so we can modify it, then reverse it
			// TODO: Is this actually needed?
			change.removed.slice().reverse()
				.forEach( node => this.handleCollapse( node ) );
		}
	}

	private async handleExpand( node:DocumentTreeNode ) {
		this.documentTreeNodesService.fetchChildren( node.id ).subscribe();
	}

	private handleCollapse( node:DocumentTreeNode ) {
		// Nothing to do
	}
}
