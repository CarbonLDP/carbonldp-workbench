import { first } from "rxjs/operators";

import { produce } from "immer";

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output } from "@angular/core";
import { NestedTreeControl } from "@angular/cdk/tree";

import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-regular-svg-icons";

import { CarbonLDP } from "carbonldp";

import { DocumentTreeNode } from "./state/document-tree-node.model";
import { DocumentTreeNodesStore } from "./state/document-tree-nodes.store";
import { DocumentTreeNodesService } from "./state/document-tree-nodes.service";
import { DocumentTreeNodesQuery } from "./state/document-tree-nodes.query";
import { DocumentTreeDataSource } from "./document-tree.data-source";

@Component( {
	selector: "app-document-tree",
	templateUrl: "./document-tree.component.html",
	styleUrls: [ "./document-tree.component.scss" ],
	providers: [
		DocumentTreeNodesStore,
		DocumentTreeNodesQuery,
		DocumentTreeNodesService,
	],
} )
export class DocumentTreeComponent implements AfterViewInit {
	@Output() onSelectDocuments:EventEmitter<string[]> = new EventEmitter<string[]>();
	set selectedNodes( selectedNodes:string[] ) {
		this._selectedNodes = selectedNodes;
		this.onSelectDocuments.emit( produce( this._selectedNodes, state => {} ) );
	}
	get selectedNodes():string[] { return this._selectedNodes };
	private _selectedNodes:string[] = [];

	@Output() onOpenDocument:EventEmitter<string> = new EventEmitter<string>();
	set openedNode ( openedNode :string ) {
		this._openedNode  = openedNode ;
		this.onOpenDocument.emit( this._openedNode  );
	}
	get openedNode ():string { return this._openedNode  };
	private _openedNode :string;

	/**
	 * Material UI trees need a TreeControl that will be in charge of controlling the tree's UI
	 */
	documentTreeControl:NestedTreeControl<DocumentTreeNode>;
	/**
	 * @see {@link DocumentTreeDataSource}
	 */
	documentTreeDataSource:DocumentTreeDataSource;

	/**
	 * Is the component focused?
	 */
	focused:boolean = false;

	// Icons
	readonly faCaretDown = faCaretDown;
	readonly faCaretRight = faCaretRight;
	readonly faFile = faFile;

	constructor(
		private element:ElementRef,
		private carbonldp:CarbonLDP,
		private documentTreeNodesQuery:DocumentTreeNodesQuery,
		private documentTreeNodesService:DocumentTreeNodesService,
	) {
		// Thanks to the following line we can "fake" a nested node structure. By passing a function that retrieves the children of a node
		// directly from the DocumentTreeNodesQuery, the TreeControl will traverse the tree as if the nodes were truly nested. And since
		// the output of that function is an observable, it will always be up-to-date with what the store has
		this.documentTreeControl = new NestedTreeControl<DocumentTreeNode>( node => this.documentTreeNodesQuery.selectChildren( node.id ) );
		this.documentTreeDataSource = new DocumentTreeDataSource( this.documentTreeControl, this.documentTreeNodesQuery, this.documentTreeNodesService );
	}

	/**
	 * Event listener to detect if the component lost focus
	 * @param event
	 */
	@HostListener( "document:click", [ "$event" ] )
	onClick( event:MouseEvent ) {
		if( ! event.target ) return;
		this.focused = this.element.nativeElement.contains( event.target );
	}


	async ngAfterViewInit() {
		// Initialize the tree by fetching the root document ("/") and then registering it as the root document in the {@link DocumentTreeNodesService}
		this.documentTreeNodesService.fetchOne( "/" )
		// We only need to do this for the first emitted value (since we know it won't change anymore)
			.pipe( first() )
			.subscribe( document => {
				this.documentTreeNodesService.updateRootNodes( [ document ] );
			} );
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
		// Clear selection to avoid the double click event from selecting the text of the nodes
		this.clearSelection();

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

	private clearSelection() {
		if( typeof window === "undefined" ) return;
		if( typeof window.getSelection === "undefined" ) return;

		const selection = window.getSelection();
		selection.removeAllRanges();
	}
}
