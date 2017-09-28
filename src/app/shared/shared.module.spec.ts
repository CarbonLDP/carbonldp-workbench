import { directivesSpecs } from "./directives/directives.module.spec";
import { errorLabelSpecs } from "./messages-area/error/error-label.component.spec";
import { errorMessageGeneratorSpecs } from "./messages-area/error/error-message-generator.spec";
import { messageComponentSpecs } from "./messages-area/message.component.spec";
import { messageAreaComponentSpecs } from "./messages-area/messages-area.component.spec";
import { paginatorSpecs } from "./paginator/paginator.component.spec";
import { messageAreaServiceSpecs } from "./messages-area/messages-area.service.spec";
import { codeMirrorSpecs } from "./code-mirror/code-mirror.component.spec";

describe( "SharedModule", () => {

	directivesSpecs();

	errorLabelSpecs();

	errorMessageGeneratorSpecs();

	messageComponentSpecs();

	messageAreaComponentSpecs();

	paginatorSpecs();

	messageAreaServiceSpecs();

	codeMirrorSpecs();
} );