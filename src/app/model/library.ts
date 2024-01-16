import { ProcessGroup } from './assembler/processGroup';
import { Process } from './assembler/process';
import { CreationGroup } from './assembler/creationGroup';
import { Creation } from './assembler/creation';
import { Scene } from './assembler/scene';

export class Library {
	public ProcessGroup: ProcessGroup = new ProcessGroup();
	public CreationGroup: CreationGroup[] = [];

	constructor() { }

	createFromJson(data) {
		this.ProcessGroup = new ProcessGroup();
		this.ProcessGroup.createFromJson(data.ProcessGroup);
		for (let creationGroupData of data.CreationGroup) {
			var creationGroup: CreationGroup = new CreationGroup();
			creationGroup.createFromJson(creationGroupData);
			this.CreationGroup.push(creationGroup);
		}
	};

	public getCreation(id: string): Creation {
		for(let creationGroup of this.CreationGroup) {
			var creation: Creation = creationGroup.getCreation(id);
			if( creation ) {
				return creation;
			}
		}
		return null;
	}

	public getProcess(id: string): Process {
		for(let process of this.ProcessGroup.Process) {
			if( process.id === id ) {
				return process;
			}
		}
		return null;
	}
	
	public getMaterialList(): Scene[] {
		return this.getProcess("material").Scene;
	}

	public getReference(value: string): Scene {
		return this.ProcessGroup.getReference(value);
	}

}
