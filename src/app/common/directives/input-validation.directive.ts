import { Directive, Host, HostListener, Optional } from "@angular/core";
import { AbstractControl, NgModel } from "@angular/forms";

/**
 * This directive gives you a valid state that takes into consideration the user's interaction with the control.
 * The "valid" state will be true on the following conditions:
 * <ul>
 *     <li>If the user hasn't focused the control</li>
 *     <li>If the control has focus</li>
 *     <li>If the control is valid (based on ngModel validations)</li>
 * </ul>
 * The intention is to simplify error conditions that would require too much logic instead.
 *
 * @example
 * <input [ngModel]="email" cwValidation #email="cwValidation" [class.error]="! email.valid">
 *
 * <div class="error-message" *ngIf="! email.valid">
 *     <ul>
 *         <li *ngIf="email.control.hasError( 'required' )">Please provide an email address</li>
 *         <li *ngIf="email.control.hasError( 'email' )">Please provide a valid email address</li>
 *     </ul>
 * </div>
 */
@Directive( {
	selector: "[cwValidation][ngModel]",
	exportAs: "cwValidation",
} )
export class InputValidationDirective {
	get control():AbstractControl {
		if( ! this.ngModel ) return null;
		return this.ngModel.control;
	}

	get valid():boolean {
		if( ! this.ngModel ) return true;
		return ! this.ngModel.touched || this.hasFocus || ! this.wasFocused || this.ngModel.valid || this.ngModel.isDisabled;
	}

	get invalid():boolean {
		return ! this.valid;
	}

	get errors():{ [ key:string ]:any } {
		if( ! this.ngModel ) return {};

		return this.ngModel.errors;
	}

	get touched():boolean {
		return this.ngModel.touched;
	}

	get pristine():boolean {
		return this.ngModel.pristine;
	}

	// TODO: Make other ngModel properties accessible

	private hasFocus:boolean = false;
	private wasFocused:boolean = false;

	constructor( @Optional() @Host() public ngModel:NgModel ) {}

	@HostListener( "focus" )
	onFocus():void {
		this.hasFocus = true;
		this.wasFocused = true;
	}

	@HostListener( "blur" )
	onBlur():void {
		this.hasFocus = false;
	}
}
