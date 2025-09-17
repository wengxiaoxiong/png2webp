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
import { Upload, Download, X, ImageIcon, FileImage, Zap, Github, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "@/components/language-switcher"

interface ConvertedFile {
  originalFile: File
  webpDataUrl: string
  originalSize: number
  webpSize: number
  compressionRatio: number
}

export default function PngToWebpConverter() {
  const { t } = useTranslation()
  const [files, setFiles] = useState<File[]>([])
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([])
  const [quality, setQuality] = useState([90])
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const pngFiles = Array.from(selectedFiles).filter(
      (file) => file.type === "image/png" || file.name.toLowerCase().endsWith(".png"),
    )

    setFiles((prev) => [...prev, ...pngFiles])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const convertToWebP = async (file: File, qualityValue: number): Promise<ConvertedFile> => {
    return new Promise((resolve, reject) => {
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

        const webpDataUrl = canvas.toDataURL("image/webp", qualityValue / 100)

        // 计算文件大小
        const webpSize = Math.round(((webpDataUrl.length - "data:image/webp;base64,".length) * 3) / 4)
        const compressionRatio = Math.round((1 - webpSize / file.size) * 100)

        resolve({
          originalFile: file,
          webpDataUrl,
          originalSize: file.size,
          webpSize,
          compressionRatio,
        })
      }

      img.onerror = () => reject(new Error(t('errors.imageLoadError')))
      img.src = URL.createObjectURL(file)
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
        const result = await convertToWebP(files[i], quality[0])
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
    link.href = convertedFile.webpDataUrl
    link.download = convertedFile.originalFile.name.replace(/\.png$/i, ".webp")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>
          <div className="flex justify-center pt-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Upload Area */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Upload className="h-6 w-6 text-blue-600" />
              {t('upload.title')}
            </CardTitle>
            <CardDescription className="text-base">{t('upload.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 hover:scale-[1.02]",
                isDragOver
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 shadow-lg"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30"></div>
                <ImageIcon className="relative h-16 w-16 text-blue-500 mx-auto" />
              </div>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('upload.dragText')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('upload.orText')}</p>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Upload className="h-5 w-5 mr-2" />
                {t('upload.selectFiles')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,.png"
                multiple
                className="hidden"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files)}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-8 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{t('files.selected')} ({files.length})</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileImage className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeFile(index)}
                        className="hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
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
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">{t('settings.title')}</CardTitle>
              <CardDescription className="text-base">{t('settings.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.quality')}</label>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{quality[0]}%</span>
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
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Download className="h-6 w-6 text-green-600" />
                    {t('results.title')}
                  </CardTitle>
                  <CardDescription className="text-base">{t('results.description')}</CardDescription>
                </div>
                <Button 
                  onClick={downloadAll} 
                  variant="outline"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('results.downloadAll')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {convertedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <FileImage className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">
                          {file.originalFile.name.replace(/\.png$/i, ".webp")}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{t('results.original')}: {formatFileSize(file.originalSize)}</span>
                        <span className="text-green-600 font-bold">→</span>
                        <span className="font-medium">WebP: {formatFileSize(file.webpSize)}</span>
                        <Badge 
                          variant={file.compressionRatio > 0 ? "default" : "secondary"}
                          className={file.compressionRatio > 0 ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {file.compressionRatio > 0 ? `${t('results.compressed')} ${file.compressionRatio}%` : t('results.noCompression')}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      onClick={() => downloadFile(file)} 
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="pt-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4 group">
                <div className="relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('features.fast.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('features.fast.description')}</p>
              </div>
              <div className="space-y-4 group">
                <div className="relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
                    <FileImage className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('features.batch.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('features.batch.description')}</p>
              </div>
              <div className="space-y-4 group">
                <div className="relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                    <Download className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('features.privacy.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('features.privacy.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer with GitHub and Links */}
        <footer className="text-center py-12 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl">
          <div className="space-y-6">
            <div className="flex justify-center">
              <a 
                href="https://github.com/wengxiaoxiong/png2webp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Github className="h-5 w-5" />
                {t('footer.github')}
              </a>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('footer.copyright')}
            </p>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('footer.links')}</span>
              <a 
                href="https://wengxiaoxiong.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
              >
                wengxiaoxiong.com
              </a>
              <span className="text-gray-400">|</span>
              <a 
                href="https://bear-agent.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
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
