import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as Pointer from "carbonldp/Pointer";
import * as PersistedDocument from "carbonldp/PersistedDocument";
import * as HTTP from "carbonldp/HTTP";
import * as URI from "carbonldp/RDF/URI";
import * as SPARQL from "carbonldp/SPARQL";

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
	carbon:Carbon;

	jsTree:JSTree;
	$tree:JQuery;
	nodeChildren:JSTreeNode[] = [];
	private _selectedURI:string = "";

	set selectedURI( value:string ) {
		this._selectedURI = value;
		this.onSelectDocument.emit( this.selectedURI );
	}

	get selectedURI():string {
		return this._selectedURI;
	}

	@Input() refreshNode:EventEmitter<string> = new EventEmitter<string>();
	@Input() openNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onResolveUri:EventEmitter<string> = new EventEmitter<string>();
	@Output() onError:EventEmitter<HTTP.Errors.Error> = new EventEmitter<HTTP.Errors.Error>();
	@Output() onLoadingDocument:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onShowCreateChildForm:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onShowDeleteChildForm:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onShowCreateAccessPointForm:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSelectDocument:EventEmitter<string> = new EventEmitter<string>();

	constructor( element:ElementRef, carbon:Carbon ) {
		this.element = element;
		this.carbon = carbon;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$tree = this.$element.find( ".treeview.content" );
		this.$element.find( ".treeview.options .dropdown.button" ).dropdown( { action: "hide" } );
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

	getDocumentTree():Promise<PersistedDocument.Class> {
		return this.carbon.documents.get( "" ).then( ( [ resolvedRoot, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
			return resolvedRoot.refresh();
		} ).then( ( [ updatedRoot, updatedResponse ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
			this.nodeChildren.push( this.buildNode( this.carbon.baseURI, "default", true ) );
			this.renderTree();

			return updatedRoot;
		} ).catch( ( error:HTTP.Errors.Error ) => {
			console.error( error );
			this.onError.emit( error );
		} );
	}

	buildNode( uri:string, nodeType?:string, hasChildren?:boolean ):JSTreeNode {
		let node:JSTreeNode = {
			id: uri,
			text: this.getSlug( uri ),
			state: { "opened": false },
			children: [],
			data: {},
		};
		if( nodeType === "accesspoint" ) node.type = "accesspoint";
		if( hasChildren ) node.children.push( { "text": "Loading...", } );
		return node;
	}

	renderTree():void {
		this.jsTree = this.$tree.jstree( {
			"core": {
				"data": this.nodeChildren,
				"check_callback": true,
				"multiple": false,
			},
			"types": {
				"default": {
					"icon": "file outline icon",
				},
				"loading": {
					"icon": "spinner loading icon",
				},
				"accesspoint": {
					"icon": "selected radio icon",
					"a_attr": {
						"class": "accesspoint",
						"title": "The element is an AccessPoint, not a direct child of the selected document."
					}
				}
			},
			"plugins": [ "types", "wholerow" ],
		} ).jstree( true );
		this.$tree.on( "before_open.jstree", ( e:Event, data:any ):void => {
			let parentId:any = data.node.id;
			let parentNode:any = data.node;
			let position:string = "last";
			this.onBeforeOpenNode( parentId, parentNode, position );
		} );
		this.$tree.on( "select_node.jstree", ( e:Event, data:any ):void => {
			let node:any = data.node;
			this.selectedURI = node.id;
		} );
		this.$tree.on( "loaded.jstree", () => {
			this.jsTree.select_node( this.nodeChildren[ 0 ].id );
			this.jsTree.open_node( this.nodeChildren[ 0 ].id );
			if( this.nodeChildren && this.nodeChildren.length > 0 ) {
				this.onResolveUri.emit( <string>this.nodeChildren[ 0 ].id );
			}
		} );
		this.$tree.on( "dblclick.jstree", ".jstree-anchor", ( e:Event ) => {
			this.loadNode( e.target );
		} );
		this.$tree.on( "dblclick.jstree", ".jstree-wholerow", ( e:Event ) => {
			e.stopImmediatePropagation();
			let tmpEvt:JQueryEventObject = $.Event( "dblclick" );
			$( e.currentTarget ).closest( ".jstree-node" ).children( ".jstree-anchor" ).first().trigger( tmpEvt ).focus();
		} );
	}

	loadNode( obj:any ):void {
		let node:JSTreeNode = this.jsTree.get_node( obj );
		let parentId:any = node.id;
		let parentNode:any = node;
		let position:string = "last";
		this.onChange( parentId, parentNode, position );
	}

	onBeforeOpenNode( parentId:string, parentNode:any, position:string ):Promise<any> {
		let originalIcon:string = ! ! this.jsTree.settings.types[ parentNode.type ] ? this.jsTree.settings.types[ parentNode.type ].icon : "help icon";
		this.jsTree.set_icon( parentNode, this.jsTree.settings.types.loading.icon );
		return this.getNodeChildren( parentNode.id ).then( ( children:any[] ):void => {
			this.emptyNode( parentId );
			if( children.length > 0 ) {
				children.forEach( ( childNode:any ) => this.addChild( parentId, childNode, position ) );
			}
		} ).then( () => {
			this.jsTree.set_icon( parentNode, originalIcon );
		} );
	}

	onChange( parentId:string, node:any, position:string ):void {
		this.onBeforeOpenNode( parentId, node, position ).then( () => {
			if( ! this.jsTree.is_open( node ) ) {
				this.jsTree.open_node( node );
			}
			this.onResolveUri.emit( node.id );
		} );
	}

	addChild( parentId:string, node:any, position:string ):void {
		this.jsTree.create_node( parentId, node, position );
	}

	emptyNode( nodeId:string ):void {
		let $children:JQuery = this.jsTree.get_children_dom( nodeId );
		let childElements:Element[] = jQuery.makeArray( $children );
		while( childElements.length > 0 ) {
			this.jsTree.delete_node( childElements[ 0 ] );
			childElements.splice( 0, 1 );
		}
	}

	getNodeChildren( uri:string ):Promise<JSTreeNode[]> {
		let query:string = `SELECT ?p ?o ?p2 ?o2 
			WHERE{
				<__URI__> ?p ?o VALUES (?p) 
				{
					(<http://www.w3.org/ns/ldp#contains>)
					(<https://carbonldp.com/ns/v1/platform#accessPoint>)
				}
				OPTIONAL {
					?o ?p2 ?o2	VALUES (?p2) 
					{		
						(<http://www.w3.org/ns/ldp#contains>)	
						(<https://carbonldp.com/ns/v1/platform#accessPoint>)	
					}
				}
			}`;
		query = query.replace( "__URI__", uri );

		return this.carbon.documents.executeSELECTQuery( uri, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			let accessPoints:Map<string, boolean> = new Map<string, boolean>(),
				children:Map<string, boolean> = new Map<string, boolean>(),
				nodes:JSTreeNode[] = [];

			results.bindings.forEach(
				( binding:{ p:Pointer.Class, o:Pointer.Class, p2:Pointer.Class, o2:Pointer.Class } ) => {
					if( binding.p.id !== "http://www.w3.org/ns/ldp#contains" || (! ! binding.o2 && binding.o2.id.indexOf( "/agents/me/" ) !== - 1 ) ) return;
					children.set( binding.o.id, children.get( binding.o.id ) ? true : ! ! binding.p2 );
				} );
			results.bindings.forEach(
				( binding:{ p:Pointer.Class, o:Pointer.Class, p2:Pointer.Class, o2:Pointer.Class } ) => {
					if( binding.p.id !== "https://carbonldp.com/ns/v1/platform#accessPoint" ) return;
					accessPoints.set( binding.o.id, accessPoints.get( binding.o.id ) ? true : ! ! binding.p2 );
				} );


			children.forEach( ( hasChildren:boolean, id:string, children:Map<string, boolean> ) => {
				nodes.push( this.buildNode( id, "default", hasChildren ) );
			} );
			accessPoints.forEach( ( hasChildren:boolean, id:string, children:Map<string, boolean> ) => {
				nodes.push( this.buildNode( id, "accesspoint", hasChildren ) );
			} );

			return nodes;
		} ).catch( ( error ) => {
			console.error( error );
			return [];
		} );
	}


	getSlug( pointer:Pointer.Class | string ):string {
		if( typeof pointer !== "string" ) return ( <Pointer.Class>pointer ).id;
		return URI.Util.getSlug( <string>pointer );
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

}

export interface JSTreeNode {
	id:string,
	text:any,
	state:any,
	children:any,
	data:any,
	type?:any
}
