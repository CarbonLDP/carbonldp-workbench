import { merge, Observable, timer } from "rxjs";
import { first, flatMap, takeUntil } from "rxjs/operators";

import { Injectable } from "@angular/core";
import { CollectionViewer, DataSource } from "@angular/cdk/collections";

import { CarbonLDP } from "carbonldp";

import { DocumentTreeNode } from "./state/document-tree-node.model";
import { DocumentTreeNodesQuery } from "./state/document-tree-nodes.query";
import { DocumentTreeControl } from "./document-tree.control";
import { DocumentTreeNodesService } from "app/workbench/explorer/document-explorer/document-tree/state";

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
		private carbonldp:CarbonLDP,
		private documentTreeControl:DocumentTreeControl,
		private documentTreeNodesQuery:DocumentTreeNodesQuery,
		private documentTreeNodesService:DocumentTreeNodesService,
	) {
		super();
	}

	// Called by the tree to get the data to render
	connect( collectionViewer:CollectionViewer ):Observable<DocumentTreeNode[] | ReadonlyArray<DocumentTreeNode>> {
		const rootDocumentID = this.carbonldp.documents.$id;

		// We only need to do this for the first emitted value (since we know it won't change anymore)
		const rootDocument$ = this.documentTreeNodesService.fetchOne( rootDocumentID ).pipe( first() );

		if( ! this.documentTreeNodesQuery.hasEntity( rootDocumentID ) ) {
			// Wait 150ms before adding the dummy nodes (that way if the real nodes are retrieved faster the user won't see a UI flash)
			timer( 150 )
				// If the real children are retrieved faster, complete the observable so the subscription doesn't execute
				.pipe( takeUntil( rootDocument$ ) )
				.subscribe( () => {
					// Create dummy structure to have as placeholders
					const dummyNodes = DocumentTreeNode.createDummyNodes();
					const dummyRootNode = dummyNodes[ 0 ];
					this.documentTreeNodesService.add( ...dummyNodes );
					this.documentTreeNodesService.updateRootNodes( dummyRootNode.id );
					// Expand all dummy nodes to make them look better
					this.documentTreeNodesService.expand( ...dummyNodes.map( node => node.id ) );
				} );
		}

		// Initialize the tree by fetching the root document and then registering it as the root document in the {@link DocumentTreeNodesService}
		rootDocument$
			.subscribe( document => {
				this.documentTreeNodesService.updateRootNodes( document.id );
				this.documentTreeControl.expand( document );
			} );

		this.documentTreeNodesQuery.expandedNodes$
			.pipe( flatMap( expandedNodes =>
				merge(
					...expandedNodes.map( node => {
						const children$ = this.documentTreeNodesService.fetchChildren( node.id );

						const missingDocumentIDs = node.children.filter( id => ! this.documentTreeNodesQuery.hasEntity( id ) );
						// Are there children that haven't been loaded?
						if( missingDocumentIDs.length ) {
							// Create dummy nodes to represent the node's children
							const dummyChildren = node.children.map( childID => DocumentTreeNode.createDummy( {
								id: childID,
								parent: node.id,
							} ) );

							// Wait 150ms before adding the dummy nodes (that way if the real nodes are retrieved faster the user won't see a UI flash)
							timer( 150 )
							// If the real children are retrieved faster, complete the observable so the next line doesn't execute
								.pipe( takeUntil( children$ ) )
								.subscribe( () => this.documentTreeNodesService.add( ...dummyChildren ) );
						}
						return children$;
					} )
				)
			) ).subscribe();

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
