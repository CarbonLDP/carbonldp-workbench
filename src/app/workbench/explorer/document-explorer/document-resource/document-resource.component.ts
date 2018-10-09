import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";

import { CarbonLDP } from "carbonldp"
import { RDFNode } from "carbonldp/RDF/Node"

import { Modes, ResourceFeatures, ResourceRecords } from "../document-explorer-library";
import { DocumentsResolverService } from "../documents-resolver.service";
import { Property, PropertyStatus } from "../property/property.component";

/*
*  Displays the contents of a Document with all its properties
* */
@Component( {
	selector: "cw-document-resource",
	templateUrl: "./document-resource.component.html",
	styles: [ ":host { display:block; }" ],
} )

export class DocumentResourceComponent extends ResourceFeatures implements AfterViewInit {

	element:ElementRef;
	$element:JQuery;
	documentsResolverService:DocumentsResolverService;
	carbonldp:CarbonLDP;

	modes:Modes = Modes;

	canCreateNewProperty:boolean = true;

	private _rootHasChanged:boolean;
	set rootHasChanged( hasChanged:boolean ) {
		this._rootHasChanged = hasChanged;
		this.onChanges.emit( this.records );
	}

	get rootHasChanged() { return this._rootHasChanged; }

	@Input() displayOnly:string[] = [];
	@Input() hiddenProperties:string[] = [];
	@Input() blankNodes:RDFNode[] = [];
	@Input() namedFragments:RDFNode[] = [];
	@Input() canEdit:boolean = true;
	@Input() documentURI:string = "";
	private _rootNode:RDFNode;
	@Input()
	set rootNode( value:RDFNode ) {
		this._rootNode = value;
		this.records = new ResourceRecords();
		this.canCreateNewProperty = true;
		this.getProperties()
			.then( () => { this.updateExistingProperties();} );
	}

	get rootNode() {
		return this._rootNode;
	}

	@Output() onOpenBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChanges:EventEmitter<ResourceRecords> = new EventEmitter<ResourceRecords>();


	constructor( element:ElementRef, documentsResolverService:DocumentsResolverService, carbonldp:CarbonLDP ) {
		super( carbonldp );
		this.element = element;
		this.documentsResolverService = documentsResolverService;
		this.carbonldp = carbonldp;
		this.insertOrder = 2;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
	}

	openBlankNode( id:string ):void {
		this.onOpenBlankNode.emit( id );
	}

	openNamedFragment( id:string ):void {
		this.onOpenNamedFragment.emit( id );
	}

	canDisplay( propertyName:any ):boolean {
		if( typeof propertyName === "undefined" ) return false;
		if( this.displayOnly.length === 0 && this.hiddenProperties.length === 0 ) return true;
		if( this.displayOnly.length > 0 ) return this.displayOnly.indexOf( propertyName ) !== - 1 ? true : false;
		return this.hiddenProperties.indexOf( propertyName ) !== - 1 ? false : true;
	}

	changeProperty( property:PropertyStatus, index:number ):void {
		super.changeProperty( property, index );
	}

	deleteProperty( property:PropertyStatus, index:number ):void {
		super.deleteProperty( property, index );
	}

	addProperty( property:PropertyStatus, index:number ):void {
		super.addProperty( property, index );
		this.canCreateNewProperty = true;
	}

	createProperty( property:Property, propertyStatus:PropertyStatus ):void {
		this.canCreateNewProperty = false;
		super.createProperty( property, propertyStatus );

		// Animates created property
		setTimeout( () => {
			let createdPropertyComponent:JQuery = this.$element.find( "cw-property.added-property" ).first();
			createdPropertyComponent.addClass( "transition hidden" );
			createdPropertyComponent.transition( { animation: "drop" } );
		} );
	}

	updateExistingProperties():void {
		super.updateExistingProperties();
		this.rootHasChanged = this.resourceHasChanged;
	}

	/*
	*   Returns additional properties for a document. In this case Access Points
	* */
	getProperties():Promise<void> {
		return this.getAccessPointsHasMemberRelationProperties( this.documentURI )
			.then( ( accessPointsHasMemberRelationProperties:string[] ) => {
				this.accessPointsHasMemberRelationProperties = accessPointsHasMemberRelationProperties;
				return Promise.resolve();
			} );
	}

	getAccessPointsHasMemberRelationProperties( documentURI:string ):Promise<string[]> {
		return this.documentsResolverService.getAccessPointsHasMemberRelationProperties( documentURI );
	}
}

