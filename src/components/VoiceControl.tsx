import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceControlProps {
  onSpeechResult: (text: string) => void;
  isProcessing: boolean;
}

export function VoiceControl({ onSpeechResult, isProcessing }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Changed to false to handle one utterance at a time
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        setRecognition(recognition);
      } else {
        setError('Speech recognition is not supported in this browser');
      }

      // Initialize speech synthesis
      if ('speechSynthesis' in window) {
        setSynthesis(window.speechSynthesis);
      }
    }
  }, []);

  const startListening = useCallback(async () => {
    if (recognition && !isListening) {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        recognition.start();
        setIsListening(true);
        setError('');
      } catch (err) {
        setError('Please allow microphone access to use voice input');
        setIsListening(false);
        console.error('Microphone permission error:', err);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Assert the type to avoid the type incompatibility error
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((result) => result[0].transcript)
        .join('');

      if (event.results[0].isFinal) {
        onSpeechResult(transcript);
        stopListening();
      }
    };

    recognition.onerror = (event: SpeechRecognitionError) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      stopListening();
    };

    return () => {
      stopListening();
    };
  }, [recognition, onSpeechResult, stopListening]);

  const speak = useCallback((text: string) => {
    if (synthesis && !isMuted) {
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.pitch = 1;
      utterance.rate = 1;
      utterance.volume = 1;

      // Load voices and wait for them to be available
      const loadVoices = () => {
        const voices = synthesis.getVoices();
        if (voices.length > 0) {
          const femaleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('samantha')
          );
          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }
          synthesis.speak(utterance);
        } else {
          // If voices aren't loaded yet, try again
          setTimeout(loadVoices, 100);
        }
      };

      loadVoices();
    }
  }, [synthesis, isMuted]);

  useEffect(() => {
    if (!isProcessing) {
      const messages = document.querySelectorAll('.ai-message');
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        speak(lastMessage.textContent || '');
      }
    }
  }, [isProcessing, speak]);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={() => isListening ? stopListening() : startListening()}
          className={`p-3 rounded-xl transition-all duration-300 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </button>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-xl transition-all duration-300 ${
            isMuted
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
      
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-500/90 text-white text-sm rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
