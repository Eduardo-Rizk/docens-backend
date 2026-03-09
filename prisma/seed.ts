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
// These UUIDs are fixed for the lifetime of the project.
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

// Original 13 school/legacy subjects
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

// ============================================================================
// NEW UNIVERSITY SUBJECT IDS — deterministic pattern
// CC = course index, SS = semester, NN = subject within semester
// ============================================================================

function subId(course: number, semester: number, index: number): string {
  const c = String(course).padStart(2, '0');
  const s = String(semester).padStart(2, '0');
  const n = String(index).padStart(2, '0');
  return `b0000000-${c}${s}-4${n}0-8000-000000000001`;
}

// ============================================================================
// FGV ADMINISTRACAO subjects (course=1)
// ============================================================================
const FGV_ADMIN_SUBJECTS = [
  { id: subId(1,1,1), name: 'Introducao a Administracao', icon: 'Briefcase' },
  { id: subId(1,1,2), name: 'Matematica Aplicada', icon: 'Calculator' },
  { id: subId(1,1,3), name: 'Contabilidade Basica', icon: 'Receipt' },
  { id: subId(1,1,4), name: 'Economia I', icon: 'TrendingUp' },
  { id: subId(1,2,1), name: 'Marketing I', icon: 'Megaphone' },
  { id: subId(1,2,2), name: 'Estatistica Aplicada', icon: 'BarChart3' },
  { id: subId(1,2,3), name: 'Direito Empresarial', icon: 'Scale' },
  { id: subId(1,2,4), name: 'Economia II', icon: 'TrendingUp' },
  { id: subId(1,3,1), name: 'Financas Corporativas', icon: 'DollarSign' },
  { id: subId(1,3,2), name: 'Gestao de Pessoas', icon: 'Users' },
  { id: subId(1,3,3), name: 'Comportamento Organizacional', icon: 'Brain' },
  { id: subId(1,3,4), name: 'Marketing II', icon: 'Target' },
  { id: subId(1,4,1), name: 'Estrategia Empresarial', icon: 'Compass' },
  { id: subId(1,4,2), name: 'Operacoes e Logistica', icon: 'Truck' },
  { id: subId(1,4,3), name: 'Gestao de Projetos', icon: 'ClipboardList' },
  { id: subId(1,4,4), name: 'Contabilidade Gerencial', icon: 'Calculator' },
  { id: subId(1,5,1), name: 'Empreendedorismo', icon: 'Rocket' },
  { id: subId(1,5,2), name: 'Comercio Internacional', icon: 'Globe' },
  { id: subId(1,5,3), name: 'Lideranca e Gestao', icon: 'Crown' },
  { id: subId(1,5,4), name: 'Analise de Investimentos', icon: 'LineChart' },
  { id: subId(1,6,1), name: 'Gestao da Inovacao', icon: 'Lightbulb' },
  { id: subId(1,6,2), name: 'Sustentabilidade Corporativa', icon: 'Leaf' },
  { id: subId(1,6,3), name: 'Negocios Digitais', icon: 'Laptop' },
  { id: subId(1,6,4), name: 'Auditoria', icon: 'Search' },
  { id: subId(1,7,1), name: 'Governanca Corporativa', icon: 'Building2' },
  { id: subId(1,7,2), name: 'Fusoes e Aquisicoes', icon: 'Handshake' },
  { id: subId(1,7,3), name: 'Gestao de Riscos', icon: 'ShieldAlert' },
  { id: subId(1,7,4), name: 'Consultoria Empresarial', icon: 'MessageSquare' },
  { id: subId(1,8,1), name: 'TCC em Administracao', icon: 'GraduationCap' },
  { id: subId(1,8,2), name: 'Etica Empresarial', icon: 'Heart' },
  { id: subId(1,8,3), name: 'Simulacao Empresarial', icon: 'Gamepad2' },
  { id: subId(1,8,4), name: 'Topicos Avancados em Gestao', icon: 'BookOpen' },
];

// ============================================================================
// FGV ECONOMIA subjects (course=2)
// ============================================================================
const FGV_ECONOMIA_SUBJECTS = [
  { id: subId(2,1,1), name: 'Introducao a Economia', icon: 'TrendingUp' },
  { id: subId(2,1,2), name: 'Matematica para Economistas I', icon: 'Calculator' },
  { id: subId(2,1,3), name: 'Historia Economica', icon: 'Landmark' },
  { id: subId(2,1,4), name: 'Sociologia Economica', icon: 'Users' },
  { id: subId(2,2,1), name: 'Microeconomia I', icon: 'PieChart' },
  { id: subId(2,2,2), name: 'Macroeconomia I', icon: 'Globe' },
  { id: subId(2,2,3), name: 'Estatistica Economica', icon: 'BarChart3' },
  { id: subId(2,2,4), name: 'Matematica para Economistas II', icon: 'Calculator' },
  { id: subId(2,3,1), name: 'Microeconomia II', icon: 'PieChart' },
  { id: subId(2,3,2), name: 'Macroeconomia II', icon: 'Globe' },
  { id: subId(2,3,3), name: 'Econometria I', icon: 'LineChart' },
  { id: subId(2,3,4), name: 'Economia Brasileira', icon: 'MapPin' },
  { id: subId(2,4,1), name: 'Economia Internacional', icon: 'Globe' },
  { id: subId(2,4,2), name: 'Economia Monetaria', icon: 'Coins' },
  { id: subId(2,4,3), name: 'Econometria II', icon: 'LineChart' },
  { id: subId(2,4,4), name: 'Economia do Setor Publico', icon: 'Building2' },
  { id: subId(2,5,1), name: 'Desenvolvimento Economico', icon: 'Sprout' },
  { id: subId(2,5,2), name: 'Mercado Financeiro', icon: 'CandlestickChart' },
  { id: subId(2,5,3), name: 'Economia do Trabalho', icon: 'Briefcase' },
  { id: subId(2,5,4), name: 'Historia do Pensamento Economico', icon: 'BookOpen' },
  { id: subId(2,6,1), name: 'Economia Ambiental', icon: 'Leaf' },
  { id: subId(2,6,2), name: 'Economia da Tecnologia', icon: 'Cpu' },
  { id: subId(2,6,3), name: 'Regulacao Economica', icon: 'Gavel' },
  { id: subId(2,6,4), name: 'Comercio Internacional', icon: 'Ship' },
  { id: subId(2,7,1), name: 'Politica Economica', icon: 'Landmark' },
  { id: subId(2,7,2), name: 'Economia Comportamental', icon: 'Brain' },
  { id: subId(2,7,3), name: 'Economia da Saude', icon: 'HeartPulse' },
  { id: subId(2,7,4), name: 'Topicos em Microeconomia', icon: 'Microscope' },
  { id: subId(2,8,1), name: 'TCC em Economia', icon: 'GraduationCap' },
  { id: subId(2,8,2), name: 'Economia Politica', icon: 'Scale' },
  { id: subId(2,8,3), name: 'Conjuntura Economica', icon: 'Newspaper' },
  { id: subId(2,8,4), name: 'Seminarios Avancados', icon: 'Presentation' },
];

