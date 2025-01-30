// global.d.ts
declare global {
    interface Window {
      SpeechRecognition: SpeechRecognition;
      webkitSpeechRecognition: SpeechRecognition;
    }
  
    interface SpeechRecognition {
      start(): void;
      stop(): void;
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onstart?: () => void;
      onend?: () => void;
      onresult?: (event: SpeechRecognitionEvent) => void;
      onerror?: (event: SpeechRecognitionError) => void;
    }
  
    interface SpeechRecognitionEvent {
      results: SpeechRecognitionResultList;
      resultIndex: number;
      interpretation: any;
      error: string;
    }
  
    interface SpeechRecognitionResultList {
      [index: number]: SpeechRecognitionResult;
    }
  
    interface SpeechRecognitionResult {
      isFinal: boolean;
      transcript: string;
    }
  
    interface SpeechRecognitionError {
      error: string;
    }
  }
  
  export {};
  