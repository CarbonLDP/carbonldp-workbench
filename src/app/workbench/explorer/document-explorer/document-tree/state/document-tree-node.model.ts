export interface DocumentTreeNode {
	id:string;
	parent:string | null;
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
		parent = null,
		children = [],
		types = [],
		created = null,
		modified = null,
	}:Partial<DocumentTreeNode>
):DocumentTreeNode {
	return {
		id,
		parent,
		children,
		types,
		created,
		modified,
	};
}
