import { Component, ContentChildren, QueryList, AfterContentInit } from "@angular/core";

import { CollapsibleDirective } from "./collapsible.directive";

import "semantic-ui/semantic";

@Component( {
	selector: "sui-accordion",
	template: `<ng-content></ng-content>`,
	styles: [ ":host { display:block; } " ],
	host: {
		class: "ui accordion"
	},
} )
export class AccordionComponent implements AfterContentInit {
	@ContentChildren( CollapsibleDirective ) blocks:QueryList<CollapsibleDirective>;

	ngAfterContentInit():void {
		this.subscribeBlocks();
		this.blocks.changes.subscribe( this.subscribeBlocks );
	}

	subscribeBlocks():void {
		let blockArray:CollapsibleDirective[] = this.blocks.toArray();
		for( let i:number = 0, length = blockArray.length; i < length; i ++ ) {
			let block:CollapsibleDirective = blockArray[ i ];
			block.activeChange.subscribe( this.onBlockActive.bind( this, block ) );
		}
	}

	onBlockActive( triggeredBlock:CollapsibleDirective, active:boolean ):void {
		if( ! active ) return;

		this.blocks.forEach( block => {
			if( block === triggeredBlock ) return;

			block.active = false;
		} );
	}
}

