export class ActionAllow {
	
	public edit: boolean;
	public gizmo: boolean;
	public bottomTool: boolean;
	
	constructor(gizmo: boolean, bottomTool: boolean) {
		this.gizmo = gizmo ? gizmo : false;
		this.bottomTool = bottomTool;
	}
	
	public isEdit(): boolean {
		return this.edit;
	}

	public isVisit(): boolean {
		return !this.edit;
	}

	public pickable(): boolean {
		return !this.edit || (this.edit && (this.gizmo || this.bottomTool));
	}
	
	public isGizmo(): boolean {
		return this.edit && this.gizmo;
	}
	
	public isBottomTool(): boolean {
		return this.edit && this.bottomTool;
	}
	
}