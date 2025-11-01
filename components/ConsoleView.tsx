import React, { useEffect, useRef } from 'react';
import { PluginTemplate } from '../types';
import ExportView from './ExportView';

const ConsoleView: React.FC<{ messages: string[], compilationSuccess: boolean, project: PluginTemplate | null }> = ({ messages, compilationSuccess, project }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="p-4 h-full bg-[#1E1E1E] rounded-b-xl flex flex-col">
            {compilationSuccess && project && <ExportView project={project} />}
            <div className="flex-grow overflow-y-auto">
                <pre className="text-xs text-secondary font-mono whitespace-pre-wrap">
                    {messages.map((msg, i) => <div key={i} dangerouslySetInnerHTML={{ __html: msg }} />)}
                </pre>
                 <div ref={endOfMessagesRef} />
            </div>
        </div>
    );
};

export default ConsoleView;