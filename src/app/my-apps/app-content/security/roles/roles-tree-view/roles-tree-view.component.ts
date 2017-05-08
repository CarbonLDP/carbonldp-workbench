import { Component, Input, Output, ElementRef, AfterViewInit, OnInit, EventEmitter } from "@angular/core";

import * as App from "carbonldp/App";
import * as PersistedRole from "carbonldp/App/PersistedRole";
import * as HTTP from "carbonldp/HTTP";
import * as URI from "carbonldp/RDF/URI";

import { RolesService } from "../roles.service";

import "jstree/dist/jstree.min";


@Component( {
	selector: "cw-roles-tree-view",
	templateUrl: "./roles-tree-view.component.html",
	styleUrls: [ "./roles-tree-view.component.scss" ],
} )
export class RolesTreeViewComponent implements AfterViewInit, OnInit {

	private element:ElementRef;
	private $element:JQuery;
	private jsTree:JSTree;
	private $tree:JQuery;
	private rolesService:RolesService;
	private _selectedRole:string = "";

	set selectedURI( value:string ) {
		this._selectedRole = value;
		this.onSelectRole.emit( this.selectedURI );
	}

	get selectedURI():string {
		return this._selectedRole;
	}


	@Input() appContext:App.Context;
	@Input() refreshNode:EventEmitter<string> = new EventEmitter<string>();
	@Input() openNode:EventEmitter<string> = new EventEmitter<string>();
	@Input() deletedNode:EventEmitter<string> = new EventEmitter<string>();

	@Output() onError:EventEmitter<HTTP.Errors.Error> = new EventEmitter<HTTP.Errors.Error>();
	@Output() onLoading:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSelectRole:EventEmitter<string> = new EventEmitter<string>();
	@Output() onDoubleClickRole:EventEmitter<string> = new EventEmitter<string>();
	@Output() onShowCreateRoleForm:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onShowDeleteRoleForm:EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor( element:ElementRef, rolesService:RolesService ) {
		this.element = element;
		this.rolesService = rolesService;
	}

	ngOnInit():void {
		let head:Element,
			link:HTMLLinkElement = document.createElement( "link" ),
			alreadyImported:boolean = document.querySelectorAll( "head [href='assets/node_modules/jstree/dist/themes/default/style.min.css']" ).length > 0;
		if( alreadyImported ) return;
		link.rel = "stylesheet";
		link.href = "assets/node_modules/jstree/dist/themes/default/style.min.css";
		head = document.querySelector( "head" );
		head.appendChild( link );
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$tree = this.$element.find( ".tree.content" );
		this.onLoading.emit( true );
		this.getTree().then( () => {
			this.onLoading.emit( false );
		} );
		this.refreshNode.subscribe( ( nodeId:string ) => {
			let node:JSTreeNode = this.jsTree.get_node( nodeId );
			if( node[ "parent" ] === "#" ) this.jsTree.move_node( node, this.appContext.getBaseURI() + "roles/app-admin/" );
			this.jsTree.close_node( node[ "parent" ] );
			this.jsTree.open_node( node[ "parent" ] );
			this.loadNode( node );
			this.jsTree.select_node( node.id );
		} );
		this.openNode.subscribe( ( nodeId:string ) => {
			this.jsTree.select_node( nodeId );
		} );
		this.deletedNode.subscribe( ( nodeId:string ) => {
			let node:string = this.jsTree.get_node( nodeId );
			nodeId = node[ "parent" ];
			this.jsTree.select_node( nodeId );
			this.loadNode( nodeId );
		} );
	}

	private getTree():Promise<JSTreeNode[]> {
		return this.getChildren().then( ( nodes:JSTreeNode[] ) => {
			this.renderTree( nodes );
			return nodes;
		} ).catch( ( error:HTTP.Errors.Error ) => {
			console.error( error );
			this.onError.emit( error );
		} );
	}

	private getChildren( roleID?:string ):Promise<JSTreeNode[]> {
		let nodes:JSTreeNode[] = [];
		! ! roleID && URI.Util.isAbsolute( roleID ) ? roleID = roleID : roleID = null;
		return this.rolesService.getChildren( this.appContext, roleID ).then( ( roles:PersistedRole.Class[] ) => {
			roles.forEach( ( role:PersistedRole.Class ) => {
				let node:JSTreeNode = this.buildNode( role.id, role.name, null, role[ "hasChildren" ] );
				nodes.push( node );
			} );
			return nodes;
		} );
	}

