import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Pointer } from "carbonldp/Pointer";
import { Document } from "carbonldp/Document";
import { Errors } from "carbonldp/HTTP";
import { URI } from "carbonldp/RDF/URI";
import { SPARQLBindingObject, SPARQLSelectResults } from "carbonldp/SPARQL/SelectResults";
import { C, LDP } from "carbonldp/Vocabularies";

import * as $ from "jquery";
import "semantic-ui/semantic";

import "jstree/dist/jstree.min";
import "!style-loader!css-loader!jstree/dist/themes/default/style.min.css";

@Component( {
	selector: "cw-document-treeview",
	templateUrl: "./document-tree-view.component.html",
	styleUrls: [ "./document-tree-view.component.scss" ],
} )

export class DocumentTreeViewComponent implements AfterViewInit {
	element:ElementRef;
	$element:JQuery;
	carbonldp:CarbonLDP;

	jsTree:JSTree;
	$tree:JQuery;
	nodeChildren:JSTreeNode[] = [];
	canDelete:boolean = true;
	page:number = 1;
	displayCurrentPage:number = 1;
	elementsPerPage:number = 10;
	nodePagination:Map<string, any> = new Map<string, any>();

	private _selectedURI:string = "";
	private _selectedNode:JSTreeNode;

	set selectedURI( value:string ) {
		this._selectedURI = value;
		this.onSelectDocument.emit( this.selectedURI );
	}

	get selectedURI():string {
		return this._selectedURI;
	}

	set selectedNode( node:JSTreeNode ) {
		this._selectedNode = node;
	}

	get selectedNode():JSTreeNode {
		return this._selectedNode;
	}

	public sortAscending:boolean = true;
	public orderBy:OrderBy.CREATED | OrderBy.MODIFIED | OrderBy.SLUG = OrderBy.CREATED;
	public orderOptions:typeof OrderBy = OrderBy;

	@Input() refreshNode:EventEmitter<string> = new EventEmitter<string>();
	@Input() openNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onResolveUri:EventEmitter<string> = new EventEmitter<string>();
	@Output() onError:EventEmitter<Errors.HTTPError> = new EventEmitter<Errors.HTTPError>();
	@Output() onLoadingDocument:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onShowCreateChildForm:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onShowDeleteChildForm:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onShowCreateAccessPointForm:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSelectDocument:EventEmitter<string> = new EventEmitter<string>();

	constructor( element:ElementRef, carbonldp:CarbonLDP ) {
		this.element = element;
		this.carbonldp = carbonldp;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$tree = this.$element.find( ".treeview-content" );
		this.initializeOptionsButton();
		this.initalizeSortByButton();
		this.onLoadingDocument.emit( true );
		this.getDocumentTree().then( () => {
			this.onLoadingDocument.emit( false );
		} );
		this.refreshNode.subscribe( ( nodeId:string ) => {
			this.jsTree.select_node( nodeId );
			this.loadNode( nodeId );
		} );
		this.openNode.subscribe( ( nodeId:string ) => {
			this.jsTree.select_node( nodeId );
		} );
	}

	getDocumentTree():Promise<Document | void> {
		return this.carbonldp.documents.$get( "" ).then( ( resolvedRoot:Document ) => {
			return resolvedRoot.$refresh();
		} ).then( ( updatedRoot:Document ) => {

			let isRequiredSystemDocument:boolean = updatedRoot.types.findIndex( ( type:string ) => type === `${C.namespace}RequiredSystemDocument` ) !== - 1;

			this.nodeChildren.push( this.buildNode( this.carbonldp.baseURI, JSTreeNodeType.DEFAULT, true, isRequiredSystemDocument ) );

			this.renderTree();

			return updatedRoot;
		} ).catch( ( error:Errors.HTTPError ) => {
			this.onError.emit( error );
		} );
	}

