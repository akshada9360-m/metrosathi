import { describe, expect, it } from 'vitest'
import { stations } from '../data/stations'
import { answerInLanguage } from '../features/assistant/retrieveAnswer'
import type { JourneyPreferences } from '../features/journey/rankExits'

const station = stations[0]
const preferences: JourneyPreferences = {
  stepFree: false,
  fewerStairs: false,
  shorterWalk: false,
  preferLiftRamp: false,
}

const seededQuestions = [
  { question: 'Which exit is closest to the clinic?', includes: 'City Care Clinic' },
  { question: 'Is there a step-free exit?', includes: 'step-free' },
  { question: 'Where is the nearest bus stop?', includes: 'Civil Court East Stop' },
  { question: 'Which metro line serves this station?', includes: 'Purple & Aqua Line' },
  { question: 'What nearby food places are listed?', includes: 'Riverfront Cafe' },
  { question: 'How long is the sample bus transfer?', includes: 'demo transfer estimate' },
  { question: 'Are live bus arrivals available?', includes: 'not connected' },
  { question: 'Is Exit A open now?', includes: 'operating status is unknown' },
  { question: 'Where is the verified help point?', includes: 'no verified station help point' },
  { question: 'Tell me about a place not in the list.', includes: 'can’t verify that' },
]

describe('local station-data assistant retrieval', () => {
  it.each(seededQuestions)('answers the seeded question: $question', ({ question, includes }) => {
    const answer = answerInLanguage('en', station, question, preferences)
    expect(answer.text.toLowerCase()).toContain(includes.toLowerCase())
    expect(answer.source).toBeTruthy()
  })

  it('answers accessibility questions in Hindi and Marathi', () => {
    expect(answerInLanguage('hi', station, 'क्या सीढ़ी-मुक्त निकास है?', preferences).text)
      .toContain('नमूना डेटा')
    expect(answerInLanguage('mr', station, 'पायऱ्यांशिवाय बाहेर पडण्याचा मार्ग आहे का?', preferences).text)
      .toContain('नमुना डेटामध्ये')
  })
})
