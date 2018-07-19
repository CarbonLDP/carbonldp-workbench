import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pipes
import { FragmentPipe } from "./fragment.pipe";
import { DecodeURIPipe } from "./decode-uri.pipe";


@NgModule( {
	imports: [
		CommonModule,
	],
	declarations: [
		FragmentPipe,
		DecodeURIPipe
	],
	exports: [
		FragmentPipe,
		DecodeURIPipe
	],
	providers: []
} )

export class PipesModule {
}