
export class FileServer {
    public filename: string;
    public content: any;
	public path: string;
	public type: string; 
	public size:number;
	
    constructor(filename: string, data: any, path: string, type: string) {
		this.filename = filename;
		this.content = data;
		this.path = path;
		this.type = type;
	}
}
