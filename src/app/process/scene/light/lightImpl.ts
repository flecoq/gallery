import { Scene } from "../../../model/assembler/scene";
import { Param } from "../../../model/assembler/param";
import { SceneImpl } from "../sceneImpl";
import { Mesh, Color3, StandardMaterial, ShadowGenerator, IShadowLight } from "@babylonjs/core";
import { EngineService } from "../../../engine/engine.service";
import { Logger } from '../../utils/logger';

export class LightImpl extends SceneImpl {

	public engine: EngineService;
	public shadowGenerator: ShadowGenerator;
	public shadowLight: IShadowLight;
	public sphere: Mesh;

	public constructor(scene: Scene) {
		super(scene);
		scene.copy(this);
	}

	public writeCreate(engine: EngineService): void {
		this.engine = engine;
		super.writeCreate(engine);
		this.writeCreateShadowGenerator();
	}

	public writeCreateShadowGenerator(): void {
		if (this.getParamValueBool("shadow")) {
			Logger.info("LightImpl", "writeCreateShadowGenerator()");
			var resolution: number = this.getParamValueInt("shadow.resolution");
			this.shadowGenerator = new ShadowGenerator(resolution ? resolution : 1024, this.shadowLight);
		}
	}

	public writeShadowGeneratorParam(param: Param): void {
		/* 	documentation: https://doc.babylonjs.com/divingDeeper/lights/shadows
			
			blur example:
				shadowGenerator.useBlurExponentialShadowMap = true;
 				shadowGenerator.useKernelBlur = true;
    			shadowGenerator.blurKernel = 64;
		*/
		if ("usePoissonSampling" === param.name) {
			this.shadowGenerator.usePoissonSampling = param.getBoolValue();
		} else if ("useExponentialShadowMap" === param.name) {
			this.shadowGenerator.useExponentialShadowMap = param.getBoolValue();
		} else if ("useBlurExponentialShadowMap" === param.name) {
			// /!\ BABYLON BUGGED
			this.shadowGenerator.useBlurExponentialShadowMap = param.getBoolValue();
		} else if ("useKernelBlur" === param.name) {
			this.shadowGenerator.useKernelBlur = param.getBoolValue();
		} else if ("blurKernel" === param.name) {
			this.shadowGenerator.blurKernel = param.getIntValue();
		}
	}

	public addShadowCaster(mesh: Mesh, includeDescendants?: boolean): void {
		if (this.shadowGenerator) {
			this.shadowGenerator.addShadowCaster(mesh, includeDescendants);
		}
	}

	public highlight(value: boolean): void {
		if (this.engine.edit) {
			if ( value) {
				if (this.sphere == null) {
					this.sphere = Mesh.CreateSphere(this.name + "Light", 4, 0.5, this.engine.scene);
					var material: StandardMaterial = new StandardMaterial(this.name + "Light", this.engine.scene);
					var diffuse: Color3 = this.getParamValueColor3("diffuse");
					material.emissiveColor = diffuse ? diffuse : new Color3(1, 1, 0);
					this.sphere.material = material;
				}
				this.sphere.position = this.position;
			}
			this.sphere.setEnabled(value);
		}
	}
}
