import React from "react";
import { Button, Result } from "antd";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Uncaught render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Result
        status="error"
        title="Une erreur est survenue"
        subTitle={error.message}
        extra={[
          <Button key="retry" type="primary" onClick={() => this.setState({ error: null })}>
            Réessayer
          </Button>,
          <Button key="back" onClick={() => window.history.back()}>
            Retour
          </Button>,
        ]}
      />
    );
  }
}
