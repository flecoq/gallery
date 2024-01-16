export class RoomServer {
    public id: string;
    public parent: string;
    public accessing: string = "1";
    public status: string = "1";
    public content: string;

    constructor(id: string, parent: string, content: string) {
		this.id = id;
		this.parent = parent;
		this.content = content;
	}
}
