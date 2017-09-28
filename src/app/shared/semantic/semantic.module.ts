import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Components
import { TabComponent } from "./tab.component";
import { TabsComponent } from "./tabs.component";
import { CollapsibleDirective, CollapsibleTitleDirective, CollapsibleContentDirective } from "./collapsible.directive";


@NgModule( {
	imports: [ CommonModule ],
	declarations: [
		TabComponent,
		TabsComponent,
		CollapsibleDirective,
		CollapsibleTitleDirective,
		CollapsibleContentDirective
	],
	exports: [
		TabComponent,
		TabsComponent,
		CollapsibleDirective,
		CollapsibleTitleDirective,
		CollapsibleContentDirective
	],
} )

export class SemanticModule {

}