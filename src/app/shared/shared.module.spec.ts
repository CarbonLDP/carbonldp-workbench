import { directivesSpecs } from "./directives/directives.module.spec";
import { errorLabelSpecs } from "./messages-area/error/error-label.component.spec";
import { errorMessageGeneratorSpecs } from "./messages-area/error/error-message-generator.spec";
import { messageComponentSpecs } from "./messages-area/message.component.spec";
import { messageAreaServiceSpecs } from "./messages-area/messages-area.service.spec";

describe( "SharedModule", () => {

	directivesSpecs();

	errorLabelSpecs();

	errorMessageGeneratorSpecs();

	messageComponentSpecs();

	messageAreaServiceSpecs();
} );