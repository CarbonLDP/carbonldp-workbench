import { XSD } from "carbonldp/Vocabularies";
import { isDate, isInteger, isNumber, isString } from "carbonldp/Utils";
import { RDFLiteral } from "carbonldp/RDF";
import { URI } from "carbonldp/RDF";
import { DocumentExplorerLibrary } from "./document-explorer-library";

import { Directive, Input, OnChanges, SimpleChanges } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, Validator } from "@angular/forms";

@Directive( {
	selector: "[app-property-name]",
	providers: [ { provide: NG_VALIDATORS, useExisting: PropertyNameValidator, multi: true } ]
} )
export class PropertyNameValidator implements Validator, OnChanges {
	@Input() existingProperties;
	@Input() property;
	@Input() id;
	@Input() originalName;
	@Input() control;
	url = new RegExp( "(\b(https?|ftp|file)://)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]" );

	ngOnChanges( changes:SimpleChanges ) {
		this.control.control.updateValueAndValidity( false, true );
	}

	validate( control:AbstractControl ):{ [ key:string ]:any; } {

		if( ! ! control ) {
			if( control.value === void 0 || control.value === null ) return null;
			if( this.propertyAlreadyExists( control.value ) ) return { "duplicatedPropertyName": true };
			if( control.value.replace( /\s/g, "" ).length === 0 ) return { "emptyName": true };
			if( ! DocumentExplorerLibrary.isValidURL( control.value ) ) return { "invalidName": true };
			if( control.value.split( "#" ).length > 2 ) return { "duplicatedHashtag": true };
		}
		return null;
	}

	private propertyAlreadyExists( propertyName:string ):boolean {
		return (this.existingProperties.indexOf( encodeURI( propertyName ) ) !== - 1) &&
			(this.property.added ? this.id !== encodeURI( propertyName ) : this.originalName !== encodeURI( propertyName ))
	}
}

@Directive( {
	selector: "[app-property-id]",
	providers: [ { provide: NG_VALIDATORS, useExisting: IdValidator, multi: true } ]
} )
export class IdValidator implements Validator, OnChanges {
	@Input() existingFragments;
	@Input() property;
	@Input() documentURI;
	@Input() id;
	@Input() originalId;
	@Input() control;
	// url = new RegExp( "(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})", "g" );
	url = new RegExp( "(\b(https?|ftp|file)://)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]" );


	ngOnChanges( changes:SimpleChanges ) {
		this.control.control.updateValueAndValidity( false, true );
	}

	validate( control:AbstractControl ):{ [ key:string ]:any; } {

		if( ! ! control ) {
			if( typeof control.value === "undefined" || control.value === null || ! control.value ) return null;
			if( typeof control.value === "string" && ! control.value.startsWith( this.documentURI ) ) return { "invalidParent": true };
			if( this.fragmentAlreadyExists( control.value ) ) return { "duplicatedNamedFragmentName": true };
			if( control.value.split( "#" ).length > 2 ) return { "duplicatedHashtag": true };
		}
		return null;
	}

	private fragmentAlreadyExists( fragmentName:string ):boolean {
		return (this.existingFragments.indexOf( fragmentName ) !== - 1) &&
			(this.property.added ? this.id !== fragmentName : this.originalId !== fragmentName);
	}
}


@Directive( {
	selector: "[app-literal-value]",
	providers: [ { provide: NG_VALIDATORS, useExisting: LiteralValueValidator, multi: true } ]
} )

export class LiteralValueValidator implements Validator, OnChanges {
	@Input() type;
	@Input() control;

	ngOnChanges( changes:SimpleChanges ) {
		this.control.control.updateValueAndValidity( false, true );
	}

	validate( control:AbstractControl ):{ [ key:string ]:any; } {
		let valid:boolean;
		switch( this.type ) {
			// Boolean
			case XSD.boolean:
				switch( control.value ) {
					case "true":
					case "yes":
					case "y":
					case "1":
					case "false":
					case "no":
					case "n":
					case "0":
						valid = true;
				}
				break;

			// Numbers
			case XSD.int :
			case XSD.integer :
				valid = ! isNaN( control.value ) && ! isNaN( RDFLiteral.parse( control.value, this.type ) ) && isInteger( RDFLiteral.parse( control.value, this.type ) );
				break;

			case XSD.byte :
			case XSD.decimal :
			case XSD.long :
			case XSD.negativeInteger :
			case XSD.nonNegativeInteger :
			case XSD.nonPositiveInteger :
			case XSD.positiveInteger :
			case XSD.short :
			case XSD.unsignedLong :
			case XSD.unsignedInt :
			case XSD.unsignedShort :
			case XSD.unsignedByte :
			case XSD.double :
			case XSD.float :
				valid = ! isNaN( control.value ) && ! isNaN( RDFLiteral.parse( control.value, this.type ) ) && isNumber( RDFLiteral.parse( control.value, this.type ) );
				break;

			// Dates
			case XSD.date:
			case XSD.dateTime:
			case XSD.time:
				valid = isDate( RDFLiteral.parse( control.value, this.type ) );
				break;

			case XSD.string:
				valid = isString( RDFLiteral.parse( control.value, this.type ) );
				break;

			default:
				valid = isString( control.value );
				break;
		}
		if( ! valid ) {
			return { "invalidTypeError": true };
		}
		return null;

	}
}

@Directive( {
	selector: "[app-pointer-id]",
	providers: [ { provide: NG_VALIDATORS, useExisting: PointerValidator, multi: true } ]
} )
export class PointerValidator implements Validator {
	@Input() documentURI;
	url = new RegExp( "(\b(https?|ftp|file)://)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]" );

	validate( control:AbstractControl ):{ [ key:string ]:any; } {
		if( ! ! control && typeof control.value === "undefined" ) {
			return { "emptyControl": true };
		}
		if( ! ! control.value ) {
			if( URI.isBNodeID( control.value ) || this.url.test( control.value ) ) return null;
			return { "invalidId": true };
		}
		return null;

	}
}
