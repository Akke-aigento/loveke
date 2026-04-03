import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto mb-8">
      {steps.map((step, i) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const canClick = isCompleted && onStepClick;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <button
              type="button"
              disabled={!canClick}
              onClick={() => canClick && onStepClick(step.id)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all
                ${isCompleted ? 'bg-primary text-primary-foreground cursor-pointer hover:scale-110' : ''}
                ${isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110' : ''}
                ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
              `}
            >
              {isCompleted ? <Check size={16} /> : step.id}
            </button>

            {/* Label */}
            <span className={`text-xs ml-1.5 mr-2 hidden sm:block ${isCurrent ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
