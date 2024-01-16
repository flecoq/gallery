import { DynamicTexture, StandardMaterial, Mesh, Vector3, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import { Point } from "../../utils/point";
import { FormatUtils } from "../../utils/formatUtils";
import { EngineService } from '../../../engine/engine.service';
import { Pivot } from "../../utils/pivot";
import { MeshObject } from "../../scene/mesh/meshObject";

export class DynamicTexturePlane {

	public engine: EngineService;
	public plane: Mesh;
	public dynamicTexture: DynamicTexture;
	public size: Point;
	public resolution: number;
	public ratio: number;
	public parent: MeshObject;

	constructor(size: Point, resolution: number, parent: MeshObject, engine: EngineService) {
		this.size = size;
		this.resolution = resolution;
		this.ratio = size.y / size.x;
		this.engine = engine;
		this.parent = parent;

		var verticalResolution = resolution * this.ratio;
		this.dynamicTexture = new DynamicTexture('DynamicTexture', {width: resolution, height: verticalResolution}, this.engine.scene, true);
		this.dynamicTexture.hasAlpha = true;
		this.plane = Mesh.CreatePlane('TextPlane', 1, engine.scene, true);
		this.plane.scaling = new Vector3(size.x, size.y, 1);
		this.plane.metadata = parent ? parent : this;

		const material = new StandardMaterial('TextPlaneMaterial', engine.scene);
		material.diffuseTexture = this.dynamicTexture;
		this.plane.material = material;
		this.visible(false);
		this.onPickAction();
	}

	public onPickAction(): void {
		this.plane.actionManager = new ActionManager(this.engine.scene);
		this.plane.actionManager.registerAction(
			new ExecuteCodeAction(
				ActionManager.OnPickTrigger,
				function(event) {
					var meshObject: MeshObject = event.meshUnderPointer.metadata;
					this.engine.pickSceneImpl(meshObject);
				}
			)
		);
	}
	
	public clear(): void {
		var context = this.dynamicTexture.getContext();
		context.clearRect(0, 0, this.resolution, this.resolution * this.ratio);
	}
	
	public drawBorder(width: number, color: string): void {
		var context = this.dynamicTexture.getContext();
		//context.beginPath();
		context.lineWidth = width;
		context.strokeStyle = color;
		context.strokeRect(0, 0, this.resolution, this.resolution * this.ratio);
		this.dynamicTexture.update();
	}
	
	public sizeToResPoint(value: Point): Point {
		return new Point(Math.trunc(value.x / this.size.x * this.resolution),
				Math.trunc(value.y / this.size.y * this.resolution * this.ratio));
	}
	
	public sizeToRes(value: number): number {
		return Math.trunc(value / this.size.x * this.resolution);
	}
	
	public setPivot(pivot: Pivot): void {
		this.plane.rotation = pivot.getEulerAnglesRad();
		this.plane.rotation.y += FormatUtils.degToRad(-90);
		this.plane.position = pivot.o;
	}

	public visible(value: boolean): void {
		this.plane.setEnabled(value);
	}
}