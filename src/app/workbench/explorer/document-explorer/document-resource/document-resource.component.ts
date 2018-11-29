import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { RDFNode } from "carbonldp/RDF/Node";

import { ResourceRecords } from "../document-explorer-library";
import { DocumentsResolverService } from "../documents-resolver.service";
import { Property, PropertyStatus } from "../property/property.component";
import { ResourceFeatures, States } from "../resource-features.component";

/**
 *  Displays the contents of a Document with all its properties
 */
@Component( {
	selector: "app-document-resource",
	templateUrl: "./document-resource.component.html",
	styleUrls: [ "./document-resource.component.scss" ]
} )
export class DocumentResourceComponent extends ResourceFeatures implements AfterViewInit, OnInit, OnChanges {
	@Input() displayOnly:string[] = [];
	@Input() hiddenProperties:string[] = [];
	@Input() blankNodes:RDFNode[] = [];
	@Input() namedFragments:RDFNode[] = [];
	@Input() canEdit:boolean = true;
	@Input() documentURI:string = "";
	@Input() rootNode:RDFNode;

	@Output() onOpenBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChanges:EventEmitter<ResourceRecords> = new EventEmitter<ResourceRecords>();

	$element:JQuery;

	private _rootHasChanged:boolean;
	set rootHasChanged( hasChanged:boolean ) {
		this._rootHasChanged = hasChanged;
		this.onChanges.emit( this.records );
	}

	get rootHasChanged() {
		return this._rootHasChanged;
	}

	constructor(
		carbonldp:CarbonLDP,
		private element:ElementRef,
		private documentsResolverService:DocumentsResolverService
	) {
		super( carbonldp );

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

	deleteProperty( property:PropertyStatus, index:number ):void {
		this.state = States.READ;
		super.deleteProperty( property, index );
	}

	cancelProperty( property:PropertyStatus, index:number ):void {
		this.state = States.READ;
		super.cancelProperty( property, index );
	}

	addProperty( property:PropertyStatus, index:number ):void {
		super.addProperty( property, index );
		this.state = States.READ;
	}

	createProperty( property:Property, propertyStatus:PropertyStatus ):void {
		super.createProperty( property, propertyStatus );
		this.state = States.EDIT;

		// Animates created property
		/*
			2018-11-09 @MiguelAraCo
			TODO[code-quality]: Use vanilla JavaScript and CSS instead of JQuery
		*/


		// setTimeout( () => {
		// 	let createdPropertyComponent:JQuery = this.$element.find( "app-property.added-property" ).first();
		// 	createdPropertyComponent.addClass( "transition hidden" );
		// 	createdPropertyComponent.transition( { animation: "drop" } );
		// } );
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

	private initData():void {
		this.records = new ResourceRecords();
		this.state = States.READ;
		this.getProperties()
			.then( () => {
				this.updateExistingProperties();
			} );
	}

	ngOnInit() {
		this.initData();
	}

	ngOnChanges( changes:SimpleChanges ) {
		if( "rootNode" in changes ) {
			let change:SimpleChange = changes.rootNode;
			this.rootNode = Object.assign( {}, change.currentValue );
			this.initData();
		}
	}
}

