"use client";

import { useState } from "react";
import { ArrowLeft, UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, TableProperties } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { bulkImportProducts } from "@/lib/bulk-product";

export default function BulkUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      setError("Please upload a valid .csv file");
      return;
    }

    setFile(selectedFile);
    setError(null);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) return setError("File is empty.");

      // ✅ FIX 6: Exact Header Check
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      if (headers[0] !== "title" || headers[1] !== "price" || headers[2] !== "stock") {
        setError("Invalid Format. Columns must exactly be: Title, Price, Stock, Category, ImageURL, Description");
        setFile(null);
        return;
      }

      // ✅ FIX 4: Row Limit Protection (500 products + 1 header)
      if (lines.length > 501) {
        setError("Row limit exceeded! Maximum 500 products allowed per upload.");
        setFile(null);
        return;
      }

      const data = lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ''));
        
        // ✅ FIX 2: Anti-CSV Injection (Reject malicious Excel formulas)
        const isMalicious = values.some(v => /^[=+\-@]/.test(v));
        if (isMalicious) {
          console.warn("Blocked malicious row:", values[0]);
          return null; 
        }
        
        return {
          title: values[0],
          // ✅ FIX 5: Convert strings to numbers for UI preview
          price: Number(values[1]) || 0,
          stock: Number(values[2]) || 0,
          category: values[3] || "General",
          image: values[4] || "",
          description: values[5] || ""
        };
      }).filter(item => item !== null && item.title && item.price > 0);

      setPreviewData(data);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!previewData.length) return;
    setLoading(true);
    const toastId = toast.loading("Importing stickers securely...");

    // Sending sanitized data to server
    const result = await bulkImportProducts(previewData);

    setLoading(false);

    if (result.success) {
      toast.success(`Success! Imported ${result.count} stickers. 🎉`, { id: toastId });
      router.push("/admin/products");
    } else {
      toast.error(result.error || "Import failed", { id: toastId });
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Title,Price,Stock,Category,ImageURL,Description\nDemo Sticker,99,50,Anime,https://via.placeholder.com/300,Cool sticker";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stickyspot_template.csv");
    document.body.appendChild(link);
    link.click();
    toast.success("Template Downloaded!");
  };

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link href="/admin/products" className="p-3 bg-white border border-slate-200 text-slate-400 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Bulk Import Stickers</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Populate your inventory instantly via CSV upload.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT: Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <div className="text-center sm:text-left">
              <h3 className="font-black text-slate-900 mb-1">1. Format Template</h3>
              <p className="text-xs font-medium text-slate-400">Download the standard CSV structure.</p>
            </div>
            <button 
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all text-sm font-black uppercase tracking-wider"
            >
              <FileSpreadsheet size={18} strokeWidth={2.5} /> Get CSV
            </button>
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                <UploadCloud className="text-indigo-500" size={20} /> 2. Upload Your CSV
            </h3>
            
            <div className={`relative w-full h-56 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
              
              {file ? (
                <div className="text-center animate-in zoom-in duration-300">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                    <CheckCircle size={28} strokeWidth={2.5} />
                  </div>
                  <p className="font-black text-slate-900 px-4 line-clamp-1">{file.name}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{(file.size / 1024).toFixed(2)} KB • Ready</p>
                  <button onClick={() => {setFile(null); setPreviewData([])}} className="text-xs font-black text-rose-500 hover:text-rose-600 mt-4 uppercase tracking-tighter underline underline-offset-4">Discard File</button>
                </div>
              ) : (
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} className="text-slate-400 group-hover:text-indigo-500 transition-colors" strokeWidth={1.5} />
                  </div>
                  <p className="font-bold text-slate-600">Click to upload or drag & drop</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">Standard .csv files only (Max 500 rows)</p>
                </div>
              )}
              
              {!file && (
                <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              )}
            </div>

            {error && (
                <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in shake duration-500">
                    <AlertCircle size={20} strokeWidth={2.5} /> {error}
                </div>
            )}
          </div>

        </div>

        {/* RIGHT: Preview & Action */}
        <div className="sticky top-8">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 flex flex-col h-full min-h-[400px]">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                    <TableProperties size={20} className="text-indigo-400" /> Preview Data
                </h3>
                
                {previewData.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-auto rounded-2xl mb-6 bg-white/5 border border-white/10 custom-scrollbar-dark">
                            <table className="w-full text-left">
                                <thead className="bg-white/10 sticky top-0">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="p-3">Title</th>
                                        <th className="p-3">Price</th>
                                        <th className="p-3 text-right">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {previewData.map((row, i) => (
                                        <tr key={i} className="text-xs font-medium text-slate-300">
                                            <td className="p-3 truncate max-w-[80px]" title={row.title}>{row.title}</td>
                                            {/* ✅ FIX 5: Proper INR formatting */}
                                            <td className="p-3 text-indigo-400 font-bold">₹{row.price.toLocaleString('en-IN')}</td>
                                            <td className="p-3 text-right">{row.stock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mb-6 flex justify-between items-center border-t border-white/10 pt-4">
                            <span className="text-xs font-bold text-slate-400 uppercase">Valid Items</span>
                            <span className="font-black text-xl text-indigo-400">{previewData.length}</span>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border border-white/5 border-dashed rounded-2xl mb-6 py-10 text-center">
                        <TableProperties size={40} className="opacity-10 mb-4" />
                        <p className="text-sm font-medium italic opacity-40">Awaiting safe file upload...</p>
                    </div>
                )}

                <button 
                    onClick={handleUpload}
                    disabled={!file || loading || previewData.length === 0}
                    className="w-full py-4 bg-indigo-500 text-white font-black rounded-2xl hover:bg-indigo-400 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    {loading ? <Loader2 size={22} className="animate-spin" /> : <><UploadCloud size={20} strokeWidth={2.5} /> Process Import</>}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}