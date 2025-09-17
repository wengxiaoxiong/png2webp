"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, X, ImageIcon, FileImage, Zap, Github, Sparkles, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "@/components/language-switcher"

interface ConvertedFile {
  originalFile: File
  convertedDataUrl: string
  originalSize: number
  convertedSize: number
  compressionRatio: number
  outputFormat: string
}

type OutputFormat = 'webp' | 'png' | 'jpg' | 'jpeg'

export default function ImageConverter() {
  const { t } = useTranslation()
  const [files, setFiles] = useState<File[]>([])
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([])
  const [quality, setQuality] = useState([90])
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('webp')
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set())

  // Helper function to create and track object URLs
  const createObjectURL = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    objectUrlsRef.current.add(url)
    return url
  }, [])

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const imageFiles = Array.from(selectedFiles).filter(
      (file) => file.type.startsWith("image/") || 
      /\.(png|jpg|jpeg|gif|bmp|tiff|tif|webp|svg|heic|heif|avif|ico|psd|raw|cr2|nef|arw|dng)$/i.test(file.name),
    )

    setFiles((prev) => [...prev, ...imageFiles])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      console.log('Files dropped:', e.dataTransfer.files)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url)
      })
      objectUrlsRef.current.clear()
    }
  }, [])

  const convertImage = async (file: File, qualityValue: number, format: OutputFormat): Promise<ConvertedFile> => {
    return new Promise(async (resolve, reject) => {
      try {
        let processedFile = file
        
        // 检查是否为HEIC/HEIF格式，如果是则先转换
        if (file.name.toLowerCase().match(/\.(heic|heif)$/i) || file.type === 'image/heic' || file.type === 'image/heif') {
          try {
            // 动态导入heic2any以避免服务器端渲染问题
            const heic2any = (await import('heic2any')).default
            const convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 1.0
            })
            
            // heic2any可能返回单个Blob或Blob数组
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
            processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
              type: 'image/jpeg'
            })
          } catch (heicError) {
            console.error('HEIC conversion error:', heicError)
            reject(new Error(t('errors.heicConversionError')))
            return
          }
        }

        const img = new Image()
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error(t('errors.canvasError')))
          return
        }

        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          // 根据输出格式设置MIME类型
          let mimeType: string
          switch (format) {
            case 'webp':
              mimeType = "image/webp"
              break
            case 'png':
              mimeType = "image/png"
              break
            case 'jpg':
            case 'jpeg':
              mimeType = "image/jpeg"
              break
            default:
              mimeType = "image/webp"
          }

          const convertedDataUrl = canvas.toDataURL(mimeType, qualityValue / 100)

          // 计算文件大小
          const headerLength = `data:${mimeType};base64,`.length
          const convertedSize = Math.round(((convertedDataUrl.length - headerLength) * 3) / 4)
          const compressionRatio = Math.round((1 - convertedSize / file.size) * 100)

          resolve({
            originalFile: file,
            convertedDataUrl,
            originalSize: file.size,
            convertedSize,
            compressionRatio,
            outputFormat: format,
          })
        }

        img.onerror = () => reject(new Error(t('errors.imageLoadError')))
        img.src = URL.createObjectURL(processedFile)
      } catch (error) {
        reject(error)
      }
    })
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    setIsConverting(true)
    setProgress(0)
    setConvertedFiles([])

    const converted: ConvertedFile[] = []

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await convertImage(files[i], quality[0], outputFormat)
        converted.push(result)
        setProgress(((i + 1) / files.length) * 100)
      } catch (error) {
        console.error(`${t('errors.convertError')} ${files[i].name}:`, error)
      }
    }

    setConvertedFiles(converted)
    setIsConverting(false)
  }

  const downloadFile = (convertedFile: ConvertedFile) => {
    const link = document.createElement("a")
    link.href = convertedFile.convertedDataUrl
    
    // 根据输出格式生成正确的文件扩展名
    const originalName = convertedFile.originalFile.name
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "")
    const newExtension = convertedFile.outputFormat === 'jpeg' ? 'jpg' : convertedFile.outputFormat
    link.download = `${nameWithoutExt}.${newExtension}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAll = () => {
    convertedFiles.forEach((file) => downloadFile(file))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-teal-50 dark:from-slate-900 dark:via-orange-950/20 dark:to-teal-950/20 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative p-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-pink-800 dark:from-white dark:via-orange-200 dark:to-pink-200 bg-clip-text text-transparent px-4">
              {t('title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              {t('description')}
            </p>
          </div>
          <div className="flex justify-center pt-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Upload Area */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mx-2 sm:mx-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Upload className="h-6 w-6 text-orange-600" />
              {t('upload.title')}
            </CardTitle>
            <CardDescription className="text-base">{t('upload.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "border-2 border-dashed rounded-2xl p-6 sm:p-8 md:p-12 text-center transition-all duration-300 hover:scale-[1.02]",
                isDragOver
                  ? "border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 shadow-lg"
                  : "border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDragEnter={handleDragOver}
            >
              <div className="relative mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-xl opacity-30"></div>
                <ImageIcon className="relative h-12 w-12 sm:h-16 sm:w-16 text-orange-500 mx-auto" />
              </div>
              <p className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 px-2">{t('upload.dragText')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 px-2">{t('upload.orText')}</p>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline"
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-pink-600 text-white border-0 hover:from-orange-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
              >
                <Upload className="h-5 w-5 mr-2" />
                {t('upload.selectFiles')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.tif,.webp,.svg,.heic,.heif,.avif,.ico,.psd,.raw,.cr2,.nef,.arw,.dng"
                multiple
                className="hidden"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files)}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6 sm:mt-8 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg px-2">{t('files.selected')} ({files.length})</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-orange-50 dark:from-gray-800 dark:to-orange-900/20 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                          <img
                            src={createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="absolute inset-0 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg items-center justify-center hidden"
                            style={{ display: 'none' }}
                          >
                            <FileImage className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">{file.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeFile(index)}
                        className="hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0 min-h-[44px] min-w-[44px]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quality Settings */}
        {files.length > 0 && (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mx-2 sm:mx-0">
            <CardHeader>
              <CardTitle className="text-xl">{t('settings.title')}</CardTitle>
              <CardDescription className="text-base">{t('settings.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <label className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('settings.outputFormat')}</label>
                    <div className="relative w-full sm:w-auto">
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full min-h-[44px] text-sm sm:text-base"
                      >
                        <option value="webp">WebP</option>
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="jpeg">JPEG</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('settings.quality')}</label>
                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">{quality[0]}%</span>
                  </div>
                  <Slider 
                    value={quality} 
                    onValueChange={setQuality} 
                    max={100} 
                    min={10} 
                    step={5}
                  />
                </div>

                <Button 
                  onClick={handleConvert} 
                  disabled={isConverting} 
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[48px]"
                  size="lg"
                >
                  {isConverting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                      {t('convert.converting')}
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-3" />
                      {t('convert.start')} ({files.length} {files.length === 1 ? 'file' : 'files'})
                    </>
                  )}
                </Button>

                {isConverting && (
                  <div className="space-y-3">
                    <Progress value={progress} />
                    <p className="text-center text-gray-600 dark:text-gray-400 font-medium">
                      {Math.round(progress)}% {t('convert.progress')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {convertedFiles.length > 0 && (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mx-2 sm:mx-0">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Download className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                    {t('results.title')}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">{t('results.description')}</CardDescription>
                </div>
                <Button 
                  onClick={downloadAll} 
                  variant="outline"
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('results.downloadAll')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {convertedFiles.map((file, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-700 hover:shadow-lg transition-all duration-200 gap-3 sm:gap-0">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex-shrink-0">
                          <FileImage className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                        </div>
                        <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                          {file.originalFile.name.replace(/\.[^/.]+$/, `.${file.outputFormat === 'jpeg' ? 'jpg' : file.outputFormat}`)}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{t('results.original')}: {formatFileSize(file.originalSize)}</span>
                        <span className="text-teal-600 font-bold">→</span>
                        <span className="font-medium">{file.outputFormat.toUpperCase()}: {formatFileSize(file.convertedSize)}</span>
                        <Badge 
                          variant={file.compressionRatio > 0 ? "default" : "secondary"}
                          className={file.compressionRatio > 0 ? "bg-teal-600 hover:bg-teal-700" : ""}
                        >
                          {file.compressionRatio > 0 ? `${t('results.compressed')} ${file.compressionRatio}%` : t('results.noCompression')}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      onClick={() => downloadFile(file)} 
                      size="sm"
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('results.download')}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mx-2 sm:mx-0">
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div className="space-y-4 group">
                <div className="relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">{t('features.fast.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('features.fast.description')}</p>
              </div>
              <div className="space-y-4 group">
                <div className="relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-pink-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative p-4 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl">
                    <FileImage className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">{t('features.batch.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('features.batch.description')}</p>
              </div>
              <div className="space-y-4 group">
                <div className="relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl">
                    <Download className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">{t('features.privacy.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('features.privacy.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer with GitHub and Links */}
        <footer className="text-center py-8 sm:py-12 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl mx-2 sm:mx-0">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-center">
              <a 
                href="https://github.com/wengxiaoxiong/png2webp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base min-h-[44px]"
              >
                <Github className="h-5 w-5" />
                {t('footer.github')}
              </a>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
              {t('footer.copyright')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 flex-wrap px-4">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('footer.links')}</span>
              <a 
                href="https://wengxiaoxiong.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-colors hover:underline"
              >
                wengxiaoxiong.com
              </a>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <a 
                href="https://bear-agent.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-colors hover:underline"
              >
                bear-agent.com
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