// ============================================================================
// FGV DIREITO subjects (course=3, 10 semesters)
// ============================================================================
const FGV_DIREITO_SUBJECTS = [
  { id: subId(3,1,1), name: 'Introducao ao Direito', icon: 'BookOpen' },
  { id: subId(3,1,2), name: 'Teoria do Estado', icon: 'Landmark' },
  { id: subId(3,1,3), name: 'Sociologia Juridica', icon: 'Users' },
  { id: subId(3,1,4), name: 'Historia do Direito', icon: 'ScrollText' },
  { id: subId(3,2,1), name: 'Direito Constitucional I', icon: 'Scale' },
  { id: subId(3,2,2), name: 'Direito Civil I', icon: 'FileText' },
  { id: subId(3,2,3), name: 'Direito Penal I', icon: 'Gavel' },
  { id: subId(3,2,4), name: 'Filosofia do Direito', icon: 'Brain' },
  { id: subId(3,3,1), name: 'Direito Constitucional II', icon: 'Scale' },
  { id: subId(3,3,2), name: 'Direito Civil II', icon: 'FileText' },
  { id: subId(3,3,3), name: 'Direito Penal II', icon: 'Gavel' },
  { id: subId(3,3,4), name: 'Direito Administrativo I', icon: 'Building2' },
  { id: subId(3,4,1), name: 'Direito do Trabalho I', icon: 'Briefcase' },
  { id: subId(3,4,2), name: 'Direito Tributario I', icon: 'Receipt' },
  { id: subId(3,4,3), name: 'Direito Civil III', icon: 'FileText' },
  { id: subId(3,4,4), name: 'Direito Administrativo II', icon: 'Building2' },
  { id: subId(3,5,1), name: 'Direito Processual Civil I', icon: 'Hammer' },
  { id: subId(3,5,2), name: 'Direito do Trabalho II', icon: 'Briefcase' },
  { id: subId(3,5,3), name: 'Direito Tributario II', icon: 'Receipt' },
  { id: subId(3,5,4), name: 'Direito Empresarial I', icon: 'Building' },
  { id: subId(3,6,1), name: 'Direito Processual Civil II', icon: 'Hammer' },
  { id: subId(3,6,2), name: 'Direito Processual Penal I', icon: 'ShieldAlert' },
  { id: subId(3,6,3), name: 'Direito Empresarial II', icon: 'Building' },
  { id: subId(3,6,4), name: 'Direito Internacional Publico', icon: 'Globe' },
  { id: subId(3,7,1), name: 'Direito Processual Penal II', icon: 'ShieldAlert' },
  { id: subId(3,7,2), name: 'Direito Ambiental', icon: 'Leaf' },
  { id: subId(3,7,3), name: 'Direito do Consumidor', icon: 'ShoppingCart' },
  { id: subId(3,7,4), name: 'Direito Digital', icon: 'Laptop' },
  { id: subId(3,8,1), name: 'Direito Previdenciario', icon: 'Umbrella' },
  { id: subId(3,8,2), name: 'Pratica Juridica I', icon: 'Scale' },
  { id: subId(3,8,3), name: 'Mediacao e Arbitragem', icon: 'Handshake' },
  { id: subId(3,8,4), name: 'Direitos Humanos', icon: 'Heart' },
  { id: subId(3,9,1), name: 'Pratica Juridica II', icon: 'Scale' },
  { id: subId(3,9,2), name: 'Etica Profissional', icon: 'Award' },
  { id: subId(3,9,3), name: 'Direito Eleitoral', icon: 'Vote' },
  { id: subId(3,9,4), name: 'Topicos Especiais em Direito', icon: 'Bookmark' },
  { id: subId(3,10,1), name: 'TCC em Direito', icon: 'GraduationCap' },
  { id: subId(3,10,2), name: 'Pratica Juridica III', icon: 'Scale' },
  { id: subId(3,10,3), name: 'Seminarios Avancados', icon: 'Presentation' },
  { id: subId(3,10,4), name: 'Direito Comparado', icon: 'Globe' },
];

// ============================================================================
// INSPER ADMINISTRACAO subjects (course=4)
// ============================================================================
const INSPER_ADMIN_SUBJECTS = [
  { id: subId(4,1,1), name: 'Fundamentos de Administracao', icon: 'Briefcase' },
  { id: subId(4,1,2), name: 'Calculo I', icon: 'Sigma' },
  { id: subId(4,1,3), name: 'Contabilidade Financeira', icon: 'Receipt' },
  { id: subId(4,1,4), name: 'Economia de Empresas', icon: 'TrendingUp' },
  { id: subId(4,2,1), name: 'Marketing Estrategico', icon: 'Target' },
  { id: subId(4,2,2), name: 'Estatistica para Negocios', icon: 'BarChart3' },
  { id: subId(4,2,3), name: 'Financas I', icon: 'DollarSign' },
  { id: subId(4,2,4), name: 'Comportamento Organizacional', icon: 'Brain' },
  { id: subId(4,3,1), name: 'Financas II', icon: 'DollarSign' },
  { id: subId(4,3,2), name: 'Gestao de Operacoes', icon: 'Settings' },
  { id: subId(4,3,3), name: 'Pesquisa de Mercado', icon: 'Search' },
  { id: subId(4,3,4), name: 'Direito Empresarial', icon: 'Scale' },
  { id: subId(4,4,1), name: 'Estrategia Competitiva', icon: 'Compass' },
  { id: subId(4,4,2), name: 'Gestao de Pessoas', icon: 'Users' },
  { id: subId(4,4,3), name: 'Contabilidade de Custos', icon: 'Calculator' },
  { id: subId(4,4,4), name: 'Economia Brasileira', icon: 'MapPin' },
  { id: subId(4,5,1), name: 'Empreendedorismo e Inovacao', icon: 'Rocket' },
  { id: subId(4,5,2), name: 'Business Analytics', icon: 'Database' },
  { id: subId(4,5,3), name: 'Negociacao', icon: 'Handshake' },
  { id: subId(4,5,4), name: 'Financas III', icon: 'LineChart' },
  { id: subId(4,6,1), name: 'Gestao de Tecnologia', icon: 'Cpu' },
  { id: subId(4,6,2), name: 'Marketing Digital', icon: 'Smartphone' },
  { id: subId(4,6,3), name: 'Supply Chain', icon: 'Truck' },
  { id: subId(4,6,4), name: 'Lideranca', icon: 'Crown' },
  { id: subId(4,7,1), name: 'Gestao Internacional', icon: 'Globe' },
  { id: subId(4,7,2), name: 'Valuation', icon: 'TrendingUp' },
  { id: subId(4,7,3), name: 'Startup Lab', icon: 'Zap' },
  { id: subId(4,7,4), name: 'Topicos em Estrategia', icon: 'Compass' },
  { id: subId(4,8,1), name: 'TCC Insper', icon: 'GraduationCap' },
  { id: subId(4,8,2), name: 'Business Simulation', icon: 'Gamepad2' },
  { id: subId(4,8,3), name: 'Etica nos Negocios', icon: 'Heart' },
  { id: subId(4,8,4), name: 'Projeto Integrador', icon: 'Puzzle' },
];

