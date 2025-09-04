import * as vscode from 'vscode';

interface SnippetOptimizationConfig {
    enabled: boolean;
    tokenReductionTarget: number;
    maxSuggestions: number;
    confidenceThreshold: number;
}

interface SnippetSuggestion {
    trigger: string;
    patternType: string;
    confidence: number;
    tokenCost: number;
    estimatedSavings: number;
    contextMatch: string;
    description: string;
}

class SnippetOptimizationAgent {
    private config: SnippetOptimizationConfig;
    private diagnosticCollection: vscode.DiagnosticCollection;
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.config = this.loadConfiguration();
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('snippet-optimization');
        this.outputChannel = vscode.window.createOutputChannel('Agent Mode Snippets');
    }

    private loadConfiguration(): SnippetOptimizationConfig {
        const config = vscode.workspace.getConfiguration('agentMode.snippetOptimization');
        return {
            enabled: config.get('enabled', true),
            tokenReductionTarget: config.get('tokenReductionTarget', 0.8),
            maxSuggestions: config.get('maxSuggestions', 5),
            confidenceThreshold: config.get('confidenceThreshold', 0.7)
        };
    }

    private readonly pythonSnippetPatterns = {
        'data_structures': {
            triggers: ['str-', 'list-', 'dict-', 'set-', 'tuple-'],
            contextKeywords: ['string', 'list', 'dictionary', 'set', 'tuple', 'data', 'structure'],
            tokenCost: 5,
            description: 'Use built-in data structure methods'
        },
        'control_flow': {
            triggers: ['if-', 'for-', 'while-', 'try-', 'match-'],
            contextKeywords: ['loop', 'condition', 'error', 'exception', 'iteration', 'control'],
            tokenCost: 8,
            description: 'Use control flow snippets'
        },
        'functions': {
            triggers: ['def-', 'main-', 'class-'],
            contextKeywords: ['function', 'method', 'class', 'define', 'create'],
            tokenCost: 12,
            description: 'Use function/class definition snippets'
        },
        'algorithms': {
            triggers: ['algo-', 'random-', 'benchmark-'],
            contextKeywords: ['algorithm', 'sort', 'search', 'optimize', 'benchmark', 'random'],
            tokenCost: 15,
            description: 'Use algorithmic snippets'
        },
        'libraries': {
            triggers: ['np-', 'plt-', 'django-', 'PyMySQL-'],
            contextKeywords: ['numpy', 'matplotlib', 'plot', 'django', 'database', 'sql'],
            tokenCost: 20,
            description: 'Use library-specific snippets'
        }
    };

    public async analyzeContextForSnippets(context: string, userIntent: string): Promise<any> {
        if (!this.config.enabled) {
            return { snippetOpportunity: false, confidence: 0.0 };
        }

        const contextLower = `${context} ${userIntent}`.toLowerCase();
        const patternMatches: any = {};

        for (const [patternName, patternInfo] of Object.entries(this.pythonSnippetPatterns)) {
            let score = 0;
            const matchedKeywords: string[] = [];

            for (const keyword of patternInfo.contextKeywords) {
                if (contextLower.includes(keyword)) {
                    score += 1;
                    matchedKeywords.push(keyword);
                }
            }

            if (score > 0) {
                const confidence = Math.min(score / patternInfo.contextKeywords.length, 1.0);
                patternMatches[patternName] = {
                    confidence,
                    matchedKeywords,
                    tokenCost: patternInfo.tokenCost,
                    triggers: patternInfo.triggers
                };
            }
        }

        const hasOpportunity = Object.keys(patternMatches).length > 0;
        const maxConfidence = hasOpportunity ? Math.max(...Object.values(patternMatches).map((m: any) => m.confidence)) : 0.0;

        return {
            patternMatches,
            snippetOpportunity: hasOpportunity,
            confidence: maxConfidence
        };
    }

    public async suggestOptimalSnippets(context: string, codeIntent: string, currentTokens: number = 100): Promise<any> {
        const analysis = await this.analyzeContextForSnippets(context, codeIntent);
        const suggestions: SnippetSuggestion[] = [];
        let totalEstimatedSavings = 0;

        for (const [patternName, matchInfo] of Object.entries(analysis.patternMatches)) {
            const match = matchInfo as any;
            if (match.confidence >= this.config.confidenceThreshold) {
                for (const trigger of match.triggers) {
                    const snippetCost = match.tokenCost;
                    const estimatedFullCost = currentTokens;
                    const savings = Math.max(0, estimatedFullCost - snippetCost);

                    const suggestion: SnippetSuggestion = {
                        trigger,
                        patternType: patternName,
                        confidence: match.confidence,
                        tokenCost: snippetCost,
                        estimatedSavings: savings,
                        contextMatch: match.matchedKeywords.join(', '),
                        description: this.pythonSnippetPatterns[patternName as keyof typeof this.pythonSnippetPatterns].description
                    };

                    suggestions.push(suggestion);
                    totalEstimatedSavings += savings;
                }
            }
        }

        // Sort by efficiency (savings per token cost)
        suggestions.sort((a, b) => (b.estimatedSavings / Math.max(b.tokenCost, 1)) - (a.estimatedSavings / Math.max(a.tokenCost, 1)));
        const topSuggestions = suggestions.slice(0, this.config.maxSuggestions);

        return {
            suggestions: topSuggestions,
            totalEstimatedSavings,
            optimizationAvailable: topSuggestions.length > 0
        };
    }

    public async optimizeResponseWithSnippets(userRequest: string, context: string, estimatedTokens: number = 100): Promise<any> {
        const suggestionsResult = await this.suggestOptimalSnippets(context, userRequest, estimatedTokens);

        if (suggestionsResult.optimizationAvailable) {
            const topSuggestion = suggestionsResult.suggestions[0];
            return {
                optimizationStrategy: 'snippet',
                recommendedSnippet: topSuggestion.trigger,
                estimatedSavings: topSuggestion.estimatedSavings,
                confidence: topSuggestion.confidence,
                instructions: `Use snippet '${topSuggestion.trigger}' for ${topSuggestion.description}`,
                alternativeSuggestions: suggestionsResult.suggestions.slice(1, 3)
            };
        } else {
            return {
                optimizationStrategy: 'generate',
                message: 'No suitable snippets found, proceed with normal generation',
                estimatedSavings: 0
            };
        }
    }

    public async provideSnippetCompletions(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
        if (document.languageId !== 'python') {
            return [];
        }

        const line = document.lineAt(position);
        const lineText = line.text.substring(0, position.character);
        const context = this.getContextFromDocument(document, position);

        const analysis = await this.analyzeContextForSnippets(context, lineText);
        const completions: vscode.CompletionItem[] = [];

        if (analysis.snippetOpportunity) {
            for (const [patternName, matchInfo] of Object.entries(analysis.patternMatches)) {
                const match = matchInfo as any;
                if (match.confidence >= this.config.confidenceThreshold) {
                    for (const trigger of match.triggers) {
                        const completion = new vscode.CompletionItem(trigger, vscode.CompletionItemKind.Snippet);
                        completion.detail = `Agent Mode: ${this.pythonSnippetPatterns[patternName as keyof typeof this.pythonSnippetPatterns].description}`;
                        completion.documentation = new vscode.MarkdownString(
                            `🤖 **Agent Optimized** (${Math.round(match.confidence * 100)}% confidence)\n\n` +
                            `Token cost: ${match.tokenCost} | Pattern: ${patternName}\n\n` +
                            `Matched context: ${match.matchedKeywords.join(', ')}`
                        );
                        completion.sortText = `0000${trigger}`; // High priority
                        completion.insertText = new vscode.SnippetString(trigger);
                        completions.push(completion);
                    }
                }
            }
        }

        return completions;
    }

    private getContextFromDocument(document: vscode.TextDocument, position: vscode.Position): string {
        const startLine = Math.max(0, position.line - 10);
        const endLine = Math.min(document.lineCount - 1, position.line + 5);
        
        let context = '';
        for (let i = startLine; i <= endLine; i++) {
            context += document.lineAt(i).text + '\n';
        }
        
        return context;
    }

    public async showOptimizationInformation(): Promise<void> {
        const stats = await this.getOptimizationStats();
        const message = `Agent Mode Snippet Optimization:\n\n` +
                       `• Enabled: ${this.config.enabled}\n` +
                       `• Token reduction target: ${this.config.tokenReductionTarget * 100}%\n` +
                       `• Max suggestions: ${this.config.maxSuggestions}\n` +
                       `• Confidence threshold: ${this.config.confidenceThreshold * 100}%\n\n` +
                       `Available patterns: ${Object.keys(this.pythonSnippetPatterns).length}`;
        
        vscode.window.showInformationMessage(message);
    }

    private async getOptimizationStats(): Promise<any> {
        return {
            enabled: this.config.enabled,
            patternCount: Object.keys(this.pythonSnippetPatterns).length,
            totalTriggers: Object.values(this.pythonSnippetPatterns).reduce((acc, pattern) => acc + pattern.triggers.length, 0)
        };
    }

    dispose(): void {
        this.diagnosticCollection.dispose();
        this.outputChannel.dispose();
    }
}

