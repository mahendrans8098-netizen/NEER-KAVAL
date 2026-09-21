/**
 * NEERKAVAL i18n — Tamil and English translations
 * Tamil wording is kept simple for rural and low-literacy users.
 */

export type Language = "ta" | "en";

export const translations = {
  ta: {
    // App
    appName: "நீர் காவல்",
    appTagline: "Predict. Explain. Guide. Save Lives.",

    // Navigation
    home: "முகப்பு",
    safety: "பாதுகாப்பு",
    shelter: "நிவாரண மையம்",
    sos: "அவசர உதவி",
    more: "மேலும்",
    weather: "வானிலை",

    // Home
    yourLocation: "உங்கள் இருப்பிடம்",
    locationPermission: "உங்கள் இருப்பிடத்தைப் பயன்படுத்த NeerKaval-க்கு அனுமதி வழங்க வேண்டுமா?",
    allowLocation: "இருப்பிடம் அனுமதி",
    selectLocation: "இருப்பிடம் தேர்ந்தெடுக்க",
    detectingLocation: "இருப்பிடம் கண்டறியப்படுகிறது...",

    // Safety status
    currentStatus: "தற்போதைய நிலை",
    floodRisk: "வெள்ள அபாயம்",
    normal: "பாதுகாப்பான",
    riskUnknown: "அபாய நிலை தெரியவில்லை",
    riskUnknownDetail:
      "தரவு கிடைக்காததால் அபாய மதிப்பீடு செய்ய முடியவில்லை. இது பாதுகாப்பான என்பதைக் குறிக்காது. அதிகார அறிவிப்புகளைப் பின்பற்றவும்.",
    caution: "கவனம் தேவை",
    warning: "எச்சரிக்கை",
    highRisk: "வெள்ள அபாயம்",
    critical: "மிக அபாயம்",

    // Actions
    listen: "கேளுங்கள்",
    stop: "நிறுத்து",
    demoLocation: "மாதிரி இருப்பிடம் (கோயம்புத்தூர்)",
    goToSafety: "பாதுகாப்புக்கு செல்ல",
    findShelter: "நிவாரண மையம்",
    emergencyHelp: "அவசர உதவி",
    refreshNow: "இப்போது புதுப்பிக்க",
    dataLoadFailed:
      "தரவைப் பெற முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    goThere: "அங்கே செல்ல",

    // Weather
    currentWeather: "தற்போதைய வானிலை",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    rain: "மழை",
    wind: "காற்று",
    forecast: "கணிப்பு",
    lastUpdated: "கடைசி புதுப்பிப்பு",
    source: "ஆதாரம்",

    // Data status
    liveData: "🟢 நேரடி தரவு",
    cachedData: "🟠 சேமிக்கப்பட்ட தரவு",
    demoData: "🟣 மாதிரி தரவு",
    unavailable: "🔴 தகவல் கிடைக்கவில்லை",
    offlineMode: "ஆஃப்லைன் முறை",
    backendMissing: "சேவையகம் இணைக்கப்படவில்லை",
    backendMissingDetail: "இது நிலையான முன்னோட்டம் மட்டும். வானிலை, அபாய மதிப்பீடு, அவசர உதவி ஆகியவை இயங்காது.",

    // XAI
    whyDanger: "ஏன் அபாயம்?",
    whatToDo: "என்ன செய்ய வேண்டும்?",
    heavyRain: "கனமழை",
    rainIncreasing: "மழை அதிகரித்து வருகிறது.",
    slopeHigh: "சரிவு அதிகம்",
    waterFlowFast: "நீர் வேகமாக கீழே செல்லலாம்.",
    soilMoist: "மண் ஈரமாக உள்ளது",
    soilCannotAbsorb: "மண் மேலும் தண்ணீரை உறிஞ்ச முடியாமல் இருக்கலாம்.",
    moveSafety: "பாதுகாப்பான இடத்திற்கு செல்லுங்கள்.",
    moveHigher: "உயரமான இடத்திற்கு செல்லுங்கள்.",

    // SOS
    sosTitle: "அவசர உதவி",
    selectEmergencyType: "அவசர வகையை தேர்ந்தெடுக்கவும்",
    rescue: "🚑 மீட்பு",
    boat: "🚤 படகு",
    medical: "🏥 மருத்துவ",
    peopleTrapped: "👥 மக்கள் தவறாகி",
    sendSOS: "அவசர உதவி அனுப்பு",
    sosSent: "அவசர உதவி கோரிக்கை அனுப்பப்பட்டது",
    sosPending: "மீட்பு உறுதிப்படுத்தல் இன்னும் பெறப்படவில்லை.",
    sosAcknowledged: "மீட்பு கோரிக்கை உறுதிப்படுத்தப்பட்டது.",
    messageOptional: "செய்தி (விரும்பினால்)",
    networkStatus: "நெட்வொர்க் நிலை",

    // Shelter
    shelterNearby: "அருகிலுள்ள நிவாரண மையங்கள்",
    noShelter: "அருகில் சரிபார்க்கப்பட்ட நிவாரண மையம் இல்லை.",
    noShelterDesc: "சரிபார்க்கப்பட்ட பாதுகாப்பான இடத்திற்கு செல்லுங்கள் அல்லது உயரமான இடத்திற்கு செல்லுங்கள்.",
    capacity: "திறன்",
    available: "இடங்கள் உள்ளன",
    open: "🟢 திறந்துள்ளது",
    full: "🔴 நிரம்பியது",
    closed: "⚫ மூடப்பட்டது",
    medicalSupport: "மருத்துவ உதவி",
    water: "தண்ணீர்",
    food: "உணவு",

    // Citizen report
    reportHazard: "ஆபத்து தெரிவிக்க",
    floodWater: "🌊 வெள்ள நீர்",
    bridgeBlocked: "🌉 பாலம் தடுக்கப்பட்டது",
    roadBlocked: "🛣️ சாலை தடுக்கப்பட்டது",
    treeFall: "🌳 மரம் விழுந்தது",
    peopleTrappedReport: "🏠 மக்கள் தவறாகி",
    other: "⚠️ பிற",
    submitReport: "அறிக்கை சமர்ப்பிக்க",
    reportSubmitted: "அறிக்கை சமர்ப்பிக்கப்பட்டது.",

    // Officer
    officerLogin: "அதிகாரி உள்நுழைவு",
    username: "பயனர்பெயர்",
    password: "கடவுச்சொல்",
    login: "உள்நுழை",
    logout: "வெளியேறு",
    dashboard: "டாஷ்போர்டு",
    systemStatus: "கணினி நிலை",
    citizenReports: "குடிமக்கள் அறிக்கைகள்",
    rescueTeams: "மீட்பு குழுக்கள்",
    alerts: "எச்சரிக்கைகள்",
    riskAnalysis: "அபாய பகுப்பாய்வு",
    gisMap: "வரைபடம்",

    // Offline
    offlineTitle: "இணைய இணைப்பு இல்லை",
    lastWeatherUpdate: "கடைசி வானிலை புதுப்பிப்பு",
    lastRiskUpdate: "கடைசி அபாய புதுப்பிப்பு",
    safetyInfo: "பாதுகாப்பு தகவல்",
    map: "வரைபடம்",
    gps: "GPS",
    available2: "கிடைக்கிறது",
    smsAvailable: "GSM கிடைக்கிறது",

    // Manual location
    state: "மாநிலம்",
    district: "மாவட்டம்",
    taluk: "வட்டாரம்",
    village: "கிராமம்",
    searchPlace: "இடம் தேடு",
  },

  en: {
    appName: "NEERKAVAL",
    appTagline: "Predict. Explain. Guide. Save Lives.",

    home: "Home",
    safety: "Safety",
    shelter: "Shelter",
    sos: "SOS",
    more: "More",
    weather: "Weather",

    yourLocation: "Your Location",
    locationPermission: "Allow NeerKaval to use your location?",
    allowLocation: "Allow Location",
    selectLocation: "Select Location",
    detectingLocation: "Detecting location...",

    currentStatus: "Current Status",
    floodRisk: "Flood Risk",
    normal: "NORMAL",
    riskUnknown: "RISK STATUS UNKNOWN",
    riskUnknownDetail:
      "No data is available, so flood risk cannot be assessed. This does not mean it is safe. Follow official warnings.",
    caution: "CAUTION",
    warning: "WARNING",
    highRisk: "HIGH RISK",
    critical: "CRITICAL",

    listen: "LISTEN",
    stop: "STOP",
    demoLocation: "Demo location (Coimbatore)",
    goToSafety: "Go to Safety",
    findShelter: "Find Shelter",
    emergencyHelp: "Emergency Help",
    refreshNow: "Refresh Now",
    dataLoadFailed:
      "Could not load data. Check your internet connection and try again.",
    goThere: "Go There",

    currentWeather: "Current Weather",
    temperature: "Temperature",
    humidity: "Humidity",
    rain: "Rain",
    wind: "Wind",
    forecast: "Forecast",
    lastUpdated: "Last updated",
    source: "Source",

    liveData: "🟢 LIVE DATA",
    cachedData: "🟠 CACHED DATA",
    demoData: "🟣 DEMO DATA",
    unavailable: "🔴 UNAVAILABLE",
    offlineMode: "OFFLINE MODE",
    backendMissing: "Backend not connected",
    backendMissingDetail: "This is a static preview only. Weather, risk assessment and SOS will not work until a backend URL is configured.",

    whyDanger: "Why is it dangerous?",
    whatToDo: "What should I do?",
    heavyRain: "Heavy Rain",
    rainIncreasing: "Rainfall is increasing.",
    slopeHigh: "Steep Slope",
    waterFlowFast: "Water may flow rapidly downhill.",
    soilMoist: "Soil is Saturated",
    soilCannotAbsorb: "Soil may not absorb more water.",
    moveSafety: "Move to a safe location.",
    moveHigher: "Move to higher ground immediately.",

    sosTitle: "Emergency Help",
    selectEmergencyType: "Select Emergency Type",
    rescue: "🚑 RESCUE",
    boat: "🚤 BOAT",
    medical: "🏥 MEDICAL",
    peopleTrapped: "👥 PEOPLE TRAPPED",
    sendSOS: "Send SOS",
    sosSent: "SOS request sent",
    sosPending: "Rescue acknowledgement has not yet been received.",
    sosAcknowledged: "Rescue request acknowledged.",
    messageOptional: "Message (optional)",
    networkStatus: "Network Status",

    shelterNearby: "Nearby Shelters",
    noShelter: "Nearby verified shelter unavailable.",
    noShelterDesc: "Move toward a verified safe location or higher ground where instructed.",
    capacity: "Capacity",
    available: "spaces available",
    open: "🟢 OPEN",
    full: "🔴 FULL",
    closed: "⚫ CLOSED",
    medicalSupport: "Medical Support",
    water: "Water",
    food: "Food",

    reportHazard: "Report Hazard",
    floodWater: "🌊 FLOOD WATER",
    bridgeBlocked: "🌉 BRIDGE BLOCKED",
    roadBlocked: "🛣️ ROAD BLOCKED",
    treeFall: "🌳 TREE FALL",
    peopleTrappedReport: "🏠 PEOPLE TRAPPED",
    other: "⚠️ OTHER",
    submitReport: "Submit Report",
    reportSubmitted: "Report submitted successfully.",

    officerLogin: "Officer Login",
    username: "Username",
    password: "Password",
    login: "Login",
    logout: "Logout",
    dashboard: "Dashboard",
    systemStatus: "System Status",
    citizenReports: "Citizen Reports",
    rescueTeams: "Rescue Teams",
    alerts: "Alerts",
    riskAnalysis: "Risk Analysis",
    gisMap: "GIS Map",

    offlineTitle: "No Internet Connection",
    lastWeatherUpdate: "Last weather update",
    lastRiskUpdate: "Last risk update",
    safetyInfo: "Safety Information",
    map: "Map",
    gps: "GPS",
    available2: "AVAILABLE",
    smsAvailable: "GSM AVAILABLE",

    state: "State",
    district: "District",
    taluk: "Taluk",
    village: "Village",
    searchPlace: "Search Place",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
