import { useParams } from 'react-router-dom'

export default function ResultsPage() {
  const { attemptId } = useParams()
  return <div className="min-h-full bg-bg" data-attempt-id={attemptId} />
}
