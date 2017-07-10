import { directivesSpecs } from "./directives/directives.module.spec";
import { errorLabelSpecs } from "./messages-area/error/error-label.component.spec";
import { errorMessageGeneratorSpecs } from "./messages-area/error/error-message-generator.spec";

describe( "SharedModule", () => {

	directivesSpecs();

	errorLabelSpecs();

	errorMessageGeneratorSpecs();

} );