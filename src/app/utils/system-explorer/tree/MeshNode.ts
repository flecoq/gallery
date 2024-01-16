import { Pivot } from '../../../process/utils/pivot';
import { Logger } from '../../../process/utils/logger';
import { TransformNode, Mesh, Material, Vector3, BoundingBox } from "@babylonjs/core";
import { FormatUtils } from '../../../process/utils/formatUtils';

export class MeshNode {
	public name: string;
	public children: MeshNode[] = [];
	public transformNode: TransformNode;
	public local: Pivot;
	public global: Pivot;
	public material: Material;
	public selected: boolean;

	// bounding box
	public minLocal: Vector3 = null;
	public minGlobal: Vector3 = null;
	public maxLocal: Vector3 = null;
	public maxGlobal: Vector3 = null;

	constructor(transformNode: TransformNode, parent: Pivot) {
		if (transformNode != null) {
			Logger.info("MeshNode", "create: " + transformNode.name);
			this.transformNode = transformNode;
			this.local = Pivot.createFromMesh(transformNode);
			Logger.info("MeshNode", "Node " + transformNode.name);
			Logger.info("MeshNode", "-local: " + FormatUtils.vectorToLog(this.local.o));
			this.global = parent.localToGlobalPivot(this.local);
			Logger.info("MeshNode", "-global: " + FormatUtils.vectorToLog(this.global.o));
			if (this.transformNode instanceof Mesh) {
				this.material = (this.transformNode as Mesh).material;
				var boundingBox: BoundingBox = (transformNode as Mesh).getBoundingInfo().boundingBox;
				this.minGlobal = boundingBox.minimumWorld;
				this.minLocal = boundingBox.minimum;
				this.maxGlobal = boundingBox.maximumWorld;
				this.maxLocal = boundingBox.maximum;
				Logger.info("MeshNode", "-minGlobal: " + FormatUtils.vectorToLog(boundingBox.minimumWorld));
				Logger.info("MeshNode", "-maxGlobal: " + FormatUtils.vectorToLog(boundingBox.maximumWorld));
			} 
			this.name = transformNode.name + " (" + transformNode.constructor.name + ")";
			for (let node of transformNode.getChildren()) {
				var child: MeshNode = new MeshNode(node as TransformNode, this.global);
				this.children.push(child);
				if (this.minGlobal == null) {
					this.minGlobal = child.minGlobal;
					this.maxGlobal = child.maxGlobal;
				} else if (child.minGlobal != null) {
					this.minGlobal = Vector3.Minimize(this.minGlobal, child.minGlobal);
					this.maxGlobal = Vector3.Maximize(this.maxGlobal, child.maxGlobal);
				}
			}
		}
	}

	public select(selected: boolean, material: Material): void {
		if (this.transformNode instanceof Mesh && this.selected != selected) {
			this.transformNode.material = selected ? material : this.material;
			this.transformNode.showBoundingBox = selected;
		}
		for (let child of this.children) {
			child.select(selected, material);
		}
		this.selected = selected;
	}

	public visible(visibled: boolean, selected: boolean): void {
		if (this.transformNode instanceof Mesh && (selected || !this.selected)) {
			this.transformNode.isVisible = visibled;
		}
		for (let child of this.children) {
			child.visible(visibled, selected);
		}
	}

	public static create(name: string): MeshNode {
		var result: MeshNode = new MeshNode(null, new Pivot());
		result.name = name;
		return result;
	}
}