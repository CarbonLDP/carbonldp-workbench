import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as Pointer from "carbonldp/Pointer";
import * as PersistedDocument from "carbonldp/PersistedDocument";
import * as HTTP from "carbonldp/HTTP";
import * as URI from "carbonldp/RDF/URI";
import * as SPARQL from "carbonldp/SPARQL";
import { C, LDP } from "carbonldp/NS";

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
	canDelete:boolean = true;

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

	getDocumentTree():Promise<PersistedDocument.Class | void> {
		return this.carbon.documents.get( "" ).then( ( [ resolvedRoot, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
			return resolvedRoot.refresh();
		} ).then( ( [ updatedRoot, updatedResponse ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {

			let isRequiredSystemDocument:boolean = updatedRoot.types.findIndex( ( type:string ) => type === `${C.namespace}RequiredSystemDocument` ) !== - 1;

			this.nodeChildren.push( this.buildNode( this.carbon.baseURI, "default", true, isRequiredSystemDocument ) );

			this.renderTree();

			return updatedRoot;
		} ).catch( ( error:HTTP.Errors.Error ) => {
			this.onError.emit( error );
		} );
	}

	buildNode( uri:string, nodeType?:string, hasChildren?:boolean, isRequiredSystemDocument?:boolean ):JSTreeNode {
		let node:JSTreeNode = {
			id: uri,
			text: this.getSlug( uri ),
			state: { "opened": false },
			children: hasChildren,
			data: {},
		};
		if( nodeType === "accesspoint" ) node.type = "accesspoint";
		node.data.isRequiredSystemDocument = ! ! isRequiredSystemDocument;
		return node;
	}

	renderTree():void {
		this.jsTree = this.$tree.jstree( {
			"core": {
				"data": ( node:JSTreeNode, childrenBuilder ) => {
					// If the node doesn't have and id, load the first node, else load node's children
					if( node.id === "#" ) {
						childrenBuilder( this.nodeChildren );
					} else {
						this.getNodeChildren( node.id ).then( ( children:JSTreeNode[] ) => {
							childrenBuilder( children );
						} );
					}
				},
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
		this.$tree.on( "select_node.jstree", ( e:Event, data:any ):void => {
			let node:any = data.node;
			this.selectedURI = node.id;
			this.canDelete = ! node.data.isRequiredSystemDocument;
		} );
		this.$tree.on( "loaded.jstree", () => {
			this.jsTree.select_node( this.nodeChildren[ 0 ].id );
			this.jsTree.open_node( this.nodeChildren[ 0 ].id );
			this.onResolveUri.emit( <string>this.nodeChildren[ 0 ].id );
		} );
		this.$tree.on( "dblclick.jstree", ( e:Event ) => {
			this.loadNode( e.target );
		} );
	}

	loadNode( obj:any ):void {
		let node:JSTreeNode = this.jsTree.get_node( obj );
		let parentId:any = node.id;
		let parentNode:any = node;
		let position:string = "last";
		this.jsTree.open_node( node );
		this.jsTree.refresh_node( node );
		this.onResolveUri.emit( node.id );
	}

	getNodeChildren( uri:string ):Promise<JSTreeNode[]> {
		let query:string = `
			PREFIX c:<https://carbonldp.com/ns/v1/platform#>
			PREFIX ldp:<http://www.w3.org/ns/ldp#>
			
			SELECT ?p ?o ?p2 ?o2 ?isRequiredSystemDocument
			WHERE{
			    <${uri}> ?p ?o 
			    VALUES (?p) {
			        (ldp:contains)
			        (c:accessPoint)
			    }
			    OPTIONAL {
			        ?o ?p2 ?o2    
			        VALUES (?p2) {
			            (ldp:contains)
			            (c:accessPoint)
			        }
			        BIND( EXISTS{ ?o a c:RequiredSystemDocument } AS ?isRequiredSystemDocument )
			    }
			}
		`;
		return this.carbon.documents.executeSELECTQuery( uri, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			let accessPoints:Map<string, PreJSTreeNode> = new Map<string, PreJSTreeNode>(),
				children:Map<string, PreJSTreeNode> = new Map<string, PreJSTreeNode>(),
				nodes:JSTreeNode[] = [];

			results.bindings.forEach(
				( binding:{ p:Pointer.Class, o:Pointer.Class, p2:Pointer.Class, o2:Pointer.Class, isRequiredSystemDocument:boolean } ) => {

					// Do not include any node that is /users/me
					if( ! ! binding.o2 && binding.o2.id.indexOf( "/users/me/" ) !== - 1 ) return;

					switch( binding.p.id ) {
						case LDP.Predicate.contains:
							children.set( binding.o.id, {
								hasChildren: children.get( binding.o.id ) ? true : ! ! binding.p2,
								isRequiredSystemDocument: ! ! binding.isRequiredSystemDocument
							} );
							break;
						case C.Predicate.accessPoint:
							accessPoints.set( binding.o.id, {
								hasChildren: children.get( binding.o.id ) ? true : ! ! binding.p2,
								isRequiredSystemDocument: ! ! binding.isRequiredSystemDocument
							} );
							break;
					}
				} );

			children.forEach( ( child:PreJSTreeNode, id:string ) => {
				nodes.push( this.buildNode( id, "default", child.hasChildren, child.isRequiredSystemDocument ) );
			} );
			accessPoints.forEach( ( accessPoint:PreJSTreeNode, id:string ) => {
				nodes.push( this.buildNode( id, "accesspoint", accessPoint.hasChildren, accessPoint.isRequiredSystemDocument ) );
			} );

			return nodes;
		} ).catch( ( error ) => {
			return Promise.reject( error );
		} );
	}


	getSlug( pointer:Pointer.Class | string ):string {
		if( typeof pointer !== "string" ) return (<Pointer.Class>pointer).id;
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

interface PreJSTreeNode {
	hasChildren:boolean,
	isRequiredSystemDocument:boolean
}

export interface JSTreeNode {
	id:string,
	text:any,
	state:any,
	children:any,
	data:any,
	type?:any
}
