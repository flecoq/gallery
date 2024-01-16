import { Pivot } from "../../utils/pivot";
import { Mesh, Vector3, StandardMaterial, Color3 } from '@babylonjs/core';
import { EngineService } from "../../../engine/engine.service";
import { Logger } from '../../../process/utils/logger';

export class Placeholder {

	public static size: number = 0.10;
	
	public pivot: Pivot;
	public mesh: Mesh;
	public box1: Mesh;
	public box2: Mesh;
	public parent: string;
	public isHighlight: boolean;
	public active: boolean = true;
	
	public radius: number;	// radius for select
	public width: number;	// support width
	
	constructor(pivot: Pivot, radius: number, parent: string, engine: EngineService) {
		this.pivot = pivot;
		this.radius = radius;
		this.parent = parent;
		this.box1 = Mesh.CreateBox("placeholder", Placeholder.size, engine.scene);
		this.box2 = Mesh.CreateBox("placeholder", Placeholder.size, engine.scene);
		this.mesh = new Mesh("placeholder", engine.scene);
		this.mesh.addChild(this.box1);
		this.mesh.addChild(this.box2);
		this.box1.position.x = 0.2;
		this.box2.position.x = 0.2;
		var material: StandardMaterial = new StandardMaterial("placeholderMaterial", engine.scene);
		material.emissiveColor = new Color3(1.0, 1.0, 0.0);
		this.box1.material = material;
		this.box2.material = material;
		this.mesh.position = pivot.o;
		this.mesh.rotation = pivot.getEulerAnglesRad();
		engine.viewManager.addMesh(this.mesh);
		this.highlight(false);
		this.visible(false);
	}
	
	public visible(value: boolean): void {
		console.log("visible: "+ value);
		this.mesh.setEnabled(value);
		if( !value ) {
			console.log("hide");
		} 
	}
	
	public highlight(value: boolean): void {
		if( value != this.isHighlight ) {
			if( value ) {
				this.box1.scaling = new Vector3(0.6, 3, 0.6);
				this.box2.scaling = new Vector3(0.6, 0.6, 3);
			} else {
				this.box1.scaling = new Vector3(0.2, 1, 0.2);
				this.box2.scaling = new Vector3(0.2, 0.2, 1);
			}
		}
		this.isHighlight= value;
	}
	
	public delete() {
		this.mesh.dispose();
	}

	public isSelected(a: Vector3): boolean {
		return this.pivot.o.subtract(a).length() < this.radius;
	}
}