// ============================================================================
// INSPER ECONOMIA subjects (course=5)
// ============================================================================
const INSPER_ECONOMIA_SUBJECTS = [
  { id: subId(5,1,1), name: 'Principios de Economia', icon: 'TrendingUp' },
  { id: subId(5,1,2), name: 'Calculo para Economia I', icon: 'Sigma' },
  { id: subId(5,1,3), name: 'Introducao a Estatistica', icon: 'BarChart3' },
  { id: subId(5,1,4), name: 'Historia Economica Global', icon: 'Landmark' },
  { id: subId(5,2,1), name: 'Microeconomia I', icon: 'PieChart' },
  { id: subId(5,2,2), name: 'Macroeconomia I', icon: 'Globe' },
  { id: subId(5,2,3), name: 'Calculo para Economia II', icon: 'Sigma' },
  { id: subId(5,2,4), name: 'Probabilidade e Estatistica', icon: 'Dice' },
  { id: subId(5,3,1), name: 'Microeconomia II', icon: 'PieChart' },
  { id: subId(5,3,2), name: 'Macroeconomia II', icon: 'Globe' },
  { id: subId(5,3,3), name: 'Econometria I', icon: 'LineChart' },
  { id: subId(5,3,4), name: 'Economia Brasileira', icon: 'MapPin' },
  { id: subId(5,4,1), name: 'Economia Internacional', icon: 'Globe' },
  { id: subId(5,4,2), name: 'Economia Monetaria e Financeira', icon: 'Coins' },
  { id: subId(5,4,3), name: 'Econometria II', icon: 'LineChart' },
  { id: subId(5,4,4), name: 'Economia do Setor Publico', icon: 'Building2' },
  { id: subId(5,5,1), name: 'Desenvolvimento Economico', icon: 'Sprout' },
  { id: subId(5,5,2), name: 'Mercados Financeiros', icon: 'CandlestickChart' },
  { id: subId(5,5,3), name: 'Economia do Trabalho', icon: 'Briefcase' },
  { id: subId(5,5,4), name: 'Game Theory', icon: 'Gamepad2' },
  { id: subId(5,6,1), name: 'Economia e Tecnologia', icon: 'Cpu' },
  { id: subId(5,6,2), name: 'Behavioral Economics', icon: 'Brain' },
  { id: subId(5,6,3), name: 'Regulacao e Concorrencia', icon: 'Gavel' },
  { id: subId(5,6,4), name: 'Data Science para Economia', icon: 'Database' },
  { id: subId(5,7,1), name: 'Politica Economica Brasileira', icon: 'Landmark' },
  { id: subId(5,7,2), name: 'Health Economics', icon: 'HeartPulse' },
  { id: subId(5,7,3), name: 'Environmental Economics', icon: 'Leaf' },
  { id: subId(5,7,4), name: 'Advanced Microeconomics', icon: 'Microscope' },
  { id: subId(5,8,1), name: 'TCC Economia Insper', icon: 'GraduationCap' },
  { id: subId(5,8,2), name: 'Macroeconomia Avancada', icon: 'Globe' },
  { id: subId(5,8,3), name: 'Seminarios', icon: 'Presentation' },
  { id: subId(5,8,4), name: 'Projeto Final', icon: 'Puzzle' },
];

// ============================================================================
// INSPER DIREITO subjects (course=6, 10 semesters)
// ============================================================================
const INSPER_DIREITO_SUBJECTS = [
  { id: subId(6,1,1), name: 'Fundamentos do Direito', icon: 'BookOpen' },
  { id: subId(6,1,2), name: 'Teoria Geral do Estado', icon: 'Landmark' },
  { id: subId(6,1,3), name: 'Logica Juridica', icon: 'Brain' },
  { id: subId(6,1,4), name: 'Ciencia Politica', icon: 'Vote' },
  { id: subId(6,2,1), name: 'Direito Constitucional I', icon: 'Scale' },
  { id: subId(6,2,2), name: 'Direito Civil Parte Geral', icon: 'FileText' },
  { id: subId(6,2,3), name: 'Direito Penal I', icon: 'Gavel' },
  { id: subId(6,2,4), name: 'Teoria do Direito', icon: 'BookOpen' },
  { id: subId(6,3,1), name: 'Direito Constitucional II', icon: 'Scale' },
  { id: subId(6,3,2), name: 'Direito das Obrigacoes', icon: 'FileText' },
  { id: subId(6,3,3), name: 'Direito Penal II', icon: 'Gavel' },
  { id: subId(6,3,4), name: 'Direito Administrativo', icon: 'Building2' },
  { id: subId(6,4,1), name: 'Direito do Trabalho', icon: 'Briefcase' },
  { id: subId(6,4,2), name: 'Direito Tributario', icon: 'Receipt' },
  { id: subId(6,4,3), name: 'Direito dos Contratos', icon: 'FileText' },
  { id: subId(6,4,4), name: 'Processo Civil I', icon: 'Hammer' },
  { id: subId(6,5,1), name: 'Processo Civil II', icon: 'Hammer' },
  { id: subId(6,5,2), name: 'Direito Empresarial', icon: 'Building' },
  { id: subId(6,5,3), name: 'Processo Penal', icon: 'ShieldAlert' },
  { id: subId(6,5,4), name: 'Direito Internacional', icon: 'Globe' },
  { id: subId(6,6,1), name: 'Direito Digital e Tecnologia', icon: 'Laptop' },
  { id: subId(6,6,2), name: 'Direito Ambiental', icon: 'Leaf' },
  { id: subId(6,6,3), name: 'Direito do Consumidor', icon: 'ShoppingCart' },
  { id: subId(6,6,4), name: 'Resolucao de Conflitos', icon: 'Handshake' },
  { id: subId(6,7,1), name: 'Direito Societario', icon: 'Building2' },
  { id: subId(6,7,2), name: 'Compliance', icon: 'ShieldCheck' },
  { id: subId(6,7,3), name: 'Propriedade Intelectual', icon: 'Lightbulb' },
  { id: subId(6,7,4), name: 'Clinica Juridica I', icon: 'Stethoscope' },
  { id: subId(6,8,1), name: 'Direito Financeiro', icon: 'DollarSign' },
  { id: subId(6,8,2), name: 'Direito da Concorrencia', icon: 'Gavel' },
  { id: subId(6,8,3), name: 'Clinica Juridica II', icon: 'Stethoscope' },
  { id: subId(6,8,4), name: 'Direitos Fundamentais', icon: 'Heart' },
  { id: subId(6,9,1), name: 'Pratica Profissional', icon: 'Briefcase' },
  { id: subId(6,9,2), name: 'Direito e Economia', icon: 'TrendingUp' },
  { id: subId(6,9,3), name: 'Topicos Avancados', icon: 'Bookmark' },
  { id: subId(6,9,4), name: 'Etica e Deontologia', icon: 'Award' },
  { id: subId(6,10,1), name: 'TCC Direito Insper', icon: 'GraduationCap' },
  { id: subId(6,10,2), name: 'Projeto Final Juridico', icon: 'Puzzle' },
  { id: subId(6,10,3), name: 'Seminario de Pesquisa', icon: 'Presentation' },
  { id: subId(6,10,4), name: 'Direito Global', icon: 'Globe' },
];

