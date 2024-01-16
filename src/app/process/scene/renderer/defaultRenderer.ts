import { Scene } from "../../../model/assembler/scene";
import { Param } from "../../../model/assembler/param";
import { SceneImpl } from "../sceneImpl";
import { DefaultRenderingPipeline, Camera, DepthOfFieldEffectBlurLevel, ColorCurves } from "@babylonjs/core";
import { EngineService } from "../../../engine/engine.service";
import { CameraObject } from '../../../process/scene/cameraObject';
import { FormatUtils } from '../../../process/utils/formatUtils';

export class DefaultRenderer extends SceneImpl {

	public renderer: DefaultRenderingPipeline;
	public colorCurves: ColorCurves;
	
	public constructor(scene: Scene) {
		super(scene);
		scene.copy(this);
	}

	public writeCreate(engine: EngineService): void {
		super.writeCreate(engine);
		var cameraList: Camera[] = [];
		for (let sceneImpl of engine.sceneImplList) {
			if (sceneImpl instanceof CameraObject) {
				cameraList.push((sceneImpl as CameraObject).camera);
			}
		}
		this.renderer = new DefaultRenderingPipeline("defaultRenderer", true, engine.scene, cameraList);
		this.colorCurves = new ColorCurves();
		this.renderer.imageProcessing.colorCurves = this.colorCurves;
	}

