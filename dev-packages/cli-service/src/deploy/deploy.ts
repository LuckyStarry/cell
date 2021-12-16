
import build from '../build/build';
import { CliContext, ConfigUtil, ContextUtils, HookExecutor, spawnProcess } from '@malagu/cli-common';

export interface DeplyOptions {
    entry?: string;
    skipBuild?: boolean;
}

export default async (cliContext: CliContext, options: DeplyOptions) => {
    try {
        const ctx = await ContextUtils.createDeployContext({
            ...cliContext,
            ...options
        });
        if (!options.skipBuild) {
            await build(cliContext, options);
        }

        const backendConfig = ConfigUtil.getBackendConfig(cliContext.cfg);
        const frontendConfig = ConfigUtil.getFrontendConfig(cliContext.cfg);

        const deployCommand: string = backendConfig.deployCommand || frontendConfig.deployCommand;
        if (deployCommand) {
            const args = deployCommand.split(/\s+/);
            await spawnProcess(args.shift()!, args, { stdio: 'inherit' });
        }
        const hookExecutor = new HookExecutor();
        await hookExecutor.executeDeployHooks(ctx);
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
