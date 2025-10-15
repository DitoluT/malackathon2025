// Funciones para generar datos de gráficas con Gemini Flash
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  title: string;
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
}

// Datos de ejemplo para demostración
const demoDataSets = {
  diagnosesByCategory: [
    { name: 'Depresión', value: 342, pacientes: 342 },
    { name: 'Ansiedad', value: 289, pacientes: 289 },
    { name: 'Trastorno Bipolar', value: 156, pacientes: 156 },
    { name: 'Esquizofrenia', value: 98, pacientes: 98 },
    { name: 'TOC', value: 74, pacientes: 74 },
    { name: 'Otros', value: 142, pacientes: 142 },
  ],

  diagnosesByAge: [
    { name: '18-25', value: 145 },
    { name: '26-35', value: 267 },
    { name: '36-45', value: 312 },
    { name: '46-55', value: 198 },
    { name: '56-65', value: 156 },
    { name: '65+', value: 89 },
  ],

  temporalTrend: [
    { name: 'Ene', value: 87 },
    { name: 'Feb', value: 92 },
    { name: 'Mar', value: 103 },
    { name: 'Abr', value: 98 },
    { name: 'May', value: 115 },
    { name: 'Jun', value: 121 },
    { name: 'Jul', value: 108 },
    { name: 'Ago', value: 95 },
    { name: 'Sep', value: 112 },
    { name: 'Oct', value: 128 },
    { name: 'Nov', value: 134 },
    { name: 'Dic', value: 118 },
  ],

  diagnosisByGender: [
    { name: 'Mujeres', value: 612 },
    { name: 'Hombres', value: 489 },
    { name: 'Otro', value: 32 },
  ],

  hospitalStay: [
    { name: '1-3 días', value: 234 },
    { name: '4-7 días', value: 456 },
    { name: '8-14 días', value: 312 },
    { name: '15-30 días', value: 145 },
    { name: '30+ días', value: 54 },
  ],

  admissionType: [
    { name: 'Urgente', value: 567 },
    { name: 'Programado', value: 398 },
    { name: 'Referido', value: 236 },
  ],
};

export const generateDemoChart = (userInput: string): ChartData => {
  const input = userInput.toLowerCase();

  // Detectar tipo de gráfica solicitada
  if (input.includes('edad') || input.includes('age')) {
    return {
      type: 'bar',
      data: demoDataSets.diagnosesByAge,
      title: 'Distribución de Diagnósticos por Edad',
      dataKey: 'value',
      xAxisKey: 'name',
      colors: ['#3b82f6'],
    };
  }

  if (input.includes('tiempo') || input.includes('temporal') || input.includes('tendencia') || input.includes('mes') || input.includes('año')) {
    return {
      type: 'area',
      data: demoDataSets.temporalTrend,
      title: 'Tendencia Temporal de Ingresos (2024)',
      dataKey: 'value',
      xAxisKey: 'name',
      colors: ['#8b5cf6'],
    };
  }

  if (input.includes('género') || input.includes('genero') || input.includes('sexo') || input.includes('gender')) {
    return {
      type: 'pie',
      data: demoDataSets.diagnosisByGender,
      title: 'Distribución por Género',
      dataKey: 'value',
      colors: ['#ec4899', '#3b82f6', '#10b981'],
    };
  }

  if (input.includes('estancia') || input.includes('hospitalización') || input.includes('hospitalizacion') || input.includes('días') || input.includes('dias')) {
    return {
      type: 'bar',
      data: demoDataSets.hospitalStay,
      title: 'Duración de Estancia Hospitalaria',
      dataKey: 'value',
      xAxisKey: 'name',
      colors: ['#f59e0b'],
    };
  }

  if (input.includes('ingreso') || input.includes('admisión') || input.includes('admission') || input.includes('tipo')) {
    return {
      type: 'pie',
      data: demoDataSets.admissionType,
      title: 'Tipo de Ingreso Hospitalario',
      dataKey: 'value',
      colors: ['#ef4444', '#10b981', '#06b6d4'],
    };
  }

  if (input.includes('línea') || input.includes('linea') || input.includes('line') || input.includes('evolución') || input.includes('evolucion')) {
    return {
      type: 'line',
      data: demoDataSets.temporalTrend,
      title: 'Evolución Mensual de Casos',
      dataKey: 'value',
      xAxisKey: 'name',
      colors: ['#10b981'],
    };
  }

  // Por defecto, mostrar diagnósticos por categoría
  return {
    type: 'bar',
    data: demoDataSets.diagnosesByCategory,
    title: 'Frecuencia de Diagnósticos por Categoría',
    dataKey: 'value',
    xAxisKey: 'name',
    colors: ['#3b82f6'],
  };
};