	public writeParam(param: Param, engine: EngineService): void {
		if( "samples" === param.name ) {
			// Multisample Anti-Aliasing
			this.renderer.samples = param.getIntValue();
		} else if( "fxaa.enabled" === param.name ) {
			// Fast Approximate Anti-Aliasing
			this.renderer.fxaaEnabled = param.getBoolValue();
		} else if( "toneMapping.enabled" === param.name ) {
			// Tone Mapping
			this.renderer.imageProcessing.toneMappingEnabled = param.getBoolValue();
		} else if( "contrast" === param.name ) {
			// camera contrast: 0 to 4
			this.renderer.imageProcessing.contrast = param.getFloatValue();
		} else if( "exposure" === param.name ) {
			// camera exposure: 0 to 4
			this.renderer.imageProcessing.exposure = param.getFloatValue();
		} else if( "colorCurves.enabled" === param.name ) {
			// Color curves
			this.renderer.imageProcessing.colorCurvesEnabled = param.getBoolValue();
		} else if( "curve.globalDensity" === param.name ) {
			// global density: -100 to 100
			this.colorCurves.globalDensity = param.getFloatValue();
		} else if( "curve.globalExposure" === param.name ) {
			// global exposure: -100 to 100
			this.colorCurves.globalExposure = param.getFloatValue();
		} else if( "curve.globalHue" === param.name ) {
			// global hue: 0 to 360
			this.colorCurves.globalHue = param.getFloatValue();
		} else if( "curve.globalSaturation" === param.name ) {
			// global saturation: -100 to 100
			this.colorCurves.globalSaturation = param.getFloatValue();
		} else if( "curve.highlightsDensity" === param.name ) {
			// highlights density: -100 to 100
			this.colorCurves.highlightsDensity = param.getFloatValue();
		} else if( "curve.highlightsExposure" === param.name ) {
			// highlights exposure: -100 to 100
			this.colorCurves.highlightsExposure = param.getFloatValue();
		} else if( "curve.highlightsHue" === param.name ) {
			// highlights hue: 0 to 360
			this.colorCurves.highlightsHue = param.getFloatValue();
		} else if( "curve.highlightsSaturation" === param.name ) {
			// highlights saturation: -100 to 100
			this.colorCurves.highlightsSaturation = param.getFloatValue();
		} else if( "curve.midtonesDensity" === param.name ) {
			// midtones density: -100 to 100
			this.colorCurves.midtonesDensity = param.getFloatValue();
		} else if( "curve.midtonesExposure" === param.name ) {
			// midtones exposure: -100 to 100
			this.colorCurves.midtonesExposure = param.getFloatValue();
		} else if( "curve.midtonesHue" === param.name ) {
			// midtones hue: 0 to 360
			this.colorCurves.midtonesHue = param.getFloatValue();
		} else if( "curve.midtonesSaturation" === param.name ) {
			// midtones saturation: -100 to 100
			this.colorCurves.midtonesSaturation = param.getFloatValue();
		} else if( "curve.shadowsDensity" === param.name ) {
			// shadows density: -100 to 100
			this.colorCurves.shadowsDensity = param.getFloatValue();
		} else if( "curve.shadowsExposure" === param.name ) {
			// shadows exposure: -100 to 100
			this.colorCurves.shadowsExposure = param.getFloatValue();
		} else if( "curve.shadowsHue" === param.name ) {
			// shadows hue: 0 to 360
			this.colorCurves.shadowsHue = param.getFloatValue();
		} else if( "curve.shadowsSaturation" === param.name ) {
			// shadows saturation: -100 to 100
			this.colorCurves.shadowsSaturation = param.getFloatValue();
		} else if( "bloom.enabled" === param.name ) {
			// Bloom
			this.renderer.bloomEnabled = param.getBoolValue();
		} else if( "bloomKernel" === param.name ) {
			// Kernel: 1 to 500
			this.renderer.bloomKernel = param.getFloatValue();
		} else if( "bloomWeight" === param.name ) {
			// Weight: 0 to 1
			this.renderer.bloomWeight = param.getFloatValue();
		} else if( "bloomThreshold" === param.name ) {
			// Threshold: 0 to 1
			this.renderer.bloomThreshold = param.getFloatValue();
		} else if( "bloomScale" === param.name ) {
			// Scale: 0 to 1
			this.renderer.bloomScale = param.getFloatValue();
		} else if( "depthOfField.enabled" === param.name ) {
			// Depth Of Field
			this.renderer.depthOfFieldEnabled = param.getBoolValue();
		} else if( "blurLevel" === param.name ) {
			// Blur Level: 0 to 3
			if (param.getFloatValue() < 1) {
				this.renderer.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Low;
			} else if (param.getFloatValue() < 2) {
				this.renderer.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Medium;
			} else if (param.getFloatValue() < 3) {
				this.renderer.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.High;
			}
		} else if( "focusDistance" === param.name ) {
			// Focus Distance: 1 to 5000
			this.renderer.depthOfField.focusDistance = param.getFloatValue();
		} else if( "fStop" === param.name ) {
			// F-Stop: 1 to 10
			this.renderer.depthOfField.fStop = param.getFloatValue();
		} else if( "focalLength" === param.name ) {
			// Focal Length: 1 to 300
			this.renderer.depthOfField.focalLength = param.getFloatValue();
		} else if( "chromaticAberration.enabled" === param.name ) {
			this.renderer.chromaticAberrationEnabled = param.getBoolValue();
		} else if( "chromaticAberration.amount" === param.name ) {
			// Amount: -1000 to 1000
			this.renderer.chromaticAberration.aberrationAmount = param.getFloatValue();
		} else if( "chromaticAberration.radialIntensity" === param.name ) {
			//Radial Intensity: 0.1 to 5
			this.renderer.chromaticAberration.radialIntensity = param.getFloatValue();
		} else if( "chromaticAberration.direction" === param.name ) {
			// Direction
			if ( param.getIntValue() == 0) {
				this.renderer.chromaticAberration.direction.x = 0
				this.renderer.chromaticAberration.direction.y = 0
			} else {
				this.renderer.chromaticAberration.direction.x = Math.sin(FormatUtils.degToRad(param.getFloatValue()))
				this.renderer.chromaticAberration.direction.y = Math.cos(FormatUtils.degToRad(param.getFloatValue()))
			}
		} else if( "sharpen.enabled" === param.name ) {
			// Sharpen
			this.renderer.sharpenEnabled = param.getBoolValue();
		} else if( "sharpen.edgeAmount" === param.name ) {
			// Edge Amount: 0 to 2
			this.renderer.sharpen.edgeAmount = param.getFloatValue();
		} else if( "sharpen.colorAmount" === param.name ) {
			// Color Amount: 0 to 1
			this.renderer.sharpen.colorAmount = param.getFloatValue();
		} else if( "vignette.enabled" === param.name ) {
			// Vignette
			this.renderer.imageProcessing.vignetteEnabled = param.getBoolValue();
		} else if( "vignetteBlendMode" === param.name ) {
			// Vignette Multiply Vignette
			this.renderer.imageProcessing.vignetteBlendMode = param.getIntValue();
		} else if( "vignetteColor" === param.name ) {
			// Vignette Color
			this.renderer.imageProcessing.vignetteColor = param.getColor4Value();
		} else if( "vignetteWeight" === param.name ) {
			// Vignette Weight: 0 to 10
			this.renderer.imageProcessing.vignetteWeight = param.getFloatValue();
		} else if( "grain.enabled" === param.name ) {
			// Grain
			this.renderer.grainEnabled = param.getBoolValue();
		} else if( "grain.intensity" === param.name ) {
			// Intensity: 0 to 100
			this.renderer.grain.intensity = param.getFloatValue()
		} else if( "grain.animated" === param.name ) {
			// Animated
			this.renderer.grain.animated = param.getBoolValue();
		}
	}

}