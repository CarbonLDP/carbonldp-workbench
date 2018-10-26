import { Directive, Injector, Input, OnChanges, SimpleChanges } from "@angular/core";
import { AbstractControl, FormControl, NG_VALIDATORS, NgControl, NgModel, Validator } from "@angular/forms";
import { URI } from "carbonldp/RDF/URI";

@Directive( {
	selector: "[app-email]",
	providers: [ { provide: NG_VALIDATORS, useExisting: EmailValidator, multi: true } ]
} )
export class EmailValidator implements Validator {
	validate( control:AbstractControl ):{ [ key:string ]:any; } {
		// RFC 2822 compliant regex
		if( control.value ) {
			if( control.value.match( /[a-z0-9!#$%&"*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&"*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ ) ) {
				return null;
			} else {
				return { "invalidEmailAddress": true };
			}
		}
	}
}

@Directive( {
	selector: "[app-slug]",
	providers: [ { provide: NG_VALIDATORS, useExisting: SlugValidator, multi: true } ]
} )
export class SlugValidator implements Validator {

	validate( control:AbstractControl ):{ [ key:string ]:any; } {
		if( control.value ) {
			if( control.value.match( /^[a-z0-9]+(?:-[a-z0-9]*)*(?:\/*)$/ ) ) {
				return null;
			}
			return { "invalidSlug": true };
		}
	}
}


@Directive( {
	selector: "[app-match]",
	providers: [ { provide: NG_VALIDATORS, useExisting: MatchValidator, multi: true } ]
} )
export class MatchValidator implements Validator, OnChanges {
	@Input() matchTo:any;

	private injector:Injector;
	private ngModel:NgModel;
	private control:FormControl;

	constructor( injector:Injector ) {
		this.injector = injector;
	}

	ngOnInit() {
		this.ngModel = this.injector.get( NgControl );
		this.control = this.ngModel.control;
	}

	ngOnChanges( changes:SimpleChanges ) {
		if( ! this.control || ! changes.hasOwnProperty( "matchTo" ) ) return;
		setTimeout( () => this.control.updateValueAndValidity( { onlySelf: false, emitEvent: false } ), 0 );
	}

	validate( control:AbstractControl ):{ [ key:string ]:any; } {
		if( ! control.value ) return;
		return (control.value === this.matchTo) ? null : { "matchError": true };
	}
}

@Directive( {
	selector: "[app-domain]",
	providers: [ { provide: NG_VALIDATORS, useExisting: DomainValidator, multi: true } ]
} )
export class DomainValidator implements Validator {

	validate( control:AbstractControl ):{ [ key:string ]:any; } {
		if( control.value ) {
			if( control.value.match( /^((cc:|https:|http:|[/][/])([a-z]|[A-Z]|[:0-9]|[/.-]){3,})$/g ) )
				return null;
			else {
				return { "invalidURLAddress": true };
			}
		}
	}
}

@Directive( {
	selector: "[app-uri]",
	providers: [ { provide: NG_VALIDATORS, useExisting: URIValidator, multi: true } ]
} )
export class URIValidator implements Validator {

	validate( control:AbstractControl ):{ [ key:string ]:any; } {
		if( control.value ) {
			if( control.value.match( /^(ftp|https?):\/\/(\w+:{0,1}\w*@)?((?![^\/]+\/(?:ftp|https?):)\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/ ) ) {
				return null;
			} else {
				//if( control.touched && ! ! control.value ) {
				return { "invalidURIAddress": true };
			}
		}
		return { "emptyURIAddress": true };
	}
}

@Directive( {
	selector: "[app-fragment]",
	providers: [ { provide: NG_VALIDATORS, useExisting: FragmentValidator, multi: true } ]
} )
export class FragmentValidator implements Validator {

	validate( control:AbstractControl ):{ [ key:string ]:any; } {
		if( ! control.value ) return null;
		if( ! control.value.match( /^(ftp|https?):\/\/(\w+:{0,1}\w*@)?((?![^\/]+\/(?:ftp|https?):)\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/ ) ) return { "invalidURIAddress": true };
		if( ! URI.hasFragment( control.value ) ) return { "missingFragment": true };
		if( control.value.split( "#" ).length > 2 ) return { "multipleFragment": true };
		if( URI.getFragment( control.value ).trim().length === 0 ) return { "missingFragment": true };

		return null;
	}
}

@Directive( {
	selector: "[app-uri-fragment]",
	providers: [ { provide: NG_VALIDATORS, useExisting: URIFragmentValidator, multi: true } ]
} )
export class URIFragmentValidator implements Validator {

	validate( control:AbstractControl ):{ [ key:string ]:any; } {
		if( ! control.value ) return null;
		if( ! control.value.match( /^(ftp|https?):\/\/(\w+:{0,1}\w*@)?((?![^\/]+\/(?:ftp|https?):)\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/ ) ) return { "invalidURIAddress": true };
		if( ! URI.hasFragment( control.value ) ) return;
		if( control.value.split( "#" ).length > 2 ) return { "multipleFragment": true };
		if( URI.getFragment( control.value ).trim().length === 0 ) return { "missingFragment": true };
		let fragmentPart:string = control.value.split( "#" )[ 1 ];
		if( ! fragmentPart.match( /^[a-z0-9]+(?:-[a-z0-9]*)*(?:\/*)$/ ) ) return { "invalidURIAddress": true };

		return null;
	}
}

@Directive( {
	selector: '[app-required-if]',
	providers: [ { provide: NG_VALIDATORS, useExisting: RequiredIfValidator, multi: true } ]
} )
export class RequiredIfValidator implements Validator {
	@Input() condition:boolean;

	validate( control:AbstractControl ):{ [ key:string ]:any } {
		if( this.condition && ! control.value ) return { "requiredIf": true };
		return null;
	}
}

@Directive( {
	selector: '[app-required]',
	providers: [ { provide: NG_VALIDATORS, useExisting: RequiredDirective, multi: true } ]
} )
export class RequiredDirective implements Validator {

	validate( control:AbstractControl ):{ [ key:string ]:any } {
		let isWhitespace = (control.value || '').trim().length === 0;
		return isWhitespace ? { 'required': true } : null;
	}
}
