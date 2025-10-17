// Funciones para generar respuestas con Gemini Flash
// Workflow: "select ai" → ejecuta SQL | mensaje normal → respuesta conversacional
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  title: string;
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
}

interface TableData {
  type: 'table';
  title: string;
  data: any[];
  columns: string[];
}

interface ConversationHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Función para validar queries SQL (seguridad contra SQL injection)
const validateSQLQuery = (query: string): boolean => {
  const queryUpper = query.toUpperCase().trim();
  
  if (!queryUpper.startsWith('SELECT')) {
    console.error('❌ Query no empieza con SELECT');
    return false;
  }
  
  const dangerousKeywords = [
    'DROP', 'DELETE', 'TRUNCATE', 'INSERT', 'UPDATE', 
    'CREATE', 'ALTER', 'GRANT', 'REVOKE', 'EXECUTE',
    'EXEC', 'CALL', 'MERGE', 'RENAME'
  ];
  
  for (const keyword of dangerousKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(query)) {
      console.error(`❌ Query contiene palabra peligrosa: ${keyword}`);
      return false;
    }
  }
  
  const semicolonCount = (query.match(/;/g) || []).length;
  if (semicolonCount > 1 || (semicolonCount === 1 && !query.trim().endsWith(';'))) {
    console.error('❌ Query contiene múltiples statements');
    return false;
  }
  
  return true;
};

