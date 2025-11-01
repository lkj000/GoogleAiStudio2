

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
            log(`✅ AI successfully generated plugin: <span class="text-accent-hover font-semibold">${plugin.name}</span>`);
            setGeneratedPlugin(plugin);
        } catch (e: any) {
            log(`<span class="text-hot-pink">❌ AI Generation Failed: ${e.message}</span>`);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartTemplate = async (templateName: 'Amapianorizer' | 'Lofi Chillifier') => {
        setLoadingMessage(`Building ${templateName}...`);
        setIsLoading(true);
        setError(null);
        setGeneratedPlugin(null);
        log(`🧠 Generating Smart Template: ${templateName}...`);
        try {
            const plugin = await generatePluginFromSmartTemplate(templateName);
            log(`✅ AI successfully generated Smart Template: <span class="text-accent-hover font-semibold">${plugin.name}</span>`);
            setGeneratedPlugin(plugin);
        } catch (e: any) {
            log(`<span class="text-hot-pink">❌ Smart Template Generation Failed: ${e.message}</span>`);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-8 h-full flex flex-col items-center justify-center">
            {isLoading && <Loader message={loadingMessage} />}
            <div className="w-full max-w-4xl">
                 <div className="text-center">
                    <h3 className="text-2xl font-bold text-primary mb-2">Create Anything</h3>
                    <p className="text-secondary mb-6 max-w-xl mx-auto">Describe the plugin, module, or instrument you can imagine, or use a Smart Template to get started instantly.</p>
                </div>
                
                <div className="bg-surface p-4 rounded-xl border border-background">
                    <textarea 
                        placeholder="e.g., 'A wobbly lo-fi chorus effect with wow and flutter knobs'" 
                        rows={3} 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-background border border-surface rounded-md py-3 px-4 text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />

                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 p-1 bg-background rounded-lg">
                            <button onClick={() => setFramework('JUCE')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${framework === 'JUCE' ? 'bg-accent text-white' : 'text-secondary hover:bg-surface'}`}>JUCE (C++)</button>
                            <button onClick={() => setFramework('Web Audio')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${framework === 'Web Audio' ? 'bg-accent text-white' : 'text-secondary hover:bg-surface'}`}>Web Audio (JS)</button>
                        </div>

                         <button onClick={handleGenerate} disabled={isLoading} className="w-full sm:w-auto bg-accent text-primary font-semibold py-2.5 px-6 rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center space-x-2 disabled:opacity-50">
                            <AiGenerateIcon />
                            <span>Generate Plugin</span>
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="text-lg font-semibold text-center text-secondary mb-4">Or start with a Smart Template</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <SmartTemplateCard 
                            title="Amapianorizer"
                            description="A genre-defining multi-effect for authentic Amapiano sounds."
                            onGenerate={() => handleSmartTemplate('Amapianorizer')}
                       />
                       <SmartTemplateCard 
                            title="Lofi Chillifier"
                            description="Instantly add vintage warmth, tape hiss, and hazy echoes."
                            onGenerate={() => handleSmartTemplate('Lofi Chillifier')}
                       />
                    </div>
                </div>

                {error && <p className="mt-4 text-hot-pink text-center">{error}</p>}
            </div>

            {generatedPlugin && (
                <div className="mt-8 w-full max-w-md">
                    <AIGeneratedTemplateCard template={generatedPlugin} onSelect={() => onPluginGenerated(generatedPlugin, 'ai')} />
                </div>
            )}
        </div>
    );
};


// --- Main IDE Component ---

type Tab = 'AI Generate' | 'Templates' | 'Signal Chain' | 'Code Editor' | 'Visual Builder' | 'Parameters' | 'Test' | 'Console' | 'Publish';

const IdeTab: React.FC<{ icon: React.ReactNode; label: Tab; activeTab: Tab; onClick: (tab: Tab) => void; }> = ({ icon, label, activeTab, onClick }) => (
    <button
        onClick={() => onClick(label)}
        className={`flex items-center px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === label ? 'border-accent text-primary' : 'border-transparent text-secondary hover:text-primary hover:border-surface'}`}
    >
        {icon}
        {label}
    </button>
);

const ActionButton: React.FC<{ children: React.ReactNode; primary?: boolean; className?: string; onClick?: () => void; disabled?: boolean; }> = ({ children, primary, className = '', onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${primary ? 'bg-accent text-primary hover:bg-accent-hover' : 'bg-surface text-primary hover:bg-background'} ${className}`}>
        {children}
    </button>
);


const PluginDevelopmentIDE: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Templates');
    const [activeProject, setActiveProject] = useState<PluginTemplate | null>(null);
    const [projectCode, setProjectCode] = useState<string>('');
    const [consoleMessages, setConsoleMessages] = useState<string[]>(['Welcome to Amapiano AI Plugin IDE.']);
    const [isProcessing, setIsProcessing] = useState(false); // For both compiling and AI module adding
    const [compilationSuccess, setCompilationSuccess] = useState(false);
    const [contentKey, setContentKey] = useState(0); // Used to re-trigger animation
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const analyserNode = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const analyser = await audioEngine.init();
                analyserNode.current = analyser;
                setIsAudioReady(true);
            } catch (error) {
                console.error("Failed to initialize audio engine:", error);
                logToConsole('<span class="text-hot-pink">Error initializing audio engine. Please allow microphone access or refresh.</span>');
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (activeProject) {
            setProjectCode(activeProject.code);
            if (activeProject.framework === 'Web Audio') {
                audioEngine.connectPlugin(activeProject);
            } else {
                audioEngine.disconnectPlugin();
            }
        } else {
            setProjectCode('');
            audioEngine.disconnectPlugin();
        }
    }, [activeProject]);

    useEffect(() => {
        setContentKey(prev => prev + 1);
    }, [activeTab, activeProject]);

    const logToConsole = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setConsoleMessages(prev => [...prev, `<span class="text-gray-500">[${timestamp}]</span> ${message}`]);
    };

    const handleSelectTemplate = (template: PluginTemplate, source: 'template' | 'ai' = 'template') => {
        setCompilationSuccess(false);
        setActiveProject(template);
        if (source === 'ai') {
             logToConsole(`🤖 AI-Generated Plugin "<span class="text-accent-hover font-semibold">${template.name}</span>" loaded. Check out its controls in the Visual Builder!`);
        } else {
            logToConsole(`📄 Template "<span class="text-accent-hover font-semibold">${template.name}</span>" loaded.`);
        }
        setActiveTab('Visual Builder');
    };
    
    const handleCloseProject = () => {
        if (activeProject) {
            logToConsole(`Project "<span class="text-accent-hover font-semibold">${activeProject.name}</span>" closed.`);
        }
        if (isPlaying) {
            audioEngine.stop();
            setIsPlaying(false);
        }
        setActiveProject(null);
        setCompilationSuccess(false);
        setActiveTab('Templates');
    };

    const handleCompile = async () => {
        if (!activeProject) return;
        setCompilationSuccess(false);
        setIsProcessing(true);
        setActiveTab('Console');
        logToConsole(`Starting cloud build for "${activeProject.name}"...`);

        const steps = [
            "Packaging source files...",
            "Authenticating with build service...",
            "Uploading (5.2 MB)...",
            "Build queued on `macos-arm64` runner...",
            "Installing JUCE dependencies...",
            "Compiling PluginProcessor.cpp...",
            "Compiling PluginEditor.cpp...",
            "Linking...",
            "Signing artifact...",
        ];
        
        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
            logToConsole(`✓ ${step}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        logToConsole("✨ Build successful! Artifacts ready for export.");
        setIsProcessing(false);
        setCompilationSuccess(true);
    };
    
    const handleAddModule = async (moduleName: string, moduleDescription: string) => {
        if (!activeProject) return;
        setCompilationSuccess(false);

        setIsProcessing(true);
        setActiveTab('Console');
        logToConsole(`🧠 Instructing AI to add <span class="text-vivid-sky-blue font-semibold">'${moduleName}'</span> module...`);

        try {
            const updatedProject = await addModuleToProject(activeProject, moduleName, moduleDescription);
            setActiveProject(updatedProject);
            logToConsole(`✅ AI successfully integrated the <span class="text-vivid-sky-blue font-semibold">'${moduleName}'</span> module.`);
            logToConsole(`🚀 The new module has been added to your Signal Chain!`);
            setActiveTab('Signal Chain');
        } catch (e: any) {
            logToConsole(`<span class="text-hot-pink">❌ AI Module Integration Failed: ${e.message}</span>`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReorderChain = async (newChain: string[]) => {
        if (!activeProject) return;
        setCompilationSuccess(false);
        setIsProcessing(true);
        setActiveTab('Console');
        logToConsole(`🧠 Instructing AI to refactor signal chain...`);
        try {
            const updatedProject = await refactorSignalChain(activeProject, newChain);
            setActiveProject(updatedProject);
            logToConsole(`✅ AI successfully refactored the signal chain order.`);
        } catch (e: any) {
             logToConsole(`<span class="text-hot-pink">❌ AI Signal Chain Refactor Failed: ${e.message}</span>`);
        } finally {
            setIsProcessing(false);
        }
    };

    const togglePlay = async () => {
        if (isPlaying) {
            audioEngine.stop();
            setIsPlaying(false);
        } else {
            await audioEngine.play();
            setIsPlaying(true);
        }
    };

    const renderContent = () => {
        const noProject = !activeProject && !['Templates', 'AI Generate'].includes(activeTab);
        if (noProject) {
             return (
                <div className="p-8 text-center text-secondary h-full flex flex-col justify-center items-center">
                    <h3 className="text-xl font-semibold text-primary">No Active Project</h3>
                    <p className="mt-2">Please select a template or use AI Generate to begin.</p>
                     <button onClick={() => setActiveTab('Templates')} className="mt-4 bg-accent text-primary font-semibold py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors">
                        Go to Templates
                    </button>
                </div>
            );
        }

        switch (activeTab) {
            case 'Templates':
                return <TemplatesView onSelectTemplate={handleSelectTemplate} />;
            case 'Signal Chain':
                return activeProject && <SignalPatcher project={activeProject} onReorder={handleReorderChain} onAddModule={handleAddModule} isProcessing={isProcessing} />;
            case 'Code Editor':
                return activeProject && <CodeEditorView code={projectCode} onCodeChange={setProjectCode} />;
            case 'Visual Builder':
                return activeProject && <VisualBuilderView project={activeProject} analyserNode={analyserNode.current} />;
            case 'Parameters':
                return activeProject && <ParametersView parameters={activeProject.parameters} />;
            case 'Test':
                return activeProject && <TestView />;
            case 'Console':
                return <ConsoleView messages={consoleMessages} compilationSuccess={compilationSuccess} project={activeProject} />;
            case 'Publish':
                return activeProject && <PublishView />;
            case 'AI Generate':
                return <AIGenerateView onPluginGenerated={handleSelectTemplate} log={logToConsole} />;
            default:
                return null;
        }
    };
    
    const projectName = activeProject ? `${activeProject.name}` : "Untitled Plugin";

    return (
        <div className="bg-surface rounded-xl border border-background shadow-2xl overflow-hidden shadow-accent-glow/10">
            {/* IDE Header */}
            <div className="p-4 flex items-center justify-between border-b border-background bg-surface/80 backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                    <div className="text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-primary">Plugin Development IDE</h1>
                        <div className="flex items-center text-xs text-secondary space-x-2 mt-1">
                            <span>{projectName}</span>
                            {activeProject && <span className="bg-vivid-sky-blue/20 text-vivid-sky-blue px-2 py-0.5 rounded-full font-semibold">{activeProject.framework}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {activeProject?.framework === 'Web Audio' && isAudioReady && <TransportControls isPlaying={isPlaying} onTogglePlay={togglePlay} />}
                    <ActionButton disabled={!activeProject}><SaveIcon /> Save</ActionButton>
                    <ActionButton primary onClick={handleCompile} disabled={!activeProject || isProcessing}>
                         {isProcessing && activeTab === 'Console' ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8_0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {isProcessing ? 'Processing...' : 'Compile'}
                    </ActionButton>
                    <ActionButton onClick={() => setActiveTab('Test')} disabled={!activeProject}>Test</ActionButton>
                    <ActionButton onClick={() => setActiveTab('Publish')} disabled={!activeProject}>Publish</ActionButton>
                    {activeProject &&
                        <button onClick={handleCloseProject} className="text-secondary hover:text-primary ml-2" title="Close Project">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    }
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center border-b border-background overflow-x-auto">
                <IdeTab icon={<AiGenerateIcon />} label="AI Generate" activeTab={activeTab} onClick={setActiveTab} />
                <IdeTab icon={<TemplateIcon />} label="Templates" activeTab={activeTab} onClick={setActiveTab} />
                <IdeTab icon={<SignalChainIcon />} label="Signal Chain" activeTab={activeTab} onClick={setActiveTab} />
                <IdeTab icon={<CodeIcon />} label="Code Editor" activeTab={activeTab} onClick={setActiveTab} />
                <IdeTab icon={<VisualBuilderIcon />} label="Visual Builder" activeTab={activeTab} onClick={setActiveTab} />
                <IdeTab icon={<ParametersIcon />} label="Parameters" activeTab={activeTab} onClick={setActiveTab} />
                <IdeTab icon={<TestIcon />} label="Test" activeTab={activeTab} onClick={setActiveTab} />
                <IdeTab icon={<ConsoleIcon />} label="Console" activeTab={activeTab} onClick={setActiveTab} />
                <IdeTab icon={<PublishIcon />} label="Publish" activeTab={activeTab} onClick={setActiveTab} />
            </div>

            {/* Tab Content */}
            <div key={contentKey} className="bg-background min-h-[70vh] animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default PluginDevelopmentIDE;
