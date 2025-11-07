export const languages = {
  en: 'English',
  es: 'Español (Spanish)',
  fr: 'Français (French)',
  de: 'Deutsch (German)',
  hi: 'हिन्दी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  ru: 'Русский (Russian)',
  ar: 'العربية (Arabic)',
  zh: '中文 (Mandarin)',
  ja: '日本語 (Japanese)',
  pt: 'Português (Portuguese)',
};

export type LanguageCode = keyof typeof languages;

export const translations: Record<LanguageCode, any> = {
  en: {
    app: {
        title: 'Health AI',
    },
    nav: {
        home: 'Home',
        checker: 'Symptom Checker',
        tracker: 'Health Tracker',
        about: 'About Us',
        settings: 'Settings',
        checkerShort: 'Checker',
        trackerShort: 'Tracker',
        aboutShort: 'About',
    },
    home: {
        title: 'Your Personal Health Companion',
        subtitle: 'Leverage the power of AI to understand your symptoms, track your health patterns, and gain valuable insights for a healthier life.',
        checkerButton: 'Check Symptoms Now',
        trackerButton: 'Track Your Health',
        feature1Title: 'Symptom Checker',
        feature1Desc: 'Describe your symptoms in plain language and get an AI-powered analysis of possible causes and suggestions.',
        feature2Title: 'Health Tracker',
        feature2Desc: 'Log your daily health status, monitor trends over time with our calendar and chart views.',
        feature3Title: 'AI Insights',
        feature3Desc: 'Let our AI analyze your health logs to identify patterns and provide personalized insights for your well-being.',
    },
    symptomChecker: {
        patientInfo: 'Patient Information',
        age: 'Age',
        agePlaceholder: 'e.g., 35',
        gender: 'Gender',
        select: 'Select...',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        preferNotToSay: 'Prefer not to say',
        ethnicity: 'Ethnicity',
        ethnicities: {
            white: 'White',
            southAsian: 'South Asian',
            chinese: 'Chinese',
            black: 'Black',
            filipino: 'Filipino',
            latinAmerican: 'Latin American',
            arab: 'Arab',
            southeastAsian: 'Southeast Asian',
            westAsian: 'West Asian',
            korean: 'Korean',
            japanese: 'Japanese',
            indigenous: 'Indigenous (First Nations, Métis, Inuit)',
        },
        describeSymptoms: 'Describe Your Symptoms',
        symptomsPlaceholder: "e.g., 'I have a sore throat, a slight fever, and a cough...'",
        mic: {
            start: 'Start recording',
            stop: 'Stop recording',
            notSupported: 'Voice input not supported in your browser',
            error: 'Speech recognition error: {error}. Please ensure microphone access is granted.'
        },
        submitButton: {
            default: 'Get AI Analysis',
            loading: 'Analyzing...'
        },
        error: {
            location: 'Could not get location. Local healthcare suggestions will be generic.',
            unknown: 'An unknown error occurred.',
            fetch: 'Failed to get a diagnosis. The AI model may be temporarily unavailable.'
        },
        results: {
            possibleCauses: 'Possible Causes',
            confidence: '% Confidence',
            suggestedTreatment: 'Suggested Treatment:',
            localHealthcare: 'Local Healthcare Options'
        }
    },
    healthTracker: {
        calendarTitle: 'Health Calendar',
        insightPanelTitle: 'AI Insight Panel',
        analyzeButton: 'Analyze Health Patterns',
        trendTitle: 'Symptom Severity Trend',
        noData: 'No data to display. Add some health logs to see your trend.',
        error: {
            noLogs: 'No health logs available to analyze.',
            unknown: 'An unknown error occurred during analysis.',
            fetch: 'Failed to get health analysis. The AI model may be temporarily unavailable.'
        }
    },
    calendar: {
        logModalTitle: 'Health Log for {date}',
        logPlaceholder: 'How are you feeling today?',
        severityLabel: 'Symptom Severity (1: Mild - 10: Severe)',
        deleteButton: 'Delete Log',
        cancelButton: 'Cancel',
        saveButton: 'Save Log',
        savingButton: 'Saving...',
        error: 'Failed to save health log:',
        fallbackSummary: '📄 Logged'
    },
    about: {
        title: 'About Health AI Assistant',
        subtitle: 'Empowering you to take a proactive role in your health journey.',
        missionTitle: 'Our Mission',
        missionText: 'Our mission is to make health information more accessible and understandable. We believe that by providing intelligent tools, we can help individuals make more informed decisions about their well-being, in consultation with healthcare professionals.',
        howItWorksTitle: 'How It Works',
        howItWorksText: "This application utilizes Google's advanced Gemini AI models to analyze the information you provide. When you describe your symptoms or log your health data, the AI processes this information to identify potential patterns, suggest possible causes, and offer insights based on vast amounts of medical knowledge.",
        disclaimerTitle: 'Important Disclaimer',
        disclaimerText: 'The Health AI Assistant is an informational tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this application.'
    },
    settings: {
        title: 'Settings',
        subtitle: 'Customize your application experience.',
        language: {
            title: 'Language',
            selectLabel: 'Select your preferred language'
        },
        accessibility: {
            title: 'Accessibility',
            enableLabel: 'Enable Accessibility Mode',
            description: 'Increases font size for better readability.'
        },
        theme: {
            title: 'Theme Color',
            description: 'Choose an accent color for the application.',
            blue: 'Blue',
            green: 'Green',
            purple: 'Purple',
            orange: 'Orange'
        }
    }
  },
  es: {
    app: {
      title: 'Salud IA',
    },
    nav: {
      home: 'Inicio',
      checker: 'Verificador de Síntomas',
      tracker: 'Seguimiento de Salud',
      about: 'Sobre Nosotros',
      settings: 'Ajustes',
      checkerShort: 'Verificador',
      trackerShort: 'Seguimiento',
      aboutShort: 'Sobre',
    },
    home: {
      title: 'Tu Asistente de Salud Personal',
      subtitle: 'Aprovecha el poder de la IA para entender tus síntomas, seguir tus patrones de salud y obtener información valiosa para una vida más saludable.',
      checkerButton: 'Verificar Síntomas Ahora',
      trackerButton: 'Seguir tu Salud',
      feature1Title: 'Verificador de Síntomas',
      feature1Desc: 'Describe tus síntomas en lenguaje sencillo y obtén un análisis de posibles causas y sugerencias impulsado por IA.',
      feature2Title: 'Seguimiento de Salud',
      feature2Desc: 'Registra tu estado de salud diario, monitorea tendencias a lo largo del tiempo con nuestras vistas de calendario y gráficos.',
      feature3Title: 'Perspectivas de IA',
      feature3Desc: 'Deja que nuestra IA analice tus registros de salud para identificar patrones y proporcionar información personalizada para tu bienestar.',
    },
    symptomChecker: {
      patientInfo: 'Información del Paciente',
      age: 'Edad',
      agePlaceholder: 'ej., 35',
      gender: 'Género',
      select: 'Seleccionar...',
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro',
      preferNotToSay: 'Prefiero no decirlo',
      ethnicity: 'Etnia',
      ethnicities: {
        white: 'Blanco',
        southAsian: 'Surasiático',
        chinese: 'Chino',
        black: 'Negro',
        filipino: 'Filipino',
        latinAmerican: 'Latinoamericano',
        arab: 'Árabe',
        southeastAsian: 'Sudeste Asiático',
        westAsian: 'Asiático Occidental',
        korean: 'Coreano',
        japanese: 'Japonés',
        indigenous: 'Indígena',
      },
      describeSymptoms: 'Describe Tus Síntomas',
      symptomsPlaceholder: "ej., 'Tengo dolor de garganta, un poco de fiebre y tos...'",
      mic: {
        start: 'Comenzar a grabar',
        stop: 'Detener grabación',
        notSupported: 'La entrada de voz no es compatible con tu navegador',
        error: 'Error de reconocimiento de voz: {error}. Asegúrate de conceder acceso al micrófono.',
      },
      submitButton: {
        default: 'Obtener Análisis de IA',
        loading: 'Analizando...',
      },
      error: {
        location: 'No se pudo obtener la ubicación. Las sugerencias de atención médica local serán genéricas.',
        unknown: 'Ocurrió un error desconocido.',
        fetch: 'No se pudo obtener un diagnóstico. El modelo de IA puede no estar disponible temporalmente.',
      },
      results: {
        possibleCauses: 'Posibles Causas',
        confidence: '% de Confianza',
        suggestedTreatment: 'Tratamiento Sugerido:',
        localHealthcare: 'Opciones de Atención Médica Local',
      },
    },
    healthTracker: {
      calendarTitle: 'Calendario de Salud',
      insightPanelTitle: 'Panel de Perspectivas de IA',
      analyzeButton: 'Analizar Patrones de Salud',
      trendTitle: 'Tendencia de Gravedad de Síntomas',
      noData: 'No hay datos para mostrar. Agrega algunos registros de salud para ver tu tendencia.',
      error: {
        noLogs: 'No hay registros de salud disponibles para analizar.',
        unknown: 'Ocurrió un error desconocido durante el análisis.',
        fetch: 'No se pudo obtener el análisis de salud. El modelo de IA puede no estar disponible temporalmente.',
      },
    },
    calendar: {
      logModalTitle: 'Registro de Salud para {date}',
      logPlaceholder: '¿Cómo te sientes hoy?',
      severityLabel: 'Gravedad de los Síntomas (1: Leve - 10: Grave)',
      deleteButton: 'Eliminar Registro',
      cancelButton: 'Cancelar',
      saveButton: 'Guardar Registro',
      savingButton: 'Guardando...',
      error: 'Error al guardar el registro de salud:',
      fallbackSummary: '📄 Registrado',
    },
    about: {
      title: 'Sobre el Asistente de Salud IA',
      subtitle: 'Empoderándote para tomar un rol proactivo en tu viaje de salud.',
      missionTitle: 'Nuestra Misión',
      missionText: 'Nuestra misión es hacer que la información de salud sea más accesible y comprensible. Creemos que al proporcionar herramientas inteligentes, podemos ayudar a las personas a tomar decisiones más informadas sobre su bienestar, en consulta con profesionales de la salud.',
      howItWorksTitle: 'Cómo Funciona',
      howItWorksText: 'Esta aplicación utiliza los modelos avanzados de IA Gemini de Google para analizar la información que proporcionas. Cuando describes tus síntomas o registras tus datos de salud, la IA procesa esta información para identificar patrones potenciales, sugerir posibles causas y ofrecer perspectivas basadas en vastas cantidades de conocimiento médico.',
      disclaimerTitle: 'Aviso Importante',
      disclaimerText: 'El Asistente de Salud IA es una herramienta informativa y no sustituye el consejo, diagnóstico o tratamiento médico profesional. Siempre busca el consejo de tu médico u otro proveedor de salud calificado con cualquier pregunta que puedas tener sobre una condición médica. Nunca ignores el consejo médico profesional ni demores en buscarlo por algo que hayas leído en esta aplicación.',
    },
    settings: {
      title: 'Ajustes',
      subtitle: 'Personaliza tu experiencia en la aplicación.',
      language: {
        title: 'Idioma',
        selectLabel: 'Selecciona tu idioma preferido',
      },
      accessibility: {
        title: 'Accesibilidad',
        enableLabel: 'Activar Modo de Accesibilidad',
        description: 'Aumenta el tamaño de la fuente para una mejor legibilidad.',
      },
      theme: {
        title: 'Color del Tema',
        description: 'Elige un color de acento para la aplicación.',
        blue: 'Azul',
        green: 'Verde',
        purple: 'Morado',
        orange: 'Naranja',
      },
    },
  },
  // Adding stubs for other languages to avoid errors, a full translation would be extensive.
  fr: {
    app: { title: "Santé IA" },
    nav: { home: 'Accueil', checker: 'Vérificateur', tracker: 'Suivi', about: 'À propos', settings: 'Paramètres', checkerShort: 'Vérif', trackerShort: 'Suivi', aboutShort: 'À propos' },
    home: { title: "Votre Assistant Santé Personnel", checkerButton: "Vérifier les Symptômes", trackerButton: "Suivre Votre Santé" },
    settings: { title: 'Paramètres', subtitle: "Personnalisez votre expérience.", language: { title: 'Langue', selectLabel: 'Choisissez votre langue' }, accessibility: { title: 'Accessibilité', enableLabel: 'Activer le mode accessibilité', description: 'Augmente la taille du texte.' }, theme: { title: 'Thème', description: "Choisissez une couleur.", blue: 'Bleu', green: 'Vert', purple: 'Violet', orange: 'Orange' } },
  },
  de: {
    app: { title: "Gesundheits-KI" },
    nav: { home: 'Start', checker: 'Symptom-Checker', tracker: 'Gesundheits-Tracker', about: 'Über uns', settings: 'Einstellungen', checkerShort: 'Checker', trackerShort: 'Tracker', aboutShort: 'Über' },
    home: { title: "Ihr Persönlicher Gesundheitsassistent", checkerButton: "Symptome Prüfen", trackerButton: "Gesundheit Verfolgen" },
    settings: { title: 'Einstellungen', subtitle: "Passen Sie Ihre App an.", language: { title: 'Sprache', selectLabel: 'Wählen Sie Ihre Sprache' }, accessibility: { title: 'Barrierefreiheit', enableLabel: 'Barrierefreiheitsmodus aktivieren', description: 'Vergrößert die Schriftgröße.' }, theme: { title: 'Thema', description: "Wählen Sie eine Farbe.", blue: 'Blau', green: 'Grün', purple: 'Lila', orange: 'Orange' } },
  },
  hi: {
    app: { title: "स्वास्थ्य एआई" },
    nav: { home: 'होम', checker: 'लक्षण परीक्षक', tracker: 'स्वास्थ्य ट्रैकर', about: 'हमारे बारे में', settings: 'सेटिंग्स', checkerShort: 'परीक्षक', trackerShort: 'ट्रैकर', aboutShort: 'बारे में' },
    home: { title: "आपका व्यक्तिगत स्वास्थ्य साथी", checkerButton: "लक्षणों की जाँच करें", trackerButton: "अपने स्वास्थ्य को ट्रैक करें" },
    settings: { title: 'सेटिंग्स', subtitle: "अपने ऐप का अनुभव अनुकूलित करें।", language: { title: 'भाषा', selectLabel: 'अपनी पसंदीदा भाषा चुनें' }, accessibility: { title: 'सरल उपयोग', enableLabel: 'सरल उपयोग मोड सक्षम करें', description: 'पठनीयता के लिए फ़ॉन्ट आकार बढ़ाता है।' }, theme: { title: 'थीम', description: "एक रंग चुनें।", blue: 'नीला', green: 'हरा', purple: 'बैंगनी', orange: 'नारंगी' } },
  },
  ta: {
    app: { title: "சுகாதார AI" },
    nav: { home: 'முகப்பு', checker: 'அறிகுறி சரிபார்ப்பு', tracker: 'சுகாதார டிராக்கர்', about: 'பற்றி', settings: 'அமைப்புகள்', checkerShort: 'சரிபார்ப்பு', trackerShort: 'டிராக்கர்', aboutShort: 'பற்றி' },
    home: { title: "உங்கள் தனிப்பட்ட சுகாதார துணை", checkerButton: "அறிகுறிகளைச் சரிபார்க்கவும்", trackerButton: "உங்கள் ஆரோக்கியத்தைக் கண்காணிக்கவும்" },
    settings: { title: 'அமைப்புகள்', subtitle: "உங்கள் பயன்பாட்டு அனுபவத்தைத் தனிப்பயனாக்குங்கள்.", language: { title: 'மொழி', selectLabel: 'உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்' }, accessibility: { title: 'அணுகல்தன்மை', enableLabel: 'அணுகல்தன்மை பயன்முறையை இயக்கு', description: 'எழுத்துரு அளவை அதிகரிக்கிறது.' }, theme: { title: 'தீம்', description: "ஒரு வண்ணத்தைத் தேர்ந்தெடுக்கவும்.", blue: 'நீலம்', green: 'பச்சை', purple: 'ஊதா', orange: 'ஆரஞ்சு' } },
  },
  ru: {
    app: { title: "Здоровье ИИ" },
    nav: { home: 'Главная', checker: 'Проверка симптомов', tracker: 'Трекер здоровья', about: 'О нас', settings: 'Настройки', checkerShort: 'Проверка', trackerShort: 'Трекер', aboutShort: 'О нас' },
    home: { title: "Ваш личный помощник по здоровью", checkerButton: "Проверить симптомы", trackerButton: "Отслеживать здоровье" },
    settings: { title: 'Настройки', subtitle: "Настройте приложение.", language: { title: 'Язык', selectLabel: 'Выберите язык' }, accessibility: { title: 'Доступность', enableLabel: 'Включить режим доступности', description: 'Увеличивает размер шрифта.' }, theme: { title: 'Тема', description: "Выберите цвет.", blue: 'Синий', green: 'Зеленый', purple: 'Фиолетовый', orange: 'Оранжевый' } },
  },
  ar: {
    app: { title: "الصحة بالذكاء الاصطناعي" },
    nav: { home: 'الرئيسية', checker: 'فاحص الأعراض', tracker: 'متتبع الصحة', about: 'حولنا', settings: 'الإعدادات', checkerShort: 'فاحص', trackerShort: 'متتبع', aboutShort: 'حول' },
    home: { title: "مساعدك الصحي الشخصي", checkerButton: "افحص الأعراض الآن", trackerButton: "تتبع صحتك" },
    settings: { title: 'الإعدادات', subtitle: "تخصيص تجربتك.", language: { title: 'اللغة', selectLabel: 'اختر لغتك' }, accessibility: { title: 'إمكانية الوصول', enableLabel: 'تمكين وضع الوصول', description: 'يزيد حجم الخط.' }, theme: { title: 'المظهر', description: "اختر لونا.", blue: 'أزرق', green: 'أخضر', purple: 'بنفسجي', orange: 'برتقالي' } },
  },
  zh: {
    app: { title: "健康AI" },
    nav: { home: '首页', checker: '症状检查器', tracker: '健康追踪器', about: '关于我们', settings: '设置', checkerShort: '检查器', trackerShort: '追踪器', aboutShort: '关于' },
    home: { title: "您的个人健康伴侣", checkerButton: "立即检查症状", trackerButton: "追踪您的健康" },
    settings: { title: '设置', subtitle: "自定义您的应用体验。", language: { title: '语言', selectLabel: '选择您的语言' }, accessibility: { title: '辅助功能', enableLabel: '启用辅助功能模式', description: '增加字体大小。' }, theme: { title: '主题', description: "选择颜色。", blue: '蓝色', green: '绿色', purple: '紫色', orange: '橙色' } },
  },
  ja: {
    app: { title: "健康AI" },
    nav: { home: 'ホーム', checker: '症状チェッカー', tracker: '健康トラッカー', about: '概要', settings: '設定', checkerShort: 'チェッカー', trackerShort: 'トラッカー', aboutShort: '概要' },
    home: { title: "あなたのパーソナルヘルスコンパニオン", checkerButton: "症状をチェック", trackerButton: "健康を追跡" },
    settings: { title: '設定', subtitle: "アプリをカスタマイズします。", language: { title: '言語', selectLabel: '言語を選択' }, accessibility: { title: 'アクセシビリティ', enableLabel: 'アクセシビリティモードを有効にする', description: '文字サイズを大きくします。' }, theme: { title: 'テーマ', description: "色を選択。", blue: '青', green: '緑', purple: '紫', orange: 'オレンジ' } },
  },
  pt: {
    app: { title: "Saúde IA" },
    nav: { home: 'Início', checker: 'Verificador de Sintomas', tracker: 'Rastreador de Saúde', about: 'Sobre', settings: 'Configurações', checkerShort: 'Verificador', trackerShort: 'Rastreador', aboutShort: 'Sobre' },
    home: { title: "Seu Assistente Pessoal de Saúde", checkerButton: "Verificar Sintomas", trackerButton: "Acompanhar Saúde" },
    settings: { title: 'Configurações', subtitle: "Personalize sua experiência.", language: { title: 'Idioma', selectLabel: 'Selecione seu idioma' }, accessibility: { title: 'Acessibilidade', enableLabel: 'Ativar modo de acessibilidade', description: 'Aumenta o tamanho da fonte.' }, theme: { title: 'Tema', description: "Escolha uma cor.", blue: 'Azul', green: 'Verde', purple: 'Roxo', orange: 'Laranja' } },
  },
};