	buildNode( uri:string, nodeType?:string, hasChildren?:boolean, isRequiredSystemDocument?:boolean, created?:Date, modified?:Date ):JSTreeNode {
		let node:JSTreeNode = {
			id: uri,
			text: this.getSlug( uri ),
			state: { "opened": false },
			children: ! ! hasChildren ? hasChildren : false,
			data: {},
		};
		node.type = (nodeType === JSTreeNodeType.ACCESS_POINT) ? JSTreeNodeType.ACCESS_POINT : JSTreeNodeType.DEFAULT;
		node.data.id = uri;
		node.data.isRequiredSystemDocument = ! ! isRequiredSystemDocument;
		node.data.created = created;
		node.data.modified = modified;

		this.nodePagination.set( uri, {
			"currentPage": 1,
			"childElements": 0
		} );
		return node;
	}

	renderTree():void {
		this.jsTree = this.$tree.jstree( {
			"core": {
				"data": this.resolveNodeData.bind( this ),
				"check_callback": true,
				"multiple": false,
			},
			"types": {
				"loading": {
					"icon": "spinner loading icon",
				},
				[ JSTreeNodeType.DEFAULT ]: {
					"icon": "file outline icon",
				},
				[ JSTreeNodeType.ACCESS_POINT ]: {
					"icon": "selected radio icon",
					"a_attr": {
						"class": "accesspoint",
						"title": "The element is an AccessPoint, not a direct child of the selected document."
					}
				}
			},
			"sort": this.sort.bind( this ),
			"plugins": [ "types", "wholerow", "sort" ],
		} ).jstree( true );
		this.$tree.on( "select_node.jstree", (( e:Event, data:any ):void => {
			let node:any = data.node;
			this.selectedURI = node.id;
			this.selectedNode = node;
			this.page = this.nodePagination.get( node.id ).currentPage;
			this.displayCurrentPage = this.page;
			this.canDelete = ! node.data.isRequiredSystemDocument;
		}) as any );
		this.$tree.on( "loaded.jstree", () => {
			this.jsTree.select_node( this.nodeChildren[ 0 ].id );
			this.jsTree.open_node( this.nodeChildren[ 0 ].id );
			this.onResolveUri.emit( <string>this.nodeChildren[ 0 ].id );
		} );
		this.$tree.on( "dblclick.jstree", ( e:Event ) => {
			this.loadNode( e.target );
		} );
		this.$tree.on( "after_open.jstree", ( e:Event ) => {
			this.selectedNode = this.jsTree.get_node( this.selectedNode );
		} );
		this.$tree.on( "before_close.jstree", ( e:Event ) => {
			this.selectedNode = this.jsTree.get_node( this.selectedNode );
		} );
	}

	loadNode( obj:any ):void {
		let node:JSTreeNode = this.jsTree.get_node( obj );
		this.jsTree.refresh_node( node );
		this.jsTree.open_node( node );
		this.onResolveUri.emit( node.id );
		node.state.opened = true;
	}

	resolveNodeData( node:JSTreeNode, callBack:( children:JSTreeNode[] ) => {} ):void {
		// If the node doesn't have an id, load the first node, else load node's children
		if( node.id === "#" ) {
			callBack( this.nodeChildren );
		} else {
			this.getNodeChildren( node.id, this.page )
				.then( ( children:JSTreeNode[] ) => {
					callBack( children );
				} );
		}
	}

