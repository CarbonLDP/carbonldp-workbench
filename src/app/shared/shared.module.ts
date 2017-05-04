import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";


// Components


// Modules
import { DirectivesModule } from "./directives/directives.module";
import { SemanticModule } from "./semantic/semantic.module";


@NgModule( {
	imports: [
		BrowserModule,

	],
	declarations: [],
	providers: [],
	exports: [
		DirectivesModule,
		SemanticModule
	]
} )

export class SharedModule {
}