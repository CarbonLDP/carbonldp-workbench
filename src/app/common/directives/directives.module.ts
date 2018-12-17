import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
// Components
import { HighlightDirective } from "./highlight.directive";
import { DomainValidator, EmailValidator, FragmentValidator, MatchValidator, RequiredDirective, RequiredIfValidator, SlugValidator, URIFragmentValidator, URIValidator } from "./custom-validators";
import { InputValidationDirective } from "./input-validation.directive";
import { FocusedDirective } from "./focused.directive";

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
		FocusedDirective,
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
		FocusedDirective,
	],
	providers: []
} )

export class DirectivesModule {
}