// ============================================================================
// INSPER ENG. COMPUTACAO subjects (course=7, 10 semesters)
// ============================================================================
const INSPER_ENGCOMP_SUBJECTS = [
  { id: subId(7,1,1), name: 'Calculo I', icon: 'Sigma' },
  { id: subId(7,1,2), name: 'Fisica I', icon: 'Atom' },
  { id: subId(7,1,3), name: 'Introducao a Computacao', icon: 'Monitor' },
  { id: subId(7,1,4), name: 'Algebra Linear', icon: 'Grid3x3' },
  { id: subId(7,2,1), name: 'Calculo II', icon: 'Sigma' },
  { id: subId(7,2,2), name: 'Fisica II', icon: 'Atom' },
  { id: subId(7,2,3), name: 'Estrutura de Dados', icon: 'Database' },
  { id: subId(7,2,4), name: 'Programacao Orientada a Objetos', icon: 'Code' },
  { id: subId(7,3,1), name: 'Calculo III', icon: 'Sigma' },
  { id: subId(7,3,2), name: 'Circuitos Eletricos', icon: 'Zap' },
  { id: subId(7,3,3), name: 'Algoritmos Avancados', icon: 'Binary' },
  { id: subId(7,3,4), name: 'Banco de Dados', icon: 'Database' },
  { id: subId(7,4,1), name: 'Sinais e Sistemas', icon: 'Activity' },
  { id: subId(7,4,2), name: 'Redes de Computadores', icon: 'Network' },
  { id: subId(7,4,3), name: 'Engenharia de Software', icon: 'Code' },
  { id: subId(7,4,4), name: 'Sistemas Operacionais', icon: 'Terminal' },
  { id: subId(7,5,1), name: 'Inteligencia Artificial', icon: 'Brain' },
  { id: subId(7,5,2), name: 'Arquitetura de Computadores', icon: 'Cpu' },
  { id: subId(7,5,3), name: 'Compiladores', icon: 'FileCode' },
  { id: subId(7,5,4), name: 'Computacao Grafica', icon: 'Monitor' },
  { id: subId(7,6,1), name: 'Machine Learning', icon: 'Brain' },
  { id: subId(7,6,2), name: 'Sistemas Distribuidos', icon: 'Cloud' },
  { id: subId(7,6,3), name: 'Seguranca da Informacao', icon: 'Shield' },
  { id: subId(7,6,4), name: 'Desenvolvimento Web', icon: 'Globe' },
  { id: subId(7,7,1), name: 'Deep Learning', icon: 'Brain' },
  { id: subId(7,7,2), name: 'Cloud Computing', icon: 'Cloud' },
  { id: subId(7,7,3), name: 'DevOps', icon: 'Settings' },
  { id: subId(7,7,4), name: 'IoT', icon: 'Wifi' },
  { id: subId(7,8,1), name: 'Robotica', icon: 'Bot' },
  { id: subId(7,8,2), name: 'Processamento de Imagens', icon: 'Image' },
  { id: subId(7,8,3), name: 'Projeto de Sistemas', icon: 'Layout' },
  { id: subId(7,8,4), name: 'Blockchain', icon: 'Link' },
  { id: subId(7,9,1), name: 'Projeto de Graduacao I', icon: 'Wrench' },
  { id: subId(7,9,2), name: 'Topicos em IA', icon: 'Sparkles' },
  { id: subId(7,9,3), name: 'Empreendedorismo Tech', icon: 'Rocket' },
  { id: subId(7,9,4), name: 'Etica em Tecnologia', icon: 'Heart' },
  { id: subId(7,10,1), name: 'TCC Eng Computacao', icon: 'GraduationCap' },
  { id: subId(7,10,2), name: 'Projeto de Graduacao II', icon: 'Wrench' },
  { id: subId(7,10,3), name: 'Seminario Final', icon: 'Presentation' },
  { id: subId(7,10,4), name: 'Inovacao', icon: 'Lightbulb' },
];

// ============================================================================
// INSPER ENG. MECANICA subjects (course=8, 10 semesters)
// ============================================================================
const INSPER_ENGMEC_SUBJECTS = [
  { id: subId(8,1,1), name: 'Calculo I', icon: 'Sigma' },
  { id: subId(8,1,2), name: 'Fisica I', icon: 'Atom' },
  { id: subId(8,1,3), name: 'Desenho Tecnico', icon: 'Pencil' },
  { id: subId(8,1,4), name: 'Quimica Geral', icon: 'FlaskConical' },
  { id: subId(8,2,1), name: 'Calculo II', icon: 'Sigma' },
  { id: subId(8,2,2), name: 'Fisica II', icon: 'Atom' },
  { id: subId(8,2,3), name: 'Mecanica dos Solidos I', icon: 'Hammer' },
  { id: subId(8,2,4), name: 'Ciencia dos Materiais', icon: 'Layers' },
  { id: subId(8,3,1), name: 'Calculo III', icon: 'Sigma' },
  { id: subId(8,3,2), name: 'Termodinamica', icon: 'Thermometer' },
  { id: subId(8,3,3), name: 'Mecanica dos Solidos II', icon: 'Hammer' },
  { id: subId(8,3,4), name: 'Mecanica dos Fluidos I', icon: 'Waves' },
  { id: subId(8,4,1), name: 'Transferencia de Calor', icon: 'Flame' },
  { id: subId(8,4,2), name: 'Mecanica dos Fluidos II', icon: 'Waves' },
  { id: subId(8,4,3), name: 'Dinamica de Maquinas', icon: 'Cog' },
  { id: subId(8,4,4), name: 'Sistemas de Controle', icon: 'Gauge' },
  { id: subId(8,5,1), name: 'Elementos de Maquinas', icon: 'Wrench' },
  { id: subId(8,5,2), name: 'Processos de Fabricacao', icon: 'Factory' },
  { id: subId(8,5,3), name: 'Vibracoes Mecanicas', icon: 'Activity' },
  { id: subId(8,5,4), name: 'Projeto Mecanico I', icon: 'Ruler' },
  { id: subId(8,6,1), name: 'Projeto Mecanico II', icon: 'Ruler' },
  { id: subId(8,6,2), name: 'Automacao Industrial', icon: 'Bot' },
  { id: subId(8,6,3), name: 'Mecanica Computacional', icon: 'Monitor' },
  { id: subId(8,6,4), name: 'Energia e Meio Ambiente', icon: 'Leaf' },
  { id: subId(8,7,1), name: 'Engenharia Automotiva', icon: 'Car' },
  { id: subId(8,7,2), name: 'Sistemas Termicos', icon: 'Thermometer' },
  { id: subId(8,7,3), name: 'Materiais Avancados', icon: 'Layers' },
  { id: subId(8,7,4), name: 'Gestao da Producao', icon: 'ClipboardList' },
  { id: subId(8,8,1), name: 'Manutencao Industrial', icon: 'Wrench' },
  { id: subId(8,8,2), name: 'Engenharia de Qualidade', icon: 'CheckCircle' },
  { id: subId(8,8,3), name: 'Projeto Integrado', icon: 'Layout' },
  { id: subId(8,8,4), name: 'Simulacao Numerica', icon: 'Calculator' },
  { id: subId(8,9,1), name: 'Projeto de Graduacao I', icon: 'Wrench' },
  { id: subId(8,9,2), name: 'Topicos em Mecanica', icon: 'Cog' },
  { id: subId(8,9,3), name: 'Empreendedorismo', icon: 'Rocket' },
  { id: subId(8,9,4), name: 'Etica em Engenharia', icon: 'Heart' },
  { id: subId(8,10,1), name: 'TCC Eng Mecanica', icon: 'GraduationCap' },
  { id: subId(8,10,2), name: 'Projeto de Graduacao II', icon: 'Wrench' },
  { id: subId(8,10,3), name: 'Seminario Final', icon: 'Presentation' },
  { id: subId(8,10,4), name: 'Inovacao Industrial', icon: 'Lightbulb' },
];

