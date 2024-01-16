import { Vector3, Vector4, MeshBuilder, Mesh } from "@babylonjs/core";
import { FormatUtils } from '../../../../../process/utils/formatUtils';
import { SceneImpl } from '../../../../../process/scene/sceneImpl';
import { EngineService } from '../../../../../engine/engine.service';
import { Path } from "../../../../../model/assembler/path";

export class Mapper {

	public faceUV: Vector4[] = [];
	public scene: SceneImpl;

	public uDiv;
	public vDiv;

	public constructor(scene: SceneImpl) {
		this.scene = scene;
		for (let param of scene.Param) {
			if (param.name === "uv.face") {
				var values = param.value.split(';');
				this.faceUV.push(new Vector4(FormatUtils.toFloat(values[0]), FormatUtils.toFloat(values[1]), FormatUtils.toFloat(values[2]), FormatUtils.toFloat(values[4])));
			}
		}
	}

	public createBox(engine: EngineService): Mesh {
		if (this.faceUV.length == 0) {
			var type = this.scene.getParamValue("mapping.type");
			if (type === "wrapped-bar") {
				this.wrappedBarBox();
			} else {
				this.defaultBox();
			}
		}
		var options = {
			faceUV: this.faceUV,
			wrap: true,
        	topBaseAt: 2,
        	bottomBaseAt: 2
		};
		return MeshBuilder.CreateBox("", options, engine.scene);
	}

	public createCylinder(engine: EngineService): Mesh {
		if (this.faceUV.length == 0) {
			var type = this.scene.getParamValue("mapping.type");
			if (type === "wrapped-bar") {
				// TODO
			} else {
				this.defaultCylinder();
			}
		}
		var options = {
			faceUV: this.faceUV,
			height: 1.0,
			diameter: 1.0
		};
		return MeshBuilder.CreateCylinder("", options, engine.scene);
	}

	public createSphere(engine: EngineService): Mesh {
		/*if (this.faceUV.length == 0) {
			var type = this.scene.getParamValue("mapping.type");
			if (type === "wrapped-bar") {
				// TODO
			} else {
				this.defaultCylinder();
			}
		}*/
		var options = {
			/*faceUV: this.faceUV,*/
			height: 1.0,
			diameter: 1.0
		};
		return MeshBuilder.CreateSphere("", options, engine.scene);
	}

	public createExtrudePolygon(engine: EngineService): Mesh {
		var shape: Vector3[];
		var holes = [];
		for(let path of this.scene.Path ) {
			if( path.name === "shape" && path.isActive() ) {
				shape = path.getResultVectorList(this.scene.expressionParamList);
			} else if( path.name === "hole" && path.isActive() ) {
				holes.push(path.getResultVectorList(this.scene.expressionParamList));
			}
		}
		if (this.faceUV.length == 0) {
			var type = this.scene.getParamValue("mapping.type");
			if (type === "wrapped-bar") {
				// TODO
			} else {
				this.defaultExtrude();
			}
		}
		var thickness: number = this.scene.getParamValueFloat("thickness");
		var options = {
			shape: shape,
			depth: thickness,
			holes: holes,
			faceUV: this.faceUV
		};

		return MeshBuilder.ExtrudePolygon("", options, engine.scene);		
	}
	
	public defaultBox(): void {
		for (var i = 0; i < 6; i++) {
			this.faceUV[i] = new Vector4(0, 0, 1, 1);
		}
	}

	public defaultExtrude(): void {
		for (var i = 0; i < 3; i++) {
			this.faceUV[i] = new Vector4(0, 0, 1, 1);
		}
	}

	public defaultCylinder(): void {
		for (var i = 0; i < 3; i++) {
			this.faceUV[i] = new Vector4(0, 0, 1, 1);
		}
	}

	public wrappedBarBox(): void {
		var scaling: Vector3 = this.scene.scaling;
		this.uDiv = new Array(5);
		this.uDiv[0] = 0;
		this.uDiv[1] = 0.5 * (1 - scaling.x / (scaling.x + scaling.y));
		this.uDiv[2] = 0.5;
		this.uDiv[3] = 0.5 * (1 + scaling.x / (scaling.x + scaling.y));
		this.uDiv[4] = 1;
		this.vDiv = new Array(5);
		this.vDiv[0] = 0;
		this.vDiv[1] = 0.5 * scaling.y / (scaling.x + scaling.y);
		this.vDiv[2] = 0.5;
		this.vDiv[3] = 1 - (0.5 * scaling.x / (scaling.x + scaling.y));
		this.vDiv[4] = 1;
		this.addFaceUV(1, 0, 2, 1);
		this.addFaceUV(2, 0, 3, 1);
		this.addFaceUV(0, 0, 4, 1);
		this.addFaceUV(0, 2, 4, 3);
		this.addFaceUV(0, 1, 4, 2);
		this.addFaceUV(0, 3, 4, 4);
	}

	public addFaceUV(umin: number, vmin: number, umax: number, vmax: number): void {
		this.faceUV.push(new Vector4(this.uDiv[umin], this.vDiv[vmin], this.uDiv[umax], this.vDiv[vmax]));
	}
}