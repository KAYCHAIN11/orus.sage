// apps/trinity-service/src/routes/research.router.ts
import { Router } from 'express';
import { Logger } from '../../../../libs/shared/src/logger/logger';
import { DeepResearchEngine } from '../../../../libs/engines/research/deep.research.engine';
import { AnalysisEngine } from '../../../../libs/engines/research/analysis.engine';
import { BlueprintStructurer } from '../../../../libs/engines/research/blueprint.structurer';
import { DocumentGenerator } from '../../../../libs/engines/research/document.generator';
import { TemplateManager } from '../../../../libs/engines/research/template.manager';

const router = Router();
const logger = Logger.create('ResearchRouter'); // ✅ CORRETO!

router.post('/deep', async (req, res) => {
  try {
    const { query, template = 'extractioncore-v7' } = req.body;

    logger.info(`🔍 Deep research iniciado: "${query}"`);

    // Inicializa engines
    const deepResearch = new DeepResearchEngine(logger);
    const analysis = new AnalysisEngine(logger);
    const structurer = new BlueprintStructurer(logger);
    const generator = new DocumentGenerator(logger);
    const templateMgr = new TemplateManager(logger);

    // PIPELINE
    const startTime = Date.now();
    const searchResult = await deepResearch.searchMultiSource({ query, maxSources: 50 });
    const analysisResult = await analysis.analyzeSources(searchResult.sources);
    const blueprint = await structurer.structureBlueprint(analysisResult, template);
    const document = await generator.generateDocument(blueprint, 'pdf');
    const totalTime = Date.now() - startTime;

    res.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        downloadUrl: document.downloadUrl,
        metadata: document.metadata
      },
      research: {
        sources: searchResult.totalSources,
        insights: analysisResult.keyInsights.length,
        totalTime
      }
    });
  } catch (error) {
    logger.error('❌ Deep research error:', error);
    res.status(500).json({ error: String(error) });
  }
});

export default router;
