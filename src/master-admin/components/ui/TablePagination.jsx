import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TablePagination = ({ dataLength, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }) => {
    const totalPages = Math.ceil(dataLength / itemsPerPage);
    
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-gray-50/50">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Show</span>
                <select 
                    value={itemsPerPage} 
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="text-xs border border-gray-200 rounded-[10px] bg-white px-2 py-1 outline-none focus:border-primary cursor-pointer"
                >
                    {[10, 20, 30, 40, 50].map(val => (
                        <option key={val} value={val}>{val}</option>
                    ))}
                </select>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Entries</span>
            </div>
            
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Showing {dataLength === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, dataLength)} of {dataLength}
                </span>
                
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded-[10px] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs font-bold text-gray-700 min-w-[20px] text-center">{currentPage}</span>
                    <button 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1 rounded-[10px] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TablePagination;
