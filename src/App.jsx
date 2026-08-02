import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import { useProgress } from './hooks/useProgress'
import { useApiKey } from './hooks/useApiKey'

import TopBar from './components/layout/TopBar'
import Dashboard from './components/layout/Dashboard'
import SettingsModal from './components/settings/SettingsModal'
import ExamPage from './components/exam/ExamPage'

import Week01 from './weeks/week01-intro/Week01'
import Week02 from './weeks/week02-branches/Week02'
import Week03 from './weeks/week03-ml-basics/Week03'
import Week04 from './weeks/week04-nlp/Week04'
import Week05 from './weeks/week05-prompt-intro/Week05'
import Week07 from './weeks/week07-writing-prompts/Week07'
import Week08 from './weeks/week08-bias-ethics/Week08'
import Week09 from './weeks/week09-genai-text-image/Week09'
import Week10 from './weeks/week10-collaborating/Week10'
import Week11 from './weeks/week11-limitations-risks/Week11'
import Week13 from './weeks/week13-ai-philippines/Week13'
import Week14 from './weeks/week14-daily-life-careers/Week14'
import Week15 from './weeks/week15-future-trends/Week15'
import Week16_17 from './weeks/week16_17-group-presentation/Week16_17'

import weekMeta from './data/weekMeta.json'

const metaById = Object.fromEntries(weekMeta.map((w) => [w.id, w]))

export default function App() {
  const progress = useProgress()
  const apiKeyState = useApiKey()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const openSettings = () => setSettingsOpen(true)

  return (
    <div className="page grain-bg">
      <TopBar onOpenSettings={openSettings} />

      <Routes>
        <Route path="/" element={<Dashboard progress={progress} />} />

        <Route path="/week/1" element={<Week01 meta={metaById.week01} progress={progress} />} />
        <Route path="/week/2" element={<Week02 meta={metaById.week02} progress={progress} />} />
        <Route path="/week/3" element={<Week03 meta={metaById.week03} progress={progress} />} />
        <Route path="/week/4" element={<Week04 meta={metaById.week04} progress={progress} apiKeyState={apiKeyState} onOpenSettings={openSettings} />} />
        <Route path="/week/5" element={<Week05 meta={metaById.week05} progress={progress} apiKeyState={apiKeyState} onOpenSettings={openSettings} />} />

        <Route path="/exam/1" element={<ExamPage examId="exam1" progress={progress} />} />

        <Route path="/week/7" element={<Week07 meta={metaById.week07} progress={progress} apiKeyState={apiKeyState} onOpenSettings={openSettings} />} />
        <Route path="/week/8" element={<Week08 meta={metaById.week08} progress={progress} apiKeyState={apiKeyState} onOpenSettings={openSettings} />} />
        <Route path="/week/9" element={<Week09 meta={metaById.week09} progress={progress} apiKeyState={apiKeyState} onOpenSettings={openSettings} />} />
        <Route path="/week/10" element={<Week10 meta={metaById.week10} progress={progress} apiKeyState={apiKeyState} onOpenSettings={openSettings} />} />
        <Route path="/week/11" element={<Week11 meta={metaById.week11} progress={progress} />} />

        <Route path="/exam/2" element={<ExamPage examId="exam2" progress={progress} />} />

        <Route path="/week/13" element={<Week13 meta={metaById.week13} progress={progress} />} />
        <Route path="/week/14" element={<Week14 meta={metaById.week14} progress={progress} />} />
        <Route path="/week/15" element={<Week15 meta={metaById.week15} progress={progress} apiKeyState={apiKeyState} onOpenSettings={openSettings} />} />
        <Route path="/week/16-17" element={<Week16_17 meta={metaById.week16_17} progress={progress} />} />

        <Route path="/exam/3" element={<ExamPage examId="exam3" progress={progress} />} />

        <Route path="*" element={<Dashboard progress={progress} />} />
      </Routes>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKeyState={apiKeyState}
        progress={progress}
      />
    </div>
  )
}
