import { customValidatorsSpecs } from "./custom-validators.spec";
import { grayedOutSpecs } from "./grayed-out.directive.spec";
import { inputValidationSpecs } from "./input-validation.directive.spec";


export function directivesSpecs() {
	describe( "DirectivesModule", () => {

		customValidatorsSpecs();

		grayedOutSpecs();

		inputValidationSpecs();

	} );
}