export function activate(context: vscode.ExtensionContext) {
    const agent = new SnippetOptimizationAgent();

    // Register completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'python' },
        {
            provideCompletionItems: async (document, position) => {
                return await agent.provideSnippetCompletions(document, position);
            }
        },
        '-' // Trigger character for snippets ending with '-'
    );

    // Register commands
    const showInfoCommand = vscode.commands.registerCommand('agentMode.showSnippetOptimization', () => {
        agent.showOptimizationInformation();
    });

    const analyzeContextCommand = vscode.commands.registerCommand('agentMode.analyzeContext', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'python') {
            const context = agent['getContextFromDocument'](editor.document, editor.selection.active);
            const analysis = await agent.analyzeContextForSnippets(context, 'manual analysis');
            
            if (analysis.snippetOpportunity) {
                const suggestions = await agent.suggestOptimalSnippets(context, 'manual analysis');
                const message = `Found ${suggestions.suggestions.length} snippet optimization opportunities!\n\n` +
                               suggestions.suggestions.slice(0, 3).map((s: SnippetSuggestion) => 
                                   `• ${s.trigger} (${Math.round(s.confidence * 100)}% confidence, ${s.estimatedSavings} token savings)`
                               ).join('\n');
                vscode.window.showInformationMessage(message);
            } else {
                vscode.window.showInformationMessage('No snippet optimization opportunities found in current context.');
            }
        }
    });

    context.subscriptions.push(completionProvider, showInfoCommand, analyzeContextCommand, agent);

    // Show activation message
    vscode.window.showInformationMessage('🤖 Agent Mode Snippet Optimization activated!');
}

export function deactivate() {
    // Cleanup handled by dispose methods
}