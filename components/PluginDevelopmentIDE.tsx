

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AiGenerateIcon, CodeIcon, ConsoleIcon, ParametersIcon, PublishIcon, SaveIcon, TemplateIcon, TestIcon, VisualBuilderIcon, DownloadIcon, SignalChainIcon } from './icons';
import TemplatesView from './TemplatesView';
import { PluginTemplate } from '../types';
import { generatePluginFromDescription, addModuleToProject, generatePluginFromSmartTemplate, refactorSignalChain } from '../services/geminiService';
import Loader from './Loader';
import ConsoleView from './ConsoleView';
import VisualBuilderView from './VisualBuilderView';
import SignalPatcher from './SignalPatcher';
import * as audioEngine from '../services/audioEngine';
import TransportControls from './TransportControls';


// --- New View Components ---

const CodeEditorView: React.FC<{ code: string, onCodeChange: (newCode: string) => void }> = ({ code, onCodeChange }) => {
    return (
        <div className="p-4 h-full flex flex-col">
            <textarea 
                className="w-full flex-grow bg-[#1E1E1E] text-secondary font-mono text-sm p-4 rounded-lg border border-surface focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
            />
        </div>
    );
};

const ParametersView: React.FC<{ parameters: PluginTemplate['parameters'] }> = ({ parameters }) => (
     <div className="p-8 h-full">
        <h3 className="text-xl font-bold text-primary mb-6">Plugin Parameters</h3>
        <div className="bg-surface rounded-lg border border-background overflow-hidden">
            <table className="w-full text-sm text-left text-secondary">
                <thead className="bg-background/50 text-xs text-secondary uppercase">
                    <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Default</th>
                        <th scope="col" className="px-6 py-3">Range</th>
                    </tr>
                </thead>
                <tbody>
                    {parameters.map((p) => (
                        <tr key={p.id} className="border-b border-background">
                            <td className="px-6 py-4 font-mono text-accent">{p.id}</td>
                            <td className="px-6 py-4 font-semibold text-primary">{p.name}</td>
                            <td className="px-6 py-4">{p.type}</td>
                            <td className="px-6 py-4">{p.defaultValue}</td>
                            <td className="px-6 py-4">{p.min !== undefined && p.max !== undefined ? `${p.min} - ${p.max}` : 'N/A'}</td>
                        </tr>
                    ))}
                     {parameters.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-secondary">This plugin has no parameters defined.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const TestView: React.FC = () => (
     <div className="p-8 h-full">
        <h3 className="text-xl font-bold text-primary mb-6">Real-time Performance Test</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface p-6 rounded-lg border border-background text-center">
                <h4 className="text-sm font-semibold text-secondary uppercase">Latency</h4>
                <p className="text-4xl font-bold text-vivid-sky-blue mt-2">1.2<span className="text-2xl text-secondary">ms</span></p>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-background text-center">
                <h4 className="text-sm font-semibold text-secondary uppercase">CPU Load</h4>
                <p className="text-4xl font-bold text-hot-pink mt-2">4.7<span className="text-2xl text-secondary">%</span></p>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-background text-center">
                <h4 className="text-sm font-semibold text-secondary uppercase">Memory</h4>
                <p className="text-4xl font-bold text-accent mt-2">24.1<span className="text-2xl text-secondary">MB</span></p>
            </div>
        </div>
         <div className="mt-8 bg-surface p-4 rounded-lg border border-background">
            <p className="text-sm text-green-400 font-semibold">✅ All tests passed successfully.</p>
        </div>
    </div>
);

const PublishView: React.FC = () => (
     <div className="p-8 h-full max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-primary mb-6">Publish Plugin</h3>
        <div className="space-y-4">
            <div>
                <label htmlFor="pluginName" className="block text-sm font-medium text-secondary mb-1">Plugin Name</label>
                <input type="text" id="pluginName" className="w-full bg-surface border border-background rounded-md py-2 px-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
                <label htmlFor="version" className="block text-sm font-medium text-secondary mb-1">Version</label>
                <input type="text" id="version" placeholder="e.g., 1.0.0" className="w-full bg-surface border border-background rounded-md py-2 px-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1">Description</label>
                <textarea id="description" rows={4} className="w-full bg-surface border border-background rounded-md py-2 px-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"></textarea>
            </div>
            <button className="w-full bg-accent text-primary font-semibold py-3 rounded-lg hover:bg-accent-hover transition-colors">
                Submit for Review
            </button>
        </div>
    </div>
);

const AIGeneratedTemplateCard: React.FC<{ template: PluginTemplate; onSelect: (template: PluginTemplate) => void; }> = ({ template, onSelect }) => (
    <div className="bg-surface/80 backdrop-blur-sm rounded-lg p-5 flex flex-col border-2 border-accent shadow-[0_0_15px_rgba(138,66,214,0.5)]">
        <div className="flex-grow">
            <div className="flex items-center space-x-4 mb-3">
                 <div className="bg-accent/20 p-3 rounded-full text-accent">
                    <AiGenerateIcon />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-primary">{template.name}</h3>
                    <div className="flex items-center space-x-2 text-xs mt-1">
                        <span className="bg-background text-secondary px-2 py-0.5 rounded">{template.type}</span>
                        <span className="bg-background text-secondary px-2 py-0.5 rounded">{template.framework}</span>
                    </div>
                 </div>
            </div>
            <p className="text-secondary text-sm mb-4">{template.description}</p>
            <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => <span className="bg-hot-pink/20 text-hot-pink text-xs font-medium px-2.5 py-1 rounded-full" key={tag}>{tag}</span>)}
            </div>
        </div>
         <button onClick={() => onSelect(template)} className="mt-6 w-full flex items-center justify-center bg-accent text-primary font-semibold py-3 rounded-lg hover:bg-accent-hover transition-colors">
            <DownloadIcon />
            Load in Editor
        </button>
    </div>
);

