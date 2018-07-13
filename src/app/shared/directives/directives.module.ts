import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { HighlightDirective } from "./highlight.directive";
import { EmailValidator, MatchValidator } from "./custom-validators";
import { SlugValidator, DomainValidator } from "./custom-validators";
import { URIValidator, FragmentValidator, URIFragmentValidator } from "./custom-validators";
import { RequiredIfValidator, RequiredDirective } from "./custom-validators";
import { InputValidationDirective } from "./input-validation.directive";
import { GrayedOutDirective } from "./grayed-out.directive";

//TODO: Merge directives module with panel module, after solving components collisions between WebsiteModule and PanelModule

@NgModule( {
	imports: [
		CommonModule,
	],
	declarations: [
		EmailValidator,
		MatchValidator,
		SlugValidator,
		DomainValidator,
		URIValidator,
		FragmentValidator,
		URIFragmentValidator,
		HighlightDirective,
		InputValidationDirective,
		RequiredIfValidator,
		RequiredDirective,
		GrayedOutDirective,
	],
	exports: [
		EmailValidator,
		MatchValidator,
		DomainValidator,
		SlugValidator,
		URIValidator,
		FragmentValidator,
		URIFragmentValidator,
		HighlightDirective,
		InputValidationDirective,
		RequiredIfValidator,
		RequiredDirective,
		GrayedOutDirective,
	],
	providers: []
} )

export class DirectivesModule {
}