import { Directive, ElementRef, AfterViewInit } from "@angular/core";

import Highlight from "highlight.js";
// import "highlight.js/styles/tomorrow-night.css";

@Directive( {
	selector: "[cwHighlight]",
} )
export class HighlightDirective implements AfterViewInit {
	constructor( private element:ElementRef ) {}

	ngAfterViewInit():void {
		let html:string = this.element.nativeElement.innerHTML ? this.element.nativeElement.innerHTML : "";
		this.element.nativeElement.innerHTML = this.normalizeTabs( html );

		Highlight.configure( {
			tabReplace: "    ",
		} );
		Highlight.highlightBlock( this.element.nativeElement );
	}

	private normalizeTabs( value:string ):string {
		let lines:string[] = value.split( /\n/gm );

		if( ! lines[ 0 ].trim() ) lines.shift();
		if( lines.length > 0 && ! lines[ lines.length - 1 ].trim() ) lines.pop();

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
}