const SmartTemplateCard: React.FC<{ title: string; description: string; onGenerate: () => void }> = ({ title, description, onGenerate }) => (
    <div className="bg-surface/50 border border-background rounded-xl p-5 text-left group hover:border-accent/50 transition-colors">
        <h4 className="font-bold text-primary text-md">{title}</h4>
        <p className="text-secondary text-sm mt-1 mb-4">{description}</p>
        <button onClick={onGenerate} className="w-full bg-accent/80 text-primary font-semibold py-2 rounded-lg group-hover:bg-accent transition-colors">Generate</button>
    </div>
);

const AIGenerateView: React.FC<{ onPluginGenerated: (template: PluginTemplate, source: 'ai') => void; log: (message: string) => void; }> = ({ onPluginGenerated, log }) => {
    const [prompt, setPrompt] = useState('');
    const [framework, setFramework] = useState<'JUCE' | 'Web Audio'>('JUCE');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Generating with Amapiano AI...");
    const [generatedPlugin, setGeneratedPlugin] = useState<PluginTemplate | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a description for the plugin.");
            return;
        }
        setLoadingMessage("Generating with Amapiano AI...");
        setIsLoading(true);
        setError(null);
        setGeneratedPlugin(null);
        log(`✨ Kicking off AI generation for: "${prompt}"...`);
        try {
            const plugin = await generatePluginFromDescription(prompt, framework);
            log(`✅ AI successfully generated plugin: <span class="text-accent font-semibold">${plugin.name}</span>.`);
            setGeneratedPlugin(plugin);
        } catch (e: any) {
            const errorMessage = `❌ AI Generation Failed: ${e.message}`;
            log(errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartTemplateGenerate = async (templateName: 'Amapianorizer' | 'Lofi Chillifier') => {
        setLoadingMessage(`Generating ${templateName}...`);
        setIsLoading(true);
        setError(null);
        setGeneratedPlugin(null);
        log(`🧠 Kicking off Smart Template generation for: "${templateName}"...`);
        try {
            const plugin = await generatePluginFromSmartTemplate(templateName);
            log(`✅ AI successfully generated Smart Template: <span class="text-accent font-semibold">${plugin.name}</span>.`);
            setGeneratedPlugin(plugin);
        } catch (e: any) {
            const errorMessage = `❌ Smart Template Generation Failed: ${e.message}`;
            log(errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col items-center">
            {isLoading && <Loader message={loadingMessage} />}
            <div className="w-full max-w-4xl">
                <h3 className="text-xl font-bold text-primary mb-2">Generate with Amapiano AI</h3>
                <p className="text-secondary mb-6">Describe the plugin you want to create. The more detailed your description, the better the result.</p>
                
                <div className="bg-surface/50 border border-background rounded-xl p-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A vintage tape reverb with controls for mix, decay, and tape saturation..."
                        className="w-full h-24 bg-transparent text-primary placeholder-secondary resize-none focus:outline-none"
                    />
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-secondary">Framework:</span>
                            <button onClick={() => setFramework('JUCE')} className={`px-3 py-1 text-sm rounded-md ${framework === 'JUCE' ? 'bg-accent text-white' : 'bg-background text-secondary'}`}>JUCE</button>
                            <button onClick={() => setFramework('Web Audio')} className={`px-3 py-1 text-sm rounded-md ${framework === 'Web Audio' ? 'bg-accent text-white' : 'bg-background text-secondary'}`}>Web Audio</button>
                        </div>
                        <button onClick={handleGenerate} className="bg-accent text-primary font-semibold py-2 px-6 rounded-lg hover:bg-accent-hover transition-colors">Generate</button>
                    </div>
                </div>

                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}
                
                <div className="mt-8">
                    <h4 className="text-lg font-bold text-primary mb-4">Or use a Smart Template:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartTemplateCard 
                            title="Amapianorizer" 
                            description="A multi-effect for authentic Amapiano sounds (Saturation, Transient Shaper, Reverb, Delay)."
                            onGenerate={() => handleSmartTemplateGenerate('Amapianorizer')}
                        />
                        <SmartTemplateCard 
                            title="Lofi Chillifier" 
                            description="Adds vintage warmth with tape hiss, wow/flutter, and reverb for lo-fi beats."
                            onGenerate={() => handleSmartTemplateGenerate('Lofi Chillifier')}
                        />
                    </div>
                </div>

                {generatedPlugin && (
                    <div className="mt-8 animate-fade-in">
                        <h3 className="text-lg font-bold text-primary mb-4">Generation Complete!</h3>
                        <AIGeneratedTemplateCard template={generatedPlugin} onSelect={(p) => onPluginGenerated(p, 'ai')} />
                    </div>
                )}
            </div>
        </div>
    );
};


const TABS = [
    { id: 'ai', name: 'AI Generate', icon: <AiGenerateIcon /> },
    { id: 'templates', name: 'Templates', icon: <TemplateIcon /> },
    { id: 'signal-chain', name: 'Signal Chain', icon: <SignalChainIcon /> },
    { id: 'code', name: 'Code Editor', icon: <CodeIcon /> },
    { id: 'builder', name: 'Visual Builder', icon: <VisualBuilderIcon /> },
    { id: 'parameters', name: 'Parameters', icon: <ParametersIcon /> },
    { id: 'test', name: 'Test', icon: <TestIcon /> },
    { id: 'console', name: 'Console', icon: <ConsoleIcon /> },
    { id: 'publish', name: 'Publish', icon: <PublishIcon /> },
];

const PluginDevelopmentIDE: React.FC = () => {
    const [activeTab, setActiveTab] = useState('templates');
    const [activeProject, setActiveProject] = useState<PluginTemplate | null>(null);
    const [logMessages, setLogMessages] = useState<string[]>(['[INFO] Amapiano AI IDE Initialized. Welcome!']);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [compilationSuccess, setCompilationSuccess] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const analyserNodeRef = useRef<AnalyserNode | null>(null);

    const log = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogMessages(prev => [...prev, `[${timestamp}] ${message}`]);
    }, []);

    useEffect(() => {
        const initAudio = async () => {
            log('[INFO] Initializing Audio Engine...');
            try {
                const analyser = await audioEngine.init();
                analyserNodeRef.current = analyser;
                log('[INFO] Audio Engine ready.');
            } catch (e) {
                log(`[ERROR] Failed to initialize Audio Engine. ${e}`);
            }
        };
        initAudio();

        return () => {
            audioEngine.stop();
        };
    }, [log]);

    const handleLoadProject = useCallback((template: PluginTemplate, source: 'template' | 'ai') => {
        log(`[INFO] Loading project: <span class="text-accent font-semibold">${template.name}</span> from ${source}.`);
        setActiveProject(template);
        setActiveTab('code');
        setCompilationSuccess(false);

        if (template.framework === 'Web Audio') {
            log(`[INFO] Connecting Web Audio plugin to audio engine.`);
            audioEngine.connectPlugin(template);
        } else {
            audioEngine.disconnectPlugin();
        }
        if (isPlaying) {
             togglePlay();
        }
    }, [log, isPlaying]);

    const handleCodeChange = (newCode: string) => {
        if (activeProject) {
            setActiveProject({ ...activeProject, code: newCode });
            setCompilationSuccess(false);
        }
    };

    const handleCompile = () => {
        if (!activeProject) return;
        log(`[BUILD] Starting compilation for <span class="font-semibold text-accent">${activeProject.name}</span>...`);
        setIsLoading(true);
        setCompilationSuccess(false);
        
        const steps = [
            `Analyzing ${activeProject.framework} dependencies...`,
            `Compiling source code... (took 2.1s)`,
            `Linking DSP modules: ${activeProject.signalChain?.join(', ')}...`,
            `Optimizing binary...`,
            `✅ Build successful! Your plugin is ready to be exported from the Console tab.`
        ];

        steps.forEach((step, index) => {
            setTimeout(() => {
                log(`[BUILD] ${step}`);
                if (index === steps.length - 1) {
                    setIsLoading(false);
                    setCompilationSuccess(true);
                    setActiveTab('console');
                }
            }, (index + 1) * 700);
        });
    };

    const handleReorder = async (newChain: string[]) => {
        if (!activeProject || activeProject.framework !== 'JUCE') return;
        log(`[AI] Refactoring signal chain to: <span class="text-secondary">${newChain.join(' -> ')}</span>...`);
        setIsAiProcessing(true);
        try {
            const updatedProject = await refactorSignalChain(activeProject, newChain);
            setActiveProject(updatedProject);
            log(`[AI] ✅ Code successfully refactored for new signal chain.`);
        } catch (e: any) {
            log(`[AI] ❌ ERROR: ${e.message}`);
        } finally {
            setIsAiProcessing(false);
        }
    };
    
    const handleAddModule = async (name: string, description: string) => {
        if (!activeProject || activeProject.framework !== 'JUCE') return;
        log(`[AI] Adding module <span class="font-semibold text-accent">${name}</span> to project...`);
        setIsAiProcessing(true);
        try {
            const updatedProject = await addModuleToProject(activeProject, name, description);
            setActiveProject(updatedProject);
            log(`[AI] ✅ Module integrated and code refactored successfully.`);
        } catch (e: any) {
            log(`[AI] ❌ ERROR: ${e.message}`);
        } finally {
            setIsAiProcessing(false);
        }
    };

    const togglePlay = useCallback(async () => {
        if (isPlaying) {
            await audioEngine.stop();
            setIsPlaying(false);
            log('[AUDIO] Playback stopped.');
        } else {
            if (activeProject?.framework === 'Web Audio') {
                const success = await audioEngine.play(activeProject);
                if (success) {
                    setIsPlaying(true);
                    log('[AUDIO] Playback started.');
                } else {
                     log('[WARN] Audio context could not be started. Click the play button again to grant permission.');
                }
            } else {
                log('[WARN] Real-time preview is only available for Web Audio plugins.');
            }
        }
    }, [isPlaying, activeProject, log]);


    const renderActiveView = () => {
        if (!activeProject) {
            switch (activeTab) {
                case 'ai':
                    return <AIGenerateView onPluginGenerated={handleLoadProject} log={log} />;
                default:
                    return <TemplatesView onSelectTemplate={handleLoadProject} />;
            }
        }

        switch (activeTab) {
            case 'ai': return <AIGenerateView onPluginGenerated={handleLoadProject} log={log} />;
            case 'templates': return <TemplatesView onSelectTemplate={handleLoadProject} />;
            case 'code': return <CodeEditorView code={activeProject.code} onCodeChange={handleCodeChange} />;
            case 'parameters': return <ParametersView parameters={activeProject.parameters} />;
            case 'test': return <TestView />;
            case 'publish': return <PublishView />;
            case 'console': return <ConsoleView messages={logMessages} compilationSuccess={compilationSuccess} project={activeProject} />;
            case 'builder': return <VisualBuilderView project={activeProject} analyserNode={analyserNodeRef.current} />;
            case 'signal-chain': return <SignalPatcher project={activeProject} onReorder={handleReorder} onAddModule={handleAddModule} isProcessing={isAiProcessing} />;
            default: return <div>Unknown Tab</div>;
        }
    };

    return (
        <div className="bg-surface rounded-xl shadow-2xl shadow-black/50 border border-background w-full mx-auto animate-fade-in">
            {isLoading && <Loader message="Compiling..." />}
            <header className="px-6 py-4 border-b border-background flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div>
                    <div className="flex items-center space-x-3">
                         <div className="bg-accent/20 p-2 rounded-lg text-accent">
                            <CodeIcon />
                        </div>
                        <h1 className="text-xl font-bold text-primary">Plugin Development IDE</h1>
                    </div>
                    {activeProject && (
                         <div className="flex items-center space-x-2 text-sm mt-2">
                            <span className="text-secondary">Loaded:</span>
                            <span className="font-semibold text-primary">{activeProject.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${activeProject.framework === 'JUCE' ? 'bg-blue-900/50 text-blue-300' : 'bg-yellow-900/50 text-yellow-300'}`}>{activeProject.framework}</span>
                        </div>
                    )}
                </div>
                {activeProject && (
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        {activeProject.framework === 'Web Audio' && <TransportControls isPlaying={isPlaying} onTogglePlay={togglePlay} />}
                        <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface hover:bg-background transition-colors flex items-center"><SaveIcon /> Save</button>
                        <button onClick={handleCompile} className="px-4 py-2 text-sm font-semibold rounded-lg bg-accent text-primary hover:bg-accent-hover transition-colors">Compile</button>
                    </div>
                )}
            </header>
            
            <div className="flex border-b border-background overflow-x-auto">
                {TABS.map(tab => (
                    (!activeProject && !['ai', 'templates'].includes(tab.id)) ? null : (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-accent text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
                        >
                            {tab.icon}
                            <span className="ml-2">{tab.name}</span>
                        </button>
                    )
                ))}
            </div>

            <main className="min-h-[60vh]">
                {renderActiveView()}
            </main>
        </div>
    );
};

export default PluginDevelopmentIDE;
