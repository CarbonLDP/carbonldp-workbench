export interface DocumentTreeNode {
	id:string;
	children:string[];
	types:string[];
	created:Date,
	modified:Date,
}

/**
 * A factory function that creates a Document
 */
export function createDocumentTreeNode(
	{
		id = null,
		children = [],
		types = [],
		created = null,
		modified = null,
	}:Partial<DocumentTreeNode>
):DocumentTreeNode {
	return {
		id,
		children,
		types,
		created,
		modified,
	};
}
