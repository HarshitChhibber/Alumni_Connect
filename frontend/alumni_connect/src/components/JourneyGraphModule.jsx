import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Briefcase, GraduationCap, Globe, MapPin, Zap, TrendingUp, Plus, Upload, Loader2, FileText, CheckCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Fix: Import the worker locally using Vite's ?url suffix
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MilestoneIconMap = {
    Job: { icon: Briefcase, color: 'bg-emerald-600', cardColor: 'border-emerald-400', textColor: 'text-emerald-700' },
    Internship: { icon: Briefcase, color: 'bg-indigo-600', cardColor: 'border-indigo-400', textColor: 'text-indigo-700' },
    Education: { icon: GraduationCap, color: 'bg-rose-600', cardColor: 'border-rose-400', textColor: 'text-rose-700' },
    Project: { icon: Zap, color: 'bg-amber-500', cardColor: 'border-amber-400', textColor: 'text-amber-700' },
    Achievement: { icon: Zap, color: 'bg-purple-600', cardColor: 'border-purple-400', textColor: 'text-purple-700' },
    Default: { icon: Globe, color: 'bg-gray-600', cardColor: 'border-gray-400', textColor: 'text-gray-700' },
};

// 🔹 Multiple color options JUST for Job milestones
const JobColorVariants = [
    // same as your original
    { color: 'bg-emerald-600', cardColor: 'border-emerald-400', textColor: 'text-emerald-700' },
    // extra variants you can reuse in other profiles/designs
    { color: 'bg-sky-600', cardColor: 'border-sky-400', textColor: 'text-sky-700' },
    { color: 'bg-amber-500', cardColor: 'border-amber-400', textColor: 'text-amber-700' },
    { color: 'bg-teal-600', cardColor: 'border-teal-400', textColor: 'text-teal-700' },
    { color: 'bg-lime-600', cardColor: 'border-lime-400', textColor: 'text-lime-700' },
];