	getNodeChildren( uri:string, page:number ):Promise<JSTreeNode[]> {
		let query:string = `
			PREFIX c:<${C.namespace}>
			PREFIX ldp:<${LDP.namespace}>
			
			SELECT ?nChild (STR(?p) AS ?parentPredicate) (STR(?child) AS ?subject) (STR(?p2) AS ?predicate) (?childInfo as ?object) ?isRequiredSystemDocument
			WHERE {
				{
					select ?child ?p where {
						<${uri}> ?p ?child
						values (?p) {
							(ldp:contains)
						}
			
						}limit ${ (page) * this.elementPerPage} offset ${ page > 1 ? ((page - 1) * this.elementPerPage) + 1 : 0}
					}
					UNION
					{
						select  ?child ?p where {
							<${uri}> ?p ?child.
							values(?p){
								(c:accessPoint)
								(c:created)
								(c:modified)
							}
						}
			
					}
					Optional{
						?child ?p2 ?childInfo
						values(?p2) {
							(c:accessPoint)
							(c:created)
							(c:modified)
							(ldp:contains)
						}
						BIND( EXISTS{ ?child a c:RequiredSystemDocument } AS ?isRequiredSystemDocument )
					}
					{
						SELECT (COUNT(?childs) as ?nChild) where {
						  <${uri}> ?p ?childs
						  values (?p) {
							  (ldp:contains)
						  }
					    }
					}
				}
		`;

		return this.carbonldp.documents.$executeSELECTQuery( uri, query ).then( ( results:SPARQLSelectResults ) => {
			let nodes:Map<string, JSTreeNode> = new Map<string, JSTreeNode>();

			this.nodePagination.get( uri ).childElements = ! ! results.bindings[ 0 ] ? results.bindings[ 0 ].nChild : 0;
			results.bindings.forEach( ( binding:SPARQLBindingObject & BindingResult ) => this.addBindingToNodes( nodes, binding ) );

			return Array.from( nodes.values() );
		} ).catch( ( error ) => {
			return Promise.reject( error );
		} );
	}


	nextPage() {
		this.page = this.page + 1;
		this.displayCurrentPage = this.page;
		let obj = this.selectedNode;
		let node:JSTreeNode = this.jsTree.get_node( obj );
		this.jsTree.refresh_node( node );
		this.jsTree.open_node( node );
		this.onResolveUri.emit( node.id );

		this.nodePagination.get( node.id ).currentPage = this.page;
	}

	previousPage() {
		this.page = this.page - 1;
		this.displayCurrentPage = this.page;
		let obj = this.selectedNode;
		let node:JSTreeNode = this.jsTree.get_node( obj );
		this.jsTree.refresh_node( node );
		this.jsTree.open_node( node );
		this.onResolveUri.emit( node.id );
		this.nodePagination.get( node.id ).currentPage = this.page;
	}

	changePageByNumber() {
		if( ! this.selectedNode || ! this.selectedNode.state.opened ) {
			this.displayCurrentPage = this.page;
			return false;
		} else if( this.displayCurrentPage <= this.availableNodePages() ) {
			this.page = this.displayCurrentPage;
			let obj = this.selectedNode;
			let node:JSTreeNode = this.jsTree.get_node( obj );
			this.jsTree.refresh_node( node );
			this.jsTree.open_node( node );
			this.onResolveUri.emit( node.id );
			this.nodePagination.get( node.id ).currentPage = this.page;
		} else {
			this.displayCurrentPage = this.page;
		}
	}

	availableNodePages():number {
		let numOfChilds:number = this.nodePagination.get( this.selectedNode.id ).childElements;
		return Math.ceil( numOfChilds / this.elementPerPage );
	}

	hasNext():boolean {
		if( ! this.selectedNode || ! this.selectedNode.state.opened )
			return false;
		let currentPage:number = this.nodePagination.get( this.selectedNode.id ).currentPage;
		let numOfChilds:number = this.nodePagination.get( this.selectedNode.id ).childElements;

		return currentPage * this.elementPerPage < numOfChilds;
	}

	hasPrev():boolean {
		if( ! this.selectedNode || ! this.selectedNode.state.opened )
			return false;
		let currentPage:number = this.nodePagination.get( this.selectedNode.id ).currentPage;
		return currentPage > 1;
	}

	refreshSelectedNode():void {
		this.jsTree.refresh_node( this.selectedURI );
	}

	getSlug( node:Document | string ):string {
		if( typeof node === "string" ) return URI.getSlug( node );
		return (<Document>node).$id;
	}

	showCreateChildForm():void {
		this.onShowCreateChildForm.emit( true );
	}

	showCreateAccessPointForm():void {
		this.onShowCreateAccessPointForm.emit( true );
	}

