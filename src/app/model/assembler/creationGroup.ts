import { Creation } from './creation';
import { CreationGroupServer } from './../server/creationGroupServer';

export class CreationGroup {
    id: string;
    parent: string;
    Creation: Creation[] = [];

	constructor() {}
	
    create(id: string, parent: string) {
		this.id = id;
		this.parent = parent;
	}
	
	public createFromJson(data): void {
		this.id = data.id;
		this.parent = data.parent;
		if( data.Creation) {
			for(let creationData of data.Creation) {
				var creation = new Creation();
				creation.createFromJson(creationData, this.id);
				this.addCreation(creation);
			}
		}
	}
	
	public addCreation(creation: Creation):void {
		this.Creation.push(creation);
	}
	
	public getCreation(id:string): Creation {
		for(let creation of this.Creation) {
			if( creation.id == id) {
				return creation;
			}
		}
		return null;
	}
	
    public toCreationGroupServer() : CreationGroupServer {
		return new CreationGroupServer(this.id, this.parent, JSON.stringify(this));
	}

}
