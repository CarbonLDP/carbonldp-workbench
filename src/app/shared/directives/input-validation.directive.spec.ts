import { Component, ViewChild, AfterContentInit } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { By }              from "@angular/platform-browser";
import { DebugElement }    from "@angular/core";

import { EmailValidator } from "./custom-validators";
import { InputValidationDirective } from "./input-validation.directive";

export function inputValidationSpecs() {

	describe( "InputValidationDirective", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;
		let de:DebugElement;
		let input:HTMLInputElement;

		@Component( {
			template: `
				<input  type="text"
			            placeholder="E-mail address"
			            name="email"
			            [(ngModel)]="internalEmail"
			            cwValidation
			            #email="cwValidation"
			            required cw-email>
                <div class="error-message" *ngIf="! email.valid">
                    <ul>
                        <li *ngIf="email.control.hasError( 'required' )">Please provide an email address</li>
                        <li *ngIf="email.control.hasError( 'email' )">Please provide a valid email address</li>
                    </ul>
                </div>
			`
		} )
		class TestComponent implements AfterContentInit {
			internalEmail:string = "";
			@ViewChild( InputValidationDirective ) inputValidationDirective:InputValidationDirective;

			ngAfterContentInit() {}

			ngAfterViewInit() {}
		}


		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [ TestComponent, EmailValidator, InputValidationDirective, ],
			} ).compileComponents();
		} ) );


		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;
			fixture.detectChanges();
			input = de.query( By.css( "input" ) ).nativeElement;
		} );


		it( "Should be valid", () => {
			input.dispatchEvent( new Event( "focus" ) );
			input.value = "example@company.com";
			input.dispatchEvent( new Event( "input" ) );
			input.dispatchEvent( new Event( "blur" ) );
			fixture.detectChanges();
			comp.ngAfterContentInit();
			expect( comp.inputValidationDirective.valid ).toEqual( true );
			expect( comp.inputValidationDirective.errors ).toBeNull();
		} );

		it( "Should be invalid", () => {
			input.dispatchEvent( new Event( "focus" ) );
			input.value = "exa mple";
			input.dispatchEvent( new Event( "input" ) );
			input.dispatchEvent( new Event( "blur" ) );
			fixture.detectChanges();
			comp.ngAfterContentInit();
			expect( comp.inputValidationDirective.errors ).toEqual( { invalidEmailAddress: true } );
		} );

		it( "Should return errors", () => {
			input.dispatchEvent( new Event( "focus" ) );
			input.value = "exa mple";
			input.dispatchEvent( new Event( "input" ) );
			input.dispatchEvent( new Event( "blur" ) );
			fixture.detectChanges();
			comp.ngAfterViewInit();
			expect( comp.inputValidationDirective.errors ).toBeDefined();
			expect( comp.inputValidationDirective.errors ).toEqual( { invalidEmailAddress: true } );
		} );

		it( "Should say it's been touched", () => {
			input.dispatchEvent( new Event( "focus" ) );
			input.value = "exa mple";
			input.dispatchEvent( new Event( "input" ) );
			input.dispatchEvent( new Event( "blur" ) );
			fixture.detectChanges();
			expect( comp.inputValidationDirective.touched ).toBeDefined();
			expect( comp.inputValidationDirective.touched ).toEqual( true );
		} );

		it( "Should say it's NOT been touched", () => {
			input.dispatchEvent( new Event( "focus" ) );
			fixture.detectChanges();
			expect( comp.inputValidationDirective.touched ).toBeDefined();
			expect( comp.inputValidationDirective.touched ).toEqual( false );
		} );

		it( "Should say it's pristine", () => {
			input.dispatchEvent( new Event( "focus" ) );
			input.dispatchEvent( new Event( "blur" ) );
			fixture.detectChanges();
			expect( comp.inputValidationDirective.pristine ).toBeDefined();
			expect( comp.inputValidationDirective.pristine ).toEqual( true );
		} );

		it( "Should say it's dirty", () => {
			input.dispatchEvent( new Event( "focus" ) );
			input.value = "exa mple";
			input.dispatchEvent( new Event( "input" ) );
			input.dispatchEvent( new Event( "blur" ) );
			fixture.detectChanges();
			expect( comp.inputValidationDirective.pristine ).toBeDefined();
			expect( comp.inputValidationDirective.pristine ).toEqual( false );
		} );


	} );
}