import { Run } from 'sarif';

export const processSarifResults = (runs: Run[]) => {
  return (
    runs.flatMap(run => {
      const tool = run.tool.driver.name;
      const rules = Object.fromEntries(run.tool.driver.rules?.map(rule => [rule.id, rule]) || []);

      return (
        run.results?.flatMap(result => {
          const rule = result.ruleId ? rules[result.ruleId] : null;
          const level = result.level || 'error';
          const message = result.message?.text || 'No message provided.';

          return (
            result.locations?.map(location => {
              const filePath = location.physicalLocation?.artifactLocation?.uri;

              return {
                tool,
                rule: rule
                  ? {
                      id: rule.id,
                      name: rule.name,
                      helpUri: rule.helpUri,
                      shortDescription: rule.shortDescription?.text,
                    }
                  : result.ruleId
                    ? { id: result.ruleId }
                    : undefined,
                level,
                message,
                filePath,
                region: location.physicalLocation?.region,
              };
            }) || []
          );
        }) || []
      );
    }) || []
  );
};

export type ProcessedSarifResult = ReturnType<typeof processSarifResults>[number];