// Función para ejecutar query SQL en el backend
const executeSQL = async (sqlQuery: string): Promise<any[]> => {
  try {
    if (!validateSQLQuery(sqlQuery)) {
      throw new Error('Query SQL no válida o insegura');
    }
    
    console.log('🔍 Ejecutando SQL query:', sqlQuery);
    
    // 1. Ejecutar la query SQL contra el backend
    const apiUrl = 'http://130.61.189.36:8000/api/v1';
    const response = await fetch(`${apiUrl}/query/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sqlQuery,
        limit: 100
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error ejecutando query');
    }
    
    const result = await response.json();
    console.log('✅ Query ejecutada, resultados:', result.data.length, 'filas');
    
    return result.data;
    
  } catch (error) {
    console.error('❌ Error ejecutando SQL:', error);
    throw error;
  }
};

// Función principal con workflow simplificado
export const generateResponseWithGemini = async (
  prompt: string,
  conversationHistory: ConversationHistory[] = [],
  apiKey?: string
): Promise<{ type: 'chart' | 'text' | 'table'; content: ChartData | TableData | string }> => {
  try {
    const { getSystemPrompt } = await import('./gemini-config');
    const systemPrompt = await getSystemPrompt();
    apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key no configurada');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: '¡Entendido! Responderé tus preguntas normalmente. Si quieres que consulte la base de datos real, usa "select ai" seguido de tu petición. ¿En qué puedo ayudarte?' }]
        },
        ...conversationHistory
      ],
    });
    
    // DEBUG: Verificar que el historial contiene datos
    console.log('🔍 Historial completo pasado a Gemini:', conversationHistory.length, 'mensajes');
    if (conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage && lastMessage.parts && lastMessage.parts[0]) {
        console.log('📋 Último mensaje en historial (primeros 200 chars):', 
          lastMessage.parts[0].text.substring(0, 200));
      }
    }

    // DETECTAR: ¿Es un comando "select ai"?
    // Detectar palabras clave que indican necesidad de datos
    const dataKeywords = ['cuántos', 'cuántas', 'cantidad', 'total', 'distribución', 'promedio', 'media', 
                          'muestra', 'dame', 'lista', 'casos', 'pacientes', 'diagnósticos', 'comparar',
                          'tendencia', 'por mes', 'por año', 'comunidad', 'edad', 'género', 'coste', 'gráfica', 'grafica', 'chart'];
    
    const promptLower = prompt.toLowerCase();
    const needsData = dataKeywords.some(keyword => promptLower.includes(keyword)) || 
                      promptLower.trim().startsWith('select ai');
    
    const isSelectAI = needsData;
    
    if (isSelectAI) {
      console.log('🔍 Detectado comando SELECT AI - Ejecutando workflow SQL');
      
      // Extraer la petición (quitar "select ai")
      const userRequest = prompt.replace(/^select ai\s*/i, '').trim();
      console.log('�� Petición del usuario:', userRequest);
      
      // PASO 1: Gemini genera la query SQL
      const sqlPrompt = `El usuario quiere consultar la base de datos: "${userRequest}"

Genera una query SQL SELECT apropiada. Recuerda:
- Usar alias CATEGORY y VALUE para los resultados
- La tabla es SALUD_MENTAL_FEATURED
- Columnas con espacios entre comillas: "Comunidad Autónoma", "Diagnóstico Principal", etc.

Responde SOLO con JSON:
{
  "sqlQuery": "SELECT ...",
  "explanation": "breve explicación de qué busca la query"
}`;

      const sqlResult = await chat.sendMessage(sqlPrompt);
      const sqlResponse = await sqlResult.response;
      const sqlContent = sqlResponse.text().trim();
      
      console.log('📨 Respuesta SQL de Gemini:', sqlContent);
      
      let jsonMatch = sqlContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        const cleaned = sqlContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      }
      
      if (!jsonMatch) {
        return {
          type: 'text',
          content: '❌ No pude generar una query SQL válida. Intenta reformular tu petición.'
        };
      }
      
      const sqlDecision = JSON.parse(jsonMatch[0]);
      
      if (!sqlDecision.sqlQuery) {
        return {
          type: 'text',
          content: '❌ No pude generar una query SQL. Intenta ser más específico.'
        };
      }
      
      // PASO 2: Ejecutar la query
      let sqlData: any[];
      try {
        sqlData = await executeSQL(sqlDecision.sqlQuery);
      } catch (sqlError) {
        return {
          type: 'text',
          content: `❌ Error ejecutando consulta: ${sqlError instanceof Error ? sqlError.message : 'Error desconocido'}`
        };
      }
      
      if (!sqlData || sqlData.length === 0) {
        return {
          type: 'text',
          content: '⚠️ La consulta no devolvió resultados.'
        };
      }
      
      console.log('✅ Datos obtenidos:', sqlData.length, 'filas');
      
      // PASO 3: Gemini decide cómo mostrar los datos
      const repPrompt = `He ejecutado la query y obtuve estos datos:
${JSON.stringify(sqlData.slice(0, 10), null, 2)}
${sqlData.length > 10 ? `\n... y ${sqlData.length - 10} filas más (total: ${sqlData.length})` : ''}

Petición original: "${userRequest}"

Decide cómo mostrar estos datos. Responde SOLO con JSON:

Para TABLA (muchas columnas, datos detallados):
{
  "type": "table",
  "title": "Título descriptivo"
}

Para GRÁFICA (datos agregados, visualización):
{
  "type": "bar" | "line" | "pie" | "area",
  "title": "Título descriptivo",
  "data": [{"name": "...", "value": ...}]
}`;

      const repResult = await chat.sendMessage(repPrompt);
      const repResponse = await repResult.response;
      const repContent = repResponse.text().trim();
      
      console.log('📨 Decisión de representación:', repContent);
      
      let repJsonMatch = repContent.match(/\{[\s\S]*\}/);
      if (!repJsonMatch) {
        const cleaned = repContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        repJsonMatch = cleaned.match(/\{[\s\S]*\}/);
      }
      
      if (!repJsonMatch) {
        // Fallback: mostrar como tabla
        return {
          type: 'table',
          content: {
            type: 'table',
            title: sqlDecision.explanation || 'Resultados de la consulta',
            data: sqlData,
            columns: Object.keys(sqlData[0] || {})
          }
        };
      }
      
      const representation = JSON.parse(repJsonMatch[0]);
      
      // PASO 4: Devolver resultado
      if (representation.type === 'table') {
        console.log('📋 Mostrando como tabla');
        return {
          type: 'table',
          content: {
            type: 'table',
            title: representation.title,
            data: sqlData,
            columns: Object.keys(sqlData[0] || {})
          }
        };
      } else {
        console.log('📊 Mostrando como gráfica:', representation.type);
        
        let chartData = representation.data;
        
        if (!chartData || chartData.length === 0) {
          chartData = sqlData.map(row => {
            const category = row.CATEGORY || row.category || row.NAME || row.name || 'Sin categoría';
            const value = row.VALUE || row.value || row.COUNT || row.count || 0;
            return {
              name: String(category),
              value: Number(value)
            };
          });
        }
        
        return {
          type: 'chart',
          content: {
            type: representation.type,
            title: representation.title,
            data: chartData,
            dataKey: 'value',
            xAxisKey: 'name'
          }
        };
      }
      
    } else {
      // NO es "select ai" → Respuesta conversacional normal
      console.log('💬 Mensaje normal - Respuesta conversacional');
      
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const textContent = response.text().trim();
      
      console.log('📨 Respuesta de Gemini:', textContent);
      
      return {
        type: 'text',
        content: textContent
      };
    }

  } catch (error) {
    console.error('❌ Error en generateResponseWithGemini:', error);
    return {
      type: 'text',
      content: `❌ Hubo un error: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
};
