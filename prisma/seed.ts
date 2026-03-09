import {
  PrismaClient,
  InstitutionType,
  UserRole,
  PublicationStatus,
  MeetingStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// SEED MAP: human-readable name -> stable UUID v4
// ============================================================================

const INSTITUTION_IDS = {
  FGV: '4adad6a6-3da9-4125-99d0-1b74b0183d93',
  Insper: '48a25314-da65-49c5-bf90-2448f260c0e1',
  Inteli: '4b7373c6-b31c-4057-8831-67993216e4aa',
  'Col. Mobile': '4c14ec98-1977-424a-9ccf-76f18ab91414',
  'Col. Bandeirantes': '9c00581a-a45f-4a11-98ec-06f47cdb653c',
  'Col. Vertice': '1e3ff18e-6820-4561-98b0-b72f8d38e55d',
};

const COURSE_IDS = {
  FGV_Admin: 'a1000001-0001-4000-8000-000000000001',
  FGV_Economia: 'a1000001-0001-4000-8000-000000000002',
  FGV_Direito: 'a1000001-0001-4000-8000-000000000003',
  Insper_Admin: 'a1000002-0001-4000-8000-000000000001',
  Insper_Economia: 'a1000002-0001-4000-8000-000000000002',
  Insper_Direito: 'a1000002-0001-4000-8000-000000000003',
  Insper_EngComp: 'a1000002-0001-4000-8000-000000000004',
  Insper_EngMec: 'a1000002-0001-4000-8000-000000000005',
  Insper_EngMecatronica: 'a1000002-0001-4000-8000-000000000006',
  Insper_EngProd: 'a1000002-0001-4000-8000-000000000007',
};

// Original 13 subjects
const SUBJECT_IDS = {
  'Calculo I': '1b2e2f5e-7b1d-4b1d-ad34-fcb5993efba5',
  'Direito Constitucional': 'b4eb640d-d749-4f03-8906-dbd912850401',
  Fisica: '05641af4-1929-4086-bbc2-79d59d102b13',
  Redacao: '923b61c1-8672-403b-ad03-4c86a8c93c5e',
  Matematica: '1e3c4dd7-faf9-4a64-bf61-2f7053e24e29',
  'Lingua Portuguesa': '8a541392-4389-4c25-a02d-b73ba9acb52a',
  Biologia: 'c1a9faa7-3607-42d7-bf69-84befb3b07a1',
  Quimica: 'e4ace671-9bbc-4d6a-9d71-295fbf0916dc',
  Historia: '407da995-676b-4bf3-8523-2fe53369b905',
  'Estudos Literarios': 'b4098080-3c12-4d3f-aafd-a2697c922cab',
  Geografia: '7ee1313f-19db-45be-8d0c-0cc6306cfec5',
  Estatistica: '2da9788c-4db3-49db-ba5f-ec38beb0af6c',
  Ingles: '9a3df9fc-aff5-460e-8e84-8f49e66a8d6a',
};

// New university subjects — incrementing UUIDs
const UNI_SUBJECT_IDS: Record<string, string> = {
  // --- FGV Admin ---
  'Introducao a Administracao': 'b0000001-0001-4000-8000-000000000001',
  'Matematica Aplicada': 'b0000001-0001-4000-8000-000000000002',
  'Contabilidade Basica': 'b0000001-0001-4000-8000-000000000003',
  'Economia I': 'b0000001-0001-4000-8000-000000000004',
  'Marketing I': 'b0000001-0001-4000-8000-000000000005',
  'Estatistica Aplicada': 'b0000001-0001-4000-8000-000000000006',
  'Direito Empresarial': 'b0000001-0001-4000-8000-000000000007',
  'Economia II': 'b0000001-0001-4000-8000-000000000008',
  'Financas Corporativas': 'b0000001-0001-4000-8000-000000000009',
  'Gestao de Pessoas': 'b0000001-0001-4000-8000-000000000010',
  'Comportamento Organizacional': 'b0000001-0001-4000-8000-000000000011',
  'Marketing II': 'b0000001-0001-4000-8000-000000000012',
  'Estrategia Empresarial': 'b0000001-0001-4000-8000-000000000013',
  'Operacoes e Logistica': 'b0000001-0001-4000-8000-000000000014',
  'Gestao de Projetos': 'b0000001-0001-4000-8000-000000000015',
  'Contabilidade Gerencial': 'b0000001-0001-4000-8000-000000000016',
  Empreendedorismo: 'b0000001-0001-4000-8000-000000000017',
  'Comercio Internacional': 'b0000001-0001-4000-8000-000000000018',
  'Lideranca e Gestao': 'b0000001-0001-4000-8000-000000000019',
  'Analise de Investimentos': 'b0000001-0001-4000-8000-000000000020',
  'Gestao da Inovacao': 'b0000001-0001-4000-8000-000000000021',
  'Sustentabilidade Corporativa': 'b0000001-0001-4000-8000-000000000022',
  'Negocios Digitais': 'b0000001-0001-4000-8000-000000000023',
  Auditoria: 'b0000001-0001-4000-8000-000000000024',
  'Governanca Corporativa': 'b0000001-0001-4000-8000-000000000025',
  'Fusoes e Aquisicoes': 'b0000001-0001-4000-8000-000000000026',
  'Gestao de Riscos': 'b0000001-0001-4000-8000-000000000027',
  'Consultoria Empresarial': 'b0000001-0001-4000-8000-000000000028',
  'TCC em Administracao': 'b0000001-0001-4000-8000-000000000029',
  'Etica Empresarial': 'b0000001-0001-4000-8000-000000000030',
  'Simulacao Empresarial': 'b0000001-0001-4000-8000-000000000031',
  'Topicos Avancados em Gestao': 'b0000001-0001-4000-8000-000000000032',
  // --- FGV Economia ---
  'Introducao a Economia': 'b0000002-0001-4000-8000-000000000001',
  'Matematica para Economistas I': 'b0000002-0001-4000-8000-000000000002',
  'Historia Economica': 'b0000002-0001-4000-8000-000000000003',
  'Sociologia Economica': 'b0000002-0001-4000-8000-000000000004',
  'Microeconomia I': 'b0000002-0001-4000-8000-000000000005',
  'Macroeconomia I': 'b0000002-0001-4000-8000-000000000006',
  'Estatistica Economica': 'b0000002-0001-4000-8000-000000000007',
  'Matematica para Economistas II': 'b0000002-0001-4000-8000-000000000008',
  'Microeconomia II': 'b0000002-0001-4000-8000-000000000009',
  'Macroeconomia II': 'b0000002-0001-4000-8000-000000000010',
  'Econometria I': 'b0000002-0001-4000-8000-000000000011',
  'Economia Brasileira': 'b0000002-0001-4000-8000-000000000012',
  'Economia Internacional': 'b0000002-0001-4000-8000-000000000013',
  'Economia Monetaria': 'b0000002-0001-4000-8000-000000000014',
  'Econometria II': 'b0000002-0001-4000-8000-000000000015',
  'Economia do Setor Publico': 'b0000002-0001-4000-8000-000000000016',
  'Desenvolvimento Economico': 'b0000002-0001-4000-8000-000000000017',
  'Mercado Financeiro': 'b0000002-0001-4000-8000-000000000018',
  'Economia do Trabalho': 'b0000002-0001-4000-8000-000000000019',
  'Historia do Pensamento Economico': 'b0000002-0001-4000-8000-000000000020',
  'Economia Ambiental': 'b0000002-0001-4000-8000-000000000021',
  'Economia da Tecnologia': 'b0000002-0001-4000-8000-000000000022',
  'Regulacao Economica': 'b0000002-0001-4000-8000-000000000023',
  'Comercio Internacional Econ': 'b0000002-0001-4000-8000-000000000024',
  'Politica Economica': 'b0000002-0001-4000-8000-000000000025',
  'Economia Comportamental': 'b0000002-0001-4000-8000-000000000026',
  'Economia da Saude': 'b0000002-0001-4000-8000-000000000027',
  'Topicos em Microeconomia': 'b0000002-0001-4000-8000-000000000028',
  'TCC em Economia': 'b0000002-0001-4000-8000-000000000029',
  'Economia Politica': 'b0000002-0001-4000-8000-000000000030',
  'Conjuntura Economica': 'b0000002-0001-4000-8000-000000000031',
  'Seminarios Avancados Econ': 'b0000002-0001-4000-8000-000000000032',
  // --- FGV Direito ---
  'Introducao ao Direito': 'b0000003-0001-4000-8000-000000000001',
  'Teoria do Estado': 'b0000003-0001-4000-8000-000000000002',
  'Sociologia Juridica': 'b0000003-0001-4000-8000-000000000003',
  'Historia do Direito': 'b0000003-0001-4000-8000-000000000004',
  'Direito Constitucional I': 'b0000003-0001-4000-8000-000000000005',
  'Direito Civil I': 'b0000003-0001-4000-8000-000000000006',
  'Direito Penal I': 'b0000003-0001-4000-8000-000000000007',
  'Filosofia do Direito': 'b0000003-0001-4000-8000-000000000008',
  'Direito Constitucional II': 'b0000003-0001-4000-8000-000000000009',
  'Direito Civil II': 'b0000003-0001-4000-8000-000000000010',
  'Direito Penal II': 'b0000003-0001-4000-8000-000000000011',
  'Direito Administrativo I': 'b0000003-0001-4000-8000-000000000012',
  'Direito do Trabalho I': 'b0000003-0001-4000-8000-000000000013',
  'Direito Tributario I': 'b0000003-0001-4000-8000-000000000014',
  'Direito Civil III': 'b0000003-0001-4000-8000-000000000015',
  'Direito Administrativo II': 'b0000003-0001-4000-8000-000000000016',
  'Direito Processual Civil I': 'b0000003-0001-4000-8000-000000000017',
  'Direito do Trabalho II': 'b0000003-0001-4000-8000-000000000018',
  'Direito Tributario II': 'b0000003-0001-4000-8000-000000000019',
  'Direito Empresarial I': 'b0000003-0001-4000-8000-000000000020',
  'Direito Processual Civil II': 'b0000003-0001-4000-8000-000000000021',
  'Direito Processual Penal I': 'b0000003-0001-4000-8000-000000000022',
  'Direito Empresarial II': 'b0000003-0001-4000-8000-000000000023',
  'Direito Internacional Publico': 'b0000003-0001-4000-8000-000000000024',
  'Direito Processual Penal II': 'b0000003-0001-4000-8000-000000000025',
  'Direito Ambiental': 'b0000003-0001-4000-8000-000000000026',
  'Direito do Consumidor': 'b0000003-0001-4000-8000-000000000027',
  'Direito Digital': 'b0000003-0001-4000-8000-000000000028',
  'Direito Previdenciario': 'b0000003-0001-4000-8000-000000000029',
  'Pratica Juridica I': 'b0000003-0001-4000-8000-000000000030',
  'Mediacao e Arbitragem': 'b0000003-0001-4000-8000-000000000031',
  'Direitos Humanos': 'b0000003-0001-4000-8000-000000000032',
  'Pratica Juridica II': 'b0000003-0001-4000-8000-000000000033',
  'Etica Profissional': 'b0000003-0001-4000-8000-000000000034',
  'Direito Eleitoral': 'b0000003-0001-4000-8000-000000000035',
  'Topicos Especiais em Direito': 'b0000003-0001-4000-8000-000000000036',
  'TCC em Direito': 'b0000003-0001-4000-8000-000000000037',
  'Pratica Juridica III': 'b0000003-0001-4000-8000-000000000038',
  'Seminarios Avancados Dir': 'b0000003-0001-4000-8000-000000000039',
  'Direito Comparado': 'b0000003-0001-4000-8000-000000000040',
  // --- Insper Admin ---
  'Fundamentos de Administracao': 'b0000004-0001-4000-8000-000000000001',
  'Contabilidade Financeira': 'b0000004-0001-4000-8000-000000000002',
  'Economia de Empresas': 'b0000004-0001-4000-8000-000000000003',
  'Marketing Estrategico': 'b0000004-0001-4000-8000-000000000004',
  'Estatistica para Negocios': 'b0000004-0001-4000-8000-000000000005',
  'Financas I': 'b0000004-0001-4000-8000-000000000006',
  'Financas II': 'b0000004-0001-4000-8000-000000000007',
  'Gestao de Operacoes': 'b0000004-0001-4000-8000-000000000008',
  'Pesquisa de Mercado': 'b0000004-0001-4000-8000-000000000009',
  'Estrategia Competitiva': 'b0000004-0001-4000-8000-000000000010',
  'Contabilidade de Custos': 'b0000004-0001-4000-8000-000000000011',
  'Empreendedorismo e Inovacao': 'b0000004-0001-4000-8000-000000000012',
  'Business Analytics': 'b0000004-0001-4000-8000-000000000013',
  Negociacao: 'b0000004-0001-4000-8000-000000000014',
  'Financas III': 'b0000004-0001-4000-8000-000000000015',
  'Gestao de Tecnologia': 'b0000004-0001-4000-8000-000000000016',
  'Marketing Digital': 'b0000004-0001-4000-8000-000000000017',
  'Supply Chain': 'b0000004-0001-4000-8000-000000000018',
  Lideranca: 'b0000004-0001-4000-8000-000000000019',
  'Gestao Internacional': 'b0000004-0001-4000-8000-000000000020',
  Valuation: 'b0000004-0001-4000-8000-000000000021',
  'Startup Lab': 'b0000004-0001-4000-8000-000000000022',
  'Topicos em Estrategia': 'b0000004-0001-4000-8000-000000000023',
  'TCC Insper': 'b0000004-0001-4000-8000-000000000024',
  'Business Simulation': 'b0000004-0001-4000-8000-000000000025',
  'Etica nos Negocios': 'b0000004-0001-4000-8000-000000000026',
  'Projeto Integrador': 'b0000004-0001-4000-8000-000000000027',
  // --- Insper Economia ---
  'Principios de Economia': 'b0000005-0001-4000-8000-000000000001',
  'Calculo para Economia I': 'b0000005-0001-4000-8000-000000000002',
  'Introducao a Estatistica': 'b0000005-0001-4000-8000-000000000003',
  'Historia Economica Global': 'b0000005-0001-4000-8000-000000000004',
  'Calculo para Economia II': 'b0000005-0001-4000-8000-000000000005',
  'Probabilidade e Estatistica': 'b0000005-0001-4000-8000-000000000006',
  'Economia Monetaria e Financeira': 'b0000005-0001-4000-8000-000000000007',
  'Mercados Financeiros': 'b0000005-0001-4000-8000-000000000008',
  'Game Theory': 'b0000005-0001-4000-8000-000000000009',
  'Economia e Tecnologia': 'b0000005-0001-4000-8000-000000000010',
  'Behavioral Economics': 'b0000005-0001-4000-8000-000000000011',
  'Regulacao e Concorrencia': 'b0000005-0001-4000-8000-000000000012',
  'Data Science para Economia': 'b0000005-0001-4000-8000-000000000013',
  'Politica Economica Brasileira': 'b0000005-0001-4000-8000-000000000014',
  'Health Economics': 'b0000005-0001-4000-8000-000000000015',
  'Environmental Economics': 'b0000005-0001-4000-8000-000000000016',
  'Advanced Microeconomics': 'b0000005-0001-4000-8000-000000000017',
  'TCC Economia Insper': 'b0000005-0001-4000-8000-000000000018',
  'Macroeconomia Avancada': 'b0000005-0001-4000-8000-000000000019',
  'Seminarios Econ Insper': 'b0000005-0001-4000-8000-000000000020',
  'Projeto Final Econ': 'b0000005-0001-4000-8000-000000000021',
  // --- Insper Direito ---
  'Fundamentos do Direito': 'b0000006-0001-4000-8000-000000000001',
  'Teoria Geral do Estado': 'b0000006-0001-4000-8000-000000000002',
  'Logica Juridica': 'b0000006-0001-4000-8000-000000000003',
  'Ciencia Politica': 'b0000006-0001-4000-8000-000000000004',
  'Direito Civil Parte Geral': 'b0000006-0001-4000-8000-000000000005',
  'Teoria do Direito': 'b0000006-0001-4000-8000-000000000006',
  'Direito das Obrigacoes': 'b0000006-0001-4000-8000-000000000007',
  'Direito Administrativo': 'b0000006-0001-4000-8000-000000000008',
  'Direito do Trabalho': 'b0000006-0001-4000-8000-000000000009',
  'Direito Tributario': 'b0000006-0001-4000-8000-000000000010',
  'Direito dos Contratos': 'b0000006-0001-4000-8000-000000000011',
  'Processo Civil I': 'b0000006-0001-4000-8000-000000000012',
  'Processo Civil II': 'b0000006-0001-4000-8000-000000000013',
  'Processo Penal': 'b0000006-0001-4000-8000-000000000014',
  'Direito Digital e Tecnologia': 'b0000006-0001-4000-8000-000000000015',
  'Resolucao de Conflitos': 'b0000006-0001-4000-8000-000000000016',
  'Direito Societario': 'b0000006-0001-4000-8000-000000000017',
  Compliance: 'b0000006-0001-4000-8000-000000000018',
  'Propriedade Intelectual': 'b0000006-0001-4000-8000-000000000019',
  'Clinica Juridica I': 'b0000006-0001-4000-8000-000000000020',
  'Direito Financeiro': 'b0000006-0001-4000-8000-000000000021',
  'Direito da Concorrencia': 'b0000006-0001-4000-8000-000000000022',
  'Clinica Juridica II': 'b0000006-0001-4000-8000-000000000023',
  'Direitos Fundamentais': 'b0000006-0001-4000-8000-000000000024',
  'Pratica Profissional': 'b0000006-0001-4000-8000-000000000025',
  'Direito e Economia': 'b0000006-0001-4000-8000-000000000026',
  'Topicos Avancados Dir Insper': 'b0000006-0001-4000-8000-000000000027',
  'Etica e Deontologia': 'b0000006-0001-4000-8000-000000000028',
  'TCC Direito Insper': 'b0000006-0001-4000-8000-000000000029',
  'Projeto Final Juridico': 'b0000006-0001-4000-8000-000000000030',
  'Seminario de Pesquisa': 'b0000006-0001-4000-8000-000000000031',
  'Direito Global': 'b0000006-0001-4000-8000-000000000032',
  // --- Insper Eng Computacao ---
  'Introducao a Computacao': 'b0000007-0001-4000-8000-000000000001',
  'Algebra Linear': 'b0000007-0001-4000-8000-000000000002',
  'Calculo II': 'b0000007-0001-4000-8000-000000000003',
  'Fisica II': 'b0000007-0001-4000-8000-000000000004',
  'Estrutura de Dados': 'b0000007-0001-4000-8000-000000000005',
  'Programacao Orientada a Objetos': 'b0000007-0001-4000-8000-000000000006',
  'Calculo III': 'b0000007-0001-4000-8000-000000000007',
  'Circuitos Eletricos': 'b0000007-0001-4000-8000-000000000008',
  'Algoritmos Avancados': 'b0000007-0001-4000-8000-000000000009',
  'Banco de Dados': 'b0000007-0001-4000-8000-000000000010',
  'Sinais e Sistemas': 'b0000007-0001-4000-8000-000000000011',
  'Redes de Computadores': 'b0000007-0001-4000-8000-000000000012',
  'Engenharia de Software': 'b0000007-0001-4000-8000-000000000013',
  'Sistemas Operacionais': 'b0000007-0001-4000-8000-000000000014',
  'Inteligencia Artificial': 'b0000007-0001-4000-8000-000000000015',
  'Arquitetura de Computadores': 'b0000007-0001-4000-8000-000000000016',
  Compiladores: 'b0000007-0001-4000-8000-000000000017',
  'Computacao Grafica': 'b0000007-0001-4000-8000-000000000018',
  'Machine Learning': 'b0000007-0001-4000-8000-000000000019',
  'Sistemas Distribuidos': 'b0000007-0001-4000-8000-000000000020',
  'Seguranca da Informacao': 'b0000007-0001-4000-8000-000000000021',
  'Desenvolvimento Web': 'b0000007-0001-4000-8000-000000000022',
  'Deep Learning': 'b0000007-0001-4000-8000-000000000023',
  'Cloud Computing': 'b0000007-0001-4000-8000-000000000024',
  DevOps: 'b0000007-0001-4000-8000-000000000025',
  IoT: 'b0000007-0001-4000-8000-000000000026',
  Robotica: 'b0000007-0001-4000-8000-000000000027',
  'Processamento de Imagens': 'b0000007-0001-4000-8000-000000000028',
  'Projeto de Sistemas': 'b0000007-0001-4000-8000-000000000029',
  Blockchain: 'b0000007-0001-4000-8000-000000000030',
  'Projeto de Graduacao I EC': 'b0000007-0001-4000-8000-000000000031',
  'Topicos em IA': 'b0000007-0001-4000-8000-000000000032',
  'Empreendedorismo Tech': 'b0000007-0001-4000-8000-000000000033',
  'Etica em Tecnologia': 'b0000007-0001-4000-8000-000000000034',
  'TCC Eng Computacao': 'b0000007-0001-4000-8000-000000000035',
  'Projeto de Graduacao II EC': 'b0000007-0001-4000-8000-000000000036',
  'Seminario Final EC': 'b0000007-0001-4000-8000-000000000037',
  'Inovacao EC': 'b0000007-0001-4000-8000-000000000038',
  // --- Insper Eng Mecanica ---
  'Desenho Tecnico': 'b0000008-0001-4000-8000-000000000001',
  'Quimica Geral': 'b0000008-0001-4000-8000-000000000002',
  'Mecanica dos Solidos I': 'b0000008-0001-4000-8000-000000000003',
  'Ciencia dos Materiais': 'b0000008-0001-4000-8000-000000000004',
  Termodinamica: 'b0000008-0001-4000-8000-000000000005',
  'Mecanica dos Solidos II': 'b0000008-0001-4000-8000-000000000006',
  'Mecanica dos Fluidos I': 'b0000008-0001-4000-8000-000000000007',
  'Transferencia de Calor': 'b0000008-0001-4000-8000-000000000008',
  'Mecanica dos Fluidos II': 'b0000008-0001-4000-8000-000000000009',
  'Dinamica de Maquinas': 'b0000008-0001-4000-8000-000000000010',
  'Sistemas de Controle': 'b0000008-0001-4000-8000-000000000011',
  'Elementos de Maquinas': 'b0000008-0001-4000-8000-000000000012',
  'Processos de Fabricacao': 'b0000008-0001-4000-8000-000000000013',
  'Vibracoes Mecanicas': 'b0000008-0001-4000-8000-000000000014',
  'Projeto Mecanico I': 'b0000008-0001-4000-8000-000000000015',
  'Projeto Mecanico II': 'b0000008-0001-4000-8000-000000000016',
  'Automacao Industrial': 'b0000008-0001-4000-8000-000000000017',
  'Mecanica Computacional': 'b0000008-0001-4000-8000-000000000018',
  'Energia e Meio Ambiente': 'b0000008-0001-4000-8000-000000000019',
  'Engenharia Automotiva': 'b0000008-0001-4000-8000-000000000020',
  'Sistemas Termicos': 'b0000008-0001-4000-8000-000000000021',
  'Materiais Avancados': 'b0000008-0001-4000-8000-000000000022',
  'Gestao da Producao': 'b0000008-0001-4000-8000-000000000023',
  'Manutencao Industrial': 'b0000008-0001-4000-8000-000000000024',
  'Engenharia de Qualidade': 'b0000008-0001-4000-8000-000000000025',
  'Projeto Integrado EM': 'b0000008-0001-4000-8000-000000000026',
  'Simulacao Numerica': 'b0000008-0001-4000-8000-000000000027',
  'Projeto de Graduacao I EM': 'b0000008-0001-4000-8000-000000000028',
  'Topicos em Mecanica': 'b0000008-0001-4000-8000-000000000029',
  'Etica em Engenharia': 'b0000008-0001-4000-8000-000000000030',
  'TCC Eng Mecanica': 'b0000008-0001-4000-8000-000000000031',
  'Projeto de Graduacao II EM': 'b0000008-0001-4000-8000-000000000032',
  'Seminario Final EM': 'b0000008-0001-4000-8000-000000000033',
  'Inovacao Industrial': 'b0000008-0001-4000-8000-000000000034',
  // --- Insper Eng Mecatronica ---
  'Introducao a Mecatronica': 'b0000009-0001-4000-8000-000000000001',
  'Logica Digital': 'b0000009-0001-4000-8000-000000000002',
  'Programacao para Engenharia': 'b0000009-0001-4000-8000-000000000003',
  'Eletronica Analogica': 'b0000009-0001-4000-8000-000000000004',
  'Mecanica dos Solidos MT': 'b0000009-0001-4000-8000-000000000005',
  'Eletronica Digital': 'b0000009-0001-4000-8000-000000000006',
  'Controle Automatico I': 'b0000009-0001-4000-8000-000000000007',
  Microcontroladores: 'b0000009-0001-4000-8000-000000000008',
  Instrumentacao: 'b0000009-0001-4000-8000-000000000009',
  'Controle Automatico II': 'b0000009-0001-4000-8000-000000000010',
  'Robotica I': 'b0000009-0001-4000-8000-000000000011',
  'Sistemas Embarcados': 'b0000009-0001-4000-8000-000000000012',
  'Acionamentos Eletricos': 'b0000009-0001-4000-8000-000000000013',
  'Robotica II': 'b0000009-0001-4000-8000-000000000014',
  'Automacao Industrial MT': 'b0000009-0001-4000-8000-000000000015',
  'Processamento de Sinais': 'b0000009-0001-4000-8000-000000000016',
  'Visao Computacional': 'b0000009-0001-4000-8000-000000000017',
  'IA para Engenharia': 'b0000009-0001-4000-8000-000000000018',
  'Sistemas CPS': 'b0000009-0001-4000-8000-000000000019',
  'Manufatura Avancada': 'b0000009-0001-4000-8000-000000000020',
  'IoT Industrial': 'b0000009-0001-4000-8000-000000000021',
  'Projeto Mecatronico': 'b0000009-0001-4000-8000-000000000022',
  'Sistemas de Energia': 'b0000009-0001-4000-8000-000000000023',
  'Controle Robusto': 'b0000009-0001-4000-8000-000000000024',
  'Manutencao Preditiva': 'b0000009-0001-4000-8000-000000000025',
  'Projeto de Graduacao I MT': 'b0000009-0001-4000-8000-000000000026',
  'Topicos em Mecatronica': 'b0000009-0001-4000-8000-000000000027',
  'Empreendedorismo MT': 'b0000009-0001-4000-8000-000000000028',
  'Etica MT': 'b0000009-0001-4000-8000-000000000029',
  'TCC Eng Mecatronica': 'b0000009-0001-4000-8000-000000000030',
  'Projeto de Graduacao II MT': 'b0000009-0001-4000-8000-000000000031',
  'Seminario Final MT': 'b0000009-0001-4000-8000-000000000032',
  'Inovacao MT': 'b0000009-0001-4000-8000-000000000033',
  // --- Insper Eng Producao ---
  'Introducao a Eng de Producao': 'b0000010-0001-4000-8000-000000000001',
  'Economia para Engenheiros': 'b0000010-0001-4000-8000-000000000002',
  'Estatistica para Engenharia': 'b0000010-0001-4000-8000-000000000003',
  'Contabilidade para Engenheiros': 'b0000010-0001-4000-8000-000000000004',
  'Pesquisa Operacional I': 'b0000010-0001-4000-8000-000000000005',
  'Processos Produtivos': 'b0000010-0001-4000-8000-000000000006',
  'Gestao da Qualidade': 'b0000010-0001-4000-8000-000000000007',
  'Engenharia Economica': 'b0000010-0001-4000-8000-000000000008',
  'Pesquisa Operacional II': 'b0000010-0001-4000-8000-000000000009',
  'Planejamento da Producao': 'b0000010-0001-4000-8000-000000000010',
  Logistica: 'b0000010-0001-4000-8000-000000000011',
  'Simulacao de Sistemas': 'b0000010-0001-4000-8000-000000000012',
  Ergonomia: 'b0000010-0001-4000-8000-000000000013',
  'Lean Manufacturing': 'b0000010-0001-4000-8000-000000000014',
  'Gestao de Custos': 'b0000010-0001-4000-8000-000000000015',
  'Supply Chain Management': 'b0000010-0001-4000-8000-000000000016',
  'Gestao da Inovacao EP': 'b0000010-0001-4000-8000-000000000017',
  'Sistemas de Informacao': 'b0000010-0001-4000-8000-000000000018',
  'Engenharia de Sustentabilidade': 'b0000010-0001-4000-8000-000000000019',
  'Business Intelligence': 'b0000010-0001-4000-8000-000000000020',
  'Gestao Estrategica': 'b0000010-0001-4000-8000-000000000021',
  'Startup e Inovacao': 'b0000010-0001-4000-8000-000000000022',
  'Topicos em Producao': 'b0000010-0001-4000-8000-000000000023',
  'Projeto de Fabrica': 'b0000010-0001-4000-8000-000000000024',
  'Consultoria em Producao': 'b0000010-0001-4000-8000-000000000025',
  'Automacao da Producao': 'b0000010-0001-4000-8000-000000000026',
  'Gestao de Pessoas EP': 'b0000010-0001-4000-8000-000000000027',
  'Projeto de Graduacao I EP': 'b0000010-0001-4000-8000-000000000028',
  'Topicos Avancados EP': 'b0000010-0001-4000-8000-000000000029',
  'Empreendedorismo EP': 'b0000010-0001-4000-8000-000000000030',
  'Etica EP': 'b0000010-0001-4000-8000-000000000031',
  'TCC Eng Producao': 'b0000010-0001-4000-8000-000000000032',
  'Projeto de Graduacao II EP': 'b0000010-0001-4000-8000-000000000033',
  'Seminario Final EP': 'b0000010-0001-4000-8000-000000000034',
  'Inovacao EP': 'b0000010-0001-4000-8000-000000000035',
};

// Helper to get any subject ID
function sid(name: string): string {
  return SUBJECT_IDS[name as keyof typeof SUBJECT_IDS] ??
    UNI_SUBJECT_IDS[name] ??
    (() => { throw new Error(`Unknown subject: ${name}`); })();
}

const USER_IDS = {
  Rafael: '7187ab4d-c6a8-4a06-9ee2-e59db62045cb',
  Luiza: '2fce3a4c-7c20-4530-b640-d490a117e17a',
  Carlos: 'eb7ea8bd-28a0-4b44-a47f-7086ce4f82df',
  Mariana: '3adee32b-2c07-4eae-bce2-9bf8d185eb29',
};

const TEACHER_PROFILE_IDS = {
  Rafael: '7dc578fd-7f44-4f88-a779-b629aa07be99',
  Luiza: 'b311b18f-65f3-4c34-9e49-7e8b03436851',
  Carlos: 'b5cea526-d16c-439a-a370-4e9e04a2592f',
  Mariana: '6d29799f-56aa-460c-9920-d2c98693ead2',
};

const STUDENT_USER_IDS = {
  Ana: '5d766713-498b-4025-ac53-fd5911b7547c',
  CarlosAluno: 'e2a3ca98-a44a-4ffb-a48c-5bdd509baa75',
  Beatriz: 'c24a8431-77b8-4269-bd80-50eb750b7a4e',
};

const STUDENT_PROFILE_IDS = {
  Ana: 'fd5093c1-9d6e-467e-a078-baee72fa263a',
  CarlosAluno: 'a8ee6f1c-7469-4a55-a7a0-c693b75a8ec6',
  Beatriz: '04c47eb5-369c-4faa-ae49-cba13ae95b32',
};

const CLASS_EVENT_IDS = {
  'Rafael-Calculo-Insper': 'cd73a92c-5135-4f65-85d9-4c8cb9277567',
  'Rafael-Estatistica-Insper': '7b90da95-3980-4f66-8e7a-b699a2277261',
  'Luiza-DirConst-FGV': 'd1c4f898-cbaa-40db-b33d-07b0d3d6c588',
  'Luiza-Redacao-FGV': 'fcb5f3d4-d295-4eb3-8de6-b6e07cdbfaa8',
  'Carlos-Matematica-Mobile': '07d0f628-31e2-430a-ab6c-0c9296147c29',
  'Carlos-Fisica-Bandeirantes': '2814c296-099d-471a-8155-8ccdd2b7e0ac',
  'Mariana-Calculo-Inteli': '68526fe8-b21d-47f7-bb3c-c03ec46c7e8b',
  'Mariana-Fisica-Insper': '16bb8fc4-81c7-4b0e-a458-462498dcddc4',
};

// ============================================================================
// INSTITUTIONS
// ============================================================================

const institutions = [
  { id: INSTITUTION_IDS.FGV, name: 'Fundacao Getulio Vargas', shortName: 'FGV', city: 'Sao Paulo', type: 'UNIVERSITY' as InstitutionType, logoUrl: '/imgs/faculdades/fgv-logo-0.png', isEnabled: true },
  { id: INSTITUTION_IDS.Insper, name: 'Insper Instituto de Ensino e Pesquisa', shortName: 'Insper', city: 'Sao Paulo', type: 'UNIVERSITY' as InstitutionType, logoUrl: '/imgs/faculdades/INsper.png', isEnabled: true },
  { id: INSTITUTION_IDS.Inteli, name: 'Inteli - Instituto de Tecnologia e Lideranca', shortName: 'Inteli', city: 'Sao Paulo', type: 'UNIVERSITY' as InstitutionType, logoUrl: '/imgs/faculdades/inteli-logo.png', isEnabled: false },
  { id: INSTITUTION_IDS['Col. Mobile'], name: 'Colegio Mobile', shortName: 'Mobile', city: 'Sao Paulo', type: 'SCHOOL' as InstitutionType, logoUrl: '/imgs/escolas/mobile.png', isEnabled: true },
  { id: INSTITUTION_IDS['Col. Bandeirantes'], name: 'Colegio Bandeirantes', shortName: 'Band', city: 'Sao Paulo', type: 'SCHOOL' as InstitutionType, logoUrl: '/imgs/escolas/Band-logo.jpg', isEnabled: true },
  { id: INSTITUTION_IDS['Col. Vertice'], name: 'Colegio Vertice', shortName: 'Vertice', city: 'Sao Paulo', type: 'SCHOOL' as InstitutionType, logoUrl: '/imgs/escolas/vertice.png', isEnabled: true },
];

// ============================================================================
// SUBJECTS — original 13 + all new university subjects
// ============================================================================

const originalSubjects = [
  { id: SUBJECT_IDS['Calculo I'], name: 'Calculo I', icon: 'Sigma' },
  { id: SUBJECT_IDS['Direito Constitucional'], name: 'Direito Constitucional', icon: 'Scale' },
  { id: SUBJECT_IDS.Fisica, name: 'Fisica', icon: 'Atom' },
  { id: SUBJECT_IDS.Redacao, name: 'Redacao', icon: 'PenLine' },
  { id: SUBJECT_IDS.Matematica, name: 'Matematica', icon: 'Sigma' },
  { id: SUBJECT_IDS['Lingua Portuguesa'], name: 'Lingua Portuguesa', icon: 'BookOpen' },
  { id: SUBJECT_IDS.Biologia, name: 'Biologia', icon: 'Dna' },
  { id: SUBJECT_IDS.Quimica, name: 'Quimica', icon: 'FlaskConical' },
  { id: SUBJECT_IDS.Historia, name: 'Historia', icon: 'Landmark' },
  { id: SUBJECT_IDS['Estudos Literarios'], name: 'Estudos Literarios', icon: 'BookMarked' },
  { id: SUBJECT_IDS.Geografia, name: 'Geografia', icon: 'Globe' },
  { id: SUBJECT_IDS.Estatistica, name: 'Estatistica', icon: 'BarChart3' },
  { id: SUBJECT_IDS.Ingles, name: 'Ingles', icon: 'Languages' },
];

// All new university subjects — map from UNI_SUBJECT_IDS
const uniSubjectDefs: Array<{ name: string; icon: string }> = [
  // FGV Admin
  { name: 'Introducao a Administracao', icon: 'Briefcase' }, { name: 'Matematica Aplicada', icon: 'Calculator' },
  { name: 'Contabilidade Basica', icon: 'Receipt' }, { name: 'Economia I', icon: 'TrendingUp' },
  { name: 'Marketing I', icon: 'Megaphone' }, { name: 'Estatistica Aplicada', icon: 'BarChart3' },
  { name: 'Direito Empresarial', icon: 'Scale' }, { name: 'Economia II', icon: 'TrendingUp' },
  { name: 'Financas Corporativas', icon: 'DollarSign' }, { name: 'Gestao de Pessoas', icon: 'Users' },
  { name: 'Comportamento Organizacional', icon: 'Brain' }, { name: 'Marketing II', icon: 'Target' },
  { name: 'Estrategia Empresarial', icon: 'Compass' }, { name: 'Operacoes e Logistica', icon: 'Truck' },
  { name: 'Gestao de Projetos', icon: 'ClipboardList' }, { name: 'Contabilidade Gerencial', icon: 'Calculator' },
  { name: 'Empreendedorismo', icon: 'Rocket' }, { name: 'Comercio Internacional', icon: 'Globe' },
  { name: 'Lideranca e Gestao', icon: 'Crown' }, { name: 'Analise de Investimentos', icon: 'LineChart' },
  { name: 'Gestao da Inovacao', icon: 'Lightbulb' }, { name: 'Sustentabilidade Corporativa', icon: 'Leaf' },
  { name: 'Negocios Digitais', icon: 'Laptop' }, { name: 'Auditoria', icon: 'Search' },
  { name: 'Governanca Corporativa', icon: 'Building2' }, { name: 'Fusoes e Aquisicoes', icon: 'Handshake' },
  { name: 'Gestao de Riscos', icon: 'ShieldAlert' }, { name: 'Consultoria Empresarial', icon: 'MessageSquare' },
  { name: 'TCC em Administracao', icon: 'GraduationCap' }, { name: 'Etica Empresarial', icon: 'Heart' },
  { name: 'Simulacao Empresarial', icon: 'Gamepad2' }, { name: 'Topicos Avancados em Gestao', icon: 'BookOpen' },
  // FGV Economia
  { name: 'Introducao a Economia', icon: 'TrendingUp' }, { name: 'Matematica para Economistas I', icon: 'Calculator' },
  { name: 'Historia Economica', icon: 'Landmark' }, { name: 'Sociologia Economica', icon: 'Users' },
  { name: 'Microeconomia I', icon: 'PieChart' }, { name: 'Macroeconomia I', icon: 'Globe' },
  { name: 'Estatistica Economica', icon: 'BarChart3' }, { name: 'Matematica para Economistas II', icon: 'Calculator' },
  { name: 'Microeconomia II', icon: 'PieChart' }, { name: 'Macroeconomia II', icon: 'Globe' },
  { name: 'Econometria I', icon: 'LineChart' }, { name: 'Economia Brasileira', icon: 'MapPin' },
  { name: 'Economia Internacional', icon: 'Globe' }, { name: 'Economia Monetaria', icon: 'Coins' },
  { name: 'Econometria II', icon: 'LineChart' }, { name: 'Economia do Setor Publico', icon: 'Building2' },
  { name: 'Desenvolvimento Economico', icon: 'Sprout' }, { name: 'Mercado Financeiro', icon: 'CandlestickChart' },
  { name: 'Economia do Trabalho', icon: 'Briefcase' }, { name: 'Historia do Pensamento Economico', icon: 'BookOpen' },
  { name: 'Economia Ambiental', icon: 'Leaf' }, { name: 'Economia da Tecnologia', icon: 'Cpu' },
  { name: 'Regulacao Economica', icon: 'Gavel' }, { name: 'Comercio Internacional Econ', icon: 'Ship' },
  { name: 'Politica Economica', icon: 'Landmark' }, { name: 'Economia Comportamental', icon: 'Brain' },
  { name: 'Economia da Saude', icon: 'HeartPulse' }, { name: 'Topicos em Microeconomia', icon: 'Microscope' },
  { name: 'TCC em Economia', icon: 'GraduationCap' }, { name: 'Economia Politica', icon: 'Scale' },
  { name: 'Conjuntura Economica', icon: 'Newspaper' }, { name: 'Seminarios Avancados Econ', icon: 'Presentation' },
  // FGV Direito
  { name: 'Introducao ao Direito', icon: 'BookOpen' }, { name: 'Teoria do Estado', icon: 'Landmark' },
  { name: 'Sociologia Juridica', icon: 'Users' }, { name: 'Historia do Direito', icon: 'ScrollText' },
  { name: 'Direito Constitucional I', icon: 'Scale' }, { name: 'Direito Civil I', icon: 'FileText' },
  { name: 'Direito Penal I', icon: 'Gavel' }, { name: 'Filosofia do Direito', icon: 'Brain' },
  { name: 'Direito Constitucional II', icon: 'Scale' }, { name: 'Direito Civil II', icon: 'FileText' },
  { name: 'Direito Penal II', icon: 'Gavel' }, { name: 'Direito Administrativo I', icon: 'Building2' },
  { name: 'Direito do Trabalho I', icon: 'Briefcase' }, { name: 'Direito Tributario I', icon: 'Receipt' },
  { name: 'Direito Civil III', icon: 'FileText' }, { name: 'Direito Administrativo II', icon: 'Building2' },
  { name: 'Direito Processual Civil I', icon: 'Hammer' }, { name: 'Direito do Trabalho II', icon: 'Briefcase' },
  { name: 'Direito Tributario II', icon: 'Receipt' }, { name: 'Direito Empresarial I', icon: 'Building' },
  { name: 'Direito Processual Civil II', icon: 'Hammer' }, { name: 'Direito Processual Penal I', icon: 'ShieldAlert' },
  { name: 'Direito Empresarial II', icon: 'Building' }, { name: 'Direito Internacional Publico', icon: 'Globe' },
  { name: 'Direito Processual Penal II', icon: 'ShieldAlert' }, { name: 'Direito Ambiental', icon: 'Leaf' },
  { name: 'Direito do Consumidor', icon: 'ShoppingCart' }, { name: 'Direito Digital', icon: 'Laptop' },
  { name: 'Direito Previdenciario', icon: 'Umbrella' }, { name: 'Pratica Juridica I', icon: 'Scale' },
  { name: 'Mediacao e Arbitragem', icon: 'Handshake' }, { name: 'Direitos Humanos', icon: 'Heart' },
  { name: 'Pratica Juridica II', icon: 'Scale' }, { name: 'Etica Profissional', icon: 'Award' },
  { name: 'Direito Eleitoral', icon: 'Vote' }, { name: 'Topicos Especiais em Direito', icon: 'Bookmark' },
  { name: 'TCC em Direito', icon: 'GraduationCap' }, { name: 'Pratica Juridica III', icon: 'Scale' },
  { name: 'Seminarios Avancados Dir', icon: 'Presentation' }, { name: 'Direito Comparado', icon: 'Globe' },
  // Insper Admin
  { name: 'Fundamentos de Administracao', icon: 'Briefcase' }, { name: 'Contabilidade Financeira', icon: 'Receipt' },
  { name: 'Economia de Empresas', icon: 'TrendingUp' }, { name: 'Marketing Estrategico', icon: 'Target' },
  { name: 'Estatistica para Negocios', icon: 'BarChart3' }, { name: 'Financas I', icon: 'DollarSign' },
  { name: 'Financas II', icon: 'DollarSign' }, { name: 'Gestao de Operacoes', icon: 'Settings' },
  { name: 'Pesquisa de Mercado', icon: 'Search' }, { name: 'Estrategia Competitiva', icon: 'Compass' },
  { name: 'Contabilidade de Custos', icon: 'Calculator' }, { name: 'Empreendedorismo e Inovacao', icon: 'Rocket' },
  { name: 'Business Analytics', icon: 'Database' }, { name: 'Negociacao', icon: 'Handshake' },
  { name: 'Financas III', icon: 'LineChart' }, { name: 'Gestao de Tecnologia', icon: 'Cpu' },
  { name: 'Marketing Digital', icon: 'Smartphone' }, { name: 'Supply Chain', icon: 'Truck' },
  { name: 'Lideranca', icon: 'Crown' }, { name: 'Gestao Internacional', icon: 'Globe' },
  { name: 'Valuation', icon: 'TrendingUp' }, { name: 'Startup Lab', icon: 'Zap' },
  { name: 'Topicos em Estrategia', icon: 'Compass' }, { name: 'TCC Insper', icon: 'GraduationCap' },
  { name: 'Business Simulation', icon: 'Gamepad2' }, { name: 'Etica nos Negocios', icon: 'Heart' },
  { name: 'Projeto Integrador', icon: 'Puzzle' },
  // Insper Economia
  { name: 'Principios de Economia', icon: 'TrendingUp' }, { name: 'Calculo para Economia I', icon: 'Sigma' },
  { name: 'Introducao a Estatistica', icon: 'BarChart3' }, { name: 'Historia Economica Global', icon: 'Landmark' },
  { name: 'Calculo para Economia II', icon: 'Sigma' }, { name: 'Probabilidade e Estatistica', icon: 'Dice' },
  { name: 'Economia Monetaria e Financeira', icon: 'Coins' }, { name: 'Mercados Financeiros', icon: 'CandlestickChart' },
  { name: 'Game Theory', icon: 'Gamepad2' }, { name: 'Economia e Tecnologia', icon: 'Cpu' },
  { name: 'Behavioral Economics', icon: 'Brain' }, { name: 'Regulacao e Concorrencia', icon: 'Gavel' },
  { name: 'Data Science para Economia', icon: 'Database' }, { name: 'Politica Economica Brasileira', icon: 'Landmark' },
  { name: 'Health Economics', icon: 'HeartPulse' }, { name: 'Environmental Economics', icon: 'Leaf' },
  { name: 'Advanced Microeconomics', icon: 'Microscope' }, { name: 'TCC Economia Insper', icon: 'GraduationCap' },
  { name: 'Macroeconomia Avancada', icon: 'Globe' }, { name: 'Seminarios Econ Insper', icon: 'Presentation' },
  { name: 'Projeto Final Econ', icon: 'Puzzle' },
  // Insper Direito
  { name: 'Fundamentos do Direito', icon: 'BookOpen' }, { name: 'Teoria Geral do Estado', icon: 'Landmark' },
  { name: 'Logica Juridica', icon: 'Brain' }, { name: 'Ciencia Politica', icon: 'Vote' },
  { name: 'Direito Civil Parte Geral', icon: 'FileText' }, { name: 'Teoria do Direito', icon: 'BookOpen' },
  { name: 'Direito das Obrigacoes', icon: 'FileText' }, { name: 'Direito Administrativo', icon: 'Building2' },
  { name: 'Direito do Trabalho', icon: 'Briefcase' }, { name: 'Direito Tributario', icon: 'Receipt' },
  { name: 'Direito dos Contratos', icon: 'FileText' }, { name: 'Processo Civil I', icon: 'Hammer' },
  { name: 'Processo Civil II', icon: 'Hammer' }, { name: 'Processo Penal', icon: 'ShieldAlert' },
  { name: 'Direito Digital e Tecnologia', icon: 'Laptop' }, { name: 'Resolucao de Conflitos', icon: 'Handshake' },
  { name: 'Direito Societario', icon: 'Building2' }, { name: 'Compliance', icon: 'ShieldCheck' },
  { name: 'Propriedade Intelectual', icon: 'Lightbulb' }, { name: 'Clinica Juridica I', icon: 'Stethoscope' },
  { name: 'Direito Financeiro', icon: 'DollarSign' }, { name: 'Direito da Concorrencia', icon: 'Gavel' },
  { name: 'Clinica Juridica II', icon: 'Stethoscope' }, { name: 'Direitos Fundamentais', icon: 'Heart' },
  { name: 'Pratica Profissional', icon: 'Briefcase' }, { name: 'Direito e Economia', icon: 'TrendingUp' },
  { name: 'Topicos Avancados Dir Insper', icon: 'Bookmark' }, { name: 'Etica e Deontologia', icon: 'Award' },
  { name: 'TCC Direito Insper', icon: 'GraduationCap' }, { name: 'Projeto Final Juridico', icon: 'Puzzle' },
  { name: 'Seminario de Pesquisa', icon: 'Presentation' }, { name: 'Direito Global', icon: 'Globe' },
  // Insper Eng Computacao
  { name: 'Introducao a Computacao', icon: 'Monitor' }, { name: 'Algebra Linear', icon: 'Grid3x3' },
  { name: 'Calculo II', icon: 'Sigma' }, { name: 'Fisica II', icon: 'Atom' },
  { name: 'Estrutura de Dados', icon: 'Database' }, { name: 'Programacao Orientada a Objetos', icon: 'Code' },
  { name: 'Calculo III', icon: 'Sigma' }, { name: 'Circuitos Eletricos', icon: 'Zap' },
  { name: 'Algoritmos Avancados', icon: 'Binary' }, { name: 'Banco de Dados', icon: 'Database' },
  { name: 'Sinais e Sistemas', icon: 'Activity' }, { name: 'Redes de Computadores', icon: 'Network' },
  { name: 'Engenharia de Software', icon: 'Code' }, { name: 'Sistemas Operacionais', icon: 'Terminal' },
  { name: 'Inteligencia Artificial', icon: 'Brain' }, { name: 'Arquitetura de Computadores', icon: 'Cpu' },
  { name: 'Compiladores', icon: 'FileCode' }, { name: 'Computacao Grafica', icon: 'Monitor' },
  { name: 'Machine Learning', icon: 'Brain' }, { name: 'Sistemas Distribuidos', icon: 'Cloud' },
  { name: 'Seguranca da Informacao', icon: 'Shield' }, { name: 'Desenvolvimento Web', icon: 'Globe' },
  { name: 'Deep Learning', icon: 'Brain' }, { name: 'Cloud Computing', icon: 'Cloud' },
  { name: 'DevOps', icon: 'Settings' }, { name: 'IoT', icon: 'Wifi' },
  { name: 'Robotica', icon: 'Bot' }, { name: 'Processamento de Imagens', icon: 'Image' },
  { name: 'Projeto de Sistemas', icon: 'Layout' }, { name: 'Blockchain', icon: 'Link' },
  { name: 'Projeto de Graduacao I EC', icon: 'Wrench' }, { name: 'Topicos em IA', icon: 'Sparkles' },
  { name: 'Empreendedorismo Tech', icon: 'Rocket' }, { name: 'Etica em Tecnologia', icon: 'Heart' },
  { name: 'TCC Eng Computacao', icon: 'GraduationCap' }, { name: 'Projeto de Graduacao II EC', icon: 'Wrench' },
  { name: 'Seminario Final EC', icon: 'Presentation' }, { name: 'Inovacao EC', icon: 'Lightbulb' },
  // Insper Eng Mecanica
  { name: 'Desenho Tecnico', icon: 'Pencil' }, { name: 'Quimica Geral', icon: 'FlaskConical' },
  { name: 'Mecanica dos Solidos I', icon: 'Hammer' }, { name: 'Ciencia dos Materiais', icon: 'Layers' },
  { name: 'Termodinamica', icon: 'Thermometer' }, { name: 'Mecanica dos Solidos II', icon: 'Hammer' },
  { name: 'Mecanica dos Fluidos I', icon: 'Waves' }, { name: 'Transferencia de Calor', icon: 'Flame' },
  { name: 'Mecanica dos Fluidos II', icon: 'Waves' }, { name: 'Dinamica de Maquinas', icon: 'Cog' },
  { name: 'Sistemas de Controle', icon: 'Gauge' }, { name: 'Elementos de Maquinas', icon: 'Wrench' },
  { name: 'Processos de Fabricacao', icon: 'Factory' }, { name: 'Vibracoes Mecanicas', icon: 'Activity' },
  { name: 'Projeto Mecanico I', icon: 'Ruler' }, { name: 'Projeto Mecanico II', icon: 'Ruler' },
  { name: 'Automacao Industrial', icon: 'Bot' }, { name: 'Mecanica Computacional', icon: 'Monitor' },
  { name: 'Energia e Meio Ambiente', icon: 'Leaf' }, { name: 'Engenharia Automotiva', icon: 'Car' },
  { name: 'Sistemas Termicos', icon: 'Thermometer' }, { name: 'Materiais Avancados', icon: 'Layers' },
  { name: 'Gestao da Producao', icon: 'ClipboardList' }, { name: 'Manutencao Industrial', icon: 'Wrench' },
  { name: 'Engenharia de Qualidade', icon: 'CheckCircle' }, { name: 'Projeto Integrado EM', icon: 'Layout' },
  { name: 'Simulacao Numerica', icon: 'Calculator' }, { name: 'Projeto de Graduacao I EM', icon: 'Wrench' },
  { name: 'Topicos em Mecanica', icon: 'Cog' }, { name: 'Etica em Engenharia', icon: 'Heart' },
  { name: 'TCC Eng Mecanica', icon: 'GraduationCap' }, { name: 'Projeto de Graduacao II EM', icon: 'Wrench' },
  { name: 'Seminario Final EM', icon: 'Presentation' }, { name: 'Inovacao Industrial', icon: 'Lightbulb' },
  // Insper Eng Mecatronica
  { name: 'Introducao a Mecatronica', icon: 'Bot' }, { name: 'Logica Digital', icon: 'Binary' },
  { name: 'Programacao para Engenharia', icon: 'Code' }, { name: 'Eletronica Analogica', icon: 'Radio' },
  { name: 'Mecanica dos Solidos MT', icon: 'Hammer' }, { name: 'Eletronica Digital', icon: 'Cpu' },
  { name: 'Controle Automatico I', icon: 'Gauge' }, { name: 'Microcontroladores', icon: 'Chip' },
  { name: 'Instrumentacao', icon: 'Microscope' }, { name: 'Controle Automatico II', icon: 'Gauge' },
  { name: 'Robotica I', icon: 'Bot' }, { name: 'Sistemas Embarcados', icon: 'Cpu' },
  { name: 'Acionamentos Eletricos', icon: 'Zap' }, { name: 'Robotica II', icon: 'Bot' },
  { name: 'Automacao Industrial MT', icon: 'Factory' }, { name: 'Processamento de Sinais', icon: 'Activity' },
  { name: 'Visao Computacional', icon: 'Eye' }, { name: 'IA para Engenharia', icon: 'Brain' },
  { name: 'Sistemas CPS', icon: 'Network' }, { name: 'Manufatura Avancada', icon: 'Factory' },
  { name: 'IoT Industrial', icon: 'Wifi' }, { name: 'Projeto Mecatronico', icon: 'Layout' },
  { name: 'Sistemas de Energia', icon: 'Battery' }, { name: 'Controle Robusto', icon: 'ShieldCheck' },
  { name: 'Manutencao Preditiva', icon: 'Search' }, { name: 'Projeto de Graduacao I MT', icon: 'Wrench' },
  { name: 'Topicos em Mecatronica', icon: 'Bot' }, { name: 'Empreendedorismo MT', icon: 'Rocket' },
  { name: 'Etica MT', icon: 'Heart' }, { name: 'TCC Eng Mecatronica', icon: 'GraduationCap' },
  { name: 'Projeto de Graduacao II MT', icon: 'Wrench' }, { name: 'Seminario Final MT', icon: 'Presentation' },
  { name: 'Inovacao MT', icon: 'Lightbulb' },
  // Insper Eng Producao
  { name: 'Introducao a Eng de Producao', icon: 'ClipboardList' }, { name: 'Economia para Engenheiros', icon: 'TrendingUp' },
  { name: 'Estatistica para Engenharia', icon: 'BarChart3' }, { name: 'Contabilidade para Engenheiros', icon: 'Receipt' },
  { name: 'Pesquisa Operacional I', icon: 'Calculator' }, { name: 'Processos Produtivos', icon: 'Factory' },
  { name: 'Gestao da Qualidade', icon: 'CheckCircle' }, { name: 'Engenharia Economica', icon: 'DollarSign' },
  { name: 'Pesquisa Operacional II', icon: 'Calculator' }, { name: 'Planejamento da Producao', icon: 'Calendar' },
  { name: 'Logistica', icon: 'Truck' }, { name: 'Simulacao de Sistemas', icon: 'Monitor' },
  { name: 'Ergonomia', icon: 'User' }, { name: 'Lean Manufacturing', icon: 'Zap' },
  { name: 'Gestao de Custos', icon: 'DollarSign' }, { name: 'Supply Chain Management', icon: 'Truck' },
  { name: 'Gestao da Inovacao EP', icon: 'Lightbulb' }, { name: 'Sistemas de Informacao', icon: 'Database' },
  { name: 'Engenharia de Sustentabilidade', icon: 'Leaf' }, { name: 'Business Intelligence', icon: 'BarChart3' },
  { name: 'Gestao Estrategica', icon: 'Compass' }, { name: 'Startup e Inovacao', icon: 'Rocket' },
  { name: 'Topicos em Producao', icon: 'Factory' }, { name: 'Projeto de Fabrica', icon: 'Building' },
  { name: 'Consultoria em Producao', icon: 'MessageSquare' }, { name: 'Automacao da Producao', icon: 'Bot' },
  { name: 'Gestao de Pessoas EP', icon: 'Users' }, { name: 'Projeto de Graduacao I EP', icon: 'Wrench' },
  { name: 'Topicos Avancados EP', icon: 'BookOpen' }, { name: 'Empreendedorismo EP', icon: 'Rocket' },
  { name: 'Etica EP', icon: 'Heart' }, { name: 'TCC Eng Producao', icon: 'GraduationCap' },
  { name: 'Projeto de Graduacao II EP', icon: 'Wrench' }, { name: 'Seminario Final EP', icon: 'Presentation' },
  { name: 'Inovacao EP', icon: 'Lightbulb' },
];

const allSubjects = [
  ...originalSubjects,
  ...uniSubjectDefs.map((s) => ({ id: UNI_SUBJECT_IDS[s.name], name: s.name, icon: s.icon })),
];

// ============================================================================
// COURSES
// ============================================================================

const courses = [
  { id: COURSE_IDS.FGV_Admin, institutionId: INSTITUTION_IDS.FGV, name: 'Administracao', slug: 'administracao', displayOrder: 1 },
  { id: COURSE_IDS.FGV_Economia, institutionId: INSTITUTION_IDS.FGV, name: 'Economia', slug: 'economia', displayOrder: 2 },
  { id: COURSE_IDS.FGV_Direito, institutionId: INSTITUTION_IDS.FGV, name: 'Direito', slug: 'direito', displayOrder: 3 },
  { id: COURSE_IDS.Insper_Admin, institutionId: INSTITUTION_IDS.Insper, name: 'Administracao', slug: 'administracao', displayOrder: 1 },
  { id: COURSE_IDS.Insper_Economia, institutionId: INSTITUTION_IDS.Insper, name: 'Economia', slug: 'economia', displayOrder: 2 },
  { id: COURSE_IDS.Insper_Direito, institutionId: INSTITUTION_IDS.Insper, name: 'Direito', slug: 'direito', displayOrder: 3 },
  { id: COURSE_IDS.Insper_EngComp, institutionId: INSTITUTION_IDS.Insper, name: 'Engenharia de Computacao', slug: 'eng-computacao', displayOrder: 4 },
  { id: COURSE_IDS.Insper_EngMec, institutionId: INSTITUTION_IDS.Insper, name: 'Engenharia Mecanica', slug: 'eng-mecanica', displayOrder: 5 },
  { id: COURSE_IDS.Insper_EngMecatronica, institutionId: INSTITUTION_IDS.Insper, name: 'Engenharia Mecatronica', slug: 'eng-mecatronica', displayOrder: 6 },
  { id: COURSE_IDS.Insper_EngProd, institutionId: INSTITUTION_IDS.Insper, name: 'Engenharia de Producao', slug: 'eng-producao', displayOrder: 7 },
];

// ============================================================================
// INSTITUTION-SUBJECT ASSOCIATIONS
// Helper to generate deterministic UUIDs for junction rows
// ============================================================================

let isCounter = 0;
function nextIsId(): string {
  isCounter++;
  const hex = isCounter.toString(16).padStart(12, '0');
  return `c0000000-0000-4000-8000-${hex}`;
}

type ISRow = { id: string; institutionId: string; subjectId: string; courseId: string | null; yearLabel: string; yearOrder: number };

function courseSemesters(instId: string, courseId: string, semesters: string[][]): ISRow[] {
  const rows: ISRow[] = [];
  semesters.forEach((subjects, i) => {
    const sem = i + 1;
    for (const name of subjects) {
      rows.push({
        id: nextIsId(),
        institutionId: instId,
        subjectId: sid(name),
        courseId,
        yearLabel: `Semestre ${sem}`,
        yearOrder: sem,
      });
    }
  });
  return rows;
}

function schoolYear(instId: string, yearOrder: number, subjects: string[]): ISRow[] {
  return subjects.map((name) => ({
    id: nextIsId(),
    institutionId: instId,
    subjectId: sid(name),
    courseId: null,
    yearLabel: `${yearOrder}o Ano`,
    yearOrder,
  }));
}

const institutionSubjects: ISRow[] = [
  // === Schools ===
  // Col. Mobile
  ...schoolYear(INSTITUTION_IDS['Col. Mobile'], 1, ['Matematica', 'Lingua Portuguesa', 'Biologia', 'Fisica', 'Historia', 'Ingles']),
  ...schoolYear(INSTITUTION_IDS['Col. Mobile'], 2, ['Matematica', 'Lingua Portuguesa', 'Quimica', 'Fisica', 'Estudos Literarios', 'Geografia']),
  ...schoolYear(INSTITUTION_IDS['Col. Mobile'], 3, ['Matematica', 'Redacao', 'Quimica', 'Biologia', 'Fisica', 'Historia']),
  // Col. Bandeirantes
  ...schoolYear(INSTITUTION_IDS['Col. Bandeirantes'], 1, ['Matematica', 'Fisica', 'Lingua Portuguesa']),
  ...schoolYear(INSTITUTION_IDS['Col. Bandeirantes'], 2, ['Quimica', 'Matematica', 'Biologia']),
  ...schoolYear(INSTITUTION_IDS['Col. Bandeirantes'], 3, ['Redacao', 'Fisica', 'Matematica']),
  // Col. Vertice
  ...schoolYear(INSTITUTION_IDS['Col. Vertice'], 1, ['Matematica', 'Lingua Portuguesa']),
  ...schoolYear(INSTITUTION_IDS['Col. Vertice'], 2, ['Quimica', 'Fisica']),
  ...schoolYear(INSTITUTION_IDS['Col. Vertice'], 3, ['Redacao', 'Matematica']),

  // === FGV Admin (8 semesters) ===
  ...courseSemesters(INSTITUTION_IDS.FGV, COURSE_IDS.FGV_Admin, [
    ['Introducao a Administracao', 'Matematica Aplicada', 'Contabilidade Basica', 'Economia I'],
    ['Marketing I', 'Estatistica Aplicada', 'Direito Empresarial', 'Economia II'],
    ['Financas Corporativas', 'Gestao de Pessoas', 'Comportamento Organizacional', 'Marketing II'],
    ['Estrategia Empresarial', 'Operacoes e Logistica', 'Gestao de Projetos', 'Contabilidade Gerencial'],
    ['Empreendedorismo', 'Comercio Internacional', 'Lideranca e Gestao', 'Analise de Investimentos'],
    ['Gestao da Inovacao', 'Sustentabilidade Corporativa', 'Negocios Digitais', 'Auditoria'],
    ['Governanca Corporativa', 'Fusoes e Aquisicoes', 'Gestao de Riscos', 'Consultoria Empresarial'],
    ['TCC em Administracao', 'Etica Empresarial', 'Simulacao Empresarial', 'Topicos Avancados em Gestao'],
  ]),

  // === FGV Economia (8 semesters) ===
  ...courseSemesters(INSTITUTION_IDS.FGV, COURSE_IDS.FGV_Economia, [
    ['Introducao a Economia', 'Matematica para Economistas I', 'Historia Economica', 'Sociologia Economica'],
    ['Microeconomia I', 'Macroeconomia I', 'Estatistica Economica', 'Matematica para Economistas II'],
    ['Microeconomia II', 'Macroeconomia II', 'Econometria I', 'Economia Brasileira'],
    ['Economia Internacional', 'Economia Monetaria', 'Econometria II', 'Economia do Setor Publico'],
    ['Desenvolvimento Economico', 'Mercado Financeiro', 'Economia do Trabalho', 'Historia do Pensamento Economico'],
    ['Economia Ambiental', 'Economia da Tecnologia', 'Regulacao Economica', 'Comercio Internacional Econ'],
    ['Politica Economica', 'Economia Comportamental', 'Economia da Saude', 'Topicos em Microeconomia'],
    ['TCC em Economia', 'Economia Politica', 'Conjuntura Economica', 'Seminarios Avancados Econ'],
  ]),

  // === FGV Direito (10 semesters) ===
  ...courseSemesters(INSTITUTION_IDS.FGV, COURSE_IDS.FGV_Direito, [
    ['Introducao ao Direito', 'Teoria do Estado', 'Sociologia Juridica', 'Historia do Direito'],
    ['Direito Constitucional I', 'Direito Civil I', 'Direito Penal I', 'Filosofia do Direito'],
    ['Direito Constitucional II', 'Direito Civil II', 'Direito Penal II', 'Direito Administrativo I'],
    ['Direito do Trabalho I', 'Direito Tributario I', 'Direito Civil III', 'Direito Administrativo II'],
    ['Direito Processual Civil I', 'Direito do Trabalho II', 'Direito Tributario II', 'Direito Empresarial I'],
    ['Direito Processual Civil II', 'Direito Processual Penal I', 'Direito Empresarial II', 'Direito Internacional Publico'],
    ['Direito Processual Penal II', 'Direito Ambiental', 'Direito do Consumidor', 'Direito Digital'],
    ['Direito Previdenciario', 'Pratica Juridica I', 'Mediacao e Arbitragem', 'Direitos Humanos'],
    ['Pratica Juridica II', 'Etica Profissional', 'Direito Eleitoral', 'Topicos Especiais em Direito'],
    ['TCC em Direito', 'Pratica Juridica III', 'Seminarios Avancados Dir', 'Direito Comparado'],
  ]),

  // === Insper Admin (8 semesters) ===
  ...courseSemesters(INSTITUTION_IDS.Insper, COURSE_IDS.Insper_Admin, [
    ['Fundamentos de Administracao', 'Calculo I', 'Contabilidade Financeira', 'Economia de Empresas'],
    ['Marketing Estrategico', 'Estatistica para Negocios', 'Financas I', 'Comportamento Organizacional'],
    ['Financas II', 'Gestao de Operacoes', 'Pesquisa de Mercado', 'Direito Empresarial'],
    ['Estrategia Competitiva', 'Gestao de Pessoas', 'Contabilidade de Custos', 'Economia Brasileira'],
    ['Empreendedorismo e Inovacao', 'Business Analytics', 'Negociacao', 'Financas III'],
    ['Gestao de Tecnologia', 'Marketing Digital', 'Supply Chain', 'Lideranca'],
    ['Gestao Internacional', 'Valuation', 'Startup Lab', 'Topicos em Estrategia'],
    ['TCC Insper', 'Business Simulation', 'Etica nos Negocios', 'Projeto Integrador'],
  ]),

  // === Insper Economia (8 semesters) ===
  ...courseSemesters(INSTITUTION_IDS.Insper, COURSE_IDS.Insper_Economia, [
    ['Principios de Economia', 'Calculo para Economia I', 'Introducao a Estatistica', 'Historia Economica Global'],
    ['Microeconomia I', 'Macroeconomia I', 'Calculo para Economia II', 'Probabilidade e Estatistica'],
    ['Microeconomia II', 'Macroeconomia II', 'Econometria I', 'Economia Brasileira'],
    ['Economia Internacional', 'Economia Monetaria e Financeira', 'Econometria II', 'Economia do Setor Publico'],
    ['Desenvolvimento Economico', 'Mercados Financeiros', 'Economia do Trabalho', 'Game Theory'],
    ['Economia e Tecnologia', 'Behavioral Economics', 'Regulacao e Concorrencia', 'Data Science para Economia'],
    ['Politica Economica Brasileira', 'Health Economics', 'Environmental Economics', 'Advanced Microeconomics'],
    ['TCC Economia Insper', 'Macroeconomia Avancada', 'Seminarios Econ Insper', 'Projeto Final Econ'],
  ]),

  // === Insper Direito (10 semesters) ===
  ...courseSemesters(INSTITUTION_IDS.Insper, COURSE_IDS.Insper_Direito, [
    ['Fundamentos do Direito', 'Teoria Geral do Estado', 'Logica Juridica', 'Ciencia Politica'],
    ['Direito Constitucional I', 'Direito Civil Parte Geral', 'Direito Penal I', 'Teoria do Direito'],
    ['Direito Constitucional II', 'Direito das Obrigacoes', 'Direito Penal II', 'Direito Administrativo'],
    ['Direito do Trabalho', 'Direito Tributario', 'Direito dos Contratos', 'Processo Civil I'],
    ['Processo Civil II', 'Direito Empresarial I', 'Processo Penal', 'Direito Internacional Publico'],
    ['Direito Digital e Tecnologia', 'Direito Ambiental', 'Direito do Consumidor', 'Resolucao de Conflitos'],
    ['Direito Societario', 'Compliance', 'Propriedade Intelectual', 'Clinica Juridica I'],
    ['Direito Financeiro', 'Direito da Concorrencia', 'Clinica Juridica II', 'Direitos Fundamentais'],
    ['Pratica Profissional', 'Direito e Economia', 'Topicos Avancados Dir Insper', 'Etica e Deontologia'],
    ['TCC Direito Insper', 'Projeto Final Juridico', 'Seminario de Pesquisa', 'Direito Global'],
  ]),

  // === Insper Eng Computacao (10 semesters) ===
  ...courseSemesters(INSTITUTION_IDS.Insper, COURSE_IDS.Insper_EngComp, [
    ['Calculo I', 'Fisica', 'Introducao a Computacao', 'Algebra Linear'],
    ['Calculo II', 'Fisica II', 'Estrutura de Dados', 'Programacao Orientada a Objetos'],
    ['Calculo III', 'Circuitos Eletricos', 'Algoritmos Avancados', 'Banco de Dados'],
    ['Sinais e Sistemas', 'Redes de Computadores', 'Engenharia de Software', 'Sistemas Operacionais'],
    ['Inteligencia Artificial', 'Arquitetura de Computadores', 'Compiladores', 'Computacao Grafica'],
    ['Machine Learning', 'Sistemas Distribuidos', 'Seguranca da Informacao', 'Desenvolvimento Web'],
    ['Deep Learning', 'Cloud Computing', 'DevOps', 'IoT'],
    ['Robotica', 'Processamento de Imagens', 'Projeto de Sistemas', 'Blockchain'],
    ['Projeto de Graduacao I EC', 'Topicos em IA', 'Empreendedorismo Tech', 'Etica em Tecnologia'],
    ['TCC Eng Computacao', 'Projeto de Graduacao II EC', 'Seminario Final EC', 'Inovacao EC'],
  ]),

  // === Insper Eng Mecanica (10 semesters) ===
  ...courseSemesters(INSTITUTION_IDS.Insper, COURSE_IDS.Insper_EngMec, [
    ['Calculo I', 'Fisica', 'Desenho Tecnico', 'Quimica Geral'],
    ['Calculo II', 'Fisica II', 'Mecanica dos Solidos I', 'Ciencia dos Materiais'],
    ['Calculo III', 'Termodinamica', 'Mecanica dos Solidos II', 'Mecanica dos Fluidos I'],
    ['Transferencia de Calor', 'Mecanica dos Fluidos II', 'Dinamica de Maquinas', 'Sistemas de Controle'],
    ['Elementos de Maquinas', 'Processos de Fabricacao', 'Vibracoes Mecanicas', 'Projeto Mecanico I'],
    ['Projeto Mecanico II', 'Automacao Industrial', 'Mecanica Computacional', 'Energia e Meio Ambiente'],
    ['Engenharia Automotiva', 'Sistemas Termicos', 'Materiais Avancados', 'Gestao da Producao'],
    ['Manutencao Industrial', 'Engenharia de Qualidade', 'Projeto Integrado EM', 'Simulacao Numerica'],
    ['Projeto de Graduacao I EM', 'Topicos em Mecanica', 'Empreendedorismo', 'Etica em Engenharia'],
    ['TCC Eng Mecanica', 'Projeto de Graduacao II EM', 'Seminario Final EM', 'Inovacao Industrial'],
  ]),

  // === Insper Eng Mecatronica (10 semesters) ===
  ...courseSemesters(INSTITUTION_IDS.Insper, COURSE_IDS.Insper_EngMecatronica, [
    ['Calculo I', 'Fisica', 'Introducao a Mecatronica', 'Logica Digital'],
    ['Calculo II', 'Fisica II', 'Circuitos Eletricos', 'Programacao para Engenharia'],
    ['Calculo III', 'Eletronica Analogica', 'Mecanica dos Solidos MT', 'Sinais e Sistemas'],
    ['Eletronica Digital', 'Controle Automatico I', 'Microcontroladores', 'Instrumentacao'],
    ['Controle Automatico II', 'Robotica I', 'Sistemas Embarcados', 'Acionamentos Eletricos'],
    ['Robotica II', 'Automacao Industrial MT', 'Processamento de Sinais', 'Visao Computacional'],
    ['IA para Engenharia', 'Sistemas CPS', 'Manufatura Avancada', 'IoT Industrial'],
    ['Projeto Mecatronico', 'Sistemas de Energia', 'Controle Robusto', 'Manutencao Preditiva'],
    ['Projeto de Graduacao I MT', 'Topicos em Mecatronica', 'Empreendedorismo MT', 'Etica MT'],
    ['TCC Eng Mecatronica', 'Projeto de Graduacao II MT', 'Seminario Final MT', 'Inovacao MT'],
  ]),

  // === Insper Eng Producao (10 semesters) ===
  ...courseSemesters(INSTITUTION_IDS.Insper, COURSE_IDS.Insper_EngProd, [
    ['Calculo I', 'Fisica', 'Introducao a Eng de Producao', 'Economia para Engenheiros'],
    ['Calculo II', 'Fisica II', 'Estatistica para Engenharia', 'Contabilidade para Engenheiros'],
    ['Pesquisa Operacional I', 'Processos Produtivos', 'Gestao da Qualidade', 'Engenharia Economica'],
    ['Pesquisa Operacional II', 'Planejamento da Producao', 'Logistica', 'Gestao de Projetos'],
    ['Simulacao de Sistemas', 'Ergonomia', 'Lean Manufacturing', 'Gestao de Custos'],
    ['Supply Chain Management', 'Gestao da Inovacao EP', 'Sistemas de Informacao', 'Engenharia de Sustentabilidade'],
    ['Business Intelligence', 'Gestao Estrategica', 'Startup e Inovacao', 'Topicos em Producao'],
    ['Projeto de Fabrica', 'Consultoria em Producao', 'Automacao da Producao', 'Gestao de Pessoas EP'],
    ['Projeto de Graduacao I EP', 'Topicos Avancados EP', 'Empreendedorismo EP', 'Etica EP'],
    ['TCC Eng Producao', 'Projeto de Graduacao II EP', 'Seminario Final EP', 'Inovacao EP'],
  ]),
];

// ============================================================================
// USERS, PROFILES, CLASS EVENTS — unchanged from original
// ============================================================================

const users = [
  { id: USER_IDS.Rafael, supabaseId: 'fake-supabase-rafael', name: 'Rafael Prado', email: 'rafael@docens.test', phone: '+55 11 99999-0001', role: 'TEACHER' as UserRole },
  { id: USER_IDS.Luiza, supabaseId: 'fake-supabase-luiza', name: 'Luiza Costa', email: 'luiza@docens.test', phone: '+55 11 99999-0002', role: 'TEACHER' as UserRole },
  { id: USER_IDS.Carlos, supabaseId: 'fake-supabase-carlos', name: 'Carlos Mendes', email: 'carlos@docens.test', phone: '+55 11 99999-0003', role: 'TEACHER' as UserRole },
  { id: USER_IDS.Mariana, supabaseId: 'fake-supabase-mariana', name: 'Mariana Silva', email: 'mariana@docens.test', phone: '+55 11 99999-0004', role: 'TEACHER' as UserRole },
];

const teacherProfiles = [
  { id: TEACHER_PROFILE_IDS.Rafael, userId: USER_IDS.Rafael, photo: 'RP', headline: 'Especialista em Calculo e Estatistica', bio: 'Professor com 10 anos de experiencia em universidades de Sao Paulo. Mestrado em Matematica Aplicada pela USP.', isVerified: true },
  { id: TEACHER_PROFILE_IDS.Luiza, userId: USER_IDS.Luiza, photo: 'LC', headline: 'Professora de Direito e Redacao', bio: 'Advogada e educadora. Doutora em Direito Constitucional pela FGV. Apaixonada por ensino.', isVerified: true },
  { id: TEACHER_PROFILE_IDS.Carlos, userId: USER_IDS.Carlos, photo: 'CM', headline: 'Professor de Matematica e Fisica', bio: 'Engenheiro e professor. Mais de 15 anos preparando alunos para vestibulares e concursos.', isVerified: true },
  { id: TEACHER_PROFILE_IDS.Mariana, userId: USER_IDS.Mariana, photo: 'MS', headline: 'Especialista em Calculo e Fisica', bio: 'Doutora em Fisica pela Unicamp. Experiencia em universidades de tecnologia e engenharia.', isVerified: true },
];

const teacherInstitutions = [
  { id: '4a915dd6-ae26-4f4d-b709-598814a18da8', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, institutionId: INSTITUTION_IDS.Insper },
  { id: 'fe1862dd-c3a3-429a-bc9b-62a19e7eab76', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, institutionId: INSTITUTION_IDS.FGV },
  { id: '50a5475e-263b-403e-b0fa-c910fc1e6d27', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, institutionId: INSTITUTION_IDS.FGV },
  { id: '799a0a5b-22a0-42aa-8bb6-84d73efc26ca', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, institutionId: INSTITUTION_IDS['Col. Mobile'] },
  { id: '5f0eeed6-79f5-4bd2-8b86-e58583235e03', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, institutionId: INSTITUTION_IDS['Col. Mobile'] },
  { id: '2dd60565-8b31-4845-b725-5fafa7a910bf', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, institutionId: INSTITUTION_IDS['Col. Bandeirantes'] },
  { id: '79fbfcdf-4f2b-48a6-8f42-315fcf8dbedd', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, institutionId: INSTITUTION_IDS.Inteli },
  { id: '63deed0b-c9e6-4979-a3b4-211859ec5dcd', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, institutionId: INSTITUTION_IDS.Insper },
];

const teacherSubjects = [
  { id: '08f159e8-cc15-450c-9c01-d140d19aae6a', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, subjectId: SUBJECT_IDS['Calculo I'] },
  { id: '3883b760-fb5f-4a6b-95f6-b51c8869ee87', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, subjectId: SUBJECT_IDS.Estatistica },
  { id: '3fa98070-0e18-4e7a-82d1-49997afe9a64', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, subjectId: SUBJECT_IDS['Direito Constitucional'] },
  { id: '10aac7d1-645b-42ab-acb6-6257903f7dde', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, subjectId: SUBJECT_IDS.Redacao },
  { id: '820dafc0-af33-4e97-ab5f-b7e5116de1f2', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, subjectId: SUBJECT_IDS.Matematica },
  { id: '07ece264-91ce-47b8-a4c3-eed0f5b785f5', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, subjectId: SUBJECT_IDS.Fisica },
  { id: '69577ca3-822e-4fd9-85d9-f2466299fc5b', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, subjectId: SUBJECT_IDS['Calculo I'] },
  { id: '90de48ae-e825-4afd-bbfc-69d8fb5d06c2', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, subjectId: SUBJECT_IDS.Fisica },
];

const classEvents = [
  { id: CLASS_EVENT_IDS['Rafael-Calculo-Insper'], title: 'Calculo I - Limites e Derivadas', description: 'Aula intensiva sobre limites, continuidade e derivadas. Ideal para revisao antes da P1.', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, subjectId: SUBJECT_IDS['Calculo I'], institutionId: INSTITUTION_IDS.Insper, startsAt: new Date('2026-03-15T14:00:00Z'), durationMin: 90, priceCents: 9900, capacity: 50, soldSeats: 22, publicationStatus: 'PUBLISHED' as PublicationStatus, meetingStatus: 'LOCKED' as MeetingStatus, meetingUrl: null },
  { id: CLASS_EVENT_IDS['Rafael-Estatistica-Insper'], title: 'Estatistica Descritiva - Medidas de Tendencia Central', description: 'Revisao completa de media, mediana, moda e desvio padrao com exercicios praticos.', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, subjectId: SUBJECT_IDS.Estatistica, institutionId: INSTITUTION_IDS.Insper, startsAt: new Date('2026-03-22T10:00:00Z'), durationMin: 60, priceCents: 7900, capacity: 40, soldSeats: 15, publicationStatus: 'PUBLISHED' as PublicationStatus, meetingStatus: 'LOCKED' as MeetingStatus, meetingUrl: null },
  { id: CLASS_EVENT_IDS['Luiza-DirConst-FGV'], title: 'Direito Constitucional - Principios Fundamentais', description: 'Estudo aprofundado dos principios fundamentais da Constituicao Federal de 1988.', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, subjectId: SUBJECT_IDS['Direito Constitucional'], institutionId: INSTITUTION_IDS.FGV, startsAt: new Date('2026-04-05T19:00:00Z'), durationMin: 120, priceCents: 14900, capacity: 80, soldSeats: 45, publicationStatus: 'PUBLISHED' as PublicationStatus, meetingStatus: 'LOCKED' as MeetingStatus, meetingUrl: null },
  { id: CLASS_EVENT_IDS['Carlos-Matematica-Mobile'], title: 'Matematica - Funcoes Exponenciais e Logaritmicas', description: 'Revisao de funcoes exponenciais e logaritmicas com foco em vestibular.', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, subjectId: SUBJECT_IDS.Matematica, institutionId: INSTITUTION_IDS['Col. Mobile'], startsAt: new Date('2026-04-10T15:00:00Z'), durationMin: 90, priceCents: 5900, capacity: 30, soldSeats: 10, publicationStatus: 'PUBLISHED' as PublicationStatus, meetingStatus: 'LOCKED' as MeetingStatus, meetingUrl: null },
  { id: CLASS_EVENT_IDS['Carlos-Fisica-Bandeirantes'], title: 'Fisica - Cinematica Escalar', description: 'Aula sobre MRU e MRUV com resolucao de exercicios classicos de vestibular.', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, subjectId: SUBJECT_IDS.Fisica, institutionId: INSTITUTION_IDS['Col. Bandeirantes'], startsAt: new Date('2026-01-20T14:00:00Z'), durationMin: 90, priceCents: 6900, capacity: 60, soldSeats: 48, publicationStatus: 'FINISHED' as PublicationStatus, meetingStatus: 'RELEASED' as MeetingStatus, meetingUrl: 'https://meet.docens.app/fisica-cinematica-abc123' },
  { id: CLASS_EVENT_IDS['Mariana-Fisica-Insper'], title: 'Fisica - Termodinamica e Calorimetria', description: 'Conceitos fundamentais de termodinamica aplicados a problemas de engenharia.', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, subjectId: SUBJECT_IDS.Fisica, institutionId: INSTITUTION_IDS.Insper, startsAt: new Date('2026-02-10T16:00:00Z'), durationMin: 60, priceCents: 8900, capacity: 45, soldSeats: 38, publicationStatus: 'FINISHED' as PublicationStatus, meetingStatus: 'LOCKED' as MeetingStatus, meetingUrl: null },
  { id: CLASS_EVENT_IDS['Mariana-Calculo-Inteli'], title: 'Calculo I - Integrais Definidas (RASCUNHO)', description: 'Aula sobre integrais definidas e o Teorema Fundamental do Calculo. Ainda em preparacao.', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, subjectId: SUBJECT_IDS['Calculo I'], institutionId: INSTITUTION_IDS.Inteli, startsAt: new Date('2026-04-20T10:00:00Z'), durationMin: 90, priceCents: 9900, capacity: 35, soldSeats: 0, publicationStatus: 'DRAFT' as PublicationStatus, meetingStatus: 'LOCKED' as MeetingStatus, meetingUrl: null },
  { id: CLASS_EVENT_IDS['Luiza-Redacao-FGV'], title: 'Redacao Argumentativa - Estrutura e Coesao (RASCUNHO)', description: 'Tecnicas de redacao argumentativa para provas discursivas. Ainda sendo revisada.', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, subjectId: SUBJECT_IDS.Redacao, institutionId: INSTITUTION_IDS.FGV, startsAt: new Date('2026-03-30T18:00:00Z'), durationMin: 120, priceCents: 19900, capacity: 100, soldSeats: 0, publicationStatus: 'DRAFT' as PublicationStatus, meetingStatus: 'LOCKED' as MeetingStatus, meetingUrl: null },
];

const studentUsers = [
  { id: STUDENT_USER_IDS.Ana, supabaseId: 'fake-supabase-ana', name: 'Ana Silva', email: 'ana@docens.test', phone: '+55 11 98888-0001', role: 'STUDENT' as UserRole },
  { id: STUDENT_USER_IDS.CarlosAluno, supabaseId: 'fake-supabase-carlos-aluno', name: 'Carlos Aluno Mendes', email: 'carlos.aluno@docens.test', phone: '+55 11 98888-0002', role: 'STUDENT' as UserRole },
  { id: STUDENT_USER_IDS.Beatriz, supabaseId: 'fake-supabase-beatriz', name: 'Beatriz Santos', email: 'beatriz@docens.test', phone: '+55 11 98888-0003', role: 'STUDENT' as UserRole },
];

const studentProfiles = [
  { id: STUDENT_PROFILE_IDS.Ana, userId: STUDENT_USER_IDS.Ana, preferredInstitutionId: INSTITUTION_IDS.Insper, labels: ['vestibular', 'engenharia'] },
  { id: STUDENT_PROFILE_IDS.CarlosAluno, userId: STUDENT_USER_IDS.CarlosAluno, preferredInstitutionId: INSTITUTION_IDS.Inteli, labels: ['tecnologia'] },
  { id: STUDENT_PROFILE_IDS.Beatriz, userId: STUDENT_USER_IDS.Beatriz, preferredInstitutionId: INSTITUTION_IDS.FGV, labels: ['direito', 'concurso'] },
];

const studentInstitutions = [
  { id: '2490d37e-586e-4ffe-a001-f305c44f5e43', studentProfileId: STUDENT_PROFILE_IDS.Ana, institutionId: INSTITUTION_IDS.FGV },
  { id: 'f4074e89-bc9d-4df2-960a-dda0e20af287', studentProfileId: STUDENT_PROFILE_IDS.Ana, institutionId: INSTITUTION_IDS.Insper },
  { id: 'f20ffb40-1c09-4c58-846a-9c6c25b19da0', studentProfileId: STUDENT_PROFILE_IDS.CarlosAluno, institutionId: INSTITUTION_IDS.Inteli },
  { id: 'a8fcdba3-b694-4705-8b57-0273d116f5ec', studentProfileId: STUDENT_PROFILE_IDS.Beatriz, institutionId: INSTITUTION_IDS.FGV },
  { id: '35bb89ca-e2da-4126-823b-7199ff41d82b', studentProfileId: STUDENT_PROFILE_IDS.Beatriz, institutionId: INSTITUTION_IDS['Col. Bandeirantes'] },
];

// ============================================================================
// SEED EXECUTION
// ============================================================================

async function main() {
  console.log('Cleaning existing seed data...');
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.classEvent.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.teacherInstitution.deleteMany();
  await prisma.studentInstitution.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institutionSubject.deleteMany();
  await prisma.course.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.subject.deleteMany();
  console.log('  Cleaned.');

  console.log('Seeding subjects...');
  await prisma.subject.createMany({ data: allSubjects });
  console.log(`  ${allSubjects.length} subjects seeded.`);

  console.log('Seeding institutions...');
  await prisma.institution.createMany({ data: institutions });
  console.log(`  ${institutions.length} institutions seeded.`);

  console.log('Seeding courses...');
  await prisma.course.createMany({ data: courses });
  console.log(`  ${courses.length} courses seeded.`);

  console.log('Seeding institution-subject associations...');
  await prisma.institutionSubject.createMany({ data: institutionSubjects });
  console.log(`  ${institutionSubjects.length} institution-subject associations seeded.`);

  console.log('Seeding users...');
  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  console.log(`  ${users.length} users seeded.`);

  console.log('Seeding teacher profiles...');
  for (const profile of teacherProfiles) {
    await prisma.teacherProfile.create({ data: profile });
  }
  console.log(`  ${teacherProfiles.length} teacher profiles seeded.`);

  console.log('Seeding teacher-institution associations...');
  await prisma.teacherInstitution.createMany({ data: teacherInstitutions });
  console.log(`  ${teacherInstitutions.length} teacher-institution associations seeded.`);

  console.log('Seeding teacher-subject associations...');
  await prisma.teacherSubject.createMany({ data: teacherSubjects });
  console.log(`  ${teacherSubjects.length} teacher-subject associations seeded.`);

  console.log('Seeding class events...');
  for (const event of classEvents) {
    await prisma.classEvent.create({ data: event });
  }
  console.log(`  ${classEvents.length} class events seeded.`);

  console.log('Seeding student users...');
  for (const user of studentUsers) {
    await prisma.user.create({ data: user });
  }
  console.log(`  ${studentUsers.length} student users seeded.`);

  console.log('Seeding student profiles...');
  for (const profile of studentProfiles) {
    await prisma.studentProfile.create({ data: profile });
  }
  console.log(`  ${studentProfiles.length} student profiles seeded.`);

  console.log('Seeding student-institution associations...');
  await prisma.studentInstitution.createMany({ data: studentInstitutions });
  console.log(`  ${studentInstitutions.length} student-institution associations seeded.`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

// ============================================================================
// EXPORTED ID MAPS
// ============================================================================
export {
  INSTITUTION_IDS,
  COURSE_IDS,
  SUBJECT_IDS,
  UNI_SUBJECT_IDS,
  USER_IDS,
  TEACHER_PROFILE_IDS,
  CLASS_EVENT_IDS,
  STUDENT_USER_IDS,
  STUDENT_PROFILE_IDS,
};
