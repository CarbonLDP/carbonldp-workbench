import { first } from "rxjs/operators";

import { produce } from "immer";

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { NestedTreeControl } from "@angular/cdk/tree";

import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-regular-svg-icons";

import { CarbonLDP } from "carbonldp";
import { Pointer } from "carbonldp/Pointer";
import { Errors } from "carbonldp/HTTP";

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
	// FIXME: Review i/o
	@Input() refreshNodes:EventEmitter<string | string[]> = new EventEmitter<string | string[]>();
	@Input() openNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onResolveUri:EventEmitter<string> = new EventEmitter<string>();
	@Output() onError:EventEmitter<Errors.HTTPError> = new EventEmitter<Errors.HTTPError>();
	@Output() onLoadingDocument:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onShowCreateChildForm:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onShowDeleteChildForm:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onShowCreateAccessPointForm:EventEmitter<boolean> = new EventEmitter<boolean>();

	@Output() onSelectDocuments:EventEmitter<string[]> = new EventEmitter<string[]>();
	set selectedNodes( selectedNodes:string[] ) {
		this._selectedNodes = selectedNodes;
		this.onSelectDocuments.emit( produce( this._selectedNodes, state => {} ) );
	}
	get selectedNodes():string[] { return this._selectedNodes };
	private _selectedNodes:string[] = [];

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

		this.documentTreeControl.toggle( node );
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

	private clearSelection() {
		if( typeof window === "undefined" ) return;
		if( typeof window.getSelection === "undefined" ) return;

		const selection = window.getSelection();
		selection.removeAllRanges();
	}
}