// --- SUB-COMPONENT: PDF PARSER ---
const LinkedInImporter = ({ onImport }) => {
    const [status, setStatus] = useState('idle'); // idle, parsing, success, error

    const extractText = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' | ') + ' | ';
        }
        return fullText;
    };

    const parseLinkedInText = (text) => {
        const milestones = [];
        const datePattern = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\s*-\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|Present)/gi;
        
        const cleanText = text.replace(/ \| /g, '\n');
        const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let currentSection = 'Intro'; 

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.toLowerCase() === 'experience') { currentSection = 'Experience'; continue; }
            if (line.toLowerCase() === 'education') { currentSection = 'Education'; continue; }

            const dateMatch = line.match(datePattern);
            if (dateMatch && (currentSection === 'Experience' || currentSection === 'Education')) {
                const dateStr = dateMatch[0];
                const startYear = dateStr.split('-')[0].match(/\d{4}/)?.[0] || new Date().getFullYear();
                
                let title = 'Unknown Role';
                let subTitle = '';
                if (i > 0) subTitle = lines[i - 1]; 
                if (i > 1) title = lines[i - 2]; 

                if (currentSection === 'Experience' && title.length < 60) {
                    milestones.push({
                        type: title.toLowerCase().includes('intern') ? 'Internship' : 'Job',
                        milestone: `${title} at ${subTitle}`,
                        year: startYear,
                        description: `Role at ${subTitle}`,
                    });
                } else if (currentSection === 'Education') {
                    milestones.push({
                        type: 'Education',
                        milestone: subTitle,
                        year: startYear,
                        description: title,
                    });
                }
            }
        }
        return milestones;
    };

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setStatus('parsing');
        try {
            const text = await extractText(file);
            const data = parseLinkedInText(text);
            if (data.length > 0) {
                onImport(data);
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="flex items-center gap-4 mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="bg-blue-50 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-800">Auto-fill from LinkedIn</h4>
                <p className="text-xs text-slate-500">Upload your "Profile  Save to PDF" to populate the graph.</p>
            </div>
            <div>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    status === 'parsing' ? 'bg-slate-100 text-slate-400' : 
                    status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                    'bg-slate-900 text-white hover:bg-slate-800'
                }`}>
                    {status === 'parsing' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {status === 'success' && <CheckCircle className="w-4 h-4" />}
                    {status === 'idle' && <Upload className="w-4 h-4" />}
                    {status === 'parsing' ? 'Reading...' : status === 'success' ? 'Imported!' : 'Upload PDF'}
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFile} disabled={status === 'parsing'} />
                </label>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const JourneyGraphModule = ({ milestones = [], onAddClick, onImport }) => {
    const scrollContainerRef = useRef(null);

    // --- SORTING LOGIC ---
    const sortedMilestones = useMemo(() => {
        if (!milestones) return [];
        return [...milestones].sort((a, b) => {
            const yearA = parseInt(a.year) || 0;
            const yearB = parseInt(b.year) || 0;
            return yearA - yearB;
        });
    }, [milestones]);

    // Scroll to end on load
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [sortedMilestones]);

    // --- LAYOUT CONFIG ---
    const CARD_WIDTH = 260;
    const MILESTONE_SPACING = 300;
    const START_OFFSET = (CARD_WIDTH / 2) + 50; 
    const lastNodeX = START_OFFSET + (sortedMilestones.length - 1) * MILESTONE_SPACING;
    const finalWidth = Math.max(lastNodeX + (CARD_WIDTH / 2) + 50, 800);
    const svgHeight = 400;
    const centerlineY = svgHeight / 2;
    const amplitude = 60; 

    // --- CALCULATE POINTS ---
    const milestonePoints = sortedMilestones.map((_, index) => {
        const x = START_OFFSET + index * MILESTONE_SPACING;
        const y = centerlineY + (index % 2 === 0 ? amplitude : -amplitude);
        return { x, y };
    });

    // --- SVG PATH ---
    let svgPathD = `M 0 ${centerlineY}`; 
    if (milestonePoints.length > 0) {
        const first = milestonePoints[0];
        svgPathD += ` C ${first.x * 0.4} ${centerlineY}, ${first.x * 0.6} ${first.y}, ${first.x} ${first.y}`;
    }
    for (let i = 0; i < milestonePoints.length - 1; i++) {
        const curr = milestonePoints[i];
        const next = milestonePoints[i + 1];
        const cp1X = curr.x + (next.x - curr.x) / 2;
        svgPathD += ` C ${cp1X} ${curr.y}, ${cp1X} ${next.y}, ${next.x} ${next.y}`;
    }
    if (milestonePoints.length > 0) {
        const last = milestonePoints[milestonePoints.length - 1]; 
        svgPathD += ` C ${last.x + 80} ${last.y}, ${last.x + 80} ${centerlineY}, ${finalWidth} ${centerlineY}`;
    }

    return (
        <div className="w-full">
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar { height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f5f5f5; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }
                `}
            </style>

            {/* --- INTEGRATED LINKEDIN IMPORTER --- */}
            {onImport && <LinkedInImporter onImport={onImport} />}

            {/* --- EMPTY STATE --- */}
            {(!sortedMilestones || sortedMilestones.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                    <div className="bg-neutral-100 p-4 rounded-full mb-3">
                        <TrendingUp className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-neutral-600 font-semibold">No milestones added yet</h3>
                    <p className="text-neutral-400 text-sm mb-4">Start visualizing your career journey.</p>
                    {onAddClick && (
                        <button onClick={onAddClick} className="px-4 py-2 bg-neutral-900 text-white text-sm font-bold rounded-lg hover:bg-neutral-800 transition">
                            Add First Milestone
                        </button>
                    )}
                </div>
            ) : (
                /* --- GRAPH VIEW --- */
                <div 
                    className="relative w-full overflow-x-auto custom-scrollbar bg-neutral-50/50 min-h-[420px] pb-4 rounded-xl border border-neutral-200" 
                    ref={scrollContainerRef}
                >
                    <div className="relative" style={{ width: `${finalWidth}px`, height: `${svgHeight}px` }}>
                        
                        {/* SVG Lines */}
                        <svg className="absolute top-0 left-0 pointer-events-none" width={finalWidth} height={svgHeight}>
                            <path d={svgPathD} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="48" strokeLinecap="round" />
                            <path d={svgPathD} fill="none" stroke="#334155" strokeWidth="40" strokeLinecap="round" />
                            <path d={svgPathD} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="12 12" className="opacity-80" />
                        </svg>

                        {/* Nodes & Cards */}
                        {sortedMilestones.map((m, index) => {
                            const { x, y } = milestonePoints[index];
                            const baseConfig = MilestoneIconMap[m.type] || MilestoneIconMap.Default;
                            const Icon = baseConfig.icon;

                            // default colors from map
                            let color = baseConfig.color;
                            let cardColor = baseConfig.cardColor;
                            let textColor = baseConfig.textColor;

                            // 🔹 If this milestone is a Job, use a variant color based on index
                            if (m.type === 'Job') {
                                const variant = JobColorVariants[index % JobColorVariants.length];
                                color = variant.color;
                                cardColor = variant.cardColor;
                                textColor = variant.textColor;
                            }

                            const isLow = y > centerlineY;
                            const cardTop = isLow ? y - 200 : y + 50;

                            return (
                                <React.Fragment key={index}>
                                    {/* Dot */}
                                    <div
                                        className="absolute w-4 h-4 bg-slate-800 rounded-full border-2 border-white shadow-sm z-10"
                                        style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
                                    />
                                    
                                    {/* Pin */}
                                    <div
                                        className="absolute z-20 group"
                                        style={{ left: x, top: y, transform: 'translate(-50%, -100%)', paddingBottom: '10px' }}
                                    >
                                        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center border-4 border-white shadow-xl transition-transform hover:scale-110`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="w-1 h-3 bg-slate-800 mx-auto -mt-1 rounded-b-full opacity-50"></div>
                                    </div>

                                    {/* Card */}
                                    <div 
                                        className={`absolute w-[260px] p-4 bg-white rounded-xl shadow-lg border-t-4 ${cardColor} z-10 hover:z-30 transition-all hover:shadow-xl`} 
                                        style={{ left: x, top: cardTop, transform: 'translateX(-50%)' }}
                                    >
                                        <div className={`absolute left-1/2 -translate-x-1/2 w-0.5 bg-slate-200 -z-10 ${isLow ? 'bottom-[-30px] h-[30px]' : 'top-[-30px] h-[30px]'}`}></div>
                                        <div className="flex justify-between mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${color}`}>{m.year}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{m.type}</span>
                                        </div>
                                        <h3 className={`text-sm font-bold ${textColor} leading-tight`}>{m.milestone}</h3>
                                        <p className="text-slate-500 text-xs mt-1 line-clamp-3">{m.description}</p>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JourneyGraphModule;