	private buildNode( uri:string, text:string, nodeType?:string, hasChildren?:boolean ):JSTreeNode {
		let node:JSTreeNode = {
			id: uri,
			text: text,
			state: { "opened": false },
			children: [],
			data: {},
		};
		if( hasChildren ) node.children.push( { "text": "Loading...", } );
		return node;
	}

	private renderTree( nodes:JSTreeNode[] ):void {
		this.jsTree = this.$tree.jstree( {
			"core": {
				"data": nodes,
				"check_callback": true,
				"multiple": false,
			},
			"types": {
				"default": {
					"icon": "file outline icon",
				},
				"loading": {
					"icon": "spinner loading icon",
				}
			},
			"plugins": [ "types", "wholerow" ],
		} ).jstree( true );
		this.$tree.on( "before_open.jstree", ( e:Event, data:any ):void => {
			let parentId:any = data.node.id,
				parentNode:any = data.node,
				position:string = "last";
			this.onBeforeOpenNode( parentId, parentNode, position );
		} );
		this.$tree.on( "select_node.jstree", ( e:Event, data:any ):void => {
			let node:any = data.node;
			this.selectedURI = node.id;
		} );
		this.$tree.on( "deselect_node.jstree", ( e:Event, data:any ):void => {
			this.selectedURI = null;
		} );
		this.$tree.on( "loaded.jstree", () => {
			this.jsTree.select_node( nodes[ 0 ].id );
			this.jsTree.open_node( nodes[ 0 ].id );
			if( ! ! nodes && nodes.length > 0 ) {
				this.onDoubleClickRole.emit( <string>nodes[ 0 ].id );
			}
		} );
		this.$tree.on( "after_close.jstree", ( e:Event, data:any ):void => {
			let node:any = data.node,
				selectedNodes:JSTreeNode[] = this.jsTree.get_selected( node ),
				selectedNode:string = selectedNodes.length > 0 ? selectedNodes[ 0 ].id : null;

			if( node.children.findIndex( ( nodeId:string ) => { return nodeId === selectedNode; } ) !== - 1 ) {
				this.jsTree.deselect_all();
				this.jsTree.select_node( node );
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

	private loadNode( obj:any ):void {
		let node:JSTreeNode = this.jsTree.get_node( obj ),
			parentId:any = node.id,
			parentNode:any = node,
			position:string = "last";
		this.onChange( parentId, parentNode, position );
	}


	private onBeforeOpenNode( parentId:string, parentNode:any, position:string ):Promise<any> {
		let originalIcon:string = ! ! this.jsTree.settings.types[ parentNode.type ] ? this.jsTree.settings.types[ parentNode.type ].icon : "help icon";
		this.jsTree.set_icon( parentNode, this.jsTree.settings.types.loading.icon );
		return this.getChildren( parentNode.id ).then( ( children:JSTreeNode[] ):void => {
			this.emptyNode( parentId );
			if( children.length > 0 ) {
				children.forEach( ( childNode:any ) => this.addChild( parentId, childNode, position ) );
			}
		} ).catch( ( error:HTTP.Errors.Error ) => {
			console.error( error );
			this.onError.emit( error );
		} ).then( () => {
			this.jsTree.set_icon( parentNode, originalIcon );
		} );
	}

	private onChange( parentId:string, node:any, position:string ):void {
		this.onBeforeOpenNode( parentId, node, position ).then( () => {
			if( ! ! node.id && ! URI.Util.isAbsolute( node.id ) ) node = this.jsTree.get_node( node.children[ 0 ] );
			if( ! this.jsTree.is_open( node ) ) {
				this.jsTree.open_node( node );
			}
			this.onDoubleClickRole.emit( node.id );
		} );
	}

	private addChild( parentId:string, node:any, position:string ):void {
		this.jsTree.create_node( parentId, node, position );
	}

	private emptyNode( nodeId:string ):void {
		let $children:JQuery = this.jsTree.get_children_dom( nodeId ),
			childElements:Element[] = jQuery.makeArray( $children );
		while( childElements.length > 0 ) {
			this.jsTree.delete_node( childElements[ 0 ] );
			childElements.splice( 0, 1 );
		}
	}

	public showCreateRoleForm():void {
		this.onShowCreateRoleForm.emit( true );
	}

	public showDeleteRoleForm():void {
		this.onShowDeleteRoleForm.emit( true );
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
