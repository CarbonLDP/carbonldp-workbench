import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit, ViewChild } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";
import { RDFNode } from "carbonldp/RDF/Node"

import { Property, PropertyStatus, Modes } from "./../property.component";
import { NamedFragmentStatus } from "../../named-fragments/named-fragment.component";


@Component( {
	selector: "cw-property-id",
	templateUrl: "./property-id.component.html",
	styleUrls: [ "./property-id.component.scss" ],
} )

export class PropertyIDComponent implements AfterViewInit {

	element:ElementRef;
	$element:JQuery;


	status:string;
	existingFragments:string[] = [];
	tempProperty:Property = <Property>{};

	id:string;
	originalId:string;
	value:any[] | string = [];

	modes:Modes = Modes;
	@ViewChild( "idInput" ) idInputControl;

	@Input() mode:string = Modes.READ;
	@Input() documentURI:string = "";
	@Input() blankNodes:RDFNode[] = [];
	@Input() namedFragments:NamedFragmentStatus[] = [];
	@Input() isPartOfNamedFragment:boolean = false;
	@Input() canEdit:boolean = true;
	@Input() accessPointsHasMemberRelationProperties:string[] = [];
	private _property:PropertyStatus;
	@Input() set property( property:PropertyStatus ) {
		this._property = property;
		this.status = (! ! property.modified) ? "modified" : (! ! property.copy) ? "copy" : "added";

		this.id = property[ this.status ].id;
		this.tempProperty.id = property[ this.status ].id;
		this.originalId = property[ this.status ].value;
		this.value = property[ this.status ].value;
	}

	get property():PropertyStatus { return this._property; }

	@Output() onChangeProperty:EventEmitter<Property> = new EventEmitter<Property>();

	get valueHasChanged():boolean { return ! ! this.property.copy && this.property.copy.value !== this.tempProperty.value; };


	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.initializePropertyButtons();
	}

	getParentURI( uri:string ):string {
		let slug:string = this.getSlug( uri );
		return uri.substr( 0, uri.indexOf( slug ) );
	}

	getSlug( uri:string ) {
		return URI.getSlug( uri );
	}

	isUrl( uri:string ):boolean {
		let r = /^(ftp|http|https):\/\/[^ "]+$/;
		return r.test( uri );
	}

	onEditId():void {
		this.mode = Modes.EDIT;
		this.existingFragments = [];
		this.namedFragments.forEach( ( nameFragment:NamedFragmentStatus ) => { this.existingFragments.push( nameFragment.name ); } );
		this.value = this.unescape( <string>this.value );
	}

	cancelModification():void {
		if( ! this.idInputControl.valid ) return;
		this.mode = Modes.READ;
	}

	saveId():void {
		this.checkForChangesOnId( this.sanitize( <string>this.value ) ); //check changes on idInput
		this.mode = Modes.READ;
	}

	private initializePropertyButtons():void {
		this.$element.find( ".ui.options.dropdown.button" ).dropdown( {
			transition: "swing up"
		} );
		this.$element.find( ".ui.save-cancel.buttons .dropdown.button" ).dropdown();
	}

	private sanitize( value:string ):string {
		let sanitized:string = value;
		let slug:string = this.getSlug( value );
		let parts:string[] = value.split( slug );
		if( parts.length > 0 ) sanitized = parts[ 0 ] + this.escape( slug );
		return sanitized;
	}

	private checkForChangesOnId( newId:string ):void {
		this.value = newId;
		if( (this.value !== void 0) &&
			(this.value !== this.property[ this.status ].value || this.value !== this.tempProperty.value) ) {
			this.tempProperty.value = this.value;
			this.changePropertyContent();
		}
	}

	private changePropertyContent():void {
		this.tempProperty.id = this.id;
		delete this.property.modified;

		// Change value because it is a single string
		if( ! ! this.property.copy ) {
			if( this.tempProperty.value !== this.property.copy.value ) {
				this.property.modified = this.tempProperty;
			}
		}

		this.property.isBeingCreated = false;

		if( ! ! this.property.copy ) {
			if( this.valueHasChanged ) {
				this.property.modified = this.tempProperty;
			}
		}
		this.onChangeProperty.emit( this.tempProperty );
	}

	private escape( uri:string ):string {
		return encodeURI( uri );
	}

	private unescape( uri:string ):string {
		return decodeURI( uri );
	}
}