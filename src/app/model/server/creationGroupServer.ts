export class CreationGroupServer {
    public id: string;
    public parent: string;
    public content: string;

    constructor(id: string, parent: string, content: string) {
		this.id = id;
		this.parent = parent;
		this.content = content;
	}
}
