import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Pipes
import { CSSVarPipe } from "./css-var.pipe";
import { GetSlugPipe } from "./get-slug.pipe";
import { DecodeURIPipe } from "./decode-uri.pipe";
import { FormatDurationPipe } from "app/common/pipes/format-duration.pipe";

@NgModule( {
	imports: [
		CommonModule,
	],
	declarations: [
		CSSVarPipe,
		GetSlugPipe,
		DecodeURIPipe,
		FormatDurationPipe,
	],
	exports: [
		CSSVarPipe,
		GetSlugPipe,
		DecodeURIPipe,
		FormatDurationPipe,
	],
	providers: []
} )

export class PipesModule {
}
