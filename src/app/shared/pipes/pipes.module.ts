import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pipes
import { FragmentPipe } from "./fragment.pipe";
import { DecodeURIPipe } from "./decode-uri.pipe";
import { URIToSlugPipe } from "./uri-to-slug.pipe";


@NgModule( {
	imports: [
		CommonModule,
	],
	declarations: [
		FragmentPipe,
		DecodeURIPipe,
		URIToSlugPipe
	],
	exports: [
		FragmentPipe,
		DecodeURIPipe,
		URIToSlugPipe
	],
	providers: []
} )

export class PipesModule {
}