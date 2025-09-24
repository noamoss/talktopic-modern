import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Upload, Send, Key, Image as ImageIcon, MessageCircle, Volume2, VolumeX, Video, VideoOff, Camera, Square } from 'lucide-react'
import './App.css'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [isApiKeySet, setIsApiKeySet] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Voice-related states
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Video-related states
  const [isVideoMode, setIsVideoMode] = useState(false)
  const [videoStream, setVideoStream] = useState(null)
  const [isVideoActive, setIsVideoActive] = useState(false)
  const [capturedFrames, setCapturedFrames] = useState([])
  const [currentVideoSource, setCurrentVideoSource] = useState('image') // 'image' or 'video'
  const [selectedPrompt, setSelectedPrompt] = useState('')
  
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Predefined prompts for visual conversation
  const predefinedPrompts = [
    { value: "describe", label: "What do you see in this image/video?" },
    { value: "detailed", label: "Describe the scene in detail" },
    { value: "actions", label: "What actions are taking place?" },
    { value: "identify", label: "Identify objects and people in the scene" },
    { value: "mood", label: "What's the mood or atmosphere?" },
    { value: "stepbystep", label: "Explain what's happening step by step" },
    { value: "colors", label: "Describe the colors and lighting" },
    { value: "setting", label: "What kind of setting or location is this?" }
  ]


  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [videoStream])

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setIsApiKeySet(true)
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file)
      setCurrentVideoSource('image')
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
      setVideoStream(stream)
      setIsVideoActive(true)
      setCurrentVideoSource('video')
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing webcam:', error)
      alert('Unable to access webcam. Please ensure you have granted camera permissions.')
    }
  }

  const stopVideo = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
      setIsVideoActive(false)
      setCapturedFrames([])
      
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to base64
      const frameData = canvas.toDataURL('image/jpeg', 0.8)
      const timestamp = new Date().toLocaleTimeString()
      
      const newFrame = {
        id: Date.now(),
        data: frameData,
        timestamp: timestamp,
        base64: frameData.split(',')[1]
      }
      
      setCapturedFrames(prev => [...prev.slice(-4), newFrame]) // Keep last 5 frames
      return newFrame
    }
    return null
  }

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result.split(',')[1] // Remove data:image/jpeg;base64, prefix
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }


  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !isApiKeySet) return

    // Check if we have either an uploaded image or active video
    if (!uploadedImage && !isVideoActive) {
      alert('Please upload an image or start video mode first.')
      return
    }

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setSelectedPrompt('') // Reset selected prompt
    setIsLoading(true)

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      let prompt = []
      let hasValidMediaData = false

      if (currentVideoSource === 'video' && isVideoActive) {
        // Capture current frame for video mode
        const currentFrame = captureFrame()
        if (currentFrame && currentFrame.base64) {
          prompt.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: currentFrame.base64
            }
          })
          hasValidMediaData = true

          // Add context from recent frames if available
          if (capturedFrames.length > 1) {
            const contextText = `This is a live video feed. I'm showing you the current frame captured at ${currentFrame.timestamp}. Previous frames were captured at: ${capturedFrames.slice(-3, -1).map(f => f.timestamp).join(', ')}.`
            prompt.push({ text: contextText })
          }
        } else {
          throw new Error('Failed to capture video frame. Please try again.')
        }
      } else if (uploadedImage) {
        try {
          // Use uploaded image
          const imageBase64 = await convertImageToBase64(uploadedImage)
          if (imageBase64) {
            prompt.push({
              inlineData: {
                mimeType: uploadedImage.type,
                data: imageBase64
              }
            })
            hasValidMediaData = true
          } else {
            throw new Error('Failed to process uploaded image. Please try uploading again.')
          }
        } catch (conversionError) {
          throw new Error('Failed to process uploaded image. Please try uploading again.')
        }
      }

      // Validate that we have media data before proceeding
      if (!hasValidMediaData) {
        throw new Error('No valid image or video data available. Please upload an image or start video mode.')
      }

      // Add user question
      prompt.push({ text: userMessage })

      // Generate response
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: text }])

      // Speak the response if voice mode is enabled
      if (isVoiceMode) {
        speakText(text)
      }
    } catch (error) {
      console.error('Error generating response:', error)
      let errorMessage = 'Sorry, I encountered an error while processing your request.'

      // Provide more specific error messages
      if (error.message.includes('empty inlineData')) {
        errorMessage = 'No image or video data was provided. Please upload an image or start video streaming first.'
      } else if (error.message.includes('Failed to capture') || error.message.includes('Failed to process')) {
        errorMessage = error.message
      } else if (error.message.includes('API key')) {
        errorMessage = 'Please check your API key and try again.'
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }])

      if (isVoiceMode) {
        speakText(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePromptSelect = (promptValue) => {
    const selectedPromptObj = predefinedPrompts.find(p => p.value === promptValue)
    if (selectedPromptObj) {
      setCurrentMessage(selectedPromptObj.label)
      setSelectedPrompt(promptValue)
    }
  }

  const getPlaceholderText = () => {
    if (currentVideoSource === 'video' && isVideoActive) {
      return "Ask something about the live video..."
    } else if (uploadedImage) {
      return "Ask something about the image..."
    } else {
      return "Upload an image or start video mode first"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">TalkToPic</h1>
          <p className="text-gray-600">AI-powered visual conversation - Upload an image or stream live video!</p>
        </div>

        {/* API Key Setup */}
        {!isApiKeySet && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Setup Your Gemini API Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleApiKeySubmit} disabled={!apiKey.trim()}>
                  Set API Key
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Get your free API key from{' '}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        {isApiKeySet && (
          <div className="space-y-6">
            {/* Voice Mode Toggle */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Voice Mode</p>
                      <p className="text-sm text-gray-500">
                        Enable audio responses from AI
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isVoiceMode}
                    onCheckedChange={setIsVoiceMode}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Media Input */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Media Input
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={currentVideoSource} onValueChange={setCurrentVideoSource}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="image">Image Upload</TabsTrigger>
                        <TabsTrigger value="video">Live Video</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="image" className="space-y-4">
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="w-full h-12"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        
                        {imagePreview && currentVideoSource === 'image' && (
                          <div className="border rounded-lg overflow-hidden">
                            <img
                              src={imagePreview}
                              alt="Uploaded"
                              className="w-full h-auto max-h-96 object-contain"
                            />
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="video" className="space-y-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={isVideoActive ? stopVideo : startVideo}
                            variant={isVideoActive ? "destructive" : "default"}
                            className="flex-1"
                          >
                            {isVideoActive ? (
                              <>
                                <VideoOff className="w-4 h-4 mr-2" />
                                Stop Video
                              </>
                            ) : (
                              <>
                                <Video className="w-4 h-4 mr-2" />
                                Start Video
                              </>
                            )}
                          </Button>
                          
                          {isVideoActive && (
                            <Button
                              onClick={captureFrame}
                              variant="outline"
                              size="icon"
                            >
                              <Camera className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        {isVideoActive && (
                          <div className="space-y-2">
                            <div className="border rounded-lg overflow-hidden bg-black">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-auto max-h-96 object-contain"
                              />
                            </div>
                            <Badge variant="secondary" className="w-full justify-center">
                              Live Video Feed - {capturedFrames.length} frames captured
                            </Badge>
                          </div>
                        )}
                        
                        {/* Hidden canvas for frame capture */}
                        <canvas ref={canvasRef} className="hidden" />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Chat Interface */}
              <div className="space-y-4">
                <Card className="h-[500px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Conversation
                      {(uploadedImage || isVideoActive) && <Badge variant="secondary">Ready</Badge>}
                      {isVoiceMode && <Badge variant="outline">Voice Mode</Badge>}
                      {isVideoActive && <Badge variant="outline">Live Video</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {messages.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          {(uploadedImage || isVideoActive)
                            ? (isVoiceMode 
                                ? "Start asking questions using voice or text!" 
                                : "Start asking questions!"
                              )
                            : "Upload an image or start video mode to begin the conversation."
                          }
                        </div>
                      )}
                      
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white ml-8'
                              : 'bg-gray-100 text-gray-800 mr-8'
                          }`}
                        >
                          <div className="text-sm font-medium mb-1 flex items-center justify-between">
                            <span>{message.role === 'user' ? 'You' : 'AI'}</span>
                            {message.role === 'assistant' && isVoiceMode && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => isSpeaking ? stopSpeaking() : speakText(message.content)}
                                className="h-6 w-6 p-0"
                              >
                                {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                              </Button>
                            )}
                          </div>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="bg-gray-100 text-gray-800 mr-8 p-3 rounded-lg">
                          <div className="text-sm font-medium mb-1">AI</div>
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            Analyzing {currentVideoSource === 'video' ? 'video frame' : 'image'}...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Predefined Prompts Selector */}
                    {(uploadedImage || isVideoActive) && (
                      <div className="mb-3">
                        <Select value={selectedPrompt} onValueChange={handlePromptSelect}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a quick prompt or type your own..." />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedPrompts.map((prompt) => (
                              <SelectItem key={prompt.value} value={prompt.value}>
                                {prompt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={getPlaceholderText()}
                        value={currentMessage}
                        onChange={(e) => {
                          setCurrentMessage(e.target.value)
                          // Reset selected prompt when user types custom text
                          if (e.target.value !== predefinedPrompts.find(p => p.value === selectedPrompt)?.label) {
                            setSelectedPrompt('')
                          }
                        }}
                        onKeyPress={handleKeyPress}
                        disabled={(!uploadedImage && !isVideoActive) || isLoading}
                        className="flex-1 min-h-[40px] max-h-[120px]"
                      />
                      
                      
                      {/* Send Button */}
                      <Button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim() || (!uploadedImage && !isVideoActive) || isLoading}
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

