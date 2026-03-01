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
// ============================================================================

// Pre-generated v4 UUIDs for institution-subject junction rows
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
  'c57098cd-8551-4fd9-adff-cd25b597bb18', 'b99545bc-6489-463c-8539-5b5d0b7d47c7',
  '3959062d-a4d6-44e1-b5cd-d8b47693341b', 'e16422c0-fa25-4de7-8a19-f36d06de702b',
  '463921b0-790d-4267-a53a-1e8b85b14bf4', '48c290e8-d031-4446-8a1c-2a5f033823ed',
  'e08eb703-a688-4a7e-b02d-77c9e06d2ec0', '7ab8b8e9-8733-4ba8-93a3-e4ebcf8214bf',
  'de1d8e56-04bc-4e2e-bc9c-f58a976e072f', '809f24ec-1462-4cea-b39c-98e01a00db38',
  '86878100-e960-4477-8bdf-2c4fad6679a4', '1b2597cb-fcc3-451c-9308-8b3a11513684',
  '632d3163-368f-4387-915d-ecbca6e4f9b7', '5e673aa8-6be3-4143-a652-142fb23104b7',
];

const institutionSubjects = [
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

  // FGV — Graduacao em Direito
  { id: IS_IDS[33], institutionId: INSTITUTION_IDS.FGV, subjectId: SUBJECT_IDS.Redacao, yearLabel: '1o Periodo', yearOrder: 1 },
  { id: IS_IDS[34], institutionId: INSTITUTION_IDS.FGV, subjectId: SUBJECT_IDS['Direito Constitucional'], yearLabel: '2o Periodo', yearOrder: 2 },
  { id: IS_IDS[35], institutionId: INSTITUTION_IDS.FGV, subjectId: SUBJECT_IDS['Direito Constitucional'], yearLabel: '3o Periodo', yearOrder: 3 },
  { id: IS_IDS[36], institutionId: INSTITUTION_IDS.FGV, subjectId: SUBJECT_IDS['Calculo I'], yearLabel: '3o Periodo', yearOrder: 3 },

  // Insper — Engenharia / Administracao
  { id: IS_IDS[37], institutionId: INSTITUTION_IDS.Insper, subjectId: SUBJECT_IDS['Calculo I'], yearLabel: '1o Periodo', yearOrder: 1 },
  { id: IS_IDS[38], institutionId: INSTITUTION_IDS.Insper, subjectId: SUBJECT_IDS.Fisica, yearLabel: '1o Periodo', yearOrder: 1 },
  { id: IS_IDS[39], institutionId: INSTITUTION_IDS.Insper, subjectId: SUBJECT_IDS['Calculo I'], yearLabel: '2o Periodo', yearOrder: 2 },
  { id: IS_IDS[40], institutionId: INSTITUTION_IDS.Insper, subjectId: SUBJECT_IDS.Estatistica, yearLabel: '2o Periodo', yearOrder: 2 },
  { id: IS_IDS[41], institutionId: INSTITUTION_IDS.Insper, subjectId: SUBJECT_IDS.Estatistica, yearLabel: '3o Periodo', yearOrder: 3 },

  // Inteli — Tecnologia e Lideranca
  { id: IS_IDS[42], institutionId: INSTITUTION_IDS.Inteli, subjectId: SUBJECT_IDS['Calculo I'], yearLabel: '1o Periodo', yearOrder: 1 },
  { id: IS_IDS[43], institutionId: INSTITUTION_IDS.Inteli, subjectId: SUBJECT_IDS.Fisica, yearLabel: '1o Periodo', yearOrder: 1 },
  { id: IS_IDS[44], institutionId: INSTITUTION_IDS.Inteli, subjectId: SUBJECT_IDS.Estatistica, yearLabel: '2o Periodo', yearOrder: 2 },
  { id: IS_IDS[45], institutionId: INSTITUTION_IDS.Inteli, subjectId: SUBJECT_IDS['Calculo I'], yearLabel: '2o Periodo', yearOrder: 2 },
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
// ============================================================================

const teacherInstitutions = [
  // Rafael -> Insper, FGV
  { id: '4a915dd6-ae26-4f4d-b709-598814a18da8', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, institutionId: INSTITUTION_IDS.Insper },
  { id: 'fe1862dd-c3a3-429a-bc9b-62a19e7eab76', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, institutionId: INSTITUTION_IDS.FGV },
  // Luiza -> FGV, Mobile
  { id: '50a5475e-263b-403e-b0fa-c910fc1e6d27', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, institutionId: INSTITUTION_IDS.FGV },
  { id: '799a0a5b-22a0-42aa-8bb6-84d73efc26ca', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, institutionId: INSTITUTION_IDS['Col. Mobile'] },
  // Carlos -> Mobile, Bandeirantes
  { id: '5f0eeed6-79f5-4bd2-8b86-e58583235e03', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, institutionId: INSTITUTION_IDS['Col. Mobile'] },
  { id: '2dd60565-8b31-4845-b725-5fafa7a910bf', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, institutionId: INSTITUTION_IDS['Col. Bandeirantes'] },
  // Mariana -> Inteli, Insper
  { id: '79fbfcdf-4f2b-48a6-8f42-315fcf8dbedd', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, institutionId: INSTITUTION_IDS.Inteli },
  { id: '63deed0b-c9e6-4979-a3b4-211859ec5dcd', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, institutionId: INSTITUTION_IDS.Insper },
];

// ============================================================================
// TEACHER-SUBJECT JUNCTION ROWS
// ============================================================================

const teacherSubjects = [
  // Rafael -> Calculo I, Estatistica
  { id: '08f159e8-cc15-450c-9c01-d140d19aae6a', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, subjectId: SUBJECT_IDS['Calculo I'] },
  { id: '3883b760-fb5f-4a6b-95f6-b51c8869ee87', teacherProfileId: TEACHER_PROFILE_IDS.Rafael, subjectId: SUBJECT_IDS.Estatistica },
  // Luiza -> Direito Constitucional, Redacao
  { id: '3fa98070-0e18-4e7a-82d1-49997afe9a64', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, subjectId: SUBJECT_IDS['Direito Constitucional'] },
  { id: '10aac7d1-645b-42ab-acb6-6257903f7dde', teacherProfileId: TEACHER_PROFILE_IDS.Luiza, subjectId: SUBJECT_IDS.Redacao },
  // Carlos -> Matematica, Fisica
  { id: '820dafc0-af33-4e97-ab5f-b7e5116de1f2', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, subjectId: SUBJECT_IDS.Matematica },
  { id: '07ece264-91ce-47b8-a4c3-eed0f5b785f5', teacherProfileId: TEACHER_PROFILE_IDS.Carlos, subjectId: SUBJECT_IDS.Fisica },
  // Mariana -> Calculo I, Fisica
  { id: '69577ca3-822e-4fd9-85d9-f2466299fc5b', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, subjectId: SUBJECT_IDS['Calculo I'] },
  { id: '90de48ae-e825-4afd-bbfc-69d8fb5d06c2', teacherProfileId: TEACHER_PROFILE_IDS.Mariana, subjectId: SUBJECT_IDS.Fisica },
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
// ============================================================================

const studentInstitutions = [
  // Ana -> FGV, Insper
  { id: '2490d37e-586e-4ffe-a001-f305c44f5e43', studentProfileId: STUDENT_PROFILE_IDS.Ana, institutionId: INSTITUTION_IDS.FGV },
  { id: 'f4074e89-bc9d-4df2-960a-dda0e20af287', studentProfileId: STUDENT_PROFILE_IDS.Ana, institutionId: INSTITUTION_IDS.Insper },
  // CarlosAluno -> Inteli
  { id: 'f20ffb40-1c09-4c58-846a-9c6c25b19da0', studentProfileId: STUDENT_PROFILE_IDS.CarlosAluno, institutionId: INSTITUTION_IDS.Inteli },
  // Beatriz -> FGV, Col. Bandeirantes
  { id: 'a8fcdba3-b694-4705-8b57-0273d116f5ec', studentProfileId: STUDENT_PROFILE_IDS.Beatriz, institutionId: INSTITUTION_IDS.FGV },
  { id: '35bb89ca-e2da-4126-823b-7199ff41d82b', studentProfileId: STUDENT_PROFILE_IDS.Beatriz, institutionId: INSTITUTION_IDS['Col. Bandeirantes'] },
];

// ============================================================================
// SEED EXECUTION — clean + insert for idempotent re-seeding
// FK order: delete children first, then parents; insert parents first, then children
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
  await prisma.institution.deleteMany();
  await prisma.subject.deleteMany();
  console.log('  Cleaned.');

  console.log('Seeding subjects...');
  for (const subject of subjects) {
    await prisma.subject.create({ data: subject });
  }
  console.log(`  ${subjects.length} subjects seeded.`);

  console.log('Seeding institutions...');
  for (const institution of institutions) {
    await prisma.institution.create({ data: institution });
  }
  console.log(`  ${institutions.length} institutions seeded.`);

  console.log('Seeding institution-subject associations...');
  for (const is of institutionSubjects) {
    await prisma.institutionSubject.create({ data: is });
  }
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
  for (const ti of teacherInstitutions) {
    await prisma.teacherInstitution.create({ data: ti });
  }
  console.log(`  ${teacherInstitutions.length} teacher-institution associations seeded.`);

  console.log('Seeding teacher-subject associations...');
  for (const ts of teacherSubjects) {
    await prisma.teacherSubject.create({ data: ts });
  }
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
  for (const si of studentInstitutions) {
    await prisma.studentInstitution.create({ data: si });
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
