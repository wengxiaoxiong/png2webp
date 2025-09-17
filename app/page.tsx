"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, X, ImageIcon, FileImage, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConvertedFile {
  originalFile: File
  webpDataUrl: string
  originalSize: number
  webpSize: number
  compressionRatio: number
}

export default function PngToWebpConverter() {
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
        reject(new Error("无法创建canvas上下文"))
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

      img.onerror = () => reject(new Error("图片加载失败"))
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
        console.error(`转换文件 ${files[i].name} 失败:`, error)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">PNG 转 WebP 工具</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">快速、安全的图片格式转换，完全在浏览器中处理</p>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              上传 PNG 图片
            </CardTitle>
            <CardDescription>支持拖拽上传或点击选择文件，支持批量处理</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">拖拽 PNG 文件到这里</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">或者点击下方按钮选择文件</p>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                选择文件
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,.png"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">已选择的文件 ({files.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileImage className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeFile(index)}>
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
          <Card>
            <CardHeader>
              <CardTitle>转换设置</CardTitle>
              <CardDescription>调整 WebP 图片质量 (质量越高，文件越大)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">质量</label>
                    <span className="text-sm text-gray-500">{quality[0]}%</span>
                  </div>
                  <Slider value={quality} onValueChange={setQuality} max={100} min={10} step={5} className="w-full" />
                </div>

                <Button onClick={handleConvert} disabled={isConverting} className="w-full" size="lg">
                  {isConverting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      转换中...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      开始转换 ({files.length} 个文件)
                    </>
                  )}
                </Button>

                {isConverting && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">{Math.round(progress)}% 完成</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {convertedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    转换结果
                  </CardTitle>
                  <CardDescription>转换完成！点击下载单个文件或批量下载</CardDescription>
                </div>
                <Button onClick={downloadAll} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  下载全部
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {convertedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileImage className="h-5 w-5 text-green-600" />
                        <p className="font-medium text-gray-900 dark:text-white">
                          {file.originalFile.name.replace(/\.png$/i, ".webp")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>原始: {formatFileSize(file.originalSize)}</span>
                        <span>→</span>
                        <span>WebP: {formatFileSize(file.webpSize)}</span>
                        <Badge variant={file.compressionRatio > 0 ? "default" : "secondary"}>
                          {file.compressionRatio > 0 ? `压缩 ${file.compressionRatio}%` : "无压缩"}
                        </Badge>
                      </div>
                    </div>
                    <Button onClick={() => downloadFile(file)} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      下载
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mx-auto">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">快速转换</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">纯前端处理，无需上传到服务器</p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit mx-auto">
                  <FileImage className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">批量处理</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">支持同时转换多个PNG文件</p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit mx-auto">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">隐私安全</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">所有处理都在本地完成，保护您的隐私</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer with Friendship Links */}
        <footer className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 PNG 转 WebP 工具. 开源项目，欢迎贡献代码。
            </p>
            <div className="flex justify-center items-center gap-6">
              <span className="text-sm text-gray-500 dark:text-gray-400">友情链接:</span>
              <a 
                href="https://wengxiaoxiong.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                wengxiaoxiong.com
              </a>
              <span className="text-gray-400">|</span>
              <a 
                href="https://bear-agent.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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
