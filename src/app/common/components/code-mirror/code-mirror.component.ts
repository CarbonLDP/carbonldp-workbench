import { AfterContentInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChange } from "@angular/core";

import * as CodeMirror from "codemirror";

import "codemirror/mode/css/css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/sparql/sparql";
import "codemirror/mode/xml/xml";
import "codemirror/mode/turtle/turtle";
import { ParserErrorObject } from "app/common/components/sparql-editor/sparql-editor.component";

@Component( {
	selector: "app-code-mirror",
	template: "<ng-content></ng-content>",
	styleUrls: [ "./code-mirror.component.scss" ]
} )
export class Class implements AfterContentInit, OnChanges, OnDestroy {
	element:ElementRef;

	@Input() mode:string = Mode.JAVASCRIPT;
	@Input() readOnly:boolean = false;
	@Input() noCursor:boolean = false;
	@Input() showLineNumbers:boolean = true;
	@Input() scroll:boolean = true;

	@Input() value:string = "";
	@Output() valueChange:EventEmitter<string> = new EventEmitter<string>();

	@Input() codeMirror:CodeMirror.Editor;
	@Output() codeMirrorChange:EventEmitter<CodeMirror.Editor> = new EventEmitter<CodeMirror.Editor>();

	private textMarker:CodeMirror.TextMarker;

	@Input() set error( { message, start, end }:ParserErrorObject ) {
		if( message !== "" ) {
			this.clearTextMarker();
			let options:CodeMirror.TextMarkerOptions = { className: "cw-code-mirror--syntaxError" };
			this.textMarker = this.codeMirror.markText( start, end, options );
		} else {
			this.clearTextMarker();
		}
	}

	private clearTextMarker():void {
		if( this.textMarker )
			this.textMarker.clear();
	}

	private internallyChanged:boolean = false;
	private lastUpdates:string[] = [];

	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngOnDestroy() {
		this.element.nativeElement.innerHTML = this.codeMirror.getValue();
	}

	ngAfterContentInit():void {
		if( ! this.value ) this.value = this.element.nativeElement.innerHTML;
		if( ! ! this.value ) this.value = this.normalizeTabs( this.value );
		else this.value = "";

		this.element.nativeElement.innerHTML = "";
		this.codeMirror = CodeMirror( this.element.nativeElement, {
			lineNumbers: this.showLineNumbers,
			indentWithTabs: true,
			smartIndent: false,
			electricChars: false,
			mode: this.mode,
			theme: "mbo",
			value: this.value,
			readOnly: this.readOnly
		} );
		this.codeMirrorChange.emit( this.codeMirror );

		if( ! this.scroll ) {
			this.element.nativeElement.children[ 0 ].style.height = "auto";
		}

		this.codeMirror.on( "change", ( changeObject ) => {
			if( this.internallyChanged ) {
				this.internallyChanged = false;
				return;
			}

			let lastUpdate:string = this.codeMirror.getValue();
			if( lastUpdate === this.value ) return;

			this.value = lastUpdate;
			this.lastUpdates.push( lastUpdate );
			this.valueChange.emit( lastUpdate );
		} );
	}

	ngOnChanges( changeRecord:any ):void {
		if( ! this.codeMirror ) return;

		if( "readOnly" in changeRecord ) {
			let change:SimpleChange = changeRecord.readOnly;
			this.setReadOnly( change.currentValue );
		}

		if( "noCursor" in changeRecord ) {
			let change:SimpleChange = changeRecord.noCursor;
			this.setNoCursor( change.currentValue );
		}

		if( "value" in changeRecord ) {
			if( this.lastUpdates.length > 0 && this.lastUpdates[ 0 ] === changeRecord.value.currentValue ) {
				this.lastUpdates.shift();
			} else {
				this.internallyChanged = true;
				this.lastUpdates = [];
				this.codeMirror.setValue( changeRecord.value.currentValue );
			}
		}

	}

	private normalizeTabs( value:string ):string {
		let lines:string[] = value.split( /\n/gm );

		if( ! lines[ 0 ].trim() ) lines.shift();
		if( ! lines[ lines.length - 1 ].trim() ) lines.pop();

		let containsSomething:boolean = lines.reduce( ( previous, line ) => previous || ! ! line.trim(), false );
		if( ! containsSomething ) return "";

		let tabs:boolean = null;
		let extraIndentation:number = null;
		for( let line of lines ) {
			if( ! line.trim() ) continue;
			if( tabs === null ) tabs = line.startsWith( "\t" );
			let indentation:number = this.getIndentation( line, tabs );
			if( extraIndentation === null || extraIndentation > indentation ) extraIndentation = indentation;
		}

		this.removeIndentation( lines, extraIndentation, tabs );

		return lines.length ? lines.join( "\n" ) : "";
	}

	private getIndentation( line:string, tabs:boolean = true ):number {
		let indentationChar:string = tabs ? "\t" : " ";
		for( var i:number = 0, length = line.length; i < length; i ++ ) {
			if( line.charAt( i ) !== indentationChar ) break;
		}
		return i;
	}

	private removeIndentation( lines:string[], indentation:number, tabs:boolean = true ):string[] {
		for( let i:number = 0, length = lines.length; i < length; i ++ ) {
			let line:string = lines[ i ];
			if( ! line.trim() ) continue;
			lines[ i ] = line.substring( indentation );
		}
		return lines;
	}

	private setReadOnly( readOnly:boolean ):void {
		this.codeMirror.setOption( "readOnly", readOnly );
	}

	private setNoCursor( noCursor:boolean ):void {
		if( noCursor ) this.codeMirror.setOption( "readOnly", "nocursor" );
		else this.setReadOnly( this.readOnly );
	}
}

export enum Mode {
	CSS = "text/css",
	JAVASCRIPT = "text/javascript",
	JSONLD = "application/ld+json",
	JSONDRDF = "application/json",
	N3 = "text/turtle",
	RDFXML = "application/xml",
	CSV = "text/plain",
	TSV = "text/plain",
	SPARQL = "application/sparql-query",
	XML = "application/xml",
	TURTLE = "text/turtle",
}
