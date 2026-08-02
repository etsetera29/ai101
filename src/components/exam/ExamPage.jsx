import weekMeta from '../../data/weekMeta.json'
import ExamLockScreen from './ExamLockScreen'
import ExamEngine from './ExamEngine'
import exam1 from '../../data/examBanks/exam1-questions.json'
import exam2 from '../../data/examBanks/exam2-questions.json'
import exam3 from '../../data/examBanks/exam3-questions.json'

const BANKS = {
  'exam1-questions': exam1,
  'exam2-questions': exam2,
  'exam3-questions': exam3,
}

export default function ExamPage({ examId, progress }) {
  const meta = weekMeta.find((w) => w.id === examId)
  const missing = progress.missingRequirements(meta.requires)

  if (missing.length > 0) {
    return <ExamLockScreen meta={meta} missing={missing} />
  }

  return <ExamEngine meta={meta} bank={BANKS[meta.bank]} progress={progress} />
}