// Función para integración con Gemini API
export const generateChartWithGemini = async (
  prompt: string,
  apiKey?: string
): Promise<ChartData> => {
  try {
    const { getSystemPrompt } = await import('./gemini-config');
    const systemPrompt = await getSystemPrompt();
    apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key no configurada');
    }

    console.log('🤖 Usando Gemini 2.0 Flash para generar gráfica...');
    
    // Inicializar Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const fullPrompt = `${systemPrompt}

SOLICITUD DEL USUARIO: "${prompt}"

Genera una visualización apropiada. Responde SOLO con el JSON (sin \`\`\`json ni explicaciones).`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const textContent = response.text();
    
    console.log('Gemini raw response:', textContent);
    
    // Extraer JSON (puede venir con markdown ```json ... ``` o texto adicional)
    let jsonMatch = textContent.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // Intentar limpiar el texto primero
      const cleaned = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      console.error('Respuesta de Gemini no contiene JSON:', textContent);
      throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
    }

    const chartData = JSON.parse(jsonMatch[0]);
    console.log('✅ Chart data parsed:', chartData);
    
    // Validar estructura
    return validateChartData(chartData);

  } catch (error) {
    console.error('❌ Error en generateChartWithGemini:', error);
    
    // Fallback a datos de demostración si Gemini falla
    console.log('⚠️ Usando datos de demostración como fallback');
    return generateDemoChart(prompt);
  }
};

// Función para validar y sanitizar datos de gráfica
export const validateChartData = (data: any): ChartData => {
  // Validación básica
  if (!data.type || !['bar', 'line', 'pie', 'area'].includes(data.type)) {
    throw new Error('Tipo de gráfica inválido');
  }

  if (!Array.isArray(data.data) || data.data.length === 0) {
    throw new Error('Datos de gráfica inválidos');
  }

  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Título de gráfica inválido');
  }

  return data as ChartData;
};

// Función para generar respuestas de texto con Gemini
export const generateTextResponseWithGemini = async (
  prompt: string,
  apiKey?: string
): Promise<string> => {
  try {
    const { getSystemPrompt } = await import('./gemini-config');
    const systemPrompt = await getSystemPrompt();
    apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key no configurada');
    }

    console.log('🤖 Usando Gemini 2.0 Flash para respuesta de texto...');
    
    // Inicializar Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const fullPrompt = `${systemPrompt}

PREGUNTA DEL USUARIO: "${prompt}"

Responde de forma concisa (máximo 2-3 líneas) y profesional. Si es relevante, sugiere una visualización.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const textContent = response.text();
    
    console.log('✅ Respuesta generada:', textContent);
    return textContent;

  } catch (error) {
    console.error('❌ Error en generateTextResponseWithGemini:', error);
    return 'Interesante pregunta. ¿Te gustaría ver una visualización de datos relacionada?';
  }
};

// Interfaz para el historial de conversación
interface ConversationHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Función unificada con memoria conversacional
export const generateResponseWithGemini = async (
  prompt: string,
  conversationHistory: ConversationHistory[] = [],
  apiKey?: string
): Promise<{ type: 'chart' | 'text'; content: ChartData | string }> => {
  try {
    const { getSystemPrompt } = await import('./gemini-config');
    const systemPrompt = await getSystemPrompt();
    apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key no configurada');
    }

    console.log('🤖 Gemini 2.0 Flash con memoria conversacional...');
    console.log('📚 Historial:', conversationHistory.length, 'mensajes previos');
    
    // Inicializar Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Crear chat con historial
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: '¡Entendido! Estoy listo para ayudarte con análisis de datos de salud mental. Puedo generar visualizaciones o responder preguntas. ¿En qué puedo ayudarte?' }]
        },
        ...conversationHistory
      ],
    });

    // Enviar mensaje actual
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const textContent = response.text().trim();
    
    console.log('📨 Respuesta de Gemini:', textContent);
    
    // Detectar si Gemini generó un JSON (gráfica)
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const chartData = JSON.parse(jsonMatch[0]);
        
        // Validar que es una gráfica válida
        if (chartData.type && chartData.data && chartData.title) {
          console.log('📊 Gemini decidió generar una gráfica');
          return {
            type: 'chart',
            content: validateChartData(chartData)
          };
        }
      } catch (parseError) {
        console.log('⚠️ JSON encontrado pero no es una gráfica válida');
      }
    }
    
    // Si no es JSON o no es válido, es texto
    console.log('💬 Gemini decidió responder con texto');
    return {
      type: 'text',
      content: textContent
    };

  } catch (error) {
    console.error('❌ Error en generateResponseWithGemini:', error);
    return {
      type: 'text',
      content: 'Interesante pregunta. ¿Te gustaría ver una visualización de datos relacionada?'
    };
  }
};
