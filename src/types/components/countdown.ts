export interface CountdownProps {
  expiresAt: string;
  className?: string;
  showIcon?: boolean;
}

export interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}
