export interface Agent {
  run(projectId: string): Promise<void>;
}
