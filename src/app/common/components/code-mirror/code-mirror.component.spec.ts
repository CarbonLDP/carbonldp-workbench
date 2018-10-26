import { Component, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";

import * as CodeMirror from "codemirror";
import { Class as CodeMirrorComponent } from "./code-mirror.component";

export function codeMirrorSpecs() {

	describe( "CodeMirrorComponent", () => {

		let comp:TestComponent;
		let fixture:ComponentFixture<TestComponent>;

		@Component( {
			template: `
				<app-code-mirror #normal class="normal" [readOnly]="readOnly" [noCursor]="noCursor" [showLineNumbers]="showLineNumbers" [scroll]="scroll"></app-code-mirror>
				<app-code-mirror #input class="input" [value]="'My passed content'"></app-code-mirror>
				<app-code-mirror #projected class="projected">My projected content</app-code-mirror>`
		} )
		class TestComponent {

			readOnly:boolean = false;
			noCursor:boolean = false;
			showLineNumbers:boolean = true;
			scroll:boolean = true;
			@ViewChild( "normal" ) normalCodeMirror:CodeMirrorComponent;
			@ViewChild( "input" ) inputCodeMirror:CodeMirrorComponent;
			@ViewChild( "projected" ) projectedCodeMirror:CodeMirrorComponent;

		}

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				imports: [ FormsModule ],
				declarations: [ CodeMirrorComponent, TestComponent, ],
			} ).compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( TestComponent );
			comp = fixture.componentInstance;
			fixture.detectChanges();
		} );

		it( "Can be set to read-only mode", () => {

			let content:string = "";
			let doc:CodeMirror.Doc = comp.normalCodeMirror.codeMirror.getDoc();
			let cursor:CodeMirror.Position = doc.getCursor(); // gets the line number in the cursor position
			doc.replaceRange( "my line of code", CodeMirror.Pos( cursor.line ) ); // adds a new line
			content = fixture.nativeElement.querySelector( ".CodeMirror-line" ).innerText;
			expect( content ).toEqual( "my line of code" );
			expect( comp.normalCodeMirror.codeMirror.getOption( "readOnly" ) ).toEqual( false );


			comp.readOnly = true;
			spyOn( comp.normalCodeMirror, "ngOnChanges" ).and.callThrough();
			fixture.detectChanges();
			expect( comp.normalCodeMirror.ngOnChanges ).toHaveBeenCalled();
			expect( comp.normalCodeMirror.codeMirror.getOption( "readOnly" ) ).toEqual( true );
		} );

		it( "Should not display cursor when noCursor is set to true", () => {

			expect( comp.normalCodeMirror.codeMirror.getOption( "readOnly" ) ).toEqual( false );


			comp.noCursor = true;
			spyOn( comp.normalCodeMirror, "ngOnChanges" ).and.callThrough();
			fixture.detectChanges();
			expect( comp.normalCodeMirror.ngOnChanges ).toHaveBeenCalled();
			expect( comp.normalCodeMirror.codeMirror.getOption( "readOnly" ) ).toEqual( "nocursor" );
		} );

		it( "Should not display lines numbers when showLineNumbers is set to false", () => {

			let lines:NodeList = comp.normalCodeMirror.element.nativeElement.querySelectorAll( ".CodeMirror-linenumber" );
			expect( comp.normalCodeMirror.codeMirror.getOption( "lineNumbers" ) ).toEqual( true );
			expect( lines.length ).toBeGreaterThan( 0 );


			comp.normalCodeMirror.ngOnDestroy();
			comp.showLineNumbers = false;
			fixture.detectChanges();
			comp.normalCodeMirror.ngAfterContentInit();
			expect( comp.normalCodeMirror.codeMirror.getOption( "lineNumbers" ) ).toEqual( false );
			lines = comp.normalCodeMirror.element.nativeElement.querySelectorAll( ".CodeMirror-linenumber" );
			expect( lines.length ).toEqual( 0 );
		} );

		it( "Should have height='auto' when scroll is set to false", () => {

			let codeMirrorElement:HTMLElement = comp.normalCodeMirror.element.nativeElement.children[ 0 ];
			expect( codeMirrorElement.style.height ).not.toEqual( "auto" );


			comp.normalCodeMirror.ngOnDestroy();
			comp.scroll = false;
			fixture.detectChanges();
			comp.normalCodeMirror.ngAfterContentInit();
			codeMirrorElement = comp.normalCodeMirror.element.nativeElement.children[ 0 ];
			expect( codeMirrorElement.style.height ).toEqual( "auto" );
		} );

		it( "Should have projected content inside", () => {

			expect( comp.inputCodeMirror.codeMirror.getValue().trim() ).toEqual( "My passed content" );
			expect( comp.projectedCodeMirror.codeMirror.getValue().trim() ).toEqual( "My projected content" );

		} );

		it( "Should emit value when value change", ( done ) => {

			spyOn( comp.normalCodeMirror.valueChange, "emit" ).and.callThrough();

			comp.normalCodeMirror.valueChange.subscribe( ( value:string ) => {

				expect( value ).toEqual( "My CHANGED value" );

				done();
			} );

			comp.normalCodeMirror.codeMirror.setValue( "My CHANGED value" );

		} );

		it( "Should left value when component is destroyed", () => {

			let codeMirrorValue:string = comp.inputCodeMirror.codeMirror.getValue();
			comp.inputCodeMirror.ngOnDestroy();
			expect( comp.inputCodeMirror.element.nativeElement.innerHTML.trim() ).toEqual( codeMirrorValue );

		} );

	} );

}