// @Component( {
// 	selector: "app-document-tree-view",
// 	templateUrl: "./document-tree-view.component.html",
// 	styleUrls: [ "./document-tree-view.component.scss" ],
// 	providers: [
// 		DocumentsStore,
// 		DocumentsService,
// 	],
// } )
// export class DocumentTreeViewComponent implements AfterViewInit {
// 	@Input() refreshNodes:EventEmitter<string | string[]> = new EventEmitter<string | string[]>();
// 	@Input() openNode:EventEmitter<string> = new EventEmitter<string>();
// 	@Output() onResolveUri:EventEmitter<string> = new EventEmitter<string>();
// 	@Output() onError:EventEmitter<Errors.HTTPError> = new EventEmitter<Errors.HTTPError>();
// 	@Output() onLoadingDocument:EventEmitter<boolean> = new EventEmitter<boolean>();
// 	@Output() onShowCreateChildForm:EventEmitter<boolean> = new EventEmitter<boolean>();
// 	@Output() onShowDeleteChildForm:EventEmitter<boolean> = new EventEmitter<boolean>();
// 	@Output() onShowCreateAccessPointForm:EventEmitter<boolean> = new EventEmitter<boolean>();
// 	@Output() onSelectDocuments:EventEmitter<Array<string>> = new EventEmitter<Array<string>>();
//
// 	public sortAscending:boolean = true;
// 	public orderBy:OrderBy.CREATED | OrderBy.MODIFIED | OrderBy.SLUG = OrderBy.CREATED;
// 	public orderOptions:typeof OrderBy = OrderBy;
//
// 	jsTree:JSTree;
// 	$tree:JQuery;
// 	nodeChildren:JSTreeNode[] = [];
// 	canDelete:boolean = true;
//
// 	set selectedURIs( value:string[] ) {
// 		this._selectedURIs = value;
// 		this.onSelectDocuments.emit( this.selectedURIs );
// 	}
// 	get selectedURIs():string[] {return this._selectedURIs;}
// 	private _selectedURIs:string[] = [ "" ];
//
// 	private $element:JQuery;
//
// 	treeControl:NestedTreeControl<DocumentTreeNode>;
// 	dataSource:DocumentTreeDataSource;
//
// 	constructor(
// 		private element:ElementRef,
// 		private carbonldp:CarbonLDP,
// 		private documentsService:DocumentsService,
// 	) {
// 		this.treeControl = new NestedTreeControl<DocumentTreeNode>( documentsService.getChildren.bind( documentsService ) );
// 		this.dataSource = new DocumentTreeDataSource(this.treeControl, documentsService);
// 	}
//
// 	async ngAfterViewInit() {
// 		await this.documentsService.get( "/" );
//
// 		// FIXME: Remove old code
//
// 		this.$element = $( this.element.nativeElement );
// 		this.$tree = this.$element.find( ".tree-view-content" );
//
// 		// Initialize Semantic UI elements
// 		this.initializeOptionsButton();
// 		this.initializeSortByButton();
//
// 		this.refreshNodes.subscribe( this.handleRefreshNodes.bind( this ) );
// 		this.openNode.subscribe( this.handleOpenNode.bind( this ) );
//
// 		this.onLoadingDocument.emit( true );
//
// 		try {
// 			await this.getDocumentTree();
// 		} catch( error ) {
// 			this.onError.emit( error );
// 			return;
// 		} finally {
// 			this.onLoadingDocument.emit( false );
// 		}
// 	}
//
// 	async getDocumentTree() {
// 		const document = await this.carbonldp.documents.$get( { ensureLatest: true } );
//
// 		const isRequiredSystemDocument:boolean = document.types.findIndex( ( type:string ) => type === `${C.namespace}RequiredSystemDocument` ) !== - 1;
//
// 		this.nodeChildren.push( this.buildNode( this.carbonldp.baseURI, JSTreeNodeType.DEFAULT, true, isRequiredSystemDocument ) );
//
// 		this.renderTree();
// 	}
//
// 	buildNode( uri:string, nodeType?:string, hasChildren?:boolean, isRequiredSystemDocument?:boolean, created?:Date, modified?:Date ):JSTreeNode {
// 		let node:JSTreeNode = {
// 			id: uri,
// 			text: this.getSlug( uri ),
// 			state: { "opened": false },
// 			children: hasChildren,
// 			data: {},
// 		};
// 		node.type = (nodeType === JSTreeNodeType.ACCESS_POINT) ? JSTreeNodeType.ACCESS_POINT : JSTreeNodeType.DEFAULT;
// 		node.data.id = uri;
// 		node.data.isRequiredSystemDocument = ! ! isRequiredSystemDocument;
// 		node.data.created = created;
// 		node.data.modified = modified;
// 		return node;
// 	}
//
// 	renderTree():void {
// 		this.jsTree = this.$tree.jstree( {
// 			"core": {
// 				"data": this.resolveNodeData.bind( this ),
// 				"check_callback": true,
// 				"multiple": true,
// 			},
// 			"types": {
// 				"loading": {
// 					"icon": "spinner loading icon",
// 				},
// 				[ JSTreeNodeType.DEFAULT ]: {
// 					"icon": "file outline icon",
// 				},
// 				[ JSTreeNodeType.ACCESS_POINT ]: {
// 					"icon": "selected radio icon",
// 					"a_attr": {
// 						"class": "accesspoint",
// 						"title": "The element is an AccessPoint, not a direct child of the selected document."
// 					}
// 				}
// 			},
// 			"sort": this.sort.bind( this ),
// 			"plugins": [ "types", "wholerow", "sort" ],
// 		} ).jstree( true );
// 		this.$tree.on( "select_node.jstree", (( e:Event, data:any ):void => {
// 			let node:any = data.node;
// 			this.selectedURIs = data.selected;
// 			this.canDelete = node.data.isRequiredSystemDocument
// 				? false
// 				: data.selected.length === 1
// 					? true
// 					: this.canDelete;
// 		}) as any );
// 		this.$tree.on( "loaded.jstree", () => {
// 			this.jsTree.select_node( this.nodeChildren[ 0 ].id );
// 			this.jsTree.open_node( this.nodeChildren[ 0 ].id );
// 			this.onResolveUri.emit( <string>this.nodeChildren[ 0 ].id );
// 		} );
// 		this.$tree.on( "dblclick.jstree", ( e:Event ) => {
// 			this.loadNode( e.target );
// 		} );
// 	}
//
// 	handleRefreshNodes( nodeIDs:string | string[] ) {
// 		nodeIDs = ! Array.isArray( nodeIDs ) ? [ nodeIDs ] : nodeIDs;
// 		// Remove duplicates
// 		nodeIDs = Array.from( new Set( nodeIDs ) );
//
// 		for( let nodeID of nodeIDs ) {
// 			this.loadNode( nodeID );
// 		}
//
// 		this.jsTree.select_node( nodeIDs );
//
// 		this.selectedURIs = nodeIDs;
// 	}
//
// 	handleOpenNode( nodeID:string ) {
// 		this.jsTree.select_node( nodeID );
// 	}
//
// 	loadNode( obj:any ):void {
// 		let node:JSTreeNode = this.jsTree.get_node( obj );
// 		this.jsTree.refresh_node( node );
// 		this.jsTree.open_node( node );
// 		this.onResolveUri.emit( node.id );
// 	}
//
// 	resolveNodeData( node:JSTreeNode, callBack:( children:JSTreeNode[] ) => {} ):void {
// 		// If the node doesn't have an id, load the first node, else load node's children
// 		if( node.id === "#" ) {
// 			callBack( this.nodeChildren );
// 		} else {
// 			this.getNodeChildren( node.id )
// 				.then( ( children:JSTreeNode[] ) => {
// 					callBack( children );
// 				} );
// 		}
// 	}
//
// 	getNodeChildren( uri:string ):Promise<JSTreeNode[]> {
// 		let query:string = `
// 			PREFIX c:<${C.namespace}>
// 			PREFIX ldp:<${LDP.namespace}>
//
// 			SELECT (STR(?p) AS ?parentPredicate) (STR(?s) AS ?subject) (STR(?p2) AS ?predicate) ?object ?isRequiredSystemDocument
// 			WHERE {
// 			    <${uri}> ?p ?s
// 			    VALUES (?p) {
// 			        (ldp:contains)
// 			        (c:accessPoint)
// 			        (c:created)
// 			        (c:modified)
// 			    }
// 			    OPTIONAL {
// 			        ?s ?p2 ?object
// 			        VALUES (?p2) {
// 			            (ldp:contains)
// 			            (c:accessPoint)
// 				        (c:created)
// 				        (c:modified)
// 			        }
// 			        BIND( EXISTS{ ?s a c:RequiredSystemDocument } AS ?isRequiredSystemDocument )
// 			    }
// 			}
// 		`;
// 		return this.carbonldp.documents.$executeSELECTQuery( uri, query ).then( ( results:SPARQLSelectResults ) => {
// 			let nodes:Map<string, JSTreeNode> = new Map<string, JSTreeNode>();
//
// 			results.bindings.forEach( ( binding:SPARQLBindingObject & BindingResult ) => this.addBindingToNodes( nodes, binding ) );
//
// 			return Array.from( nodes.values() );
// 		} ).catch( ( error ) => {
// 			return Promise.reject( error );
// 		} );
// 	}
//
// 	refreshSelectedNodes():void {
// 		for( let selectedURI of this.selectedURIs ) {
// 			this.jsTree.refresh_node( selectedURI );
// 		}
// 	}
//
// 	getSlug( node:Document | string ):string {
// 		if( typeof node === "string" ) return URI.getSlug( node );
// 		return (<Document>node).$id;
// 	}
//
// 	showCreateChildForm():void {
// 		this.onShowCreateChildForm.emit( true );
// 	}
//
// 	showCreateAccessPointForm():void {
// 		this.onShowCreateAccessPointForm.emit( true );
// 	}
//
// 	showDeleteChildForm():void {
// 		this.onShowDeleteChildForm.emit( true );
// 	}
//
// 	changeSort( ascending:boolean ):void {
// 		this.sortAscending = ascending;
// 		this.reorderBranch();
// 	}
//
// 	changeOrderBy( orderBy:OrderBy.CREATED | OrderBy.MODIFIED | OrderBy.SLUG ):void {
// 		this.orderBy = orderBy;
// 		this.reorderBranch();
// 	}
//
// 	reorderBranch():void {
// 		for( let selectedURI of this.selectedURIs ) {
// 			let node:JSTreeNode = this.jsTree.get_node( selectedURI );
//
// 			this.jsTree.sort( node, true );
// 			this.jsTree.redraw_node( node, true, false, false );
// 		}
// 	}
//
// 	private sort( nodeAId?:string, nodeBId?:string ):number {
//
// 		let nodeA:JSTreeNode = this.jsTree.get_node( nodeAId ),
// 			nodeB:JSTreeNode = this.jsTree.get_node( nodeBId );
//
// 		if( typeof nodeA.data[ this.orderBy ] === "string" && typeof nodeB.data[ this.orderBy ] === "string" ) {
// 			if( nodeA.data[ this.orderBy ].toLowerCase() > nodeB.data[ this.orderBy ].toLowerCase() ) return this.sortAscending ? 1 : - 1;
// 			if( nodeA.data[ this.orderBy ].toLowerCase() < nodeB.data[ this.orderBy ].toLowerCase() ) return this.sortAscending ? - 1 : 1;
// 		} else {
// 			if( nodeA.data[ this.orderBy ] > nodeB.data[ this.orderBy ] ) return this.sortAscending ? 1 : - 1;
// 			if( nodeA.data[ this.orderBy ] < nodeB.data[ this.orderBy ] ) return this.sortAscending ? - 1 : 1;
// 		}
// 		return 0;
// 	}
//
// 	private initializeOptionsButton():void {
// 		this.$element.find( ".tree-view-optionsButton" ).dropdown( { action: "hide" } );
// 	}
//
// 	private initializeSortByButton():void {
// 		this.$element.find( ".tree-view-sortByButton" ).dropdown();
// 	}
//
// 	private addBindingToNodes( nodes:Map<string, JSTreeNode>, binding:BindingResult ):void {
//
// 		if( ! binding.hasOwnProperty( "subject" ) ||
// 			! binding.hasOwnProperty( "predicate" ) ||
// 			binding.subject.indexOf( "/users/me/" ) !== - 1 ) return;
//
// 		let node:JSTreeNode,
// 			created:Date,
// 			modified:Date,
// 			hasChildren:boolean,
// 			type:JSTreeNodeType.DEFAULT | JSTreeNodeType.ACCESS_POINT,
// 			isRequiredSystemDocument:boolean = binding.isRequiredSystemDocument;
//
// 		switch( binding.predicate ) {
// 			case C.created:
// 				created = <Date>binding.object;
// 				break;
// 			case C.modified:
// 				modified = <Date>binding.object;
// 				break;
// 			case LDP.contains:
// 				hasChildren = ! ! binding.object;
// 				break;
// 		}
//
// 		// The parentPredicate indicates if the node is an Access Point or a regular node
// 		switch( binding.parentPredicate ) {
// 			case C.accessPoint:
// 				type = JSTreeNodeType.ACCESS_POINT;
// 				break;
// 			case LDP.contains:
// 				type = JSTreeNodeType.DEFAULT;
// 				break;
// 		}
//
// 		if( nodes.has( binding.subject ) ) {
//
// 			node = nodes.get( binding.subject );
// 			node.type = type ? type : node.type;
// 			node.data.id = node.id;
// 			node.data.created = created ? created : node.data.created;
// 			node.data.modified = modified ? modified : node.data.modified;
// 			node.data.hasChildren = hasChildren;
// 			node.data.isRequiredSystemDocument = isRequiredSystemDocument;
// 		} else {
//
// 			node = this.buildNode( binding.subject, type, hasChildren, isRequiredSystemDocument, created, modified );
// 		}
// 		nodes.set( binding.subject, node );
// 	}
// }

export enum OrderBy {
	SLUG = "id",
	CREATED = "created",
	MODIFIED = "modified",
}

interface BindingResult {
	parentPredicate:string,
	subject:string,
	predicate:string,
	object:Pointer | Date,
	isRequiredSystemDocument:boolean
}

export interface JSTreeNode {
	id:string;
	text:any;
	state:any;
	children:any;
	data:any;
	type?:any;
}
