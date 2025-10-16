NOMBRE BASE DE DATOS = ENFERMEDADESMENTALESDIAGNOSTICO

#    COLUMNA                        TIPO                 NULLABLE  
--------------------------------------------------------------------------------
1    Comunidad Autónoma             VARCHAR2(64)         YES       
2    NOMBRE                         VARCHAR2(64)         YES       
3    FECHA_DE_NACIMIENTO            DATE                 YES       
4    SEXO                           NUMBER               YES       
5    CCAA_RESIDENCIA                VARCHAR2(32767)      YES       
6    FECHA_DE_INGRESO               DATE                 YES       
7    CIRCUNSTANCIA_DE_CONTACTO      NUMBER               YES       
8    FECHA_DE_FIN_CONTACTO          DATE                 YES       
9    TIPO_ALTA                      NUMBER               YES       
10   Estancia Días                  NUMBER               YES       
11   Diagnóstico Principal          VARCHAR2(64)         YES       
12   Categoría                      VARCHAR2(256)        YES       
13   Diagnóstico 2                  VARCHAR2(64)         YES       
14   Diagnóstico 3                  VARCHAR2(64)         YES       
15   Diagnóstico 4                  VARCHAR2(64)         YES       
16   Diagnóstico 5                  VARCHAR2(64)         YES       
17   Diagnóstico 6                  VARCHAR2(64)         YES       
18   Diagnóstico 7                  VARCHAR2(64)         YES       
19   Diagnóstico 8                  VARCHAR2(64)         YES       
20   Diagnóstico 9                  VARCHAR2(64)         YES       
21   Diagnóstico 10                 VARCHAR2(64)         YES       
22   Diagnóstico 11                 VARCHAR2(64)         YES       
23   Diagnóstico 12                 VARCHAR2(64)         YES       
24   Diagnóstico 13                 VARCHAR2(64)         YES       
25   Diagnóstico 14                 VARCHAR2(64)         YES       
26   Fecha de Intervención          VARCHAR2(64)         YES       
27   PROCEDIMIENTO_1                VARCHAR2(64)         YES       
28   PROCEDIMIENTO_2                VARCHAR2(64)         YES       
29   PROCEDIMIENTO_3                VARCHAR2(64)         YES       
30   PROCEDIMIENTO_4                VARCHAR2(64)         YES       
31   PROCEDIMIENTO_5                VARCHAR2(64)         YES       
32   PROCEDIMIENTO_6                VARCHAR2(64)         YES       
33   PROCEDIMIENTO_7                VARCHAR2(64)         YES       
34   PROCEDIMIENTO_8                VARCHAR2(64)         YES       
35   PROCEDIMIENTO_9                VARCHAR2(64)         YES       
36   PROCEDIMIENTO_10               VARCHAR2(64)         YES       
37   PROCEDIMIENTO_11               VARCHAR2(64)         YES       
38   PROCEDIMIENTO_12               VARCHAR2(64)         YES       
39   PROCEDIMIENTO_13               VARCHAR2(64)         YES       
40   PROCEDIMIENTO_14               VARCHAR2(64)         YES       
41   PROCEDIMIENTO_15               VARCHAR2(64)         YES       
42   PROCEDIMIENTO_16               VARCHAR2(64)         YES       
43   PROCEDIMIENTO_17               VARCHAR2(64)         YES       
44   PROCEDIMIENTO_18               VARCHAR2(64)         YES       
45   PROCEDIMIENTO_19               VARCHAR2(64)         YES       
46   PROCEDIMIENTO_20               VARCHAR2(64)         YES       
47   GDR_AP                         VARCHAR2(32767)      YES       
48   CDM_AP                         VARCHAR2(32767)      YES       
49   TIPO_GDR_AP                    VARCHAR2(32767)      YES       
50   Valor Peso Español             VARCHAR2(32767)      YES       
51   GRD_APR                        NUMBER               YES       
52   CDM_APR                        NUMBER               YES       
53   TIPO_GDR_APR                   VARCHAR2(32767)      YES       
54   VALOR_PESO_AMERICANO_APR       VARCHAR2(32767)      YES       
55   NIVEL_SEVERIDAD_APR            NUMBER               YES       
56   RIESGO_MORTALIDAD_APR          NUMBER               YES       
57   SERVICIO                       VARCHAR2(64)         YES       
58   EDAD                           NUMBER               YES       
59   REINGRESO                      VARCHAR2(32767)      YES       
60   COSTE_APR                      NUMBER               YES       
61   GDR_IR                         VARCHAR2(32767)      YES       
62   TIPO_GDR_IR                    VARCHAR2(32767)      YES       
63   TIPO_PROCESO_IR                VARCHAR2(32767)      YES       
64   CIE                            NUMBER               YES       
65   Número de registro anual       NUMBER               YES       
66   CENTRO_RECODIFICADO            VARCHAR2(64)         YES       
67   CIP_SNS_RECODIFICADO           VARCHAR2(64)         YES       
68   País Nacimiento                VARCHAR2(64)         YES       
69   País Residencia                NUMBER               YES       
70   FECHA_DE_INICIO_CONTACTO       VARCHAR2(64)         YES       
71   Régimen Financiación           NUMBER               YES       
72   PROCEDENCIA                    NUMBER               YES       
73   CONTINUIDAD_ASISTENCIAL        NUMBER               YES       
74   INGRESO_EN_UCI                 NUMBER               YES       
75   Días UCI                       NUMBER               YES       
76   Diagnóstico 15                 VARCHAR2(64)         YES       
77   Diagnóstico 16                 VARCHAR2(64)         YES       
78   Diagnóstico 17                 VARCHAR2(64)         YES       
79   Diagnóstico 18                 VARCHAR2(64)         YES       
80   Diagnóstico 19                 VARCHAR2(64)         YES       
81   Diagnóstico 20                 VARCHAR2(64)         YES       
82   POA Diagnóstico Principal      VARCHAR2(64)         YES       
83   POA Diagnóstico 2              VARCHAR2(64)         YES       
84   POA Diagnóstico 3              VARCHAR2(64)         YES       
85   POA Diagnóstico 4              VARCHAR2(64)         YES       
86   POA Diagnóstico 5              VARCHAR2(64)         YES       
87   POA Diagnóstico 6              VARCHAR2(64)         YES       
88   POA Diagnóstico 7              VARCHAR2(64)         YES       
89   POA Diagnóstico 8              VARCHAR2(64)         YES       
90   POA Diagnóstico 9              VARCHAR2(64)         YES       
91   POA Diagnóstico 10             VARCHAR2(64)         YES       
92   POA Diagnóstico 11             VARCHAR2(64)         YES       
93   POA Diagnóstico 12             VARCHAR2(64)         YES       
94   POA Diagnóstico 13             VARCHAR2(64)         YES       
95   POA Diagnóstico 14             VARCHAR2(64)         YES       
96   POA Diagnóstico 15             VARCHAR2(64)         YES       
97   POA Diagnóstico 16             VARCHAR2(64)         YES       
98   POA Diagnóstico 17             VARCHAR2(64)         YES       
99   POA Diagnóstico 18             VARCHAR2(64)         YES       
100  POA Diagnóstico 19             VARCHAR2(64)         YES       
101  POA Diagnóstico 20             VARCHAR2(64)         YES       
102  PROCEDIMIENTO_EXTERNO_1        VARCHAR2(64)         YES       
103  PROCEDIMIENTO_EXTERNO_2        VARCHAR2(64)         YES       
104  PROCEDIMIENTO_EXTERNO_3        VARCHAR2(64)         YES       
105  PROCEDIMIENTO_EXTERNO_4        VARCHAR2(32767)      YES       
106  PROCEDIMIENTO_EXTERNO_5        VARCHAR2(32767)      YES       
107  PROCEDIMIENTO_EXTERNO_6        VARCHAR2(32767)      YES       
108  TIPO_GRD_APR                   VARCHAR2(64)         YES       
109  Peso Español APR               VARCHAR2(64)         YES       
110  EDAD_EN_INGRESO                NUMBER               YES       
111  MES_DE_INGRESO                 VARCHAR2(64)         YES       
