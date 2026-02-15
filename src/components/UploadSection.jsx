import React, { useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';

const UploadSection = () => {
    // Pull handleFileUpload from the context instead of props
    const { forecast, handleFileUpload } = useOutletContext();
    const navigate = useNavigate();

    useEffect(() => {
        // If we already have data (from localStorage), go straight to results
        if (forecast) {
            navigate('/forecast/results');
        }
    }, [forecast, navigate]);

    return (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-4xl p-24 text-center">
            <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 cursor-pointer hover:shadow-md transition-shadow">
                <label className="cursor-pointer">
                    {/* Use handleFileUpload from context here */}
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".csv, .xlsx, .xls"
                    />
                    <Upload className="text-gray-300" size={32} />
                </label>
            </div>
            <h3 className="text-xl font-bold text-gray-700">Ready to Analyze?</h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-2">
                Upload your Excel or CSV file to see future expense predictions.
            </p>
        </div>
    );
};

export default UploadSection;