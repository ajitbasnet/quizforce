import { useParams } from 'react-router-dom'

export default function HistoryDetailPage() {
  const { quizId } = useParams()
  return <div className="min-h-full bg-bg" data-quiz-id={quizId} />
}