// ============================================================================
// INSPER ENG. MECATRONICA subjects (course=9, 10 semesters)
// ============================================================================
const INSPER_ENGMECATRONICA_SUBJECTS = [
  { id: subId(9,1,1), name: 'Calculo I', icon: 'Sigma' },
  { id: subId(9,1,2), name: 'Fisica I', icon: 'Atom' },
  { id: subId(9,1,3), name: 'Introducao a Mecatronica', icon: 'Bot' },
  { id: subId(9,1,4), name: 'Logica Digital', icon: 'Binary' },
  { id: subId(9,2,1), name: 'Calculo II', icon: 'Sigma' },
  { id: subId(9,2,2), name: 'Fisica II', icon: 'Atom' },
  { id: subId(9,2,3), name: 'Circuitos Eletricos', icon: 'Zap' },
  { id: subId(9,2,4), name: 'Programacao para Engenharia', icon: 'Code' },
  { id: subId(9,3,1), name: 'Calculo III', icon: 'Sigma' },
  { id: subId(9,3,2), name: 'Eletronica Analogica', icon: 'Radio' },
  { id: subId(9,3,3), name: 'Mecanica dos Solidos', icon: 'Hammer' },
  { id: subId(9,3,4), name: 'Sinais e Sistemas', icon: 'Activity' },
  { id: subId(9,4,1), name: 'Eletronica Digital', icon: 'Cpu' },
  { id: subId(9,4,2), name: 'Controle Automatico I', icon: 'Gauge' },
  { id: subId(9,4,3), name: 'Microcontroladores', icon: 'Chip' },
  { id: subId(9,4,4), name: 'Instrumentacao', icon: 'Microscope' },
  { id: subId(9,5,1), name: 'Controle Automatico II', icon: 'Gauge' },
  { id: subId(9,5,2), name: 'Robotica I', icon: 'Bot' },
  { id: subId(9,5,3), name: 'Sistemas Embarcados', icon: 'Cpu' },
  { id: subId(9,5,4), name: 'Acionamentos Eletricos', icon: 'Zap' },
  { id: subId(9,6,1), name: 'Robotica II', icon: 'Bot' },
  { id: subId(9,6,2), name: 'Automacao Industrial', icon: 'Factory' },
  { id: subId(9,6,3), name: 'Processamento de Sinais', icon: 'Activity' },
  { id: subId(9,6,4), name: 'Visao Computacional', icon: 'Eye' },
  { id: subId(9,7,1), name: 'Inteligencia Artificial para Eng', icon: 'Brain' },
  { id: subId(9,7,2), name: 'Sistemas CPS', icon: 'Network' },
  { id: subId(9,7,3), name: 'Manufatura Avancada', icon: 'Factory' },
  { id: subId(9,7,4), name: 'IoT Industrial', icon: 'Wifi' },
  { id: subId(9,8,1), name: 'Projeto Mecatronico', icon: 'Layout' },
  { id: subId(9,8,2), name: 'Sistemas de Energia', icon: 'Battery' },
  { id: subId(9,8,3), name: 'Controle Robusto', icon: 'ShieldCheck' },
  { id: subId(9,8,4), name: 'Manutencao Preditiva', icon: 'Search' },
  { id: subId(9,9,1), name: 'Projeto de Graduacao I', icon: 'Wrench' },
  { id: subId(9,9,2), name: 'Topicos em Mecatronica', icon: 'Bot' },
  { id: subId(9,9,3), name: 'Empreendedorismo', icon: 'Rocket' },
  { id: subId(9,9,4), name: 'Etica', icon: 'Heart' },
  { id: subId(9,10,1), name: 'TCC Eng Mecatronica', icon: 'GraduationCap' },
  { id: subId(9,10,2), name: 'Projeto de Graduacao II', icon: 'Wrench' },
  { id: subId(9,10,3), name: 'Seminario Final', icon: 'Presentation' },
  { id: subId(9,10,4), name: 'Inovacao', icon: 'Lightbulb' },
];

// ============================================================================
// INSPER ENG. PRODUCAO subjects (course=10, 10 semesters)
// ============================================================================
const INSPER_ENGPROD_SUBJECTS = [
  { id: subId(10,1,1), name: 'Calculo I', icon: 'Sigma' },
  { id: subId(10,1,2), name: 'Fisica I', icon: 'Atom' },
  { id: subId(10,1,3), name: 'Introducao a Eng de Producao', icon: 'ClipboardList' },
  { id: subId(10,1,4), name: 'Economia para Engenheiros', icon: 'TrendingUp' },
  { id: subId(10,2,1), name: 'Calculo II', icon: 'Sigma' },
  { id: subId(10,2,2), name: 'Fisica II', icon: 'Atom' },
  { id: subId(10,2,3), name: 'Estatistica para Engenharia', icon: 'BarChart3' },
  { id: subId(10,2,4), name: 'Contabilidade para Engenheiros', icon: 'Receipt' },
  { id: subId(10,3,1), name: 'Pesquisa Operacional I', icon: 'Calculator' },
  { id: subId(10,3,2), name: 'Processos Produtivos', icon: 'Factory' },
  { id: subId(10,3,3), name: 'Gestao da Qualidade', icon: 'CheckCircle' },
  { id: subId(10,3,4), name: 'Engenharia Economica', icon: 'DollarSign' },
  { id: subId(10,4,1), name: 'Pesquisa Operacional II', icon: 'Calculator' },
  { id: subId(10,4,2), name: 'Planejamento da Producao', icon: 'Calendar' },
  { id: subId(10,4,3), name: 'Logistica', icon: 'Truck' },
  { id: subId(10,4,4), name: 'Gestao de Projetos', icon: 'ClipboardList' },
  { id: subId(10,5,1), name: 'Simulacao de Sistemas', icon: 'Monitor' },
  { id: subId(10,5,2), name: 'Ergonomia', icon: 'User' },
  { id: subId(10,5,3), name: 'Lean Manufacturing', icon: 'Zap' },
  { id: subId(10,5,4), name: 'Gestao de Custos', icon: 'DollarSign' },
  { id: subId(10,6,1), name: 'Supply Chain Management', icon: 'Truck' },
  { id: subId(10,6,2), name: 'Gestao da Inovacao', icon: 'Lightbulb' },
  { id: subId(10,6,3), name: 'Sistemas de Informacao', icon: 'Database' },
  { id: subId(10,6,4), name: 'Engenharia de Sustentabilidade', icon: 'Leaf' },
  { id: subId(10,7,1), name: 'Business Intelligence', icon: 'BarChart3' },
  { id: subId(10,7,2), name: 'Gestao Estrategica', icon: 'Compass' },
  { id: subId(10,7,3), name: 'Startup e Inovacao', icon: 'Rocket' },
  { id: subId(10,7,4), name: 'Topicos em Producao', icon: 'Factory' },
  { id: subId(10,8,1), name: 'Projeto de Fabrica', icon: 'Building' },
  { id: subId(10,8,2), name: 'Consultoria em Producao', icon: 'MessageSquare' },
  { id: subId(10,8,3), name: 'Automacao da Producao', icon: 'Bot' },
  { id: subId(10,8,4), name: 'Gestao de Pessoas', icon: 'Users' },
  { id: subId(10,9,1), name: 'Projeto de Graduacao I', icon: 'Wrench' },
  { id: subId(10,9,2), name: 'Topicos Avancados', icon: 'BookOpen' },
  { id: subId(10,9,3), name: 'Empreendedorismo', icon: 'Rocket' },
  { id: subId(10,9,4), name: 'Etica', icon: 'Heart' },
  { id: subId(10,10,1), name: 'TCC Eng Producao', icon: 'GraduationCap' },
  { id: subId(10,10,2), name: 'Projeto de Graduacao II', icon: 'Wrench' },
  { id: subId(10,10,3), name: 'Seminario Final', icon: 'Presentation' },
  { id: subId(10,10,4), name: 'Inovacao', icon: 'Lightbulb' },
];

