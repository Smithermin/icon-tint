import { useState, useRef, useEffect, useCallback } from 'react'
import { Github, Palette, Upload as UploadIcon, Download, Languages, AlertCircle, Check } from 'lucide-react'
import { tintIcon } from './utils/imageUtils'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function App() {
  const [color, setColor] = useState('#07C160')
  const [file, setFile] = useState<File | null>(null)
  const [tintedUrl, setTintedUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSingleColor, setIsSingleColor] = useState(true)

  const processFile = useCallback(async (selectedFile: File) => {
    if (!['image/png', 'image/svg+xml'].includes(selectedFile.type)) {
      setError('仅支持 PNG 或 SVG 格式文件')
      return
    }
    setError(null)
    setFile(selectedFile)
  }, [])

  useEffect(() => {
    if (file) {
      tintIcon(file, color)
        .then(({ url, isSingleColor }) => {
          setTintedUrl(url)
          setIsSingleColor(isSingleColor)
        })
        .catch((err) => {
          console.error(err)
          setError('图片处理失败，请重试')
        })
    }
  }, [file, color])


  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) processFile(droppedFile)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) processFile(selectedFile)
  }

  const downloadIcon = () => {
    if (!tintedUrl || !file) return
    const link = document.createElement('a')
    const fileName = file.name.split('.')
    const extension = fileName.pop()
    link.href = tintedUrl
    link.download = `${fileName.join('.')}_tinted.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-green-100 selection:text-green-900">
      {/* Header */}
      <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-200">
              <Palette size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">IconTint</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100">
              <Languages size={18} />
              <span>中文</span>
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        {/* Hero */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider rounded-full mb-2">
            现代化 · 极简 · 隐私优先
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            图标变色从未如此简单
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            为开发者量身定制的单色图标变色工具，处理过程完全发生在您的浏览器本地。
          </p>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-1">
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "glass rounded-3xl p-8 h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer group relative overflow-hidden",
                isDragging ? "border-green-500 bg-green-50/50 scale-[1.02]" : "border-slate-200 hover:border-green-400 hover:shadow-2xl hover:shadow-green-100/50"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onFileChange} 
                className="hidden" 
                accept=".png,.svg"
              />
              
              {/* Center Icon/Preview */}
              <div className={cn(
                "relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center transition-all mb-6 overflow-hidden shadow-inner",
                file ? "bg-slate-50 border-2 border-white" : "bg-slate-100 text-slate-400 group-hover:text-green-500 group-hover:bg-green-50"
              )}>
                {file ? (
                  <>
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 10%, transparent 10%)', backgroundSize: '6px 6px' }} />
                    <img src={URL.createObjectURL(file)} alt="Original Thumbnail" className="relative z-10 max-w-[60%] max-h-[60%] opacity-50 grayscale object-contain" />
                  </>
                ) : (
                  <UploadIcon size={40} />
                )}
              </div>

              
              <div className="relative z-10 text-center space-y-2">
                <p className="text-base font-bold text-slate-700">
                  {file ? file.name : "点击或拖拽上传图标"}
                </p>
                <p className="text-sm text-slate-400 font-medium">
                  {file ? "点击此处可更换图标" : "支持 SVG, PNG (1MB以内)"}
                </p>
              </div>

              {error && (
                <div className="relative z-10 mt-6 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-full text-xs font-bold">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>
          </div>


          {/* Controls Area */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-8 space-y-10 flex flex-col justify-center h-full">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <label className="text-sm font-bold text-slate-800 uppercase tracking-widest">目标颜色</label>
                   <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase">{color}</span>
                </div>
                <div className="flex gap-4">
                  <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden shadow-inner border border-slate-100 group">
                    <input 
                      type="color" 
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] cursor-pointer border-none bg-transparent" 
                    />
                  </div>
                  <input 
                    type="text" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#HEX"
                    className="flex-1 px-6 bg-slate-50 border-slate-100 border-2 rounded-2xl uppercase font-mono text-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all font-bold" 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-bold text-slate-800 uppercase tracking-widest">常用色板</label>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    '#07C160', // 微信绿
                    '#1890FF', // 蚂蚁蓝
                    '#FF4D4F', // 抖音红
                    '#FFD700', // 金
                    '#722ED1', // 紫
                    '#000000', // 黑
                    '#595959', // 深灰
                    '#BFBFBF', // 浅灰
                    '#FFFFFF', // 白
                    '#FA8C16'  // 橙
                  ].map(preset => (
                    <button 
                      key={preset}
                      onClick={() => setColor(preset)}
                      title={preset}
                      className={cn(
                        "w-full aspect-square rounded-xl border-2 transition-all hover:scale-110 active:scale-95 shadow-sm",
                        color.toLowerCase() === preset.toLowerCase() ? "border-slate-900 scale-110" : "border-white"
                      )}
                      style={{ backgroundColor: preset }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-8 h-full flex flex-col shadow-2xl shadow-slate-200/50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-10 text-center">变色预览</h3>
              <div className="flex-1 flex flex-col items-center justify-between gap-12">
                <div className="relative w-full aspect-square max-w-[200px] flex items-center justify-center bg-slate-50 rounded-[40px] border-4 border-white shadow-inner overflow-hidden group">
                   {/* Professional Checkerboard background for transparency preview */}
                   <div className="absolute inset-0 opacity-[0.05]" style={{ 
                     backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                     backgroundSize: '20px 20px',
                     backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' 
                   }} />
                   
                   {tintedUrl ? (
                     <img src={tintedUrl} alt="Tinted Preview" className="relative z-10 max-w-[70%] max-h-[70%] drop-shadow-md transition-transform group-hover:scale-110" />
                   ) : (
                     <div className="relative z-10 flex flex-col items-center gap-3 text-slate-300">
                        <Palette size={48} strokeWidth={1.5} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">等待上传图标...</span>
                     </div>
                   )}
                </div>
                
                <button 
                  onClick={downloadIcon}
                  disabled={!tintedUrl}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-[24px] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-20 disabled:cursor-not-allowed group"
                >
                  <Download size={20} className="transition-transform group-hover:-translate-y-1" />
                  下载变色图标
                </button>



                {!isSingleColor && tintedUrl && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-2xl text-[10px] font-bold leading-tight">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>检测到图标包含多种颜色，变色效果可能受限</span>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-40 max-w-4xl mx-auto space-y-16">
           <div className="text-center space-y-4">
             <h2 className="text-3xl font-black text-slate-900">常见问题 FAQ</h2>
             <div className="w-12 h-1.5 bg-green-500 mx-auto rounded-full" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 mb-4">
                  <Check size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">IconTint 是如何处理图片的？</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  所有的图片处理均在您的浏览器本地完成（通过 Canvas 和 DOM API），没有任何数据会上传到服务器。您的隐私是我们的首要任务。
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 mb-4">
                  <Check size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">支持哪些图片格式？</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  目前支持 SVG 和 PNG。对于 PNG，我们建议使用具有透明背景的单色图标以获得最佳效果。如果是彩色图，会整体替换为目标色。
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 mb-4">
                  <Check size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">为什么变色后的 PNG 有锯齿？</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  这通常取决于原始图片的质量。Canvas 变色会尽可能保留原始的 Alpha 通道（抗锯齿），但如果原图分辨率较低或带有半透明阴影，变色后可能在边缘处更为明显。
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 mb-4">
                  <Check size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">它是免费的吗？</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  是的，它是完全免费且开源的。作为一个工具类项目，它旨在解决开发者处理图标颜色的最后 1 公里痛点，没有任何广告或付费门槛。
                </p>
              </div>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-slate-200 rounded-md flex items-center justify-center text-slate-500">
              <Palette size={14} />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-400">IconTint</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 IconTint · 基于 React & Tailwind CSS 构建 · 部署于 Cloudflare Pages</p>
          <div className="flex justify-center gap-6 text-slate-300">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Github</a>
            <a href="#" className="hover:text-slate-600 transition-colors">About</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App