import { LogLevel } from '../../../store/src/actions/log.actions';


// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  proxyAPIVersion: 'v1',
  cfAPIVersion: 'v2',
  autoscalerAPIVersion: 'v1',
  logLevel: LogLevel.DEBUG,
  logToConsole: true,
  logEnableConsoleActions: false,
  showObsDebug: false,
  disablePolling: false
};