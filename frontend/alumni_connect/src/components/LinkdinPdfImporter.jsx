import React, { useState } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// --- IMPORTANT: WORKER CONFIG ---
// This forces the worker to load from a CDN so you don't have to mess with Vite/Webpack config.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const LinkedInPDFImporter = ({ onImport }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- 1. TEXT EXTRACTION ---
    const extractText = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        // Loop through all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Join items with a specialized separator to help parsing
            const pageText = textContent.items.map(item => item.str).join(' | ');
            fullText += ` ${pageText}`;
        }
        return fullText;
    };

    // --- 2. INTELLIGENT PARSING ---
    const parseLinkedInText = (text) => {
        const milestones = [];
        
        // This is a heuristic parser. It looks for date patterns common in LinkedIn PDFs
        // Pattern: (Month Year) - (Month Year | Present)
        // Example: "January 2020 - Present" or "Oct 2018 - Dec 2019"
        const datePattern = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\s*-\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|Present)/gi;

        // Clean up the text stream for easier regex matching
        // We replace the pipe separators we added earlier with newlines for logic
        const cleanText = text.replace(/ \| /g, '\n');
        const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // State machine to track where we are in the document
        let currentSection = 'Intro'; // Intro, Experience, Education

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Detect Section Headers
            if (line.toLowerCase() === 'experience') {
                currentSection = 'Experience';
                continue;
            }
            if (line.toLowerCase() === 'education') {
                currentSection = 'Education';
                continue;
            }

            // Look for a date range in this line (This is usually the anchor for a job/school)
            // If we find a date, the lines *before* it are usually the Title and Company
            const dateMatch = line.match(datePattern);

            if (dateMatch && (currentSection === 'Experience' || currentSection === 'Education')) {
                // If we found a date, let's look at the previous 1-2 lines for context
                const dateStr = dateMatch[0]; // "Jan 2021 - Present"
                const startYear = dateStr.split('-')[0].match(/\d{4}/)?.[0] || new Date().getFullYear();

                let title = 'Unknown Role';
                let subTitle = '';

                // Heuristic: The line immediately before the date is usually the Company/School
                // The line before THAT is usually the Job Title/Degree
                if (i > 0) subTitle = lines[i - 1]; // Company or School
                if (i > 1) title = lines[i - 2]; // Job Title or Degree

                // Refine based on section
                if (currentSection === 'Experience') {
                    // Filter out noise (sometimes location is mixed in)
                    if (title.length < 50 && subTitle.length < 50) {
                        milestones.push({
                            type: title.toLowerCase().includes('intern') ? 'Internship' : 'Job',
                            milestone: `${title} at ${subTitle}`,
                            year: startYear,
                            description: '', // Hard to extract description reliably from PDF text stream
                        });
                    }
                } else if (currentSection === 'Education') {
                    milestones.push({
                        type: 'Education',
                        milestone: subTitle, // School Name is usually the "stronger" entity in Education
                        year: startYear,
                        description: title, // Degree
                    });
                }
            }
        }

        return milestones;
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const text = await extractText(file);
            const parsedData = parseLinkedInText(text);
            
            if (parsedData.length === 0) {
                setError("Could not find any clear Experience or Education data. Please add manually.");
            } else {
                onImport(parsedData);
            }
        } catch (err) {
            console.error(err);
            setError("Error reading PDF. It might be password protected or corrupted.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-8 w-full max-w-2xl mx-auto">
             <div className="relative border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-6 text-center hover:bg-blue-50 transition-colors group">
                <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={loading}
                />
                
                <div className="flex flex-col items-center justify-center space-y-3">
                    {loading ? (
                        <>
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            <p className="text-sm font-medium text-blue-700">Reading your resume...</p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Auto-fill from LinkedIn PDF</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Go to LinkedIn Profile &rarr; More &rarr; Save to PDF
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default LinkedInPDFImporter;