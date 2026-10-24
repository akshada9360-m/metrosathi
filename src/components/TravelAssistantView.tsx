import { useMemo, useRef, useState } from 'react'
import { answerInLanguage } from '../features/assistant/retrieveAnswer'
import type { JourneyPreferences } from '../features/journey/rankExits'
import type { Language } from '../i18n/translations'
import type { MetroStation } from '../types/station'
import './TravelAssistant.css'

type SpeechRecognitionAlternativeLike = { transcript: string }
type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionAlternativeLike>
interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
}

interface ChatMessage {
  id: number
  role: 'assistant' | 'user'
  text: string
  source?: string
}

interface TravelAssistantProps {
  station: MetroStation
  language: Language
  preferences: JourneyPreferences
}

const suggestedQuestions: Record<Language, string[]> = {
  en: [
    'Which exit is closest to the clinic?',
    'Is there a step-free exit?',
    'Where is the nearest bus stop?',
    'Which line serves this station?',
    'What nearby food places are listed?',
    'How long is the sample bus transfer?',
    'Are live bus arrivals available?',
    'Is Exit A open now?',
    'Where is the verified help point?',
    'Tell me about a place not in the list.',
  ],
  hi: [
    'क्लिनिक के पास कौन सा निकास है?',
    'क्या सीढ़ी-मुक्त निकास है?',
    'पास का बस स्टॉप कहाँ है?',
    'यह स्टेशन किस लाइन पर है?',
    'पास में खाने की कौन सी जगहें हैं?',
  ],
  mr: [
    'क्लिनिकसाठी जवळचा बाहेर पडण्याचा मार्ग कोणता?',
    'पायऱ्यांशिवाय बाहेर पडण्याचा मार्ग आहे का?',
    'जवळचा बस थांबा कुठे आहे?',
    'हे स्टेशन कोणत्या मार्गावर आहे?',
    'जवळची खाण्याची ठिकाणे कोणती?',
  ],
}

const speechLocales: Record<Language, string> = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' }

export function TravelAssistant({
  station,
  language,
  preferences,
}: TravelAssistantProps) {
  const [question, setQuestion] = useState('')
  const [voiceState, setVoiceState] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      text: language === 'hi'
        ? 'नमस्ते! मैं ऐप के स्टेशन और परिवहन नमूना डेटा से उत्तर देता हूँ। मैं लाइव जानकारी की पुष्टि नहीं कर सकता।'
        : language === 'mr'
          ? 'नमस्कार! मी ॲपमधील स्टेशन आणि वाहतूक नमुना माहितीवरून उत्तर देतो. थेट माहितीची खात्री देऊ शकत नाही.'
          : 'Hello! I answer using this app’s station and transport sample data. I cannot verify live information.',
      source: 'Metro Saathi local data',
    },
  ])
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const speechAvailable = typeof window !== 'undefined'
    && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  const speechSynthesisAvailable = typeof window !== 'undefined'
    && 'speechSynthesis' in window
  const suggestions = useMemo(() => suggestedQuestions[language], [language])

  const submitQuestion = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setVoiceState('Type a question or choose a suggestion.')
      return
    }
    const response = answerInLanguage(language, station, trimmed, preferences)
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', text: trimmed },
      { id: Date.now() + 1, role: 'assistant', ...response },
    ])
    setQuestion('')
    setVoiceState('')
  }

  const startVoiceInput = () => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Recognition) {
      setVoiceState('Voice input is not supported here. Please type your question instead.')
      return
    }
    const recognition = new Recognition()
    recognition.lang = speechLocales[language]
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) {
        setQuestion(transcript)
        setVoiceState('Voice captured. Review it, then send.')
      }
    }
    recognition.onerror = () => setVoiceState('Voice input did not work. Please type your question instead.')
    recognition.onend = () => {
      recognitionRef.current = null
    }
    recognitionRef.current = recognition
    setVoiceState('Listening…')
    recognition.start()
  }

  const speakMessage = (text: string) => {
    if (!speechSynthesisAvailable) {
      setVoiceState('Text-to-speech is not supported here. The answer remains visible above.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = speechLocales[language]
    window.speechSynthesis.speak(utterance)
  }

  return (
    <section className="panel assistant-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">GROUNDED IN LOCAL DATA · {station.name.toUpperCase()}</p>
          <h2>Ask Metro Saathi</h2>
        </div>
        <span className="demo-tag">NO LIVE AI SERVICE</span>
      </div>
      <p className="assistant-intro">
        Answers are retrieved from this prototype’s sample station, exit, amenity, and bus records.
        Unknown or live facts are not guessed.
      </p>

      <div className="chat-transcript" role="log" aria-live="polite" aria-label="Assistant conversation">
        {messages.map((message) => (
          <article className={`chat-message ${message.role}`} key={message.id}>
            <div className="chat-avatar" aria-hidden="true">{message.role === 'assistant' ? 'M' : 'You'}</div>
            <div className="chat-bubble">
              <p>{message.text}</p>
              {message.source && <small>Source: {message.source}</small>}
              {message.role === 'assistant' && (
                <button className="speak-button" onClick={() => speakMessage(message.text)}>
                  🔊 Read answer aloud
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="suggestion-heading">
        <strong>Try asking</strong>
        <span>Sample questions</span>
      </div>
      <div className="assistant-suggestions">
        {suggestions.map((suggestion) => (
          <button key={suggestion} onClick={() => submitQuestion(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      <form
        className="assistant-input-row"
        onSubmit={(event) => {
          event.preventDefault()
          submitQuestion(question)
        }}
      >
        <label className="sr-only" htmlFor="assistant-question">Type your question</label>
        <input
          id="assistant-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={language === 'hi' ? 'अपना सवाल लिखें…' : language === 'mr' ? 'तुमचा प्रश्न लिहा…' : 'Ask about exits, places, access or bus connections…'}
        />
        <button type="button" className="voice-button" onClick={startVoiceInput} aria-label="Start voice input">
          {speechAvailable ? '🎙' : '⌨'}
        </button>
        <button type="submit" className="primary-button">Send</button>
      </form>
      <p className="voice-status" role="status">
        {voiceState || (speechAvailable
          ? `Voice input available · ${speechSynthesisAvailable ? 'spoken answers available' : 'answers remain visible as text'}`
          : 'Voice input unsupported on this browser · type your question instead')}
      </p>
    </section>
  )
}