// ============================================================================
// All course-specific subject arrays grouped by course
// ============================================================================
const ALL_COURSE_SUBJECTS: { courseKey: keyof typeof COURSE_IDS; subjects: { id: string; name: string; icon: string }[] }[] = [
  { courseKey: 'FGV_Admin', subjects: FGV_ADMIN_SUBJECTS },
  { courseKey: 'FGV_Economia', subjects: FGV_ECONOMIA_SUBJECTS },
  { courseKey: 'FGV_Direito', subjects: FGV_DIREITO_SUBJECTS },
  { courseKey: 'Insper_Admin', subjects: INSPER_ADMIN_SUBJECTS },
  { courseKey: 'Insper_Economia', subjects: INSPER_ECONOMIA_SUBJECTS },
  { courseKey: 'Insper_Direito', subjects: INSPER_DIREITO_SUBJECTS },
  { courseKey: 'Insper_EngComp', subjects: INSPER_ENGCOMP_SUBJECTS },
  { courseKey: 'Insper_EngMec', subjects: INSPER_ENGMEC_SUBJECTS },
  { courseKey: 'Insper_EngMecatronica', subjects: INSPER_ENGMECATRONICA_SUBJECTS },
  { courseKey: 'Insper_EngProd', subjects: INSPER_ENGPROD_SUBJECTS },
];

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
  {
    id: INSTITUTION_IDS.FGV,
    name: 'Fundacao Getulio Vargas',
    shortName: 'FGV',
    city: 'Sao Paulo',
    type: 'UNIVERSITY' as InstitutionType,
    logoUrl: '/imgs/faculdades/fgv-logo-0.png',
    isEnabled: true,
  },
  {
    id: INSTITUTION_IDS.Insper,
    name: 'Insper Instituto de Ensino e Pesquisa',
    shortName: 'Insper',
    city: 'Sao Paulo',
    type: 'UNIVERSITY' as InstitutionType,
    logoUrl: '/imgs/faculdades/INsper.png',
    isEnabled: true,
  },
  {
    id: INSTITUTION_IDS.Inteli,
    name: 'Inteli - Instituto de Tecnologia e Lideranca',
    shortName: 'Inteli',
    city: 'Sao Paulo',
    type: 'UNIVERSITY' as InstitutionType,
    logoUrl: '/imgs/faculdades/inteli-logo.png',
    isEnabled: false,
  },
  {
    id: INSTITUTION_IDS['Col. Mobile'],
    name: 'Colegio Mobile',
    shortName: 'Mobile',
    city: 'Sao Paulo',
    type: 'SCHOOL' as InstitutionType,
    logoUrl: '/imgs/escolas/mobile.png',
    isEnabled: true,
  },
  {
    id: INSTITUTION_IDS['Col. Bandeirantes'],
    name: 'Colegio Bandeirantes',
    shortName: 'Band',
    city: 'Sao Paulo',
    type: 'SCHOOL' as InstitutionType,
    logoUrl: '/imgs/escolas/Band-logo.jpg',
    isEnabled: true,
  },
  {
    id: INSTITUTION_IDS['Col. Vertice'],
    name: 'Colegio Vertice',
    shortName: 'Vertice',
    city: 'Sao Paulo',
    type: 'SCHOOL' as InstitutionType,
    logoUrl: '/imgs/escolas/vertice.png',
    isEnabled: true,
  },
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
  { id: COURSE_IDS.Insper_EngComp, institutionId: INSTITUTION_IDS.Insper, name: 'Engenharia de Computacao', slug: 'engenharia-de-computacao', displayOrder: 4 },
  { id: COURSE_IDS.Insper_EngMec, institutionId: INSTITUTION_IDS.Insper, name: 'Engenharia Mecanica', slug: 'engenharia-mecanica', displayOrder: 5 },
  { id: COURSE_IDS.Insper_EngMecatronica, institutionId: INSTITUTION_IDS.Insper, name: 'Engenharia Mecatronica', slug: 'engenharia-mecatronica', displayOrder: 6 },
  { id: COURSE_IDS.Insper_EngProd, institutionId: INSTITUTION_IDS.Insper, name: 'Engenharia de Producao', slug: 'engenharia-de-producao', displayOrder: 7 },
];

// ============================================================================
// SUBJECTS — 13 original + all university course subjects
// ============================================================================

