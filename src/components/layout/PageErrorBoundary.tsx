import { Component, type ReactNode } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface PageErrorFallbackProps {
  onRetry: () => void
}

function PageErrorFallback({ onRetry }: PageErrorFallbackProps) {
  const { t } = useLanguage()

  return (
    <Card className="text-center">
      <p className="font-medium text-text-primary">{t('errors.generic')}</p>
      <Button className="mt-4" variant="secondary" onClick={onRetry}>
        {t('errors.retry', 'Try again')}
      </Button>
    </Card>
  )
}

interface PageErrorBoundaryState {
  hasError: boolean
}

export class PageErrorBoundary extends Component<
  { children: ReactNode },
  PageErrorBoundaryState
> {
  state: PageErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): PageErrorBoundaryState {
    return { hasError: true }
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return <PageErrorFallback onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}
