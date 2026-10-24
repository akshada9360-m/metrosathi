import { busRoutes, busStops } from '../../data/busConnections'
import { rankExits, type JourneyPreferences } from '../journey/rankExits'
import { calculateTransferBudget } from '../transport/calculateTransferBudget'
import type { Language } from '../../i18n/translations'
import type { MetroStation } from '../../types/station'

const unavailableInLanguage: Record<Language, string> = {
  en: 'This information is not available in the sample records. Please check station signage or ask staff.',
  hi: 'यह जानकारी नमूना डेटा में उपलब्ध नहीं है। कृपया स्टेशन के संकेत देखें या कर्मचारी से पूछें।',
  mr: 'ही माहिती नमुना डेटामध्ये उपलब्ध नाही. कृपया स्टेशनवरील फलक पाहा किंवा कर्मचाऱ्यांना विचारा.',
}

export function answerInLanguage(
  language: Language,
  station: MetroStation,
  normalizedQuestion: string,
  preferences: JourneyPreferences,
): { text: string; source: string } {
  const nearestPlace = [...station.amenities].sort((a, b) => a.distanceMeters - b.distanceMeters)[0]
  const busStop = busStops.find((stop) => stop.nearbyStationId === station.id)
  const route = busRoutes.find((item) => busStop?.routeIds.includes(item.id))
  const rankedExits = nearestPlace ? rankExits(station.exits, nearestPlace, preferences) : []
  const chosenExit = rankedExits[0]
  const hindi = language === 'hi'
  const marathi = language === 'mr'
  const unknown = hindi
    ? 'इस जानकारी की पुष्टि उपलब्ध नहीं है। कृपया स्टेशन के संकेत देखें या स्टेशन कर्मचारी से पूछें।'
    : marathi
      ? 'या माहितीची खात्री उपलब्ध नाही. कृपया स्टेशनवरील फलक पाहा किंवा कर्मचाऱ्यांना विचारा.'
      : 'I can’t verify that from the available station data. Please check station signage or ask station staff.'

  if (/(not in (the )?list|unknown place|another place|not listed|unlisted|सूची में नहीं|यादीत नाही)/i.test(normalizedQuestion)) {
    return { text: unknown, source: 'No matching local station data' }
  }
  if (/(exit|निकास|बाहेर|बाहेर पड|दरवाजा)/i.test(normalizedQuestion)
    && !/(step.free|accessib|stairs|lift|ramp|सीढ़|पायरी|पायऱ्या|लिफ्ट|रॅम्प|सुलभ)/i.test(normalizedQuestion)) {
    if (!chosenExit) return { text: unknown, source: 'Station exit dataset · no matching route' }
    const asksStatus = /(open|status|closed|now|खुला|उघडा|स्थिती)/i.test(normalizedQuestion)
    const statusNote = asksStatus
      ? (hindi ? 'इस निकास की वर्तमान स्थिति अज्ञात है।' : marathi ? 'या बाहेर पडण्याच्या मार्गाची सध्याची स्थिती अज्ञात आहे.' : 'Its current operating status is unknown.')
      : ''
    const currentStatusNote = asksStatus ? `${statusNote} ` : ''
    return {
      text: hindi
        ? `${nearestPlace?.name} के लिए नमूना डेटा ${chosenExit.exit.label} को ${chosenExit.walkingDistanceMeters} मीटर पर दिखाता है। ${currentStatusNote}यह सत्यापित मार्ग नहीं है। ${unknown}`
        : marathi
          ? `${nearestPlace?.name} साठी नमुना डेटामध्ये ${chosenExit.exit.label} ${chosenExit.walkingDistanceMeters} मीटरवर आहे. ${currentStatusNote}हा पडताळलेला मार्ग नाही. ${unknown}`
          : `For ${nearestPlace?.name}, the sample data ranks ${chosenExit.exit.label} at ${chosenExit.walkingDistanceMeters} m. ${currentStatusNote}This is not a verified route. ${unknown}`,
      source: 'Local sample exits and destination distances',
    }
  }
  if (/(step.free|accessib|stairs|lift|ramp|सीढ़|पायरी|पायऱ्या|लिफ्ट|रॅम्प|सुलभ)/i.test(normalizedQuestion)) {
    const accessibleExit = station.exits.find((exit) => exit.stepFree === true)
    if (!accessibleExit) return { text: unknown, source: 'Station accessibility dataset' }
    return {
      text: hindi
        ? `${accessibleExit.label} के लिए नमूना डेटा में सीढ़ी-मुक्त सुविधा दर्ज है। यह आधिकारिक रूप से सत्यापित नहीं है। वर्तमान पहुंच के लिए स्टेशन कर्मचारियों से पूछें।`
        : marathi
          ? `${accessibleExit.label} साठी नमुना डेटामध्ये पायऱ्यांशिवाय सुविधा नोंदली आहे. ही अधिकृतरीत्या पडताळलेली नाही. सध्याच्या सुविधेसाठी स्टेशन कर्मचाऱ्यांना विचारा.`
          : `${accessibleExit.label} is listed as step-free in the sample data; it is not officially verified. Ask station staff to confirm current access.`,
      source: 'Local sample accessibility notes',
    }
  }
  if (/(arrival|live|real.time|realtime|arrive|आगमन|लाइव|थेट)/i.test(normalizedQuestion)) {
    return {
      text: hindi
        ? 'लाइव बस आगमन डेटा उपलब्ध नहीं है। दिखाए गए प्रस्थान केवल सिम्युलेटेड डेमो हैं; उन्हें वास्तविक समय न मानें।'
        : marathi
          ? 'थेट बस आगमन माहिती उपलब्ध नाही. दाखवलेल्या वेळा फक्त सिम्युलेटेड डेमो आहेत; त्यांना वास्तविक वेळ समजू नका.'
          : 'Live bus arrival data is not connected. Any departures shown are simulated demo examples, not real-time predictions.',
      source: 'Transport data availability',
    }
  }
  if (/(bus|बस|थांबा|stop)/i.test(normalizedQuestion)) {
    if (!busStop || !route) return { text: unknown, source: 'Bus connection dataset' }
    const budget = calculateTransferBudget({
      arrivalAtStationTime: '08:00',
      walkingDistanceMeters: busStop.walkDistanceFromExitMeters,
      departures: route.departures,
      busJourneyMinutes: route.journeyMinutes,
    })
    const transferEstimate = budget
      ? `${budget.totalMinutes} min total demo transfer estimate`
      : 'No sample transfer estimate is available for that arrival'
    const localizedEstimate = !budget
      ? unavailableInLanguage[language]
      : hindi
        ? `${budget.totalMinutes} मिनट का कुल डेमो ट्रांसफ़र अनुमान`
        : marathi
          ? `${budget.totalMinutes} मिनिटांचा एकूण डेमो प्रवास अंदाज`
          : transferEstimate
    return {
      text: hindi
        ? `${busStop.name} नमूना निकास से ${busStop.walkDistanceFromExitMeters} मीटर दूर है। मार्ग ${route.routeNumber} ${route.destination} की ओर जाता है। ${localizedEstimate}. प्रस्थान समय सिम्युलेटेड हैं, लाइव नहीं।`
        : marathi
          ? `${busStop.name} नमुना बाहेर पडण्याच्या मार्गापासून ${busStop.walkDistanceFromExitMeters} मीटरवर आहे. मार्ग ${route.routeNumber} ${route.destination} कडे जातो. ${localizedEstimate}. वेळा सिम्युलेटेड आहेत, थेट नाहीत.`
          : `${busStop.name} is ${busStop.walkDistanceFromExitMeters} m from the sample exit. Route ${route.routeNumber} goes toward ${route.destination}. ${localizedEstimate}. Departures are simulated, not live.`,
      source: 'Local sample bus stops and routes',
    }
  }
  if (/(line|route|लाइन|मार्ग|मेट्रो)/i.test(normalizedQuestion)) {
    return {
      text: hindi
        ? `${station.name} को नमूना स्टेशन डेटा ${station.line} से जोड़ता है। ट्रेन समय या लाइव सेवा स्थिति यहां उपलब्ध नहीं है।`
        : marathi
          ? `${station.name} नमुना स्टेशन माहितीनुसार ${station.line} वर आहे. ट्रेन वेळापत्रक किंवा थेट सेवा स्थिती उपलब्ध नाही.`
          : `${station.name} is listed on ${station.line} in the sample station data. Train schedules and live service status are not connected.`,
      source: 'Local sample station record',
    }
  }
  if (/(place|nearby|clinic|hospital|food|restaurant|जवळ|क्लिनिक|अस्पताल|खाने|ठिकाण)/i.test(normalizedQuestion)) {
    const category = /(food|restaurant|खाने|रेस्तरां)/i.test(normalizedQuestion)
      ? 'Food'
      : /(clinic|hospital|health|क्लिनिक|अस्पताल|स्वास्थ्य)/i.test(normalizedQuestion)
        ? 'Health'
        : undefined
    const matches = station.amenities
      .filter((place) => !category || place.category === category)
      .slice(0, 3)
    return {
      text: matches.length
        ? `${station.name}: ${matches.map((place) => `${place.name} (${place.distanceMeters} m, sample)`).join('; ')}. These listings are demo data and distances are unverified.`
        : unknown,
      source: 'Local sample amenity records',
    }
  }
  if (/(help|emergency|staff|मदत|आपात|आपत्कालीन|कर्मचारी)/i.test(normalizedQuestion)) {
    return {
      text: hindi
        ? 'इस डेमो में सत्यापित स्टेशन सहायता केंद्र या फोन नंबर उपलब्ध नहीं है। कृपया स्टेशन कर्मचारी से सीधे सहायता लें; आपात स्थिति में स्थानीय आधिकारिक आपातकालीन सेवाओं से संपर्क करें।'
        : marathi
          ? 'या डेमोमध्ये पडताळलेले स्टेशन मदत केंद्र किंवा फोन क्रमांक उपलब्ध नाही. कृपया स्टेशन कर्मचाऱ्यांकडून मदत घ्या; आपत्कालीन परिस्थितीत अधिकृत स्थानिक सेवांशी संपर्क साधा.'
          : 'This demo has no verified station help point or phone number. Please ask station staff directly; for emergencies, contact local official emergency services.',
      source: 'Verified help-point data is not available',
    }
  }
  return { text: unknown, source: 'No matching local station data' }
}