	showDeleteChildForm():void {
		this.onShowDeleteChildForm.emit( true );
	}

	changeSort( ascending:boolean ):void {
		this.sortAscending = ascending;
		this.reorderBranch();
	}

	changeOrderBy( orderBy:OrderBy.CREATED | OrderBy.MODIFIED | OrderBy.SLUG ):void {
		this.orderBy = orderBy;
		this.reorderBranch();
	}

	reorderBranch():void {
		let node:JSTreeNode = this.jsTree.get_node( this.selectedURI );

		this.jsTree.sort( node, true );
		this.jsTree.redraw_node( node, true, false, false );
	}

	private sort( nodeAId?:string, nodeBId?:string ):number {

		let nodeA:JSTreeNode = this.jsTree.get_node( nodeAId ),
			nodeB:JSTreeNode = this.jsTree.get_node( nodeBId );

		if( typeof nodeA.data[ this.orderBy ] === "string" && typeof nodeB.data[ this.orderBy ] === "string" ) {
			if( nodeA.data[ this.orderBy ].toLowerCase() > nodeB.data[ this.orderBy ].toLowerCase() ) return this.sortAscending ? 1 : - 1;
			if( nodeA.data[ this.orderBy ].toLowerCase() < nodeB.data[ this.orderBy ].toLowerCase() ) return this.sortAscending ? - 1 : 1;
		} else {
			if( nodeA.data[ this.orderBy ] > nodeB.data[ this.orderBy ] ) return this.sortAscending ? 1 : - 1;
			if( nodeA.data[ this.orderBy ] < nodeB.data[ this.orderBy ] ) return this.sortAscending ? - 1 : 1;
		}
		return 0;
	}

	private initializeOptionsButton():void {
		this.$element.find( ".treeview-optionsButton" ).dropdown( { action: "hide" } );
	}

	private initalizeSortByButton():void {
		this.$element.find( ".treeview-sortByButton" ).dropdown();
	}

	private addBindingToNodes( nodes:Map<string, JSTreeNode>, binding:BindingResult ):void {

		if( ! binding.hasOwnProperty( "subject" ) ||
			! binding.hasOwnProperty( "predicate" ) ||
			binding.subject.indexOf( "/users/me/" ) !== - 1 ) return;

		let node:JSTreeNode,
			created:Date,
			modified:Date,
			hasChildren:boolean,
			type:JSTreeNodeType.DEFAULT | JSTreeNodeType.ACCESS_POINT,
			isRequiredSystemDocument:boolean = binding.isRequiredSystemDocument;

		switch( binding.predicate ) {
			case C.created:
				created = <Date>binding.object;
				break;
			case C.modified:
				modified = <Date>binding.object;
				break;
			case LDP.contains:
				hasChildren = ! ! binding.object;
				break;
		}

		// The parentPredicate indicates if the node is an Access Point or a regular node
		switch( binding.parentPredicate ) {
			case C.accessPoint:
				type = JSTreeNodeType.ACCESS_POINT;
				break;
			case LDP.contains:
				type = JSTreeNodeType.DEFAULT;
				break;
		}

		if( nodes.has( binding.subject ) ) {
			node = nodes.get( binding.subject );
			node.type = type ? type : node.type;
			node.data.id = node.id;
			node.data.created = created ? created : node.data.created;
			node.data.modified = modified ? modified : node.data.modified;
			node.data.hasChildren = hasChildren;
			node.data.isRequiredSystemDocument = isRequiredSystemDocument;
			node.children = hasChildren || node.children;
		} else {
			node = this.buildNode( binding.subject, type, hasChildren, isRequiredSystemDocument, created, modified );
		}
		nodes.set( binding.subject, node );
	}
}

export enum OrderBy {
	SLUG = "id",
	CREATED = "created",
	MODIFIED = "modified",
}

enum JSTreeNodeType {
	DEFAULT = "default",
	ACCESS_POINT = "accesspoint"
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
