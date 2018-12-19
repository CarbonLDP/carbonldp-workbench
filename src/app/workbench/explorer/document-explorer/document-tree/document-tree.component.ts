import { first } from "rxjs/operators";

import { produce } from "immer";

import { AfterViewInit, Component, EventEmitter, Output } from "@angular/core";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";

import { DocumentTreeNode } from "./state/document-tree-node.model";
import { DocumentTreeNodesService } from "./state/document-tree-nodes.service";
import { DocumentTreeNodesQuery } from "./state/document-tree-nodes.query";
import { DocumentTreeDataSource } from "./document-tree.data-source";
import { DocumentTreeControl } from "./document-tree.control";

@Component( {
	selector: "app-document-tree",
	templateUrl: "./document-tree.component.html",
	styleUrls: [ "./document-tree.component.scss" ],
	providers: [
		DocumentTreeControl,
		DocumentTreeDataSource,
	],
} )
export class DocumentTreeComponent implements AfterViewInit {
	// FIXME: Use SelectionModel instead (don't reinvent the wheel)
	@Output() onSelectDocuments:EventEmitter<string[]> = new EventEmitter<string[]>();
	set selectedNodes( selectedNodes:string[] ) {
		this._selectedNodes = selectedNodes;
		this.onSelectDocuments.emit(
			// Clone the selectedNodes before emitting them
			produce( this._selectedNodes, state => {} )
		);
	}
	get selectedNodes():string[] { return this._selectedNodes };
	private _selectedNodes:string[] = [];

	@Output() onOpenDocument:EventEmitter<string> = new EventEmitter<string>();
	set openedNode( openedNode:string ) {
		this._openedNode = openedNode;
		this.onOpenDocument.emit( this._openedNode );
	}
	get openedNode():string { return this._openedNode };
	private _openedNode:string;

	// Icons
	readonly faCaretDown = faCaretDown;
	readonly faCaretRight = faCaretRight;

	constructor(
		private documentTreeNodesQuery:DocumentTreeNodesQuery,
		private documentTreeNodesService:DocumentTreeNodesService,
		// Needed by the mat-tree component in the view
		public documentTreeControl:DocumentTreeControl,
		// Needed by the mat-tree component in the view
		public documentTreeDataSource:DocumentTreeDataSource,
	) {}

	async ngAfterViewInit() {
		// Initialize the tree by fetching the root document ("/") and then registering it as the root document in the {@link DocumentTreeNodesService}
		this.documentTreeNodesService.fetchOne( "/" )
		// We only need to do this for the first emitted value (since we know it won't change anymore)
			.pipe( first() )
			.subscribe( document => {
				this.documentTreeNodesService.updateRootNodes( [ document.id ] );
				this.documentTreeControl.expand( document );
			} );
	}

	onNodeMouseDown( event:MouseEvent, node:DocumentTreeNode ) {
		// Avoid text from being selected on a double click (the text selection happens on the second click's mouseDown event)
		/*
			2018-12-17 @MiguelAraCo
			TODO[improvement]: Find a way to prevent this without disabling text selection completely
		*/
		event.preventDefault();
	}

	onNodeClick( event:MouseEvent, node:DocumentTreeNode ) {
		// See: https://stackoverflow.com/questions/37078709/angular-2-check-if-shift-key-is-down-when-an-element-is-clicked#comment89930067_45884676
		const modifySelection = event[ "shiftKey" ] || event[ "ctrlKey" ] || event[ "metaKey" ];

		if( modifySelection ) {
			const index = this.selectedNodes.indexOf( node.id );
			if( index > - 1 ) {
				// The node was already in the selection
				this.selectedNodes = produce( this.selectedNodes, selectedNodes => {
					selectedNodes.splice( index, 1 );
				} );
			} else {
				// The node wasn't in the selection
				this.selectedNodes = produce( this.selectedNodes, selectedNodes => {
					selectedNodes.push( node.id );
				} );
			}
		} else {
			// Since no modifier key was used, the selection will be replaced completely
			this.selectedNodes = produce( this.selectedNodes, selectedNodes =>
				[ node.id ]
			);
		}
	}

	onNodeDoubleClick( event:MouseEvent, node:DocumentTreeNode ) {
		// See: https://stackoverflow.com/questions/37078709/angular-2-check-if-shift-key-is-down-when-an-element-is-clicked#comment89930067_45884676
		const modifySelection = event[ "shiftKey" ] || event[ "ctrlKey" ] || event[ "metaKey" ];

		// If the user is just modifying the selection we'll swallow this event
		if( modifySelection ) return;

		// The double clicked node will become the only selected node
		this.selectedNodes = produce( this.selectedNodes, selectedNodes => [ node.id ] );

		if( this.openedNode === node.id ) this.documentTreeControl.toggle( node );
		else this.openedNode = node.id;
	}

	/**
	 * Tells the UI if a node has children or not. Used by the component's template
	 * @param index - The index of the node (in the node's level)
	 * @param node - The node in question
	 */
	hasChildren = ( index:number, node:DocumentTreeNode ):boolean => {
		return ! ! node.children && ! ! node.children.length;
	};

	/**
	 * Returns the level of the node in the tree (starting from 0 for the root)
	 * @param node
	 */
	getTreeLevel( node:DocumentTreeNode ):number {
		return this.documentTreeNodesQuery.getTreeLevel( node );
	}

	isSelected( node:DocumentTreeNode ):boolean {
		return this.selectedNodes.includes( node.id );
	}

	isOpened( node:DocumentTreeNode ):boolean {
		return node.id === this.openedNode;
	}
}
