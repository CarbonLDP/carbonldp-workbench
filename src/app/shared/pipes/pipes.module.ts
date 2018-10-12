import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Pipes
import { GetSlugPipe } from "./get-slug.pipe";
import { DecodeURIPipe } from "./decode-uri.pipe";

@NgModule( {
	imports: [
		CommonModule,
	],
	declarations: [
		GetSlugPipe,
		DecodeURIPipe,
	],
	exports: [
		GetSlugPipe,
		DecodeURIPipe,
	],
	providers: []
} )

export class PipesModule {
}