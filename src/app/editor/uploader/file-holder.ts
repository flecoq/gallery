import { FileServer } from "../../model/server/fileServer"
import { Creation } from "../../model/assembler/creation"

export class FileHolder {
	public pending = false;
	public serverResponse: { status: number, response: Response };

	constructor(public src: string, public file: File) {
	}

	public getType(): string {
		var values: string[] = this.file.name.split(".");
		return values.length == 2 ? values[1] : null;
	}

	public getAssetType(): string {
		var type: string = this.getType().toLowerCase();
		if (type ==="jpg" || type ==="jpeg" || type ==="png") {
			return "picture"
		} else if (type ==="gltf" || type ==="bin" || type ==="obj" || type ==="mlt") {
			return "object"
		}
	}

	public getCreationFilename(account: number): string {
		return "account/account_" + account + "/" + this.getAssetType() + "/" + this.file.name;
	}

	public getCreationThumb(account: number): string {
		return "account/account_" + account + "/" + this.getAssetType() + "/thumb/" + this.file.name;
	}
	
	public toFileServer(account: number): FileServer {
		var path: string= "../../account/account_" + account + "/" + this.getAssetType() + "/";
		var result: FileServer = new FileServer(this.file.name, this.src, path, this.getType());
		if( this.getAssetType() === "picture") {
			result.size = 200;
		}
		return result;
	}
	
	public isCreation(): boolean {
		var type: string = this.getType();
		return !(type === "bin") && !(type === "mlt");	
	}
	
	public toCreation(account: number): Creation {
		var type: string = this.getAssetType();
		var result: Creation = new Creation();
		result.id = type + account + Math.trunc(Math.random()*1000);
		result.addInfo("type", type);
		result.addInfo("title", "title");
		if( type === "picture") {
			result.filename = this.getCreationFilename(account);
			result.addInfo("thumb", this.getCreationThumb(account));
		} else if( type === "object") {
			result.filename = this.file.name;
			result.addInfo("url", "account/account_" + account + "/" + this.getAssetType() + "/");
		}
		return result;
	}
}
