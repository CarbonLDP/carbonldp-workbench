import { literalSpecs } from "./literals/literal.component.spec";
import { literalsSpecs } from "./literals/literals.component.spec";
import { pointerSpecs } from "./pointers/pointer.component.spec";
import { pointersSpecs } from "./pointers/pointers.component.spec";
import { listSpecs } from "./lists/list.component.spec";
import { listsSpecs } from "./lists/lists.component.spec";

describe( "SharedModule", () => {

	describe( "Literals", () => {
		literalSpecs();

		literalsSpecs();
	} );

	describe( "Pointers", () => {
		pointerSpecs();

		pointersSpecs();
	} );

	describe( "Lists", () => {
		listSpecs();

		listsSpecs();
	} );
} );