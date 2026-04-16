import { PipelineRunner } from "./pipeline/pipeline.runner";
import { ProjectRepository } from "./storage/project.repository";
import fs from "fs";
import path from "path";

// Inject the API key for this test
process.env.ELEVENLABS_API_KEY = "sk_9f623fe3e4310c594a1219db382592d7a2d38ab6178544a1";

const scriptText = `You are watching this because you want to change. You might be holding a self-help book right now. You might have just saved dozens of videos on how to build discipline, how to plan your life, or how to wake up at 5 AM. And you think that if you just watch one more video, read one more book, everything will finally click into place. Wrong. I spent 10,000 hours—more than 6 years of my life—digging through almost everything in the so-called self-improvement industry.`;

async function main() {
    console.log("🚀 Starting End-to-End Smoke Test...");
    const repository = new ProjectRepository();
    const runner = new PipelineRunner(repository);

    console.log("📝 Creating Draft Project...");
    const project = await repository.create(scriptText);
    const projectId = project.projectId;
    console.log(`✅ Project created with ID: ${projectId}`);

    console.log("⚙️ Running complete Artisan Pipeline sequence...");
    await runner.run(projectId);

    console.log("✅ Pipeline run complete!");
    
    // The final state is located at: backend/data/{projectId}/project_state.json
    const statePath = repository.getProjectStatePath(projectId);
    console.log(`Final state generated at: ${statePath}`);

    // Map to Remotion Engine test state format
    const generatedState = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    
    const remotionProjectState = {
        projectId: generatedState.projectId,
        globalConfig: {
            fps: generatedState.fps,
            width: 1080,
            height: 1920,
            backgroundColor: "#020617"
        },
        audioTrack: {
            url: generatedState.audioPath, // Will be an absolute path from backend
            durationInFrames: generatedState.beatTimings.reduce((max: number, bt: any) => Math.max(max, bt.rawVoiceEndFrame), 0)
        },
        nodes: generatedState.nodes.map((node: any) => {
            const beat = generatedState.beats.find((b: any) => b.id === node.beatId);
            const timing = generatedState.beatTimings.find((t: any) => t.beatId === node.beatId);
            const visual = generatedState.visuals.find((v: any) => v.beatId === node.beatId);
            const words = generatedState.words.filter((w: any) => w.beatId === node.beatId).map((w: any) => ({
                text: w.spokenWord,
                startFrame: w.rawVoiceStartFrame - timing.rawVoiceStartFrame,
                duration: w.rawVoiceEndFrame - w.rawVoiceStartFrame
            }));

            return {
                id: node.id,
                text: beat.text,
                assetId: visual?.assetId || "rocket",
                spatialData: { x: node.x + 540, y: node.y + 960, scale: 1.0 }, // Convert relative backend coordinates
                timing: {
                    startFrame: timing.rawVoiceStartFrame,
                    baseDuration: timing.rawVoiceEndFrame - timing.rawVoiceStartFrame + 30, // 1 sec padding
                    offsetFrames: timing.offsetFrames
                },
                wordTimings: words
            };
        }),
        camera: {
            waypoints: generatedState.cameraWaypoints.map((wp: any) => ({
                frameStart: wp.frameStart,
                targetX: wp.targetX,
                targetY: wp.targetY,
                targetZoom: wp.targetZoom,
                motionPreset: wp.motionPreset
            }))
        },
        edges: generatedState.edges
    };

    // Save for Remotion
    const remotionTarget = path.join(process.cwd(), "..", "packages", "remotion-engine", "dummy", "smoke_test_state.json");
    fs.writeFileSync(remotionTarget, JSON.stringify(remotionProjectState, null, 2));

    console.log(`✅ Exported final data contract to Remotion at: ${remotionTarget}`);
    console.log(`\nTo render, run:\ncd D:/dark-needle-factory/artisan-video-pipeline/packages/remotion-engine\nnpx remotion render src/index.tsx MyVideo smoke_test_final.mp4 --props=./dummy/smoke_test_state.json --shell`);
}

main().catch(console.error);
