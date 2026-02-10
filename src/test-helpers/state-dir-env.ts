type StateDirEnvSnapshot = {
  opencogStateDir: string | undefined;
  clawdbotStateDir: string | undefined;
};

export function snapshotStateDirEnv(): StateDirEnvSnapshot {
  return {
    opencogStateDir: process.env.OPENCOG_STATE_DIR,
    clawdbotStateDir: process.env.CLAWDBOT_STATE_DIR,
  };
}

export function restoreStateDirEnv(snapshot: StateDirEnvSnapshot): void {
  if (snapshot.opencogStateDir === undefined) {
    delete process.env.OPENCOG_STATE_DIR;
  } else {
    process.env.OPENCOG_STATE_DIR = snapshot.opencogStateDir;
  }
  if (snapshot.clawdbotStateDir === undefined) {
    delete process.env.CLAWDBOT_STATE_DIR;
  } else {
    process.env.CLAWDBOT_STATE_DIR = snapshot.clawdbotStateDir;
  }
}

export function setStateDirEnv(stateDir: string): void {
  process.env.OPENCOG_STATE_DIR = stateDir;
  delete process.env.CLAWDBOT_STATE_DIR;
}
