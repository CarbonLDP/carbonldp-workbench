import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";

import { URI } from "carbonldp/RDF";

import { Modes } from "../../document-explorer-library";
import { Property, PropertyStatus } from "./../property.component";
import { NamedFragmentStatus } from "../../named-fragments/named-fragment.component";

@Component( {
	selector: "app-property-id",
	templateUrl: "./property-id.component.html",
	styleUrls: [ "./property-id.component.scss" ]
} )
export class PropertyIDComponent implements AfterViewInit {
	@Input() documentURI:string = "";
	@Input() namedFragments:NamedFragmentStatus[] = [];
	@Input() isPartOfNamedFragment:boolean = false;
	@Input() canEdit:boolean = true;


	@Input() set property( property:PropertyStatus ) {
		this._property = property;
		this.status = property.modified ? "modified" : property.copy ? "copy" : "added";

		this.id = property[ this.status ].id;
		this.tempProperty.id = property[ this.status ].id;
		this.originalId = property[ this.status ].value;
		this.value = property[ this.status ].value;
	}
	get property():PropertyStatus {return this._property;}
	private _property:PropertyStatus;

	@Output() onChangeProperty:EventEmitter<Property> = new EventEmitter<Property>();

	// Make URI utility accessible to template
	URI:typeof URI = URI;

	element:ElementRef;
	$element:JQuery;

	mode:string = Modes.READ;
	status:string;
	existingFragments:string[] = [];
	tempProperty:Property = {} as any;

	id:string;
	originalId:string;
	value:string = "";

	modes:typeof Modes = Modes;
	@ViewChild( "idInput" ) idInputControl;

	get valueHasChanged():boolean {
		return this.property.copy && this.property.copy.value !== this.tempProperty.value;
	};

	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.initializePropertyButtons();
	}

	getParentURI( uri:string ):string {
		if( URI.hasFragment( uri ) ) {
			return URI.getDocumentURI( uri );
		} else {
			// Remove ending slash if present
			let parentURI:string = uri.endsWith( "/" )
				? uri.substring( 0, uri.length - 1 )
				: uri;

			parentURI = parentURI.substring( 0, parentURI.lastIndexOf( "/" ) + 1 );

			return parentURI;
		}
	}

	isUrl( uri:string ):boolean {
		let r = /^(ftp|http|https):\/\/[^ "]+$/;
		return r.test( uri );
	}

	onEditId():void {
		this.mode = Modes.EDIT;
		this.existingFragments = [];
		this.namedFragments.forEach( ( nameFragment:NamedFragmentStatus ) => {
			this.existingFragments.push( nameFragment.name );
		} );
		this.value = this.unescape( this.value );
	}

	cancelModification():void {
		if( ! this.idInputControl.valid ) return;
		this.mode = Modes.READ;
	}

	saveId():void {
		// Check changes on idInput
		this.checkForChangesOnId( this.sanitize( this.value ) );
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
		let slug:string = URI.getSlug( value );
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
		this.tempProperty.name = this.id;
		delete this.property.modified;

		this.property.isBeingCreated = false;

		if( this.property.copy ) {
			if( this.valueHasChanged ) {
				this.property.modified = this.tempProperty;
			}
		} else if( this.property.added ) {
			this.property.added = this.tempProperty;
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
