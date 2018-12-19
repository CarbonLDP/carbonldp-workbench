import { merge, Observable } from "rxjs";
import { flatMap, tap } from "rxjs/operators";

import { Injectable } from "@angular/core";
import { CollectionViewer, DataSource, SelectionChange } from "@angular/cdk/collections";

import { DocumentTreeNode } from "./state/document-tree-node.model";
import { DocumentTreeNodesQuery } from "./state/document-tree-nodes.query";
import { DocumentTreeNodesService } from "./state/document-tree-nodes.service";
import { DocumentTreeControl } from "./document-tree.control";

/**
 * {@link DataSource} that powers the document tree. It is in charge of three things:
 * <ul>
 *     <li>Give the tree the data it will use to render</li>
 *     <li>Bind to data changes to notify the tree component so it gets refreshed</li>
 *     <li>Respond to expansion/collapse of nodes and retrieve more data if needed</li>
 * </ul>
 */
@Injectable()
export class DocumentTreeDataSource extends DataSource<DocumentTreeNode> {
	constructor(
		private treeControl:DocumentTreeControl,
		private documentTreeNodesQuery:DocumentTreeNodesQuery,
	) {
		super();
	}

	// Called by the tree to get the data to render
	connect( collectionViewer:CollectionViewer ):Observable<DocumentTreeNode[] | ReadonlyArray<DocumentTreeNode>> {
		// The connect action is in charge of returning an Observable that will be used by the Tree as its data
		// Here we merge two observables to emit a value whenever any of them emits one
		// In this case, if the view changes or if there's any change in any of the tree nodes, a value will be emitted
		return merge( collectionViewer.viewChange, this.documentTreeNodesQuery.selectAll() )
			.pipe(
				// Every time a value gets emitted, we discard it (since we only care about the change taking place)
				// And we emit the document tree root nodes (which is not going to change, but the value emission will cause
				// the tree to refresh
				flatMap( () => this.documentTreeNodesQuery.rootNodes$ ),
			);
	}

	disconnect( collectionViewer:CollectionViewer ) {
		// FIXME: Should we unsubscribe from any observable?
	}
}
