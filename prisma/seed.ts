import {
  PrismaClient,
  InstitutionType,
  UserRole,
  PublicationStatus,
  MeetingStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// SEED MAP: human-readable name -> stable UUID
// These UUIDs are fixed for the lifetime of the project.
// Phase 5 (frontend integration) will reference this map to replace mock IDs.
// ============================================================================

const INSTITUTION_IDS = {
  FGV: 'aaaaaaaa-0001-0001-0001-000000000001',
  Insper: 'aaaaaaaa-0001-0001-0001-000000000002',
  Inteli: 'aaaaaaaa-0001-0001-0001-000000000003',
  'Col. Mobile': 'aaaaaaaa-0001-0001-0001-000000000004',
  'Col. Bandeirantes': 'aaaaaaaa-0001-0001-0001-000000000005',
  'Col. Vertice': 'aaaaaaaa-0001-0001-0001-000000000006',
};

const SUBJECT_IDS = {
  'Calculo I': 'bbbbbbbb-0002-0002-0002-000000000001',
  'Direito Constitucional': 'bbbbbbbb-0002-0002-0002-000000000002',
  Fisica: 'bbbbbbbb-0002-0002-0002-000000000003',
  Redacao: 'bbbbbbbb-0002-0002-0002-000000000004',
  Matematica: 'bbbbbbbb-0002-0002-0002-000000000005',
  'Lingua Portuguesa': 'bbbbbbbb-0002-0002-0002-000000000006',
  Biologia: 'bbbbbbbb-0002-0002-0002-000000000007',
  Quimica: 'bbbbbbbb-0002-0002-0002-000000000008',
  Historia: 'bbbbbbbb-0002-0002-0002-000000000009',
  'Estudos Literarios': 'bbbbbbbb-0002-0002-0002-000000000010',
  Geografia: 'bbbbbbbb-0002-0002-0002-000000000011',
  Estatistica: 'bbbbbbbb-0002-0002-0002-000000000012',
  Ingles: 'bbbbbbbb-0002-0002-0002-000000000013',
};

const USER_IDS = {
  Rafael: 'dddddddd-0004-0004-0004-000000000001',
  Luiza: 'dddddddd-0004-0004-0004-000000000002',
  Carlos: 'dddddddd-0004-0004-0004-000000000003',
  Mariana: 'dddddddd-0004-0004-0004-000000000004',
};

const TEACHER_PROFILE_IDS = {
  Rafael: 'eeeeeeee-0005-0005-0005-000000000001',
  Luiza: 'eeeeeeee-0005-0005-0005-000000000002',
  Carlos: 'eeeeeeee-0005-0005-0005-000000000003',
  Mariana: 'eeeeeeee-0005-0005-0005-000000000004',
};

const STUDENT_USER_IDS = {
  Ana: 'dddddddd-0004-0004-0004-000000000010',
  CarlosAluno: 'dddddddd-0004-0004-0004-000000000011',
  Beatriz: 'dddddddd-0004-0004-0004-000000000012',
};

const STUDENT_PROFILE_IDS = {
  Ana: 'eeeeeeee-0005-0005-0005-000000000010',
  CarlosAluno: 'eeeeeeee-0005-0005-0005-000000000011',
  Beatriz: 'eeeeeeee-0005-0005-0005-000000000012',
};

const CLASS_EVENT_IDS = {
  'Rafael-Calculo-Insper': '22222222-0008-0008-0008-000000000001',
  'Rafael-Estatistica-Insper': '22222222-0008-0008-0008-000000000002',
  'Luiza-DirConst-FGV': '22222222-0008-0008-0008-000000000003',
  'Luiza-Redacao-FGV': '22222222-0008-0008-0008-000000000004',
  'Carlos-Matematica-Mobile': '22222222-0008-0008-0008-000000000005',
  'Carlos-Fisica-Bandeirantes': '22222222-0008-0008-0008-000000000006',
  'Mariana-Calculo-Inteli': '22222222-0008-0008-0008-000000000007',
  'Mariana-Fisica-Insper': '22222222-0008-0008-0008-000000000008',
};

// ============================================================================
// INSTITUTIONS — mirrors docsens-front/lib/domain.ts
// ============================================================================

const institutions = [
  {
    id: INSTITUTION_IDS.FGV,
    name: 'Fundacao Getulio Vargas',
    shortName: 'FGV',
    city: 'Sao Paulo',
    type: 'UNIVERSITY' as InstitutionType,
    logoUrl: '/imgs/faculdades/fgv-logo-0.png',
  },
  {
    id: INSTITUTION_IDS.Insper,
    name: 'Insper Instituto de Ensino e Pesquisa',
    shortName: 'Insper',
    city: 'Sao Paulo',
    type: 'UNIVERSITY' as InstitutionType,
    logoUrl: '/imgs/faculdades/INsper.png',
  },
  {
    id: INSTITUTION_IDS.Inteli,
    name: 'Inteli - Instituto de Tecnologia e Lideranca',
    shortName: 'Inteli',
    city: 'Sao Paulo',
    type: 'UNIVERSITY' as InstitutionType,
    logoUrl: '/imgs/faculdades/inteli-logo.png',
  },
  {
    id: INSTITUTION_IDS['Col. Mobile'],
    name: 'Colegio Mobile',
    shortName: 'Mobile',
    city: 'Sao Paulo',
    type: 'SCHOOL' as InstitutionType,
    logoUrl: '/imgs/escolas/mobile.png',
  },
  {
    id: INSTITUTION_IDS['Col. Bandeirantes'],
    name: 'Colegio Bandeirantes',
    shortName: 'Band',
    city: 'Sao Paulo',
    type: 'SCHOOL' as InstitutionType,
    logoUrl: '/imgs/escolas/Band-logo.jpg',
  },
  {
    id: INSTITUTION_IDS['Col. Vertice'],
    name: 'Colegio Vertice',
    shortName: 'Vertice',
    city: 'Sao Paulo',
    type: 'SCHOOL' as InstitutionType,
    logoUrl: '/imgs/escolas/vertice.png',
  },
];

// ============================================================================
// SUBJECTS — 13 subjects from domain.ts
// ============================================================================

const subjects = [
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

// ============================================================================
// INSTITUTION-SUBJECT ASSOCIATIONS — mirrors domain.ts institutionSubjects
// Deterministic UUID pattern: cccccccc-0003-0003-0003-{padded index}
// ============================================================================

function isId(index: number): string {
  return `cccccccc-0003-0003-0003-${String(index).padStart(12, '0')}`;
}

const institutionSubjects = [
  // Colegio Mobile — 1o Ano
  { id: isId(1), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '1o Ano', yearOrder: 1 },
  { id: isId(2), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS['Lingua Portuguesa'], yearLabel: '1o Ano', yearOrder: 1 },
  { id: isId(3), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Biologia, yearLabel: '1o Ano', yearOrder: 1 },
  { id: isId(4), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '1o Ano', yearOrder: 1 },
  { id: isId(5), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Historia, yearLabel: '1o Ano', yearOrder: 1 },
  { id: isId(6), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Ingles, yearLabel: '1o Ano', yearOrder: 1 },

  // Colegio Mobile — 2o Ano
  { id: isId(7), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: isId(8), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS['Lingua Portuguesa'], yearLabel: '2o Ano', yearOrder: 2 },
  { id: isId(9), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Quimica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: isId(10), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: isId(11), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS['Estudos Literarios'], yearLabel: '2o Ano', yearOrder: 2 },
  { id: isId(12), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Geografia, yearLabel: '2o Ano', yearOrder: 2 },

  // Colegio Mobile — 3o Ano
  { id: isId(13), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '3o Ano', yearOrder: 3 },
  { id: isId(14), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Redacao, yearLabel: '3o Ano', yearOrder: 3 },
  { id: isId(15), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Quimica, yearLabel: '3o Ano', yearOrder: 3 },
  { id: isId(16), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Biologia, yearLabel: '3o Ano', yearOrder: 3 },
  { id: isId(17), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '3o Ano', yearOrder: 3 },
  { id: isId(18), institutionId: INSTITUTION_IDS['Col. Mobile'], subjectId: SUBJECT_IDS.Historia, yearLabel: '3o Ano', yearOrder: 3 },

  // Colegio Bandeirantes — 1o Ano
  { id: isId(19), institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '1o Ano', yearOrder: 1 },
  { id: isId(20), institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '1o Ano', yearOrder: 1 },
  { id: isId(21), institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS['Lingua Portuguesa'], yearLabel: '1o Ano', yearOrder: 1 },

  // Colegio Bandeirantes — 2o Ano
  { id: isId(22), institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Quimica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: isId(23), institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: isId(24), institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Biologia, yearLabel: '2o Ano', yearOrder: 2 },

  // Colegio Bandeirantes — 3o Ano
  { id: isId(25), institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Redacao, yearLabel: '3o Ano', yearOrder: 3 },
  { id: isId(26), institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '3o Ano', yearOrder: 3 },
  { id: isId(27), institutionId: INSTITUTION_IDS['Col. Bandeirantes'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '3o Ano', yearOrder: 3 },

  // Colegio Vertice — 1o Ano
  { id: isId(28), institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '1o Ano', yearOrder: 1 },
  { id: isId(29), institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS['Lingua Portuguesa'], yearLabel: '1o Ano', yearOrder: 1 },

  // Colegio Vertice — 2o Ano
  { id: isId(30), institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS.Quimica, yearLabel: '2o Ano', yearOrder: 2 },
  { id: isId(31), institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS.Fisica, yearLabel: '2o Ano', yearOrder: 2 },

  // Colegio Vertice — 3o Ano
  { id: isId(32), institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS.Redacao, yearLabel: '3o Ano', yearOrder: 3 },
  { id: isId(33), institutionId: INSTITUTION_IDS['Col. Vertice'], subjectId: SUBJECT_IDS.Matematica, yearLabel: '3o Ano', yearOrder: 3 },

  // FGV — Graduacao em Direito
  { id: isId(34), institutionId: INSTITUTION_IDS.FGV, subjectId: SUBJECT_IDS.Redacao, yearLabel: '1o Periodo', yearOrder: 1 },
  { id: isId(35), institutionId: INSTITUTION_IDS.FGV, subjectId: SUBJECT_IDS['Direito Constitucional'], yearLabel: '2o Periodo', yearOrder: 2 },
  { id: isId(36), institutionId: INSTITUTION_IDS.FGV, subjectId: SUBJECT_IDS['Direito Constitucional'], yearLabel: '3o Periodo', yearOrder: 3 },
  { id: isId(37), institutionId: INSTITUTION_IDS.FGV, subjectId: SUBJECT_IDS['Calculo I'], yearLabel: '3o Periodo', yearOrder: 3 },

  // Insper — Engenharia / Administracao
  { id: isId(38), institutionId: INSTITUTION_IDS.Insper, subjectId: SUBJECT_IDS['Calculo I'], yearLabel: '1o Periodo', yearOrder: 1 },
  { id: isId(39), institutionId: INSTITUTION_IDS.Insper, subjectId: SUBJECT_IDS.Fisica, yearLabel: '1o Periodo', yearOrder: 1 },
  { id: isId(40), institutionId: INSTITUTION_IDS.Insper, subjectId: SUBJECT_IDS['Calculo I'], yearLabel: '2o Periodo', yearOrder: 2 },
  { id: isId(41), institutionId: INSTITUTION_IDS.Insper, subjectId: SUBJECT_IDS.Estatistica, yearLabel: '2o Periodo', yearOrder: 2 },
  { id: isId(42), institutionId: INSTITUTION_IDS.Insper, subjectId: SUBJECT_IDS.Estatistica, yearLabel: '3o Periodo', yearOrder: 3 },

  // Inteli — Tecnologia e Lideranca
  { id: isId(43), institutionId: INSTITUTION_IDS.Inteli, subjectId: SUBJECT_IDS['Calculo I'], yearLabel: '1o Periodo', yearOrder: 1 },
  { id: isId(44), institutionId: INSTITUTION_IDS.Inteli, subjectId: SUBJECT_IDS.Fisica, yearLabel: '1o Periodo', yearOrder: 1 },
  { id: isId(45), institutionId: INSTITUTION_IDS.Inteli, subjectId: SUBJECT_IDS.Estatistica, yearLabel: '2o Periodo', yearOrder: 2 },
  { id: isId(46), institutionId: INSTITUTION_IDS.Inteli, subjectId: SUBJECT_IDS['Calculo I'], yearLabel: '2o Periodo', yearOrder: 2 },
];

// ============================================================================
// USERS — 4 teacher users with fake supabaseId (seed only, not real auth)
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
// TEACHER PROFILES — photo (2-char initials), headline, bio
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
// Deterministic UUID pattern: ffffffff-0006-0006-0006-{padded index}
// ============================================================================

const teacherInstitutions = [
  // Rafael -> Insper, FGV
  { id: 'ffffffff-0006-0006-0006-000000000001', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, institutionId: INSTITUTION_IDS.Insper },
  { id: 'ffffffff-0006-0006-0006-000000000002', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, institutionId: INSTITUTION_IDS.FGV },
  // Luiza -> FGV, Mobile
  { id: 'ffffffff-0006-0006-0006-000000000003', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, institutionId: INSTITUTION_IDS.FGV },
  { id: 'ffffffff-0006-0006-0006-000000000004', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, institutionId: INSTITUTION_IDS['Col. Mobile'] },
  // Carlos -> Mobile, Bandeirantes
  { id: 'ffffffff-0006-0006-0006-000000000005', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, institutionId: INSTITUTION_IDS['Col. Mobile'] },
  { id: 'ffffffff-0006-0006-0006-000000000006', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, institutionId: INSTITUTION_IDS['Col. Bandeirantes'] },
  // Mariana -> Inteli, Insper
  { id: 'ffffffff-0006-0006-0006-000000000007', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, institutionId: INSTITUTION_IDS.Inteli },
  { id: 'ffffffff-0006-0006-0006-000000000008', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, institutionId: INSTITUTION_IDS.Insper },
];

// ============================================================================
// TEACHER-SUBJECT JUNCTION ROWS
// Deterministic UUID pattern: 11111111-0007-0007-0007-{padded index}
// ============================================================================

const teacherSubjects = [
  // Rafael -> Calculo I, Estatistica
  { id: '11111111-0007-0007-0007-000000000001', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, subjectId: SUBJECT_IDS['Calculo I'] },
  { id: '11111111-0007-0007-0007-000000000002', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, subjectId: SUBJECT_IDS.Estatistica },
  // Luiza -> Direito Constitucional, Redacao
  { id: '11111111-0007-0007-0007-000000000003', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, subjectId: SUBJECT_IDS['Direito Constitucional'] },
  { id: '11111111-0007-0007-0007-000000000004', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, subjectId: SUBJECT_IDS.Redacao },
  // Carlos -> Matematica, Fisica
  { id: '11111111-0007-0007-0007-000000000005', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, subjectId: SUBJECT_IDS.Matematica },
  { id: '11111111-0007-0007-0007-000000000006', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, subjectId: SUBJECT_IDS.Fisica },
  // Mariana -> Calculo I, Fisica
  { id: '11111111-0007-0007-0007-000000000007', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, subjectId: SUBJECT_IDS['Calculo I'] },
  { id: '11111111-0007-0007-0007-000000000008', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, subjectId: SUBJECT_IDS.Fisica },
];

// ============================================================================
// CLASS EVENTS — 8 events across different institutions, subjects, teachers
// 4 PUBLISHED (future), 2 FINISHED (past), 2 DRAFT (excluded from browse)
// ============================================================================

const classEvents = [
  // --- 4 PUBLISHED events (future dates: March/April 2026) ---
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

  // --- 2 FINISHED events (past dates: January/February 2026) ---
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

  // --- 2 DRAFT events (should NEVER appear in browse results) ---
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
// STUDENT USERS — 3 student users for enrollment/payment testing
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
// Deterministic UUID pattern: gggggggg-0009-0009-0009-{padded index}
// ============================================================================

const studentInstitutions = [
  // Ana -> FGV, Insper
  { id: 'gggggggg-0009-0009-0009-000000000001', studentProfileId: STUDENT_PROFILE_IDS.Ana, institutionId: INSTITUTION_IDS.FGV },
  { id: 'gggggggg-0009-0009-0009-000000000002', studentProfileId: STUDENT_PROFILE_IDS.Ana, institutionId: INSTITUTION_IDS.Insper },
  // CarlosAluno -> Inteli
  { id: 'gggggggg-0009-0009-0009-000000000003', studentProfileId: STUDENT_PROFILE_IDS.CarlosAluno, institutionId: INSTITUTION_IDS.Inteli },
  // Beatriz -> FGV, Col. Bandeirantes
  { id: 'gggggggg-0009-0009-0009-000000000004', studentProfileId: STUDENT_PROFILE_IDS.Beatriz, institutionId: INSTITUTION_IDS.FGV },
  { id: 'gggggggg-0009-0009-0009-000000000005', studentProfileId: STUDENT_PROFILE_IDS.Beatriz, institutionId: INSTITUTION_IDS['Col. Bandeirantes'] },
];

// ============================================================================
// SEED EXECUTION — idempotent via upsert
// FK order: subjects + institutions -> institution-subjects -> users ->
//           teacher profiles -> junction tables -> class events
// ============================================================================

async function main() {
  console.log('Seeding subjects...');
  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { id: subject.id },
      update: {},
      create: subject,
    });
  }
  console.log(`  ${subjects.length} subjects seeded.`);

  console.log('Seeding institutions...');
  for (const institution of institutions) {
    await prisma.institution.upsert({
      where: { id: institution.id },
      update: {},
      create: institution,
    });
  }
  console.log(`  ${institutions.length} institutions seeded.`);

  console.log('Seeding institution-subject associations...');
  for (const is of institutionSubjects) {
    await prisma.institutionSubject.upsert({
      where: { id: is.id },
      update: {},
      create: is,
    });
  }
  console.log(`  ${institutionSubjects.length} institution-subject associations seeded.`);

  console.log('Seeding users...');
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
  }
  console.log(`  ${users.length} users seeded.`);

  console.log('Seeding teacher profiles...');
  for (const profile of teacherProfiles) {
    await prisma.teacherProfile.upsert({
      where: { id: profile.id },
      update: {},
      create: profile,
    });
  }
  console.log(`  ${teacherProfiles.length} teacher profiles seeded.`);

  console.log('Seeding teacher-institution associations...');
  for (const ti of teacherInstitutions) {
    await prisma.teacherInstitution.upsert({
      where: { id: ti.id },
      update: {},
      create: ti,
    });
  }
  console.log(`  ${teacherInstitutions.length} teacher-institution associations seeded.`);

  console.log('Seeding teacher-subject associations...');
  for (const ts of teacherSubjects) {
    await prisma.teacherSubject.upsert({
      where: { id: ts.id },
      update: {},
      create: ts,
    });
  }
  console.log(`  ${teacherSubjects.length} teacher-subject associations seeded.`);

  console.log('Seeding class events...');
  for (const event of classEvents) {
    await prisma.classEvent.upsert({
      where: { id: event.id },
      update: {},
      create: event,
    });
  }
  console.log(`  ${classEvents.length} class events seeded.`);

  console.log('Seeding student users...');
  for (const user of studentUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
  }
  console.log(`  ${studentUsers.length} student users seeded.`);

  console.log('Seeding student profiles...');
  for (const profile of studentProfiles) {
    await prisma.studentProfile.upsert({
      where: { id: profile.id },
      update: {},
      create: profile,
    });
  }
  console.log(`  ${studentProfiles.length} student profiles seeded.`);

  console.log('Seeding student-institution associations...');
  for (const si of studentInstitutions) {
    await prisma.studentInstitution.upsert({
      where: { id: si.id },
      update: {},
      create: si,
    });
  }
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
// EXPORTED ID MAPS — for test files and future reference
// ============================================================================
export {
  INSTITUTION_IDS,
  SUBJECT_IDS,
  USER_IDS,
  TEACHER_PROFILE_IDS,
  CLASS_EVENT_IDS,
  STUDENT_USER_IDS,
  STUDENT_PROFILE_IDS,
};
