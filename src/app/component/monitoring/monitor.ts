import { Mesh, Engine, Scene, EngineInstrumentation } from '@babylonjs/core';

export class Monitor {

	public scene: Scene;
	public instrumentation: EngineInstrumentation;

	public currentFrameTime: string;
	public averageFrameTime: string;
	public totalShaderTime: string;
	public averageShaderTime: string;
	public compilerShaderCount: string;
	
	public totalVertices: number = 0;
	public totalIndices: number = 0;

	constructor(engine: Engine, scene: Scene) {
		this.scene = scene;
		this.instrumentation = new EngineInstrumentation(engine);
		this.instrumentation.captureGPUFrameTime = true;
		this.instrumentation.captureShaderCompilationTime = true;
	}

	public run(): void {
		this.scene.registerBeforeRender(() => this.refresh());
	}

	public refresh(): void {
		this.currentFrameTime = "current frame time (GPU): " + (this.instrumentation.gpuFrameTimeCounter.current * 0.000001).toFixed(2) + " ms";
		this.averageFrameTime = "average frame time (GPU): " + (this.instrumentation.gpuFrameTimeCounter.average * 0.000001).toFixed(2) + " ms";
		this.totalShaderTime = "total shader compilation time: " + (this.instrumentation.shaderCompilationTimeCounter.total).toFixed(2) + " ms";
		this.averageShaderTime = "average shader compilation time: " + (this.instrumentation.shaderCompilationTimeCounter.average).toFixed(2) + " ms";
		this.compilerShaderCount = "compiler shaders count: " + this.instrumentation.shaderCompilationTimeCounter.count;
	}
	
	public addMesh(mesh: Mesh): void {
		this.totalVertices += mesh.getTotalVertices();
		this.totalIndices += mesh.getTotalIndices();
		for(let child of mesh.getChildMeshes() ) {
			this.addMesh(child as Mesh);
		}
	}
}