import { produce } from "immer";

import { Component, EventEmitter, Output } from "@angular/core";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";

import { CarbonLDP } from "carbonldp";

import { DocumentTreeNode } from "./state/document-tree-node.model";
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
export class DocumentTreeComponent {
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
		private carbonldp:CarbonLDP,
		private documentTreeNodesQuery:DocumentTreeNodesQuery,
		// Needed by the mat-tree component in the view
		public documentTreeControl:DocumentTreeControl,
		// Needed by the mat-tree component in the view
		public documentTreeDataSource:DocumentTreeDataSource,
	) {}

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
		const addRange = event[ "shiftKey" ];
		const modifySelection = event[ "shiftKey" ] || event[ "ctrlKey" ] || event[ "metaKey" ];

		if( addRange ) {
			this.handleAddRangeToSelection( node );
		} else if( modifySelection ) {
			this.handleModifySelection( node );
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

	private handleAddRangeToSelection( clickedNode:DocumentTreeNode ) {
		if( this.selectedNodes.length === 0 ) {
			// There were no nodes selected
			// Set the clicked node as the only selected node
			this.selectedNodes = produce( this.selectedNodes, () =>
				[ clickedNode.id ]
			);
			return;
		}

		// We need to calculate the range of nodes to add to the selection
		const lastSelectedNodeID = this.selectedNodes[ this.selectedNodes.length - 1 ];
		const lastSelectedNodeIndex = this.documentTreeNodesQuery.getTreeIndex( lastSelectedNodeID );
		const clickedNodeIndex = this.documentTreeNodesQuery.getTreeIndex( clickedNode.id );

		const range = {
			start: Math.min( lastSelectedNodeIndex, clickedNodeIndex ),
			end: Math.max( lastSelectedNodeIndex, clickedNodeIndex ),
		};

		const nodesToAddToSelection = [];
		this.documentTreeNodesQuery.traverseNodes( ( node, index ) => {
			if( index >= range.start && index <= range.end ) nodesToAddToSelection.push( node.id );
			// Return anything to stop the traversal
			if( index > range.end ) return "BREAK";
		} );

		this.selectedNodes = produce( this.selectedNodes, selectedNodes => [
			...selectedNodes,
			...nodesToAddToSelection,
		] );
	}

	private handleModifySelection( clickedNode:DocumentTreeNode ) {
		const index = this.selectedNodes.indexOf( clickedNode.id );
		if( index > - 1 ) {
			// The node was already in the selection
			this.selectedNodes = produce( this.selectedNodes, selectedNodes => {
				selectedNodes.splice( index, 1 );
			} );
		} else {
			// The node wasn't in the selection
			this.selectedNodes = produce( this.selectedNodes, selectedNodes => {
				selectedNodes.push( clickedNode.id );
			} );
		}
	}
}
