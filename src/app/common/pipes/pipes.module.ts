import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Pipes
import { GetSlugPipe } from "./get-slug.pipe";
import { DecodeURIPipe } from "./decode-uri.pipe";
import { FormatDurationPipe } from "app/common/pipes/format-duration.pipe";

@NgModule( {
	imports: [
		CommonModule,
	],
	declarations: [
		GetSlugPipe,
		DecodeURIPipe,
		FormatDurationPipe,
	],
	exports: [
		GetSlugPipe,
		DecodeURIPipe,
		FormatDurationPipe,
	],
	providers: []
} )

export class PipesModule {
}