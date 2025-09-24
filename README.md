# TalkToPic - AI Visual Conversation

A modern, AI-powered visual conversation application that enables real-time interaction with images and live video streams using Google's Gemini API.

## 🚀 Features

### Core Capabilities
- **Image Upload & Analysis**: Upload any image and have natural conversations about its content
- **Live Video Streaming**: Stream from your webcam and ask questions about what the AI sees in real-time
- **Voice Interaction**: Use speech-to-text for input and text-to-speech for responses
- **Multi-Modal AI**: Powered by Google's Gemini 1.5 Flash model for advanced visual understanding

### User Experience
- **Modern UI**: Clean, responsive design built with React and Tailwind CSS
- **Real-time Processing**: Instant frame capture and analysis from live video
- **Voice Controls**: Hands-free interaction with speech recognition
- **Cross-Platform**: Works on desktop and mobile browsers
- **No Backend Required**: Fully client-side application

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: Google Generative AI SDK
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Deployment**: GitHub Pages

## 📋 Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- A Google Gemini API key (free from [Google AI Studio](https://aistudio.google.com/app/apikey))
- Modern web browser with camera and microphone permissions

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/noamoss/talktopic-modern.git
cd talktopic-modern
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 3. Start Development Server
```bash
pnpm run dev
# or
npm run dev
```

### 4. Open in Browser
Navigate to `http://localhost:5173` and start using the application!

## 🔧 Configuration

### API Key Setup
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key (free tier available)
3. Enter your API key in the application when prompted
4. The key is stored locally in your browser session

### Browser Permissions
The application requires the following permissions:
- **Camera**: For live video streaming functionality
- **Microphone**: For voice input when voice mode is enabled

## 📖 Usage Guide

### Image Conversation
1. Enter your Gemini API key
2. Click on the "Image Upload" tab
3. Upload an image using the "Choose Image" button
4. Type your questions about the image
5. Get instant AI-powered responses

### Live Video Analysis
1. Switch to the "Live Video" tab
2. Click "Start Video" to begin webcam streaming
3. Grant camera permissions when prompted
4. Ask questions about what you see in the live feed
5. The AI analyzes the current frame and provides responses

### Voice Interaction
1. Toggle "Voice Mode" on
2. Use the microphone button to speak your questions
3. The AI will respond with both text and speech
4. Click the speaker icon on responses to replay audio

## 🏗️ Project Structure

```
talktopic-modern/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── dist/                # Build output (generated)
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## 🚀 Deployment

### GitHub Pages Deployment

The application is configured for GitHub Pages deployment:

1. **Automatic Deployment**: Push to the `master` branch triggers a build
2. **Manual Deployment**: 
   ```bash
   pnpm run build
   # Deploy the dist/ folder to your hosting service
   ```

### Manual GitHub Pages Setup
If GitHub Pages isn't automatically enabled:

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select the `gh-pages` branch
5. The site will be available at `https://yourusername.github.io/talktopic-modern/`

## 🔧 Development

### Available Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build locally
- `pnpm run lint` - Run ESLint

### Key Components
- **App.jsx**: Main application logic and state management
- **Voice Integration**: Browser Speech Recognition and Speech Synthesis APIs
- **Video Processing**: Canvas-based frame capture from video streams
- **AI Integration**: Google Generative AI SDK for image and video analysis

## 🎯 Features in Detail

### Image Analysis
- Supports all common image formats (JPEG, PNG, GIF, WebP)
- Real-time image processing and analysis
- Contextual understanding of image content
- Natural language responses about visual elements

### Video Streaming
- Live webcam feed processing
- Frame-by-frame analysis capability
- Temporal context awareness (remembers recent frames)
- Real-time conversation about live video content

### Voice Capabilities
- Browser-native speech recognition
- Multiple language support (configurable)
- Text-to-speech responses with natural voices
- Hands-free operation mode

## 🔒 Privacy & Security

- **Client-Side Only**: No data is sent to external servers except Google's Gemini API
- **API Key Security**: Keys are stored locally in browser session storage
- **No Data Persistence**: Images and video frames are processed in real-time and not stored
- **HTTPS Required**: Secure connection required for camera and microphone access

## 🐛 Troubleshooting

### Common Issues

**Camera/Microphone Not Working**
- Ensure HTTPS connection (required for media access)
- Check browser permissions for camera and microphone
- Try refreshing the page and granting permissions again

**API Key Issues**
- Verify your API key is correct and active
- Check if you have remaining quota on your Google AI account
- Ensure the key has access to Gemini models

**Voice Recognition Not Working**
- Check if your browser supports Web Speech API
- Ensure microphone permissions are granted
- Try using Chrome or Edge for best compatibility

**Build/Deployment Issues**
- Clear node_modules and reinstall dependencies
- Check Node.js version (18+ required)
- Verify all environment variables are set correctly

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Google Gemini**: For providing the powerful AI capabilities
- **React Team**: For the excellent React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **shadcn/ui**: For the beautiful UI components
- **Vite**: For the fast build tool and development experience

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Include browser version, error messages, and steps to reproduce

---

**Built with ❤️ using React, Tailwind CSS, and Google Gemini AI**

