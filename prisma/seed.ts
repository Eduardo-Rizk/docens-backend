import { PrismaClient, InstitutionType } from '@prisma/client';

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
// SEED EXECUTION — idempotent via upsert
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

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
