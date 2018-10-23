import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChange } from "@angular/core";

import { TabComponent } from "./tab.component";

@Component( {
	selector: "sui-tabs",
	templateUrl: "./tabs.component.html",
	styleUrls: [ "./tabs.component.scss" ],
} )
export class TabsComponent implements AfterContentInit, OnChanges {
	@ContentChildren( TabComponent ) tabs:QueryList<TabComponent>;

	@Input( "activeTab" ) activeTab:number = 0;
	@Output( "activeTabChange" ) activeTabChange:EventEmitter<number> = new EventEmitter<number>();

	private justChanged:boolean = false;
	titles:string[] = [];

	ngAfterContentInit():void {
		this.reloadTitles();
		this.activateTab( 0 );
		this.activateDropdown();
		this.tabs.changes.subscribe( this.reloadTitles );
	}

	ngOnChanges( changes:{ [ key:string ]:SimpleChange; } ):void {
		if( "activeTab" in changes ) {
			this.justChanged = true;
			this.activateTab( changes[ "activeTab" ].currentValue );
		}
	}

	activateDropdown():void {
		$( ".ui.dropdown" ).dropdown();
	};

	reloadTitles():void {
		this.titles = this.tabs.toArray().filter( tab => tab.title ).map( tab => tab.title );
	}

	activateTab( index:number = 0 ):void {
		this.activeTab = index;

		if( this.tabs ) {
			this.tabs.toArray().forEach( ( tab, index ) => {
				tab.active = this.activeTab === index;
			} );
		}

		if( ! this.justChanged ) this.activeTabChange.emit( index );
		else this.justChanged = false;
	}

	onTitleClick( titleIndex:number ):void {
		this.activateTab( titleIndex );
	}
}