const schoolSubjects = [
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

const allUniversitySubjects = ALL_COURSE_SUBJECTS.flatMap(c => c.subjects);
const allSubjects = [...schoolSubjects, ...allUniversitySubjects];

// ============================================================================
// INSTITUTION-SUBJECT ASSOCIATIONS
// ============================================================================

// Pre-generated UUIDs for school institution-subject junction rows
const IS_IDS = [
  '02ef7015-d02d-4b34-8592-106d88167879', '21800d8f-5e28-4d35-81e4-0c53ed27f422',
  '5bbfbecb-18fb-4173-b128-560e4747a50d', 'b5c3e1b2-09ef-4dc6-8ecd-79c810991116',
  'e8c98ce3-e1ac-4a57-bbb6-72320c8736d1', '1aebd5b7-85dc-4b9a-b0d5-8099d4299c46',
  '15433278-04d6-4f5c-be1a-ce3af08da15f', '41491b82-0beb-44ab-bf4c-7d973916b4cf',
  '61f1bfe2-f556-4e17-9547-535b3fbfa93f', 'd871187f-ffac-449d-9e9d-4506d41d09d0',
  '95fa09a9-9537-4fd2-bcc8-5a98eadb9a69', '16ab6c7a-754e-4c32-ac02-de09e524a282',
  'a87a350e-1ff5-4aec-893d-cddc8f1a822c', '370573ae-3633-4166-88a3-e8e59da0a45c',
  '13132d6d-7c11-41f9-a185-066676624db3', '1fcb677f-6df9-477a-9899-44cfeb29bda3',
  'a93a07df-5eaf-4e70-9c5d-d9ca428cf71c', '2bbee544-721e-4345-bbe8-2d4aa339db98',
  '1573eb97-6389-4197-b52c-5c558108f834', '5857e9a3-19ad-4376-b898-786bd29b0b39',
  'f2afce69-0137-466d-a26d-e2fb9f91c2cd', 'a1f13bd5-100f-48cf-b0f4-98ae31db4019',
  '8030e305-d198-40a2-a0ae-a71b9c352ee5', '6b6ee5d0-9f1b-481f-b28b-fb63818bac90',
  '60c38fb5-cf51-455c-bc2b-75d5953ba825', '53ed299e-d81d-4094-a8f3-7d75c4ec1462',
  'dbbd06a5-18b5-4d5c-9ecd-51aa704f6a20', '0799223a-cb82-4625-9bea-2e33853501aa',
  '8bf41112-bcce-4cb5-a2d8-75ee3c6f51f3', 'ba0517f8-1c61-41f3-a55b-a754044bc9fd',
  '8641a6a2-fe94-4586-82e1-942fcc4d79da', '1bd754d4-96b8-4313-86e7-559ada99b3fa',
  'c57098cd-8551-4fd9-adff-cd25b597bb18',
];

// School institution-subjects (no courseId)
const schoolInstitutionSubjects = [
  // Colegio Mobile — 1o Ano
  { id: IS_IDS[0], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '1o Ano', yearOrder: 1 },
  { id: IS_IDS[1], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS['Lingua Portuguesa'], yearLabel: '1o Ano', yearOrder: 1 },
  { id: IS_IDS[2], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Biologia, yearLabel: '1o Ano', yearOrder: 1 },
  { id: IS_IDS[3], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '1o Ano', yearOrder: 1 },
  { id: IS_IDS[4], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Historia, yearLabel: '1o Ano', yearOrder: 1 },
  { id: IS_IDS[5], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Ingles, yearLabel: '1o Ano', yearOrder: 1 },
  // Colegio Mobile — 2o Ano
  { id: IS_IDS[6], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: IS_IDS[7], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS['Lingua Portuguesa'], yearLabel: '2o Ano', yearOrder: 2 },
  { id: IS_IDS[8], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Quimica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: IS_IDS[9], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: IS_IDS[10], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS['Estudos Literarios'], yearLabel: '2o Ano', yearOrder: 2 },
  { id: IS_IDS[11], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Geografia, yearLabel: '2o Ano', yearOrder: 2 },
  // Colegio Mobile — 3o Ano
  { id: IS_IDS[12], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '3o Ano', yearOrder: 3 },
  { id: IS_IDS[13], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Redacao, yearLabel: '3o Ano', yearOrder: 3 },
  { id: IS_IDS[14], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Quimica, yearLabel: '3o Ano', yearOrder: 3 },
  { id: IS_IDS[15], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Biologia, yearLabel: '3o Ano', yearOrder: 3 },
  { id: IS_IDS[16], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '3o Ano', yearOrder: 3 },
  { id: IS_IDS[17], institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Historia, yearLabel: '3o Ano', yearOrder: 3 },
  // Colegio Bandeirantes — 1o Ano
  { id: IS_IDS[18], institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '1o Ano', yearOrder: 1 },
  { id: IS_IDS[19], institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '1o Ano', yearOrder: 1 },
  { id: IS_IDS[20], institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS['Lingua Portuguesa'], yearLabel: '1o Ano', yearOrder: 1 },
  // Colegio Bandeirantes — 2o Ano
  { id: IS_IDS[21], institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Quimica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: IS_IDS[22], institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: IS_IDS[23], institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Biologia, yearLabel: '2o Ano', yearOrder: 2 },
  // Colegio Bandeirantes — 3o Ano
  { id: IS_IDS[24], institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Redacao, yearLabel: '3o Ano', yearOrder: 3 },
  { id: IS_IDS[25], institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '3o Ano', yearOrder: 3 },
  { id: IS_IDS[26], institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '3o Ano', yearOrder: 3 },
  // Colegio Vertice — 1o Ano
  { id: IS_IDS[27], institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '1o Ano', yearOrder: 1 },
  { id: IS_IDS[28], institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS['Lingua Portuguesa'], yearLabel: '1o Ano', yearOrder: 1 },
  // Colegio Vertice — 2o Ano
  { id: IS_IDS[29], institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS.Quimica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: IS_IDS[30], institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '2o Ano', yearOrder: 2 },
  // Colegio Vertice — 3o Ano
  { id: IS_IDS[31], institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS.Redacao, yearLabel: '3o Ano', yearOrder: 3 },
  { id: IS_IDS[32], institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '3o Ano', yearOrder: 3 },
];

// University institution-subjects — generated from course subject arrays
function isId(course: number, semester: number, index: number): string {
  const c = String(course).padStart(2, '0');
  const s = String(semester).padStart(2, '0');
  const n = String(index).padStart(2, '0');
  return `c0000000-${c}${s}-4${n}0-8000-000000000001`;
}

const COURSE_TO_INSTITUTION: Record<string, string> = {
  FGV_Admin: INSTITUTION_IDS.FGV,
  FGV_Economia: INSTITUTION_IDS.FGV,
  FGV_Direito: INSTITUTION_IDS.FGV,
  Insper_Admin: INSTITUTION_IDS.Insper,
  Insper_Economia: INSTITUTION_IDS.Insper,
  Insper_Direito: INSTITUTION_IDS.Insper,
  Insper_EngComp: INSTITUTION_IDS.Insper,
  Insper_EngMec: INSTITUTION_IDS.Insper,
  Insper_EngMecatronica: INSTITUTION_IDS.Insper,
  Insper_EngProd: INSTITUTION_IDS.Insper,
};

const COURSE_TO_INDEX: Record<string, number> = {
  FGV_Admin: 1,
  FGV_Economia: 2,
  FGV_Direito: 3,
  Insper_Admin: 4,
  Insper_Economia: 5,
  Insper_Direito: 6,
  Insper_EngComp: 7,
  Insper_EngMec: 8,
  Insper_EngMecatronica: 9,
  Insper_EngProd: 10,
};

// Build university institution-subjects
const universityInstitutionSubjects: {
  id: string;
  institutionId: string;
  subjectId: string;
  courseId: string;
  yearLabel: string;
  yearOrder: number;
}[] = [];

for (const { courseKey, subjects: courseSubs } of ALL_COURSE_SUBJECTS) {
  const courseIdx = COURSE_TO_INDEX[courseKey];
  const institutionId = COURSE_TO_INSTITUTION[courseKey];
  const courseId = COURSE_IDS[courseKey];

  for (const sub of courseSubs) {
    // Parse semester and index from subject ID: b0000000-CCSS-4NN0-8000-000000000001
    const parts = sub.id.split('-');
    const ccss = parts[1];
    const semester = parseInt(ccss.slice(2, 4), 10);
    const nn0 = parts[2];
    const index = parseInt(nn0.slice(1, 3), 10);

    universityInstitutionSubjects.push({
      id: isId(courseIdx, semester, index),
      institutionId,
      subjectId: sub.id,
      courseId,
      yearLabel: `Semestre ${semester}`,
      yearOrder: semester,
    });
  }
}

// ============================================================================
// USERS — 4 teacher users
// ============================================================================

const users = [
  {
    id: USER_IDS.Rafael,
    supabaseId: 'fake-supabase-rafael',
    name: 'Rafael Prado',
    email: 'rafael@docens.test',
    phone: '+55 11 99999-0001',
    role: 'TEACHER' as UserRole,
  },
  {
    id: USER_IDS.Luiza,
    supabaseId: 'fake-supabase-luiza',
    name: 'Luiza Costa',
    email: 'luiza@docens.test',
    phone: '+55 11 99999-0002',
    role: 'TEACHER' as UserRole,
  },
  {
    id: USER_IDS.Carlos,
    supabaseId: 'fake-supabase-carlos',
    name: 'Carlos Mendes',
    email: 'carlos@docens.test',
    phone: '+55 11 99999-0003',
    role: 'TEACHER' as UserRole,
  },
  {
    id: USER_IDS.Mariana,
    supabaseId: 'fake-supabase-mariana',
    name: 'Mariana Silva',
    email: 'mariana@docens.test',
    phone: '+55 11 99999-0004',
    role: 'TEACHER' as UserRole,
  },
];

// ============================================================================
// TEACHER PROFILES
// ============================================================================

const teacherProfiles = [
  {
    id: TEACHER_PROFILE_IDS.Rafael,
    userId: USER_IDS.Rafael,
    photo: 'RP',
    headline: 'Especialista em Calculo e Estatistica',
    bio: 'Professor com 10 anos de experiencia em universidades de Sao Paulo. Mestrado em Matematica Aplicada pela USP.',
    isVerified: true,
  },
  {
    id: TEACHER_PROFILE_IDS.Luiza,
    userId: USER_IDS.Luiza,
    photo: 'LC',
    headline: 'Professora de Direito e Redacao',
    bio: 'Advogada e educadora. Doutora em Direito Constitucional pela FGV. Apaixonada por ensino.',
    isVerified: true,
  },
  {
    id: TEACHER_PROFILE_IDS.Carlos,
    userId: USER_IDS.Carlos,
    photo: 'CM',
    headline: 'Professor de Matematica e Fisica',
    bio: 'Engenheiro e professor. Mais de 15 anos preparando alunos para vestibulares e concursos.',
    isVerified: true,
  },
  {
    id: TEACHER_PROFILE_IDS.Mariana,
    userId: USER_IDS.Mariana,
    photo: 'MS',
    headline: 'Especialista em Calculo e Fisica',
    bio: 'Doutora em Fisica pela Unicamp. Experiencia em universidades de tecnologia e engenharia.',
    isVerified: true,
  },
];

// ============================================================================
// TEACHER-INSTITUTION JUNCTION ROWS
// ============================================================================

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

// ============================================================================
// TEACHER-SUBJECT JUNCTION ROWS
// ============================================================================

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

// ============================================================================
// CLASS EVENTS — 8 events
// ============================================================================

const classEvents = [
  {
    id: CLASS_EVENT_IDS['Rafael-Calculo-Insper'],
    title: 'Calculo I - Limites e Derivadas',
    description: 'Aula intensiva sobre limites, continuidade e derivadas. Ideal para revisao antes da P1.',
    teacherProfileId: TEACHER_PROFILE_IDS.Rafael,
    subjectId: SUBJECT_IDS['Calculo I'],
    institutionId: INSTITUTION_IDS.Insper,
    startsAt: new Date('2026-03-15T14:00:00Z'),
    durationMin: 90,
    priceCents: 9900,
    capacity: 50,
    soldSeats: 22,
    publicationStatus: 'PUBLISHED' as PublicationStatus,
    meetingStatus: 'LOCKED' as MeetingStatus,
    meetingUrl: null,
  },
  {
    id: CLASS_EVENT_IDS['Rafael-Estatistica-Insper'],
    title: 'Estatistica Descritiva - Medidas de Tendencia Central',
    description: 'Revisao completa de media, mediana, moda e desvio padrao com exercicios praticos.',
    teacherProfileId: TEACHER_PROFILE_IDS.Rafael,
    subjectId: SUBJECT_IDS.Estatistica,
    institutionId: INSTITUTION_IDS.Insper,
    startsAt: new Date('2026-03-22T10:00:00Z'),
    durationMin: 60,
    priceCents: 7900,
    capacity: 40,
    soldSeats: 15,
    publicationStatus: 'PUBLISHED' as PublicationStatus,
    meetingStatus: 'LOCKED' as MeetingStatus,
    meetingUrl: null,
  },
  {
    id: CLASS_EVENT_IDS['Luiza-DirConst-FGV'],
    title: 'Direito Constitucional - Principios Fundamentais',
    description: 'Estudo aprofundado dos principios fundamentais da Constituicao Federal de 1988.',
    teacherProfileId: TEACHER_PROFILE_IDS.Luiza,
    subjectId: SUBJECT_IDS['Direito Constitucional'],
    institutionId: INSTITUTION_IDS.FGV,
    startsAt: new Date('2026-04-05T19:00:00Z'),
    durationMin: 120,
    priceCents: 14900,
    capacity: 80,
    soldSeats: 45,
    publicationStatus: 'PUBLISHED' as PublicationStatus,
    meetingStatus: 'LOCKED' as MeetingStatus,
    meetingUrl: null,
  },
  {
    id: CLASS_EVENT_IDS['Carlos-Matematica-Mobile'],
    title: 'Matematica - Funcoes Exponenciais e Logaritmicas',
    description: 'Revisao de funcoes exponenciais e logaritmicas com foco em vestibular.',
    teacherProfileId: TEACHER_PROFILE_IDS.Carlos,
    subjectId: SUBJECT_IDS.Matematica,
    institutionId: INSTITUTION_IDS['Col. Mobile'],
    startsAt: new Date('2026-04-10T15:00:00Z'),
    durationMin: 90,
    priceCents: 5900,
    capacity: 30,
    soldSeats: 10,
    publicationStatus: 'PUBLISHED' as PublicationStatus,
    meetingStatus: 'LOCKED' as MeetingStatus,
    meetingUrl: null,
  },
  {
    id: CLASS_EVENT_IDS['Carlos-Fisica-Bandeirantes'],
    title: 'Fisica - Cinematica Escalar',
    description: 'Aula sobre MRU e MRUV com resolucao de exercicios classicos de vestibular.',
    teacherProfileId: TEACHER_PROFILE_IDS.Carlos,
    subjectId: SUBJECT_IDS.Fisica,
    institutionId: INSTITUTION_IDS['Col. Bandeirantes'],
    startsAt: new Date('2026-01-20T14:00:00Z'),
    durationMin: 90,
    priceCents: 6900,
    capacity: 60,
    soldSeats: 48,
    publicationStatus: 'FINISHED' as PublicationStatus,
    meetingStatus: 'RELEASED' as MeetingStatus,
    meetingUrl: 'https://meet.docens.app/fisica-cinematica-abc123',
  },
  {
    id: CLASS_EVENT_IDS['Mariana-Fisica-Insper'],
    title: 'Fisica - Termodinamica e Calorimetria',
    description: 'Conceitos fundamentais de termodinamica aplicados a problemas de engenharia.',
    teacherProfileId: TEACHER_PROFILE_IDS.Mariana,
    subjectId: SUBJECT_IDS.Fisica,
    institutionId: INSTITUTION_IDS.Insper,
    startsAt: new Date('2026-02-10T16:00:00Z'),
    durationMin: 60,
    priceCents: 8900,
    capacity: 45,
    soldSeats: 38,
    publicationStatus: 'FINISHED' as PublicationStatus,
    meetingStatus: 'LOCKED' as MeetingStatus,
    meetingUrl: null,
  },
  {
    id: CLASS_EVENT_IDS['Mariana-Calculo-Inteli'],
    title: 'Calculo I - Integrais Definidas (RASCUNHO)',
    description: 'Aula sobre integrais definidas e o Teorema Fundamental do Calculo. Ainda em preparacao.',
    teacherProfileId: TEACHER_PROFILE_IDS.Mariana,
    subjectId: SUBJECT_IDS['Calculo I'],
    institutionId: INSTITUTION_IDS.Inteli,
    startsAt: new Date('2026-04-20T10:00:00Z'),
    durationMin: 90,
    priceCents: 9900,
    capacity: 35,
    soldSeats: 0,
    publicationStatus: 'DRAFT' as PublicationStatus,
    meetingStatus: 'LOCKED' as MeetingStatus,
    meetingUrl: null,
  },
  {
    id: CLASS_EVENT_IDS['Luiza-Redacao-FGV'],
    title: 'Redacao Argumentativa - Estrutura e Coesao (RASCUNHO)',
    description: 'Tecnicas de redacao argumentativa para provas discursivas. Ainda sendo revisada.',
    teacherProfileId: TEACHER_PROFILE_IDS.Luiza,
    subjectId: SUBJECT_IDS.Redacao,
    institutionId: INSTITUTION_IDS.FGV,
    startsAt: new Date('2026-03-30T18:00:00Z'),
    durationMin: 120,
    priceCents: 19900,
    capacity: 100,
    soldSeats: 0,
    publicationStatus: 'DRAFT' as PublicationStatus,
    meetingStatus: 'LOCKED' as MeetingStatus,
    meetingUrl: null,
  },
];

// ============================================================================
// STUDENT USERS
// ============================================================================

const studentUsers = [
  {
    id: STUDENT_USER_IDS.Ana,
    supabaseId: 'fake-supabase-ana',
    name: 'Ana Silva',
    email: 'ana@docens.test',
    phone: '+55 11 98888-0001',
    role: 'STUDENT' as UserRole,
  },
  {
    id: STUDENT_USER_IDS.CarlosAluno,
    supabaseId: 'fake-supabase-carlos-aluno',
    name: 'Carlos Aluno Mendes',
    email: 'carlos.aluno@docens.test',
    phone: '+55 11 98888-0002',
    role: 'STUDENT' as UserRole,
  },
  {
    id: STUDENT_USER_IDS.Beatriz,
    supabaseId: 'fake-supabase-beatriz',
    name: 'Beatriz Santos',
    email: 'beatriz@docens.test',
    phone: '+55 11 98888-0003',
    role: 'STUDENT' as UserRole,
  },
];

// ============================================================================
// STUDENT PROFILES
// ============================================================================

const studentProfiles = [
  {
    id: STUDENT_PROFILE_IDS.Ana,
    userId: STUDENT_USER_IDS.Ana,
    preferredInstitutionId: INSTITUTION_IDS.Insper,
    labels: ['vestibular', 'engenharia'],
  },
  {
    id: STUDENT_PROFILE_IDS.CarlosAluno,
    userId: STUDENT_USER_IDS.CarlosAluno,
    preferredInstitutionId: INSTITUTION_IDS.Inteli,
    labels: ['tecnologia'],
  },
  {
    id: STUDENT_PROFILE_IDS.Beatriz,
    userId: STUDENT_USER_IDS.Beatriz,
    preferredInstitutionId: INSTITUTION_IDS.FGV,
    labels: ['direito', 'concurso'],
  },
];

// ============================================================================
// STUDENT-INSTITUTION JUNCTION ROWS
// ============================================================================

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
  for (const is of schoolInstitutionSubjects) {
    await prisma.institutionSubject.create({ data: is });
  }
  await prisma.institutionSubject.createMany({ data: universityInstitutionSubjects });
  const totalIS = schoolInstitutionSubjects.length + universityInstitutionSubjects.length;
  console.log(`  ${totalIS} institution-subject associations seeded.`);

  console.log('Seeding users...');
  await prisma.user.createMany({ data: users });
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
  await prisma.user.createMany({ data: studentUsers });
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
  USER_IDS,
  TEACHER_PROFILE_IDS,
  CLASS_EVENT_IDS,
  STUDENT_USER_IDS,
  STUDENT_PROFILE_IDS,
};
