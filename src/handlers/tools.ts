import { ToolsService } from '../api/client/index.js';

export const listToolsHandler = async (args: any) => {
  const { cursor, limit } = args;
  return await ToolsService.listTools(cursor? cursor : "1", limit);
};

export const getPatternHandler = async (args: any) => {
  const { toolUuid, patternId } = args;
  return await ToolsService.getPattern(toolUuid, patternId);
};
