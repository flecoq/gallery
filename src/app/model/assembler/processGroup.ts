import { Process } from './process';
import { Scene } from './scene';
import { Action } from './action';

export class ProcessGroup {
	Process: Process[] = [];

	constructor() { }

	public addProcess(process: Process): void {
		this.Process.push(process);
	}

	public createFromJson(data): void {
		if (data.Process) {
			for (let processData of data.Process) {
				var process = new Process();
				process.createFromJson(processData);
				this.addProcess(process);
			}
		}
	}

	public getProcess(id: string): Process {
		for (let process of this.Process) {
			if (process.id == id) {
				return process;
			}
		}
		return null;
	}

	public getProcessByType(type: string): Process {
		for (let process of this.Process) {
			if (process.type === type) {
				return process;
			}
		}
		return null;
	}

	public getReference(value: string): Scene {
		var values = value.split('.');
		for (let process of this.Process) {
			if (process.type === values[0]) {
				var result: Scene = process.getScene(values[1]);
				if (result) {
					return result;
				}
			}
		}
		return null;
	}

	public getTemplate(value: string): Scene {
		for (let process of this.Process) {
			var result: Scene = process.getScene(value);
			if (result) {
				return result;
			}
		}
		return null;
	}

	public getActionByCriteria(value: string, criteria: string): Action {
		for (let process of this.Process) {
			var result: Action = process.getActionByCriteria(value, criteria);
			if (result) {
				return result;
			}
		}
		return null;
	}

}
