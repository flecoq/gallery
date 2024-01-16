import { Placeholder } from "./placeholder";
import { WallObject } from "../../../process/scene/mesh/wallObject";
import { CompositeObject } from "../../../process/scene/mesh/composite/compositeObject";
import { Point } from "../../../process/utils/point";
import { Vector3 } from '@babylonjs/core';
import { EngineService } from "../../../engine/engine.service";
import { Logger } from '../../../process/utils/logger';

export class PlaceholderGroup {

	public placeholderList: Placeholder[] = [];
	public selected: Placeholder;
	public isVisible: boolean;

	constructor() { }

	public addPlaceholder(placeholder: Placeholder): void {
		this.placeholderList.push(placeholder);
	}

	public createFromWall(wall: WallObject, engine: EngineService): void {
		this.clear();
		var grid: Point = wall.getParamValuePoint("placeholder.grid");
		if (grid) {
			Logger.info("PlaceholderGroup", "createFromWall(wall: " + wall.name + ", grid: " + grid.toString() + ")");
			var radius = Math.min(wall.length / (grid.x + 1), wall.height / (grid.y + 1)) / 2;
			var width = wall.length / (grid.x + 1) * 0.6;
			for (let u = 1; u <= grid.x; u++) {
				for (let v = 1; v <= grid.y; v++) {
					var placeholder: Placeholder = new Placeholder(wall.localToGlobalPivot(0, v / (grid.y + 1), u / (grid.x + 1)), radius, "wall", engine);
					placeholder.width = width;
					this.addPlaceholder(placeholder);
				}
			}
		} else {
			var placeholder: Placeholder = new Placeholder(wall.localToGlobalPivot(0, 0.5, 0.5), wall.length / 2, "wall", engine);
			placeholder.width = wall.length / 3;
			this.addPlaceholder(placeholder);
			this.selected = placeholder;
		}
	}


	public createFromCompositeObject(compositeObject: CompositeObject, engine: EngineService): void {
		this.clear();
		var grid: Point = compositeObject.getParamValuePoint("placeholder.grid");
		var scale: Vector3 = compositeObject.getParamValueVector("local.scale");
		if (scale) {
			if (grid) {
				Logger.info("PlaceholderGroup", "createFromCompositeObject(compositeObject: " + compositeObject.name + ", grid: " + grid.toString() + ")");
				var radius = Math.min(scale.z / (grid.x + 1), scale.y / (grid.y + 1)) / 2;
				var width = scale.z / (grid.x + 1) * 0.6;
				for (let u = 1; u <= grid.x; u++) {
					for (let v = 1; v <= grid.y; v++) {
						var placeholder: Placeholder = new Placeholder(compositeObject.localToGlobalPivot(0, v / (grid.y + 1), u / (grid.x + 1)), radius, "composite", engine);
						placeholder.width = width;
						this.addPlaceholder(placeholder);
					}
				}
			} else {
				var placeholder: Placeholder = new Placeholder(compositeObject.localToGlobalPivot(0, 0.5, 0.5), scale.z / 2, "composite", engine);
				placeholder.width = scale.z / 3;
				this.addPlaceholder(placeholder);
				this.selected = placeholder;
			}
		}
	}
	public clear(): void {
		for (let placeholder of this.placeholderList) {
			placeholder.delete();
		}
		this.placeholderList = [];
		this.isVisible = false;
	}

	public visible(value: boolean): void {
		if (value != this.isVisible) {
			for (let placeholder of this.placeholderList) {
				placeholder.visible(value);
			}
		}
		this.isVisible = value;
	}

	public select(a: Vector3): void {
		this.selected = null;
		for (let placeholder of this.placeholderList) {
			if (placeholder.isSelected(a)) {
				this.selected = placeholder;
				placeholder.highlight(true);
			} else {
				placeholder.highlight(false);
			}
		}
	}

}