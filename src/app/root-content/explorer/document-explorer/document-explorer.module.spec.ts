import { literalSpecs } from "./literals/literal.component.spec";
import { literalsSpecs } from "./literals/literals.component.spec";
import { pointerSpecs } from "./pointers/pointer.component.spec";

describe( "SharedModule", () => {

	describe( "Literals", () => {
		literalSpecs();

		literalsSpecs();
	} );

	describe( "Pointers", () => {
		pointerSpecs();
	} );
} );