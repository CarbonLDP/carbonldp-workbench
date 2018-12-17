import { customValidatorsSpecs } from "./custom-validators.spec";
import { inputValidationSpecs } from "./input-validation.directive.spec";


export function directivesSpecs() {
	describe( "DirectivesModule", () => {
		customValidatorsSpecs();

		inputValidationSpecs();
	} );
}
